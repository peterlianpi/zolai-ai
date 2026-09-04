# 🧠 ZOLAI PROJECT RESTRUCTURING GUIDE — WIKI-FIRST ARCHITECTURE

**Status:** ✅ **FINAL — WIKI-FIRST ARCHITECTURE DEFINED**
**Date:** 2026-04-16
**Principle:** Wiki is the central knowledge system — everything else serves it
**Last Updated:** 2026-09-03

---

## 📊 EXECUTIVE SUMMARY

### Current State (Problems)
- **19,815 duplicate files** (mostly README.md copies)
- **50 empty directories** (graph, experiments, tests, teams, etc.)
- **274 total directories** (too many, unclear hierarchy)
- **Scattered agents** (23 agents scattered in agents/)
- **Scattered skills** (37 skills scattered in skills/)
- **Duplicate packages** (zolai/ and scripts/ overlap)
- **Unclear wiki** (25 subdirectories with no clear hierarchy)
- **Messy data** (no clear master/processed/raw separation)
- **25GB+ total size** (bloated with duplicates)

### New State (Solution)
- **~100 directories** (organized and clear)
- **0 duplicate files** (single source of truth)
- **0 empty directories** (clean)
- **Centralized agents** (agents/registry.yaml)
- **Centralized skills** (skills/registry.yaml)
- **Single package** (src/zolai/)
- **Clear wiki hierarchy** (grammar, vocabulary, culture, curriculum, architecture, decisions)
- **Clean data structure** (master/processed/raw/history)
- **~15GB total size** (cleaned and optimized)

---

## 🧠 WIKI-FIRST ARCHITECTURE

### The Principle
Wiki is the main brain. Server implements it. Scripts maintain it. DB stores it.
Everything else serves the wiki.

### Final Structure

```
zolai/
├── wiki/                        # 🧠 MAIN BRAIN (Priority 1)
│   ├── README.md
│   ├── architecture/
│   ├── grammar/
│   ├── vocabulary/
│   ├── culture/
│   ├── curriculum/
│   ├── linguistics/
│   ├── biblical/
│   ├── concepts/
│   ├── decisions/
│   ├── patterns/
│   ├── examples/
│   └── references/
│
├── src/zolai/                   # Code that implements wiki knowledge
│   ├── __init__.py
│   ├── cli.py                   # CLI entry point
│   ├── core/
│   │   ├── dictionary.py
│   │   ├── grammar.py
│   │   ├── concepts.py
│   │   └── learnings.py
│   ├── services/
│   │   ├── translator.py
│   │   ├── validator.py
│   │   ├── analyzer.py
│   │   └── crawler.py
│   ├── models/
│   │   ├── entry.py
│   │   ├── rule.py
│   │   └── concept.py
│   ├── utils/
│   │   ├── io.py
│   │   ├── validation.py
│   │   └── formatting.py
│   └── api/
│       ├── routes.py
│       └── schemas.py
│
├── scripts/                     # Scripts that extract/update wiki
│   ├── crawlers/                # Extract from sources
│   ├── data_pipeline/           # Process into wiki
│   ├── training/                # Train from wiki
│   ├── maintenance/             # Maintain wiki
│   └── deploy/
│
├── data/                        # Data that feeds wiki
│   ├── master/                  # Master datasets
│   │   ├── sources/
│   │   ├── combined/
│   │   └── archive/
│   ├── processed/               # Processed data
│   │   ├── dictionaries/
│   │   └── exports/
│   ├── raw/                     # Raw sources
│   │   ├── zomidictionary/
│   │   ├── wordlists/
│   │   └── bible/
│   └── history/                 # Crawl logs
│
├── tests/                       # Tests validate wiki
├── docs/                        # Docs reference wiki
├── notebooks/                   # Notebooks explore wiki
├── models/                      # Trained models
├── api/                         # API server
├── website/                     # Web interface (untouched)
│   └── zolai-project/
├── config/                      # Configuration
├── agents/                      # Agent registry
│   ├── registry.yaml
│   └── definitions/
├── skills/                      # Skill registry
│   ├── registry.yaml
│   └── definitions/
├── db/                          # Database (store knowledge)
│   ├── README.md
│   ├── schema.sql
│   ├── migrations/
│   └── seeds/
├── requirements.txt
├── pyproject.toml
├── README.md
├── ARCHITECTURE.md
├── CONTRIBUTING.md
├── Makefile
├── .env.example
├── .gitignore
└── .dockerignore
```

### Wiki Contents
- **Grammar rules** — How language works
- **Vocabulary** — Words and meanings
- **Concepts** — Linguistic concepts
- **Patterns** — Language patterns
- **Culture** — Cultural context
- **Curriculum** — Learning structure
- **Architecture** — System design
- **Decisions** — Why we chose this

### Everything Else Serves Wiki
- **Code** — Implements wiki knowledge
- **Scripts** — Extract/update wiki
- **Data** — Feeds wiki
- **Tests** — Validate wiki
- **Docs** — Reference wiki
- **Notebooks** — Explore wiki

### Flow
```
Sources → Scripts → Data → Wiki ← Code/Tests/Docs
                       ↓
                    Knowledge
```

---

## 📁 DATA STRUCTURE

```
data/
├── master/                    # Master datasets
│   ├── sources/               # Individual sources
│   ├── combined/              # Merged datasets
│   └── archive/               # Versioned snapshots
├── processed/                 # Processed data
│   ├── dictionaries/
│   └── exports/
├── raw/                       # Raw scraped data
│   ├── zomidictionary/
│   ├── wordlists/
│   └── bible/
└── history/                   # Crawl logs
```

### Database Structure

**Recommended: PostgreSQL + SQLite**

| Environment | Database | Notes |
|-------------|----------|-------|
| Production | PostgreSQL | Main database, scalable, multi-user |
| Development | SQLite | Lightweight, file-based, good for testing |

### Database Schema (Key Tables)

```sql
-- Dictionary entries
CREATE TABLE entries (
    id TEXT PRIMARY KEY,
    en TEXT, zo TEXT,
    confidence REAL, dict_count INT, frequency INT,
    learning_count INT, created_at TIMESTAMP, updated_at TIMESTAMP
);

-- Grammar rules
CREATE TABLE grammar_rules (
    id TEXT PRIMARY KEY, rule_name TEXT, pattern TEXT,
    explanation TEXT, examples TEXT, category TEXT, confidence REAL
);

-- Wiki concepts
CREATE TABLE wiki_concepts (
    id TEXT PRIMARY KEY, concept TEXT, category TEXT,
    definition TEXT, examples TEXT, related_concepts TEXT, confidence REAL
);

-- Project learnings
CREATE TABLE project_learnings (
    id TEXT PRIMARY KEY, category TEXT, topic TEXT,
    learning TEXT, source TEXT, confidence REAL,
    vision_alignment TEXT, improvement_area TEXT
);
```

---

## 🔄 MIGRATION STEPS

### Step 1: Backup
```bash
tar -czf zolai_backup_$(date +%Y%m%d).tar.gz .
```

### Step 2: Organize Wiki (Priority 1)
```bash
mkdir -p wiki/{architecture,grammar,vocabulary,culture,curriculum,linguistics,biblical,concepts,decisions,patterns,examples,references}
# Move existing wiki files, consolidate knowledge, create index
```

### Step 3: Update Code to Reference Wiki
- Code reads from wiki/
- Scripts update wiki/
- Tests validate wiki/

### Step 4: Organize Data (Priority 2)
- master/ — Raw sources
- processed/ — Processed data
- raw/ — Scraped data
- history/ — Logs

### Step 5: Organize Code (Priority 3)
- src/zolai/ — Main package
- scripts/ — Utilities
- tests/ — Validation

### Step 6: Create Registries
```bash
# Create agents/registry.yaml and skills/registry.yaml
# Move definitions to agents/definitions/ and skills/definitions/
```

### Step 7: Clean Everything Else (Priority 4)
- Remove duplicates
- Remove empty dirs
- Remove: graph/, experiments/, teams/, scratch/, todo/
- Remove: archive/ (consolidate into data/archive/), clean/, dataset/, kaggle_dataset/
- Move zolai/ to src/zolai/
- Keep scripts/ as is

### Step 8: Update Imports
```bash
grep -r "from zolai" src/
grep -r "import zolai" src/
# Update imports to match new src/zolai/ location
```

### Step 9: Test Everything
```bash
pytest tests/
ruff check src/ scripts/
mypy src/ scripts/
```

### Step 10: Commit
```bash
git add -A
git commit -m "refactor: restructure project for clarity and maintainability"
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

### Benefits
✅ Single source of truth for each file
✅ Clear separation of concerns
✅ Easy to navigate and understand
✅ Consistent naming conventions
✅ No duplicate files to maintain
✅ Centralized configuration
✅ Clear dependency graph
✅ Faster file lookups
✅ Reduced disk usage
✅ Cleaner git history
✅ Better collaboration
✅ Easier onboarding

---

## 📅 IMPLEMENTATION TIMELINE

| Phase | Task | Time |
|-------|------|------|
| 1 | Preparation (backup, review) | 1 hour |
| 2 | Restructuring (run script, verify) | 2 hours |
| 3 | Updates (imports, docs, config) | 3 hours |
| 4 | Testing (tests, linting, type check) | 2 hours |
| 5 | Deployment (commit, push, deploy) | 1 hour |
| **Total** | | **~9 hours** |

---

## 📜 HISTORY OF THE PLAN

The restructuring plan evolved through several documents before settling on the wiki-first architecture:

1. **`docs/archive/PROJECT_STRUCTURE_PLAN.md`** — Original planning phase document with current-state analysis and new structure design. Established the goals: clean, powerful, connected structure with zero duplicates.
2. **`docs/archive/RESTRUCTURING_GUIDE.md`** — Step-by-step implementation guide with migration commands, consolidation checklist, testing procedures, and timeline.
3. **`docs/archive/PROJECT_RESTRUCTURING_SUMMARY.md`** — Complete analysis with executive summary, deliverables, and expected results/benefits.
4. **`docs/archive/FINAL_STRUCTURE.md`** — Detailed final structure including wiki-first architecture, server structure, database recommendations, and the wiki-first flow diagram.
5. **`docs/archive/RESTRUCTURING_WIKI_FIRST.md`** — The canonical wiki-first architecture: wiki as main brain, everything else serves it. Consolidated all prior planning into the final, accurate description.

**Current canonical source:** This file (RESTRUCTURING_GUIDE.md). The wiki-first architecture described here is the single source of truth for the Zolai project structure.

---

## 📞 SUPPORT

- Review `ARCHITECTURE.md` for system design
- Check `CONTRIBUTING.md` for guidelines
- See `docs/` for detailed documentation

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

**Status: ✅ FINAL — WIKI-FIRST ARCHITECTURE DEFINED**

**Principle: Wiki is the main brain — everything else serves it**
