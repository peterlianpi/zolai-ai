# Zolai Sinna (distilled reference)

## What this source is

This reference is structured as a lesson-style text (“Sinna *n*”), with front matter and an alphabet section.

Use it as a **reference** for:

- example sentences and short passages (copy/paste candidates for training or test fixtures)
- vocabulary and orthography patterns that should be standardized consistently
- building a “known fixes” list when you find systematic typos/variants

## Table of contents (quick index)

From the PDF header:

- **ABC laimal Zolai sinna**
- **Roman Alphabet laimal te Zolai sinna**
- **Sinna 1 … Sinna 27** (lesson series)

If you want to jump to lesson content quickly, search for:

- `Sinna 1`
- `Sinna 2`
- …
- `Sinna 27`

## How to use this in the project

- When you discover a consistent spelling variant that should be normalized:
  - add the deterministic rule into `src/zolai/v9/standardizer.py`, **or**
  - add a targeted mapping into a future fix list under `resources/agent_knowledge/` (word/sentence fixes)
  - then re-run `python zolai_cli.py standardize-jsonl ...` on the affected JSONL and re-audit.

## Notes for agents

When an agent is asked to “fix/improve Zolai text”, prefer:

- using `standardize_zolai()` for baseline normalization
- adding minimal, deterministic transformations (avoid context-sensitive “creative” rewrites)
- validating via `audit-jsonl` on a representative sample

