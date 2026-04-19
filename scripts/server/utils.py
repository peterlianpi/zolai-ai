from __future__ import annotations

import asyncio
from typing import AsyncIterator, Callable, TypeVar

from config.machine import MACHINE_CONFIG

T = TypeVar("T")


async def batch_process(
    items: list[T], batch_size: int | None = None
) -> AsyncIterator[list[T]]:
    """Process items in batches, optimized for machine."""
    batch_size = batch_size or MACHINE_CONFIG.batch_size
    for i in range(0, len(items), batch_size):
        yield items[i : i + batch_size]
        await asyncio.sleep(0)  # Yield control


async def concurrent_map(
    func: Callable[[T], T],
    items: list[T],
    max_concurrent: int | None = None,
) -> list[T]:
    """Map function over items with concurrency limit."""
    max_concurrent = max_concurrent or MACHINE_CONFIG.max_concurrent_tasks
    semaphore = asyncio.Semaphore(max_concurrent)

    async def bounded_func(item: T) -> T:
        async with semaphore:
            return await func(item) if asyncio.iscoroutinefunction(func) else func(item)

    return await asyncio.gather(*[bounded_func(item) for item in items])


def stream_file(filepath: str, chunk_size: int | None = None) -> AsyncIterator[str]:
    """Stream file line-by-line, optimized for machine."""
    chunk_size = chunk_size or MACHINE_CONFIG.chunk_size
    with open(filepath, encoding="utf-8") as f:
        chunk = []
        for line in f:
            chunk.append(line.rstrip("\n"))
            if len(chunk) >= chunk_size:
                yield "\n".join(chunk)
                chunk = []
        if chunk:
            yield "\n".join(chunk)
