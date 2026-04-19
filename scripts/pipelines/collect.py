#!/usr/bin/env python3
"""Collect raw Zolai data from various sources."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path
from datetime import datetime
from dataclasses import dataclass, field
from typing import Iterator

# Configuration
ROOT = Path(__file__).resolve().parent.parent
RAW_DIR = ROOT / "raw"
SCHEMA = ROOT / "schema.md"


@dataclass
class CollectionConfig:
    """Configuration for data collection."""

    source_type: str = "web"  # web, pdf, bible, dictionary, news
    topic: str = "conversation"  # religion, education, conversation, culture, grammar, story
    min_length: int = 5
    output_dir: Path = field(default_factory=lambda: RAW_DIR)


@dataclass
class CollectedEntry:
    """Single collected entry."""

    text: str
    source: str
    source_url: str = ""
    language: str = "zolo"
    topic: str = "conversation"
    collected_at: str = field(default_factory=lambda: datetime.now().isoformat())


def collect_from_file(input_path: Path, source_type: str, topic: str) -> Iterator[CollectedEntry]:
    """Collect entries from a file."""
    if input_path.suffix == ".jsonl":
        yield from _collect_jsonl(input_path, source_type, topic)
    elif input_path.suffix == ".json":
        yield from _collect_json(input_path, source_type, topic)
    else:
        yield from _collect_text(input_path, source_type, topic)


def _collect_jsonl(path: Path, source_type: str, topic: str) -> Iterator[CollectedEntry]:
    """Collect from JSONL file."""
    with open(path, encoding="utf-8") as f:
        for line in f:
            if not line.strip():
                continue
            try:
                data = json.loads(line)
                text = data.get("text") or data.get("zolai") or data.get("content", "")
                if text and len(text.strip()) >= 5:
                    url = data.get("url", data.get("source_url", ""))
                    yield CollectedEntry(
                        text=text.strip(),
                        source=source_type,
                        source_url=url,
                        topic=topic,
                    )
            except json.JSONDecodeError:
                continue


def _collect_json(path: Path, source_type: str, topic: str) -> Iterator[CollectedEntry]:
    """Collect from JSON file."""
    with open(path, encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, list):
            for item in data:
                text = item.get("text") or item.get("zolai") or ""
                if text and len(text.strip()) >= 5:
                    yield CollectedEntry(
                        text=text.strip(),
                        source=source_type,
                        topic=topic,
                    )
        elif isinstance(data, dict):
            if "text" in data:
                yield CollectedEntry(
                    text=data["text"].strip(),
                    source=source_type,
                    topic=topic,
                )


def _collect_text(path: Path, source_type: str, topic: str) -> Iterator[CollectedEntry]:
    """Collect sentences from plain text."""
    with open(path, encoding="utf-8") as f:
        content = f.read()
        # Split on common sentence delimiters
        sentences = re.split(r"[.!?\n]+", content)
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and len(sentence) >= 5:
                yield CollectedEntry(
                    text=sentence,
                    source=source_type,
                    topic=topic,
                )


def collect_directory(input_dir: Path, source_type: str, topic: str, output_path: Path | None = None) -> int:
    """Collect from all files in a directory."""
    collected = 0
    output_file = output_path or (output_dir(source_type) / f"{topic}.jsonl")

    output_file.parent.mkdir(parents=True, exist_ok=True)

    with open(output_file, "w", encoding="utf-8") as out:
        for file_path in input_dir.rglob("*"):
            if file_path.is_file() and file_path.suffix in {".txt", ".json", ".jsonl"}:
                for entry in collect_from_file(file_path, source_type, topic):
                    out.write(json.dumps(_entry_to_dict(entry), ensure_ascii=False) + "\n")
                    collected += 1

    return collected


def output_dir(source_type: str) -> Path:
    """Get output directory for source type."""
    return RAW_DIR / source_type


def _entry_to_dict(entry: CollectedEntry) -> dict:
    """Convert entry to dictionary."""
    return {
        "text": entry.text,
        "source": entry.source,
        "url": entry.source_url,
        "language": entry.language,
        "topic": entry.topic,
        "collected_at": entry.collected_at,
    }


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Collect raw Zolai data")
    parser.add_argument("-i", "--input", type=Path, help="Input file or directory")
    parser.add_argument("-t", "--source-type", default="web", help="Source type (web, pdf, bible, dictionary)")
    parser.add_argument("-T", "--topic", default="conversation", help="Topic")
    parser.add_argument("-o", "--output", type=Path, help="Output file")
    args = parser.parse_args(argv or [])

    if args.input:
        if args.input.is_file():
            count = 0
            output = args.output or (output_dir(args.source_type) / f"{args.topic}.jsonl")
            output.parent.mkdir(parents=True, exist_ok=True)
            with open(output, "w", encoding="utf-8") as out:
                for entry in collect_from_file(args.input, args.source_type, args.topic):
                    out.write(json.dumps(_entry_to_dict(entry), ensure_ascii=False) + "\n")
                    count += 1
            print(f"Collected {count} entries")
        else:
            count = collect_directory(args.input, args.source_type, args.topic, args.output)
            print(f"Collected {count} entries from {args.input}")
    else:
        # Show help
        parser.print_help()
        print("\nExamples:")
        print("  python pipelines/collect.py -i data/raw.txt --source-type web")
        print("  python pipelines/collect.py -i data/ -t bible -T religion")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
