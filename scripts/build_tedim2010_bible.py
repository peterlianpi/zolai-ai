"""
Build bible_tedim2010.jsonl from Cleaned_Bible/Parallel/*.md files.
Extracts Tedim2010 verses with reference, chapter, verse fields.
Also reports coverage gaps vs TDB77.

Usage: python scripts/build_tedim2010_bible.py
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

PARALLEL_DIR = Path("Cleaned_Bible/Parallel")
OUT          = Path("data/master/sources/bible_tedim2010.jsonl")

# Map full book name to USFM code
BOOK_MAP = {
    "1Chronicles":"1CH","2Chronicles":"2CH","1Corinthians":"1CO","2Corinthians":"2CO",
    "1John":"1JN","2John":"2JN","3John":"3JN","1Kings":"1KI","2Kings":"2KI",
    "1Peter":"1PE","2Peter":"2PE","1Samuel":"1SA","2Samuel":"2SA",
    "1Thessalonians":"1TH","2Thessalonians":"2TH","1Timothy":"1TI","2Timothy":"2TI",
    "Acts":"ACT","Amos":"AMO","Colossians":"COL","Daniel":"DAN","Deuteronomy":"DEU",
    "Ecclesiastes":"ECC","Ephesians":"EPH","Esther":"EST","Exodus":"EXO",
    "Ezekiel":"EZK","Ezra":"EZR","Galatians":"GAL","Genesis":"GEN","Habakkuk":"HAB",
    "Haggai":"HAG","Hebrews":"HEB","Hosea":"HOS","Isaiah":"ISA","James":"JAS",
    "Jeremiah":"JER","Job":"JOB","Joel":"JOL","John":"JHN","Jonah":"JON",
    "Joshua":"JOS","Jude":"JUD","Judges":"JDG","Lamentations":"LAM","Leviticus":"LEV",
    "Luke":"LUK","Malachi":"MAL","Mark":"MRK","Matthew":"MAT","Micah":"MIC",
    "Nahum":"NAH","Nehemiah":"NEH","Numbers":"NUM","Obadiah":"OBA","Philemon":"PHM",
    "Philippians":"PHP","Proverbs":"PRO","Psalms":"PSA","Revelation":"REV",
    "Romans":"ROM","Ruth":"RUT","SongofSolomon":"SNG","SongOfSolomon":"SNG","Titus":"TIT",
    "Zechariah":"ZEC","Zephaniah":"ZEP",
}


def parse_parallel_file(path: Path) -> list[dict]:
    text = path.read_text(encoding="utf-8")
    # Detect book name from filename e.g. Genesis_Parallel.md
    stem = path.stem.replace("_Parallel", "").replace("_", "")
    book = BOOK_MAP.get(stem) or BOOK_MAP.get(path.stem.split("_")[0])
    if not book:
        print(f"  WARN: unknown book for {path.name}", file=sys.stderr)
        return []

    # Detect current chapter
    chapter = 1
    entries = []
    # Split into verse blocks by **ch:v** markers
    blocks = re.split(r'\*\*(\d+:\d+)\*\*', text)
    # blocks = [pre, ref, content, ref, content, ...]
    for i in range(1, len(blocks) - 1, 2):
        ref_str = blocks[i]          # e.g. "2:7"
        content = blocks[i + 1]

        ch_str, v_str = ref_str.split(":")
        ch, v = int(ch_str), int(v_str)

        # Extract Tedim2010 line
        m = re.search(r'Tedim2010:\s*(.+)', content)
        if not m:
            continue
        tedim_text = m.group(1).strip()
        if not tedim_text or tedim_text in ("-", "—"):
            continue

        reference = f"{book}.{ch}:{v}"
        entries.append({
            "text": tedim_text,
            "language": "zolai",
            "dialect": "tedim",
            "source": "Tedim2010",
            "reference": reference,
            "topic": "religion",
            "category": "sentence",
            "book": book,
            "chapter": ch,
            "verse": v,
        })
    return entries


def main() -> int:
    files = sorted(PARALLEL_DIR.glob("*_Parallel.md"))
    print(f"Processing {len(files)} books...")

    total = 0
    gaps = 0
    with open(OUT, "w", encoding="utf-8") as f:
        for path in files:
            entries = parse_parallel_file(path)
            for e in entries:
                f.write(json.dumps(e, ensure_ascii=False) + "\n")
            total += len(entries)
            if len(entries) == 0:
                gaps += 1
                print(f"  EMPTY: {path.name}")
            else:
                print(f"  {path.stem.replace('_Parallel',''):<25} {len(entries):>4} verses")

    print(f"\nTotal: {total} verses written to {OUT}")
    print(f"Empty books: {gaps}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
