# AGENTS.md — Zolai Kaggle Workspace

## Build / Install / Run Commands

```bash
pip install -e .                     # Editable install (zolai CLI entrypoint)
pip install -r requirements.txt      # Core ML deps (datasets, transformers, peft, torch, jupyter)
```

**CLI commands:**
```bash
zolai standardize-jsonl -i INPUT -o OUTPUT [--dedupe] [--min-chars N] [--keep-empty]
zolai audit-jsonl -i INPUT [--text-field FIELD]
python zolai_menu.py                 # Interactive menu for all scripts/commands
```

**Standalone scripts:**
```bash
python scripts/fetch_tongdot_dictionary.py --input FILE --output FILE [--resume] [--sleep SECS]
python scripts/build_tongdot_search_words.py --input FILE --output FILE
python scripts/export_full_sources.py [--repo-root PATH] [--lines-per-part N]
python scripts/export_all_zolai_sources.py [--overwrite]
python scripts/export_all_linguistics_sources.py [--ocr] [--overwrite]
```

**Notebooks:** Located in `notebooks/` — designed for Kaggle execution.

## Testing

No formal test suite exists. Validate changes by:
1. Running the affected script/notebook end-to-end with a small sample
2. Checking output JSONL validity: `python -c "import json; [json.loads(l) for l in open('output.jsonl')]"`
3. Verifying UTF-8 integrity and no truncated fragments (lowercase-end check)

## Code Style Guidelines

### General
- **Line length:** ~120 chars max
- **Encoding:** Strictly valid UTF-8; no truncated fragments
- **Formatting:** No auto-formatter configured; follow existing file conventions

### Imports
- Every file starts with `from __future__ import annotations`
- Order: stdlib → third-party → local (with blank line between groups)
- Prefer `import X` over `from X import *`

### Types
- Use type hints on all function signatures and class attributes
- Prefer `list[str]` over `List[str]` (PEP 585 style, enabled by `__future__` import)
- Use `dataclass` for structured data (stats, config, paths)

### Naming
- `snake_case` for functions, variables, modules
- `PascalCase` for classes
- `UPPER_SNAKE_CASE` for constants
- Prefix private helpers with underscore: `_heartbeat()`, `_finalize_result()`

### Formatting
- Double quotes (`"`) preferred for strings; single quotes acceptable in f-strings
- 4-space indentation (no tabs)
- Trailing commas in multi-line dicts/lists

### Error Handling
- Broad `except Exception:` acceptable in data pipelines for robustness
- Always log or print error context; never silently swallow
- Use `raise SystemExit(main())` for script entry points
- Use `argparse` with sensible defaults for all CLI scripts

### Path Handling
- Prefer `pathlib.Path` over `os.path` for new code
- Use `Path(...).mkdir(parents=True, exist_ok=True)` before writing
- Check `path.exists()` before reading

### JSONL Processing
- Stream line-by-line for large files (never load entire file into memory)
- Use `json.dumps(..., ensure_ascii=False, indent=2)` for human-readable output
- Use `hashlib.md5(text.encode("utf-8")).hexdigest()` for deduplication

### Progress Visibility
- Use heartbeat pattern with flush for long-running operations:
  ```python
  sys.stdout.write(msg); sys.stdout.flush()
  ```
- Write progress to a log file alongside stdout for resumability

### Kaggle-Specific
- First cell: internet check + consolidated `pip install`
- Use `os.environ[...]` or `%env` over shell `export` in notebook cells
- Default to single GPU (`CUDA_VISIBLE_DEVICES=0`); use `USE_DDP_2GPU` for multi-GPU
- Pin deps: `pandas<3`, `matplotlib<3.10.1`; avoid `pip install -U`
- Resolve HF datasets via `ZOLOAI_DATASET_SRC` env var

## Project Structure

```
src/zolai/          # Core Python package (CLI, standardizer, paths)
scripts/            # Standalone utility scripts
notebooks/          # Jupyter notebooks (Kaggle-first)
data/               # Small fixtures and word lists
resources/          # Reference docs, grammar sheets, agent knowledge
references/         # Large source PDFs/MD (git-ignored)
Zolai Cleaned*/     # Dataset outputs (git-ignored)
```

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `ZOLOAI_REPO_ROOT` | Override default repo root for path resolution |
| `ZOLOAI_DATASET_SRC` | Resolve HuggingFace dataset sources |
| `CUDA_VISIBLE_DEVICES` | GPU selection (default: `0`) |
| `USE_DDP_2GPU` | Enable multi-GPU distributed training |

## Package Structure

```
src/zolai/
  __init__.py       # Package init
  cli.py            # CLI entrypoint (zolai command)
  paths.py          # Central path management (RepoPaths dataclass)
  commands/         # Subcommand implementations
  v9/               # V9 pipeline standardizer + blacklist filters
```

## Key Conventions

### Dataclass Usage
- Use `@dataclass` for stats, config, and path objects
- Use `@dataclass(frozen=True)` for immutable config/path objects
- Include `to_dict()` method when serialization is needed

### CLI Pattern
- Use `argparse` with subparsers for multiple commands
- Entry point: `def main(argv: list[str] | None = None) -> int`
- Exit via: `raise SystemExit(main())`
- Return `0` on success, non-zero on failure

### File I/O
- Always specify `encoding="utf-8"` explicitly
- Use generators (`yield`) for streaming large files
- Never load entire JSONL/CSV files into memory

### Notebook Conventions
- First cell: internet connectivity check + consolidated pip install
- Use `%env` magic for environment variables in cells
- Pin dependency versions; avoid `pip install -U`
- Default to single GPU; use env vars for multi-GPU

## Git Notes

- Large outputs in `Zolai Cleaned*/` and `references/` are git-ignored
- Commit only source code, configs, and small data fixtures
- Do not commit generated outputs or model checkpoints
