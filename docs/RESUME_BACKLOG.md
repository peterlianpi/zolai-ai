# Zolai-AI — Resume & Backlog

Single source of truth for **what's done**, **what remains**, and **how to resume**
this project from any fresh session. Open this file first.

---

## Current state (2026-09-04)

**Monorepo:** `/home/peter/Documents/Projects/zolai-ai/zolai-ai`  
**Branch:** `main` (HEAD `647e700`)  
**Version:** `2.0.0` (pyproject + __init__ + package.json — all consistent)  
**Org workspace:** `/home/peter/Documents/Projects/zolai-ai/` (9 repos)  
**Org:** [github.com/Zolai-AI](https://github.com/Zolai-AI)  
**Origin:** `peterlianpi/zolai-ai` · **Org remote:** `Zolai-AI/zolai-ai`

### Quick resume commands
```bash
cd /home/peter/Documents/Projects/zolai-ai/zolai-ai
source .venv/bin/activate
python -m pytest tests/ -q                    # expect 38 passed
python scripts/kg/smoke_test.py               # expect PASS 3/3
python -c "import zolai; print(zolai.__version__)"  # expect 2.0.0
ruff check zolai/ --ignore E501,E402,F401,I001,E741,E701,E722,W291,W293,F841,F821
```

### Seven-file context set (ground truth at session start)
| File | Purpose |
|------|---------|
| `context/project-overview.md` | Product, goals, scope |
| `context/architecture.md` | Stack, boundaries, invariants |
| `context/code-standards.md` | Python/TS conventions, lint, commit style |
| `context/project-setup.md` | Bootstrap + lifecycle |
| `context/ui-context.md` | Web theme/components/routes |
| `context/progress-tracker.md` | Running log of decisions + phases |
| `context/ai-workflow-rules.md` | Agent behavior + orchestration rules |

---

## Completed work (this session)

### Org migration (peterlianpi → Zolai-AI)
- Created org `Zolai-AI`; created 9 public repos: `.github`, `zolai-ai` (monorepo mirror), `zolai-ai.github.io`, `zolai-core`, `zolai-datasets`, `zolai-tauri`, `zolai-training`, `zolai-web`, `zolai-wiki`
- Org profile (profile README at `.github/profile/README.md`, existing `logo.png`, topics on all repos, metadata/description)
- Monorepo synced to both remotes; all component repos cloned to workspace and on `main`

### Org Pages site (`zolai-ai.github.io`) — live
- Created `Zolai-AI/zolai-ai.github.io` with animated landing page (`index.html` + `logo.png`)
- Published at `https://zolai-ai.github.io/` — HTTP 200, brand theme, animations, `prefers-reduced-motion`
- Org `blog` set to the live URL

### P-Core-Orchestra adoption (monorepo)
- Confirmed seven-file `context/` set; updated `AGENTS.md` to P-Core authoring standard
- Version reconciled to **2.0.0** across `pyproject.toml`, `zolai/__init__.py`, `package.json`; added `CHANGELOG.md`
- Added P-Core-orchestra scripts: `scripts/init-context.sh`, `scripts/session-claims.sh`, `scripts/update-free-models.sh` (all executable)

### Versioning alignment (component repos)
- Added `CHANGELOG.md` to all 6 code components; reconciled `zolai-web` package.json `0.1.0 → 2.0.0`
- Pushed: core, tauri, datasets, training, wiki

### Backlog C — Prediction lookup API ✅ DONE
- New `zolai/api/prediction_api.py` (APIRouter prefix `/predictions`)
- Endpoints: `GET/POST /predictions/next`, `/predictions/completions`, `/predictions/corrections`, `GET /predictions/health`
- Wired into running app via `tools.py.include_router`
- 14 tests in `tests/test_prediction_api.py` — all pass
- Commit: `647e700 feat(api): add prediction lookup endpoints (Backlog C)`

### Storage cleanup
- Cleaned workspace `__pycache__`, `.pytest_cache`, `.ruff_cache`, `logs/`, `tmp/` (~1G)
- Cleaned global safe package caches: `uv` (1.7G), `go-build` (1.3G), `pre-commit` (376M), `pip` (371M), `huggingface` (88M), `node-gyp` (65M) — total ~5.3G freed
- Remaining large caches are user browser/runtime (Chrome 1G, Playwright 646M) — safe to keep unless desperate

---

## Remaining / open backlog

### Backlog D — Dataset export (NOT started)
**Goal:** expose the bilingual corpora/datasets via `zolai-datasets` for export to HuggingFace Hub and Kaggle.

**Where to start:**
1. Review `zolai-datasets/` contents + any existing export scripts in `scripts/` (look at `scripts/crawlers/`, `scripts/training/`).
2. Add a CLI/script or API to package a given corpus into HF-compatible format (`datasets.DatasetDict`), upload via `huggingface_hub`.
3. Add Kaggle dataset metadata JSON + `kaggle datasets create` integration.
4. Store HF/Kaggle dataset URLs in `zolai-datasets/README.md` or `docs/`.

### Backlog E — Zolai RAG assistant (NOT started)
**Goal:** a conversational assistant that consumes the Knowledge Brain (retrieval + n-gram prediction) as context for Zolai Q&A.

**Where to start:**
1. Build on Backlog C (prediction API) + existing retrieval (`zolai/knowledge/retrieve.py`).
2. Add an assistant endpoint in `zolai/api/` (e.g. `POST /assistant/chat`) that takes a user query, retrieves top-k context chunks, formats them (via `format_context()`), injects as system prompt, and calls an LLM (or uses a local model).
3. Decide LLM backend: OpenRouter free models, local GGUF, or hybrid.
4. Add tests via TestClient; optional: add a CLI `scripts/assistant_chat.py` for interactive use.

### Backlog F — Monorepo root restructure (deferred / advisory)
The root still has ~30+ entries. A more aggressive restructure (e.g. grouping `scripts/` subfolders, moving loose docs into `docs/`, isolating runtime dirs like `logs/` `tmp/` `artifacts/` under a single `runtime/`) could reduce clutter further. This was partially attempted in this session but was reverted to keep `zolai/` at root (parents[N] path safety). Consider as a separate focused refactor with orchestra.

### Backlog G — `zolai-web` push unblock (owner-only)
The org-wide GH013 secret-scanning block prevents pushing to `Zolai-AI/zolai-web`. The clean snapshot is committed locally on `main` (0 generated files tracked). To unblock:
1. As org admin, enable Secret Scanning on `Zolai-AI/zolai-web` to reveal the detector token, **or** open the unblock URL:
   ```
   https://github.com/Zolai-AI/zolai-web/security/secret-scanning/unblock-secret/3IrYlPqjUCQX6d80auJXl9bJZuG
   ```
2. Then run: `git -C /home/peter/Documents/Projects/zolai-ai/zolai-web push origin main`

### Owner-only (GitHub UI) actions remaining
| Action | Where |
|--------|-------|
| Upload org avatar (`logo.png`) | Zolai-AI → Settings → Profile → Upload new picture |
| Pin 6 repos to org profile | org overview → Customize pins |
| Resolve org billing banner | org billing settings |
| Unblock `zolai-web` push | see Backlog G above |

---

## Data ownership reminder
- **Monorepo `zolai-ai` owns all heavy data** (`data/`, `wiki/`, `website/`, `.venv`, `node_modules`)
- Component repos are lightweight source clones (tracked files only) — mirror the org remotes
- To restore workspace: `cd Projects && git clone <repo>` each component, or move the monorepo in-place as described

---

## Scripts available
| Script | Purpose |
|--------|---------|
| `scripts/kg/smoke_test.py` | Knowledge Brain smoke test (wiki+pdf, 3 queries) |
| `scripts/init-context.sh` | Bootstrap/adapt seven-file context set |
| `scripts/session-claims.sh` | Concurrent session guard (claim/renew/release) |
| `scripts/update-free-models.sh` | Fetch free model list from upstream |
| `scripts/repo_bootstrap.sh` | Original bootstrap script |
