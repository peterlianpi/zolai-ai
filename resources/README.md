# Resources

This folder is for **reusable, lightweight** project resources that are safe to keep in git:

- reference documentation (`.md`)
- small rule lists / mappings (`.json`, `.txt`)
- sample inputs / smoke-test fixtures (small)

Large corpora and datasets should remain outside git (see `.gitignore`) and be referenced via paths/env vars.

## What belongs here

- **Standard Zolai rule references** (human-readable explanations that match the code in `src/zolai/v9/standardizer.py`)
- **Source inventory**: what datasets exist, where they live, and how they map into Cleaned V* versions
- **Checklist**: how to run audit/clean commands and validate output

## Agent-friendly knowledge

For distilled knowledge extracted from raw sources (PDFs/books) into a format that agents can use safely, see:

- `resources/agent_knowledge/`

