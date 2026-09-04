"""
Fill Bible vocab gaps using only local dictionary sources (no Gemini).

Sources used (in priority order):
  1. master_dictionary_semantic.jsonl  (richest: synonyms, antonyms, examples)
  2. master_dictionary_enriched.jsonl  (variants, usage_notes)
  3. zomidictionary_export.jsonl       (part_of_speech, dialect)
  4. Parallel Bible corpus             (auto-extract examples from aligned verses)

Output:
  - data/processed/bible_vocab/<book>_ch<N>_vocab.jsonl  (per chapter)
  - data/processed/bible_vocab_gaps.jsonl                (all unresolved gaps)
  - Updates SQLite DB with merged entries

Usage:
  python scripts/fill_bible_vocab_local.py --book GEN
  python scripts/fill_bible_vocab_local.py --book GEN --chapters 1-10
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path

DATA = Path("data/master/sources")
SEMANTIC = Path("data/processed/master_dictionary_semantic.jsonl")
ENRICHED = Path("data/processed/master_dictionary_enriched.jsonl")
ZOMIDICT = Path("data/dictionary/raw/zomidictionary_export.jsonl")
PARALLEL = Path("data/master/sources/bible_parallel_tdb77.jsonl")
DB_PATH = Path("data/master_unified_dictionary.db")
OUT_VOCAB = Path("data/processed/bible_vocab")
GAPS_LOG = Path("data/processed/bible_vocab_gaps.jsonl")

SUFFIXES = [
    "khawmna", "khawm", "sakna", "sak", "khiasak", "khia",
    "pihna", "pih", "kikna", "kik", "lutna", "lut",
    "nate", "na", "te", "ah", "in",
]


# ── Load all local dictionaries ───────────────────────────────────────────────

def load_all_sources() -> dict[str, dict]:
    """Merge all local sources into one dict keyed by lowercase headword."""
    merged: dict[str, dict] = {}

    def _add(hw: str, entry: dict) -> None:
        hw = hw.strip().lower()
        if not hw or len(hw) < 2:
            return
        if hw not in merged:
            merged[hw] = entry
        else:
            # Merge: fill empty fields from new source
            existing = merged[hw]
            for field in ["english", "pos", "variants", "synonyms", "antonyms",
                          "related", "explanation", "usage_notes", "examples"]:
                if not existing.get(field) and entry.get(field):
                    existing[field] = entry[field]

    # 1. Semantic (richest)
    for line in open(SEMANTIC, encoding="utf-8"):
        r = json.loads(line)
        hw = r.get("zolai", "").strip()
        if hw:
            _add(hw, {
                "zolai": hw,
                "english": r.get("english", []),
                "pos": r.get("pos", ""),
                "variants": r.get("variants", []),
                "synonyms": r.get("synonyms", []),
                "antonyms": r.get("antonyms", []),
                "related": r.get("related", []),
                "explanation": r.get("explanation", ""),
                "usage_notes": r.get("usage_notes", ""),
                "examples": r.get("examples", []),
                "dialect": "tedim",
                "source": "semantic",
                "accuracy": r.get("accuracy", 0.9),
            })

    # 2. Enriched
    for line in open(ENRICHED, encoding="utf-8"):
        r = json.loads(line)
        hw = r.get("zolai", "").strip()
        if hw:
            _add(hw, {
                "zolai": hw,
                "english": r.get("english", []),
                "pos": r.get("pos", ""),
                "variants": r.get("variants", []),
                "usage_notes": r.get("usage_notes", ""),
                "examples": r.get("examples", []),
                "dialect": "tedim",
                "source": "enriched",
                "accuracy": r.get("accuracy", 0.85),
            })

    # 3. ZomiDict export
    for line in open(ZOMIDICT, encoding="utf-8"):
        r = json.loads(line)
        hw = r.get("zolai", "").split(",")[0].strip()
        if hw:
            en = r.get("english", "")
            _add(hw, {
                "zolai": hw,
                "english": [en] if isinstance(en, str) else en,
                "pos": r.get("part_of_speech", ""),
                "dialect": "tedim",
                "source": "zomidictionary",
                "accuracy": 0.8,
            })

    return merged


def load_parallel_examples() -> dict[str, list[dict]]:
    """Build word → [example sentences] from parallel corpus."""
    examples: dict[str, list[dict]] = {}
    for line in open(PARALLEL, encoding="utf-8"):
        r = json.loads(line)
        zo = r.get("output", "")
        en = r.get("input", "")
        ref = r.get("metadata", {}).get("reference", "")
        for token in tokenize(zo):
            if token not in examples:
                examples[token] = []
            if len(examples[token]) < 3:
                examples[token].append({"zo": zo, "en": en, "reference": ref})
    return examples


# ── Tokenizer & stemmer ───────────────────────────────────────────────────────

def tokenize(text: str) -> list[str]:
    tokens = re.split(r"[\s\-]+", text)
    result = []
    for t in tokens:
        t = re.sub(r"[^\w']", "", t).strip("'").lower()
        if len(t) >= 2 and re.search(r"[a-z]", t):
            result.append(t)
    return result


def stem(word: str, known: set[str]) -> str | None:
    if word in known:
        return word
    for sfx in SUFFIXES:
        if word.endswith(sfx) and len(word) - len(sfx) >= 2:
            root = word[: -len(sfx)]
            if root in known:
                return root
    return None


# ── DB operations ─────────────────────────────────────────────────────────────

def db_headwords(conn: sqlite3.Connection) -> set[str]:
    cur = conn.cursor()
    cur.execute("SELECT LOWER(TRIM(headword)) FROM entries WHERE headword != ''")
    return {r[0] for r in cur.fetchall()}


def db_insert(entry: dict, conn: sqlite3.Connection) -> bool:
    cur = conn.cursor()
    hw = entry["zolai"].strip()
    cur.execute("SELECT id FROM entries WHERE LOWER(headword)=?", (hw.lower(),))
    existing = cur.fetchone()

    raw = json.dumps(entry, ensure_ascii=False)
    if existing:
        # Update raw_json to fill missing fields
        cur.execute("SELECT raw_json FROM entries WHERE id=?", (existing[0],))
        old_raw = cur.fetchone()[0] or "{}"
        old = json.loads(old_raw)
        updated = False
        for field in ["pos", "variants", "synonyms", "antonyms", "related",
                      "explanation", "usage_notes", "examples"]:
            if not old.get(field) and entry.get(field):
                old[field] = entry[field]
                updated = True
        if updated:
            cur.execute("UPDATE entries SET raw_json=?, pos=? WHERE id=?",
                        (json.dumps(old, ensure_ascii=False), entry.get("pos", old.get("pos", "")), existing[0]))
            conn.commit()
        return False  # not new, just updated
    else:
        cur.execute(
            "INSERT INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)",
            (hw, entry.get("pos", ""), entry.get("source", "local"), raw),
        )
        eid = cur.lastrowid
        for t in (entry.get("english") or []):
            if isinstance(t, str) and t.strip():
                cur.execute("INSERT INTO translations (entry_id, translation) VALUES (?,?)", (eid, t.strip()))
        trans_text = " ".join(t for t in (entry.get("english") or []) if isinstance(t, str))
        cur.execute(
            "INSERT INTO fts_idx (rowid, headword, translations_text, explanations_text) VALUES (?,?,?,?)",
            (eid, hw, trans_text, entry.get("explanation", "")),
        )
        conn.commit()
        return True


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_chapters(s: str) -> list[int]:
    if "-" in s:
        a, b = s.split("-")
        return list(range(int(a), int(b) + 1))
    return [int(s)]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", default="GEN")
    parser.add_argument("--chapters", default="1-50")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args(argv)

    chapters = parse_chapters(args.chapters)

    print("Loading local dictionaries...", end=" ", flush=True)
    dictionary = load_all_sources()
    print(f"{len(dictionary)} entries")

    print("Loading parallel examples...", end=" ", flush=True)
    examples = load_parallel_examples()
    print(f"{len(examples)} words with examples")

    conn = sqlite3.connect(DB_PATH)
    db_words = db_headwords(conn)
    all_known = set(dictionary.keys()) | db_words
    print(f"Total known (dict+DB): {len(all_known)}")

    chapters_set = set(chapters)
    verses: list[dict] = []
    for i, line in enumerate(open(DATA / "bible_tb77_online.jsonl", encoding="utf-8")):
        r = json.loads(line)
        if r["book"] == args.book and r["chapter"] in chapters_set:
            verses.append(r)
        if i % 5000 == 0:
            sys.stdout.write(f"\r  Loading {args.book} verses... {i} lines, {len(verses)} found  ")
            sys.stdout.flush()
    print(f"\r  {args.book}: {len(verses)} verses across {len(chapters)} chapters          ")

    OUT_VOCAB.mkdir(parents=True, exist_ok=True)
    all_gaps: list[dict] = []
    total_inserted = total_updated = 0

    for ch in chapters:
        ch_verses = [v for v in verses if v["chapter"] == ch]
        if not ch_verses:
            continue

        seen: set[str] = set()
        vocab_rows: list[dict] = []
        gaps: list[dict] = []

        for v in ch_verses:
            for token in tokenize(v["text"]):
                if token in seen:
                    continue
                seen.add(token)

                root = stem(token, all_known)
                entry = dictionary.get(root or token, {})
                in_dict = bool(entry) or (root or token) in db_words

                # Attach parallel examples if available
                ex = examples.get(token, examples.get(root or "", []))

                row = {
                    "word": token,
                    "root": root,
                    "english": entry.get("english", []),
                    "pos": entry.get("pos", ""),
                    "variants": entry.get("variants", []),
                    "synonyms": entry.get("synonyms", []),
                    "antonyms": entry.get("antonyms", []),
                    "explanation": entry.get("explanation", ""),
                    "examples": ex[:2] if ex else entry.get("examples", [])[:2],
                    "in_dictionary": in_dict,
                    "first_seen": v["reference"],
                }
                vocab_rows.append(row)

                if not in_dict:
                    gaps.append({"word": token, "first_seen": v["reference"], "book": args.book, "chapter": ch})

                # Insert/update DB for known entries not yet in DB
                if in_dict and entry and not args.dry_run:
                    db_entry = {**entry, "zolai": root or token}
                    if db_insert(db_entry, conn):
                        total_inserted += 1
                        all_known.add((root or token).lower())
                    else:
                        total_updated += 1

        known_count = sum(1 for r in vocab_rows if r["in_dictionary"])
        pct = known_count * 100 // len(vocab_rows) if vocab_rows else 0
        print(f"  Ch.{ch:>2} | {len(vocab_rows):>3} words | coverage={pct}% | gaps={len(gaps)}", flush=True)

        # Save vocab JSONL
        out = OUT_VOCAB / f"{args.book.lower()}_ch{ch:03d}_vocab.jsonl"
        with open(out, "w", encoding="utf-8") as f:
            for row in vocab_rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")

        all_gaps.extend(gaps)

    # Save gaps log
    with open(GAPS_LOG, "w", encoding="utf-8") as f:
        for g in all_gaps:
            f.write(json.dumps(g, ensure_ascii=False) + "\n")

    conn.close()

    print(f"\n{'─'*50}")
    print(f"DB inserted : {total_inserted}")
    print(f"DB updated  : {total_updated}")
    print(f"Total gaps  : {len(all_gaps)} → {GAPS_LOG}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
