# Zolai Quick Reference

## Installation & Setup
```bash
pip install -r requirements.txt
pip install -e ".[dev]"
python scripts/maintenance/validate_project.py
```

## CLI Commands
```bash
zolai standardize-jsonl -i INPUT -o OUTPUT [--dedupe]
zolai audit-jsonl -i INPUT
```

## Common Scripts
```bash
# Data collection
python scripts/crawlers/fetch_tongdot_dictionary.py --input FILE --output FILE

# Data processing
python scripts/data_pipeline/combine_and_categorize.py

# Training (CPU-optimized)
accelerate config --config_file config/cpu_optimization.yaml
accelerate launch scripts/training/train.py

# Quality checks
python scripts/maintenance/test_grammar_rules.py
python scripts/maintenance/analyze_disk_usage.py

# Interactive menu
python scripts/ui/zolai_menu.py
```

## Package Imports
```python
# Device & optimization
from zolai.utils import get_device, setup_cpu_optimization, get_batch_size

# Data loading
from zolai.utils import stream_jsonl, batch_stream_jsonl, count_jsonl_lines

# CLI
from zolai.cli.main import main
```

## Data Paths
```
data/master/sources/          # Individual JSONL files
data/master/combined/         # Merged datasets
data/master/bible/            # Bible corpus
data/processed/               # Cleaned data
data/raw/                     # Raw scraped data
```

## System Specs
- CPU: 4 cores
- RAM: 7.7GB
- Disk: 233GB (88% full)
- GPU: None (CPU-only)

## Optimization Tips
1. Use `batch_stream_jsonl()` for large files
2. Enable `gradient_checkpointing=True` in training
3. Use `gradient_accumulation_steps=4` to reduce batch size
4. Set `torch.set_num_threads(4)` for CPU optimization

## Troubleshooting
```bash
# Reinstall CLI
pip install -e . --break-system-packages

# Clean cache
find . -type d -name __pycache__ -exec rm -rf {} +

# Validate JSONL
python -c "import json; [json.loads(l) for l in open('file.jsonl')]"

# Check project
python scripts/maintenance/validate_project.py
```

## Documentation
- Grammar: `wiki/grammar/`
- Curriculum: `wiki/curriculum/`
- Architecture: `wiki/architecture/`
- Decisions: `wiki/decisions/`

---
**Last Updated:** 2026-04-16 | **Status:** ✅ Ready
