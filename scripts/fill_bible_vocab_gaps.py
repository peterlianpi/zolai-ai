"""
Pipeline: Extract Bible vocab → find gaps → fill with Gemini → update DB + JSONL.

Usage:
  python scripts/fill_bible_vocab_gaps.py --book GEN [--chapters 1-50] [--dry-run]
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
import time
import urllib.request
from pathlib import Path

DATA = Path("data/master/sources")
SEMANTIC_DICT = Path("data/processed/master_dictionary_semantic.jsonl")
DB_PATH = Path("data/master_unified_dictionary.db")
OUT_VOCAB = Path("data/processed/bible_vocab")
NEW_ENTRIES_LOG = Path("data/processed/bible_vocab_new_entries.jsonl")

# Zolai morphological suffixes to strip for stem lookup
SUFFIXES = [
    "khawmna", "khawm", "sak", "khia", "pih", "kik", "lut",
    "na", "te", "ah", "in", "a", "un",
]

# ── Dictionary loading ────────────────────────────────────────────────────────

def load_dict_jsonl() -> dict[str, dict]:
    d: dict[str, dict] = {}
    for line in open(SEMANTIC_DICT, encoding="utf-8"):
        r = json.loads(line)
        hw = r.get("zolai", "").strip().lower()
        if hw:
            d[hw] = r
    return d


def load_db_headwords() -> set[str]:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute("SELECT LOWER(headword) FROM entries WHERE headword != ''")
    result = {r[0].strip() for r in cur.fetchall()}
    conn.close()
    return result


# ── Stemmer ───────────────────────────────────────────────────────────────────

def stem(word: str, known: set[str]) -> str | None:
    """Try stripping suffixes to find a known root."""
    if word in known:
        return word
    # Try compound splits (e.g. khuamial → khua + mial)
    for sfx in SUFFIXES:
        if word.endswith(sfx) and len(word) - len(sfx) >= 2:
            root = word[: -len(sfx)]
            if root in known:
                return root
    return None


# ── Verse tokenizer ───────────────────────────────────────────────────────────

def tokenize(text: str) -> list[str]:
    tokens = re.split(r"[\s\-]+", text)
    cleaned = []
    for t in tokens:
        t = t.strip('.,;:\"\u2018\u2019\u201c\u201d()[]!?/\\')
        t = t.lower()
        if len(t) >= 2 and re.search(r"[a-z]", t):
            cleaned.append(t)
    return cleaned


# ── Gemini lookup ─────────────────────────────────────────────────────────────

def _load_api_key() -> str:
    config = Path("scripts/ui/config.js")
    for line in config.read_text().splitlines():
        if "GEMINI_API_KEY" in line and "'" in line:
            return line.split("'")[1]
    raise SystemExit("GEMINI_API_KEY not found")


GEMINI_PROMPT = """You are a Zolai (Tedim Chin) linguistic expert.
For each word in the list, provide a dictionary entry in this exact JSON format:
{
  "word": "...",
  "zolai": "...",
  "english": ["translation1", "translation2"],
  "pos": "noun|verb|adj|adv|particle|pronoun|conjunction|interjection",
  "variants": [],
  "synonyms": [],
  "antonyms": [],
  "related": [],
  "dialect": "tedim",
  "explanation": "brief explanation in English",
  "usage_notes": "",
  "accuracy": 0.7
}

Rules:
- Use Tedim ZVS dialect only (pasian not pathian, gam not ram, tua not cu)
- If a word is a suffix/particle (e.g. -na, -te, -ah), note it as such in pos and explanation
- If unsure, set accuracy to 0.5 or lower
- Return a JSON array of entries, one per word

Words to define: """


def gemini_lookup(words: list[str], api_key: str) -> list[dict]:
    if not words:
        return []
    payload = json.dumps({
        "contents": [{"parts": [{"text": GEMINI_PROMPT + ", ".join(words)}]}],
        "generationConfig": {"temperature": 0.1, "responseMimeType": "application/json"},
    }).encode()
    req = urllib.request.Request(
        f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key={api_key}",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = json.loads(r.read())
        raw = data["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(raw)
    except Exception as e:
        print(f"  Gemini error: {e}", file=sys.stderr)
        return []


# ── DB insert ─────────────────────────────────────────────────────────────────

def insert_to_db(entries: list[dict], conn: sqlite3.Connection) -> int:
    cur = conn.cursor()
    inserted = 0
    for e in entries:
        hw = e.get("zolai", e.get("word", "")).strip()
        if not hw:
            continue
        cur.execute("SELECT id FROM entries WHERE LOWER(headword)=?", (hw.lower(),))
        if cur.fetchone():
            continue  # already exists
        raw = json.dumps(e, ensure_ascii=False)
        pos = e.get("pos", "")
        cur.execute(
            "INSERT INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)",
            (hw, pos, "gemini_bible_vocab", raw),
        )
        entry_id = cur.lastrowid
        for trans in e.get("english", []):
            cur.execute("INSERT INTO translations (entry_id, translation) VALUES (?,?)", (entry_id, trans))
        # FTS
        trans_text = " ".join(e.get("english", []))
        cur.execute(
            "INSERT INTO fts_idx (rowid, headword, translations_text, explanations_text) VALUES (?,?,?,?)",
            (entry_id, hw, trans_text, e.get("explanation", "")),
        )
        inserted += 1
    conn.commit()
    return inserted


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_chapter_range(s: str) -> list[int]:
    if "-" in s:
        a, b = s.split("-")
        return list(range(int(a), int(b) + 1))
    return [int(s)]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--book", default="GEN")
    parser.add_argument("--chapters", default="1-50", help="e.g. 1 or 1-10")
    parser.add_argument("--dry-run", action="store_true", help="Don't write to DB")
    parser.add_argument("--batch", type=int, default=20, help="Words per Gemini call")
    args = parser.parse_args(argv)

    chapters = parse_chapter_range(args.chapters)

    print("Loading dictionary...", end=" ", flush=True)
    dict_jsonl = load_dict_jsonl()
    db_words = load_db_headwords()
    all_known = set(dict_jsonl.keys()) | db_words
    print(f"{len(all_known)} known words")

    print(f"Loading {args.book} verses...", end=" ", flush=True)
    verses: list[dict] = []
    for line in open(DATA / "bible_tb77_online.jsonl", encoding="utf-8"):
        r = json.loads(line)
        if r["book"] == args.book and r["chapter"] in chapters:
            verses.append(r)
    print(f"{len(verses)} verses")

    api_key = _load_api_key()
    conn = sqlite3.connect(DB_PATH) if not args.dry_run else None
    OUT_VOCAB.mkdir(parents=True, exist_ok=True)

    total_new = 0
    all_new_entries: list[dict] = []

    for ch in chapters:
        ch_verses = [v for v in verses if v["chapter"] == ch]
        if not ch_verses:
            continue

        # Collect unique tokens
        seen: set[str] = set()
        unknown: list[str] = []
        vocab_rows: list[dict] = []

        for v in ch_verses:
            for token in tokenize(v["text"]):
                if token in seen:
                    continue
                seen.add(token)
                root = stem(token, all_known)
                entry = dict_jsonl.get(root or token, {})
                in_dict = bool(entry) or root in db_words
                vocab_rows.append({
                    "word": token,
                    "root": root,
                    "translations": entry.get("english", []),
                    "pos": entry.get("pos", ""),
                    "in_dictionary": in_dict,
                    "first_seen": v["reference"],
                })
                if not in_dict and token not in unknown:
                    unknown.append(token)

        known_count = sum(1 for r in vocab_rows if r["in_dictionary"])
        print(f"\n{'─'*60}")
        print(f"  {args.book} Ch.{ch} | {len(vocab_rows)} words | known={known_count} | gaps={len(unknown)}")

        # Save vocab JSONL
        out_path = OUT_VOCAB / f"{args.book.lower()}_ch{ch:03d}_vocab.jsonl"
        with open(out_path, "w", encoding="utf-8") as f:
            for row in vocab_rows:
                f.write(json.dumps(row, ensure_ascii=False) + "\n")

        if not unknown:
            print("  ✅ No gaps!")
            continue

        # Filter out obvious punctuation artifacts
        unknown = [w for w in unknown if re.match(r"^[a-z][a-z'\-]+$", w)]
        print(f"  Sending {len(unknown)} words to Gemini...")

        # Batch Gemini calls
        new_entries: list[dict] = []
        for i in range(0, len(unknown), args.batch):
            batch = unknown[i: i + args.batch]
            results = gemini_lookup(batch, api_key)
            new_entries.extend(results)
            sys.stdout.write(f"  [{i+len(batch)}/{len(unknown)}] ")
            sys.stdout.flush()
            time.sleep(1.5)  # rate limit

        print()

        if not args.dry_run and conn and new_entries:
            inserted = insert_to_db(new_entries, conn)
            total_new += inserted
            print(f"  ✅ Inserted {inserted} new entries into DB")
            # Update known set
            for e in new_entries:
                hw = e.get("zolai", e.get("word", "")).strip().lower()
                if hw:
                    all_known.add(hw)

        all_new_entries.extend(new_entries)

    # Save all new entries log
    if all_new_entries:
        with open(NEW_ENTRIES_LOG, "a", encoding="utf-8") as f:
            for e in all_new_entries:
                f.write(json.dumps(e, ensure_ascii=False) + "\n")
        print(f"\n📝 Logged {len(all_new_entries)} new entries → {NEW_ENTRIES_LOG}")

    if conn:
        conn.close()

    print(f"\n✅ Done. Total new DB entries: {total_new}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
