#!/usr/bin/env python3
"""Convert USX Bible files to JSONL format."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from xml.etree import ElementTree as ET
from dataclasses import dataclass
from typing import Iterator


@dataclass
class VerseRef:
    book: str
    chapter: int
    verse: int
    text: str


ROOT = Path(__file__).resolve().parents[2]
BIBLES_DIR = Path("/path/to/zolai/Documents/Projects/bibles")
RAW_BIBLE = ROOT / "raw" / "bible"


def parse_usx(file_path: Path) -> Iterator[VerseRef]:
    """Parse a USX file and yield verses."""
    tree = ET.parse(file_path)
    root = tree.getroot()

    current_book = ""
    current_chapter = 0
    verse_buffer = ""
    current_verse_num = 0

    for elem in root.iter():
        tag = elem.tag.split("}")[-1] if "}" in elem.tag else elem.tag

        if tag == "book":
            current_book = elem.get("code", "")
        elif tag == "chapter":
            ch = elem.get("number", "0")
            current_chapter = int(ch) if ch.isdigit() else 0
        elif tag == "verse":
            v_num = elem.get("number", "0")
            current_verse_num = int(v_num) if v_num.isdigit() else 0
            # For self-closing tags like <verse.../>, text is in tail, not text
            verse_text = elem.text or ""
            if not verse_text.strip():
                verse_text = elem.tail or ""
            verse_text = verse_text.strip()
            if verse_text:
                yield VerseRef(book=current_book, chapter=current_chapter, verse=current_verse_num, text=verse_text)


def verses_to_jsonl(usx_dir: Path, output_path: Path) -> int:
    """Convert all USX files to JSONL."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0

    with open(output_path, "w", encoding="utf-8") as out:
        for usx_file in sorted(usx_dir.glob("*.usx")):
            for verse in parse_usx(usx_file):
                entry = {
                    "id": f"tb77-{verse.book}-{verse.chapter}-{verse.verse}",
                    "language": "zolai",
                    "text": verse.text,
                    "source": "tb77",
                    "book": verse.book,
                    "chapter": verse.chapter,
                    "verse": verse.verse,
                }
                out.write(json.dumps(entry, ensure_ascii=False) + "\n")
                count += 1

                if count % 5000 == 0:
                    print(f"Processed {count} verses...", flush=True)

    return count


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Convert USX to JSONL")
    parser.add_argument("-i", "--input", type=Path, default=BIBLES_DIR / "tb77/USX_1")
    parser.add_argument("-o", "--output", type=Path, default=RAW_BIBLE / "tb77.jsonl")
    args = parser.parse_args(argv or [])

    if not args.input.exists():
        print(f"Error: Input directory not found: {args.input}", file=sys.stderr)
        return 1

    print(f"Converting USX files from {args.input}")
    count = verses_to_jsonl(args.input, args.output)
    print(f"Output: {count} verses to {args.output}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
