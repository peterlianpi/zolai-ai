from __future__ import annotations

import os
from dataclasses import dataclass

from config.machine import MACHINE_CONFIG


@dataclass
class ServerConfig:
    """Server configuration optimized for machine."""

    host: str = os.getenv("SERVER_HOST", "0.0.0.0")
    port: int = int(os.getenv("SERVER_PORT", "8000"))
    workers: int = MACHINE_CONFIG.api_workers
    timeout: int = MACHINE_CONFIG.api_timeout
    reload: bool = os.getenv("ENV", "development") == "development"

    # Database
    db_pool_size: int = MACHINE_CONFIG.db_pool_size
    db_max_overflow: int = MACHINE_CONFIG.db_max_overflow
    db_echo: bool = MACHINE_CONFIG.db_echo

    # Async
    max_concurrent: int = MACHINE_CONFIG.max_concurrent_tasks

    # Batch processing
    batch_size: int = MACHINE_CONFIG.batch_size
    chunk_size: int = MACHINE_CONFIG.chunk_size


def get_server_config() -> ServerConfig:
    """Get server configuration."""
    return ServerConfig()
