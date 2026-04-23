"""Fix Bible JSONL files: decode HTML entities, add book/chapter/verse fields, normalize references."""
from __future__ import annotations

import json
import re
from html import unescape
from pathlib import Path

DATA = Path("data/master/sources")

# Map full book names (used in parallel files) → 3-letter abbrev
BOOK_NAME_TO_ABBREV: dict[str, str] = {
    "Genesis": "GEN", "Exodus": "EXO", "Leviticus": "LEV", "Numbers": "NUM",
    "Deuteronomy": "DEU", "Joshua": "JOS", "Judges": "JDG", "Ruth": "RUT",
    "1Samuel": "1SA", "2Samuel": "2SA", "1Kings": "1KI", "2Kings": "2KI",
    "1Chronicles": "1CH", "2Chronicles": "2CH", "Ezra": "EZR", "Nehemiah": "NEH",
    "Esther": "EST", "Job": "JOB", "Psalms": "PSA", "Proverbs": "PRO",
    "Ecclesiastes": "ECC", "SongofSolomon": "SNG", "Isaiah": "ISA",
    "Jeremiah": "JER", "Lamentations": "LAM", "Ezekiel": "EZK", "Daniel": "DAN",
    "Hosea": "HOS", "Joel": "JOL", "Amos": "AMO", "Obadiah": "OBA",
    "Jonah": "JON", "Micah": "MIC", "Nahum": "NAH", "Habakkuk": "HAB",
    "Zephaniah": "ZEP", "Haggai": "HAG", "Zechariah": "ZEC", "Malachi": "MAL",
    "Matthew": "MAT", "Mark": "MRK", "Luke": "LUK", "John": "JHN",
    "Acts": "ACT", "Romans": "ROM", "1Corinthians": "1CO", "2Corinthians": "2CO",
    "Galatians": "GAL", "Ephesians": "EPH", "Philippians": "PHP",
    "Colossians": "COL", "1Thessalonians": "1TH", "2Thessalonians": "2TH",
    "1Timothy": "1TI", "2Timothy": "2TI", "Titus": "TIT", "Philemon": "PHM",
    "Hebrews": "HEB", "James": "JAS", "1Peter": "1PE", "2Peter": "2PE",
    "1John": "1JN", "2John": "2JN", "3John": "3JN", "Jude": "JUD",
    "Revelation": "REV",
}


def parse_abbrev_ref(ref: str) -> tuple[str, str, str]:
    """Parse 'GEN.1:1' → (book, chapter, verse)."""
    book, rest = ref.split(".", 1)
    chapter, verse = rest.split(":", 1)
    return book, chapter, verse


def normalize_parallel_ref(ref: str) -> str:
    """Convert '1Chronicles 1:1' → 'GEN.1:1' style abbrev."""
    # ref format: "BookName chapter:verse"
    m = re.match(r"^(.+?)\s+(\d+):(\d+)$", ref.strip())
    if not m:
        return ref
    book_name, chapter, verse = m.group(1), m.group(2), m.group(3)
    key = book_name.replace(" ", "")
    abbrev = BOOK_NAME_TO_ABBREV.get(key, key.upper()[:3])
    return f"{abbrev}.{chapter}:{verse}"


def fix_source_file(src: Path) -> int:
    tmp = src.with_suffix(".tmp")
    count = 0
    with open(src, encoding="utf-8") as fin, open(tmp, "w", encoding="utf-8") as fout:
        for line in fin:
            r = json.loads(line)
            # Decode HTML entities in text
            r["text"] = unescape(r["text"])
            # Add book/chapter/verse
            book, chapter, verse = parse_abbrev_ref(r["reference"])
            r["book"] = book
            r["chapter"] = int(chapter)
            r["verse"] = int(verse)
            fout.write(json.dumps(r, ensure_ascii=False) + "\n")
            count += 1
    tmp.replace(src)
    return count


def fix_parallel_file(src: Path) -> int:
    tmp = src.with_suffix(".tmp")
    count = 0
    with open(src, encoding="utf-8") as fin, open(tmp, "w", encoding="utf-8") as fout:
        for line in fin:
            r = json.loads(line)
            # Normalize reference in metadata
            raw_ref = r["metadata"]["reference"]
            norm_ref = normalize_parallel_ref(raw_ref)
            r["metadata"]["reference"] = norm_ref
            # Add book/chapter/verse to metadata
            book, chapter, verse = parse_abbrev_ref(norm_ref)
            r["metadata"]["book"] = book
            r["metadata"]["chapter"] = int(chapter)
            r["metadata"]["verse"] = int(verse)
            # Decode HTML entities in output (Zolai text)
            r["output"] = unescape(r["output"])
            fout.write(json.dumps(r, ensure_ascii=False) + "\n")
            count += 1
    tmp.replace(src)
    return count


def main() -> int:
    source_files = [
        DATA / "bible_tb77_online.jsonl",
        DATA / "bible_tbr17.jsonl",
        DATA / "bible_tdb_online.jsonl",
    ]
    parallel_files = [
        DATA / "bible_parallel_tdb77.jsonl",
        DATA / "bible_parallel_tedim2010.jsonl",
    ]

    for f in source_files:
        n = fix_source_file(f)
        print(f"✓ {f.name}: {n} lines fixed")

    for f in parallel_files:
        n = fix_parallel_file(f)
        print(f"✓ {f.name}: {n} lines fixed")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
