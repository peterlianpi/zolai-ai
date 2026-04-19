"""
Bible Vocab Pipeline — processes all 66 books end-to-end:
  1. Extract vocab per chapter (with stemming)
  2. Cross-reference gaps against all 3 versions + KJV
  3. Audit sentences for quality issues
  4. Insert resolved entries into DB
  5. Write recommendations to wiki/vocab_recommendations.md

Usage:
  python scripts/bible_vocab_pipeline.py --all-books
  python scripts/bible_vocab_pipeline.py --book GEN
  python scripts/bible_vocab_pipeline.py --resume
  python scripts/bible_vocab_pipeline.py --audit-only --book GEN
"""
from __future__ import annotations

import argparse
import json
import re
import sqlite3
import sys
from pathlib import Path

DATA     = Path("data/master/sources")
COMBINED = Path("data/master/combined")
DB_PATH  = Path("data/master_unified_dictionary.db")
OUT_VOCAB   = Path("data/processed/bible_vocab")
PROGRESS    = Path("data/processed/bible_vocab_pipeline_progress.json")
GAPS_OUT    = Path("data/processed/bible_vocab_still_missing.jsonl")
RESOLVED_OUT = Path("data/processed/bible_vocab_resolved.jsonl")
FLAGS_OUT   = Path("data/processed/bible_quality_flags.jsonl")
WIKI_REC    = Path("wiki/vocab_recommendations.md")

# Canonical 66-book order
BOOKS = [
    "GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA",
    "1KI","2KI","1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO",
    "ECC","SNG","ISA","JER","LAM","EZK","DAN","HOS","JOL","AMO",
    "OBA","JON","MIC","NAH","HAB","ZEP","HAG","ZEC","MAL",
    "MAT","MRK","LUK","JHN","ACT","ROM","1CO","2CO","GAL","EPH",
    "PHP","COL","1TH","2TH","1TI","2TI","TIT","PHM","HEB","JAS",
    "1PE","2PE","1JN","2JN","3JN","JUD","REV",
]

SUFFIXES = [
    "khawmna","khawm","sakna","sak","khiasak","khia",
    "pihna","pih","na","te","ah","in","un","a",
]

FORBIDDEN = re.compile(r"\b(pathian|bawipa|siangpahrang|fapa)\b|(?<!\w)(cu|cun)(?!\w)", re.I)
COND_NEG  = re.compile(r"\blo\s+leh\b", re.I)
PLURAL_VIO = re.compile(r"\bi\b.{0,30}\buh\b", re.I)
HTML_ENT  = re.compile(r"&#\d+;|&amp;|&quot;|&lt;|&gt;")


# ── Loaders ───────────────────────────────────────────────────────────────────

def load_dictionary() -> dict[str, dict]:
    d: dict[str, dict] = {}
    for path in [
        Path("data/processed/master_dictionary_semantic.jsonl"),
        Path("data/processed/master_dictionary_enriched.jsonl"),
        Path("data/dictionary/raw/zomidictionary_export.jsonl"),
    ]:
        if not path.exists():
            continue
        for line in open(path, encoding="utf-8"):
            r = json.loads(line)
            hw = r.get("zolai", r.get("headword", "")).split(",")[0].strip().lower()
            if hw and hw not in d:
                en = r.get("english", r.get("translations", []))
                d[hw] = {
                    "zolai": hw,
                    "english": [en] if isinstance(en, str) else en,
                    "pos": r.get("pos", r.get("part_of_speech", "")),
                    "variants": r.get("variants", []),
                    "synonyms": r.get("synonyms", []),
                    "antonyms": r.get("antonyms", []),
                    "explanation": r.get("explanation", ""),
                    "examples": r.get("examples", [])[:2],
                    "source": "local",
                    "accuracy": r.get("accuracy", 0.85),
                }
    return d


def load_bible(fname: str) -> dict[str, str]:
    path = DATA / fname
    if not path.exists():
        return {}
    return {json.loads(l)["reference"]: json.loads(l)["text"]
            for l in open(path, encoding="utf-8")}


def load_parallel_en() -> dict[str, str]:
    en: dict[str, str] = {}
    for fname in ["bible_parallel_tdb77.jsonl", "bible_parallel_tbr17.jsonl"]:
        p = DATA / fname
        if not p.exists():
            continue
        for line in open(p, encoding="utf-8"):
            r = json.loads(line)
            ref = r["metadata"]["reference"]
            if ref not in en:
                en[ref] = r["input"]
    return en


def load_progress() -> dict:
    if PROGRESS.exists():
        return json.loads(PROGRESS.read_text())
    return {"completed": [], "stats": {}}


def save_progress(prog: dict) -> None:
    PROGRESS.write_text(json.dumps(prog, indent=2, ensure_ascii=False))


# ── Tokenizer / stemmer ───────────────────────────────────────────────────────

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


# ── DB helpers ────────────────────────────────────────────────────────────────

def db_headwords(conn: sqlite3.Connection) -> set[str]:
    cur = conn.cursor()
    cur.execute("SELECT LOWER(TRIM(headword)) FROM entries WHERE headword != ''")
    return {r[0] for r in cur.fetchall()}


def db_insert(entry: dict, conn: sqlite3.Connection) -> bool:
    cur = conn.cursor()
    hw = entry["zolai"].strip()
    cur.execute("SELECT id FROM entries WHERE LOWER(headword)=?", (hw.lower(),))
    if cur.fetchone():
        return False
    raw = json.dumps(entry, ensure_ascii=False)
    cur.execute("INSERT INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)",
                (hw, entry.get("pos", ""), entry.get("source", "crossref"), raw))
    eid = cur.lastrowid
    for t in (entry.get("english") or []):
        if isinstance(t, str) and t.strip():
            cur.execute("INSERT INTO translations (entry_id, translation) VALUES (?,?)", (eid, t))
    trans = " ".join(t for t in (entry.get("english") or []) if isinstance(t, str))
    cur.execute("INSERT INTO fts_idx (rowid, headword, translations_text, explanations_text) VALUES (?,?,?,?)",
                (eid, hw, trans, entry.get("explanation", "")))
    conn.commit()
    return True


# ── Quality auditor ───────────────────────────────────────────────────────────

def audit_verse(ref: str, text: str, source: str, en_text: str = "") -> list[dict]:
    flags = []

    def flag(issues: list[str], severity: str, rec: str) -> None:
        flags.append({"reference": ref, "source": source, "text": text[:120],
                      "issues": issues, "severity": severity, "recommendation": rec})

    if HTML_ENT.search(text):
        flag(["html_entity"], "critical", "Run fix_bible_data.py to decode HTML entities")
    if FORBIDDEN.search(text):
        words = FORBIDDEN.findall(text)
        flag(["dialect_violation"], "critical",
             f"Replace forbidden words {words} with ZVS equivalents (pasian, gam, tapa, tua)")
    if COND_NEG.search(text):
        flag(["conditional_negation"], "warning",
             "Replace 'lo leh' with 'kei leh' or 'nong pai kei a leh'")
    if PLURAL_VIO.search(text):
        flag(["plural_violation"], "warning",
             "Remove 'uh' when subject is 'i' (inclusive we)")
    tokens = tokenize(text)
    if len(tokens) < 4:
        flag(["short_verse"], "info", "Verify this is a full verse, not a header/label")
    if en_text:
        en_tokens = tokenize(en_text)
        if en_tokens and len(tokens) > 0:
            ratio = max(len(tokens), len(en_tokens)) / max(min(len(tokens), len(en_tokens)), 1)
            if ratio > 4:
                flag(["alignment_mismatch"], "warning",
                     f"ZO/EN length ratio={ratio:.1f}x — check verse alignment")

    return flags


# ── Cross-reference resolver ──────────────────────────────────────────────────

def simple_align(word: str, zo_text: str, en_text: str) -> list[str]:
    zo_tokens = re.split(r"[\s,;.]+", zo_text.lower())
    en_tokens = re.split(r"[\s,;.]+", en_text.lower())
    if not zo_tokens or not en_tokens:
        return []
    try:
        idx = zo_tokens.index(word)
    except ValueError:
        return []
    ratio = idx / len(zo_tokens)
    en_idx = int(ratio * len(en_tokens))
    candidates = []
    for offset in range(-1, 2):
        i = en_idx + offset
        if 0 <= i < len(en_tokens):
            t = en_tokens[i].strip("'s,.")
            if len(t) > 2:
                candidates.append(t)
    return list(dict.fromkeys(candidates))


# ── Process one book ──────────────────────────────────────────────────────────

def process_book(
    book: str,
    dictionary: dict[str, dict],
    all_known: set[str],
    versions: dict[str, dict[str, str]],
    parallel_en: dict[str, str],
    conn: sqlite3.Connection,
    audit_only: bool = False,
) -> dict:
    tb77 = versions["tb77"]
    refs = sorted(
        {ref for ref, _ in tb77.items() if ref.startswith(f"{book}.")},
        key=lambda r: (int(r.split(".")[1].split(":")[0]), int(r.split(":")[1]))
    )
    if not refs:
        return {"book": book, "verses": 0, "gaps": 0, "resolved": 0, "flags": 0}

    chapters = sorted(set(int(r.split(".")[1].split(":")[0]) for r in refs))
    OUT_VOCAB.mkdir(parents=True, exist_ok=True)

    all_gaps: list[dict] = []
    all_resolved: list[dict] = []
    all_flags: list[dict] = []
    total_inserted = 0

    for ch in chapters:
        ch_refs = [r for r in refs if int(r.split(".")[1].split(":")[0]) == ch]
        seen: set[str] = set()
        vocab_rows: list[dict] = []
        gaps: list[dict] = []

        for ref in ch_refs:
            zo_text = tb77.get(ref, "")
            en_text = parallel_en.get(ref, "")

            # Audit
            all_flags.extend(audit_verse(ref, zo_text, "TB77_online", en_text))

            if audit_only:
                continue

            for token in tokenize(zo_text):
                if token in seen:
                    continue
                seen.add(token)
                root = stem(token, all_known)
                entry = dictionary.get(root or token, {})
                in_dict = bool(entry) or (root or token) in all_known

                vocab_rows.append({
                    "word": token, "root": root,
                    "english": entry.get("english", []),
                    "pos": entry.get("pos", ""),
                    "variants": entry.get("variants", []),
                    "synonyms": entry.get("synonyms", []),
                    "antonyms": entry.get("antonyms", []),
                    "explanation": entry.get("explanation", ""),
                    "examples": entry.get("examples", [])[:2],
                    "in_dictionary": in_dict,
                    "first_seen": ref,
                })

                if not in_dict and re.match(r"^[a-z][a-z'\-]+$", token):
                    gaps.append({"word": token, "first_seen": ref,
                                 "book": book, "chapter": ch})

                if in_dict and entry and not audit_only:
                    db_entry = {**entry, "zolai": root or token}
                    if db_insert(db_entry, conn):
                        total_inserted += 1
                        all_known.add((root or token).lower())

        # Cross-reference gaps
        for g in gaps:
            word, ref = g["word"], g["first_seen"]
            en_verse = parallel_en.get(ref, "")
            zo_verses = {v: vdata.get(ref, "") for v, vdata in versions.items() if vdata.get(ref)}
            candidates: list[str] = []
            for zo_text in zo_verses.values():
                if word in zo_text.lower():
                    candidates.extend(simple_align(word, zo_text, en_verse))
            candidates = list(dict.fromkeys(candidates))

            if candidates:
                entry = {"zolai": word, "english": candidates[:3], "pos": "",
                         "dialect": "tedim", "source": "crossref_bible",
                         "reference": ref, "accuracy": 0.55}
                all_resolved.append(entry)
                if db_insert(entry, conn):
                    total_inserted += 1
                    all_known.add(word)
            else:
                all_gaps.append(g)

        # Save chapter vocab
        if vocab_rows:
            out = OUT_VOCAB / f"{book.lower()}_ch{ch:03d}_vocab.jsonl"
            with open(out, "w", encoding="utf-8") as f:
                for row in vocab_rows:
                    f.write(json.dumps(row, ensure_ascii=False) + "\n")

        known_count = sum(1 for r in vocab_rows if r["in_dictionary"])
        pct = known_count * 100 // len(vocab_rows) if vocab_rows else 0
        sys.stdout.write(f"\r  {book} Ch.{ch:>3} | {len(vocab_rows):>3} words | {pct}% | gaps={len(gaps)} flags={len(all_flags)}  ")
        sys.stdout.flush()

    print()

    # Append to global outputs
    with open(RESOLVED_OUT, "a", encoding="utf-8") as f:
        for e in all_resolved:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    with open(GAPS_OUT, "a", encoding="utf-8") as f:
        for g in all_gaps:
            f.write(json.dumps(g, ensure_ascii=False) + "\n")
    with open(FLAGS_OUT, "a", encoding="utf-8") as f:
        for fl in all_flags:
            f.write(json.dumps(fl, ensure_ascii=False) + "\n")

    return {
        "book": book, "verses": len(refs),
        "chapters": len(chapters),
        "resolved": len(all_resolved),
        "gaps": len(all_gaps),
        "flags": len(all_flags),
        "db_inserted": total_inserted,
    }


# ── Recommendations writer ────────────────────────────────────────────────────

def write_recommendations(stats: dict) -> None:
    WIKI_REC.parent.mkdir(parents=True, exist_ok=True)
    lines = ["# Bible Vocab Pipeline — Recommendations\n",
             f"_Auto-generated. Last run covered {len(stats)} books._\n\n",
             "## Summary\n",
             "| Book | Verses | Resolved | Gaps | Flags |\n",
             "|------|--------|----------|------|-------|\n"]
    for book, s in stats.items():
        lines.append(f"| {book} | {s['verses']} | {s['resolved']} | {s['gaps']} | {s['flags']} |\n")

    lines += [
        "\n## Action Items\n",
        "- [ ] Review `data/processed/bible_vocab_still_missing.jsonl` — send to Gemini when quota available\n",
        "- [ ] Review `data/processed/bible_quality_flags.jsonl` — fix critical severity first\n",
        "- [ ] Verify crossref entries with `accuracy=0.55` in DB (auto-resolved, needs human check)\n",
        "- [ ] Run `scripts/fix_bible_data.py` if any HTML entities remain\n",
        "- [ ] Update `data/master/combined/parallel.jsonl` after adding TBR17 parallel\n",
    ]
    WIKI_REC.write_text("".join(lines), encoding="utf-8")
    print(f"  📝 Recommendations → {WIKI_REC}")


# ── Main ──────────────────────────────────────────────────────────────────────

def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser()
    group = parser.add_mutually_exclusive_group()
    group.add_argument("--all-books", action="store_true")
    group.add_argument("--book", help="Single book code e.g. GEN")
    group.add_argument("--resume", action="store_true")
    parser.add_argument("--audit-only", action="store_true")
    args = parser.parse_args(argv)

    prog = load_progress()
    completed: list[str] = prog.get("completed", [])

    if args.book:
        books_to_run = [args.book.upper()]
    elif args.resume:
        books_to_run = [b for b in BOOKS if b not in completed]
        print(f"Resuming: {len(completed)} done, {len(books_to_run)} remaining")
    else:
        books_to_run = BOOKS
        # Clear output files for fresh run
        for p in [RESOLVED_OUT, GAPS_OUT, FLAGS_OUT]:
            p.write_text("")

    print("Loading dictionaries...", end=" ", flush=True)
    dictionary = load_dictionary()
    print(f"{len(dictionary)} entries")

    print("Loading Bible versions...", end=" ", flush=True)
    versions = {
        "tb77":  load_bible("bible_tb77_online.jsonl"),
        "tbr17": load_bible("bible_tbr17.jsonl"),
        "tdb":   load_bible("bible_tdb_online.jsonl"),
    }
    print(f"tb77={len(versions['tb77']):,} tbr17={len(versions['tbr17']):,} tdb={len(versions['tdb']):,}")

    print("Loading parallel EN...", end=" ", flush=True)
    parallel_en = load_parallel_en()
    print(f"{len(parallel_en):,} verses")

    conn = sqlite3.connect(DB_PATH)
    all_known = set(dictionary.keys()) | db_headwords(conn)
    print(f"Total known: {len(all_known):,}")

    run_stats: dict[str, dict] = dict(prog.get("stats", {}))

    for book in books_to_run:
        if book in completed and not args.audit_only:
            print(f"  ⏭  {book} already done, skipping")
            continue
        print(f"\n{'═'*60}")
        print(f"  Processing {book}...")
        stats = process_book(book, dictionary, all_known, versions, parallel_en, conn, args.audit_only)
        run_stats[book] = stats
        print(f"  ✅ {book}: {stats.get('verses',0)} verses | resolved={stats.get('resolved',0)} gaps={stats.get('gaps',0)} flags={stats.get('flags',0)} db+={stats.get('db_inserted',0)}")

        if not args.audit_only:
            completed.append(book)
            prog["completed"] = completed
            prog["stats"] = run_stats
            save_progress(prog)

    conn.close()
    write_recommendations(run_stats)

    # Final summary
    total_verses   = sum(s.get("verses", 0) for s in run_stats.values())
    total_resolved = sum(s.get("resolved", 0) for s in run_stats.values())
    total_gaps     = sum(s.get("gaps", 0) for s in run_stats.values())
    total_flags    = sum(s.get("flags", 0) for s in run_stats.values())
    total_inserted = sum(s.get("db_inserted", 0) for s in run_stats.values())

    print(f"\n{'═'*60}")
    print(f"  Books processed : {len(run_stats)}")
    print(f"  Total verses    : {total_verses:,}")
    print(f"  Gaps resolved   : {total_resolved:,}")
    print(f"  Still missing   : {total_gaps:,} → {GAPS_OUT}")
    print(f"  Quality flags   : {total_flags:,} → {FLAGS_OUT}")
    print(f"  DB inserted     : {total_inserted:,}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
