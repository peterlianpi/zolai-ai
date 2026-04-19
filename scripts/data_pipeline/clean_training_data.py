#!/usr/bin/env python3
"""
Clean llm_train/val/test.jsonl for Zolai training.

Drops:
  - ### prefix noise (9.5%)
  - Encoding artifacts: â€, Ã (0.2%)
  - Forbidden dialect words: pathian, fapa, bawipa, siangpahrang, ram, cu, cun (3.2%)
  - FCL / HCL06 dialect records (3.7%)
  - Exact duplicates

Fixes:
  - Normalizes dialect field (tedim → Tedim, Tedim_Chin → Tedim)
  - Backfills missing source_type as "corpus"

Usage:
    python scripts/data_pipeline/clean_training_data.py
    python scripts/data_pipeline/clean_training_data.py --dry-run
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import unicodedata
from pathlib import Path

FORBIDDEN = re.compile(
    r"\b(pathian|fapa|bawipa|siangpahrang)\b|\bram\b|\bcu\b|\bcun\b",
    re.IGNORECASE,
)
ENCODING_NOISE = re.compile(r"â€|Ã[\x80-\xBF]|Â")
BAD_DIALECTS = {"FCL", "HCL06"}


def clean_record(obj: dict) -> dict | None:
    text = obj.get("text", "").strip()

    if text.startswith("###") or text.startswith("[INST]"):
        return None
    if ENCODING_NOISE.search(text):
        return None
    if FORBIDDEN.search(text):
        return None

    dialect = obj.get("dialect", "")
    if dialect in BAD_DIALECTS:
        return None

    # Normalize
    text = unicodedata.normalize("NFKC", text)
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) < 20:
        return None

    obj["text"] = text
    # Fix dialect casing
    if dialect.lower() == "tedim" or dialect == "Tedim_Chin":
        obj["dialect"] = "Tedim"
    # Backfill missing source_type
    if not obj.get("source_type"):
        obj["source_type"] = "corpus"

    return obj


def clean_file(src: Path, dst: Path, dry_run: bool) -> dict:
    seen: set[str] = set()
    stats: dict[str, int] = {
        "total": 0, "hash_noise": 0, "encoding": 0,
        "dialect_bad": 0, "dedup": 0, "kept": 0,
    }
    out_lines: list[str] = []

    with src.open() as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            stats["total"] += 1
            try:
                obj = json.loads(line)
            except json.JSONDecodeError:
                continue

            text = obj.get("text", "")
            # Track reason (order matters — first match wins for stats)
            if text.startswith("###") or text.startswith("[INST]"):
                stats["hash_noise"] += 1
                continue
            if ENCODING_NOISE.search(text):
                stats["encoding"] += 1
                continue
            if FORBIDDEN.search(text) or obj.get("dialect") in BAD_DIALECTS:
                stats["dialect_bad"] += 1
                continue

            cleaned = clean_record(obj)
            if cleaned is None:
                continue

            h = hashlib.sha256(cleaned["text"].encode()).hexdigest()
            if h in seen:
                stats["dedup"] += 1
                continue
            seen.add(h)

            out_lines.append(json.dumps(cleaned, ensure_ascii=False))
            stats["kept"] += 1

    if not dry_run:
        dst.parent.mkdir(parents=True, exist_ok=True)
        with dst.open("w") as f:
            for l in out_lines:
                f.write(l + "\n")

    return stats


def report(name: str, s: dict) -> None:
    t = s["total"] or 1
    print(f"\n── {name} ──")
    print(f"  Input:           {s['total']:>10,}")
    print(f"  ### noise:       {s['hash_noise']:>10,}  ({s['hash_noise']/t*100:.1f}%)")
    print(f"  Encoding noise:  {s['encoding']:>10,}  ({s['encoding']/t*100:.1f}%)")
    print(f"  Dialect/FCL:     {s['dialect_bad']:>10,}  ({s['dialect_bad']/t*100:.1f}%)")
    print(f"  Exact dups:      {s['dedup']:>10,}  ({s['dedup']/t*100:.1f}%)")
    removed = s["total"] - s["kept"]
    print(f"  Total removed:   {removed:>10,}  ({removed/t*100:.1f}%)")
    print(f"  ✅ Output:        {s['kept']:>10,}  ({s['kept']/t*100:.1f}%)")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    base = Path("data/training")
    pairs = [
        (base / "llm_train.jsonl", base / "llm_train_clean_v2.jsonl"),
        (base / "llm_val.jsonl",   base / "llm_val_clean_v2.jsonl"),
        (base / "llm_test.jsonl",  base / "llm_test_clean_v2.jsonl"),
    ]

    for src, dst in pairs:
        if not src.exists():
            print(f"Skipping {src.name} (not found)")
            continue
        print(f"Cleaning {src.name}...", flush=True)
        stats = clean_file(src, dst, args.dry_run)
        report(src.name, stats)
        if not args.dry_run:
            print(f"  → {dst}")

    if args.dry_run:
        print("\n[dry-run] No files written.")


if __name__ == "__main__":
    main()
