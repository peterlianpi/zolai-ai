# Zolai Data

Core datasets are included directly in this repository.
Large training files (>100MB) are published on Hugging Face Hub.

> **HuggingFace:** https://huggingface.co/peterpausianlian

Last Updated: 2026-04-20

## Included in This Repo

### Parallel Translation Pairs
| File | Description | Size |
|------|-------------|------|
| `parallel/zo_en_pairs_combined_v1.jsonl` | 105k+ ZO↔EN pairs | 39 MB |
| `parallel/zo_en_pairs_master_v1.jsonl` | 58k curated pairs | 26 MB |
| `parallel/bible_parallel_tdb77_kjv.jsonl` | TB77 ↔ KJV Bible | 14 MB |
| `parallel/bible_parallel_tbr17_kjv.jsonl` | TBR17 ↔ KJV Bible | 13 MB |
| `parallel/bible_parallel_tedim2010_kjv.jsonl` | Tedim2010 ↔ KJV Bible | 15 MB |

### Dictionary
| File | Description | Size |
|------|-------------|------|
| `dictionary/processed/dict_unified_v1.jsonl` | Unified dictionary (152k entries) | 31 MB |
| `dictionary/processed/dict_semantic_v1.jsonl` | Semantic dictionary | 50 MB |
| `dictionary/processed/dict_enriched_v1.jsonl` | Enriched dictionary | 36 MB |
| `dictionary/processed/dict_en_zo_v1.jsonl` | EN→ZO dictionary | 36 MB |

### Corpus
| File | Description | Size |
|------|-------------|------|
| `corpus/reference/tedim_hymns_v1.jsonl` | 510 Tedim hymns | 582 KB |
| `corpus/reference/bible_tedim_1932.jsonl` | Tedim Bible 1932 | 9.8 MB |
| `corpus/reference/bible_judson_1835_en.jsonl` | Judson English Bible 1835 | 18 MB |

## Download from Hugging Face (Large Files)

```bash
pip install huggingface_hub

# Training snapshots (v11)
huggingface-cli download zolai/tedim-training-v11 --repo-type dataset --local-dir data/training/snapshots/

# Deduplicated sentence corpus (~2M sentences, 574 MB)
huggingface-cli download zolai/tedim-corpus --repo-type dataset --local-dir data/corpus/
```

## Rebuild from Scratch

```bash
# 1. Crawl sources
python scripts/crawlers/crawl_all_news.py
python scripts/crawlers/fetch_tongdot_dictionary.py

# 2. Build Bible corpus
python scripts/crawlers/fetch_bible_versions.py
python scripts/build_parallel_bible.py

# 3. Build dictionary
python scripts/build_enriched_dictionary.py
python scripts/build_semantic_dictionary.py

# 4. Build training data
python scripts/synthesize_instructions_v6.py
python scripts/combine_and_categorize.py
```

## Training (v3 — Latest)

| File | Description | Size |
|------|-------------|------|
| `training/llm_train_v3.jsonl` | Training split (v3) | 651 MB |
| `training/llm_val_v3.jsonl` | Validation split (v3) | 36 MB |
| `training/llm_test_v3.jsonl` | Test split (v3) | 36 MB |
| `training/orpo_pairs_v1.jsonl` | ORPO/DPO preference pairs | 1 GB |
| `training/instructions_bible_v1.jsonl` | Bible instruction-tuning data | 18 MB |
| `training/final_train.jsonl` | Final merged training set | 1.2 GB |

## Evaluation

| File | Description |
|------|-------------|
| `eval/zolai_qa_v1.jsonl` | Zolai QA evaluation set |
| `eval/translation_eval_v1.jsonl` | Translation evaluation pairs |
| `eval/zvs_compliance_test_v1.jsonl` | ZVS dialect compliance test cases |
| `eval/translation_ref_zo.txt` | Zolai reference translations |
| `eval/translation_ref_en.txt` | English reference translations |

## Exports

| File | Description |
|------|-------------|
| `exports/dict_master_export.tsv` | Master dictionary export (TSV) |
| `exports/dict_master_export.csv` | Master dictionary export (CSV) |
