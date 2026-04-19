# Zolai AI Pipeline — Master Roadmap

> No artificial size limits. Get ALL clean Zolai data possible.
> Last updated: 2026-04-04

---

## 🎯 Goal

Build the **largest, cleanest, most comprehensive Zolai (Tedim Chin) language dataset** possible. No arbitrary size targets — collect everything, clean everything, train on everything.

**Current status:** 6.2GB raw corpus, 2000 cleaned JSONL files (1.5GB), 20 lesson PDFs, 2 Bible versions (USX), Tongdot dictionary, Tongsan articles.

---

## 🟢 Completed

### Linguistics & Standards
- **Grammar Foundations**: Ergative-Absolutive alignment (`in` marker for transitive subjects)
- **Syntax Correction**: Enforced OSV word order (not SVO like English)
- **Verb Stems**: Documented Stem I vs Stem II alternation
- **Standards Integration**: LT Tuang (2018) + ZCLS + ZOLLS orthography
- **Core Vocabulary**: 10+ categories (Family, Body, Animals, Nature, Food, Colors, Verbs, Tech, Time, Pronouns)
- **System Prompt**: Consolidated grammar rules + vocabulary + formatting

### Data Pipeline
- **V9 Standardizer**: 100+ grammar rules (compound words, contractions, typos, punctuation)
- **Deduplication**: MD5 + semantic similarity dedup
- **Bible Extraction**: USX/XML parser for parallel verse alignment (Tedim 2010 + TDB77 + KJV)
- **Dictionary Pipeline**: Tongdot fetcher + search word builder
- **Web Crawler**: DuckDuckGo-based Zolai content discovery
- **Cleaner Pipeline**: NFKC normalization, HTML/URL stripping, OCR correction, dialect purity filtering
- **Dataset Combiner**: Merges all sources into unified train/val/test splits
- **HF Export**: DatasetDict format for QLoRA training

### Infrastructure
- **Unified Project Structure**: Single repo at `/path/to/zolai/`
- **Kaggle Integration**: 10 datasets on `peterpausianlian`, 19 notebooks
- **HuggingFace**: Dataset + model hosting (`zolai-hf-advanced`, `zolai-qwen2.5-3b-lora`)
- **Mistral OCR**: PDF extraction for Zolai lesson books
- **GitHub Models API**: Free access to 20+ models (GPT-4o, Claude, Gemini, Llama)
- **Multi-Agent System**: 8 agents (Crawler, Cleaner, Trainer, Ops, Data Manager, Learner, Linguist, Philosopher)
- **6 Skills**: Training orchestrator, language verifier, web miner, layout manager, train exporter, fetch-verify cycle

### Training
- **Qwen2.5-3B-Instruct QLoRA**: 4-bit NF4, LoRA r=16, fits T4 GPU
- **DDP Support**: 2× T4 distributed training
- **Checkpoint Resume**: Auto-resume from last checkpoint after disconnect
- **Smoke Test**: 2048 samples, 100 steps for pipeline verification

---

## 🟡 In Progress

### Data Collection (Unlimited)
- [ ] **OCR all 20 Zolai lesson PDFs** — Mistral OCR → markdown → standardized text (~500 pages, ~$0.70)
- [ ] **Scrape all 500+ hymns** from tedimhymn.com
- [ ] **Daily news aggregation** — ZomiDaily, ZoLengThe, Zalen (automated cron)
- [ ] **Tongsan.org articles** — WordPress API, all posts + categories + tags
- [ ] **Bible parallel corpus** — All 66 books × 2 versions (Tedim 2010 + TDB77)
- [ ] **Tongdot dictionary** — Full word list with definitions and audio
- [ ] **Community forums** — Zomi Facebook groups, Reddit, discussion boards
- [ ] **Academic papers** — Tone sandhi, morphology, grammar studies
- [ ] **Historical texts** — Zomi USA archives, old publications
- [ ] **Social media** — Zolai content from Twitter, YouTube comments
- [ ] **Government documents** — Chin State official publications
- [ ] **Church materials** — Sermons, devotionals, study guides

### Kaggle Upload & Clean Cycle
- [ ] **Upload ALL raw data to Kaggle** as `zolai-raw-corpus` dataset
- [ ] **Run cleaner notebook** on Kaggle GPU (free T4×2)
- [ ] **Upload cleaned output** as new dataset version
- [ ] **Run combiner notebook** to merge all sources
- [ ] **Upload combined dataset** as `zolai-master-data`
- [ ] **Run OCR notebook** on lesson PDFs
- [ ] **Upload OCR output** as `zolai-lessons-ocr`
- [ ] **Run Bible extractor** on USX sources
- [ ] **Upload Bible parallel pairs** as `zolai-bible-parallel`
- [ ] **Run dictionary builder** on Tongdot + other sources
- [ ] **Upload combined dictionary** as `zolai-dictionary`

### Quality & Validation
- [ ] **Back-translation scoring** — Semantic similarity on all parallel data
- [ ] **Human-in-the-Loop review** — Native speaker verification pipeline
- [ ] **Dialect purity audit** — Reject Mizo/Falam contamination
- [ ] **Grammar rule coverage** — Track which rules fire on real data
- [ ] **Vocabulary coverage** — % of words in dictionary vs corpus

---

## 🔴 To Do — Next Actions (Priority Order)

### Phase 1: OCR All PDFs (This Week)
```bash
# 1. Install Mistral OCR
pip install mistralai
export MISTRAL_API_KEY="your-key"

# 2. OCR all 20 lesson PDFs
python scripts/mistral_ocr_pdfs.py -i "data/external/lessons/" -o "data/processed/lessons-ocr/" --resume --sleep 3

# 3. Standardize OCR output
zolai standardize-jsonl -i data/processed/lessons-ocr/*.md -o data/processed/corpus/lessons-standardized.jsonl

# 4. Upload to Kaggle
kaggle datasets version -p data/processed/lessons-ocr/ -m "OCR'd Zolai lesson PDFs"
```

### Phase 2: Upload Everything to Kaggle for Cleaning (This Week)
```bash
# 1. Package all raw data
python scripts/package_for_kaggle.py --all --output /tmp/zolai-raw-corpus/

# 2. Upload to Kaggle
kaggle datasets create -p /tmp/zolai-raw-corpus/ -m "All raw Zolai data for cleaning"

# 3. Run cleaner notebook on Kaggle (free T4×2)
#    → zolai-cleaner-v2.ipynb processes everything
#    → Outputs: zolai_train_ready_v2.jsonl (cleaned, split, deduped)

# 4. Download cleaned output
kaggle datasets download -d peterpausianlian/zolai-cleaned-output -p data/kaggle/

# 5. Merge with local cleaned data
python scripts/zolai-dataset-combiner-v1.ipynb  # Run locally or on Kaggle
```

### Phase 3: Continuous Web Mining (Ongoing)
```bash
# 1. Run fetch-verify cycle (automated)
python scripts/run-zolai-fetch-verify-autocontinue.sh --resume

# 2. Daily cron job (on AWS server)
0 6 * * * /path/to/zolai/.venv/bin/zolai crawl --seed "Zolai language" --max-pages 100
0 12 * * * /path/to/zolai/scripts/run-zolai-fetch-verify-autocontinue.sh --resume
0 18 * * * /path/to/zolai/.venv/bin/zolai clean --input data/raw/ --output data/processed/

# 3. Weekly Kaggle upload
0 0 * * 0 /path/to/zolai/scripts/upload-to-kaggle.sh
```

### Phase 4: Training on Cleaned Data (After Phase 2-3)
```bash
# 1. Smoke test on Kaggle
#    → zolai-qwen-training-v2.ipynb
#    → MAX_TRAIN_SAMPLES=2048, TOTAL_MAX_STEPS=100

# 2. Full training run
#    → MAX_TRAIN_SAMPLES=None (all data), TOTAL_MAX_STEPS=5000+
#    → USE_DDP_2GPU=True, RESUME_FROM_CHECKPOINT=True

# 3. Upload trained model
#    → Kaggle dataset version + HuggingFace Hub
```

### Phase 5: Scale Up (Unlimited)
- [ ] **Scrape all Chin language websites** — Not just Zolai, but related dialects for transfer learning
- [ ] **YouTube subtitle extraction** — Zolai sermons, songs, talks
- [ ] **WhatsApp/Telegram group archives** — Natural conversation data (with consent)
- [ ] **Radio broadcast transcripts** — Zomi radio stations
- [ ] **Book digitization** — Scan and OCR Zolai books, magazines
- [ ] **Parallel corpus expansion** — English-Zolai sentence pairs from all sources
- [ ] **Synthetic data generation** — LLM-generated Zolai text (back-translation, paraphrasing)
- [ ] **Multi-model training** — Train on Qwen 3B, 7B, 14B; compare results

---

## 📊 Data Sources & Targets

| Source | Current | Target | Status |
|--------|---------|--------|--------|
| Bible (USX) | 2 versions, 132 files | All available versions | 🟡 In progress |
| Tongdot Dictionary | Sample fetches | Full dictionary | 🔴 To do |
| Tongsan Articles | Standardized JSONL | All posts via API | 🟡 In progress |
| Lesson PDFs | 20 files, 41MB | OCR'd + standardized | 🔴 To do |
| Web Corpus | 6.2GB raw | Unlimited | 🟡 Ongoing |
| Cleaned Corpus | 1.5GB (2000 files) | All cleaned | 🟡 In progress |
| Hymns | 0 | 500+ | 🔴 To do |
| News Articles | 0 | Daily scrape | 🔴 To do |
| Social Media | 0 | Community content | 🔴 To do |
| Academic Papers | 0 | All available | 🔴 To do |
| YouTube Subtitles | 0 | All Zolai content | 🔴 To do |
| Radio Transcripts | 0 | All broadcasts | 🔴 To do |
| Synthetic Data | 0 | 100k+ pairs | 🔴 To do |

---

## 🔄 Kaggle Upload → Clean → Download Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL MACHINE / AWS SERVER                   │
│                                                                 │
│  1. Collect ALL raw data                                        │
│     ├── Web crawls (JSONL)                                      │
│     ├── PDF OCR (markdown)                                      │
│     ├── Bible USX (XML)                                         │
│     ├── Dictionary (JSON)                                       │
│     └── Social media, news, forums                              │
│                                                                 │
│  2. Package for Kaggle                                          │
│     └── python scripts/package_for_kaggle.py --all              │
│                                                                 │
│  3. Upload to Kaggle                                            │
│     └── kaggle datasets version -p /tmp/zolai-raw/ -m "..."    │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                         KAGGLE (Free T4×2)                      │
│                                                                 │
│  4. Run cleaner notebook                                        │
│     └── zolai-cleaner-v2.ipynb                                  │
│         ├── NFKC normalization                                  │
│         ├── HTML/URL stripping                                  │
│         ├── OCR correction                                      │
│         ├── Dialect purity filtering                            │
│         ├── Deduplication (MD5 + semantic)                      │
│         ├── Train/val/test split (80/10/10)                     │
│         └── HF DatasetDict export                               │
│                                                                 │
│  5. Run combiner notebook                                       │
│     └── zolai-dataset-combiner-v1.ipynb                         │
│         ├── Merge all cleaned sources                           │
│         ├── Global deduplication                                │
│         ├── Final split                                         │
│         └── HF DatasetDict export                               │
│                                                                 │
│  6. Run training notebook (optional)                            │
│     └── zolai-qwen-training-v2.ipynb                            │
│         ├── QLoRA 4-bit on Qwen2.5-3B                           │
│         ├── DDP 2× T4                                           │
│         └── Checkpoint resume                                   │
│                                                                 │
│  7. Save outputs as Kaggle dataset versions                     │
│     └── kaggle datasets version -p /kaggle/working/...          │
│                                                                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL MACHINE / AWS SERVER                   │
│                                                                 │
│  8. Download cleaned outputs                                    │
│     └── python scripts/init_project.py --kaggle                 │
│                                                                 │
│  9. Merge with local data                                       │
│     └── python scripts/zolai-dataset-combiner-v1.ipynb          │
│                                                                 │
│  10. Repeat — collect more data, upload, clean, merge           │
│      └── Continuous cycle, unlimited scale                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🤖 Agent Pipeline (Automated)

```
Crawler Bot ──→ Raw JSONL ──→ Cleaner Bot ──→ Cleaned JSONL ──→ Trainer Bot
     │                              │                               │
     ▼                              ▼                               ▼
  Web sources                  Kaggle upload                   QLoRA training
  News, blogs                  Mistral OCR                     Model checkpoints
  Dictionary                   Bible extraction                HF Hub upload
  Social media                 Deduplication                   Kaggle version
```

**Automation schedule (AWS server):**
- **Every 6 hours:** Crawler fetches new content
- **Every 12 hours:** Cleaner processes raw → cleaned
- **Every 24 hours:** Kaggle upload of new cleaned data
- **Every 7 days:** Full pipeline run (collect → clean → combine → train → upload)

---

## 📈 Metrics to Track

| Metric | Current | Target |
|--------|---------|--------|
| Raw corpus size | 6.2 GB | Unlimited |
| Cleaned corpus size | 1.5 GB | All cleaned |
| Unique sentences | ~388K | Unlimited |
| Dictionary entries | Sample | Full Tongdot |
| Bible verses (parallel) | 0 | 66 books × 2 versions |
| OCR'd pages | 0 | ~500 (lesson PDFs) |
| Training steps | Smoke test | 5000+ |
| Model quality | N/A | Perplexity < 10 |
| Kaggle dataset versions | 10 | Continuous |
| HF model downloads | 0 | Community usage |

---

## 🚀 Quick Start Commands

```bash
# 1. OCR all PDFs
python scripts/mistral_ocr_pdfs.py -i "data/external/lessons/" --resume --sleep 3

# 2. Package all raw data for Kaggle
python scripts/package_for_kaggle.py --all --output /tmp/zolai-raw-corpus/

# 3. Upload to Kaggle
kaggle datasets version -p /tmp/zolai-raw-corpus/ -m "Raw Zolai corpus $(date +%Y%m%d)"

# 4. Run cleaner on Kaggle (manual: open notebook, run all cells)
#    → zolai-cleaner-v2.ipynb

# 5. Download cleaned output
python scripts/init_project.py --kaggle

# 6. Merge all data
python scripts/zolai-dataset-combiner-v1.ipynb  # Or run on Kaggle

# 7. Train (on Kaggle GPU)
#    → zolai-qwen-training-v2.ipynb

# 8. Upload model
kaggle datasets version -p /kaggle/working/qwen-zolai-final/ -m "Qwen2.5-3B LoRA $(date +%Y%m%d)"
```

---

## 📝 Notes

- **No size limits** — collect everything, clean everything
- **Kaggle is the cleaning engine** — free T4×2, 12hr sessions, unlimited CPU
- **Continuous cycle** — collect → upload → clean → download → merge → repeat
- **Quality over quantity** — but aim for both
- **Pure Zolai rule** — never mix with Mizo, Falam, or other dialects
- **Gold standard** — LT Tuang (2018) + ZCLS + Tedim Bible
