#!/usr/bin/env python3
"""Deduplicate Zolai dataset - hash-based deduplication."""

from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from typing import Iterator

# Configuration
ROOT = Path(__file__).resolve().parent.parent
CLEAN_DIR = ROOT / "clean"


def compute_hash(text: str) -> str:
    """Compute MD5 hash of text."""
    return hashlib.md5(text.encode("utf-8")).hexdigest()


def normalize_for_hash(text: str) -> str:
    """Normalize text before hashing."""
    return text.lower().strip()


class Deduplicator:
    """Hash-based deduplication."""

    def __init__(self):
        self.seen_hashes: set[str] = set()
        self.duplicates: int = 0

    def deduplicate_entry(self, entry: dict) -> dict | None:
        """Deduplicate a single entry."""
        text = entry.get("text", "")
        if not text:
            return None

        # Normalize and hash
        normalized = normalize_for_hash(text)
        entry_hash = compute_hash(normalized)

        # Check for duplicates
        if entry_hash in self.seen_hashes:
            self.duplicates += 1
            return None

        # Add to seen and return
        self.seen_hashes.add(entry_hash)
        return entry

    def deduplicate_file(
        self, input_path: Path, output_path: Path | None = None, stats_path: Path | None = None
    ) -> tuple[int, int]:
        """Deduplicate all entries in a file."""
        self.seen_hashes.clear()
        self.duplicates = 0

        output = output_path or input_path
        original_count = 0
        unique_count = 0

        with open(input_path, encoding="utf-8") as f_in, open(output, "w", encoding="utf-8") as f_out:
            for line in f_in:
                if not line.strip():
                    continue
                try:
                    entry = json.loads(line)
                    original_count += 1

                    deduped = self.deduplicate_entry(entry)
                    if deduped:
                        f_out.write(json.dumps(deduped, ensure_ascii=False) + "\n")
                        unique_count += 1
                except json.JSONDecodeError:
                    continue

        return original_count, unique_count

    def deduplicate_directory(self, input_dir: Path, output_dir: Path | None = None) -> dict:
        """Deduplicate all files in a directory."""
        output_dir = output_dir or input_dir

        stats = {
            "total_original": 0,
            "total_unique": 0,
            "total_duplicates": 0,
            "files": {},
        }

        for file_path in input_dir.rglob("*.jsonl"):
            rel_path = file_path.relative_to(input_dir)
            out_path = output_dir / rel_path
            out_path.parent.mkdir(parents=True, exist_ok=True)

            original, unique = self.deduplicate_file(file_path, out_path)
            duplicates = original - unique

            stats["files"][str(rel_path)] = {
                "original": original,
                "unique": unique,
                "duplicates": duplicates,
            }
            stats["total_original"] += original
            stats["total_unique"] += unique
            stats["total_duplicates"] += duplicates

        return stats


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Deduplicate Zolai data")
    parser.add_argument("-i", "--input", type=Path, required=True, help="Input file or directory")
    parser.add_argument("-o", "--output", type=Path, help="Output file (default: overwrite)")
    parser.add_argument("-s", "--stats", type=Path, help="Stats output file (JSON)")
    args = parser.parse_args(argv or [])

    deduplicator = Deduplicator()

    if args.input.is_file():
        original, unique = deduplicator.deduplicate_file(args.input, args.output)
        duplicates = original - unique
        print(f"Original: {original}, Unique: {unique}, Duplicates: {duplicates}")

        if args.stats:
            with open(args.stats, "w", encoding="utf-8") as f:
                json.dump(
                    {
                        "original": original,
                        "unique": unique,
                        "duplicates": duplicates,
                    },
                    f,
                    indent=2,
                )
    else:
        stats = deduplicator.deduplicate_directory(args.input, args.output)
        print(f"Total original: {stats['total_original']}")
        print(f"Total unique: {stats['total_unique']}")
        print(f"Total duplicates: {stats['total_duplicates']}")

        if args.stats:
            with open(args.stats, "w", encoding="utf-8") as f:
                json.dump(stats, f, indent=2)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
