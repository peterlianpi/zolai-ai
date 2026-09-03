# Split Repo Scaffolds

Pre-generated per-component six-file context sets for the future `zolai-ai` org.
These are **reference templates** — review, then promote to real repos (Phase B).

## Contents

| Folder | Target repo | Type |
|--------|-------------|------|
| `zolai-core/` | core (REST/CLI/RAG) | python |
| `zolai-web/` | web (Next.js platform) | node (web-aware ui-context) |
| `zolai-tauri/` | tauri (offline desktop) | rust |
| `zolai-datasets/` | datasets (HF/Kaggle) | data |
| `zolai-training/` | training (LoRA/QLoRA) | python |
| `zolai-wiki/` | wiki (knowledge base) | wiki |

Each contains `AGENTS.md`, the six-file `context/` set (+ `specs/`), and `CONNECT.md`
(provides/depends referencing the connection matrix).

## How to promote

1. Regenerate from the live monorepo: `bash scripts/repo_bootstrap.sh <root> "<name>" <type>`.
2. `git filter-repo` carve the relevant subtree from `main` into the target repo.
3. Copy this scaffold's `context/` + `AGENTS.md` + `CONNECT.md` over placeholders.
4. Add CI/hooks (pcore-orchestra), push to `zolai-ai` org, link in README/connect matrix.

See `docs/REPO_SPLIT_BLUEPRINT.md` for the phasing and connection matrix.
