#!/usr/bin/env python3
"""Clean raw Zolai data - remove noise, fix encoding, validate."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass
from typing import Iterator

# Configuration
ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw"
CLEAN_DIR = ROOT / "clean"


@dataclass
class CleanConfig:
    """Configuration for data cleaning."""

    min_length: int = 5
    max_length: int = 5000
    remove_html: bool = True
    remove_urls: bool = True
    remove_placeholders: bool = True
    preserve_punctuation: bool = True


# Patterns to remove
HTML_TAGS = re.compile(r"<[^>]+>")
URLS = re.compile(r"https?://\S+")
PLACEHOLDERS = re.compile(r"\[[\.\.]+\]|\[\.\.\]|\[intermediate\]")


class ZolaiCleaner:
    """Clean Zolai text data."""

    def __init__(self, config: CleanConfig | None = None):
        self.config = config or CleanConfig()

    def clean_entry(self, entry: dict) -> dict | None:
        """Clean a single entry."""
        text = entry.get("text", "")
        if not text:
            return None

        # Apply cleaning steps
        text = self._clean_text(text)

        # Validate
        if not self._is_valid(text):
            return None

        # Update entry
        entry["text"] = text
        entry["cleaned_at"] = datetime.now().isoformat()
        entry["is_cleaned"] = True

        return entry

    def _clean_text(self, text: str) -> str:
        """Apply all cleaning steps."""
        if self.config.remove_html:
            text = HTML_TAGS.sub("", text)

        if self.config.remove_urls:
            text = URLS.sub("", text)

        if self.config.remove_placeholders:
            text = PLACEHOLDERS.sub("", text)

        # Fix common encoding issues
        text = self._fix_encoding(text)

        # Normalize whitespace
        text = re.sub(r"\s+", " ", text).strip()

        return text

    def _fix_encoding(self, text: str) -> str:
        """Fix common encoding issues."""
        replacements = {
            "\u201c": '"',
            "\u201d": '"',
            "\u2013": "-",
            "\u2018": "'",
            "\u2019": "'",
            "\u200b": "",
            "\ufeff": "",
        }

        for old, new in replacements.items():
            text = text.replace(old, new)

        for old, new in replacements.items():
            text = text.replace(old, new)

        return text

    def _is_valid(self, text: str) -> bool:
        """Check if text is valid."""
        # Length check
        if len(text) < self.config.min_length:
            return False
        if len(text) > self.config.max_length:
            return False

        # Check for valid characters (Zolai uses Latin + Burmese + some special)
        # Allow Latin or Burmese script
        has_latin = bool(re.search(r"[a-zA-Z]", text))
        has_burmese = bool(re.search(r"[\u1000-\u1099\u10EE-\u10FF]", text))
        if not (has_latin or has_burmese):
            return False

        return True

    def clean_file(self, input_path: Path, output_path: Path | None = None) -> int:
        """Clean all entries in a file."""
        output = output_path or input_path
        cleaned = 0

        with open(input_path, encoding="utf-8") as f_in, open(output, "w", encoding="utf-8") as f_out:
            for line in f_in:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    cleaned_entry = self.clean_entry(entry)
                    if cleaned_entry:
                        f_out.write(json.dumps(cleaned_entry, ensure_ascii=False) + "\n")
                        cleaned += 1
                except json.JSONDecodeError:
                    continue

        return cleaned

    def clean_directory(self, input_dir: Path, output_dir: Path | None = None) -> int:
        """Clean all files in a directory."""
        output_dir = output_dir or CLEAN_DIR
        total_cleaned = 0

        for source_dir in input_dir.iterdir():
            if not source_dir.is_dir():
                continue

            for file_path in source_dir.glob("*.jsonl"):
                rel_path = file_path.relative_to(input_dir)
                out_path = output_dir / rel_path
                out_path.parent.mkdir(parents=True, exist_ok=True)

                count = self.clean_file(file_path, out_path)
                total_cleaned += count
                print(f"Cleaned {count} from {rel_path}")

        return total_cleaned


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Clean Zolai data")
    parser.add_argument("-i", "--input", type=Path, required=True, help="Input file or directory")
    parser.add_argument("-o", "--output", type=Path, help="Output file (default: overwrite)")
    parser.add_argument("--min-length", type=int, default=5, help="Minimum text length")
    parser.add_argument("--keep-html", action="store_true", help="Keep HTML tags")
    args = parser.parse_args(argv or [])

    config = CleanConfig(
        min_length=args.min_length,
        remove_html=not args.keep_html,
    )

    cleaner = ZolaiCleaner(config)

    if args.input.is_file():
        count = cleaner.clean_file(args.input, args.output)
        print(f"Cleaned {count} entries")
    else:
        count = cleaner.clean_directory(args.input, args.output)
        print(f"Total cleaned: {count} entries")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
