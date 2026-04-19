from __future__ import annotations

import json
from pathlib import Path
from typing import Generator


def stream_jsonl(file_path: Path | str, max_lines: int | None = None) -> Generator[dict, None, None]:
    """Stream JSONL file line-by-line (memory-efficient for large files)."""
    with open(file_path, encoding="utf-8") as f:
        for i, line in enumerate(f):
            if max_lines and i >= max_lines:
                break
            if line.strip():
                yield json.loads(line)


def batch_stream_jsonl(
    file_path: Path | str, batch_size: int = 32, max_lines: int | None = None
) -> Generator[list[dict], None, None]:
    """Stream JSONL in batches (reduces memory overhead)."""
    batch = []
    for i, item in enumerate(stream_jsonl(file_path, max_lines)):
        batch.append(item)
        if len(batch) >= batch_size:
            yield batch
            batch = []
    if batch:
        yield batch


def count_jsonl_lines(file_path: Path | str) -> int:
    """Count lines in JSONL file efficiently."""
    with open(file_path, encoding="utf-8") as f:
        return sum(1 for _ in f)
