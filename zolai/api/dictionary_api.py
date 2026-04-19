"""
api/dictionary_api.py
---------------------
FastAPI dictionary lookup server for Zolai master_dictionary_semantic.jsonl

Endpoints:
  GET /search?q=...&dir=zo-en|en-zo|both   — search by word
  GET /word/{zolai}                          — exact ZO lookup
  GET /english/{english}                     — exact EN lookup
  GET /random                                — random entry
  GET /stats                                 — corpus stats
  GET /health                                — health check

Run:
  uvicorn api.dictionary_api:app --reload --port 8765
"""
from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

# ── Load dictionary at startup ─────────────────────────────────────────────
DICT_PATH = Path(__file__).parent.parent / "data/processed/master_dictionary_semantic.jsonl"

records: list[dict] = []
zo_index: dict[str, dict] = {}   # zolai → record
en_index: dict[str, dict] = {}   # english.lower() → record

def load_dictionary() -> None:
    global records, zo_index, en_index
    records = [json.loads(l) for l in open(DICT_PATH, encoding="utf-8")]
    zo_index = {r["zolai"].lower(): r for r in records}
    en_index = {r["english"].lower(): r for r in records}

load_dictionary()

# ── App ────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="Zolai Dictionary API",
    description="Tedim Zolai ↔ English dictionary with corpus examples, synonyms, antonyms, and usage notes.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# ── Helpers ────────────────────────────────────────────────────────────────
def _trim(r: dict, full: bool = True) -> dict:
    """Return full or summary view of a record."""
    if full:
        return r
    return {
        "zolai":   r["zolai"],
        "english": r["english"],
        "pos":     r["pos"],
        "accuracy": r["accuracy"],
    }

def _fuzzy_search(query: str, direction: str, limit: int) -> list[dict]:
    q = query.lower().strip()
    results = []

    if direction in ("zo-en", "both"):
        # Exact match first
        if q in zo_index:
            results.append(zo_index[q])
        # Prefix match
        for key, rec in zo_index.items():
            if key != q and key.startswith(q) and rec not in results:
                results.append(rec)
                if len(results) >= limit: break
        # Substring match
        if len(results) < limit:
            for key, rec in zo_index.items():
                if q in key and rec not in results:
                    results.append(rec)
                    if len(results) >= limit: break

    if direction in ("en-zo", "both"):
        if q in en_index and en_index[q] not in results:
            results.append(en_index[q])
        for key, rec in en_index.items():
            if key != q and key.startswith(q) and rec not in results:
                results.append(rec)
                if len(results) >= limit: break
        if len(results) < limit:
            for key, rec in en_index.items():
                if q in key and rec not in results:
                    results.append(rec)
                    if len(results) >= limit: break

    return results[:limit]

# ── Routes ─────────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "entries": len(records)}

@app.get("/stats")
def stats():
    confirmed  = sum(1 for r in records if r["accuracy"] == "confirmed")
    with_syns  = sum(1 for r in records if r.get("synonyms"))
    with_ants  = sum(1 for r in records if r.get("antonyms"))
    with_rels  = sum(1 for r in records if r.get("related"))
    with_exs   = sum(1 for r in records if r.get("examples"))
    pos_counts: dict[str, int] = {}
    for r in records:
        pos_counts[r["pos"]] = pos_counts.get(r["pos"], 0) + 1
    return {
        "total_entries":    len(records),
        "confirmed":        confirmed,
        "with_synonyms":    with_syns,
        "with_antonyms":    with_ants,
        "with_related":     with_rels,
        "with_examples":    with_exs,
        "pos_distribution": dict(sorted(pos_counts.items(), key=lambda x: -x[1])[:10]),
    }

@app.get("/search")
def search(
    q:     str            = Query(..., description="Search term"),
    dir:   str            = Query("both", description="zo-en | en-zo | both"),
    limit: int            = Query(10, ge=1, le=50),
    full:  bool           = Query(True, description="Return full entry or summary"),
):
    if dir not in ("zo-en", "en-zo", "both"):
        raise HTTPException(400, "dir must be zo-en, en-zo, or both")
    results = _fuzzy_search(q, dir, limit)
    return {
        "query":   q,
        "dir":     dir,
        "count":   len(results),
        "results": [_trim(r, full) for r in results],
    }

@app.get("/word/{zolai}")
def get_by_zolai(zolai: str):
    r = zo_index.get(zolai.lower())
    if not r:
        raise HTTPException(404, f"'{zolai}' not found in Zolai index")
    return r

@app.get("/english/{english}")
def get_by_english(english: str):
    r = en_index.get(english.lower())
    if not r:
        raise HTTPException(404, f"'{english}' not found in English index")
    return r

@app.get("/random")
def get_random(pos: Optional[str] = Query(None, description="Filter by POS: n, v, adj, adv")):
    pool = [r for r in records if not pos or r["pos"].lower() == pos.lower()]
    if not pool:
        raise HTTPException(404, "No entries match filter")
    return random.choice(pool)
