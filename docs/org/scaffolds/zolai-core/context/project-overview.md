# Zolai Core

Python package + FastAPI + CLI exposing the Zolai language toolkit: translation
(EN⇄Tedim Zolai), dictionary, chat, and RAG retrieval. The runtime dependency for
the web and desktop apps.

## Goals
1. Serve a stable REST API (translation, dictionary, chat) consumed by web + tauri.
2. Provide the `zolai` CLI for corpus/dictionary/training ops.
3. Keep all secrets in `.env`; no hardcoded keys.
4. Enforce ZVS 2018 orthography on all output.

## Boundaries
- Owns: `zolai/`, pyproject, tests, config, Docker, agents, skills.
- Consumes: wiki (RAG feed), datasets (HF/Kaggle).
