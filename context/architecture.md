# Architecture Context

> Applies to the active branch `main`. `master` is the archived pre-overhaul history
> (see `docs/ARCHITECTURE.md` / README "Branch Layout"). Update this file whenever the
> stack, boundaries, or invariants change.

## Stack

| Layer      | Technology                                        | Role                                          |
| ---------- | ------------------------------------------------- | --------------------------------------------- |
| Core       | Python ≥3.10 + TypeScript (Next.js) + Rust (Tauri) | Language/toolkit monorepo                      |
| CLI        | Python `typer` (`zolai.cli.main`)                  | Crawl / clean / analyze / train / translate   |
| API        | FastAPI + Uvicorn (`zolai/api/server.py`)          | Translation + dictionary + chat HTTP service  |
| Web        | Next.js + Hono + Prisma (`website/zolai-project/`) | Learner platform, dictionary UI, chat, mind    |
| Desktop    | Tauri (Rust) — `desktop/src-tauri`                 | Bundled offline app with embedded server       |
| ML         | PyTorch + Transformers + PEFT/TRL (LoRA)           | Fine-tuning small Zolai LLMs                   |
| Vector/RAG | ChromaDB / FAISS (declared)                        | Retrieval-augmented generation, few-shot memory|
| Embeddings | sentence-transformers (`all-MiniLM-L6-v2`)         | Semantic scoring, retrieval index              |
| OCR        | Mistral OCR (`zolai/ocr/mistral_ocr.py`)           | Digitize scanned documents                     |
| Storage    | HuggingFace Hub + Kaggle (datasets), local FS      | Datasets are gitignored; served from HF/Kaggle |

## System Boundaries

- `zolai/` — Python package: analyzer, bible, cleaner, cli, crawler, dictionary,
  gui, ingest, manager, ocr, shared, trainer, utils, api.
- `scripts/` — One-off + recurring automation (crawlers, data_pipeline, training,
  maintenance, synthesis, deploy, dev, ui, server, pipelines, kg, mind, learning).
- `website/zolai-project/` — Next.js learner platform (separate AGENTS.md owns its rules).
- `desktop/` — Tauri desktop shell bundling the FastAPI server + Ollama GGUF.
- `wiki/` — Knowledge base: grammar, vocabulary (incl. `bible_context/` studies),
  curriculum, phrases; driving RAG context + training corpora.
- `data/` — **gitignored** local datasets/corpora (mirror from HuggingFace/Kaggle).
- `docs/` — Architecture, pipeline, deployment, security documentation.
- `context/` — P-Core six-file context (ground truth read by agents at session start).
- `agents/`, `skills/` — Agent definitions and specialized skills for pipeline work.

## Storage Model

- **HuggingFace Hub / Kaggle**: training data, adapters, fine-tuned models
  (e.g. `peterpausianlian/zolai-qwen-0.5b`, `.../zolai-adapter-qwen25-3b`).
- **Local filesystem (gitignored)**: `data/` corpora, `runs/` outputs, `artifacts/` reports,
  `logs/`.
- **SQLite (web)**: `website/zolai-project/prisma` schema (dictionary entries, curriculum,
  contributions); Prisma + Neon for managed Postgres in prod.
- **Vector store**: declared ChromaDB/FAISS index over wiki + parallel pairs for RAG.

## Auth and Access Model

- **CLI/API**: tokens read from environment / `.env` (never hardcoded) — `OPENROUTER_API_KEY`,
  `GEMINI_API_KEY`, `GROQ_API_KEY`, `NVIDIA_API_KEY`, `HF_TOKEN`.
- **Web**: Prisma-backed auth; admin areas guarded (admin/contributions, admin/n8n).
- **Secrets**: `.env` gitignored; `.env.example` holds placeholder keys only; credentials
  never committed.

## System Design & Infrastructure

| Concept             | Service / Tech                         | Notes                                        |
| ------------------- | -------------------------------------- | -------------------------------------------- |
| Compute             | Local + HF/Kaggle notebooks; AWS Lightsail (docs/SERVER_SETUP_GUIDE.md) | Serverless not primary |
| Database            | Prisma + SQLite (dev) / Neon Postgres (prod) | Web + API metadata        |
| Object Storage      | HuggingFace Hub, Kaggle, local FS      | Datasets, models, adapters                   |
| CDN                 | Vercel (website)                       | Static + serverless routes                   |
| Caching             | In-memory + Redis (optional)           | Dictionary/embedding cache                   |
| Queue / Async       | n8n (declared, remote MCP)             | Automation workflows                         |
| Rate Limiting       | Per-key throttle in FastAPI            | Guard LLM providers                          |
| Observability       | logs/ + artifacts/ reports + Sentry (planned) | Pipeline + API audit logs      |
| Search              | ChromaDB / FAISS vectors + FTS5 SQLite | RAG retrieval + dictionary FTS               |
| Streaming / Realtime| SSE / WS for chat                      | ChatPanel, MindMap3D                         |

## Scaling & Performance Constraints

- Training on T4x2 (LoRA FP16 r=16) and QLoRA NF4 r=8 for 3B; target 5.1M-pair dataset.
- RAG semantic threshold: cosine similarity > 0.85 for accepted translations.
- Data growth: bible 31K pairs, dictionary 21K entries; mirrored to HF/Kaggle to keep repo small.

## Invariants

1. Request handlers must not run long-lived background training in-process.
2. Secrets are always loaded from env/`.env`; never hardcoded or committed.
3. Large datasets/models never live in git — always HF/Kaggle mirrors.
4. Language output follows ZVS 2018 orthography (Tedim Zolai) unless explicitly notated.
5. All file/system changes land on `main`; `master` is the preserved archive.
