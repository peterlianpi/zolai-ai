# Agent knowledge (distilled)

Goal: keep **agent-friendly** versions of key Zolai reference materials so you (or an agent CLI) can:

- look up spelling/orthography conventions
- maintain a growing “known fixes” list (words/sentences)
- keep standardization rules consistent with `src/zolai/v9/standardizer.py`

## What goes here

- **Knowledge notes**: concise Markdown with rules, patterns, and examples
- **Fix lists**: small, structured tables (TSV/JSONL) safe for git
- **Source index**: which original documents the knowledge was distilled from

## What does NOT go here

- Raw PDFs or large corpora. Those stay in ignored folders (e.g. `Linguistics/`) and are referenced from `references/`.

## Files

- `sources_index.md`: index of sources and where their distilled notes live
- `zolai_sinna.md`: distilled notes for `Zolai_Sinna.pdf` (lesson structure + how to use it as reference)

