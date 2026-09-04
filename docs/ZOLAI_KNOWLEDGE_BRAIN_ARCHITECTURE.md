# Zolai Knowledge Brain — RAG-First Architecture (No Raw Fine-Tuning)

> **Strategy (user directive):** We do **NOT** raw-train a Zolai model. Instead we
> build a **RAG/embeddings-first "knowledge brain"** over all MD + PDF sources, and
> existing general-purpose AIs consume that Zolai knowledge as injected context.

## Pipeline (source → knowledge → assistant)

```
MD (wiki/*.md, 1529 files) ─┐
PDF (data/corpus/ocr/*.pdf) ─┼─► [1 INGEST]  chunk by heading/topic + OCR
dict_master_v2.json ────────┤
wordlists/*.tsv (67K) ──────┘
        │
        ▼
[2 EXTRACT]  sentences · words · grammar rules · usages · n-gram prediction
        │
        ▼
[3 EMBED]   all-MiniLM-L6-v2 → vector store (ChromaDB/FAISS)
        │
        ▼
[4 RETRIEVE] query API (cosine ≥ 0.85, top-k, source metadata)
        │
        ├──► [5 ASSISTANT]  website/app/desktop embed retrieved Zolai
        │        knowledge into existing AI context (RAG) — no training
        │
        └──► [6 EXPORT]  zolai-datasets repo (HF/Kaggle) dataset export
```

## Components

| # | Layer | Status | Where |
|---|-------|--------|-------|
| 1 | MD+PDF ingest, chunking, OCR | ✅ wiki ingest + **PDF OCR-markdown ingest (backlog B)** | `zolai/knowledge/ingest.py`, `zolai/knowledge/pdf.py` |
| 2 | Sentence/word/grammar/n-gram extraction | Partial | `wiki/vocabulary`, `dict_master_v2.json` |
| 3 | Embeddings → **vector index** | ✅ done (offline JSONL + optional ChromaDB) | `zolai/knowledge/ingest.py` |
| 4 | **Retrieval query API** | ✅ done (offline cosine) | `zolai/knowledge/retrieve.py` |
| 5 | Zolai AI assistant (RAG context into existing AI) | Future | website/app/desktop |
| 6 | **Dataset export** (HF/Kaggle via zolai-datasets) | **MISSING** | future repo |

## Design decisions
- **Embeddings, not fine-tuning:** retrieved Zolai chunks become RAG context for
  existing models (OpenRouter/Gemini/Groq/NVIDIA keys in `.env`).
- **Vector store:** ChromaDB (declared) — persistent local, optional FAISS for scale.
- **Metadata schema** per chunk: `{id, text, source, source_type(md/pdf/wordlist/dict),
  chunk_type(word/sentence/grammar/usage), wiki_path, heading, cefr, embedding_dim}`.
- **Prediction layer:** n-gram + frequency tables extracted from sentence corpus &
  wordlists → expose for word-prediction / sentence-structure suggestions.
- **Organize/usages:** chunk_type + heading tagging lets the assistant answer
  "arrange & usage" questions with retrieved grammar + example sentences.

## Backlog (ordered, `main`)
A. ~~Vector index writer + retrieval API~~ **DONE (this session):** `zolai/knowledge/` (ingest/retrieve/ngram), offline-ready JSONL cosine retrieval (skip ChromaDB when offline), n-gram prediction tables, passing `scripts/kg/smoke_test.py`. Replaces the broken `scripts/kg/ingest_wiki.py` (which emitted a single record with no newline bytes).
B. ~~PDF OCR ingest into same vector store~~ **DONE (this session):** `zolai/knowledge/pdf.py` scans `data/corpus/ocr/*/*/markdown.md` (existing OCR outputs) and embeds them as `source_type=pdf` into the same index; `extract_pdf_text()` uses Mistral OCR when a `MISTRAL_API_KEY` is set, else a local pypdf/pdfplumber reader. Documented + images.
C. Prediction/n-gram extraction + lookup.
D. Dataset export interface (zolai-datasets).
E. Assistant: website/app/desktop RAG integration.

Ground-truth files: `context/architecture.md`, `context/project-overview.md`,
`context/progress-tracker.md`. Invariants: local-only vectors gitignored; secrets
from `.env`; datasets/models on HF/Kaggle, never git.
