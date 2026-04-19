# Scripts

Data collection, processing, training, and maintenance scripts (~150 total).

**Last Updated:** 2026-04-20

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `crawlers/` | Web scrapers — ZomiDaily, Tongsan, RVAsia, TongDot |
| `data_pipeline/` | Dataset merging, deduplication, versioning |
| `synthesis/` | Instruction synthesis for fine-tuning |
| `training/` | Training data export and conversion |
| `maintenance/` | Quality checks, OCR, text filters |
| `cleaner/` | Data cleaning utilities |
| `deploy/` | Server deployment scripts |
| `ui/` | Chat server, menu, routing agent |
| `dev/` | Test and debugging scripts |
| `pipelines/` | End-to-end pipeline orchestration |
| `server/` | Server management scripts |

## Root Scripts

### Bible & Corpus
| Script | Purpose |
|--------|---------|
| `fetch_bible_versions.py` | Fetch multiple Bible versions |
| `fetch_bible_online.py` | Fetch Bible from online sources |
| `fetch_tbr17_full.py` | Fetch TBR17 Bible full text |
| `fetch_rvasia_tedim.py` | Fetch RVAsia Catholic readings |
| `build_bible_pairs.py` | Build Bible parallel pairs |
| `build_parallel_bible.py` | Build parallel Bible corpus |
| `build_tedim2010_bible.py` | Build Tedim 2010 Bible dataset |
| `rebuild_bible_parallel.py` | Rebuild Bible parallel dataset |
| `rebuild_parallel_dataset.py` | Rebuild parallel dataset |
| `fix_bible_data.py` | Fix Bible data issues |
| `fix_bible_violations.py` | Fix ZVS violations in Bible data |
| `fix_bible_nahum_and_rebuild.py` | Fix Nahum book and rebuild |
| `parse_tbr17_html.py` | Parse TBR17 HTML source |
| `study_bible_books.py` | Study/analyze Bible books |
| `extract_bible_vocab.py` | Extract vocabulary from Bible |
| `crossref_bible_vocab.py` | Cross-reference Bible vocabulary |
| `bible_vocab_pipeline.py` | Full Bible vocab pipeline |
| `fill_bible_vocab_local.py` | Fill Bible vocab gaps locally |
| `fill_bible_vocab_gaps.py` | Fill missing Bible vocab entries |
| `learn_bible_vocab.py` | Learn vocab from Bible corpus |
| `test_bible_vocab.py` | Test Bible vocab extraction |
| `add_genesis_patterns.py` | Add Genesis sentence patterns |

### Dictionary
| Script | Purpose |
|--------|---------|
| `build_dictionary_db.py` | Build SQLite FTS5 dictionary DB |
| `build_enriched_dictionary.py` | Build enriched dictionary |
| `build_semantic_dictionary.py` | Build semantic dictionary |
| `build_bible_dictionary.py` | Build dictionary from Bible |
| `build_corpus_dictionary.py` | Build dictionary from corpus |
| `extract_zomime_data.py` | Extract ZomiMe dictionary data |
| `search_dictionary.py` | Search dictionary CLI |
| `generate_wordlists.py` | Generate ZO↔EN wordlists |
| `export_words_to_sheet_csv.py` | Export words to CSV |
| `add_missing_kinship_terms.py` | Add missing kinship terms |
| `update_kinship_terms.py` | Update kinship term entries |
| `fill_missing_vocab_gemini.py` | Fill vocab gaps via Gemini |
| `expand_dictionary_v3.py` | Expand dictionary (v3) |
| `tag_cefr_levels.py` | Tag entries with CEFR levels |

### Training Data & Synthesis
| Script | Purpose |
|--------|---------|
| `synthesize_instructions.py` | Synthesize instruction data |
| `synthesize_instructions_v3.py` | Instruction synthesis v3 |
| `synthesize_instructions_v4.py` | Instruction synthesis v4 |
| `synthesize_instructions_v5.py` | Instruction synthesis v5 |
| `synthesize_instructions_v6.py` | Instruction synthesis v6 (latest) |
| `synthesize_instructions_bulk.py` | Bulk instruction synthesis |
| `combine_and_categorize.py` | Combine and categorize datasets |
| `build_tedim_train_dataset.py` | Build Tedim training dataset |
| `build_notebooklm_guide.py` | Build NotebookLM guide |

### Data Cleaning & Fixing
| Script | Purpose |
|--------|---------|
| `deep_clean.py` | Deep clean corpus data |
| `cleanup_combined.py` | Clean up combined datasets |
| `refine_zolai_text.py` | Refine Zolai text quality |
| `fix_sentences_step1.py` | Fix sentences (step 1) |
| `fix_sentences_step2.py` | Fix sentences (step 2) |
| `fix_sentences_step4.py` | Fix sentences (step 4) |
| `fix_sentences_dialect.py` | Fix dialect violations |
| `fix_batch_zvs.py` | Fix ZVS violations in batch |
| `fix_batch_9.py` | Fix batch 9 issues |
| `process_batch.py` | Process data batch |
| `process_dictionary_batch.py` | Process dictionary batch |
| `process_dictionary_batch_v2.py` | Process dictionary batch v2 |
| `process_zolai_batch.py` | Process Zolai data batch |

### Quality & Audit
| Script | Purpose |
|--------|---------|
| `test_grammar_rules.py` | Validate grammar rules |
| `audit_sentences_wiki.py` | Audit sentences vs wiki standards |
| `doublecheck_master.py` | Double-check master dataset |
| `live_edit_sentences.py` | Live sentence editing tool |
| `test_free_apis.py` | Test free API integrations |

### Evaluation & Model
| Script | Purpose |
|--------|---------|
| `evaluate_model.py` | Evaluate fine-tuned model |

### Wiki & Learning
| Script | Purpose |
|--------|---------|
| `build_wiki_bundle.py` | Build wiki bundle |
| `generate_vocab_wiki.py` | Generate vocabulary wiki pages |
| `wiki_ai_learning_system.py` | AI-assisted wiki learning |
| `wiki_ai_comprehensive_learning.py` | Comprehensive wiki AI learning |
| `deep_learn_phrases.py` | Deep learn phrase patterns |
| `deep_learn_gemini.py` | Deep learn via Gemini |
| `deep_learning_dictionary_v4.py` | Dictionary deep learning v4 |
| `deep_learning_v4_fixed.py` | Deep learning v4 fixed |
| `deep_cycle_learning_v7.py` | Cycle learning v7 |
| `intelligent_learning_v5.py` | Intelligent learning v5 |
| `continuous_learning_v5.py` | Continuous learning v5 |
| `continuous_improvement_v3.py` | Continuous improvement v3 |
| `expert_learning_v7.py` | Expert learning v7 |
| `expert_learning_v7_final.py` | Expert learning v7 final |
| `expert_learning_v7_comprehensive.py` | Expert learning v7 comprehensive |
| `expert_linguistic_learning_v6.py` | Expert linguistic learning v6 |
| `expert_linguistic_v6_fixed.py` | Expert linguistic v6 fixed |
| `expert_linguistic_deep_learning_v8.py` | Expert linguistic deep learning v8 |
| `expert_linguistic_deep_learning_v9_full.py` | Expert linguistic deep learning v9 |
| `consolidate_phrases.py` | Consolidate phrase patterns |
| `continue_extraction.py` | Continue phrase extraction |

### Rebuild & Orchestration
| Script | Purpose |
|--------|---------|
| `rebuild_dictionary_orchestrator.py` | Orchestrate dictionary rebuild |
| `rebuild_master_orchestrator.py` | Orchestrate master rebuild |
| `rebuild_cycle_2_bible_deep_learning.py` | Rebuild cycle 2 |
| `rebuild_cycle_3_iterative_improvement.py` | Rebuild cycle 3 |
| `rebuild_cycle_4_continuous_learning.py` | Rebuild cycle 4 |
| `rebuild_v2_comprehensive.py` | Rebuild v2 comprehensive |
| `rebuild_v2_embeddings.py` | Rebuild v2 embeddings |
| `restructure_project.py` | Project restructure utility |

### Translation & API
| Script | Purpose |
|--------|---------|
| `translate_contextual.py` | Contextual translation |
| `zvs_api.py` | ZVS API client |

## scripts/server/

Server management module.

| File | Purpose |
|------|---------|
| `main.py` | Server entry point |
| `db.py` | Database connection |
| `data.py` | Data access layer |
| `cache.py` | Caching layer |
| `logging.py` | Logging setup |
| `utils.py` | Server utilities |
| `config.py` | Server configuration |
| `cli.py` | Server CLI |

## scripts/pipelines/

End-to-end pipeline orchestration.

| Script | Purpose |
|--------|---------|
| `run.py` | Run full pipeline |
| `collect.py` | Data collection stage |
| `clean.py` | Data cleaning stage |
| `align.py` | Alignment stage |
| `deduplicate.py` | Deduplication stage |
| `export.py` | Export stage |
| `ingest_v2.py` | Ingest pipeline v2 |
| `convert_linguistics.py` | Convert linguistic formats |
| `convert_usx.py` | Convert USX Bible format |

## scripts/cleaner/

Data cleaning utilities.

| Script | Purpose |
|--------|---------|
| `clean_master_dataset.py` | Clean master dataset |
| `dedupe_corpus_master.py` | Deduplicate corpus master |

## Key Commands

```bash
# Crawl news sources
python scripts/crawlers/crawl_all_news.py

# Build Bible parallel corpus
python scripts/build_parallel_bible.py

# Build dictionary
python scripts/build_enriched_dictionary.py
python scripts/build_semantic_dictionary.py

# Synthesize training instructions
python scripts/synthesize_instructions_v6.py

# Build LLM training dataset v3
python scripts/data_pipeline/build_llm_dataset_v3.py

# Search dictionary
python scripts/search_dictionary.py <word>

# Audit data quality
python scripts/audit_sentences_wiki.py
python scripts/doublecheck_master.py

# Evaluate model
python scripts/evaluate_model.py

# Run full pipeline
python scripts/pipelines/run.py
```
