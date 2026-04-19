from __future__ import annotations

import asyncio
import json
from pathlib import Path
from typing import AsyncIterator, Iterator

import orjson
from config.machine import MACHINE_CONFIG


async def stream_jsonl(filepath: str | Path) -> AsyncIterator[dict]:
    """Stream JSONL file with memory efficiency using orjson."""
    filepath = Path(filepath)
    chunk_size = MACHINE_CONFIG.chunk_size

    with open(filepath, "rb") as f:
        chunk = []
        for line in f:
            if line.strip():
                chunk.append(orjson.loads(line))
            if len(chunk) >= chunk_size:
                for item in chunk:
                    yield item
                chunk = []
                await asyncio.sleep(0)
        for item in chunk:
            yield item


async def stream_csv(filepath: str | Path, delimiter: str = ",") -> AsyncIterator[dict]:
    """Stream CSV file with memory efficiency."""
    filepath = Path(filepath)
    chunk_size = MACHINE_CONFIG.chunk_size

    with open(filepath, encoding="utf-8") as f:
        header = f.readline().strip().split(delimiter)
        chunk = []
        for line in f:
            if line.strip():
                values = line.strip().split(delimiter)
                chunk.append(dict(zip(header, values)))
            if len(chunk) >= chunk_size:
                for item in chunk:
                    yield item
                chunk = []
                await asyncio.sleep(0)
        for item in chunk:
            yield item


def batch_iter(items: list, batch_size: int | None = None) -> Iterator[list]:
    """Batch iterator for memory-efficient processing."""
    batch_size = batch_size or MACHINE_CONFIG.batch_size
    for i in range(0, len(items), batch_size):
        yield items[i : i + batch_size]


async def write_jsonl(filepath: str | Path, items: AsyncIterator[dict]) -> int:
    """Write items to JSONL file efficiently."""
    filepath = Path(filepath)
    filepath.parent.mkdir(parents=True, exist_ok=True)

    count = 0
    with open(filepath, "wb") as f:
        async for item in items:
            f.write(orjson.dumps(item) + b"\n")
            count += 1
            if count % MACHINE_CONFIG.chunk_size == 0:
                await asyncio.sleep(0)
    return count


async def dedupe_jsonl(
    input_path: str | Path, output_path: str | Path, key: str = "id"
) -> int:
    """Deduplicate JSONL file by key."""
    seen = set()
    count = 0

    async def dedupe_gen():
        nonlocal count
        async for item in stream_jsonl(input_path):
            item_key = item.get(key)
            if item_key and item_key not in seen:
                seen.add(item_key)
                count += 1
                yield item

    await write_jsonl(output_path, dedupe_gen())
    return count
