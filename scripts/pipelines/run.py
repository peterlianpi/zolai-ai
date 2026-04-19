#!/usr/bin/env python3
"""Run full Zolai data pipeline."""

from __future__ import annotations

import sys
from pathlib import Path
from dataclasses import dataclass
from typing import Optional

from . import collect, clean, deduplicate, align, export


@dataclass
class PipelineConfig:
    """Configuration for full pipeline."""

    raw_dir: Path
    clean_dir: Path
    dataset_dir: Path
    skip_collect: bool = False
    skip_clean: bool = False
    skip_deduplicate: bool = False
    skip_align: bool = False
    skip_export: bool = False


class Pipeline:
    """Full Zolai data pipeline."""

    def __init__(self, config: PipelineConfig):
        self.config = config
        self.stats = {}

    def run(self) -> dict:
        """Run full pipeline."""
        print("=" * 50)
        print("ZOLAI DATA PIPELINE")
        print("=" * 50)

        # Stage 1: Collect
        if not self.config.skip_collect:
            print("\n[1/5] Collecting data...")
            # collect.run() - handled separately
            self.stats["collect"] = {"status": "skip or run manually"}
        else:
            print("\n[1/5] Skipping collect")

        # Stage 2: Clean
        if not self.config.skip_clean:
            print("\n[2/5] Cleaning data...")
            cleaner = clean.ZolaiCleaner()
            stats = cleaner.clean_directory(self.config.raw_dir, self.config.clean_dir)
            self.stats["clean"] = stats
            print(f"   Cleaned: {stats} entries")
        else:
            print("\n[2/5] Skipping clean")

        # Stage 3: Deduplicate
        if not self.config.skip_deduplicate:
            print("\n[3/5] Deduplicating...")
            deduplicator = deduplicate.Deduplicator()
            stats = deduplicator.deduplicate_directory(self.config.clean_dir)
            self.stats["deduplicate"] = stats
            print(f"   Unique: {stats['total_unique']} / {stats['total_original']}")
        else:
            print("\n[3/5] Skipping deduplicate")

        # Stage 4: Align (optional)
        if not self.config.skip_align:
            print("\n[4/5] Aligning translations...")
            self.stats["align"] = {"status": "manual - provide translations file"}
        else:
            print("\n[4/5] Skipping align")

        # Stage 5: Export
        if not self.config.skip_export:
            print("\n[5/5] Exporting to dataset...")
            exporter = export.Exporter()
            stats = exporter.export_directory(self.config.clean_dir, self.config.dataset_dir)
            self.stats["export"] = stats
            print(f"   Exported: {stats}")
        else:
            print("\n[5/5] Skipping export")

        print("\n" + "=" * 50)
        print("PIPELINE COMPLETE")
        print("=" * 50)

        return self.stats


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    ROOT = Path(__file__).resolve().parent.parent

    parser = argparse.ArgumentParser(description="Run Zolai data pipeline")
    parser.add_argument("--skip-collect", action="store_true", help="Skip collect stage")
    parser.add_argument("--skip-clean", action="store_true", help="Skip clean stage")
    parser.add_argument("--skip-deduplicate", action="store_true", help="Skip deduplicate stage")
    parser.add_argument("--skip-align", action="store_true", help="Skip align stage")
    parser.add_argument("--skip-export", action="store_true", help="Skip export stage")
    parser.add_argument("--raw-dir", type=Path, default=ROOT / "raw", help="Raw data directory")
    parser.add_argument("--clean-dir", type=Path, default=ROOT / "clean", help="Clean data directory")
    parser.add_argument("--dataset-dir", type=Path, default=ROOT / "dataset", help="Dataset output directory")
    args = parser.parse_args(argv or [])

    config = PipelineConfig(
        raw_dir=args.raw_dir,
        clean_dir=args.clean_dir,
        dataset_dir=args.dataset_dir,
        skip_collect=args.skip_collect,
        skip_clean=args.skip_clean,
        skip_deduplicate=args.skip_deduplicate,
        skip_align=args.skip_align,
        skip_export=args.skip_export,
    )

    pipeline = Pipeline(config)
    stats = pipeline.run()

    print(f"\nStats: {stats}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
