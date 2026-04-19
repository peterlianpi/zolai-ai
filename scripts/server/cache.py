from __future__ import annotations

import asyncio
from functools import wraps
from pathlib import Path
from typing import Any, Callable

import diskcache
from config.machine import MACHINE_CONFIG

# Initialize disk cache
CACHE_DIR = Path(MACHINE_CONFIG.cache_dir)
CACHE_DIR.mkdir(parents=True, exist_ok=True)

cache = diskcache.Cache(str(CACHE_DIR), size_limit=MACHINE_CONFIG.max_cache_gb * 1e9)


def cached(ttl: int = 3600) -> Callable:
    """Decorator for caching function results to disk."""

    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Create cache key from function name and args
            key = f"{func.__name__}:{args}:{kwargs}"

            # Try to get from cache
            if key in cache:
                return cache[key]

            # Call function and cache result
            result = await func(*args, **kwargs) if asyncio.iscoroutinefunction(func) else func(*args, **kwargs)
            cache[key] = result
            cache.expire(key, ttl)

            return result

        return wrapper

    return decorator


def clear_cache() -> None:
    """Clear all cached data."""
    cache.clear()


def cache_stats() -> dict[str, Any]:
    """Get cache statistics."""
    return {
        "size": cache.__sizeof__(),
        "items": len(cache),
        "max_size": MACHINE_CONFIG.max_cache_gb * 1e9,
    }
