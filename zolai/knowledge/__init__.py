"""Zolai Knowledge Brain — pure-Python RAG layer (embeddings-first, no fine-tuning).

Modules:
  ingest  : chunk wiki/*.md (+ optional txt) into newline-delimited JSONL with embeddings
  retrieve: cosine retrieval over the JSONL index (no external vector DB required)
  ngram   : word-frequency + bigram prediction tables from wordlists/dictionary

Primary artifact layout (gitignored, local-only):
  artifacts/kg/*.jsonl   — indexed knowledge chunks + embeddings + ngram tables
"""
from .ingest import index_pdfs, index_wiki
from .ngram import (
    build_ngram_tables,
    load_ngram_tables,
    predict_completion,
    predict_next,
    suggest_corrections,
)
from .retrieve import load_index, retrieve

__all__ = [
    "index_wiki",
    "index_pdfs",
    "extract_pdf_text",
    "iter_ocr_markdown",
    "load_index",
    "retrieve",
    "build_ngram_tables",
    "load_ngram_tables",
    "predict_next",
    "predict_completion",
    "suggest_corrections",
]
