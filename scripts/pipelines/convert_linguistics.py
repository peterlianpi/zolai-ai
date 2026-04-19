#!/usr/bin/env python3
"""Convert Linguistics JSON Bible files to JSONL format."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Iterator


ROOT = Path(__file__).resolve().parents[2]
LING = Path("/path/to/zolai/Documents/Linguistics/Zolai")
RAW_BIBLE = ROOT / "raw" / "bible"


@dataclass
class VerseEntry:
    id: str
    text: str
    source: str
    book: str = ""
    chapter: int = 0
    verse: int = 0


def convert_json_bible(json_path: Path, source_name: str) -> Iterator[VerseEntry]:
    """Convert a JSON Bible file to verses."""
    with open(json_path, encoding="utf-8") as f:
        data = json.load(f)

    language = data.get("language", "zolai")

    # Handle book structure: books -> book_id -> chapter -> verse -> text
    books = data.get("book", {})
    for book_id, book_data in books.items():
        if not isinstance(book_data, dict):
            continue

        # Get book info for name
        book_info = book_data.get("info", {})
        book_name = book_info.get("shortname", book_info.get("name", book_id))

        # Chapters within book
        chapters = book_data.get("chapter", {})
        if not isinstance(chapters, dict):
            continue

        for chapter_num, chapter_data in chapters.items():
            if not isinstance(chapter_data, dict):
                continue

            # verse -> {text: ...}
            verse_dict = chapter_data.get("verse", {})
            if isinstance(verse_dict, dict):
                for verse_num, verse_data in verse_dict.items():
                    if isinstance(verse_data, dict) and isinstance(verse_data.get("text"), str):
                        text = verse_data["text"].strip()
                        if text:
                            yield VerseEntry(
                                id=f"{source_name}-{book_id}-{chapter_num}-{verse_num}",
                                text=text,
                                source=source_name,
                                book=book_name,
                                chapter=int(chapter_num) if str(chapter_num).isdigit() else 0,
                                verse=int(verse_num) if str(verse_num).isdigit() else 0,
                            )


def write_jsonl(entries: Iterator[VerseEntry], output_path: Path) -> int:
    """Write entries to JSONL file."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    count = 0

    with open(output_path, "w", encoding="utf-8") as f:
        for entry in entries:
            record = {
                "id": entry.id,
                "language": "zolai",
                "text": entry.text,
                "source": entry.source,
                "book": entry.book,
                "chapter": entry.chapter,
                "verse": entry.verse,
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
            count += 1

    return count


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Convert Linguistics JSON to JSONL")
    parser.add_argument("-o", "--output", type=Path, default=RAW_BIBLE)
    args = parser.parse_args(argv or [])

    sources = [
        ("judson1835.json", "judson1835"),
        ("tedim1932.json", "tedim1932"),
        ("luther1912.json", "luther1912"),
    ]

    total = 0
    for json_name, source_name in sources:
        json_path = LING / json_name
        if not json_path.exists():
            print(f"Skipping {json_name} (not found)")
            continue

        output_path = args.output / f"{source_name}.jsonl"
        entries = convert_json_bible(json_path, source_name)
        count = write_jsonl(entries, output_path)
        print(f"{source_name}: {count} verses -> {output_path}")
        total += count

    print(f"Total: {total} verses")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
