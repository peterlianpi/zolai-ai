# Zolai Logs & Temporary Files Structure

## Directory Organization

```
logs/                          # All application logs
├── cli/                       # CLI command logs
├── api/                       # API server logs
├── training/                  # Training run logs
├── crawlers/                  # Web crawler logs
├── data_pipeline/             # Data processing logs
└── maintenance/               # Maintenance task logs

tmp/                           # Temporary files
├── cache/                     # Cache files
├── processing/                # Processing intermediate files
├── models/                    # Temporary model files
└── datasets/                  # Temporary dataset files

scripts/*/logs/                # Component-specific logs
├── scripts/crawlers/logs/
├── scripts/data_pipeline/logs/
├── scripts/training/logs/
├── scripts/maintenance/logs/
├── scripts/deploy/logs/
└── ...

zolai/*/logs/                  # Module-specific logs
├── zolai/api/logs/
├── zolai/cli/logs/
└── ...
```

## Usage

### Python Logging
```python
from zolai.utils.logging import setup_logger

# Set up logger for your component
logger = setup_logger(__name__, component="training")

# Use it
logger.info("Training started")
logger.warning("Low memory")
logger.error("Training failed")
```

### CLI Logging
```bash
# Logs automatically saved to logs/cli/
zolai standardize-jsonl -i INPUT -o OUTPUT

# Check logs
tail -f logs/cli/cli_*.log
```

### Script Logging
```python
# In scripts/training/train.py
from zolai.utils.logging import training_logger

training_logger.info("Starting training...")
```

## Log Rotation

- **Max file size:** 10MB
- **Backup count:** 5 files
- **Format:** `component_YYYYMMDD.log`
- **Auto-rotation:** When file reaches 10MB

## Temporary Files

### Cache (`tmp/cache/`)
- Model cache
- Dataset cache
- Embedding cache

### Processing (`tmp/processing/`)
- Intermediate JSONL files
- Temporary CSV exports
- Processing state files

### Models (`tmp/models/`)
- Downloaded models
- Fine-tuned checkpoints
- Temporary model files

### Datasets (`tmp/datasets/`)
- Downloaded datasets
- Processed datasets
- Temporary splits

## Cleanup

```bash
# Clean old logs (keep last 7 days)
find logs/ -name "*.log" -mtime +7 -delete

# Clean temporary files
rm -rf tmp/cache/*
rm -rf tmp/processing/*

# Clean all tmp (careful!)
rm -rf tmp/*
```

## .gitignore Rules

```
logs/**/*.log      # Ignore all log files
logs/**/*.pid      # Ignore PID files
tmp/**/*           # Ignore all tmp files
!logs/.gitkeep     # Keep directory structure
!tmp/.gitkeep
```

---

**Last Updated:** 2026-04-16
