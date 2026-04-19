# Zolai Root Structure (Final)

## Visual Tree

```
zolai/
├── 📦 CORE DEVELOPMENT
│   ├── zolai/                    Main Python package
│   │   ├── utils/               Device & data utilities
│   │   ├── cli/                 CLI commands
│   │   ├── api/                 FastAPI server
│   │   ├── analyzer/            Analysis modules
│   │   ├── cleaner/             Data cleaning
│   │   ├── trainer/             Training modules
│   │   └── ...                  Other modules
│   ├── scripts/                 All scripts (127 Python files)
│   │   ├── crawlers/            Web scrapers
│   │   ├── data_pipeline/       Data processing
│   │   ├── training/            Training scripts
│   │   ├── maintenance/         Cleanup & validation
│   │   ├── synthesis/           Instruction synthesis
│   │   ├── deploy/              Deployment
│   │   ├── dev/                 Test files
│   │   ├── ui/                  Chat UI & menu
│   │   ├── server/              Server scripts
│   │   └── pipelines/           Data pipelines
│   ├── tests/                   Test suite
│   └── config/                  Configuration files
│       ├── env/                 Environment files
│       ├── cpu_optimization.yaml
│       ├── nginx/               Nginx config
│       └── ssh/                 SSH config
│
├── 💾 DATA & STORAGE
│   ├── data/                    Unified data (22GB)
│   │   ├── master/              Training datasets
│   │   │   ├── sources/         Individual JSONL files
│   │   │   ├── combined/        Merged datasets
│   │   │   ├── archive/         Versioned snapshots
│   │   │   └── bible/           Bible corpus
│   │   ├── processed/           Cleaned/processed data
│   │   ├── raw/                 Raw scraped data
│   │   ├── archive_old/         Archived directories
│   │   ├── history/             Crawl logs
│   │   ├── db/                  Database files
│   │   └── runs/                Training run logs
│   ├── logs/                    Application logs
│   │   ├── cli/                 CLI logs
│   │   ├── api/                 API logs
│   │   ├── training/            Training logs
│   │   ├── crawlers/            Crawler logs
│   │   ├── data_pipeline/       Pipeline logs
│   │   └── maintenance/         Maintenance logs
│   └── tmp/                     Temporary files
│       ├── cache/               Cache files
│       ├── processing/          Processing files
│       ├── models/              Temporary models
│       └── datasets/            Temporary datasets
│
├── 📚 DOCUMENTATION & KNOWLEDGE
│   ├── docs/                    Documentation (50 markdown files)
│   │   ├── guides/              All guides & references
│   │   ├── logs/                Build/extraction logs
│   │   └── prompts/             Prompt templates
│   └── wiki/                    Knowledge base
│       ├── grammar/             Grammar rules
│       ├── curriculum/          Learning curriculum
│       ├── vocabulary/          Vocabulary lists
│       ├── biblical/            Biblical references
│       └── ...                  Other topics
│
├── 🌐 WEB & DEPLOYMENT
│   ├── website/                 Next.js web app
│   │   ├── zolai-project/       Main app
│   │   └── prisma/              Database schema
│   ├── agents/                  Agent definitions (25+ agents)
│   ├── skills/                  Skill modules (30+ skills)
│   └── teams/                   Team definitions
│
├── 📊 EXTERNAL & MISC
│   ├── artifacts/               Reports, graphs, archives
│   ├── notebooks/               Jupyter notebooks
│   └── node_modules/            NPM dependencies
│
├── 🔒 HIDDEN DIRECTORIES
│   ├── .git/                    Git repository
│   ├── .venv/                   Python virtual environment
│   ├── .vscode/                 VS Code settings
│   ├── .kiro/                   Kiro CLI settings
│   └── .ruff_cache/             Ruff linter cache
│
└── 📄 ROOT FILES (6 essential)
    ├── .gitignore               Git configuration
    ├── README.md                Main documentation
    ├── pyproject.toml           Python project config
    ├── package.json             NPM config
    ├── requirements.txt         Python dependencies
    └── schema.md                Database schema
```

## Directory Purposes

### Core Development
- **zolai/** — Main Python package with all modules
- **scripts/** — Organized scripts for all operations
- **tests/** — Test suite
- **config/** — Configuration files and settings

### Data & Storage
- **data/** — All datasets (22GB, organized by type)
- **logs/** — Application logs (organized by component)
- **tmp/** — Temporary files (cache, processing, models, datasets)

### Documentation & Knowledge
- **docs/** — All guides, references, and documentation
- **wiki/** — Knowledge base (grammar, curriculum, vocabulary, etc.)

### Web & Deployment
- **website/** — Next.js web application
- **agents/** — Agent definitions and configurations
- **skills/** — Skill modules
- **teams/** — Team definitions

### External & Misc
- **artifacts/** — Reports, graphs, and archives
- **notebooks/** — Jupyter notebooks
- **node_modules/** — NPM dependencies

## Statistics

| Metric | Value |
|--------|-------|
| Total Size | 30GB |
| Data Size | 22GB |
| Scripts | 127 Python files |
| Documentation | 50 markdown files |
| Root Directories | 16 (organized) |
| Root Files | 6 (essential) |
| Hidden Directories | 5 (config/cache) |

## Organization Quality

| Aspect | Rating | Notes |
|--------|--------|-------|
| Clarity | ★★★★★ | Clear purpose for each directory |
| Scalability | ★★★★★ | Easy to add new components |
| Maintainability | ★★★★★ | Well-organized, documented |
| Discoverability | ★★★★★ | Easy to find files |
| Consistency | ★★★★★ | Consistent naming & structure |

## Key Features

✅ **Clean Root** — Only 6 essential files
✅ **Organized Directories** — 16 main + 5 hidden
✅ **Clear Separation** — Each directory has clear purpose
✅ **Scalable** — Easy to add new components
✅ **Documented** — 50 markdown guides
✅ **Logs & Tmp** — Organized by component
✅ **Validated** — All checks passing

## Quick Navigation

```bash
# Core development
cd zolai/              # Main package
cd scripts/            # All scripts
cd tests/              # Test suite

# Data & storage
cd data/               # All datasets
cd logs/               # Application logs
cd tmp/                # Temporary files

# Documentation
cd docs/               # Guides & references
cd wiki/               # Knowledge base

# Web & deployment
cd website/            # Next.js app
cd agents/             # Agent definitions
cd skills/             # Skill modules

# Configuration
cd config/             # Configuration files
```

---

**Last Updated:** 2026-04-16
**Status:** ✅ Complete & Optimized
