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
