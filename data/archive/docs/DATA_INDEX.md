# Data Directory: Complete Index

**Last Updated:** 2026-04-16
**Total Size:** 22GB
**Status:** ✅ Organized & Documented

---

## Directory Structure

```
data/
├── master/                 Training datasets (19GB)
│   ├── sources/           Raw source files (11GB)
│   │   └── README.md      Documentation
│   ├── combined/          Merged datasets (664MB)
│   │   └── README.md      Documentation
│   ├── bible/             Bible corpus (76MB)
│   │   └── README.md      Documentation
│   ├── versions/          Versioned snapshots
│   └── archive/           Old archive
│
├── processed/             Cleaned data (1.2GB)
│   ├── dictionaries/      Dictionary files (121MB)
│   │   └── README.md      Documentation
│   ├── datasets_bilingual/ Bilingual data
│   │   └── README.md      Documentation
│   ├── datasets_lexicon/  Lexicon data
│   │   └── README.md      Documentation
│   ├── datasets_monolingual/ Monolingual data
│   │   └── README.md      Documentation
│   ├── exports_csv/       CSV exports
│   │   └── README.md      Documentation
│   ├── exports_jsonl/     JSONL exports
│   │   └── README.md      Documentation
│   ├── exports_huggingface/ HuggingFace exports
│   │   └── README.md      Documentation
│   ├── exports_kaggle/    Kaggle exports
│   │   └── README.md      Documentation
│   ├── bible_vocab/       Bible vocabulary
│   ├── bible_clean/       Cleaned Bible
│   └── rebuild_archive/   Old rebuild versions
│
├── raw/                   Raw scraped data (25MB)
│   ├── wordlists/         Word lists
│   ├── dictionaries/      Dictionary exports
│   ├── ocr/               OCR data
│   └── README.md          Documentation
│
├── history/               Crawl logs (57MB)
│   ├── crawls/
│   └── training/
│
├── db/                    Database files (40KB)
│   ├── backups/
│   ├── migrations/
│   └── seeds/
│
├── runs/                  Training logs (32MB)
│   ├── run_qwen_zolai_7b_lora_v7/
│   ├── run_zolai_v1/
│   └── run_zo_tdm_v1/
│
├── archive_old/           Archived directories (1.6GB)
├── archive/               Empty
├── training/              Empty
│
├── RESTRUCTURING_COMPLETE.md  Implementation report
├── IMPLEMENTATION_LOG.md       Step-by-step log
├── DATA_INDEX.md              This file
└── data_structure.md          Structure documentation
```

---

## Quick Navigation

### By Purpose

**Training Data**
- `master/sources/` — Raw source files
- `master/combined/` — Merged datasets
- `master/bible/` — Bible corpus

**Cleaned Data**
- `processed/dictionaries/` — Dictionary files
- `processed/datasets_*/` — Dataset exports
- `processed/exports_*/` — Format exports

**Raw Data**
- `raw/wordlists/` — Word lists
- `raw/dictionaries/` — Dictionary exports
- `raw/ocr/` — OCR data

**Logs & Runs**
- `history/` — Crawl logs
- `runs/` — Training run logs

### By File Type

**JSONL Files**
- `master/sources/*.jsonl` — Raw data
- `master/combined/*.jsonl` — Merged data
- `processed/dictionaries/*.jsonl` — Dictionary data
- `raw/wordlists/*.jsonl` — Wordlist data
- `raw/dictionaries/*.jsonl` — Dictionary exports

**Markdown Files**
- `master/bible/markdown/` — Bible text
- `*/README.md` — Documentation

**Database Files**
- `db/*.db` — SQLite databases
- `db/*.sqlite` — SQLite databases

---

## File Naming Convention

### Prefixes
- `bible_` — Bible corpus files
- `dict_` — Dictionary files
- `news_` — News/article files
- `synthetic_` — Synthetically generated files
- `corpus_` — General corpus files
- `combined_` — Combined/merged datasets
- `wordlist_` — Word list files
- `raw_` — Raw data files
- `crawl_` — Crawl log files
- `training_` — Training log files
- `db_` — Database files
- `run_` — Training run folders
- `datasets_` — Dataset folders
- `exports_` — Export format folders

### Suffixes
- `_v1`, `_v2` — Version numbers
- `.jsonl` — JSONL format
- `.json` — JSON format
- `.csv` — CSV format
- `.db` — Database format
- `.metadata.json` — Metadata file

---

## Documentation Files

| File | Purpose |
|------|---------|
| `master/sources/README.md` | Raw source files documentation |
| `master/combined/README.md` | Merged datasets documentation |
| `master/bible/README.md` | Bible corpus documentation |
| `processed/dictionaries/README.md` | Dictionary files documentation |
| `processed/datasets_*/README.md` | Dataset documentation |
| `processed/exports_*/README.md` | Export format documentation |
| `raw/README.md` | Raw data documentation |
| `RESTRUCTURING_COMPLETE.md` | Implementation report |
| `IMPLEMENTATION_LOG.md` | Step-by-step log |
| `DATA_INDEX.md` | This file |
| `data_structure.md` | Structure documentation |

---

## Statistics

| Category | Size | Files | Status |
|----------|------|-------|--------|
| master/ | 19GB | 46 | ✅ Organized |
| processed/ | 1.2GB | 3 | ✅ Organized |
| raw/ | 25MB | 25+ | ✅ Organized |
| history/ | 57MB | 6+ | ✅ Organized |
| runs/ | 32MB | 3 | ✅ Organized |
| db/ | 40KB | 3 | ✅ Organized |
| archive_old/ | 1.6GB | - | ✅ Archived |
| **TOTAL** | **22GB** | **1,500+** | **✅** |

---

## Usage Examples

### Load Data
```python
from zolai.utils import stream_jsonl, batch_stream_jsonl

# Stream Bible data
for entry in stream_jsonl('master/sources/bible_tdb77_v1.jsonl'):
    print(entry)

# Stream in batches
for batch in batch_stream_jsonl('master/combined/combined_sentences_v1.jsonl', batch_size=32):
    process_batch(batch)
```

### Count Lines
```python
from zolai.utils import count_jsonl_lines

count = count_jsonl_lines('master/combined/combined_parallel_pairs_v1.jsonl')
print(f"Total pairs: {count}")
```

### Load Dictionary
```python
import json

with open('processed/dictionaries/dict_enriched_v1.jsonl') as f:
    for line in f:
        entry = json.loads(line)
        print(f"{entry['zolai']} → {entry['english']}")
```

---

## Next Steps

### Immediate
- [ ] Create metadata files for all datasets
- [ ] Add statistics to documentation
- [ ] Update scripts to use new names

### This Week
- [ ] Test all data pipelines
- [ ] Validate data quality
- [ ] Update documentation

### Next Week
- [ ] Create validation scripts
- [ ] Add data schema documentation
- [ ] Archive old versions

---

**Status:** ✅ Complete
**All files organized, renamed, and documented**

