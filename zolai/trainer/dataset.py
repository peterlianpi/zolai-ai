"""Dataset building and training preparation."""

import json
import logging
import random

from ..config import config
from ..shared.utils import read_jsonl, write_jsonl

log = logging.getLogger(__name__)


class DatasetBuilder:
    """Build and manage training datasets."""

    def __init__(self):
        self.paths = config.paths

    def build_splits(self, val_ratio: float = 0.02, test_ratio: float = 0.01, seed: int = 42) -> dict:
        """Build train/val/test splits from cleaned data."""
        # Find cleaned corpus
        candidates = [
            self.paths.data_cleaned / "cleaned_corpus.jsonl",
            self.paths.data_cleaned / "zolai_cleaned_sentences.jsonl",
            self.paths.data_cleaned / "zolai_unified.jsonl",
        ]
        input_path = None
        for c in candidates:
            if c.exists():
                input_path = c
                break

        if input_path is None:
            # Search in subdirectories
            for f in self.paths.data_cleaned.glob("**/*.jsonl"):
                input_path = f
                break

        if input_path is None:
            return {"error": "no cleaned data found", "searched": [str(c) for c in candidates]}

        records = read_jsonl(input_path)
        if not records:
            return {"error": "empty file", "path": str(input_path)}

        random.seed(seed)
        random.shuffle(records)

        n = len(records)
        n_val = max(1, int(n * val_ratio))
        n_test = max(1, int(n * test_ratio))
        n_train = n - n_val - n_test

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
            "source": str(input_path.name),
            "seed": seed,
        }

        with open(out_dir / "split_stats.json", "w") as f:
            json.dump(stats, f, indent=2)

        log.info("Splits built: %s", stats)
        return stats

    def prepare_training(self) -> dict:
        """Prepare training data from cleaned corpus."""
        return self.build_splits()

    def export_jsonl(self) -> dict:
        """Export to HuggingFace-compatible JSONL format."""
        hf_dir = self.paths.data_training / "hf_format"
        hf_dir.mkdir(parents=True, exist_ok=True)

        exported = 0
        for split in ["train", "val", "test"]:
            src = self.paths.data_training / f"{split}.jsonl"
            if not src.exists():
                continue
            records = read_jsonl(src)
            dst = hf_dir / f"{split}.jsonl"
            with open(dst, "w", encoding="utf-8") as f:
                for rec in records:
                    text = rec.text if hasattr(rec, "text") else str(rec)
                    source = rec.source if hasattr(rec, "source") else "unknown"
                    f.write(json.dumps({"text": text, "source": source}, ensure_ascii=False) + "\n")
            exported += len(records)

        log.info("Exported %d records to %s", exported, hf_dir)
        return {"exported": exported, "path": str(hf_dir)}
