"""Zolai data cleaner — normalize, deduplicate, filter by quality."""
import hashlib
import json
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Dict, List, Optional, Set

from ..config import CleanerConfig, Paths
from ..shared.utils import ZolaiNormalizer, ZolaiRecord, is_zolai, read_jsonl, write_jsonl, zolai_density

log = logging.getLogger(__name__)


@dataclass
class CleanStats:
    """Statistics from a cleaning run."""
    input_count: int = 0
    output_count: int = 0
    rejected_short: int = 0
    rejected_low_quality: int = 0
    rejected_duplicate: int = 0
    rejected_not_zolai: int = 0
    normalized: int = 0
    errors: int = 0


class Deduplicator:
    """Content-based deduplication using content hashing."""

    def __init__(self):
        self._seen_hashes: Set[str] = set()
        self._similarity_cache: Dict[str, str] = {}

    def _hash(self, text: str) -> str:
        """Content hash for exact dedup."""
        normalized = re.sub(r'\s+', ' ', text.lower().strip())
        return hashlib.md5(normalized.encode()).hexdigest()

    def is_duplicate(self, text: str) -> bool:
        h = self._hash(text)
        if h in self._seen_hashes:
            return True
        self._seen_hashes.add(h)
        return False

    def load_existing(self, path: Path):
        """Pre-load hashes from existing file."""
        if not path.exists():
            return
        try:
            with open(path, 'r', encoding='utf-8') as f:
                for line in f:
                    try:
                        rec = json.loads(line)
                        text = rec.get("text", "")
                        self._seen_hashes.add(self._hash(text))
                    except (json.JSONDecodeError, KeyError):
                        pass
        except Exception:
            pass

    @property
    def seen_count(self) -> int:
        return len(self._seen_hashes)


class Cleaner:
    """Main data cleaner — normalize, filter, deduplicate."""

    def __init__(self, paths: Paths, config: CleanerConfig, log_callback: Optional[Callable] = None):
        self.paths = paths
        self.config = config
        self.log = log_callback or (lambda msg: log.info(msg))
        self.normalizer = ZolaiNormalizer()
        self.dedup = Deduplicator()

    def clean_record(self, record: ZolaiRecord) -> Optional[ZolaiRecord]:
        """Clean a single record. Returns None if rejected."""
        text = record.text.strip()

        # Length filter
        if len(text) < self.config.min_sentence_length:
            return None
        if len(text) > self.config.max_sentence_length:
            text = text[:self.config.max_sentence_length]

        # Zolai filter
        if not is_zolai(text, self.config.min_zolai_density):
            return None

        # Normalize
        text = self.normalizer.normalize(text)

        # Dedup
        if self.dedup.is_duplicate(text):
            return None

        # Update record
        record.text = text
        record.quality = zolai_density(text)
        return record

    def clean_file(self, input_path: Path, output_path: Path) -> CleanStats:
        """Clean a single JSONL file."""
        stats = CleanStats()
        records = read_jsonl(input_path)
        stats.input_count = len(records)

        self.dedup.load_existing(output_path)
        cleaned = []

        for rec in records:
            try:
                result = self.clean_record(rec)
                if result:
                    cleaned.append(result)
                    stats.normalized += 1
                else:
                    if len(rec.text) < self.config.min_sentence_length:
                        stats.rejected_short += 1
                    elif not is_zolai(rec.text):
                        stats.rejected_not_zolai += 1
                    else:
                        stats.rejected_duplicate += 1
            except Exception:
                stats.errors += 1

        write_jsonl(cleaned, output_path)
        stats.output_count = len(cleaned)
        return stats

    def clean_all(self) -> CleanStats:
        """Clean all raw data files."""
        raw_dir = self.paths.data_raw
        output_path = self.paths.data_cleaned / "cleaned_corpus.jsonl"
        combined_stats = CleanStats()

        # Pre-load existing dedup hashes
        self.dedup.load_existing(output_path)

        existing = read_jsonl(output_path) if output_path.exists() else []
        cleaned = list(existing)
        self.log(f"📂 Loaded {len(existing)} existing cleaned records")

        for fpath in sorted(raw_dir.glob("*.jsonl")):
            self.log(f"🧹 Cleaning: {fpath.name}")
            records = read_jsonl(fpath)
            combined_stats.input_count += len(records)

            for rec in records:
                try:
                    result = self.clean_record(rec)
                    if result:
                        cleaned.append(result)
                        combined_stats.normalized += 1
                    else:
                        combined_stats.rejected_not_zolai += 1
                except Exception:
                    combined_stats.errors += 1

        write_jsonl(cleaned, output_path)
        combined_stats.output_count = len(cleaned)

        # Write stats
        stats_path = self.paths.data_cleaned / "clean_stats.json"
        with open(stats_path, 'w') as f:
            json.dump({
                "input_count": combined_stats.input_count,
                "output_count": combined_stats.output_count,
                "rejected_short": combined_stats.rejected_short,
                "rejected_not_zolai": combined_stats.rejected_not_zolai,
                "rejected_duplicate": combined_stats.rejected_duplicate,
                "normalized": combined_stats.normalized,
                "errors": combined_stats.errors,
                "dataset_mb": round(output_path.stat().st_size / 1_048_576, 2) if output_path.exists() else 0,
            }, f, indent=2)

        self.log(f"✅ Cleaned: {combined_stats.output_count} records → {output_path.name}")
        return combined_stats
