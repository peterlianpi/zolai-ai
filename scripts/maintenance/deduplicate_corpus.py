#!/usr/bin/env python3
"""
MinHash LSH near-duplicate deduplication for Zolai corpus.

Removes near-duplicate documents (Jaccard similarity > threshold).
Also performs exact deduplication via SHA-256.

Usage:
    python scripts/maintenance/deduplicate_corpus.py \
        --input data/corpus/corpus_master_v1.jsonl \
        --output data/corpus/corpus_master_clean_v1.jsonl \
        --field text \
        --threshold 0.8

    # Dry run (stats only, no output written):
    python scripts/maintenance/deduplicate_corpus.py --input ... --dry-run
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path


def get_shingles(text: str, k: int = 5) -> set[str]:
    """Character k-gram shingles for MinHash."""
    text = text.lower()
    return {text[i : i + k] for i in range(len(text) - k + 1)}


def main() -> None:
    parser = argparse.ArgumentParser(description="Deduplicate JSONL corpus")
    parser.add_argument("--input", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--field", default="text")
    parser.add_argument("--threshold", type=float, default=0.8,
                        help="Jaccard similarity threshold for near-dup removal")
    parser.add_argument("--num-perm", type=int, default=128,
                        help="Number of MinHash permutations")
    parser.add_argument("--dry-run", action="store_true",
                        help="Print stats only, do not write output")
    args = parser.parse_args()

    try:
        from datasketch import MinHash, MinHashLSH
    except ImportError:
        print("Install datasketch: pip install datasketch")
        sys.exit(1)

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"Input not found: {input_path}")
        sys.exit(1)

    print(f"Reading {input_path} ...")
    docs: list[tuple[str, str]] = []  # (text, raw_line)
    with input_path.open() as f:
        for i, line in enumerate(f):
            line = line.strip()
            if not line:
                continue
            try:
                obj = json.loads(line)
                text = obj.get(args.field, "").strip()
                if text:
                    docs.append((text, line))
            except json.JSONDecodeError:
                continue
            if (i + 1) % 100_000 == 0:
                print(f"  Read {i+1:,} lines...")

    total_input = len(docs)
    print(f"Total documents: {total_input:,}")

    # Stage 1: Exact deduplication
    print("Stage 1: Exact deduplication (SHA-256)...")
    seen_hashes: set[str] = set()
    exact_deduped: list[tuple[str, str]] = []
    for text, line in docs:
        h = hashlib.sha256(text.encode()).hexdigest()
        if h not in seen_hashes:
            seen_hashes.add(h)
            exact_deduped.append((text, line))

    exact_removed = total_input - len(exact_deduped)
    print(f"  Removed {exact_removed:,} exact duplicates ({exact_removed/total_input*100:.1f}%)")
    print(f"  Remaining: {len(exact_deduped):,}")

    # Stage 2: Near-duplicate detection (MinHash LSH)
    print(f"Stage 2: MinHash LSH near-duplicate removal (threshold={args.threshold})...")
    lsh = MinHashLSH(threshold=args.threshold, num_perm=args.num_perm)
    keep_flags = [True] * len(exact_deduped)

    for i, (text, _) in enumerate(exact_deduped):
        if (i + 1) % 10_000 == 0:
            print(f"  Processing {i+1:,}/{len(exact_deduped):,}...")
        m = MinHash(num_perm=args.num_perm)
        for shingle in get_shingles(text):
            m.update(shingle.encode())
        key = f"doc_{i}"
        try:
            result = lsh.query(m)
            if result:
                keep_flags[i] = False
            else:
                lsh.insert(key, m)
        except Exception:
            lsh.insert(key, m)

    near_dup_removed = sum(1 for k in keep_flags if not k)
    final_docs = [line for (_, line), keep in zip(exact_deduped, keep_flags) if keep]

    print(f"  Removed {near_dup_removed:,} near-duplicates ({near_dup_removed/len(exact_deduped)*100:.1f}%)")
    print(f"  Final count: {len(final_docs):,}")
    print(f"  Total reduction: {total_input - len(final_docs):,} ({(total_input - len(final_docs))/total_input*100:.1f}%)")

    if args.dry_run:
        print("Dry run — no output written.")
        return

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with output_path.open("w") as f:
        for line in final_docs:
            f.write(line + "\n")
    print(f"Written to {output_path}")


if __name__ == "__main__":
    main()
