# Data Files & Folders: Quick Renaming Reference

## Master/Sources - Bible Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| bible_judson1835.jsonl | bible_judson_1835.jsonl | Bible | 18M |
| bible_luther1912.jsonl | bible_luther_1912.jsonl | Bible | 9.6M |
| bible_tb77.jsonl | bible_tdb77_v1.jsonl | Bible | 9.3M |
| bible_tb77_online.jsonl | bible_tdb77_online.jsonl | Bible | 9.1M |
| bible_tbr17.jsonl | bible_tbr17_v1.jsonl | Bible | 8.5M |
| bible_tdb_online.jsonl | bible_tdb77_online_v2.jsonl | Bible | 8.6M |
| bible_tedim1932.jsonl | bible_tedim_1932.jsonl | Bible | 9.8M |
| bible_tedim2010.jsonl | bible_tedim_2010.jsonl | Bible | 9.8M |
| bible_parallel_tdb77.jsonl | bible_parallel_tdb77_kjv.jsonl | Bible | 14M |
| bible_parallel_tbr17.jsonl | bible_parallel_tbr17_kjv.jsonl | Bible | 13M |
| bible_parallel_tedim2010.jsonl | bible_parallel_tedim2010_kjv.jsonl | Bible | 15M |

## Master/Sources - Dictionary Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| tongdot_dictionary.jsonl | dict_tongdot_v1.jsonl | Dictionary | 29M |
| zomidictionary_export.jsonl | dict_zomidictionary_v1.jsonl | Dictionary | 6.8M |
| zomime_parallel_phrases.jsonl | dict_zomime_phrases.jsonl | Dictionary | 22K |

## Master/Sources - News/Content Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| rvasia_tedim.jsonl | news_rvasia_tedim.jsonl | News | 13M |
| diaspora_news_v1.jsonl | news_diaspora_v1.jsonl | News | 13K |

## Master/Sources - Synthetic Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| archaic_high_zolai_v1.jsonl | synthetic_archaic_zolai_v1.jsonl | Synthetic | 5.9K |
| dialects_synthetic_v1.jsonl | synthetic_dialects_v1.jsonl | Synthetic | 1.2K |
| gentehna_synthetic_v1.jsonl | synthetic_gentehna_v1.jsonl | Synthetic | 3.6K |
| chat_format.jsonl | synthetic_chat_format.jsonl | Synthetic | 3.2M |
| bilingual_examples.jsonl | synthetic_bilingual_examples.jsonl | Synthetic | 889B |

## Master/Sources - Corpus Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| zolai_corpus_master.jsonl | corpus_master_v1.jsonl | Corpus | 9.4G |
| zolai_full_training_v11.jsonl | corpus_training_v11.jsonl | Corpus | 132M |

## Master/Combined Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| sentences.jsonl | combined_sentences_v1.jsonl | Combined | 600M |
| parallel.jsonl | combined_parallel_pairs_v1.jsonl | Combined | 40M |
| dictionary.jsonl | combined_dictionary_v1.jsonl | Combined | 22M |
| instructions.jsonl | combined_instructions_v1.jsonl | Combined | 30M |

## Processed/Dictionaries Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| master_dictionary_enriched.jsonl | dict_enriched_v1.jsonl | Dictionary | 36M |
| master_dictionary_en_zo.jsonl | dict_en_zo_v1.jsonl | Dictionary | 36M |
| master_dictionary_semantic.jsonl | dict_semantic_v1.jsonl | Dictionary | 50M |

## Raw/Wordlists Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| wordlist_en_zo.jsonl | wordlist_en_zo_v1.jsonl | Wordlist | - |
| wordlist_zo_en.jsonl | wordlist_zo_en_v1.jsonl | Wordlist | - |
| zo_en_singlewords.jsonl | wordlist_zo_en_singlewords_v1.jsonl | Wordlist | - |
| zo_en_wordlist.jsonl | wordlist_zo_en_v1.jsonl | Wordlist | - |

## Raw/Dictionaries Files

| Current Name | Recommended Name | Type | Size |
|--------------|------------------|------|------|
| zomidictionary_export.jsonl | raw_zomidictionary_export_v1.jsonl | Dictionary | - |
| zomidictionary_app_full.jsonl | raw_zomidictionary_app_v1.jsonl | Dictionary | - |
| zomime_dialogues.jsonl | raw_zomime_dialogues_v1.jsonl | Dictionary | - |
| zomime_vocabulary.jsonl | raw_zomime_vocabulary_v1.jsonl | Dictionary | - |

## Folder Renaming

| Current Name | Recommended Name | Type |
|--------------|------------------|------|
| processed/bilingual/ | processed/datasets_bilingual/ | Folder |
| processed/lexicon/ | processed/datasets_lexicon/ | Folder |
| processed/monolingual/ | processed/datasets_monolingual/ | Folder |
| processed/csv/ | processed/exports_csv/ | Folder |
| processed/jsonl/ | processed/exports_jsonl/ | Folder |
| processed/huggingface/ | processed/exports_huggingface/ | Folder |
| processed/kaggle/ | processed/exports_kaggle/ | Folder |

## Naming Conventions

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
- `_v1`, `_v2`, etc. — Version numbers
- `.jsonl` — JSONL format
- `.json` — JSON format
- `.csv` — CSV format
- `.db` — Database format
- `.sqlite` — SQLite format
- `.metadata.json` — Metadata file

### Examples
```
✓ bible_tdb77_v1.jsonl
✓ dict_enriched_v1.jsonl
✓ news_rvasia_tedim.jsonl
✓ synthetic_chat_format.jsonl
✓ corpus_master_v1.jsonl
✓ combined_parallel_pairs_v1.jsonl
✓ wordlist_en_zo_v1.jsonl
✓ raw_zomidictionary_export_v1.jsonl
✓ crawl_rvasia_links.log
✓ training_benchmark_tests.json
✓ db_dictionary_unified_v1.db
✓ run_qwen_zolai_7b_lora_v7
✓ datasets_bilingual/
✓ exports_csv/
```

---

**Last Updated:** 2026-04-16
**Status:** ✅ Naming Guide Complete
