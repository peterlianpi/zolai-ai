# Zolai Project Structure (Final)

```
zolai/                          # Root directory
├── zolai/                      # Main Python package
│   ├── utils/                  # Device & data utilities
│   ├── cli/                    # CLI commands
│   ├── api/                    # FastAPI server
│   ├── analyzer/               # Analysis modules
│   ├── cleaner/                # Data cleaning
│   ├── trainer/                # Training modules
│   └── ...                     # Other modules
│
├── scripts/                    # All scripts (organized)
│   ├── crawlers/              # Web scrapers
│   ├── data_pipeline/         # Data processing
│   ├── training/              # Training scripts
│   ├── maintenance/           # Cleanup & validation
│   ├── synthesis/             # Instruction synthesis
│   ├── deploy/                # Deployment
│   ├── dev/                   # Test files
│   ├── ui/                    # Chat UI & menu
│   ├── server/                # Server scripts
│   └── pipelines/             # Data pipelines
│
├── data/                    # Gitignored — download from HuggingFace Hub
│   ├── corpus/                # Source corpora (bible, news, synthetic, hymns)
│   ├── dictionary/            # Dictionary data (raw, processed, wordlists)
│   ├── parallel/              # Parallel ZO↔EN translation pairs
│   ├── training/              # Ready-to-train datasets + snapshots
│   ├── db/                    # SQLite databases (FTS5, legacy)
│   ├── runs/                  # Training run outputs
│   ├── eval/                  # Evaluation datasets (ZVS, translation, QA)
│   ├── archive/               # Superseded data (versioned snapshots)
│   ├── exports/               # Exported datasets
│   ├── adapter/               # LoRA adapter files
│   ├── raw/                   # Raw scraped data + OCR output
│   ├── logs/                  # Crawl logs, pipeline progress, state files
│   └── fbdata/                # Facebook data
│
├── docs/                       # Documentation
│   ├── guides/               # All guides & references
│   ├── logs/                 # Build/extraction logs
│   └── prompts/              # Prompt templates
│
├── website/                    # Next.js web app
│   ├── zolai-project/        # Main app
│   └── prisma/               # Database schema
│
├── wiki/                       # Knowledge base
│   ├── grammar/              # Grammar rules
│   ├── curriculum/           # Learning curriculum
│   ├── vocabulary/           # Vocabulary lists
│   ├── biblical/             # Biblical references
│   └── ...                   # Other topics
│
├── agents/                     # Agent definitions
│   ├── zomi-data/
│   ├── zomi-trainer-bot/
│   └── ...
│
├── skills/                     # Skill modules
│   ├── data-cleaner/
│   ├── model-trainer/
│   └── ...
│
├── artifacts/                  # Reports & analysis
│   ├── graph/                # Graphs & visualizations
│   └── archives/             # Archive files
│
├── config/                     # Configuration
│   ├── env/                  # Environment files (.env)
│   ├── cpu_optimization.yaml # CPU training config
│   ├── nginx/                # Nginx config
│   ├── ssh/                  # SSH config
│   ├── uv.lock               # UV lock file
│   └── package-lock.json     # NPM lock file
│
├── tests/                      # Test suite
├── notebooks/                  # Jupyter notebooks
├── teams/                      # Team definitions
├── node_modules/               # NPM dependencies
│
├── .gitignore                  # Git ignore rules
├── README.md                   # Main documentation
├── schema.md                   # Database schema
├── pyproject.toml              # Python project config
├── package.json                # NPM config
├── requirements.txt            # Python dependencies
└── .env.example                # Example environment file
```

## Directory Organization

### Core Development
- `zolai/` — Main Python package (CLI, API, modules)
- `scripts/` — All scripts organized by function
- `tests/` — Test suite
- `config/` — Configuration files

### Data & Storage
- `data/` — All datasets (master, processed, raw, history, db, runs)
- `artifacts/` — Reports, graphs, archives
- `notebooks/` — Jupyter notebooks

### Documentation & Knowledge
- `docs/` — All guides, references, logs, prompts
- `wiki/` — Knowledge base (grammar, curriculum, vocabulary, etc.)

### Web & Deployment
- `website/` — Next.js app + Prisma schema
- `agents/` — Agent definitions
- `skills/` — Skill modules
- `teams/` — Team definitions

### Root Files (Essential Only)
- `.gitignore` — Git configuration
- `README.md` — Main documentation
- `pyproject.toml` — Python project config
- `package.json` — NPM config
- `requirements.txt` — Python dependencies
- `schema.md` — Database schema

## Statistics

- **Total Size:** ~30GB
- **Data:** ~25GB (corpus, dictionary, parallel, training, db, runs, eval, adapter)
- **Scripts:** ~150 Python files (organized in 10+ categories)
- **Agents:** 28 agent definitions
- **Skills:** 40 skill modules
- **Root Directories:** 14 (clean, organized)
- **Root Files:** 6 (essential only)

## Key Improvements

✅ **Consolidated:** Package (zolai/), Data (data/), Scripts (scripts/)
✅ **Organized:** All root files moved to appropriate directories
✅ **Documented:** Guides, references, logs in docs/
✅ **Optimized:** CPU-only machine (4 cores, 7.7GB RAM)
✅ **Validated:** All checks passing

---
**Last Updated:** 2026-04-20 | **Status:** ✅ Complete
