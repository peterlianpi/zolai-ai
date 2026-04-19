# Data Files & Folders: Naming Audit & Recommendations

## 1. MASTER/SOURCES - File Renaming Guide

### Current → Recommended Names

#### Bible Files
```
CURRENT                              RECOMMENDED
bible_judson1835.jsonl          →    bible_judson_1835.jsonl
bible_luther1912.jsonl          →    bible_luther_1912.jsonl
bible_tb77.jsonl                →    bible_tdb77_v1.jsonl
bible_tb77_online.jsonl         →    bible_tdb77_online.jsonl
bible_tbr17.jsonl               →    bible_tbr17_v1.jsonl
bible_tdb_online.jsonl          →    bible_tdb77_online_v2.jsonl
bible_tedim1932.jsonl           →    bible_tedim_1932.jsonl
bible_tedim2010.jsonl           →    bible_tedim_2010.jsonl
bible_parallel_tdb77.jsonl      →    bible_parallel_tdb77_kjv.jsonl
bible_parallel_tbr17.jsonl      →    bible_parallel_tbr17_kjv.jsonl
bible_parallel_tedim2010.jsonl  →    bible_parallel_tedim2010_kjv.jsonl
```

#### Dictionary Files
```
CURRENT                              RECOMMENDED
tongdot_dictionary.jsonl        →    dict_tongdot_v1.jsonl
zomidictionary_export.jsonl     →    dict_zomidictionary_v1.jsonl
zomime_parallel_phrases.jsonl   →    dict_zomime_phrases.jsonl
```

#### News/Content Files
```
CURRENT                              RECOMMENDED
rvasia_tedim.jsonl              →    news_rvasia_tedim.jsonl
zomidaily_articles.jsonl        →    news_zomidaily.jsonl
tongsan_articles.jsonl          →    news_tongsan.jsonl
diaspora_news_v1.jsonl          →    news_diaspora_v1.jsonl
```

#### Synthetic/Generated Files
```
CURRENT                              RECOMMENDED
archaic_high_zolai_v1.jsonl     →    synthetic_archaic_zolai_v1.jsonl
dialects_synthetic_v1.jsonl     →    synthetic_dialects_v1.jsonl
gentehna_synthetic_v1.jsonl     →    synthetic_gentehna_v1.jsonl
chat_format.jsonl               →    synthetic_chat_format.jsonl
bilingual_examples.jsonl        →    synthetic_bilingual_examples.jsonl
```

#### Corpus Files
```
CURRENT                              RECOMMENDED
zolai_corpus_master.jsonl       →    corpus_master_v1.jsonl
zolai_full_training_v11.jsonl   →    corpus_training_v11.jsonl
```

#### Hymns/Religious Files
```
CURRENT                              RECOMMENDED
zolai_tedim_hymns.jsonl         →    hymns_tedim_v1.jsonl
```

### Cleanup Actions
```bash
# Remove progress files
rm master/sources/*.progress.json
rm master/sources/*.pid

# Rename Bible files
mv bible_judson1835.jsonl bible_judson_1835.jsonl
mv bible_luther1912.jsonl bible_luther_1912.jsonl
mv bible_tb77.jsonl bible_tdb77_v1.jsonl
# ... (continue for all files)
```

---

## 2. MASTER/COMBINED - File Renaming Guide

### Current → Recommended Names

```
CURRENT                              RECOMMENDED
sentences.jsonl                 →    combined_sentences_v1.jsonl
parallel.jsonl                  →    combined_parallel_pairs_v1.jsonl
dictionary.jsonl                →    combined_dictionary_v1.jsonl
instructions.jsonl              →    combined_instructions_v1.jsonl
```

### Metadata Files to Create
```
combined_sentences_v1.metadata.json
combined_parallel_pairs_v1.metadata.json
combined_dictionary_v1.metadata.json
combined_instructions_v1.metadata.json
```

---

## 3. MASTER/BIBLE - File Renaming Guide

### Markdown Files (6,460 files)
```
CURRENT STRUCTURE              RECOMMENDED STRUCTURE
Genesis_Parallel.md       →    tdb77_01_genesis.md
Exodus_Parallel.md        →    tdb77_02_exodus.md
Psalms_Parallel.md        →    tdb77_19_psalms.md
Psalms_1977_Parallel.md   →    tdb77_19_psalms_1977.md
```

### Folder Structure
```
CURRENT                        RECOMMENDED
OT/                       →    markdown/tdb77/ot/
Parallel/                 →    markdown/parallel/
TDB77/                    →    markdown/tdb77/
Parallel_Corpus/          →    jsonl/parallel_corpus/
```

---

## 4. PROCESSED/DICTIONARIES - File Renaming Guide

### Current → Recommended Names

```
CURRENT                              RECOMMENDED
master_dictionary_enriched.jsonl →   dict_enriched_v1.jsonl
master_dictionary_en_zo.jsonl    →   dict_en_zo_v1.jsonl
master_dictionary_semantic.jsonl →   dict_semantic_v1.jsonl
```

### Metadata Files to Create
```
dict_enriched_v1.metadata.json
dict_en_zo_v1.metadata.json
dict_semantic_v1.metadata.json
```

---

## 5. PROCESSED/DATASETS - Folder Structure

### Current → Recommended

```
CURRENT                        RECOMMENDED
bilingual/                →    datasets_bilingual/
lexicon/                  →    datasets_lexicon/
monolingual/              →    datasets_monolingual/
```

### Files to Create
```
datasets_bilingual/
  ├── parallel_pairs.jsonl
  └── metadata.json

datasets_lexicon/
  ├── entries.jsonl
  └── metadata.json

datasets_monolingual/
  ├── sentences.jsonl
  └── metadata.json
```

---

## 6. PROCESSED/EXPORTS - Folder Structure

### Current → Recommended

```
CURRENT                        RECOMMENDED
csv/                      →    exports_csv/
jsonl/                    →    exports_jsonl/
huggingface/              →    exports_huggingface/
kaggle/                   →    exports_kaggle/
```

### Files to Create
```
exports_csv/
  ├── parallel_pairs.csv
  ├── dictionary.csv
  └── sentences.csv

exports_jsonl/
  ├── parallel_pairs.jsonl
  ├── dictionary.jsonl
  └── sentences.jsonl

exports_huggingface/
  ├── parallel_pairs/
  ├── dictionary/
  └── sentences/

exports_kaggle/
  ├── parallel_pairs.zip
  ├── dictionary.zip
  └── sentences.zip
```

---

## 7. RAW - File Renaming Guide

### Wordlists
```
CURRENT                              RECOMMENDED
wordlist_en_zo.jsonl            →    wordlist_en_zo_v1.jsonl
wordlist_zo_en.jsonl            →    wordlist_zo_en_v1.jsonl
zo_en_singlewords.jsonl         →    wordlist_zo_en_singlewords_v1.jsonl
zo_en_wordlist.jsonl            →    wordlist_zo_en_v1.jsonl
```

### Dictionaries
```
CURRENT                              RECOMMENDED
zomidictionary_export.jsonl     →    raw_zomidictionary_export_v1.jsonl
zomidictionary_app_full.jsonl   →    raw_zomidictionary_app_v1.jsonl
zomime_dialogues.jsonl          →    raw_zomime_dialogues_v1.jsonl
zomime_vocabulary.jsonl         →    raw_zomime_vocabulary_v1.jsonl
```

### OCR
```
CURRENT                              RECOMMENDED
ocr-playground-download-*.zip   →    ocr_playground_export_v1.zip
ocr-playground-download-*/      →    ocr_playground_data_v1/
```

---

## 8. HISTORY - File Renaming Guide

### Crawl Logs
```
CURRENT                              RECOMMENDED
rvasia_links.log                →    crawl_rvasia_links.log
rvasia_scrape.log               →    crawl_rvasia_scrape.log
rvasia_tedim_scrape.log         →    crawl_rvasia_tedim.log
rvasia_state.json               →    crawl_rvasia_state.json
```

### Training Logs
```
CURRENT                              RECOMMENDED
register_benchmark_tests.json   →    training_benchmark_tests.json
```

---

## 9. DB - File Renaming Guide

### Database Files
```
CURRENT                              RECOMMENDED
master_unified_dictionary.db    →    db_dictionary_unified_v1.db
zolai_dictionary_data.sqlite    →    db_dictionary_zolai_v1.sqlite
ZomiDictionary.db               →    db_zomidictionary_v1.db
```

---

## 10. RUNS - Folder Renaming Guide

### Training Runs
```
CURRENT                              RECOMMENDED
qwen_zolai_7b_lora_v7           →    run_qwen_zolai_7b_lora_v7
zolai_v1                        →    run_zolai_v1
zo_tdm_v1                       →    run_zo_tdm_v1
```

---

## Naming Conventions

### File Naming Rules
1. **Use lowercase** — `file_name.jsonl` not `FileName.JSONL`
2. **Use underscores** — `file_name_v1.jsonl` not `file-name-v1.jsonl`
3. **Include version** — `dict_v1.jsonl` not `dict.jsonl`
4. **Use prefixes** — `bible_`, `dict_`, `news_`, `synthetic_`, `corpus_`
5. **Use suffixes** — `_v1`, `_v2` for versions

### Folder Naming Rules
1. **Use lowercase** — `folder_name/` not `FolderName/`
2. **Use underscores** — `folder_name/` not `folder-name/`
3. **Use prefixes** — `datasets_`, `exports_`, `raw_`
4. **Be descriptive** — `datasets_bilingual/` not `data/`
5. **Avoid abbreviations** — `dictionary` not `dict`

### Metadata Files
1. **Always include** — `filename.metadata.json`
2. **Include fields:**
   - name
   - description
   - lines/entries
   - size_mb
   - format
   - created
   - last_updated
   - source (if applicable)

---

## Implementation Plan

### Phase 1: Rename Files (Today)
```bash
cd /path/to/zolai/data

# Remove progress files
find . -name "*.progress.json" -delete
find . -name "*.pid" -delete

# Rename Bible files
mv master/sources/bible_judson1835.jsonl master/sources/bible_judson_1835.jsonl
mv master/sources/bible_luther1912.jsonl master/sources/bible_luther_1912.jsonl
# ... (continue for all files)
```

### Phase 2: Rename Folders (This Week)
```bash
# Rename processed folders
mv processed/bilingual/ processed/datasets_bilingual/
mv processed/lexicon/ processed/datasets_lexicon/
mv processed/monolingual/ processed/datasets_monolingual/

mv processed/csv/ processed/exports_csv/
mv processed/jsonl/ processed/exports_jsonl/
mv processed/huggingface/ processed/exports_huggingface/
mv processed/kaggle/ processed/exports_kaggle/
```

### Phase 3: Create Metadata (Next Week)
```bash
# Create metadata files for all datasets
python scripts/data_pipeline/create_metadata.py
```

### Phase 4: Update Documentation (Following Week)
```bash
# Update all references in documentation
# Update scripts to use new names
# Update README files
```

---

## Checklist

### Master/Sources
- [ ] Remove progress files
- [ ] Rename Bible files
- [ ] Rename dictionary files
- [ ] Rename news files
- [ ] Rename synthetic files
- [ ] Rename corpus files
- [ ] Create README

### Master/Combined
- [ ] Rename files with version suffix
- [ ] Create metadata files
- [ ] Create README

### Master/Bible
- [ ] Rename markdown files
- [ ] Reorganize folder structure
- [ ] Create metadata

### Processed/Dictionaries
- [ ] Rename files with version suffix
- [ ] Create metadata files

### Processed/Datasets
- [ ] Rename folders with prefix
- [ ] Create metadata files

### Processed/Exports
- [ ] Rename folders with prefix
- [ ] Create export files

### Raw
- [ ] Rename wordlist files
- [ ] Rename dictionary files
- [ ] Rename OCR files

### History
- [ ] Rename log files

### DB
- [ ] Rename database files

### Runs
- [ ] Rename run folders

---

## Benefits of Renaming

✅ **Clarity** — Clear naming makes files self-documenting
✅ **Consistency** — Uniform naming across all files
✅ **Discoverability** — Easy to find files by prefix
✅ **Versioning** — Clear version tracking
✅ **Automation** — Scripts can parse filenames
✅ **Maintenance** — Easier to manage and update

---

**Last Updated:** 2026-04-16
**Status:** ✅ Audit Complete | 🔧 Ready for Implementation
