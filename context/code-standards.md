# Code Standards

## Python

- Target Python ≥3.10; format with `ruff` (config in `pyproject.toml`: line-length 120,
  selects E, F, W, I).
- Keep modules small and single-purpose; one module boundary per file.
- Fix root causes, do not layer workarounds.
- Validate unknown external input at system boundaries before trusting it.
- No overlap/duplication in `scripts/` — prefer grouping under the existing subfolders
  (crawlers, data_pipeline, training, maintenance, synthesis, deploy, dev, ui, server, pipelines).

## TypeScript / Next.js (website/zolai-project/)

- Strict mode required; avoid `any` — use explicit interfaces or narrowly scoped types.
- Default to server components; add `"use client"` only when browser interactivity requires it.
- Keep route handlers focused on a single responsibility.
- Prefer chained Hono methods; no loose `new Hono()` calls.
- No raw `fetch("/api/...")` in client components (project rules in `website/zolai-project/AGENTS.md`).

## Styling

- Use CSS tokens / shadcn theme; no hardcoded hex values.
- Follow the component system in `website/zolai-project/components.json`.

## API Routes

- Validate and parse request input before any logic runs.
- Enforce auth and ownership before any mutation.
- Return consistent, predictable response shapes.

## Data and Storage

- Metadata belongs in the database (Prisma).
- Large generated content belongs in file/blob storage or HF/Kaggle — never git.
- Corpora/datasets never committed; always mirror from HF Hub / Kaggle.

## File Organization

- `zolai/` — Run-time Python package (never in `scripts/`).
- `scripts/` — One-off + automation pipelines (run with `python scripts/...`).
- `website/` — Next.js platform (own AGENTS.md).
- `desktop/` — Tauri shell.
- `wiki/` — Knowledge base content.
- `docs/` — Documentation.
- `tests/` — `pytest` suite (testpaths = tests, files `test_*.py`).

## Security

- Never commit secrets, keys, or tokens; all from env / `.env`.
- `.env.example` carries only placeholder values.
- Do not write API keys into wiki, docs, or scripts.

## Commit Style

- Conventional commits (feat:, fix:, docs:, refactor:, chore:, security:).
- All changes land on `main`; `master` is the preserved archive.
