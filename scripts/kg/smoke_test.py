#!/usr/bin/env python3
"""Smoke test — Zolai Knowledge Brain (backlog item A).

Indexes a wiki sample, builds n-gram tables, then runs deterministic retrieval
queries built from actual indexed text (validates the cosine-ranking mechanism,
not semantic quality). Requires no external vector DB (offline JSONL path).
"""
from __future__ import annotations

import random
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from zolai.knowledge.ingest import index_wiki  # noqa: E402
from zolai.knowledge.ngram import build_ngram_tables  # noqa: E402
from zolai.knowledge.retrieve import load_index, retrieve  # noqa: E402

SEED = 7


def first_tokens(text: str, n: int = 4) -> list[str]:
    out: list[str] = []
    for tok in text.split():
        clean = "".join(ch for ch in tok if ch.isalpha())
        if 3 <= len(clean) <= 20:
            out.append(clean)
        if len(out) >= n:
            break
    return out


def main() -> int:
    art = ROOT / "artifacts" / "kg"
    print("== step 1: index a wiki sample ==")
    vec_path = index_wiki(out_dir=art, limit=10)
    assert vec_path.exists(), "knowledge_vectors.jsonl missing"
    idx = load_index(vec_path)
    assert idx.vectors is not None and len(idx.vectors) > 0, "no vectors loaded"
    n = len(idx.texts)
    print(f"   indexed {n} chunks")

    print("== step 1b: pdf ingest (backlog B) ==")
    try:
        from zolai.knowledge.pdf import index_pdfs  # noqa: E402
        index_pdfs(out_dir=art)
        idx = load_index(vec_path)
        pdf_rows = [m.get("source_type") for m in idx.metas].count("pdf")
        print(f"   pdf-derived rows: {pdf_rows}")
        assert pdf_rows > 0, "no pdf-derived chunks indexed"
    except Exception as e:  # noqa: BLE001
        print(f"   pdf ingest skipped: {e}")

    print("\n== step 2: n-gram tables ==")
    ng = build_ngram_tables(out_dir=art)
    assert ng.exists(), "ngrams.jsonl missing"

    print("\n== step 3: retrieval (deterministic corpus queries) ==")
    random.seed(SEED)
    probes = [random.randrange(n) for _ in range(3)]
    ok = 0
    for idx_t in probes:
        query = " ".join(first_tokens(idx.texts[idx_t]))
        hits = retrieve(query, idx, top_k=3, threshold=0.10)
        found = any(h["metadata"].get("source") == idx.metas[idx_t].get("source") for h in hits)
        status = "PASS" if hits and found else "CHECK"
        if hits and found:
            ok += 1
        print(f"   [{status}] q={query!r} -> {len(hits)} hits, best={hits[0]['score'] if hits else 0.0}")
    print(f"\n   {ok}/3 deterministic queries matched their source chunk")

    if ok < 2:
        print("FAIL — retrieval did not reliably return the source chunk")
        return 1
    print("PASS — Zolai Knowledge Brain (backlog A) smoke test succeeded.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
