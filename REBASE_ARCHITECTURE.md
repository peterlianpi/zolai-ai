# Zolai Project — Rebase Architecture & Design System

> Unified architecture merging Kaggle workspace + Projects workspace into a single coherent project.
> Created: 2026-04-04 | Status: Planning

---

## 1. Current State Analysis

### Two Workspaces Exist

| Location | Purpose | Size | Status |
|----------|---------|------|--------|
| `/home/peter/Downloads/Kaggle/` | Kaggle notebooks + scripts + data | ~2GB | Active (Kaggle-first) |
| `/home/peter/Documents/Projects/zolai-toolkit/` | Python package + GUI + API | ~17.5GB | Active (local-first) |

### Data Scattered Across 3 Locations

| Location | Content | Size |
|----------|---------|------|
| `Kaggle/data/` | Bible JSONL, dictionary, processed, intermediate, Zolai Lessons PDFs | ~500MB |
| `Projects/data/` | Empty dirs + 15 pipeline reports | ~16KB |
| `Projects/zolai-toolkit/data/` | 6.2GB unified corpus + 2000 cleaned JSONL files (1.5GB) | ~7.7GB |

### Bible Sources in 2 Places

| Location | Format | Content |
|----------|--------|---------|
| `Kaggle/data/zolai_bible_dataset/` | JSONL (processed) | Parallel pairs, per-book, HF format |
| `Projects/bibles/` | USX/XML (raw source) | Tedim 2010, TDB77, English KJV (132 USX files) |

### Code Overlap

| Component | Kaggle | Toolkit |
|-----------|--------|---------|
| Standardizer | `src/zolai/v9/standardizer.py` | `src/zolai_toolkit/cleaner/pipeline.py` |
| CLI | `src/zolai/cli.py` | `src/zolai_toolkit/cli/main.py` (Typer) |
| Bible Extractor | `src/zolai/commands/bible_hymn_extractor.py` | `src/zolai_toolkit/bible/extractor.py` |
| Crawler | N/A | `src/zolai_toolkit/crawler/engine.py` |
| Analyzer | N/A | `src/zolai_toolkit/analyzer/corpus.py` |
| Trainer | Notebooks only | `src/zolai_toolkit/trainer/dataset.py` |
| Dictionary | Scripts | `src/zolai_toolkit/dictionary/manager.py` |
| GUI | N/A | `src/zolai_toolkit/gui/app.py` (GTK3) |
| API | N/A | `src/zolai_toolkit/api/server.py` (FastAPI) |

### Deprecated/Archived

| Path | Status | Action |
|------|--------|--------|
| `Projects/zolai-smart-crawler/` | Empty (merged into toolkit) | Delete |
| `Projects/archive/zolai-assistant-pro/` | Archived RAG assistant | Keep as reference |
| `Projects/zomi-ai/` | CharLM smoke test | Keep as reference |

---

## 2. Target Architecture

### Single Unified Project Root

```
/home/peter/Documents/Projects/zolai/          # NEW unified root
├── src/zolai/                                 # Python package (merge both)
│   ├── __init__.py
│   ├── cli.py                                 # Unified CLI (Typer + argparse)
│   ├── config.py                              # Central config (from toolkit)
│   ├── paths.py                               # Path management (from Kaggle)
│   ├── standardizer.py                        # V9 standardizer (from Kaggle)
│   ├── crawler/                               # From toolkit
│   ├── cleaner/                               # Merge toolkit + Kaggle
│   ├── analyzer/                              # From toolkit
│   ├── trainer/                               # Merge toolkit + Kaggle notebooks
│   ├── dictionary/                            # From toolkit
│   ├── bible/                                 # Merge toolkit + Kaggle
│   ├── api/                                   # From toolkit (FastAPI)
│   ├── gui/                                   # From toolkit (GTK3)
│   ├── ingest/                                # From toolkit
│   └── commands/                              # From Kaggle
│
├── notebooks/                                 # From Kaggle (Kaggle-first)
│   ├── zolai-qwen-training-v2.ipynb
│   ├── zolai-cleaner-v2.ipynb
│   ├── zolai-dataset-combiner-v1.ipynb
│   └── ... (all 19 notebooks)
│
├── scripts/                                   # From Kaggle (standalone)
│   ├── init_project.py                        # NEW: fetch all data
│   ├── fetch_tongdot_dictionary.py
│   ├── pipeline_menu.py
│   └── ... (all 30+ scripts)
│
├── data/                                      # UNIFIED data root
│   ├── raw/                                   # Raw inputs (Bible USX, dictionary fetches)
│   │   ├── bibles/                            # From Projects/bibles/ (USX/XML)
│   │   ├── tongdot/                           # Raw dictionary fetches
│   │   └── tongsan/                           # Raw WordPress API data
│   ├── processed/                             # Cleaned/standardized outputs
│   │   ├── bible/                             # Parallel JSONL pairs
│   │   ├── dictionary/                        # Combined dictionary
│   │   ├── corpus/                            # Unified text corpus
│   │   └── grammar/                           # Grammar instructions
│   ├── training/                              # Train-ready datasets
│   │   ├── jsonl/                             # JSONL splits
│   │   └── hf/                                # HuggingFace DatasetDict
│   ├── kaggle/                                # Downloaded from Kaggle datasets
│   ├── external/                              # External data (Zolai Lessons PDFs, etc.)
│   └── archive/                               # Old versions, backups
│
├── resources/                                 # Reference docs (from Kaggle)
│   ├── zolai_system_prompt.txt
│   ├── zolai_grammar_cheat_sheet.md
│   ├── zolai_everyday_vocabulary.md
│   ├── zolai_vocabulary_lists.md
│   ├── zolai_ai_instructions.md
│   ├── data_quality_recommendations.md
│   ├── agentic_system_architecture.md
│   └── agent_knowledge/                       # Agent knowledge base
│
├── docs/                                      # Documentation
│   ├── ARCHITECTURE.md                        # This file
│   ├── API.md                                 # REST API docs
│   ├── CLI.md                                 # CLI usage
│   ├── KAGGLE.md                              # Kaggle workflow
│   └── DEVELOPMENT.md                         # Dev setup guide
│
├── config/                                    # Configuration files
│   ├── .env                                   # Environment variables
│   ├── crawler.yaml                           # Crawler settings
│   └── cleaner.yaml                           # Cleaner settings
│
├── pyproject.toml                             # Unified build config
├── requirements.txt                           # Kaggle deps
├── requirements-dev.txt                       # Dev deps
├── AGENTS.md                                  # Agent instructions
├── EXTERNAL_RESOURCES.md                      # All external refs
├── KAGGLE_ROADMAP.md                          # Kaggle session roadmap
├── LOCAL_DOCS.md                              # Local dev docs
├── README.md                                  # Project overview
└── zolai_menu.py                              # Interactive menu
```

---

## 3. Data Merge Strategy

### Phase 1: Bible Data (Merge Both Sources)

```
Source: Projects/bibles/ (USX/XML raw)     → data/raw/bibles/
Source: Kaggle/data/zolai_bible_dataset/   → data/processed/bible/
Action: Keep USX as raw source, JSONL as processed output
```

### Phase 2: Toolkit Data (Move Large Files)

```
Source: Projects/zolai-toolkit/data/archive/unified_corpus_6.2G.jsonl
  → data/processed/corpus/unified_corpus.jsonl (symlink or move)

Source: Projects/zolai-toolkit/data/cleaned/ (2000 files, 1.5GB)
  → data/processed/corpus/cleaned/ (consolidate)
```

### Phase 3: Kaggle Data (Reorganize)

```
Source: Kaggle/data/zolai-focused/          → data/processed/corpus/
Source: Kaggle/data/processed/              → data/processed/
Source: Kaggle/data/intermediate/           → data/processed/intermediate/
Source: Kaggle/data/combined-dict-translation/ → data/processed/dictionary/
Source: Kaggle/data/Zolai Lessons/          → data/external/lessons/
Source: Kaggle/data/for-later/              → data/archive/
```

### Phase 4: External Data (Link)

```
Source: Projects/data/ (empty dirs + reports) → data/ (merge structure)
Action: Adopt the Projects/data/ structure as the canonical layout
```

---

## 4. Code Merge Strategy

### Priority Order (Keep Best Version)

| Component | Keep From | Reason |
|-----------|-----------|--------|
| **CLI** | Toolkit (Typer) | Better UX, more commands |
| **Standardizer** | Kaggle (V9) | More grammar rules, battle-tested |
| **Cleaner** | Merge both | Toolkit has OCR/boilerplate, Kaggle has NFKC/dedup |
| **Crawler** | Toolkit | Only exists there |
| **Analyzer** | Toolkit | Only exists there |
| **Trainer** | Merge | Toolkit has splits, Kaggle has QLoRA |
| **Dictionary** | Toolkit | Better search/export |
| **Bible** | Merge | Toolkit has USX parser, Kaggle has parallel pairs |
| **GUI** | Toolkit | Only exists there |
| **API** | Toolkit | Only exists there |
| **Notebooks** | Kaggle | Only exist there |
| **Scripts** | Kaggle | More comprehensive |
| **Config** | Toolkit | Better dataclass design |
| **Paths** | Merge | Kaggle has RepoPaths, Toolkit has env-aware |

### Package Merge

```python
# src/zolai/ (unified package name)
# Keep zolai-toolkit's structure, add Kaggle's modules

zolai/
├── __init__.py           # From toolkit (v1.0.0)
├── config.py             # From toolkit (better design)
├── cli.py                # Merge: Typer CLI + argparse subcommands
├── standardizer.py       # From Kaggle (V9)
├── crawler/              # From toolkit
├── cleaner/              # Merge both
├── analyzer/             # From toolkit
├── trainer/              # Merge both
├── dictionary/           # From toolkit
├── bible/                # Merge both
├── api/                  # From toolkit
├── gui/                  # From toolkit
├── ingest/               # From toolkit
└── commands/             # From Kaggle (legacy support)
```

---

## 5. Design System

### Configuration Hierarchy

```
1. Hardcoded defaults (in config.py dataclasses)
2. .env file (project root)
3. Environment variables (override .env)
4. CLI flags (override everything)
```

### Data Flow

```
Raw Sources → Ingest → Clean → Standardize → Dedup → Split → Train
   (USX,      (JSON,    (OCR,     (V9 rules,  (MD5,    (train/  (QLoRA,
    JSONL,    PDF,       NFKC,     NFKC,       semantic  val/     SFTTrainer)
    Web)      Web)       density)  grammar)    similarity) test)
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Modules | snake_case | `standardizer.py`, `bible_extractor.py` |
| Classes | PascalCase | `ZolaiRecord`, `CrawlEngine`, `SFTTrainer` |
| Functions | snake_case | `standardize_zolai()`, `clean_text()` |
| Config vars | UPPER_SNAKE_CASE | `ZOLAI_DATA_ROOT`, `MAX_LENGTH` |
| Data dirs | snake_case | `data/raw/bibles/`, `data/processed/corpus/` |
| Output files | snake_case + date | `cleaned_20260404.jsonl`, `report_20260404.json` |

### Error Handling

```python
# Data pipelines: broad except, log context, continue
except Exception as e:
    logger.error(f"Failed processing {path}: {e}")
    stats["errors"] += 1
    continue

# CLI: argparse with sensible defaults, SystemExit
raise SystemExit(main())

# API: FastAPI HTTPException with details
raise HTTPException(status_code=404, detail="Dataset not found")
```

---

## 6. Migration Steps

### Step 1: Create Unified Structure
```bash
mkdir -p /home/peter/Documents/Projects/zolai/{src/zolai,notebooks,scripts,data/{raw/{bibles,tongdot,tongsan},processed/{bible,dictionary,corpus,grammar},training/{jsonl,hf},kaggle,external,archive},resources/agent_knowledge,docs,config}
```

### Step 2: Copy Bible Sources
```bash
cp -r /home/peter/Documents/Projects/bibles/* /home/peter/Documents/Projects/zolai/data/raw/bibles/
```

### Step 3: Copy Kaggle Data
```bash
cp -r /home/peter/Downloads/Kaggle/data/zolai_bible_dataset/* /home/peter/Documents/Projects/zolai/data/processed/bible/
cp -r /home/peter/Downloads/Kaggle/data/zolai-focused/* /home/peter/Documents/Projects/zolai/data/processed/corpus/
cp -r /home/peter/Downloads/Kaggle/data/processed/* /home/peter/Documents/Projects/zolai/data/processed/
cp -r /home/peter/Downloads/Kaggle/data/Zolai\ Lessons/* /home/peter/Documents/Projects/zolai/data/external/lessons/
```

### Step 4: Copy Toolkit Code
```bash
cp -r /home/peter/Documents/Projects/zolai-toolkit/src/zolai_toolkit/* /home/peter/Documents/Projects/zolai/src/zolai/
```

### Step 5: Copy Kaggle Code
```bash
cp /home/peter/Downloads/Kaggle/notebooks/*.ipynb /home/peter/Documents/Projects/zolai/notebooks/
cp /home/peter/Downloads/Kaggle/scripts/*.py /home/peter/Documents/Projects/zolai/scripts/
cp /home/peter/Downloads/Kaggle/resources/* /home/peter/Documents/Projects/zolai/resources/
cp -r /home/peter/Downloads/Kaggle/resources/agent_knowledge/* /home/peter/Documents/Projects/zolai/resources/agent_knowledge/
```

### Step 6: Merge Configs
- Use toolkit's `config.py` as base
- Add Kaggle's `paths.py` RepoPaths
- Merge `.env` files

### Step 7: Update pyproject.toml
- Merge dependencies from both projects
- Keep unified package name `zolai`
- Add all optional deps

### Step 8: Create Symlinks (Optional)
```bash
# Keep old locations working via symlinks
ln -s /home/peter/Documents/Projects/zolai /home/peter/Downloads/Kaggle
ln -s /home/peter/Documents/Projects/zolai/data/raw/bibles /home/peter/Documents/Projects/bibles
```

---

## 7. Git Strategy

### Single Repository

```bash
cd /home/peter/Documents/Projects/zolai
git init
git add src/ notebooks/ scripts/ resources/ docs/ pyproject.toml README.md
git commit -m "Initial: unified Zolai project structure"

# Large data files in .gitignore
echo "data/" >> .gitignore
echo "*.jsonl" >> .gitignore
echo "*.zip" >> .gitignore
echo "venv/" >> .gitignore
echo ".venv/" >> .gitignore
```

### What to Commit
- ✅ Source code (src/)
- ✅ Notebooks (notebooks/)
- ✅ Scripts (scripts/)
- ✅ Resources (resources/)
- ✅ Config files (config/, .env.example, pyproject.toml)
- ✅ Documentation (docs/, README.md, *.md)

### What to Ignore
- ❌ Data files (data/) — too large, regenerated
- ❌ Virtual environments (venv/, .venv/)
- ❌ Build artifacts (dist/, build/, *.egg-info)
- ❌ IDE files (.vscode/, .idea/)
- ❌ Checkpoints (checkpoint-*, *.pt)

---

## 8. Environment Setup

### Development (Local)
```bash
cd /home/peter/Documents/Projects/zolai
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[full,dev]"
```

### Kaggle (Notebook)
```python
# First cell of every notebook
!pip install -q -e "/kaggle/input/zolai-project"  # Add as dataset
# Or install from requirements
!pip install -q transformers datasets peft trl accelerate bitsandbytes
```

### Production (API/GUI)
```bash
# System deps (GTK3)
sudo apt install python3-gi python3-gi-cairo gir1.2-gtk-3.0

# Python deps
pip install -e ".[full]"

# Start API
zolai api --host 0.0.0.0 --port 8300

# Start GUI
zolai gui
```

---

## 9. Next Actions

1. **Run migration script** (see `scripts/migrate_to_unified.py`)
2. **Verify data integrity** — check all JSONL files valid
3. **Update imports** — all code uses `from zolai import ...`
4. **Test CLI** — `zolai info`, `zolai status`, `zolai clean`
5. **Test notebooks** — run smoke test on Kaggle
6. **Commit to git** — initial unified commit
7. **Delete old locations** — after verification
