# Zolai Project: Root Folder Index

## Quick Navigation

| Directory | Purpose | Key Files | Size |
|-----------|---------|-----------|------|
| **zolai/** | Main Python package | cli/, api/, utils/, trainer/ | - |
| **scripts/** | All scripts (127 files) | crawlers/, training/, maintenance/ | - |
| **data/** | Datasets (gitignored) | See [HuggingFace](https://huggingface.co/peterpausianlian) | local only |
| **docs/** | Documentation (50 files) | guides/, logs/, prompts/ | - |
| **wiki/** | Knowledge base | grammar/, curriculum/, vocabulary/ | - |
| **website/** | Next.js web app | zolai-project/, prisma/ | - |
| **config/** | Configuration | env/, cpu_optimization.yaml | - |
| **logs/** | Application logs | cli/, api/, training/, crawlers/ | - |
| **tmp/** | Temporary files | cache/, processing/, models/ | - |
| **agents/** | Agent definitions | 34 agent configs | - |
| **skills/** | Skill modules | 46 skill modules | - |
| **tests/** | Test suite | test_*.py files | - |
| **artifacts/** | Reports & analysis | graphs/, archives/ | - |
| **notebooks/** | Jupyter notebooks | *.ipynb files | - |

---

## 📁 Directory Structure Index

### 1. CORE DEVELOPMENT

#### zolai/ — Main Python Package
```
zolai/
├── utils/                  Device detection, data loading
│   ├── device.py          CPU/GPU optimization
│   ├── data_loader.py     Memory-efficient JSONL streaming
│   └── logging.py         Centralized logging
├── cli/                   CLI commands
├── api/                   FastAPI server
├── analyzer/              Analysis modules
├── cleaner/               Data cleaning
├── trainer/               Training modules
├── crawler/               Web crawling
├── dictionary/            Dictionary management
├── bible/                 Bible corpus handling
├── ingest/                Data ingestion
├── manager/               Project management
├── ocr/                   OCR processing
├── shared/                Shared utilities
├── gui/                   GUI components
└── config.py              Configuration
```

#### scripts/ — All Scripts (~150 Python files)
```
scripts/
├── crawlers/              Web scrapers
│   ├── fetch_tongdot_dictionary.py
│   ├── fetch_bible_versions.py
│   ├── fetch_rvasia_tedim.py
│   └── crawl_all_news.py
├── data_pipeline/         Data processing
│   ├── build_dictionary_db.py
│   ├── build_semantic_dictionary.py
│   ├── combine_and_categorize.py
│   └── ...
├── training/              Training scripts
│   ├── synthesize_instructions_v6.py
│   ├── train.py
│   └── ...
├── maintenance/           Cleanup & validation
│   ├── analyze_disk_usage.py
│   ├── test_grammar_rules.py
│   ├── validate_project.py
│   └── ...
├── synthesis/             Instruction synthesis
├── deploy/                Deployment scripts
├── dev/                   Test files
│   ├── test_chat.py
│   ├── test_network.py
│   └── fix_zolai.py
├── ui/                    Chat UI & menu
│   ├── zolai_menu.py
│   ├── chat_api.py
│   └── chat_ui.html
├── server/                Server scripts
├── pipelines/             Data pipelines
└── logs/                  Script logs (auto-generated)
```

#### tests/ — Test Suite
```
tests/
└── (test files - currently empty, ready for tests)
```

#### config/ — Configuration Files
```
config/
├── env/                   Environment files
│   ├── .env
│   ├── .env.example
│   └── .env.machine
├── cpu_optimization.yaml  CPU training config
├── nginx/                 Nginx configuration
├── ssh/                   SSH configuration
├── uv.lock                UV lock file
└── package-lock.json      NPM lock file
```

---

### 2. DATA & STORAGE

#### data/ — Unified Data (~30GB)
```
# data/ is gitignored — see data/README.md for download instructions
├── corpus/               Source corpora
│   ├── bible/            Bible versions (TDB77, TBR17, Tedim1932, Tedim2010, KJV)
│   ├── news/             Web crawls (ZomiDaily, Tongsan, RVAsia Catholic)
│   ├── synthetic/        Synthetic/generated training data
│   ├── hymns/            Tedim hymn corpus (510 hymns)
│   ├── reference/        Reference texts
│   ├── texts/            Raw text corpus
│   └── ocr/              OCR output (PDF → markdown)
├── dictionary/           All dictionary data
│   ├── raw/              Raw scraped (ZomiDictionary, ZomiMe, TongDot)
│   ├── processed/        Cleaned/enriched/semantic dictionaries
│   ├── wordlists/        ZO↔EN wordlists, frequency lists
│   ├── bible_study/      Bible study vocabulary
│   └── db/               Dictionary SQLite databases
├── parallel/             Parallel ZO↔EN translation pairs
│   ├── zo_en_pairs_combined_v1.jsonl
│   ├── zo_en_pairs_master_v1.jsonl
│   └── bible_parallel_*.jsonl
├── training/             Ready-to-train datasets
│   ├── final_train.jsonl
│   ├── llm_train_v3.jsonl / llm_val_v3.jsonl / llm_test_v3.jsonl
│   ├── instructions_bible_v1.jsonl
│   └── orpo_pairs_v1.jsonl
├── db/                   SQLite databases (master FTS5, ZomiDictionary, legacy)
├── runs/                 Training run outputs
│   ├── qwen_zolai_7b_lora_v7/
│   ├── zolai_v1/
│   └── zo_tdm_v1/
├── eval/                 Evaluation datasets
│   ├── zolai_qa_v1.jsonl
│   ├── translation_eval_v1.jsonl
│   └── zvs_compliance_test_v1.jsonl
├── archive/              Superseded data (training_versions, rebuild_versions)
│   ├── superseded_training/
│   ├── old_data/
│   ├── rebuild_versions/
│   └── training_versions/
├── exports/              Exported data (CSV, TSV)
├── adapter/              LoRA adapter checkpoints
├── raw/                  Raw scraped/downloaded data
├── logs/                 Crawl logs, pipeline progress, state files
├── fbdata/               Facebook data corpus
├── tmp_processing/       Temporary processing files
├── wiki/                 Wiki data snapshots
└── master_source_v1.jsonl  ~1GB master source file
```

#### logs/ — Application Logs
```
logs/
├── cli/                  CLI command logs
├── api/                  API server logs
├── training/             Training run logs
├── crawlers/             Web crawler logs
├── data_pipeline/        Data processing logs
└── maintenance/          Maintenance task logs
```

#### tmp/ — Temporary Files
```
tmp/
├── cache/                Cache files
├── processing/           Processing intermediate files
├── models/               Temporary model files
└── datasets/             Temporary dataset files
```

---

### 3. DOCUMENTATION & KNOWLEDGE

#### docs/ — Documentation (50 markdown files)
```
docs/
├── guides/               All guides & references
│   ├── STARTUP.md
│   ├── QUICKREF.md
│   ├── ACTION_PLAN.md
│   ├── PROJECT_STRUCTURE.md
│   ├── ROOT_STRUCTURE.md
│   ├── LOGS_AND_TMP.md
│   ├── AGENTS.md
│   └── (40+ other guides)
├── logs/                 Build/extraction logs
│   ├── bible_extraction.log
│   ├── rebuild_live.log
│   └── result.md
└── prompts/              Prompt templates
```

#### wiki/ — Knowledge Base
```
wiki/
├── grammar/              Grammar rules
├── curriculum/           Learning curriculum
├── vocabulary/           Vocabulary lists
├── biblical/             Biblical references
├── concepts/             Linguistic concepts
├── culture/              Cultural context
├── linguistics/          Linguistic analysis
├── patterns/             Language patterns
├── translation/          Translation guides
├── architecture/         System architecture
├── decisions/            Design decisions
└── (20+ other topics)
```

---

### 4. WEB & DEPLOYMENT

#### website/ — Next.js Web App
```
website/
├── zolai-project/        Main Next.js app
│   ├── app/             App directory
│   ├── components/      React components
│   ├── lib/             Utilities
│   ├── public/          Static files
│   ├── scripts/         Setup scripts
│   └── package.json
└── prisma/              Database schema
    ├── schema.prisma
    └── migrations/
```

#### agents/ — Agent Definitions (34 agents)
```
agents/
├── zomi-data/
├── zomi-trainer-bot/
├── zomi-bible-aligner/
├── zomi-dictionary-builder/
├── zomi-synthesizer/
├── zomi-evaluator/
├── zomi-wiki-manager/
├── zomi-cleaner-bot/
├── zomi-crawler-bot/
├── zomi-philosopher/
├── zomi-server-ops/
├── zomi-ops-monitor/
├── zomi-bible-vocab-builder/
├── zolai-learner/
├── zolai-lesson-tutor/
├── zolai-grammar-checker/
├── zolai-grammar-learner/
├── zolai-phrasebook-builder/
├── zolai-dialect-classifier/
├── zolai-pronunciation-guide/
├── zolai-cultural-content/
├── zolai-security-auditor/
├── zolai-data-quality/
├── zolai-research-tracker/
├── zolai-dpo-builder/
├── zolai-bible-dictionary-builder/
├── zolai-pipeline-team/
├── linguistic-specialist/
└── (+ zolai-agents.yaml, AGENT_PROMPTS.md)
```

#### skills/ — Skill Modules (46 skills)
```
skills/
├── data-cleaner/
├── data-collector/
├── data-deduplicator/
├── data-labeler/
├── data-quality-checker/
├── data-visualization/
├── model-trainer/
├── model-evaluator/
├── model-deployer/
├── grammar-checker/
├── bible-quality-auditor/
├── bible-crossref-resolver/
├── bible-vocab-extractor/
├── ocr-processor/
├── rag-builder/
├── web-crawler/
├── hyperparameter-tuner/
├── experiment-tracker/
├── ab-testing/
├── huggingface-uploader/
├── kaggle-automation/
├── ollama-local/
├── github-models-api/
├── server-ops/
├── pipeline-orchestrator/
├── security-auditor/
├── cultural-content/
├── pronunciation-guide/
├── phrasebook-builder/
├── dialect-classifier/
├── lesson-tutor/
├── zolai-dictionary-editor/
├── zolai-statistics/
├── zolai-data-analytics/
├── zolai-web-dataset-miner/
├── zolai-train-candidates-exporter/
├── zolai-corporate-layout-manager/
├── zolai-fetch-verify-autocontinue/
├── zolai-language-verifier-gemini/
├── zolai-training-orchestrator/
└── (+ 2 more)
```

#### teams/ — Team Definitions
```
teams/
└── (team configuration files)
```

---

### 5. EXTERNAL & MISC

#### artifacts/ — Reports & Analysis
```
artifacts/
├── graph/                Graphs & visualizations
└── archives/             Archive files
    └── kaggle_bundle.zip
```

#### notebooks/ — Jupyter Notebooks
```
notebooks/
├── zolai-cleaner-v2/
├── zolai-dataset-combiner-v1/
├── zolai-qwen-training-v2/
└── (other notebooks)
```

#### node_modules/ — NPM Dependencies
```
node_modules/
└── (npm packages)
```

---

### 6. HIDDEN DIRECTORIES

#### .git/ — Git Repository
```
.git/
└── (git configuration and history)
```

#### .venv/ — Python Virtual Environment
```
.venv/
└── (Python packages and interpreter)
```

#### .vscode/ — VS Code Settings
```
.vscode/
└── (editor configuration)
```

#### .kiro/ — Kiro CLI Settings
```
.kiro/
├── settings/
└── specs/
```

#### .ruff_cache/ — Ruff Linter Cache
```
.ruff_cache/
└── (linter cache files)
```

---

### 7. ROOT FILES (6 Essential)

```
.gitignore              Git ignore rules
README.md               Main documentation
pyproject.toml          Python project configuration
package.json            NPM configuration
requirements.txt        Python dependencies
schema.md               Database schema
```

---

## 🔍 Finding Files

### By Purpose

**Data Processing**
- Scripts: `scripts/data_pipeline/`
- Data: `data/processed/`, `data/raw/`
- Logs: `logs/data_pipeline/`

**Training**
- Scripts: `scripts/training/`
- Data: `data/master/`
- Logs: `logs/training/`
- Runs: `data/runs/`

**Web Crawling**
- Scripts: `scripts/crawlers/`
- Data: `data/raw/`
- Logs: `logs/crawlers/`

**API & Server**
- Code: `zolai/api/`
- Scripts: `scripts/server/`
- Logs: `logs/api/`

**CLI**
- Code: `zolai/cli/`
- Logs: `logs/cli/`

**Documentation**
- Guides: `docs/guides/`
- Knowledge: `wiki/`
- Logs: `docs/logs/`

**Configuration**
- Environment: `config/env/`
- Training: `config/cpu_optimization.yaml`
- Server: `config/nginx/`, `config/ssh/`

**Temporary Files**
- Cache: `tmp/cache/`
- Processing: `tmp/processing/`
- Models: `tmp/models/`
- Datasets: `tmp/datasets/`

---

## 📊 Statistics

| Category | Count | Size |
|----------|-------|------|
| Root Directories | 14 | - |
| Root Files | 6 | - |
| Hidden Directories | 5 | - |
| Python Scripts | ~150 | - |
| Documentation Files | 50+ | - |
| Agents | 34 | - |
| Skills | 46 | - |
| Total Size | - | ~30GB |
| Data Size | - | ~25GB |

---

## 🚀 Quick Commands

```bash
# Navigate to key directories
cd zolai/              # Main package
cd scripts/            # All scripts
cd data/               # All datasets
cd docs/               # Documentation
cd wiki/               # Knowledge base
cd website/            # Web app
cd config/             # Configuration
cd logs/               # Application logs
cd tmp/                # Temporary files

# Find files
find . -name "*.py" -path "*/scripts/*"     # Find scripts
find . -name "*.md" -path "*/docs/*"        # Find docs
find . -name "*.jsonl" -path "*/data/*"     # Find data files
find . -name "*.log" -path "*/logs/*"       # Find logs

# List directory contents
ls -la zolai/          # Package structure
ls -la scripts/        # Scripts categories
ls -la data/           # Data structure
ls -la docs/           # Documentation
```

---

## 📚 Documentation Index

| Document | Purpose | Location |
|----------|---------|----------|
| STARTUP.md | Quick start guide | docs/guides/ |
| QUICKREF.md | Command reference | docs/guides/ |
| ACTION_PLAN.md | 5-week development plan | docs/guides/ |
| PROJECT_STRUCTURE.md | Full structure map | docs/guides/ |
| ROOT_STRUCTURE.md | Root structure details | docs/guides/ |
| LOGS_AND_TMP.md | Logs & tmp organization | docs/guides/ |
| AGENTS.md | Development standards | docs/guides/ |
| README.md | Main documentation | root |

---

**Last Updated:** 2026-04-20
**Status:** ✅ Complete & Indexed
