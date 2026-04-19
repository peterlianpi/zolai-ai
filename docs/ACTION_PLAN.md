# Zolai Project: Restructuring Review & Action Plan

## ✅ Completed Restructuring

### Phase 1: Package Consolidation
- ✅ Deleted `src/` directory
- ✅ Consolidated to single `zolai/` package
- ✅ Created `zolai/utils/` (device.py, data_loader.py)
- ✅ All imports working

### Phase 2: Data Unification
- ✅ Merged `dataset/`, `clean/`, `Cleaned_Bible/`, `raw/` into `data/`
- ✅ Organized: `data/master/`, `data/processed/`, `data/raw/`, `data/history/`
- ✅ Moved `db/` → `data/db/`
- ✅ Moved `runs/` → `data/runs/`

### Phase 3: Scripts Organization
- ✅ Organized into 10 categories (crawlers, data_pipeline, training, etc.)
- ✅ Moved root test files → `scripts/dev/`
- ✅ Moved menu → `scripts/ui/`
- ✅ Moved `server/` → `scripts/server/`
- ✅ Moved `pipelines/` → `scripts/pipelines/`

### Phase 4: Root Cleanup
- ✅ Moved 50+ docs → `docs/guides/`
- ✅ Moved logs → `docs/logs/`
- ✅ Moved env files → `config/env/`
- ✅ Moved lock files → `config/`
- ✅ Moved `graph/` → `artifacts/`
- ✅ Moved `prompts/` → `docs/prompts/`
- ✅ Moved `prisma/` → `website/prisma/`

### Phase 5: Archived Old Directories
- ✅ Archived to `data/archive_old/`: archive/, dev/, scratch/, todo/, experiments/, models/, kaggle_bundle/, kaggle_dataset/, resources/
- ✅ Freed ~1.6GB

---

## 📊 Current Project Status

### Structure
```
✓ 14 root directories (clean, organized)
✓ 6 root files (essential only)
✓ 127 Python scripts (organized by function)
✓ 50 markdown docs (guides, references, logs)
```

### Validation Results
```
✓ Structure      ✓ Imports      ✓ CLI      ✓ Data      ✓ Scripts      ✓ System
```

### System Specs
```
CPU: 4 cores
RAM: 7.7GB
Disk: 233GB (88% full)
GPU: None (CPU-only)
```

---

## 🎯 Where to Start: Priority Action Plan

### PRIORITY 1: Immediate (This Week)
**Goal:** Get development environment fully functional

#### 1.1 Clean Disk Space (CRITICAL)
- **Issue:** 88% disk full, will block data processing
- **Action:**
  ```bash
  # Remove __pycache__ (29GB freed earlier, but may have regrown)
  find . -type d -name __pycache__ -exec rm -rf {} +
  
  # Clean node_modules if not needed
  rm -rf node_modules/
  
  # Archive old data versions
  tar -czf data/archive_old_backup.tar.gz data/archive_old/
  rm -rf data/archive_old/
  ```
- **Expected:** Free 5-10GB

#### 1.2 Set Up Development Environment
- **Action:**
  ```bash
  pip install -r requirements.txt
  pip install -e ".[dev]"
  python scripts/maintenance/validate_project.py
  ```
- **Expected:** All checks pass ✓

#### 1.3 Test Core Functionality
- **Action:**
  ```bash
  # Test CLI
  zolai --help
  
  # Test menu
  python scripts/ui/zolai_menu.py
  
  # Test data loading
  python -c "from zolai.utils import stream_jsonl; print('✓ Data loading works')"
  ```
- **Expected:** All commands work

---

### PRIORITY 2: Data Pipeline (Week 1-2)
**Goal:** Establish working data processing pipeline

#### 2.1 Audit Existing Data
- **Action:**
  ```bash
  python scripts/maintenance/analyze_disk_usage.py
  python scripts/data_pipeline/audit_sentences_wiki.py
  python scripts/maintenance/test_grammar_rules.py
  ```
- **Expected:** Understand data quality and gaps

#### 2.2 Set Up Data Processing
- **Action:**
  ```bash
  # Standardize JSONL files
  zolai standardize-jsonl -i data/raw/wordlist_en_zo.jsonl -o data/processed/wordlist_en_zo_clean.jsonl --dedupe
  
  # Audit processed data
  zolai audit-jsonl -i data/processed/wordlist_en_zo_clean.jsonl
  ```
- **Expected:** Clean, validated datasets

#### 2.3 Build/Update Dictionary
- **Action:**
  ```bash
  python scripts/data_pipeline/build_dictionary_db.py
  python scripts/data_pipeline/build_semantic_dictionary.py
  ```
- **Expected:** Updated dictionary database

---

### PRIORITY 3: Training Setup (Week 2-3)
**Goal:** Prepare for model training

#### 3.1 Prepare Training Data
- **Action:**
  ```bash
  python scripts/training/synthesize_instructions_v6.py
  python scripts/data_pipeline/combine_and_categorize.py
  ```
- **Expected:** Training datasets ready

#### 3.2 Configure CPU Optimization
- **Action:**
  ```bash
  # Already created: config/cpu_optimization.yaml
  accelerate config --config_file config/cpu_optimization.yaml
  ```
- **Expected:** Accelerate configured for 4-core CPU

#### 3.3 Test Training Pipeline
- **Action:**
  ```bash
  # Small test run
  accelerate launch scripts/training/train.py --max_steps 100
  ```
- **Expected:** Training runs without OOM errors

---

### PRIORITY 4: Quality Assurance (Week 3-4)
**Goal:** Ensure data and model quality

#### 4.1 Grammar Validation
- **Action:**
  ```bash
  python scripts/maintenance/test_grammar_rules.py
  python scripts/maintenance/audit_sentences_wiki.py
  ```
- **Expected:** Grammar issues identified and fixed

#### 4.2 Bible Corpus Validation
- **Action:**
  ```bash
  python scripts/data_pipeline/build_parallel_bible.py
  python scripts/data_pipeline/validate_bible_alignment.py
  ```
- **Expected:** Bible corpus validated and aligned

#### 4.3 Dictionary Quality Check
- **Action:**
  ```bash
  python scripts/maintenance/doublecheck_master.py
  ```
- **Expected:** Dictionary quality verified

---

### PRIORITY 5: Deployment (Week 4+)
**Goal:** Deploy to production

#### 5.1 API Setup
- **Action:**
  ```bash
  python zolai/api/main.py
  # or
  uvicorn zolai.api.main:app --host 0.0.0.0 --port 8000
  ```
- **Expected:** API running on localhost:8000

#### 5.2 Web App Setup
- **Action:**
  ```bash
  cd website/zolai-project
  bun install
  bunx prisma migrate dev
  bun dev
  ```
- **Expected:** Web app running on localhost:3000

#### 5.3 Deployment Scripts
- **Action:**
  ```bash
  python scripts/deploy/server.sh
  python scripts/deploy/telegram_bot.py
  ```
- **Expected:** Services deployed

---

## 📋 Checklist: Next Steps

### Immediate (Today)
- [ ] Run `python scripts/maintenance/validate_project.py`
- [ ] Clean disk space (remove __pycache__, node_modules)
- [ ] Test CLI: `zolai --help`
- [ ] Test menu: `python scripts/ui/zolai_menu.py`

### This Week
- [ ] Audit existing data
- [ ] Set up data processing pipeline
- [ ] Build/update dictionary
- [ ] Configure CPU optimization

### Next Week
- [ ] Prepare training data
- [ ] Test training pipeline
- [ ] Run grammar validation
- [ ] Validate Bible corpus

### Following Week
- [ ] Quality assurance checks
- [ ] API setup and testing
- [ ] Web app setup and testing

### Week 4+
- [ ] Deploy to production
- [ ] Monitor and optimize

---

## 🚀 Quick Start Commands

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
```

---

## 📚 Documentation

- **STARTUP.md** — Quick start guide
- **QUICKREF.md** — Command reference
- **docs/PROJECT_STRUCTURE.md** — Full structure map
- **AGENTS.md** — Development standards
- **docs/guides/** — All guides and references

---

## ⚠️ Known Issues & Mitigations

| Issue | Impact | Mitigation |
|-------|--------|-----------|
| 88% disk full | Blocks data processing | Clean __pycache__, archive old data |
| CPU-only (4 cores) | Slow training | Use gradient checkpointing, batch accumulation |
| 7.7GB RAM | OOM risk | Stream data with batch_stream_jsonl() |
| 50+ old docs | Confusion | All moved to docs/guides/ |

---

## 🎯 Success Criteria

✅ **Phase 1 (Today):** Project validates, CLI works, disk cleaned
✅ **Phase 2 (Week 1-2):** Data pipeline functional, dictionary updated
✅ **Phase 3 (Week 2-3):** Training setup complete, test run successful
✅ **Phase 4 (Week 3-4):** Quality checks pass, grammar validated
✅ **Phase 5 (Week 4+):** API and web app deployed

---

**Last Updated:** 2026-04-16
**Status:** ✅ Restructuring Complete | 🚀 Ready to Start Development
