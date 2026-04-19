#!/usr/bin/env python3
"""Align Zolai text with English translations."""

from __future__ import annotations

import json
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Iterator

# Configuration
ROOT = Path(__file__).resolve().parent.parent
CLEAN_DIR = ROOT / "clean"


@dataclass
class AlignmentConfig:
    """Configuration for translation alignment."""

    target_language: str = "en"  # en, my (Burmese)
    data_type: str = "parallel"  # monolingual, parallel, lexicon


class Aligner:
    """Align Zolai with translations."""

    def __init__(self, config: AlignmentConfig | None = None):
        self.config = config or AlignmentConfig()
        self._translations = {}  # Cache translations

    def add_translation(self, zolai: str, translation: str) -> None:
        """Add a translation pair."""
        self._translations[zolai.strip()] = translation.strip()

    def align_entry(self, entry: dict) -> dict | None:
        """Align a single entry with translation."""
        text = entry.get("text", "")
        if not text:
            return None

        # Get translation from cache or input
        translation = entry.get("translation") or entry.get("translation_en", "")

        if not translation:
            # Look up in cache
            translation = self._translations.get(text.strip(), "")

        if not translation and self.config.data_type == "parallel":
            # Can't create parallel without translation
            return None

        # Update entry
        if translation:
            field = f"translation_{self.config.target_language}"
            entry[field] = translation

        entry["data_type"] = self.config.data_type

        return entry

    def load_translations(self, path: Path) -> int:
        """Load translations from file."""
        count = 0
        with open(path, encoding="utf-8") as f:
            for line in f:
                if not line.strip():
                    continue
                try:
                    data = json.loads(line)
                    zolai = data.get("text", "")
                    trans = data.get("translation", data.get("translation_en", ""))
                    if zolai and trans:
                        self._translations[zolai.strip()] = trans.strip()
                        count += 1
                except json.JSONDecodeError:
                    continue
        return count

    def align_file(
        self, input_path: Path, output_path: Path | None = None, translations_path: Path | None = None
    ) -> int:
        """Align all entries in a file."""
        if translations_path:
            count = self.load_translations(translations_path)
            print(f"Loaded {count} translations")

        output = output_path or input_path
        aligned = 0

        with open(input_path, encoding="utf-8") as f_in, open(output, "w", encoding="utf-8") as f_out:
            for line in f_in:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    aligned_entry = self.align_entry(entry)
                    if aligned_entry:
                        f_out.write(json.dumps(aligned_entry, ensure_ascii=False) + "\n")
                        aligned += 1
                except json.JSONDecodeError:
                    continue

        return aligned


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Align Zolai with translations")
    parser.add_argument("-i", "--input", type=Path, required=True, help="Input file")
    parser.add_argument("-o", "--output", type=Path, help="Output file")
    parser.add_argument("-t", "--translations", type=Path, help="Translations file")
    parser.add_argument("-d", "--data-type", default="parallel", help="Data type (monolingual, parallel, lexicon)")
    parser.add_argument("-l", "--language", default="en", help="Target language (en, my)")
    args = parser.parse_args(argv or [])

    config = AlignmentConfig(
        target_language=args.language,
        data_type=args.data_type,
    )

    aligner = Aligner(config)
    count = aligner.align_file(args.input, args.output, args.translations)
    print(f"Aligned {count} entries")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
