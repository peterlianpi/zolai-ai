# Zolai Core Package

The main Python package — CLI, API, and all processing modules.

## Structure

| Module | Purpose |
|--------|---------|
| `cli/` | CLI commands (`zolai` entrypoint) |
| `api/` | FastAPI server |
| `analyzer/` | Text analysis modules |
| `cleaner/` | Data cleaning and normalization |
| `trainer/` | Training pipeline modules |
| `crawler/` | Web crawling utilities |
| `dictionary/` | Dictionary lookup and management |
| `bible/` | Bible corpus processing |
| `ingest/` | Data ingestion pipeline |
| `ocr/` | OCR processing |
| `utils/` | Device detection, streaming utilities |
| `shared/` | Shared types and helpers |
| `manager/` | Pipeline orchestration |
| `gui/` | GUI utilities |

## Install

```bash
pip install -e .
pip install -e ".[dev]"
```

## CLI Usage

```bash
zolai standardize-jsonl -i INPUT -o OUTPUT [--dedupe] [--min-chars N]
zolai audit-jsonl -i INPUT [--text-field FIELD]
```

## Branch Layout

- **`main`** — active development branch (changes land here).
- **`master`** — preserved archive of the pre-overhaul history; do not commit.

## Context Set

Read the six-file `context/` set at session start (ground truth):
`project-overview`, `architecture`, `code-standards`, `project-setup`,
`ui-context`, `progress-tracker`. Root `AGENTS.md` holds the agent contract.

## API

FastAPI server lives in `zolai/api/server.py`. Run with:

```bash
uvicorn zolai.api.server:app  # add --reload for dev
```

RAG/vector architecture: `docs/ZOLAI_RAG_AI_ARCHITECTURE.md`.
