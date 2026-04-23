# Zolai Data Directory
> Single source of truth for all Zolai language data.
> Last restructured: 2026-04-16

---

## Structure

```
data/
│
├── corpus/                         # Raw source corpora (read-only inputs)
│   ├── bible/                      # Bible versions in JSONL
│   │   ├── bible_tb77_tedim_1977.jsonl       (30k verses)
│   │   ├── bible_tbr17_tedim_2017.jsonl      (30k verses)
│   │   ├── bible_tdb_tedim_online.jsonl      (30k verses)
│   │   ├── bible_tedim_1932.jsonl            (30k verses)
│   │   ├── bible_tedim_2010.jsonl            (30k verses)
│   │   ├── bible_judson_1835_en.jsonl        (EN reference)
│   │   ├── bible_luther_1912_de.jsonl        (DE reference)
│   │   ├── usx/                    # USX source files (7 versions: TDB77, TB77, Tedim, KJV, Judson, FCL, HCL06)
│   │   ├── markdown/               # Parallel Bible markdown (TDB77+KJV, all 66 books)
│   │   └── vocab_by_chapter/       # Per-chapter vocab analysis (1000+ files)
│   ├── news/                       # Web crawl corpora
│   │   ├── zomidaily_crawl_v1.jsonl          (56 MB, 14k articles)
│   │   ├── rvasia_catholic_readings_v1.jsonl (13 MB, 5.7k articles)
│   │   ├── tongsan_crawl_v1.jsonl            (1.4 MB)
│   │   ├── zomidictionary_blog_posts_v1.jsonl
│   │   └── zolai_news_20260415.md            (news article)
│   ├── synthetic/                  # Generated/synthetic training data
│   │   ├── synthetic_all_v1.jsonl            (4 MB, 11k lines — merged)
│   │   ├── zomime_dialogues_v1.jsonl
│   │   └── zomime_parallel_phrases_v1.jsonl
│   ├── hymns/
│   │   └── tedim_hymns_v1.jsonl              (510 hymns)
│   ├── texts/                      # Historical Zolai texts
│   │   ├── zolai_sinna_raw.txt               (Zolai Sinna raw)
│   │   ├── zolai_sinna_2010.md               (Zolai Sinna 2010)
│   │   ├── Zolai_Khanggui_AD_1899_AD_2013.md (Khanggui history)
│   │   └── Gentehna_Tuamtuam_le_A_Deihnate.md (Gentehna text)
│   ├── ocr/
│   │   ├── play_based_learning_booklet/      (PDF → markdown, 37 pages)
│   │   └── course15_play_based_learning_zolai.md
│   ├── corpus_master_v1.jsonl      ★ 8.8 GB — full master corpus
│   ├── zo_sentences_v1.jsonl       ★ 574 MB — ~2M raw Zolai sentences
│   └── zo_text_corpus_v1.txt           19M lines plain text
│
├── dictionary/                     # All dictionary data
│   ├── processed/                  # Cleaned, enriched, ready-to-use
│   │   ├── dict_unified_v1.jsonl   ★ 31 MB  — 152k entries (headword+translations+pos)
│   │   ├── dict_enriched_v1.jsonl    36 MB  — with examples & context
│   │   ├── dict_semantic_v1.jsonl    50 MB  — with semantic vectors
│   │   ├── dict_en_zo_v1.jsonl       36 MB  — EN→ZO direction
│   │   ├── dict_zo_tdm_v1.jsonl       8 MB  — ZO→TDM dialect
│   │   ├── dict_combined_v1.jsonl    23 MB  — 93k combined entries
│   │   └── phrases_v1.jsonl         304 KB  — consolidated phrases
│   ├── raw/                        # Raw scraped data (do not use directly)
│   │   ├── dict_tongdot_raw_v1.jsonl  28 MB
│   │   ├── zomidictionary_app_full_v1.jsonl
│   │   ├── zomidictionary_export_v1.jsonl
│   │   └── ...
│   └── wordlists/                  # Word frequency & lookup lists
│       ├── wordlist_en_zo_v1.jsonl
│       ├── wordlist_zo_en_v1.jsonl
│       ├── zo_en_wordlist_v1.jsonl  (40k entries)
│       ├── zo_en_singlewords_v1.jsonl
│       ├── vocab_frequency_tdb77.json
│       └── vocab_frequency_tedim1932.json
│
├── parallel/                       # ZO↔EN parallel translation pairs
│   ├── zo_en_pairs_combined_v1.jsonl  ★ 39 MB — 105k pairs
│   ├── zo_en_pairs_master_v1.jsonl      26 MB — 58k pairs
│   ├── bible_parallel_tdb77_kjv.jsonl   14 MB
│   ├── bible_parallel_tbr17_kjv.jsonl   13 MB
│   └── bible_parallel_tedim2010_kjv.jsonl 15 MB
│
├── training/                       ← TRAIN FROM HERE
│   ├── master.jsonl                ★★ 324 MB — 896k records, fully deduped
│   ├── master_manifest.json            build stats & source breakdown
│   ├── build_master.py                 rebuild script (run when sources change)
│   ├── instructions_v1.jsonl         30 MB — instruction-tuning pairs
│   ├── zo_en_pairs_train_v1.jsonl    39 MB — parallel train split
│   ├── zo_en_pairs_val_v1.jsonl       2 MB — parallel val split
│   └── snapshots/                  # Versioned backups (do not train from)
│       ├── training_v11_base.jsonl   126 MB
│       ├── training_v11_cefr.jsonl   114 MB
│       └── training_v11_tagged.jsonl 114 MB
│
├── db/                             # SQLite databases
│   ├── master_unified_dictionary.db  ★ 114 MB — FTS5 full-text search
│   ├── zomidictionary_app.db           2.8 MB — ZomiDictionary app export
│   └── zolai_dictionary_legacy.db      17 MB  — legacy
│
├── runs/                           # Training run outputs (checkpoints, logs)
│   ├── zolai_v1/
│   ├── zo_tdm_v1/
│   └── qwen_zolai_7b_lora_v7/
│
├── logs/                           # Crawl logs, pipeline state, build artifacts
│   └── bible_vocab_pipeline/       # Bible vocab gap analysis
│
└── archive/                        # Superseded data — do not use
    ├── training_versions/          # training v1–v10 (superseded by master.jsonl)
    ├── rebuild_versions/           # dictionary rebuild v1–v9
    └── old_data/                   # misc old files
```

---

## The One Rule

**Always train from `training/master.jsonl`.**

When you add new data to `corpus/` or `parallel/`, rebuild:
```bash
python data/training/build_master.py
```

---

## Key Files Quick Reference

| File | Size | Use for |
|---|---|---|
| `training/master.jsonl` | 324 MB | **Training** — 896k deduped records |
| `corpus/corpus_master_v1.jsonl` | 8.8 GB | Full corpus (pretraining) |
| `corpus/zo_sentences_v1.jsonl` | 574 MB | Sentence-level data |
| `parallel/zo_en_pairs_combined_v1.jsonl` | 39 MB | Translation pairs |
| `dictionary/processed/dict_unified_v1.jsonl` | 31 MB | Dictionary lookups |
| `dictionary/processed/dict_semantic_v1.jsonl` | 50 MB | Semantic search |
| `db/master_unified_dictionary.db` | 114 MB | FTS5 dictionary API |
