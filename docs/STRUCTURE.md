# Zolai Repo Structure

> Canonical layout reference — verified against the real filesystem.
> **Dated:** 2026-09-04 · Supersedes `docs/PROJECT_STRUCTURE.md` and `docs/ROOT_STRUCTURE.md`.

---

## Repo-root tree

```
zolai/                                          # repo root
├── AGENTS.md                                   # root agent contract (P-Core orchestra)
├── CONTRIBUTING.md                             # contribution stub
├── GEMINI.md                                   # Gemini CLI context
├── LICENSE
├── README.md
├── ROADMAP.md
├── SECURITY.md
├── TODO.md
├── docker-compose.yml
├── docker-compose.prod.yml  # untracked/local
├── Dockerfile
├── .dockerignore
├── .env.example
├── .gitignore
├── .cursorignore  # untracked/local
├── .ignore  # untracked/local
├── run_api.py
├── package.json
├── pyproject.toml
├── requirements.txt
├── .git/
├── .github/                                    # CI / workflow files
├── .cursor/                                    # cursor config
├── .venv / .venv_zolai / .kiro / .ruff_cache / .vscode / .gemini  # local-only (untracked)
├── .api_pid
├── kaggle_dataset/                             # Kaggle notebook upload artifacts
├── kaggle_notebook_upload/
├── path/
├── zolai/                                      # main Python package
│   ├── analyzer/
│   ├── api/                                    # FastAPI server (server.py, pipeline.py, tools.py)
│   ├── bible/
│   ├── cleaner/
│   ├── cli/
│   ├── crawler/
│   ├── config.py
│   ├── dictionary/
│   ├── gui/
│   ├── ingest/
│   ├── knowledge/                              # Knowledge Brain (ingest, ngram, pdf, retrieve)
│   │   ├── __init__.py
│   │   ├── ingest.py
│   │   ├── ngram.py
│   │   ├── pdf.py
│   │   └── retrieve.py
│   ├── manager/
│   ├── ocr/
│   ├── shared/
│   ├── trainer/
│   ├── utils/
│   ├── __init__.py
│   └── README.md
├── scripts/                                    # one-off / automation pipelines
│   ├── bible/
│   ├── cleaner/
│   ├── crawlers/
│   ├── data/
│   ├── data_pipeline/
│   ├── deploy/
│   ├── dev/
│   ├── dictionary/
│   ├── kg/                                     # knowledge-graph / embedding smoke tests
│   ├── learning/
│   ├── maintenance/
│   ├── mind/
│   ├── pipelines/
│   ├── server/
│   ├── synthesis/
│   ├── training/
│   ├── ui/
│   └── wiki/
├── website/                                    # Next.js learner platform
│   └── zolai-project/                          # Next.js app + Prisma schema
├── desktop/                                    # Tauri shell (bundled server + Ollama GGUF)
├── wiki/                                       # knowledge base (grammar, vocab, curriculum, phrases)
├── data/                                       # **gitignored** — datasets/corpora (HF/Kaggle mirrors)
│   ├── adapter/
│   ├── archive/
│   ├── ARCHIVE_MANIFEST.json
│   ├── clean/
│   ├── corpus/
│   ├── DATA_INDEX.md
│   ├── DATASET_MANIFEST.json
│   ├── dictionary/
│   ├── eval/
│   ├── exports/
│   ├── master_source_v1.jsonl
│   ├── parallel/
│   ├── qwen/
│   ├── raw/
│   ├── README.md
│   ├── runs/
│   ├── SOURCES.md
│   └── tmp_processing/
├── docs/                                       # documentation
│   ├── archive/
│   ├── guides/
│   ├── index/
│   ├── learning/
│   ├── logs/
│   ├── org/
│   ├── prompts/
│   ├── reports/
│   ├── specs/
│   ├── templates/
│   ├── ZOLAI_AI_ARCHITECTURE.md
│   ├── ZOLAI_GITHUB_ORG_PLAN.md
│   ├── ZOLAI_KAGGLE_OPENCLAW_GUIDE.md
│   ├── ZOLAI_KNOWLEDGE_BRAIN_ARCHITECTURE.md
│   ├── ZOLAI_LINGUISTIC_MANDATE.md
│   ├── ZOLAI_RAG_AI_ARCHITECTURE.md
│   ├── REPO_SPLIT_BLUEPRINT.md
│   ├── WIKI_ENRICHMENT_GUIDE.md
│   ├── DATA_NAMING_GUIDE.md
│   ├── DATA_NAMING_QUICK_REF.md
│   ├── DATA_IMPROVEMENT_PLAN.md
│   ├── DATA_AUDIT.md
│   ├── DATASETS.md
│   ├── LOGS_AND_TMP.md
│   ├── SERVER_SETUP_GUIDE.md
│   ├── MODELS.md
│   ├── wiki_dictionary_reconciliation.md
│   └── README.md
├── context/                                    # P-Core seven-file context set
│   ├── ai-workflow-rules.md
│   ├── architecture.md
│   ├── code-standards.md
│   ├── project-overview.md
│   ├── project-setup.md
│   ├── ui-context.md
│   ├── progress-tracker.md
│   └── specs/
├── agents/                                     # agent definitions
├── skills/                                     # skill modules
├── tests/                                      # **currently only README.md placeholder** (no pytest suite yet)
├── config/                                     # configuration files
│   ├── cpu_optimization.yaml
│   ├── env/
│   ├── __init__.py
│   ├── machine.py
│   ├── nginx/
│   ├── package-lock.json
│   ├── README.md
│   ├── ssh/
│   ├── tools-setup.md
│   ├── training_config.json
│   ├── uv.lock
│   ├── zolai-chat.service
│   └── zolai_qwen_7b_lora.yaml
├── artifacts/                                  # reports & analysis (gitignored: artifacts/kg/)
├── logs/                                       # application logs (gitignored)
├── tmp/                                        # temporary files (gitignored)
└── notebooks/                                  # Jupyter notebooks
```

---

## Key directories in detail

### `zolai/` — Python package

Single-purpose modules. `knowledge/` implements the Zolai Knowledge Brain (O(n) heading chunking, all-MiniLM-L6-v2 embeddings, offline cosine retrieval, unigram/bigram n-gram prediction).

### `scripts/` — Automation pipelines

Organised by function (crawlers, data_pipeline, deploy, dev, dictionary, kg, learning, maintenance, mind, pipelines, server, synthesis, training, ui, wiki) plus `bible/`, `cleaner/`, `data/`, and `wiki/` helper directories.

### `docs/` — Documentation

Architecture, guides, prompts, reports, specs, templates, plus the seven-file context (`context/`). Subdirectories: `archive/`, `guides/`, `index/`, `learning/`, `logs/`, `org/`, `prompts/`, `reports/`, `specs/`, `templates/`.

### `context/` — P-Core seven-file context

The ground-truth agent contract: `ai-workflow-rules.md`, `architecture.md`, `code-standards.md`, `project-overview.md`, `project-setup.md`, `ui-context.md`, `progress-tracker.md`, plus a `specs/` subdirectory.

### `data/` — **gitignored** datasets

Mirrored from HuggingFace Hub / Kaggle; never committed. Real subdirs verified on disk: `adapter/`, `archive/`, `clean/`, `corpus/`, `dictionary/`, `eval/`, `exports/`, `parallel/`, `qwen/`, `raw/`, `runs/`, `tmp_processing/`.

### `tests/` — test placeholder

Contains only `tests/README.md`. The pytest suite is **not yet populated**.

### `config/` — configuration

Holds `cpu_optimization.yaml`, `training_config.json`, `uv.lock`, `package-lock.json`, `nginx/`, `ssh/`, `env/`, service files, and helper scripts.

---

## Gitignored / untracked local-only directories

These are **not committed** to git:

| Path | Why |
|------|-----|
| `data/` | Datasets mirrored from HF/Kaggle |
| `artifacts/` | Generated reports; `artifacts/kg/` vector/n-gram artifacts |
| `logs/` | Application logs |
| `tmp/` | Temporary files |
| `.venv/`, `.venv_zolai/` | Python virtual environments |
| `.cursor/` | Cursor config |
| `.kiro/` | Kiro CLI settings |
| `.ruff_cache/` | Ruff linter cache |
| `.vscode/` | VS Code settings |
| `.gemini/` | Gemini CLI cache |
| `node_modules/` | NPM dependencies (website) |
| `.api_pid` | Runtime PID file |

---

## Date stamp

**2026-09-04** — reconciled with actual filesystem layout; supersedes `PROJECT_STRUCTURE.md` (2026-04-20) and `ROOT_STRUCTURE.md` (2026-04-16).
