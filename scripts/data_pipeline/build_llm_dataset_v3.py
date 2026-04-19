#!/usr/bin/env python3
"""
Convert master_source_v1.jsonl → llm_train/val/test format for Kaggle training.

Monolingual  → {"text": "<zolai>"}
Parallel     → {"text": "Translate to English: <zolai>\n<english>"}  (and reverse)
Dictionary   → {"text": "Define: <zolai>\n<english>"}
Wordlist     → {"text": "<zolai> — <english>"}
Phrase       → {"text": "<zolai>"}

Splits: 90% train / 5% val / 5% test  (shuffled, seeded)
Output: data/training/llm_train_v3.jsonl, llm_val_v3.jsonl, llm_test_v3.jsonl
"""
from __future__ import annotations

import json
import random
import re
import unicodedata
from pathlib import Path

SRC   = Path("data/master_source_v1.jsonl")
OUT   = Path("data/training")
SEED  = 42

FORBIDDEN = re.compile(
    r"\b(pathian|fapa|bawipa|siangpahrang)\b|\bram\b|\bcu\b|\bcun\b",
    re.IGNORECASE,
)
ENCODING_NOISE = re.compile(r"â€|Ã[\x80-\xBF]|Â")


def clean(text: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFKC", text)).strip()


def to_text(obj: dict) -> str | None:
    zo  = clean(obj.get("zolai", ""))
    en  = clean(obj.get("english", ""))
    typ = obj.get("type", "monolingual")

    if not zo or len(zo) < 10:
        return None
    if ENCODING_NOISE.search(zo) or FORBIDDEN.search(zo):
        return None

    if typ == "parallel" and en:
        return f"Translate to English: {zo}\n{en}"
    elif typ == "dictionary" and en:
        return f"Define: {zo}\n{en}"
    elif typ == "wordlist" and en:
        return f"{zo} — {en}"
    else:
        return zo  # monolingual / phrase / fallback


def main() -> None:
    print(f"Reading {SRC} ...", flush=True)
    records: list[str] = []
    seen: set[str] = set()
    skipped = 0

    with SRC.open() as f:
        for i, line in enumerate(f):
            obj = json.loads(line)
            text = to_text(obj)
            if text is None:
                skipped += 1
                continue
            key = text[:120]
            if key in seen:
                skipped += 1
                continue
            seen.add(key)
            records.append(json.dumps({"text": text,
                                       "source": obj.get("source", ""),
                                       "type":   obj.get("type", ""),
                                       "dialect": obj.get("dialect", "Tedim")},
                                      ensure_ascii=False))
            if (i + 1) % 500_000 == 0:
                print(f"  {i+1:,} processed, {len(records):,} kept...", flush=True)

    print(f"Total kept: {len(records):,}  |  Skipped: {skipped:,}")

    random.seed(SEED)
    random.shuffle(records)

    n      = len(records)
    n_val  = int(n * 0.05)
    n_test = int(n * 0.05)

    splits = {
        OUT / "llm_train_v3.jsonl": records[n_val + n_test:],
        OUT / "llm_val_v3.jsonl":   records[:n_val],
        OUT / "llm_test_v3.jsonl":  records[n_val:n_val + n_test],
    }

    OUT.mkdir(parents=True, exist_ok=True)
    for path, lines in splits.items():
        with path.open("w") as f:
            for l in lines:
                f.write(l + "\n")
        print(f"  {path.name}: {len(lines):,} records")

    print("Done.")


if __name__ == "__main__":
    main()
