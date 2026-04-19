# 🏗️ ZOLAI PROJECT RESTRUCTURING GUIDE

**Status:** Ready for Implementation  
**Date:** 2026-04-16  
**Goal:** Clean, powerful, connected structure with zero duplicates

---

## 📊 CURRENT STATE

### Problems
- **19,815 duplicate files** (mostly README.md)
- **50 empty directories** (graph, experiments, tests, teams, etc.)
- **Scattered agents** (23 agents in `agents/` directory)
- **Scattered skills** (37 skills in `skills/` directory)
- **Duplicate packages** (`zolai/` and `scripts/`)
- **Unclear wiki hierarchy** (25 subdirectories)
- **Messy data structure** (no clear master/processed/raw)

### Size Issues
- website: 2.2 GB
- resources: 948 MB
- data: 21 GB
- kaggle_bundle: 674 MB
- dataset: 426 MB

---

## 🎯 NEW STRUCTURE

### Root Level
```
zolai/
├── README.md                    # Single source of truth
├── ARCHITECTURE.md              # System design
├── CONTRIBUTING.md              # Contribution guidelines
├── LICENSE
├── Makefile                     # Common commands
├── requirements.txt             # Dependencies
├── pyproject.toml               # Project metadata
├── setup.py                     # Setup script
├── .env.example                 # Environment template
├── .gitignore
└── .dockerignore
```

### Source Code (`src/`)
```
src/zolai/
├── __init__.py
├── cli.py                       # CLI entry point
├── core/                        # Core functionality
│   ├── dictionary.py
│   ├── grammar.py
│   ├── concepts.py
│   └── learnings.py
├── services/                    # Business logic
│   ├── translator.py
│   ├── validator.py
│   ├── analyzer.py
│   └── crawler.py
├── models/                      # Data models
│   ├── entry.py
│   ├── rule.py
│   └── concept.py
├── utils/                       # Utilities
│   ├── io.py
│   ├── validation.py
│   └── formatting.py
└── api/                         # FastAPI endpoints
    ├── routes.py
    └── schemas.py
```

### Scripts (`scripts/`)
```
scripts/
├── crawlers/                    # Web scrapers
│   ├── tongdot.py
│   ├── rvasia.py
│   └── zomidaily.py
├── data_pipeline/              # Data processing
│   ├── extract.py
│   ├── transform.py
│   └── load.py
├── training/                   # Model training
│   ├── prepare.py
│   ├── train.py
│   └── evaluate.py
├── maintenance/                # Quality checks
│   ├── validate.py
│   ├── audit.py
│   └── cleanup.py
└── deploy/                     # Deployment
    ├── build.py
    └── release.py
```

### Data (`data/`)
```
data/
├── master/                     # Master datasets
│   ├── sources/                # Individual sources
│   ├── combined/               # Merged datasets
│   └── archive/                # Versioned snapshots
├── processed/                  # Processed data
│   ├── rebuild_v9/             # Latest rebuild
│   ├── dictionaries/
│   └── exports/
├── raw/                        # Raw scraped data
│   ├── zomidictionary/
│   ├── wordlists/
│   └── bible/
└── history/                    # Crawl logs
```

### Knowledge (`knowledge/`)
```
knowledge/
├── wiki/                       # Linguistic wiki
│   ├── grammar/                # Grammar rules
│   ├── vocabulary/             # Vocabulary
│   ├── culture/                # Cultural context
│   ├── curriculum/             # Learning curriculum
│   ├── architecture/           # System architecture
│   └── decisions/              # Design decisions
├── bible/                      # Bible corpus
│   ├── parallel/               # Parallel texts
│   ├── tdb77/                  # TDB77 version
│   └── tedim/                  # Tedim version
└── concepts/                   # Extracted concepts
    ├── linguistic/
    ├── cultural/
    └── domain/
```

### Registries (`agents/` and `skills/`)
```
agents/
├── registry.yaml               # Central registry
└── definitions/                # Individual definitions

skills/
├── registry.yaml               # Central registry
└── definitions/                # Individual definitions
```

---

## 🔄 MIGRATION STEPS

### Step 1: Backup
```bash
# Create backup
tar -czf zolai_backup_$(date +%Y%m%d).tar.gz .
```

### Step 2: Create New Structure
```bash
# Run restructuring script
python scripts/restructure_project.py
```

### Step 3: Move Source Code
```bash
# Move main package
mkdir -p src
mv zolai src/

# Move scripts (already in right place)
# Keep scripts/ as is
```

### Step 4: Move Knowledge
```bash
# Create knowledge directory
mkdir -p knowledge

# Move wiki
mv wiki knowledge/

# Move Bible corpus
mv Cleaned_Bible knowledge/bible
```

### Step 5: Consolidate Data
```bash
# Data structure should already be in place
# Verify master/processed/raw separation
ls -la data/master/
ls -la data/processed/
ls -la data/raw/
```

### Step 6: Create Registries
```bash
# Registries created by restructure_project.py
cat agents/registry.yaml
cat skills/registry.yaml
```

### Step 7: Update Imports
```bash
# Find all imports that need updating
grep -r "from zolai" src/
grep -r "import zolai" src/

# Update to: from src.zolai import ...
# Or update PYTHONPATH in setup.py
```

### Step 8: Test Everything
```bash
# Run tests
pytest tests/

# Run linting
ruff check src/ scripts/

# Run type checking
mypy src/ scripts/
```

### Step 9: Verify APIs
```bash
# Test dictionary API
python -m zolai.api

# Test CLI
python -m zolai --help

# Test scripts
python scripts/crawlers/tongdot.py --help
```

### Step 10: Commit Changes
```bash
# Add all changes
git add -A

# Commit
git commit -m "refactor: restructure project for clarity and maintainability"

# Push
git push origin main
```

---

## 📋 CONSOLIDATION CHECKLIST

### Duplicate Files
- [ ] Keep single `README.md` at root
- [ ] Keep single `pyproject.toml` at root
- [ ] Keep single `.env.example` at root
- [ ] Keep single `AGENTS.md` at root
- [ ] Remove all other copies

### Empty Directories
- [ ] Remove `graph/`
- [ ] Remove `experiments/`
- [ ] Remove `teams/`
- [ ] Remove `scratch/`
- [ ] Remove `todo/`
- [ ] Remove `archive/` (consolidate into `data/archive/`)
- [ ] Remove `clean/`
- [ ] Remove `dataset/`
- [ ] Remove `kaggle_dataset/`

### Duplicate Packages
- [ ] Move `zolai/` to `src/zolai/`
- [ ] Keep `scripts/` as is
- [ ] Remove duplicate `api/` (consolidate into `src/zolai/api/`)

### Registries
- [ ] Create `agents/registry.yaml`
- [ ] Create `skills/registry.yaml`
- [ ] Move agent definitions to `agents/definitions/`
- [ ] Move skill definitions to `skills/definitions/`

### Documentation
- [ ] Update `README.md` with new structure
- [ ] Create `ARCHITECTURE.md`
- [ ] Create `CONTRIBUTING.md`
- [ ] Update all import statements
- [ ] Update all file paths

---

## 🎯 BENEFITS

### Cleaner Structure
✅ Single source of truth for each file  
✅ Clear separation of concerns  
✅ Easy to navigate and understand  
✅ Consistent naming conventions  

### Better Maintainability
✅ No duplicate files to maintain  
✅ Centralized configuration  
✅ Clear dependency graph  
✅ Easier to find things  

### Improved Performance
✅ Faster file lookups  
✅ Reduced disk usage  
✅ Cleaner git history  
✅ Faster builds  

### Enhanced Collaboration
✅ Clear contribution guidelines  
✅ Standardized structure  
✅ Easy onboarding  
✅ Better code reviews  

---

## 📊 EXPECTED RESULTS

### Before
- 274 directories
- 19,815 duplicate files
- 50 empty directories
- 25GB+ total size
- Unclear structure

### After
- ~100 directories
- 0 duplicate files
- 0 empty directories
- ~15GB total size (cleaned)
- Crystal clear structure

---

## 🚀 IMPLEMENTATION TIMELINE

### Phase 1: Preparation (1 hour)
- [ ] Backup project
- [ ] Review new structure
- [ ] Create migration plan

### Phase 2: Restructuring (2 hours)
- [ ] Run restructure script
- [ ] Move directories
- [ ] Create registries

### Phase 3: Updates (3 hours)
- [ ] Update imports
- [ ] Update documentation
- [ ] Update configuration

### Phase 4: Testing (2 hours)
- [ ] Run test suite
- [ ] Verify APIs
- [ ] Verify scripts

### Phase 5: Deployment (1 hour)
- [ ] Commit changes
- [ ] Push to repository
- [ ] Deploy to production

**Total Time: ~9 hours**

---

## 📞 SUPPORT

### Questions?
- Review `ARCHITECTURE.md` for system design
- Check `CONTRIBUTING.md` for guidelines
- See `docs/` for detailed documentation

### Issues?
- Check git history for changes
- Review backup if needed
- Contact team lead

---

## ✅ COMPLETION CHECKLIST

- [ ] Backup created
- [ ] New structure created
- [ ] Files moved
- [ ] Duplicates consolidated
- [ ] Registries created
- [ ] Imports updated
- [ ] Tests passing
- [ ] APIs verified
- [ ] Documentation updated
- [ ] Changes committed
- [ ] Changes deployed

---

**Status: Ready for Implementation**

**Next Action: Run `python scripts/restructure_project.py`**
