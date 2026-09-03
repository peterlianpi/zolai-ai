# 🧠 ZOLAI PROJECT RESTRUCTURING: WIKI-FIRST ARCHITECTURE

**Status:** ✅ **WIKI AS MAIN BRAIN**  
**Date:** 2026-04-16  
**Principle:** Wiki is the central knowledge system — everything else serves it

---

## 🎯 WIKI-FIRST STRUCTURE

```
zolai/
├── wiki/                        # 🧠 MAIN BRAIN (central knowledge)
│   ├── README.md                # Wiki index
│   ├── architecture/            # System design & decisions
│   ├── grammar/                 # Grammar rules & patterns
│   ├── vocabulary/              # Vocabulary & lexicon
│   ├── culture/                 # Cultural context
│   ├── curriculum/              # Learning curriculum
│   ├── linguistics/             # Linguistic analysis
│   ├── biblical/                # Biblical context
│   ├── concepts/                # Extracted concepts
│   ├── decisions/               # Design decisions
│   ├── patterns/                # Language patterns
│   ├── examples/                # Usage examples
│   └── references/              # External references
│
├── src/zolai/                   # Code that implements wiki knowledge
│   ├── core/
│   ├── services/
│   ├── models/
│   ├── utils/
│   └── api/
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
│   ├── processed/               # Processed data
│   ├── raw/                     # Raw sources
│   └── history/                 # Crawl logs
│
├── tests/                       # Tests validate wiki
├── docs/                        # Docs reference wiki
├── notebooks/                   # Notebooks explore wiki
│
└── [other directories]
```

---

## 🧠 WIKI AS BRAIN

### What Wiki Contains
- **Grammar rules** — How language works
- **Vocabulary** — Words and meanings
- **Concepts** — Linguistic concepts
- **Patterns** — Language patterns
- **Culture** — Cultural context
- **Curriculum** — Learning structure
- **Architecture** — System design
- **Decisions** — Why we chose this

### What Everything Else Does
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

## 📋 CONSOLIDATION (WIKI-FIRST)

### 1. Organize Wiki (Priority 1)
- Create clear hierarchy
- Consolidate all knowledge
- Link everything together
- Make it the source of truth

### 2. Organize Data (Priority 2)
- master/ — Raw sources
- processed/ — Processed data
- raw/ — Scraped data
- history/ — Logs

### 3. Organize Code (Priority 3)
- src/zolai/ — Main package
- scripts/ — Utilities
- tests/ — Validation

### 4. Clean Up (Priority 4)
- Remove duplicates
- Remove empty dirs
- Consolidate registries

---

## 🚀 IMPLEMENTATION

### Step 1: Organize Wiki
```bash
# Create wiki structure
mkdir -p wiki/{architecture,grammar,vocabulary,culture,curriculum,linguistics,biblical,concepts,decisions,patterns,examples,references}

# Move existing wiki files
# Consolidate knowledge
# Create index
```

### Step 2: Update Code to Reference Wiki
```bash
# Code reads from wiki/
# Scripts update wiki/
# Tests validate wiki/
```

### Step 3: Clean Everything Else
```bash
# Remove duplicates
# Remove empty dirs
# Consolidate registries
```

---

## 📊 WIKI STRUCTURE DETAIL

### wiki/architecture/
- System design
- Component relationships
- Data flow
- API design

### wiki/grammar/
- Grammar rules
- Patterns
- Constraints
- Examples

### wiki/vocabulary/
- Dictionary entries
- Word meanings
- Usage examples
- Domains

### wiki/culture/
- Cultural context
- Traditions
- Customs
- References

### wiki/curriculum/
- Learning levels
- Lesson structure
- Progression
- Resources

### wiki/linguistics/
- Linguistic analysis
- Language features
- Phonetics
- Morphology

### wiki/biblical/
- Bible context
- Verses
- Translations
- References

### wiki/concepts/
- Extracted concepts
- Relationships
- Definitions
- Examples

### wiki/decisions/
- Design decisions
- Why we chose this
- Alternatives considered
- Trade-offs

### wiki/patterns/
- Language patterns
- Usage patterns
- Common structures
- Variations

### wiki/examples/
- Usage examples
- Real sentences
- Context
- Translations

### wiki/references/
- External links
- Sources
- Bibliography
- Resources

---

## ✅ BENEFITS

### Wiki as Brain
✓ Single source of truth
✓ Easy to update
✓ Easy to reference
✓ Easy to learn from
✓ Easy to extend
✓ Easy to maintain

### Everything Serves Wiki
✓ Code implements wiki
✓ Scripts update wiki
✓ Data feeds wiki
✓ Tests validate wiki
✓ Docs reference wiki
✓ Clear purpose

---

## 🎯 NEXT STEPS

1. **Organize wiki/** — Create clear hierarchy
2. **Consolidate knowledge** — Move all knowledge to wiki
3. **Update code** — Reference wiki
4. **Update scripts** — Update wiki
5. **Clean everything else** — Remove duplicates
6. **Test everything** — Validate wiki

---

**Status: ✅ WIKI-FIRST ARCHITECTURE DEFINED**

**Principle: Wiki is the main brain — everything else serves it**
