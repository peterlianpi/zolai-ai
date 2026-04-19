# Zolai Project: Quick Index

## 🎯 Find What You Need

### By Task

| Task | Location | Command |
|------|----------|---------|
| **Run CLI** | `zolai/cli/` | `zolai --help` |
| **Run Menu** | `scripts/ui/` | `python scripts/ui/zolai_menu.py` |
| **Crawl Data** | `scripts/crawlers/` | `python scripts/crawlers/fetch_*.py` |
| **Process Data** | `scripts/data_pipeline/` | `python scripts/data_pipeline/*.py` |
| **Train Model** | `scripts/training/` | `accelerate launch scripts/training/train.py` |
| **Check Quality** | `scripts/maintenance/` | `python scripts/maintenance/test_grammar_rules.py` |
| **Run API** | `zolai/api/` | `uvicorn zolai.api.main:app` |
| **Run Web App** | `website/zolai-project/` | `cd website/zolai-project && bun dev` |
| **View Logs** | `logs/` | `tail -f logs/*/` |
| **Clean Disk** | `scripts/maintenance/` | `python scripts/maintenance/analyze_disk_usage.py` |

### By Component

| Component | Directory | Key Files |
|-----------|-----------|-----------|
| **Package** | `zolai/` | `__init__.py`, `config.py` |
| **CLI** | `zolai/cli/` | `main.py` |
| **API** | `zolai/api/` | `main.py` |
| **Utils** | `zolai/utils/` | `device.py`, `data_loader.py`, `logging.py` |
| **Crawlers** | `scripts/crawlers/` | `fetch_*.py` |
| **Data Pipeline** | `scripts/data_pipeline/` | `build_*.py`, `combine_*.py` |
| **Training** | `scripts/training/` | `train.py`, `synthesize_*.py` |
| **Maintenance** | `scripts/maintenance/` | `validate_*.py`, `test_*.py` |
| **Deployment** | `scripts/deploy/` | `server.sh`, `telegram_bot.py` |
| **UI** | `scripts/ui/` | `zolai_menu.py`, `chat_api.py` |

### By Data Type

| Data Type | Location | Format |
|-----------|----------|--------|
| **Training Data** | `data/training/` | JSONL |
| **Source Corpus** | `data/corpus/` | JSONL |
| **Parallel Pairs** | `data/parallel/` | JSONL |
| **Raw Data** | `data/raw/` | JSONL, TXT |
| **Bible Corpus** | `data/corpus/bible/` | MD, JSONL |
| **Dictionary** | `data/dictionary/processed/` | JSONL |
| **Database** | `data/dictionary/db/`, `data/db/` | SQLite |
| **Training Runs** | `data/runs/` | Checkpoints, logs |
| **Eval Sets** | `data/eval/` | JSONL, TXT |
| **Exports** | `data/exports/` | CSV, TSV |
| **Adapters** | `data/adapter/` | ZIP, safetensors |

### By Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **Getting Started** | Quick start | `STARTUP.md` |
| **Commands** | Command reference | `QUICKREF.md` |
| **Development Plan** | 5-week plan | `docs/guides/ACTION_PLAN.md` |
| **Structure** | Project structure | `docs/guides/PROJECT_STRUCTURE.md` |
| **Root Index** | Root folder index | `docs/guides/ROOT_STRUCTURE.md` |
| **Logs & Tmp** | Logs organization | `docs/guides/LOGS_AND_TMP.md` |
| **Standards** | Development standards | `AGENTS.md` |
| **Grammar** | Grammar rules | `wiki/grammar/` |
| **Curriculum** | Learning curriculum | `wiki/curriculum/` |

---

## 📁 Directory Tree (Quick Reference)

```
zolai/
├── zolai/              Main package
├── scripts/            All scripts (~150 files)
├── data/               Datasets (~30GB, gitignored)
│   ├── corpus/         Source corpora
│   ├── dictionary/     Dictionary data
│   ├── parallel/       ZO↔EN parallel pairs
│   ├── training/       Ready-to-train datasets
│   ├── db/             SQLite databases
│   ├── runs/           Training run outputs
│   ├── eval/           Evaluation datasets
│   ├── archive/        Superseded data
│   ├── exports/        Exported data
│   ├── adapter/        LoRA adapters
│   ├── raw/            Raw scraped data
│   ├── logs/           Pipeline logs
│   ├── fbdata/         Facebook data
│   ├── tmp_processing/ Temp processing
│   └── wiki/           Wiki snapshots
├── docs/               Documentation (50 files)
├── wiki/               Knowledge base
├── website/            Next.js app
├── config/             Configuration
├── logs/               Application logs
├── tmp/                Temporary files
├── agents/             Agent definitions (34)
├── skills/             Skill modules (46)
├── tests/              Test suite
├── artifacts/          Reports & analysis
└── notebooks/          Jupyter notebooks
```

---

## 🔍 Search Patterns

```bash
# Find Python scripts
find scripts/ -name "*.py" | head -20

# Find documentation
find docs/ -name "*.md" | head -20

# Find data files
find data/ -name "*.jsonl" | head -20

# Find logs
find logs/ -name "*.log" | head -20

# Find by component
find . -path "*/crawlers/*" -name "*.py"
find . -path "*/training/*" -name "*.py"
find . -path "*/maintenance/*" -name "*.py"

# Find by size
du -sh */ | sort -h | tail -10
```

---

## 🚀 Common Commands

```bash
# Validate project
python scripts/maintenance/validate_project.py

# Clean disk
find . -type d -name __pycache__ -exec rm -rf {} +

# Test CLI
zolai --help

# Test menu
python scripts/ui/zolai_menu.py

# Audit data
python scripts/maintenance/analyze_disk_usage.py

# Process data
zolai standardize-jsonl -i INPUT -o OUTPUT --dedupe

# Build dictionary
python scripts/data_pipeline/build_dictionary_db.py

# Prepare training
python scripts/training/synthesize_instructions_v6.py

# Test training
accelerate launch scripts/training/train.py --max_steps 100

# Run API
uvicorn zolai.api.main:app --host 0.0.0.0 --port 8000

# Run web app
cd website/zolai-project && bun dev

# View logs
tail -f logs/cli/*.log
tail -f logs/training/*.log
tail -f logs/api/*.log
```

---

## 📊 Project Stats

- **Total Size:** ~30GB
- **Data:** ~25GB
- **Scripts:** ~150 Python files
- **Documentation:** 50+ markdown files
- **Root Directories:** 14
- **Root Files:** 6 (essential)
- **Agents:** 34
- **Skills:** 46

---

## ✅ Checklist

- [ ] Run validation: `python scripts/maintenance/validate_project.py`
- [ ] Clean disk: `find . -type d -name __pycache__ -exec rm -rf {} +`
- [ ] Test CLI: `zolai --help`
- [ ] Test menu: `python scripts/ui/zolai_menu.py`
- [ ] Read STARTUP.md
- [ ] Read ACTION_PLAN.md
- [ ] Start development

---

**Last Updated:** 2026-04-20
**Status:** ✅ Ready for Development
