#!/usr/bin/env python3
"""Export Zolai dataset to JSONL, CSV, or HuggingFace format."""

from __future__ import annotations

import csv
import json
import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Iterator

# Configuration
ROOT = Path(__file__).resolve().parent.parent
CLEAN_DIR = ROOT / "clean"
DATASET_DIR = ROOT / "dataset"


@dataclass
class ExportConfig:
    """Configuration for dataset export."""

    format: str = "jsonl"  # jsonl, csv, huggingface
    split: str = "train"  # train, val, test
    data_type: str = "all"  # all, monolingual, parallel, lexicon
    fields: list[str] | None = None  # Fields to include


class Exporter:
    """Export Zolai dataset to various formats."""

    def __init__(self, config: ExportConfig | None = None):
        self.config = config or ExportConfig()
        self._entries = []

    def load_entries(self, input_dir: Path) -> list[dict]:
        """Load all entries from directory."""
        entries = []

        # Determine subdirectory
        if self.config.data_type == "all":
            search_dirs = ["monolingual", "bilingual", "lexicon"]
        else:
            search_dirs = [self.config.data_type]

        for subdir in search_dirs:
            data_dir = input_dir / subdir
            if not data_dir.exists():
                continue

            for file_path in data_dir.glob("*.jsonl"):
                with open(file_path, encoding="utf-8") as f:
                    for line in f:
                        if not line.strip():
                            continue
                        try:
                            entries.append(json.loads(line))
                        except json.JSONDecodeError:
                            pass

        self._entries = entries
        return entries

    def export_jsonl(self, entries: list[dict], output_path: Path) -> int:
        """Export to JSONL format."""
        output_path.parent.mkdir(parents=True, exist_ok=True)

        with open(output_path, "w", encoding="utf-8") as f:
            for entry in entries:
                if self.config.fields:
                    filtered = {k: entry[k] for k in self.config.fields if k in entry}
                else:
                    filtered = entry
                f.write(json.dumps(filtered, ensure_ascii=False) + "\n")

        return len(entries)

    def export_csv(self, entries: list[dict], output_path: Path) -> int:
        """Export to CSV format."""
        output_path.parent.mkdir(parents=True, exist_ok=True)

        if not entries:
            return 0

        # Determine fields
        if self.config.fields:
            fieldnames = self.config.fields
        else:
            # Use keys from first entry
            fieldnames = list(entries[0].keys())

        with open(output_path, "w", encoding="utf-8", newline="") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for entry in entries:
                filtered = {k: entry.get(k, "") for k in fieldnames}
                writer.writerow(filtered)

        return len(entries)

    def export_huggingface(self, entries: list[dict], output_dir: Path) -> dict:
        """Export to HuggingFace dataset format."""
        output_dir.mkdir(parents=True, exist_ok=True)

        # Create splits
        splits = {
            "train": entries[: int(len(entries) * 0.9)],
            "val": entries[int(len(entries) * 0.9) : int(len(entries) * 0.95)],
            "test": entries[int(len(entries) * 0.95) :],
        }

        # Write splits
        for split_name, split_entries in splits.items():
            split_dir = output_dir / split_name
            split_dir.mkdir(parents=True, exist_ok=True)

            # Save as JSONL
            with open(split_dir / "data.jsonl", "w", encoding="utf-8") as f:
                for entry in split_entries:
                    f.write(json.dumps(entry, ensure_ascii=False) + "\n")

        # Create dataset_info.json
        info = {
            "dataset_name": "zolai",
            "version": "1.0.0",
            "splits": {name: len(entries) for name, entries in splits.items()},
            "total": len(entries),
        }

        with open(output_dir / "dataset_info.json", "w", encoding="utf-8") as f:
            json.dump(info, f, indent=2)

        return info

    def export_directory(self, input_dir: Path, output_dir: Path | None = None, format: str | None = None) -> dict:
        """Export all data from directory."""
        output_dir = output_dir or DATASET_DIR
        fmt = format or self.config.format

        if fmt == "huggingface":
            entries = self.load_entries(input_dir)
            return self.export_huggingface(entries, output_dir)
        else:
            # For jsonl/csv, process each data type
            stats = {}

            data_types = ["monolingual", "bilingual", "lexicon"]
            for dtype in data_types:
                data_dir = input_dir / dtype
                if not data_dir.exists():
                    continue

                entries = []
                for file_path in data_dir.glob("*.jsonl"):
                    with open(file_path, encoding="utf-8") as f:
                        for line in f:
                            if not line.strip():
                                continue
                            try:
                                entries.append(json.loads(line))
                            except json.JSONDecodeError:
                                pass

                if entries:
                    if fmt == "jsonl":
                        out_path = output_dir / "jsonl" / f"{dtype}.jsonl"
                        count = self.export_jsonl(entries, out_path)
                    else:
                        out_path = output_dir / "csv" / f"{dtype}.csv"
                        count = self.export_csv(entries, out_path)

                    stats[dtype] = count

            return stats


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Export Zolai dataset")
    parser.add_argument("-i", "--input", type=Path, help="Input directory (default: clean/)")
    parser.add_argument("-o", "--output", type=Path, help="Output directory")
    parser.add_argument("-f", "--format", default="jsonl", help="Format (jsonl, csv, huggingface)")
    parser.add_argument("-d", "--data-type", default="all", help="Data type (all, monolingual, parallel, lexicon)")
    parser.add_argument("-s", "--split", default="train", help="Split (train, val, test)")
    parser.add_argument("--fields", help="Comma-separated fields to include")
    args = parser.parse_args(argv or [])

    config = ExportConfig(
        format=args.format,
        split=args.split,
        data_type=args.data_type,
        fields=args.fields.split(",") if args.fields else None,
    )

    exporter = Exporter(config)

    input_dir = args.input or CLEAN_DIR
    output_dir = args.output

    if args.format == "huggingface":
        result = exporter.export_directory(input_dir, output_dir)
        print(f"Exported to HuggingFace format: {result}")
    else:
        result = exporter.export_directory(input_dir, output_dir)
        print(f"Exported: {result}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
