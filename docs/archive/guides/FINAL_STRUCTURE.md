# 🏗️ ZOLAI FINAL STRUCTURE: WIKI-FIRST + SERVER + DB

**Status:** ✅ **FINAL STRUCTURE DEFINED**  
**Date:** 2026-04-16  
**Principle:** Wiki is main brain, server implements it, scripts maintain it, db stores it

---

## 📁 FINAL STRUCTURE

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
├── server/                      # 🚀 SERVER (implements wiki)
│   ├── __init__.py
│   ├── main.py                  # FastAPI entry point
│   ├── cli.py                   # CLI entry point
│   ├── core/                    # Core functionality
│   │   ├── dictionary.py
│   │   ├── grammar.py
│   │   ├── concepts.py
│   │   └── learnings.py
│   ├── services/                # Business logic
│   │   ├── translator.py
│   │   ├── validator.py
│   │   ├── analyzer.py
│   │   └── crawler.py
│   ├── models/                  # Data models
│   │   ├── entry.py
│   │   ├── rule.py
│   │   └── concept.py
│   ├── utils/                   # Utilities
│   │   ├── io.py
│   │   ├── validation.py
│   │   └── formatting.py
│   ├── api/                     # API endpoints
│   │   ├── routes.py
│   │   └── schemas.py
│   └── config.py                # Configuration
│
├── scripts/                     # 📝 SCRIPTS (maintain wiki)
│   ├── crawlers/                # Extract from sources
│   │   ├── tongdot.py
│   │   ├── rvasia.py
│   │   └── zomidaily.py
│   ├── data_pipeline/           # Process into wiki
│   │   ├── extract.py
│   │   ├── transform.py
│   │   └── load.py
│   ├── training/                # Train from wiki
│   │   ├── prepare.py
│   │   ├── train.py
│   │   └── evaluate.py
│   ├── maintenance/             # Maintain wiki
│   │   ├── validate.py
│   │   ├── audit.py
│   │   └── cleanup.py
│   └── deploy/                  # Deployment
│       ├── build.py
│       └── release.py
│
├── db/                          # 💾 DATABASE (store knowledge)
│   ├── README.md                # DB documentation
│   ├── schema.sql               # Database schema
│   ├── migrations/              # Database migrations
│   │   ├── 001_init.sql
│   │   ├── 002_add_concepts.sql
│   │   └── 003_add_learnings.sql
│   ├── seeds/                   # Initial data
│   │   ├── grammar_rules.sql
│   │   ├── concepts.sql
│   │   └── vocabulary.sql
│   └── backups/                 # Database backups
│
├── data/                        # 📊 DATA (feeds wiki)
│   ├── master/                  # Master datasets
│   │   ├── sources/
│   │   ├── combined/
│   │   └── archive/
│   ├── processed/               # Processed data
│   │   ├── rebuild_v9/
│   │   ├── dictionaries/
│   │   └── exports/
│   ├── raw/                     # Raw scraped data
│   │   ├── zomidictionary/
│   │   ├── wordlists/
│   │   └── bible/
│   └── history/                 # Crawl logs
│
├── tests/                       # ✅ TESTS (validate wiki)
│   ├── unit/
│   ├── integration/
│   └── fixtures/
│
├── models/                      # 🤖 MODELS (trained)
│   ├── checkpoints/
│   ├── lora/
│   └── configs/
│
├── api/                         # 🔌 API SERVER
│   ├── main.py
│   ├── requirements.txt
│   └── docker-compose.yml
│
├── website/                     # 🌐 WEB INTERFACE (UNTOUCHED)
│   └── zolai-project/           # Keep as is - do not restructure
│
├── config/                      # ⚙️ CONFIGURATION
│   ├── settings.yaml
│   ├── logging.yaml
│   └── database.yaml
│
├── docs/                        # 📖 DOCUMENTATION
│   ├── guides/
│   ├── api/
│   ├── architecture/
│   └── tutorials/
│
├── agents/                      # 🤖 AGENTS
│   ├── registry.yaml
│   └── definitions/
│
├── skills/                      # 🛠️ SKILLS
│   ├── registry.yaml
│   └── definitions/
│
├── notebooks/                   # 📓 NOTEBOOKS
│   ├── exploration/
│   ├── analysis/
│   └── training/
│
├── README.md                    # Project README
├── ARCHITECTURE.md              # System design
├── CONTRIBUTING.md              # Contribution guidelines
├── Makefile                     # Common commands
├── requirements.txt             # Python dependencies
├── pyproject.toml               # Project metadata
├── setup.py                     # Setup script
├── .env.example                 # Environment template
├── .gitignore
└── .dockerignore
```

---

## 🗄️ DATABASE STRUCTURE

### Recommended: PostgreSQL + SQLite

**PostgreSQL** (Production)
- Main database
- Scalable
- Multi-user
- Transactions

**SQLite** (Development/Local)
- Lightweight
- No setup
- File-based
- Good for testing

### Database Location: `/db/`

```
db/
├── README.md                    # DB documentation
├── schema.sql                   # Main schema
├── migrations/                  # Version control
│   ├── 001_init.sql
│   ├── 002_add_concepts.sql
│   └── 003_add_learnings.sql
├── seeds/                       # Initial data
│   ├── grammar_rules.sql
│   ├── concepts.sql
│   └── vocabulary.sql
└── backups/                     # Backups
    ├── backup_2026_04_16.sql
    └── backup_2026_04_15.sql
```

### Database Schema

```sql
-- Dictionary entries
CREATE TABLE entries (
    id TEXT PRIMARY KEY,
    en TEXT,
    zo TEXT,
    confidence REAL,
    dict_count INT,
    frequency INT,
    learning_count INT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

-- Grammar rules
CREATE TABLE grammar_rules (
    id TEXT PRIMARY KEY,
    rule_name TEXT,
    pattern TEXT,
    explanation TEXT,
    examples TEXT,
    category TEXT,
    confidence REAL,
    source_file TEXT,
    created_at TIMESTAMP
);

-- Wiki concepts
CREATE TABLE wiki_concepts (
    id TEXT PRIMARY KEY,
    concept TEXT,
    category TEXT,
    definition TEXT,
    examples TEXT,
    related_concepts TEXT,
    confidence REAL,
    source_file TEXT,
    created_at TIMESTAMP
);

-- Project learnings
CREATE TABLE project_learnings (
    id TEXT PRIMARY KEY,
    category TEXT,
    topic TEXT,
    learning TEXT,
    source TEXT,
    confidence REAL,
    vision_alignment TEXT,
    improvement_area TEXT,
    created_at TIMESTAMP
);
```

---

## 🚀 SERVER STRUCTURE

### Entry Points

**FastAPI Server** (`server/main.py`)
```python
from fastapi import FastAPI
from server.api import routes

app = FastAPI()
app.include_router(routes.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

**CLI** (`server/cli.py`)
```python
import click

@click.group()
def cli():
    pass

@cli.command()
def translate():
    pass

@cli.command()
def validate():
    pass

if __name__ == "__main__":
    cli()
```

### API Endpoints

```
GET  /api/translate?word=hello&direction=en_zo
GET  /api/grammar?rule=sov
GET  /api/concepts?category=linguistic
GET  /api/vocabulary?domain=business
POST /api/validate
```

---

## 📝 SCRIPTS ORGANIZATION

### Crawlers (`scripts/crawlers/`)
- Extract from external sources
- Update data/raw/

### Data Pipeline (`scripts/data_pipeline/`)
- Extract from data/raw/
- Transform into wiki format
- Load into db/

### Training (`scripts/training/`)
- Prepare training data
- Train models
- Evaluate results

### Maintenance (`scripts/maintenance/`)
- Validate wiki
- Audit data
- Cleanup

### Deploy (`scripts/deploy/`)
- Build server
- Release version

---

## 💾 DATABASE RECOMMENDATIONS

### PostgreSQL (Recommended for Production)
```bash
# Install
brew install postgresql

# Start
brew services start postgresql

# Create database
createdb zolai

# Connect
psql zolai

# Run migrations
psql zolai < db/schema.sql
```

### SQLite (Recommended for Development)
```bash
# Create database
sqlite3 db/zolai.db < db/schema.sql

# Query
sqlite3 db/zolai.db "SELECT * FROM entries LIMIT 10;"
```

### Connection String
```
PostgreSQL: postgresql://user:password@localhost:5432/zolai
SQLite: sqlite:///db/zolai.db
```

---

## 🔄 FLOW: WIKI-FIRST

```
Sources
  ↓
Scripts/Crawlers (extract)
  ↓
Data/Raw (store raw)
  ↓
Scripts/Data_Pipeline (transform)
  ↓
DB (store processed)
  ↓
Wiki (reference)
  ↓
Server (implement)
  ↓
API (expose)
  ↓
Tests (validate)
```

---

## 📊 PRIORITIES

1. **Wiki** — Main brain (organize first)
2. **DB** — Store knowledge (setup second)
3. **Server** — Implement wiki (build third)
4. **Scripts** — Maintain wiki (automate fourth)
5. **Everything else** — Support systems

---

## ✅ BENEFITS

### Clean Structure
✓ Wiki is main brain
✓ Server implements wiki
✓ Scripts maintain wiki
✓ DB stores wiki
✓ Clear separation of concerns

### Easy to Maintain
✓ Single source of truth (wiki)
✓ Clear data flow
✓ Easy to add features
✓ Easy to scale

### Easy to Deploy
✓ Server is standalone
✓ DB is separate
✓ Scripts are independent
✓ Easy to containerize

---

## 🚀 NEXT STEPS

1. **Organize wiki/** — Create hierarchy
2. **Setup db/** — Create schema
3. **Build server/** — Implement API
4. **Organize scripts/** — Maintain wiki
5. **Test everything** — Validate

---

**Status: ✅ FINAL STRUCTURE DEFINED**

**Principle: Wiki is main brain, server implements it, scripts maintain it, db stores it**
