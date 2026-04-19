"""Training data preparation — splits, export, format conversion."""
import json
import logging
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Callable, Optional, Tuple

from ..config import Paths
from ..shared.utils import ZolaiRecord, read_jsonl, write_jsonl

log = logging.getLogger(__name__)


@dataclass
class SplitConfig:
    train_ratio: float = 0.9
    val_ratio: float = 0.05
    test_ratio: float = 0.05
    seed: int = 42


class DatasetSplitter:
    """Split dataset into train/val/test sets."""

    def __init__(self, paths: Paths, config: Optional[SplitConfig] = None):
        self.paths = paths
        self.config = config or SplitConfig()

    def split(self, input_path: Optional[Path] = None) -> dict:
        """Split corpus into train/val/test."""
        input_path = input_path or self.paths.data_cleaned / "cleaned_corpus.jsonl"
        records = read_jsonl(input_path)

        if not records:
            log.warning("No records to split")
            return {"error": "no records"}

        random.seed(self.config.seed)
        random.shuffle(records)

        n = len(records)
        n_train = int(n * self.config.train_ratio)
        n_val = int(n * self.config.val_ratio)

        train = records[:n_train]
        val = records[n_train:n_train + n_val]
        test = records[n_train + n_val:]

        out_dir = self.paths.data_training
        out_dir.mkdir(parents=True, exist_ok=True)

        write_jsonl(train, out_dir / "train.jsonl")
        write_jsonl(val, out_dir / "val.jsonl")
        write_jsonl(test, out_dir / "test.jsonl")

        stats = {
            "total": n,
            "train": len(train),
            "val": len(val),
            "test": len(test),
            "seed": self.config.seed,
        }

        with open(out_dir / "split_stats.json", 'w') as f:
            json.dump(stats, f, indent=2)

        return stats

    def create_text_corpus(self, input_path: Optional[Path] = None):
        """Create plain text files for language model training."""
        input_path = input_path or self.paths.data_cleaned / "cleaned_corpus.jsonl"
        records = read_jsonl(input_path)
        out_dir = self.paths.data_training
        out_dir.mkdir(parents=True, exist_ok=True)

        # Full text corpus
        with open(out_dir / "corpus.txt", 'w', encoding='utf-8') as f:
            for rec in records:
                f.write(rec.text + '\n')

        # Character-level corpus (no spaces)
        with open(out_dir / "corpus_chars.txt", 'w', encoding='utf-8') as f:
            for rec in records:
                f.write(rec.text.replace(' ', '') + '\n')

        log.info(f"Created text corpora: {len(records)} records")
        return {"records": len(records)}


class DatasetExporter:
    """Export datasets to various formats."""

    def __init__(self, paths: Paths):
        self.paths = paths

    def to_huggingface_format(self, output_dir: Optional[Path] = None) -> Path:
        """Export in HuggingFace datasets-compatible format."""
        output_dir = output_dir or self.paths.data_training / "hf_format"
        output_dir.mkdir(parents=True, exist_ok=True)

        for split in ["train", "val", "test"]:
            src = self.paths.data_training / f"{split}.jsonl"
            if not src.exists():
                continue
            records = read_jsonl(src)

            # HuggingFace format: JSONL with text field
            dst = output_dir / f"{split}.jsonl"
            with open(dst, 'w', encoding='utf-8') as f:
                for rec in records:
                    f.write(json.dumps({"text": rec.text, "source": rec.source}, ensure_ascii=False) + '\n')

        return output_dir

    def to_kaggle_format(self, output_dir: Optional[Path] = None) -> Path:
        """Export for Kaggle competition format."""
        output_dir = output_dir or self.paths.data_training / "kaggle"
        output_dir.mkdir(parents=True, exist_ok=True)

        train = self.paths.data_training / "train.jsonl"
        if train.exists():
            records = read_jsonl(train)
            with open(output_dir / "train.csv", 'w', encoding='utf-8') as f:
                f.write("id,text,source\n")
                for i, rec in enumerate(records):
                    text = rec.text.replace('"', '""')
                    f.write(f'{i},"{text}","{rec.source}"\n')

        return output_dir
