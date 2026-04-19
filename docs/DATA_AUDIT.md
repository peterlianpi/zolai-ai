# Data Directory Audit & Improvement Report

## 📊 Audit Summary

### Total Size: 22GB

| Directory | Size | Status | Action |
|-----------|------|--------|--------|
| master/ | 19GB | ✅ Organized | Training data (sources, combined, bible, versions) |
| processed/ | 1.2GB | ✅ Improved | Cleaned data (dictionaries, datasets, exports) |
| archive_old/ | 1.6GB | ⚠️ Archive | Old directories (can be compressed) |
| history/ | 57MB | ✅ Organized | Crawl logs |
| runs/ | 32MB | ✅ Organized | Training run logs |
| raw/ | 25MB | ✅ Improved | Raw data (wordlists, dictionaries, ocr) |
| db/ | 40KB | ✅ Organized | Database files |

---

## 🔍 Detailed Breakdown

### master/ (19GB) - Training Datasets

**Structure:**
```
master/
├── sources/          11GB   Individual source JSONL files
├── archive/          (empty after reorganization)
├── combined/         664MB  Merged datasets
├── versions/         (versioned snapshots)
└── bible/            76MB   Bible corpus
```

**Contents:**
- **sources/**: Raw JSONL files from crawlers
  - zolai_corpus_master.jsonl
  - tongdot_dictionary.jsonl
  - bible_tdb_online.jsonl
  - rvasia_tedim.jsonl
  - And more...

- **combined/**: Merged and deduplicated
  - sentences.jsonl (~600MB)
  - parallel.jsonl (68K pairs)
  - dictionary.jsonl (master dictionary)
  - instructions.jsonl (instruction-tuning data)

- **bible/**: Bible corpus
  - OT/ (Old Testament)
  - Parallel/ (Parallel translations)
  - TDB77/ (TDB77 version)
  - Markdown files (Genesis, Exodus, Psalms, etc.)

- **versions/**: Versioned snapshots
  - all_sources_combined_v*.jsonl
  - all_sources_clean_v*.jsonl
  - all_combined.jsonl
  - all_dedup.jsonl

### processed/ (1.2GB) - Cleaned/Processed Data

**New Structure:**
```
processed/
├── dictionaries/     Semantic, enriched, EN↔ZO mappings
├── datasets/         Bilingual, lexicon, monolingual
├── exports/          CSV, JSONL, HuggingFace formats
├── bible_vocab/      Bible vocabulary (214MB)
├── bible_clean/      Cleaned Bible data
└── rebuild_archive/  Old rebuild versions (v1-v9)
```

**Improvements:**
- ✅ Consolidated rebuild versions (v1-v9) into rebuild_archive/
- ✅ Organized dictionaries into dedicated folder
- ✅ Organized datasets by type
- ✅ Organized exports by format

### raw/ (25MB) - Raw Scraped Data

**New Structure:**
```
raw/
├── wordlists/        Word lists (wordlist_*.jsonl)
├── dictionaries/     Dictionary exports (zomidictionary_*, zomime_*)
└── ocr/              OCR data (ocr-playground-download/)
```

**Improvements:**
- ✅ Organized by data source type
- ✅ Clear separation of concerns

### archive_old/ (1.6GB) - Archived Directories

**Contents:**
```
archive_old/
├── resources/        934MB  Old resources
├── kaggle_bundle/    643MB  Kaggle bundle
├── archive/          8MB    Old archive
├── scratch/          3.2MB  Scratch files
├── dev/              236KB  Dev files
├── models/           12KB   Old models
├── todo/             16KB   Todo files
├── experiments/      4KB    Experiments
└── kaggle_dataset/   8KB    Kaggle dataset
```

**Recommendation:** Compress and archive
```bash
tar -czf archive_old_backup.tar.gz archive_old/
rm -rf archive_old/
# Saves ~1.6GB
```

---

## 📈 File Statistics

| Type | Count | Location |
|------|-------|----------|
| Markdown | 6,460 | master/bible/, processed/ |
| JSONL | 1,348 | master/, processed/, raw/ |
| USX | 528 | master/bible/ |
| JSON | 30 | various |
| Database | 10 | db/ |
| Logs | 6 | history/, runs/ |
| Images | 28 | various |
| Text | 21 | various |
| Python | 20 | various |
| XML | 17 | various |

---

## ✅ Improvements Made

### 1. Processed Data Organization
- ✅ Consolidated rebuild versions (v1-v9) → rebuild_archive/
- ✅ Created dictionaries/ folder for dictionary files
- ✅ Created datasets/ folder for bilingual, lexicon, monolingual
- ✅ Created exports/ folder for CSV, JSONL, HuggingFace formats

### 2. Raw Data Organization
- ✅ Created wordlists/ folder for word lists
- ✅ Created dictionaries/ folder for dictionary exports
- ✅ Created ocr/ folder for OCR data

### 3. Master Data Organization
- ✅ Created versions/ folder for versioned snapshots
- ✅ Moved archive files to versions/

### 4. Documentation
- ✅ Created data_structure.md with full documentation
- ✅ Added cleanup recommendations
- ✅ Added statistics and file counts

---

## 🧹 Cleanup Recommendations

### Priority 1: Archive Old Directories (1.6GB)
```bash
cd /path/to/zolai/data
tar -czf archive_old_backup.tar.gz archive_old/
rm -rf archive_old/
# Saves: 1.6GB
```

### Priority 2: Archive Rebuild Versions (600MB)
```bash
tar -czf processed/rebuild_archive_backup.tar.gz processed/rebuild_archive/
rm -rf processed/rebuild_archive/
# Saves: 600MB
```

### Priority 3: Archive Training Runs (32MB)
```bash
tar -czf runs_backup.tar.gz runs/
rm -rf runs/
# Saves: 32MB
```

**Total Potential Savings: ~2.2GB**

---

## 📋 Data Quality Checklist

- [ ] Verify all JSONL files are valid JSON
- [ ] Check for duplicate entries in combined datasets
- [ ] Validate Bible corpus alignment
- [ ] Verify dictionary completeness
- [ ] Check for missing files in sources/

---

## 🚀 Next Steps

1. **Validate Data Quality**
   ```bash
   python scripts/maintenance/validate_project.py
   python scripts/data_pipeline/audit_sentences_wiki.py
   ```

2. **Clean Up Archives**
   ```bash
   cd data/
   tar -czf archive_old_backup.tar.gz archive_old/
   rm -rf archive_old/
   ```

3. **Verify Datasets**
   ```bash
   python scripts/data_pipeline/build_dictionary_db.py
   python scripts/data_pipeline/build_semantic_dictionary.py
   ```

4. **Process Data**
   ```bash
   zolai standardize-jsonl -i data/raw/wordlist_en_zo.jsonl -o data/processed/wordlist_en_zo_clean.jsonl --dedupe
   ```

---

## 📊 Final Statistics

| Metric | Value |
|--------|-------|
| Total Size | 22GB |
| Master (Training) | 19GB |
| Processed (Cleaned) | 1.2GB |
| Archive (Old) | 1.6GB |
| Raw (Scraped) | 25MB |
| History (Logs) | 57MB |
| Runs (Training) | 32MB |
| Database | 40KB |
| **Potential Savings** | **~2.2GB** |

---

**Last Updated:** 2026-04-16
**Status:** ✅ Audited & Improved
