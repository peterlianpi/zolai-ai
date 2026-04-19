"""Zolai Toolkit configuration and paths — env-aware."""

import os
from dataclasses import dataclass, field
from pathlib import Path

# Toolkit root = the zolai project directory
# config.py is at: zolai/zolai/config.py
#   .parent      = zolai/
#   .parent x2   = zolai-project/
_TOOLKIT_ROOT = Path(__file__).resolve().parent.parent  # zolai/config.py -> zolai/


def _env_path(key: str, default: Path) -> Path:
    val = os.environ.get(key, "").strip()
    return Path(val) if val else default


def _data_root() -> Path:
    return _env_path("ZOLAI_DATA_ROOT", _TOOLKIT_ROOT / "data")


@dataclass
class Paths:
    """Centralized path configuration — all overridable via env vars."""

    root: Path = field(default_factory=lambda: _env_path("ZOLAI_ROOT", _TOOLKIT_ROOT))

    # Use global data root as primary
    data: Path = field(
        default_factory=lambda: _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data")
    )

    data_raw: Path = field(
        default_factory=lambda: _env_path(
            "ZOLAI_DATA_RAW", _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data") / "raw"
        )
    )
    data_cleaned: Path = field(
        default_factory=lambda: _env_path(
            "ZOLAI_DATA_CLEANED",
            _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data") / "master",
        )
    )
    data_training: Path = field(
        default_factory=lambda: _env_path(
            "ZOLAI_DATA_TRAINING",
            _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data") / "training",
        )
    )
    data_knowledge: Path = field(
        default_factory=lambda: _env_path(
            "ZOLAI_DATA_KNOWLEDGE",
            _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data") / "knowledge",
        )
    )
    data_archive: Path = field(
        default_factory=lambda: _env_path(
            "ZOLAI_DATA_ARCHIVE",
            _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data") / "archive",
        )
    )
    db: Path = field(
        default_factory=lambda: _env_path(
            "ZOLAI_DB_PATH",
            _env_path("ZOLAI_DATA_ROOT", Path.home() / "Documents" / "Projects" / "data") / "crawler.db",
        )
    )

    # External input folder — used by ingest scripts, NOT overriding toolkit data
    external_data: Path = field(
        default_factory=lambda: _env_path("ZOLAI_EXTERNAL_DATA", Path.home() / "Documents" / "Projects" / "data")
    )

    def ensure_dirs(self):
        for p in [self.data_raw, self.data_cleaned, self.data_training, self.data_knowledge, self.data_archive]:
            p.mkdir(parents=True, exist_ok=True)


@dataclass
class CrawlerConfig:
    """Crawler settings."""

    max_depth: int = int(os.environ.get("ZOLAI_CRAWLER_MAX_DEPTH", "2"))
    delay_seconds: float = float(os.environ.get("ZOLAI_CRAWLER_DELAY", "2.0"))
    max_concurrent: int = int(os.environ.get("ZOLAI_CRAWLER_CONCURRENT", "5"))
    user_agent: str = "ZolaiToolkit/1.0 (Language Research)"
    target_mb: int = int(os.environ.get("ZOLAI_CRAWLER_TARGET_MB", "500"))


@dataclass
class CleanerConfig:
    """Data cleaning settings."""

    min_sentence_length: int = int(os.environ.get("ZOLAI_MIN_SENTENCE_LENGTH", "10"))
    max_sentence_length: int = int(os.environ.get("ZOLAI_MAX_SENTENCE_LENGTH", "5000"))
    min_zolai_density: float = float(os.environ.get("ZOLAI_MIN_ZOLAI_DENSITY", "0.3"))
    dedup_similarity: float = float(os.environ.get("ZOLAI_DEDUP_SIMILARITY", "0.85"))


@dataclass
class AppConfig:
    """Top-level configuration."""

    paths: Paths = field(default_factory=Paths)
    crawler: CrawlerConfig = field(default_factory=CrawlerConfig)
    cleaner: CleanerConfig = field(default_factory=CleanerConfig)
    api_host: str = os.environ.get("ZOLAI_API_HOST", "127.0.0.1")
    api_port: int = int(os.environ.get("ZOLAI_API_PORT", "8300"))
    gui_theme: str = os.environ.get("ZOLAI_GUI_THEME", "dark")


# Load .env if present
try:
    from dotenv import load_dotenv

    _env_file = _TOOLKIT_ROOT / ".env"
    if _env_file.exists():
        load_dotenv(_env_file, override=False)  # don't override already-set env vars
except ImportError:
    pass

# Global config instance
config = AppConfig()
