#!/usr/bin/env python3
"""
Train a custom fastText language identification model for Tedim Zolai.

fastText's lid.176.bin does NOT include Tedim — this trains a binary classifier:
  __label__tedim  vs  __label__other

Usage:
    python scripts/maintenance/train_fasttext_lid.py
    python scripts/maintenance/train_fasttext_lid.py --test "Ka lawmna om hi"
"""
from __future__ import annotations

import argparse
import json
import random
import tempfile
from pathlib import Path

POSITIVE_SOURCE = Path("data/corpus/sentences_master_v1.jsonl")
NEGATIVE_SOURCES = [
    Path("data/corpus/news/rvasia_catholic_readings_v1.jsonl"),
]
OUTPUT_MODEL = Path("models/lid_tedim.bin")
MAX_SAMPLES = 100_000  # per class


def load_texts(path: Path, field: str = "text", limit: int = MAX_SAMPLES) -> list[str]:
    texts = []
    with path.open() as f:
        for line in f:
            if len(texts) >= limit:
                break
            try:
                obj = json.loads(line)
                text = obj.get(field, "").strip()
                if len(text) >= 20:
                    texts.append(text)
            except json.JSONDecodeError:
                continue
    return texts


def write_fasttext_file(positives: list[str], negatives: list[str], path: Path) -> None:
    lines = []
    for t in positives:
        lines.append(f"__label__tedim {t.replace(chr(10), ' ')}")
    for t in negatives:
        lines.append(f"__label__other {t.replace(chr(10), ' ')}")
    random.shuffle(lines)
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Train Tedim LID model")
    parser.add_argument("--test", help="Test a sentence against the trained model")
    parser.add_argument("--threshold", type=float, default=0.7)
    args = parser.parse_args()

    try:
        import fasttext
    except ImportError:
        print("Install fasttext: pip install fasttext-wheel")
        raise SystemExit(1)

    OUTPUT_MODEL.parent.mkdir(parents=True, exist_ok=True)

    if args.test:
        if not OUTPUT_MODEL.exists():
            print(f"Model not found at {OUTPUT_MODEL} — train first")
            raise SystemExit(1)
        model = fasttext.load_model(str(OUTPUT_MODEL))
        labels, probs = model.predict(args.test.replace("\n", " "), k=1)
        label = labels[0].replace("__label__", "")
        print(f"Label: {label}  Confidence: {probs[0]:.3f}")
        return

    print("Loading positive samples (Tedim)...")
    positives = load_texts(POSITIVE_SOURCE)
    print(f"  {len(positives):,} Tedim sentences")

    negatives: list[str] = []
    for src in NEGATIVE_SOURCES:
        if src.exists():
            neg = load_texts(src, limit=MAX_SAMPLES // len(NEGATIVE_SOURCES))
            negatives.extend(neg)
            print(f"  {len(neg):,} negative samples from {src.name}")

    if not negatives:
        print("WARNING: No negative samples found. Add sources to NEGATIVE_SOURCES.")
        raise SystemExit(1)

    # Balance classes
    n = min(len(positives), len(negatives))
    positives = random.sample(positives, n)
    negatives = random.sample(negatives, n)
    print(f"Training with {n:,} samples per class ({2*n:,} total)")

    with tempfile.NamedTemporaryFile(mode="w", suffix=".txt", delete=False) as tmp:
        train_path = Path(tmp.name)

    write_fasttext_file(positives[:int(n * 0.9)], negatives[:int(n * 0.9)], train_path)

    val_pos = positives[int(n * 0.9):]
    val_neg = negatives[int(n * 0.9):]
    val_path = train_path.with_suffix(".val.txt")
    write_fasttext_file(val_pos, val_neg, val_path)

    print("Training fastText LID model...")
    model = fasttext.train_supervised(
        input=str(train_path),
        epoch=25,
        wordNgrams=2,
        dim=64,
        lr=0.5,
        verbose=2,
    )

    result = model.test(str(val_path))
    print(f"Validation — N: {result[0]}, Precision: {result[1]:.3f}, Recall: {result[2]:.3f}")

    model.save_model(str(OUTPUT_MODEL))
    print(f"Model saved to {OUTPUT_MODEL}")

    train_path.unlink(missing_ok=True)
    val_path.unlink(missing_ok=True)


if __name__ == "__main__":
    main()
