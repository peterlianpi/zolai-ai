# Data Directory Structure

## Organization

```
data/
├── master/                 Training datasets (19GB)
│   ├── sources/           Individual source JSONL files (11GB)
│   ├── combined/          Merged datasets (664MB)
│   ├── bible/             Bible corpus (76MB)
│   ├── versions/          Versioned snapshots
│   └── archive/           Old archive (empty after reorganization)
├── processed/             Cleaned/processed data (1.2GB)
│   ├── dictionaries/      Dictionary files
│   ├── datasets/          Processed datasets
│   ├── exports/           Exported formats (CSV, JSONL, HuggingFace)
│   ├── bible_vocab/       Bible vocabulary
│   ├── bible_clean/       Cleaned Bible
│   └── rebuild_archive/   Old rebuild versions
├── raw/                   Raw scraped data (25MB)
│   ├── wordlists/         Word lists
│   ├── dictionaries/      Dictionary exports
│   └── ocr/               OCR data
├── history/               Crawl logs (57MB)
├── db/                    Database files (40KB)
├── runs/                  Training run logs (32MB)
├── archive_old/           Archived old directories (1.6GB)
└── archive/               Empty (for future use)
```

## Data Types

| Type | Location | Count | Size |
|------|----------|-------|------|
| Markdown | master/bible/, processed/ | 6,460 | - |
| JSONL | master/, processed/, raw/ | 1,348 | - |
| USX | master/bible/ | 528 | - |
| JSON | various | 30 | - |
| Database | db/ | 10 | 40KB |
| Logs | history/, runs/ | 6 | 89MB |

## Key Datasets

### master/sources/ (11GB)
- Individual source JSONL files
- Raw training data from various sources
- Includes: TongDot, RVAsia, Bible versions, ZomiDictionary, etc.

### master/combined/ (664MB)
- Merged and deduplicated datasets
- Ready for training
- Includes: sentences, parallel pairs, dictionary, instructions

### master/bible/ (76MB)
- Bible corpus in multiple formats
- Parallel translations (TDB77, Tedim2010, KJV)
- All 66 books

### processed/dictionaries/
- Semantic dictionaries
- Enriched dictionaries
- EN↔ZO mappings

### processed/datasets/
- Bilingual data
- Lexicon data
- Monolingual data

### processed/exports/
- CSV exports
- JSONL exports
- HuggingFace format

### raw/
- Raw wordlists
- Dictionary exports
- OCR data

## Statistics

- **Total Size:** 22GB
- **Master:** 19GB (training data)
- **Processed:** 1.2GB (cleaned data)
- **Archive:** 1.6GB (old directories)
- **Raw:** 25MB (scraped data)
- **History:** 57MB (logs)
- **Runs:** 32MB (training logs)

## Cleanup Recommendations

1. **Archive old versions** (1.6GB)
   ```bash
   tar -czf data/archive_old_backup.tar.gz data/archive_old/
   rm -rf data/archive_old/
   ```

2. **Clean old rebuild versions** (600MB)
   ```bash
   tar -czf data/processed/rebuild_archive_backup.tar.gz data/processed/rebuild_archive/
   rm -rf data/processed/rebuild_archive/
   ```

3. **Archive old training runs** (32MB)
   ```bash
   tar -czf data/runs_backup.tar.gz data/runs/
   rm -rf data/runs/
   ```

---

**Last Updated:** 2026-04-16
