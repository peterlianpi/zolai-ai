#!/usr/bin/env python3
import os
"""
Seed bible_verse and vocab_word tables from local JSONL files.
Usage: python scripts/seed-db.py [--bible] [--vocab] [--dry-run]
"""
from __future__ import annotations
import argparse, json, os, sys
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent.parent  # zolai project root

DB_URL = os.environ.get(
    "DATABASE_URL",
    os.environ.get("DATABASE_URL", ""),
)

OT = {"GEN","EXO","LEV","NUM","DEU","JOS","JDG","RUT","1SA","2SA","1KI","2KI",
      "1CH","2CH","EZR","NEH","EST","JOB","PSA","PRO","ECC","SNG","ISA","JER",
      "LAM","EZK","DAN","HOS","JOL","AMO","OBA","JON","MIC","NAH","HAB","ZEP",
      "HAG","ZEC","MAL"}


def seed_bible(conn, dry_run: bool) -> None:
    """Build bible_verse rows from 4 JSONL sources + KJV."""
    sources = {
        "tdb77":    ROOT / "data/master/sources/bible_tb77_online.jsonl",
        "tbr17":    ROOT / "data/master/sources/bible_tbr17.jsonl",
        "tedim2010":ROOT / "data/master/sources/bible_tedim2010.jsonl",
    }
    # Load KJV from parallel.jsonl (english field)
    kjv: dict[str, str] = {}
    par = ROOT / "data/master/combined/parallel.jsonl"
    with par.open(encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            ref = obj.get("reference", "")
            en  = obj.get("english", "")
            if ref and en and ref not in kjv:
                kjv[ref] = en

    # Aggregate all refs
    verses: dict[str, dict] = {}
    for col, path in sources.items():
        if not path.exists():
            print(f"  WARN: {path} not found", file=sys.stderr)
            continue
        with path.open(encoding="utf-8") as f:
            for line in f:
                obj = json.loads(line)
                ref = obj.get("reference", "")
                text = obj.get("text", "").strip()
                if not ref or not text:
                    continue
                if ref not in verses:
                    # Parse ref: BOOK.CH:V
                    try:
                        book, cv = ref.split(".", 1)
                        ch, v = cv.split(":")
                        verses[ref] = {
                            "id": ref.replace(".", "_").replace(":", "_"),
                            "book": book,
                            "chapter": int(ch),
                            "verse": int(v),
                            "testament": "OT" if book in OT else "NT",
                            "tdb77": None, "tbr17": None,
                            "tedim2010": None, "kjv": None,
                        }
                    except Exception:
                        continue
                verses[ref][col] = text

    # Add KJV
    for ref, en in kjv.items():
        if ref in verses:
            verses[ref]["kjv"] = en

    rows = list(verses.values())
    print(f"  Bible: {len(rows):,} unique verse refs")
    if dry_run:
        print("  [DRY RUN] sample:", rows[:2])
        return

    cur = conn.cursor()
    cur.execute("DELETE FROM bible_verse")
    batch = 500
    for i in range(0, len(rows), batch):
        chunk = rows[i:i+batch]
        args = []
        vals = []
        for r in chunk:
            args.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s)")
            vals += [r["id"], r["book"], r["chapter"], r["verse"],
                     r["testament"], r["tdb77"], r["tbr17"], r["tedim2010"], r["kjv"]]
        cur.execute(
            f'INSERT INTO bible_verse (id,book,chapter,verse,testament,tdb77,tbr17,tedim2010,kjv) VALUES {",".join(args)} ON CONFLICT (id) DO NOTHING',
            vals,
        )
        sys.stdout.write(f"\r  Inserted {min(i+batch, len(rows)):,}/{len(rows):,}"); sys.stdout.flush()
    conn.commit()
    print(f"\n  ✓ bible_verse seeded: {len(rows):,} rows")


def seed_vocab(conn, dry_run: bool) -> None:
    """Load vocab from master_dictionary_semantic.jsonl."""
    path = ROOT / "data/processed/master_dictionary_semantic.jsonl"
    if not path.exists():
        print(f"  WARN: {path} not found", file=sys.stderr)
        return

    rows = []
    with path.open(encoding="utf-8") as f:
        for line in f:
            obj = json.loads(line)
            zo = (obj.get("zolai") or "").strip()
            en = (obj.get("english") or "").strip()
            if not zo or not en:
                continue
            rows.append({
                "id": f"v_{len(rows)}",
                "zolai": zo,
                "english": en,
                "pos": obj.get("pos", ""),
                "category": obj.get("category", ""),
                "definition": obj.get("explanation", ""),
                "example": "",
                "explanation": obj.get("usage_notes", ""),
                "synonyms": obj.get("synonyms", []),
                "antonyms": obj.get("antonyms", []),
                "related":  obj.get("related", []),
                "variants": obj.get("variants", []),
                "examples": json.dumps(obj.get("examples", [])),
                "accuracy": obj.get("accuracy", "unverified"),
                "tags": [],
            })

    print(f"  Vocab: {len(rows):,} entries")
    if dry_run:
        print("  [DRY RUN] sample:", rows[:2])
        return

    cur = conn.cursor()
    cur.execute("DELETE FROM vocab_word")
    batch = 500
    for i in range(0, len(rows), batch):
        chunk = rows[i:i+batch]
        args, vals = [], []
        for r in chunk:
            args.append("(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s::jsonb,%s,%s)")
            vals += [r["id"], r["zolai"], r["english"], r["pos"], r["category"],
                     r["definition"], r["example"], r["explanation"],
                     r["synonyms"], r["antonyms"], r["related"], r["variants"],
                     r["examples"], r["accuracy"], r["tags"]]
        cur.execute(
            f'INSERT INTO vocab_word (id,zolai,english,pos,category,definition,example,explanation,synonyms,antonyms,related,variants,examples,accuracy,tags) VALUES {",".join(args)} ON CONFLICT (id) DO NOTHING',
            vals,
        )
        sys.stdout.write(f"\r  Inserted {min(i+batch, len(rows)):,}/{len(rows):,}"); sys.stdout.flush()
    conn.commit()
    print(f"\n  ✓ vocab_word seeded: {len(rows):,} rows")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--bible", action="store_true")
    ap.add_argument("--vocab", action="store_true")
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()
    if not args.bible and not args.vocab:
        args.bible = args.vocab = True  # default: seed both

    try:
        import psycopg2
    except ImportError:
        print("pip install psycopg2-binary")
        return 1

    conn = psycopg2.connect(DB_URL)
    print(f"Connected to DB")

    if args.bible:
        print("\n=== Seeding bible_verse ===")
        seed_bible(conn, args.dry_run)
    if args.vocab:
        print("\n=== Seeding vocab_word ===")
        seed_vocab(conn, args.dry_run)

    conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
