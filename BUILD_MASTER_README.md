# Build Master Dataset

This script builds a unified master dataset from all Zolai language resources.

## Quick Start

### Option 1: Using Shell Script (Recommended)
```bash
cd /home/peter/Documents/Projects/zolai
./run_build_master.sh
```

### Option 2: Direct Python
```bash
cd /home/peter/Documents/Projects/zolai
python3 build_master_dataset.py
```

## What It Does

**Combines:**
- Training datasets (12.3M records)
- Dictionary datasets (455k records)
- Parallel translation pairs (249k records)

**Outputs:**
- `data/training/master_unified_all.jsonl` — All records (deduplicated)
- `data/training/master_train.jsonl` — 80% for training
- `data/training/master_val.jsonl` — 10% for validation
- `data/training/master_test.jsonl` — 10% for testing
- `data/training/master_unified_manifest.json` — Metadata

**Processing:**
1. Collects all JSONL files
2. Deduplicates by text hash
3. Creates 80/10/10 train/val/test split
4. Logs progress to `data/training/build_master.log`

## Monitoring Progress

While running, check the log:
```bash
tail -f data/training/build_master.log
```

## After Completion

View generated files:
```bash
ls -lh data/training/master_*.jsonl
cat data/training/master_unified_manifest.json
```

## Dataset Format

Each record is JSON:
```json
{"instruction": "...", "input": "...", "output": "..."}
{"zolai": "...", "english": "..."}
{"headword": "...", "translations": [...]}
```

## Usage Example

```python
import json

# Load training data
with open('data/training/master_train.jsonl') as f:
    for line in f:
        record = json.loads(line)
        # Use for training
```

## Troubleshooting

**Script hangs?**
- Check disk space: `df -h`
- Check RAM: `free -h`
- Monitor: `ps aux | grep build_master`

**Out of memory?**
- Run on a machine with 8GB+ RAM
- Or process files separately

**Permission denied?**
```bash
chmod +x run_build_master.sh
```

## Statistics

- **Total records:** ~13M
- **Total size:** ~2.9GB
- **Deduplication:** ~20% removed
- **Processing time:** 5-10 minutes
- **System requirements:** 4GB RAM, 10GB disk

---

**Created:** 2026-04-16
**Option:** Training + Dictionary (Recommended)
