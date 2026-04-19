# Zolai Project Startup Guide

## Quick Start (5 minutes)

```bash
# 1. Install dependencies
pip install -r requirements.txt
pip install -e ".[dev]"

# 2. Verify installation
python -c "from zolai.utils import get_device; get_device()"

# 3. Run CLI
zolai --help

# 4. Run menu
python scripts/ui/zolai_menu.py
```

## Project Structure

```
zolai/                    # Main package
├── utils/               # Device & data utilities
├── cli/                 # CLI commands
├── api/                 # FastAPI server
└── ...                  # Other modules

scripts/                 # All scripts
├── crawlers/           # Web scrapers
├── data_pipeline/      # Data processing
├── training/           # Training scripts
├── maintenance/        # Cleanup & validation
├── synthesis/          # Instruction synthesis
├── deploy/             # Deployment
├── dev/                # Test files
└── ui/                 # Chat UI & menu

data/                   # Unified data (~25GB)
├── corpus/            # Source corpora (bible, news, synthetic, hymns)
├── dictionary/        # Dictionary data (raw, processed, wordlists)
├── parallel/          # ZO↔EN parallel pairs
├── training/          # Ready-to-train datasets (v3, ORPO, instructions)
├── eval/              # Evaluation datasets (QA, translation, ZVS)
├── db/                # SQLite databases
├── runs/              # Training run outputs
├── archive/           # Superseded data
├── exports/           # Exported data (CSV, TSV)
├── adapter/           # LoRA adapter checkpoints
├── raw/               # Raw scraped data
└── logs/              # Crawl logs, pipeline progress
```

## Key Commands

### CLI
```bash
zolai standardize-jsonl -i INPUT -o OUTPUT [--dedupe] [--min-chars N]
zolai audit-jsonl -i INPUT [--text-field FIELD]
```

### Scripts
```bash
# Data collection
python scripts/crawlers/fetch_tongdot_dictionary.py --input FILE --output FILE

# Data processing
python scripts/data_pipeline/combine_and_categorize.py

# Training
python scripts/training/synthesize_instructions_v6.py

# Quality checks
python scripts/maintenance/analyze_disk_usage.py
python scripts/maintenance/test_grammar_rules.py
```

### Menu
```bash
python scripts/ui/zolai_menu.py
```

## System Optimization

**Your Machine:**
- CPU: 4 cores
- RAM: 7.7GB
- Disk: 233GB (88% full)
- GPU: None (CPU-only)

**Optimizations Applied:**
- CPU threading: `torch.set_num_threads(4)`
- Gradient checkpointing: `gradient_checkpointing=True`
- Batch accumulation: `gradient_accumulation_steps=4`
- Memory-efficient data loading: `batch_stream_jsonl()`

**Use for training:**
```bash
accelerate config --config_file config/cpu_optimization.yaml
accelerate launch scripts/training/train.py
```

## Development

### Code Style
```bash
# Lint
ruff check src/ scripts/

# Auto-fix
ruff check --fix src/ scripts/

# Type check
mypy src/ scripts/
```

### Testing
```bash
# Run tests (when available)
pytest tests/

# Validate JSONL
python -c "import json; [json.loads(l) for l in open('output.jsonl')]"

# Test grammar rules
python scripts/maintenance/test_grammar_rules.py
```

## Troubleshooting

### Import errors
```bash
# Reinstall package
pip install -e . --break-system-packages
```

### Memory issues
- Use `batch_stream_jsonl()` instead of loading full files
- Reduce batch size: `get_batch_size(base_size=4)`
- Enable gradient checkpointing in training config

### Disk space (88% full)
```bash
# Clean __pycache__
find . -type d -name __pycache__ -exec rm -rf {} +

# Archive old data
tar -czf data/archive_old_backup.tar.gz data/archive_old/
```

## Next Steps

1. **Data Pipeline** — Run `scripts/data_pipeline/` to process datasets
2. **Training** — Use `scripts/training/` with CPU optimization config
3. **Quality** — Run `scripts/maintenance/test_grammar_rules.py` to validate
4. **Deployment** — Use `scripts/deploy/` for server setup

## Resources

- **Grammar Rules:** `wiki/grammar/`
- **Curriculum:** `wiki/curriculum/`
- **Dictionary:** `data/dictionary/processed/`
- **Bible Corpus:** `data/corpus/bible/`
- **Training Data:** `data/training/`
- **GEMINI.md:** `GEMINI.md` — Gemini CLI context file at project root (load with `gemini -f GEMINI.md`)

---

**Last Updated:** 2026-04-20
**Restructured:** Phases 1-5 complete
