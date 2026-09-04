#!/usr/bin/env python3
"""Smoke test — n-gram prediction functions (Backlog C).

Loads real artifacts/kg/ngrams.jsonl and runs deterministic offline
checks for load_ngram_tables, predict_next, predict_completion,
and suggest_corrections. No external services required.
"""
from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from zolai.knowledge.ngram import (
    load_ngram_tables,
    predict_completion,
    predict_next,
    suggest_corrections,
)

PASS_COUNT = 0
FAIL_COUNT = 0


def check(name: str, condition: bool) -> None:
    global PASS_COUNT, FAIL_COUNT
    if condition:
        PASS_COUNT += 1
        print(f"   [PASS] {name}")
    else:
        FAIL_COUNT += 1
        print(f"   [FAIL] {name}")


def main() -> int:
    print("== n-gram prediction smoke test (Backlog C) ==")

    # 1. load_ngram_tables with missing path returns empty dicts
    tables = load_ngram_tables("nonexistent/path/ngrams.jsonl")
    check("missing path returns empty dicts", tables == {"unigrams": {}, "bigrams": {}})

    # 2. load_ngram_tables with real file loads data
    real = load_ngram_tables(str(ROOT / "artifacts" / "kg" / "ngrams.jsonl"))
    check("real ngrams.jsonl loads unigrams", len(real.get("unigrams", {})) > 0)
    check("real ngrams.jsonl loads bigrams", len(real.get("bigrams", {})) > 0)

    # 3. predict_next returns at least 1 result for "khi"
    results = predict_next("khi", top_k=5, tables=real)
    check("predict_next('khi') returns >=1 result", len(results) >= 1)
    if results:
        check("predict_next result is (str, int) tuple", isinstance(results[0], tuple) and len(results[0]) == 2)

    # 4. predict_completion returns completions for "le"
    completions = predict_completion("le", top_k=5, tables=real)
    check("predict_completion('le') returns results", len(completions) >= 1)
    if completions:
        check("predict_completion result is (str, float) tuple", isinstance(completions[0], tuple) and len(completions[0]) == 2)

    # 5. suggest_corrections returns similar words for "khi"
    corrections = suggest_corrections("khi", top_k=3, tables=real)
    check("suggest_corrections('khi') returns >=1 result", len(corrections) >= 1)
    if corrections:
        check("suggest_corrections result is (str, int) tuple", isinstance(corrections[0], tuple) and len(corrections[0]) == 2)

    # 6. Empty tables produce empty results
    empty_results = predict_next("test", top_k=5, tables={"unigrams": {}, "bigrams": {}})
    check("empty tables -> predict_next returns []", empty_results == [])

    empty_completions = predict_completion("test", top_k=5, tables={"unigrams": {}, "bigrams": {}})
    check("empty tables -> predict_completion returns []", empty_completions == [])

    empty_corrections = suggest_corrections("test", top_k=3, tables={"unigrams": {}, "bigrams": {}})
    check("empty tables -> suggest_corrections returns []", empty_corrections == [])

    # 7. Missing word in tables still works (fallback)
    missing = predict_next("zzzzzzzzz", top_k=3, tables=real)
    # Should either return empty or fall back to top unigrams — just check it's a list
    check("missing word returns list", isinstance(missing, list))

    print(f"\n   {PASS_COUNT} passed, {FAIL_COUNT} failed")
    if FAIL_COUNT > 0:
        print("FAIL — n-gram prediction smoke test failed.")
        return 1
    print("PASS — n-gram prediction smoke test succeeded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
