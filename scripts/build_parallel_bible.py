#!/usr/bin/env python3
"""Build parallel Bible .md files: TDB77 (1977) + Tedim2010 (ZVS) + KJV (English).

Usage:
    python scripts/build_parallel_bible.py [--books GEN JHN ...] [--out-dir PATH]
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).parent.parent
VERSIONS = {
    "tdb77":     ROOT / "resources/Chin-Bible/TDB77/USX_1",
    "tedim2010": ROOT / "resources/Chin-Bible/Tedim (Chin) Bible/USX_1",
    "kjv":       ROOT / "resources/Chin-Bible/King James Version/USX_1",
}
OUT_DIR = ROOT / "Cleaned_Bible/Parallel"

BOOK_NAMES: dict[str, str] = {
    "GEN": "Genesis", "EXO": "Exodus", "LEV": "Leviticus", "NUM": "Numbers",
    "DEU": "Deuteronomy", "JOS": "Joshua", "JDG": "Judges", "RUT": "Ruth",
    "1SA": "1Samuel", "2SA": "2Samuel", "1KI": "1Kings", "2KI": "2Kings",
    "1CH": "1Chronicles", "2CH": "2Chronicles", "EZR": "Ezra", "NEH": "Nehemiah",
    "EST": "Esther", "JOB": "Job", "PSA": "Psalms", "PRO": "Proverbs",
    "ECC": "Ecclesiastes", "SNG": "SongOfSolomon", "ISA": "Isaiah",
    "JER": "Jeremiah", "LAM": "Lamentations", "EZK": "Ezekiel", "DAN": "Daniel",
    "HOS": "Hosea", "JOL": "Joel", "AMO": "Amos", "OBA": "Obadiah",
    "JON": "Jonah", "MIC": "Micah", "NAM": "Nahum", "HAB": "Habakkuk",
    "ZEP": "Zephaniah", "HAG": "Haggai", "ZEC": "Zechariah", "MAL": "Malachi",
    "MAT": "Matthew", "MRK": "Mark", "LUK": "Luke", "JHN": "John",
    "ACT": "Acts", "ROM": "Romans", "1CO": "1Corinthians", "2CO": "2Corinthians",
    "GAL": "Galatians", "EPH": "Ephesians", "PHP": "Philippians", "COL": "Colossians",
    "1TH": "1Thessalonians", "2TH": "2Thessalonians", "1TI": "1Timothy",
    "2TI": "2Timothy", "TIT": "Titus", "PHM": "Philemon", "HEB": "Hebrews",
    "JAS": "James", "1PE": "1Peter", "2PE": "2Peter", "1JN": "1John",
    "2JN": "2John", "3JN": "3John", "JUD": "Jude", "REV": "Revelation",
}


def parse_usx(path: Path) -> dict[int, dict[int, str]]:
    """Return {chapter: {verse: text}} from a USX file."""
    tree = ET.parse(path)
    root = tree.getroot()
    result: dict[int, dict[int, str]] = {}
    cur_ch = 0
    for elem in root.iter():
        tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag
        if tag == "chapter":
            n = elem.get("number", "0")
            cur_ch = int(n) if n.isdigit() else 0
        elif tag == "verse":
            n = elem.get("number", "0")
            if not n.isdigit():
                continue
            v_num = int(n)
            text = (elem.tail or "").strip()
            if text and cur_ch:
                result.setdefault(cur_ch, {})[v_num] = text
    return result


def build_parallel(book_code: str, out_dir: Path) -> int:
    """Build one parallel .md file. Returns verse count written."""
    usx_files = {
        label: VERSIONS[label] / f"{book_code}.usx"
        for label in VERSIONS
    }
    for label, path in usx_files.items():
        if not path.exists():
            print(f"  SKIP {book_code}: missing {label} ({path.name})", file=sys.stderr)
            return 0

    data = {label: parse_usx(path) for label, path in usx_files.items()}
    book_name = BOOK_NAMES.get(book_code, book_code)
    out_path = out_dir / f"{book_name}_Parallel.md"
    out_dir.mkdir(parents=True, exist_ok=True)

    # Union of all chapters/verses present
    all_chapters = sorted(set().union(*[d.keys() for d in data.values()]))
    count = 0

    with open(out_path, "w", encoding="utf-8") as f:
        f.write(f"# {book_name}\n\n")
        f.write("> Sources: TDB77 (Tedim 1977) | Tedim2010 (ZVS Standard) | KJV (English)\n\n")
        for ch in all_chapters:
            f.write(f"## Chapter {ch}\n\n")
            all_verses = sorted(set().union(*[d.get(ch, {}).keys() for d in data.values()]))
            for v in all_verses:
                tdb77 = data["tdb77"].get(ch, {}).get(v, "[Missing]")
                tedim = data["tedim2010"].get(ch, {}).get(v, "[Missing]")
                kjv   = data["kjv"].get(ch, {}).get(v, "[Missing]")
                f.write(f"**{ch}:{v}**\n")
                f.write(f"TDB77:     {tdb77}\n")
                f.write(f"Tedim2010: {tedim}\n")
                f.write(f"KJV:       {kjv}\n\n")
                count += 1

    return count


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Build 3-version parallel Bible files.")
    parser.add_argument("--books", nargs="+", default=list(BOOK_NAMES.keys()),
                        help="Book codes to process (default: all 66)")
    parser.add_argument("--out-dir", default=str(OUT_DIR),
                        help=f"Output directory (default: {OUT_DIR})")
    args = parser.parse_args(argv)

    out_dir = Path(args.out_dir)
    total_verses = 0
    for code in args.books:
        code = code.upper()
        if code not in BOOK_NAMES:
            print(f"Unknown book code: {code}", file=sys.stderr)
            continue
        n = build_parallel(code, out_dir)
        if n:
            print(f"  ✓ {BOOK_NAMES[code]}: {n} verses → {out_dir.name}/{BOOK_NAMES[code]}_Parallel.md")
            total_verses += n

    print(f"\nDone. {len(args.books)} books, {total_verses:,} total verses → {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
