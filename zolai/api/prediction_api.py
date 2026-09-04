"""Prediction lookup API endpoints — Backlog C.

Reuses zolai.knowledge.ngram functions (load_ngram_tables, predict_next,
predict_completion, suggest_corrections) without modification.
"""
from __future__ import annotations

from fastapi import APIRouter, Query
from pydantic import BaseModel

from zolai.knowledge.ngram import (
    load_ngram_tables,
    predict_completion,
    predict_next,
    suggest_corrections,
)

router = APIRouter(prefix="/predictions", tags=["predictions"])


# ── Response models ──────────────────────────────────────────────────

class NextWordPrediction(BaseModel):
    next: str
    count: int


class NextWordResponse(BaseModel):
    word: str
    predictions: list[NextWordPrediction]


class CompletionPrediction(BaseModel):
    completion: str
    score: float


class CompletionsResponse(BaseModel):
    prefix: str
    completions: list[CompletionPrediction]


class Correction(BaseModel):
    candidate: str
    distance: int


class CorrectionsResponse(BaseModel):
    word: str
    corrections: list[Correction]


class HealthResponse(BaseModel):
    status: str
    tables_loaded: bool
    unigram_count: int
    bigram_count: int


# ── Helpers ──────────────────────────────────────────────────────────

def _tables() -> dict:
    return load_ngram_tables()


# ── Endpoints ────────────────────────────────────────────────────────

@router.get("/next", response_model=NextWordResponse)
@router.post("/next", response_model=NextWordResponse)
async def next_word(
    word: str = Query(...),
    top_k: int = Query(5, ge=1, le=20),
):
    """Predict the most likely next word after `word`."""
    tables = _tables()
    results = predict_next(word, top_k=top_k, tables=tables)
    predictions = [NextWordPrediction(next=n, count=c) for n, c in results]
    return NextWordResponse(word=word, predictions=predictions)


@router.get("/completions", response_model=CompletionsResponse)
@router.post("/completions", response_model=CompletionsResponse)
async def completions(
    prefix: str = Query(...),
    top_k: int = Query(5, ge=1, le=20),
):
    """Generate word completions for a prefix."""
    tables = _tables()
    results = predict_completion(prefix, top_k=top_k, tables=tables)
    completions = [
        CompletionPrediction(completion=c, score=s) for c, s in results
    ]
    return CompletionsResponse(prefix=prefix, completions=completions)


@router.get("/corrections", response_model=CorrectionsResponse)
@router.post("/corrections", response_model=CorrectionsResponse)
async def corrections(
    word: str = Query(...),
    top_k: int = Query(3, ge=1, le=10),
):
    """Suggest spelling corrections for `word`."""
    tables = _tables()
    results = suggest_corrections(word, top_k=top_k, tables=tables)
    corrections = [
        Correction(candidate=c, distance=d) for c, d in results
    ]
    return CorrectionsResponse(word=word, corrections=corrections)


@router.get("/health", response_model=HealthResponse)
async def health():
    """Health check — report whether n-gram tables are loaded."""
    tables = _tables()
    unis = tables.get("unigrams", {})
    bigrams = tables.get("bigrams", {})
    loaded = bool(unis or bigrams)
    status = "ok" if loaded else "no_tables"
    return HealthResponse(
        status=status,
        tables_loaded=loaded,
        unigram_count=len(unis),
        bigram_count=len(bigrams),
    )
