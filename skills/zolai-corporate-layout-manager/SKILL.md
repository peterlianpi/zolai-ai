# Skill: Zolai Corporate Layout Manager
# Triggers: "restructure zolai folders", "corporate zolai layout", "align projects data paths"

## Purpose
Manage and maintain the canonical data directory structure.

## Canonical Structure
```
data/
├── raw/           # Raw inputs (Bible USX, dictionary fetches, web crawls)
├── processed/     # Cleaned/standardized outputs
│   ├── bible/     # Parallel JSONL pairs
│   ├── dictionary/# Combined dictionary
│   ├── corpus/    # Unified text corpus
│   └── grammar/   # Grammar instructions
├── training/      # Train-ready datasets
│   ├── jsonl/     # JSONL splits
│   └── hf/        # HuggingFace DatasetDict
├── kaggle/        # Downloaded from Kaggle datasets
├── external/      # External data (PDFs, lessons)
└── archive/       # Old versions, backups
```

## Runner
```bash
python skills/setup-layout.py --root data/ --verify
```

## Rules
- Never delete existing data
- Create missing directories
- Report orphaned files
- Update symlinks for backward compatibility
