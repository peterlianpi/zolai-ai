# Data Pipeline

Dataset management — merging, deduplication, versioning, and export.

**Last Updated:** 2026-04-20

## Scripts

| Script | Purpose |
|--------|---------|
| `gather_all_sources.py` | Gather all corpus sources into master |
| `build_master_pipeline.py` | Full master dataset build pipeline |
| `build_llm_dataset_v3.py` | Build LLM training dataset v3 (651MB) |
| `build_corpus_dictionary.py` | Build dictionary from corpus |
| `clean_training_data.py` | Clean and filter training data |
| `clean_dict_examples.py` | Clean dictionary example sentences |
| `generate_bible_instructions.py` | Generate instruction pairs from Bible |
| `generate_simple_examples.py` | Generate simple example sentences |
| `enrich_dict_from_bible.py` | Enrich dictionary entries from Bible |
| `add_missing_examples.py` | Add missing example sentences |
| `fix_multimeaning_words.py` | Fix multi-meaning word entries |
| `consolidate_all_training.py` | Consolidate all training sources |
| `combine_training_sources.py` | Combine training source files |
| `merge_final_dataset.py` | Merge into final dataset |
| `extract_training_versions.py` | Extract versioned training snapshots |
| `unify_all_corpus.py` | Unify all corpus files |
| `audit_stems.py` | Audit word stems |
| `audit_raw.py` | Audit raw data quality |
| `zolai_data_pipeline.py` | Core pipeline class |
| `zolai_dataset_manager.py` | Dataset management utilities |
| `llm_tools.py` | LLM API helpers |
| `zo_utils.py` | Zolai text utilities |

## Key Commands

```bash
# Gather all sources into master
python scripts/data_pipeline/gather_all_sources.py

# Build LLM training dataset v3
python scripts/data_pipeline/build_llm_dataset_v3.py

# Run full master pipeline
python scripts/data_pipeline/build_master_pipeline.py

# Standardize and deduplicate
zolai standardize-jsonl -i INPUT -o OUTPUT --dedupe

# Audit quality
zolai audit-jsonl -i INPUT
```
