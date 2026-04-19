from __future__ import annotations

import multiprocessing
import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class MachineConfig:
    """Machine-specific optimization configuration."""

    # CPU: 4 cores
    cpu_cores: int = 4
    worker_threads: int = 4
    worker_processes: int = 3  # Leave 1 core free

    # Memory: 7.7GB total, 1.3GB available
    total_memory_gb: float = 7.7
    available_memory_gb: float = 1.3
    batch_size: int = 256  # Conservative for 1.3GB available
    chunk_size: int = 10000  # Lines per chunk for streaming

    # Disk: 233GB total, 28GB available (88% used)
    disk_available_gb: int = 28
    cache_dir: Path = Path("/tmp/zolai_cache")
    max_cache_gb: int = 5  # Use max 5GB of available 28GB

    # Database
    db_pool_size: int = 5  # Conservative for 4 cores
    db_max_overflow: int = 10
    db_echo: bool = False

    # API Server
    api_workers: int = 3  # uvicorn workers
    api_timeout: int = 60

    # Async
    max_concurrent_tasks: int = 20

    def __post_init__(self) -> None:
        """Validate configuration."""
        if self.worker_processes > self.cpu_cores - 1:
            raise ValueError("worker_processes must leave at least 1 core free")
        if self.batch_size > 1000:
            raise ValueError("batch_size too large for available memory")


# Singleton instance
MACHINE_CONFIG = MachineConfig()


def get_config() -> MachineConfig:
    """Get machine configuration."""
    return MACHINE_CONFIG


def optimize_for_machine() -> dict[str, int | str]:
    """Get optimization parameters for current machine."""
    return {
        "workers": MACHINE_CONFIG.worker_processes,
        "batch_size": MACHINE_CONFIG.batch_size,
        "chunk_size": MACHINE_CONFIG.chunk_size,
        "db_pool_size": MACHINE_CONFIG.db_pool_size,
        "max_concurrent": MACHINE_CONFIG.max_concurrent_tasks,
    }
