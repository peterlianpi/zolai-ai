"""Centralized logging configuration for Zolai."""
from __future__ import annotations

import logging
import logging.handlers
from datetime import datetime
from pathlib import Path


def setup_logger(
    name: str,
    component: str = "general",
    level: int = logging.INFO,
) -> logging.Logger:
    """Set up logger with file and console handlers.
    
    Args:
        name: Logger name (usually __name__)
        component: Component name (cli, api, training, crawlers, etc.)
        level: Logging level
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Create logs directory if needed
    log_dir = Path(f"logs/{component}")
    log_dir.mkdir(parents=True, exist_ok=True)

    # File handler (rotating)
    log_file = log_dir / f"{component}_{datetime.now().strftime('%Y%m%d')}.log"
    file_handler = logging.handlers.RotatingFileHandler(
        log_file,
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
    )
    file_handler.setLevel(level)

    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(level)

    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Add handlers
    if not logger.handlers:
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)

    return logger


# Component loggers
cli_logger = setup_logger(__name__, "cli")
api_logger = setup_logger(__name__, "api")
training_logger = setup_logger(__name__, "training")
crawler_logger = setup_logger(__name__, "crawlers")
pipeline_logger = setup_logger(__name__, "data_pipeline")
maintenance_logger = setup_logger(__name__, "maintenance")
