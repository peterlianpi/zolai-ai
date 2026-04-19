# 🏗️ ZOLAI PROJECT RESTRUCTURING PLAN

**Status:** Planning Phase  
**Goal:** Clean, powerful, connected structure with no duplicates

---

## 📊 CURRENT STATE ANALYSIS

### Issues Found
- **19,815 duplicate files** (mostly README.md copies)
- **50 empty directories** (graph, experiments, tests, teams, etc.)
- **Large directories:** website (2.2GB), resources (948MB), data (21GB), kaggle_bundle (674MB)
- **Structure problems:**
  - `agents/` and `skills/` are scattered (23 agents, 37 skills)
  - `scripts/` and `zolai/` are duplicates
  - `wiki/` has 25 subdirectories with unclear hierarchy
  - `data/` lacks clear master/processed/raw separation

---

## 🎯 NEW STRUCTURE (CLEAN & POWERFUL)

```
zolai/
├── README.md                          # Single source of truth
├── ARCHITECTURE.md                    # System design
├── CONTRIBUTING.md                    # Contribution guidelines
├── LICENSE                            # License
│
├── .github/                           # GitHub config
│   ├── workflows/                     # CI/CD pipelines
│   └── ISSUE_TEMPLATE/
│
├── src/                               # Main source code
│   └── zolai/
│       ├── __init__.py
│       ├── cli.py                     # CLI entry point
│       ├── core/                      # Core functionality
│       │   ├── dictionary.py
│       │   ├── grammar.py
│       │   ├── concepts.py
│       │   └── learnings.py
│       ├── services/                  # Business logic
│       │   ├── translator.py
│       │   ├── validator.py
│       │   ├── analyzer.py
│       │   └── crawler.py
│       ├── models/                    # Data models
│       │   ├── entry.py
│       │   ├── rule.py
│       │   └── concept.py
│       ├── utils/                     # Utilities
│       │   ├── io.py
│       │   ├── validation.py
│       │   └── formatting.py
│       └── api/                       # FastAPI endpoints
│           ├── routes.py
│           └── schemas.py
│
├── scripts/                           # Standalone scripts
│   ├── crawlers/                      # Web scrapers
│   │   ├── tongdot.py
│   │   ├── rvasia.py
│   │   └── zomidaily.py
│   ├── data_pipeline/                 # Data processing
│   │   ├── extract.py
│   │   ├── transform.py
│   │   └── load.py
│   ├── training/                      # Model training
│   │   ├── prepare.py
│   │   ├── train.py
│   │   └── evaluate.py
│   ├── maintenance/                   # Quality checks
│   │   ├── validate.py
│   │   ├── audit.py
│   │   └── cleanup.py
│   └── deploy/                        # Deployment
│       ├── build.py
│       └── release.py
│
├── tests/                             # Test suite
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── data/                              # Data directory
│   ├── master/                        # Master datasets
│   │   ├── sources/                   # Individual sources
│   │   ├── combined/                  # Merged datasets
│   │   └── archive/                   # Versioned snapshots
│   ├── processed/                     # Processed data
│   │   ├── rebuild_v9/                # Latest rebuild
│   │   ├── dictionaries/
│   │   └── exports/
│   ├── raw/                           # Raw scraped data
│   │   ├── zomidictionary/
│   │   ├── wordlists/
│   │   └── bible/
│   └── history/                       # Crawl logs
│
├── knowledge/                         # Knowledge base
│   ├── wiki/                          # Linguistic wiki
│   │   ├── grammar/                   # Grammar rules
│   │   ├── vocabulary/                # Vocabulary
│   │   ├── culture/                   # Cultural context
│   │   ├── curriculum/                # Learning curriculum
│   │   ├── architecture/              # System architecture
│   │   └── decisions/                 # Design decisions
│   ├── bible/                         # Bible corpus
│   │   ├── parallel/                  # Parallel texts
│   │   ├── tdb77/                     # TDB77 version
│   │   └── tedim/                     # Tedim version
│   └── concepts/                      # Extracted concepts
│       ├── linguistic/
│       ├── cultural/
│       └── domain/
│
├── models/                            # Trained models
│   ├── checkpoints/
│   ├── lora/
│   └── configs/
│
├── api/                               # API server
│   ├── main.py
│   ├── requirements.txt
│   └── docker-compose.yml
│
├── website/                           # Web interface
│   └── zolai-project/                 # Next.js app
│
├── config/                            # Configuration
│   ├── settings.yaml
│   ├── logging.yaml
│   └── database.yaml
│
├── docs/                              # Documentation
│   ├── guides/
│   ├── api/
│   ├── architecture/
│   └── tutorials/
│
├── agents/                            # Agent registry (YAML)
│   ├── registry.yaml                  # Single source of truth
│   └── definitions/                   # Individual agent definitions
│
├── skills/                            # Skill registry (YAML)
│   ├── registry.yaml                  # Single source of truth
│   └── definitions/                   # Individual skill definitions
│
├── notebooks/                         # Jupyter notebooks
│   ├── exploration/
│   ├── analysis/
│   └── training/
│
├── requirements.txt                   # Python dependencies
├── pyproject.toml                     # Project metadata
├── setup.py                           # Setup script
├── Makefile                           # Common commands
├── .env.example                       # Environment template
├── .gitignore                         # Git ignore rules
└── .dockerignore                      # Docker ignore rules
```

---

## 🔄 CONSOLIDATION STRATEGY

### 1. **Eliminate Duplicates**
- Keep single `README.md` at root
- Keep single `pyproject.toml` at root
- Remove duplicate `.env.example` files
- Remove duplicate test files

### 2. **Consolidate Agents**
- Create `agents/registry.yaml` with all 23 agents
- Move individual agent definitions to `agents/definitions/`
- Link from registry to definitions

### 3. **Consolidate Skills**
- Create `skills/registry.yaml` with all 37 skills
- Move individual skill definitions to `skills/definitions/`
- Link from registry to definitions

### 4. **Organize Scripts**
- Keep `scripts/` for standalone utilities
- Organize by function: crawlers, data_pipeline, training, maintenance, deploy
- Move core logic to `src/zolai/services/`

### 5. **Restructure Data**
- `data/master/` — Master datasets (sources, combined, archive)
- `data/processed/` — Processed data (rebuild_v9, dictionaries, exports)
- `data/raw/` — Raw scraped data
- `data/history/` — Crawl logs and history

### 6. **Reorganize Wiki**
- `knowledge/wiki/grammar/` — Grammar rules
- `knowledge/wiki/vocabulary/` — Vocabulary
- `knowledge/wiki/culture/` — Cultural context
- `knowledge/wiki/curriculum/` — Learning curriculum
- `knowledge/wiki/architecture/` — System architecture
- `knowledge/wiki/decisions/` — Design decisions

### 7. **Clean Up Empty Directories**
- Remove: `graph/`, `experiments/`, `tests/` (move to `tests/`)
- Remove: `teams/`, `scratch/`, `todo/`
- Remove: `archive/` (consolidate into `data/archive/`)

### 8. **Consolidate Duplicates**
- `zolai/` package → `src/zolai/`
- `scripts/` → Keep but reorganize
- Remove duplicate `api/` → Keep in `src/zolai/api/`

---

## 📋 MIGRATION CHECKLIST

### Phase 1: Preparation
- [ ] Backup entire project
- [ ] Create new directory structure
- [ ] Document all file locations

### Phase 2: Core Reorganization
- [ ] Move `src/zolai/` to new location
- [ ] Move `scripts/` to new location
- [ ] Move `data/` to new location
- [ ] Move `knowledge/` to new location

### Phase 3: Consolidation
- [ ] Create `agents/registry.yaml`
- [ ] Create `skills/registry.yaml`
- [ ] Consolidate duplicate files
- [ ] Remove empty directories

### Phase 4: Cleanup
- [ ] Remove old directories
- [ ] Update all imports
- [ ] Update all documentation
- [ ] Verify all tests pass

### Phase 5: Verification
- [ ] Run full test suite
- [ ] Verify all scripts work
- [ ] Verify all APIs work
- [ ] Verify all imports resolve

---

## 🎯 BENEFITS

### Cleaner Structure
- Single source of truth for each file
- Clear separation of concerns
- Easy to navigate and understand

### Better Maintainability
- No duplicate files to maintain
- Centralized configuration
- Clear dependency graph

### Improved Performance
- Faster file lookups
- Reduced disk usage
- Cleaner git history

### Enhanced Collaboration
- Clear contribution guidelines
- Standardized structure
- Easy onboarding

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

## 🚀 NEXT STEPS

1. **Create new structure** — Build clean directory tree
2. **Migrate files** — Move files to new locations
3. **Update imports** — Fix all import statements
4. **Consolidate configs** — Merge duplicate configs
5. **Test everything** — Verify all systems work
6. **Document** — Update all documentation
7. **Deploy** — Push to production

---

**Status: Ready for Implementation**
