# Gentehna Tuamtuam le A Deihnate — distilled reference

## What this source is

A structured collection of **short stories / parables (“gentehna”)** plus an explicit **“A Deihna”** (the takeaway).

Use it for:

- high-quality, coherent Zolai prose for training/eval samples
- building “style” fixtures (short passages that should remain stable after standardization)
- spotting recurring spelling/spacing variants in real narrative text

## Useful structure for agents

Each entry tends to follow this pattern:

- **Title / number**
- **A Thugil**: category label (e.g., *Lungsim limlangh*, *Kingaihsutna*, *Lungsim Kikepna*)
- Body text (story)
- **A Deihna**: moral / takeaway

This makes it suitable for downstream tasks like:

- extracting paragraphs as standalone samples
- creating eval prompts: “Given story → summarize A Deihna”

## How to use safely for “fix and improve”

For dataset hygiene, prefer:

- run baseline normalization via `standardize_zolai()` (keeps meaning intact)
- avoid “rewriting” sentences unless you have an explicit fix list

If you discover consistent variants:

- add deterministic rules in `src/zolai/v9/standardizer.py`, or
- record specific before/after examples into a structured fix list under `resources/agent_knowledge/`

