# Kaggle Session Roadmap

## Pipeline Overview

```
Phase 1: Data Collection  →  Phase 2: Cleaning  →  Phase 3: Combine  →  Phase 4: AI Refinement  →  Phase 5: Training
     (CPU only)                (CPU only)            (CPU only)          (GPU recommended)        (GPU required)
```

---

## Phase 1: Data Collection (CPU Only)

### 1.1 `tongdot_fetcher_batches.ipynb`
- **Purpose:** Fetch dictionary entries from Tongdot in batches
- **GPU:** No (network I/O bound)
- **Internet:** Required
- **Input:** None (web scraping)
- **Output:** `/kaggle/working/` → JSONL dictionary files
- **Kaggle Storage:** Save output as Kaggle Dataset version for downstream notebooks

### 1.2 `tongsan_scraper.ipynb`
- **Purpose:** Scrape Tongsan articles
- **GPU:** No (network I/O bound)
- **Internet:** Required
- **Input:** None (web scraping)
- **Output:** `/kaggle/working/` → article JSONL files
- **Kaggle Storage:** Save as dataset version

### 1.3 `tedim_hymn_scraper.ipynb`
- **Purpose:** Scrape Tedim hymns
- **GPU:** No
- **Internet:** Required
- **Input:** None
- **Output:** `/kaggle/working/` → hymn JSONL
- **Kaggle Storage:** Save as dataset version

### 1.4 `zolai-crawler-v2.ipynb` / `zolai-web-crawler-v3.ipynb`
- **Purpose:** General Zolai web crawling
- **GPU:** No
- **Internet:** Required
- **Input:** Seed URLs
- **Output:** `/kaggle/working/` → crawled JSONL
- **Kaggle Storage:** Save as dataset version

### 1.5 `zomi_fetcher.ipynb`
- **Purpose:** Fetch Zomi language data
- **GPU:** No
- **Internet:** Required
- **Output:** `/kaggle/working/` → Zomi JSONL

---

## Phase 2: Cleaning (CPU Only)

### 2.1 `kaggle-zolai-cleaner.ipynb`
- **Purpose:** Clean Bible pairs, dictionary entries, grammar instructions, text corpus
- **GPU:** No (pure text processing)
- **Internet:** Only for `pip install`
- **Kaggle Input:** Add dataset `peterpausianlian/zolai-dataset` → `/kaggle/input/zolai-dataset/`
- **Kaggle Output:** `/kaggle/working/cleaned_*.jsonl` → `zolai_cleaned_merged.jsonl`
- **Storage:** Save cleaned outputs as new Kaggle Dataset version

### 2.2 `zolai-cleaner-v2.ipynb` ⭐ **Primary Cleaner**
- **Purpose:** Full production cleaner with NFKC normalization, HTML/URL stripping, dedup, soft refine, noise drop, train/val/test split, HF export
- **GPU:** No (CPU-only streaming, ~2M rows in ~10-20 min)
- **Internet:** Only for `pip install`
- **Kaggle Input:** Add dataset `peterpausianlian/zolai-master-data` → `/kaggle/input/datasets/peterpausianlian/zolai-master-data/`
  - Or set env `ZOLOAI_INPUT_JSONL` to a single file path
- **Kaggle Output:** `/kaggle/working/zolai_cleaner_out/`
  - `zolai_train_ready_v2.jsonl` → `train.jsonl`, `val.jsonl`, `test.jsonl`
  - Optional: `zolai_hf_disk_export/` (HF DatasetDict)
  - `pipeline.log`, `cleaning_report.log`, `bloat_report.json`
- **Storage Strategy:**
  1. Run → outputs in `/kaggle/working/zolai_cleaner_out/`
  2. Stage files → `kaggle datasets version -p /kaggle/working/zolai_kaggle_upload_staging -m "message"`
  3. Or set `EXPORT_HF_DATASET=True` → use `zolai_hf_disk_export/` as input for training notebook via `ZOLOAI_DATASET_SRC`

### 2.3 `zolai-bible-pipeline-v1.ipynb`
- **Purpose:** Bible-specific pipeline
- **GPU:** No
- **Kaggle Input:** Bible source files
- **Kaggle Output:** `/kaggle/working/` → cleaned Bible JSONL

### 2.4 `zolai-loan-word-filter.ipynb`
- **Purpose:** Filter English loan words from Zolai corpus
- **GPU:** No (uses LLM API, not local GPU)
- **Internet:** Required (for Gemini/OpenAI API calls)
- **Input:** Flagged foreign words JSON
- **Output:** `/kaggle/working/legitimate_loan_words.json`, purified vocabulary

---

## Phase 3: Combine (CPU Only)

### 3.1 `zolai-dataset-combiner-v1.ipynb` ⭐
- **Purpose:** Merge all cleaned sources into ONE unified dataset with dedup, split, and HF export
- **GPU:** No (streaming merge)
- **Internet:** Only for `pip install`
- **Kaggle Input:** Add all source datasets under `/kaggle/input/datasets/peterpausianlian/`
  - Auto-discovers: `zolai_train_ready_v2.jsonl`, `train.jsonl`, `val.jsonl`, `test.jsonl`, HF disk datasets
- **Kaggle Output:** `/kaggle/working/zolai_combine_out/`
  - `zolai_merged_all.jsonl` → `train.jsonl`, `val.jsonl`, `test.jsonl`
  - `zolai_hf_disk_export/` (HF DatasetDict with train/validation)
  - `combine_report.json`, `combine_progress.log`
- **Storage Strategy:**
  1. Run → outputs in `/kaggle/working/zolai_combine_out/`
  2. Zips created: `zolai_combined_dataset.zip`, `zolai_hf_disk_export.zip`
  3. Set `PUBLISH_KAGGLE_VERSION=True` to auto-publish
  4. Use `HF_EXPORT_DIR` as `ZOLOAI_DATASET_SRC` for training notebook

### 3.2 `zolai-dataset-gap-audit.ipynb`
- **Purpose:** Audit dataset for coverage gaps
- **GPU:** No
- **Kaggle Input:** Combined dataset
- **Kaggle Output:** `/kaggle/working/` → gap audit report

---

## Phase 4: AI Refinement (GPU Recommended)

### 4.1 `zolai-cleaning-pipeline-local-gemma-2b.ipynb`
- **Purpose:** Use local Gemma 2B to fix/translate Zolai text with English back-translation
- **GPU:** **Required** (T4 recommended, supports 2× T4 DDP)
  - Without GPU: Will fail (model loading requires CUDA)
- **Internet:** Required (for `pip install` + HuggingFace model download)
- **Secrets:** `HF_TOKEN` (Kaggle → Add-ons → Secrets)
- **Kaggle Input:** Auto-discovers from `/kaggle/input/` and `/kaggle/working/zolai_cleaner_out/`
  - Priority: `after_gemini` > `gold_train` > `train_ready` > `train`
- **Kaggle Output:** `/kaggle/working/zolai_after_local_gemma.jsonl`
  - Progress checkpoint: `zolai_after_local_gemma.progress.json` (supports resume)
- **Storage Strategy:**
  1. Run → streamed output to `/kaggle/working/zolai_after_local_gemma.jsonl`
  2. Feed into `zolai-dataset-combiner-v1.ipynb` (auto-picks this file)
  3. Or feed directly into `zolai-qwen-training-v2.ipynb` via `ZOLOAI_DATASET_SRC`
- **Performance Tips:**
  - Start with 50k samples, batch size 5-10
  - 4-bit quantization (NF4) fits on T4
  - Resume from checkpoint if session disconnects

### 4.2 `zolai-end-to-end-pipeline.ipynb`
- **Purpose:** Similarity scoring + loan word filtering + LLM correction + human review UI
- **GPU:** No (uses Gemini API, not local GPU)
- **Internet:** Required (Gemini API + `sentence-transformers` download)
- **Secrets:** `GEMINI_API_KEY`
- **Kaggle Input:** `/kaggle/input/zolai-dataset-train/data/` and `/kaggle/input/zolai-dataset-train/resources/`
- **Kaggle Output:** `/kaggle/working/`
  - `tongdot_dict_scored.jsonl`, `legitimate_loan_words.json`, `tech_seed_data_fixed.jsonl`
- **Storage:** Download review UI output or save scored JSONL as dataset version

### 4.3 `zolai-llm-correction-and-review.ipynb`
- **Purpose:** LLM-based grammar correction with human review
- **GPU:** No (API-based)
- **Internet:** Required
- **Kaggle Input:** Seed data with prompts
- **Kaggle Output:** `/kaggle/working/` → corrected JSONL + review DataFrame

### 4.4 `zolai-pipeline-kaggle.ipynb`
- **Purpose:** Consolidated Kaggle pipeline
- **GPU:** Depends on sub-steps
- **Kaggle Input/Output:** Varies by configuration

---

## Phase 5: Training (GPU Required)

### 5.1 `zolai-qwen-training-v2.ipynb` ⭐ **Primary Training Notebook**
- **Purpose:** Qwen2.5-3B-Instruct LoRA fine-tuning (QLoRA 4-bit)
- **GPU:** **Required**
  - Single T4: Set `USE_DDP_2GPU=False`, `CUDA_VISIBLE_DEVICES=0`
  - 2× T4: Set `USE_DDP_2GPU=True` (Accelerate DDP, ~2× speed)
- **Internet:** Required (model + tokenizer from HuggingFace Hub)
- **Secrets:** `HF_TOKEN`
- **Kaggle Input:** Add dataset `peterpausianlian/zolai-hf-advanced`
  - Path: `/kaggle/input/datasets/peterpausianlian/zolai-hf-advanced/`
  - Or set env `ZOLOAI_DATASET_SRC` to any HF `load_from_disk` folder
- **Kaggle Output:**
  - `/kaggle/working/qwen-zolai/` → checkpoints (`checkpoint-*`)
  - `/kaggle/working/qwen-zolai-final/` → final adapter + tokenizer
  - `/kaggle/working/checkpoint_zips/` → zipped checkpoints for download/resume
  - `/kaggle/working/qwen_zolai_lora.zip` → final adapter zip
- **Storage Strategy:**
  1. Dataset copies from read-only `/kaggle/input/` → `/kaggle/working/zolai_dataset/` (skipped on re-run if exists)
  2. Checkpoints saved every 200 steps (configurable via `save_steps`)
  3. Each checkpoint auto-zipped to `checkpoint_zips/` for download
  4. Final adapter zipped as `qwen_zolai_lora.zip`
  5. Optional: `DO_KAGGLE_UPLOAD=True` → publish to Kaggle Dataset
  6. Optional: `DO_HF_UPLOAD=True` → push to HuggingFace Hub
  7. Optional: `DO_KAGGLE_MODEL_UPLOAD=True` → Kaggle Model registry
- **Resume Strategy:**
  - Set `RESUME_FROM_CHECKPOINT=True` → auto-resumes from latest checkpoint
  - After disconnect: re-run all cells from top → training continues from last checkpoint
  - For chunked runs: raise `TOTAL_MAX_STEPS` cumulatively (e.g. 5000 → 10000 → 15000)
- **Disk Management:**
  - `FORCE_RECOPY_DATASET=False` after first copy (saves time + disk)
  - `ZIP_CHECKPOINTS_FOR_DOWNLOAD=False` if space is tight
  - Delete old `checkpoint-*` dirs between runs if `/kaggle/working` is small (~20 GiB)
- **Smoke Test:** Set `MAX_TRAIN_SAMPLES=2048` and `TOTAL_MAX_STEPS=100` to verify pipeline before long run

### 5.2 `zolai-language-learner-v1.ipynb`
- **Purpose:** Language learning application/demo
- **GPU:** Optional (faster inference with GPU)
- **Kaggle Input:** Trained adapter or base model
- **Kaggle Output:** `/kaggle/working/` → inference results

---

## Recommended Session Order

### Session 1: Data Collection (CPU, ~1-2 hours)
```
1. tongdot_fetcher_batches.ipynb
2. tongsan_scraper.ipynb
3. tedim_hymn_scraper.ipynb
4. zolai-web-crawler-v3.ipynb
→ Save all outputs as Kaggle Dataset versions
```

### Session 2: Cleaning (CPU, ~30-60 min)
```
1. kaggle-zolai-cleaner.ipynb (or zolai-cleaner-v2.ipynb for production)
2. zolai-loan-word-filter.ipynb
3. zolai-bible-pipeline-v1.ipynb
→ Save cleaned outputs as Kaggle Dataset version
```

### Session 3: Combine (CPU, ~15-30 min)
```
1. zolai-dataset-combiner-v1.ipynb
   - Set EXPORT_HF_DISK=True
→ Output: zolai_hf_disk_export/ → use as ZOLOAI_DATASET_SRC for training
```

### Session 4: AI Refinement (GPU T4, ~2-6 hours)
```
1. zolai-cleaning-pipeline-local-gemma-2b.ipynb
   - Start with 50k samples, scale up
→ Output: zolai_after_local_gemma.jsonl
2. Re-run zolai-dataset-combiner-v1.ipynb to merge refined data
```

### Session 5: Training (GPU T4 ×2, ~6-24 hours)
```
1. zolai-qwen-training-v2.ipynb
   - Smoke test first: MAX_TRAIN_SAMPLES=2048, TOTAL_MAX_STEPS=100
   - Full run: MAX_TRAIN_SAMPLES=None, TOTAL_MAX_STEPS=5000+
   - Resume across sessions: RESUME_FROM_CHECKPOINT=True
→ Output: qwen_zolai_lora.zip (downloadable adapter)
```

---

## Kaggle Storage I/O Cheat Sheet

| Action | Command / Setting |
|--------|-------------------|
| Add input dataset | Kaggle UI → "Add Input" → search `peterpausianlian/...` |
| Read input | `/kaggle/input/datasets/peterpausianlian/<dataset-name>/` |
| Write output | `/kaggle/working/` (persists only during session; download or commit to save) |
| Save output permanently | Commit notebook version OR `kaggle datasets version -p /path -m "msg"` |
| Env var for dataset source | `os.environ["ZOLOAI_DATASET_SRC"] = "/kaggle/working/zolai_hf_disk_export"` |
| Env var for single input file | `os.environ["ZOLOAI_INPUT_JSONL"] = "/kaggle/input/.../file.jsonl"` |
| Secrets (API keys) | Kaggle UI → Settings → Add-ons → Secrets → `HF_TOKEN`, `GEMINI_API_KEY` |
| Download outputs | Kaggle notebook → "Output" panel → download files/zips |
| Check disk space | `shutil.disk_usage("/kaggle/working")` |
| List input files | `os.listdir("/kaggle/input/")` |

---

## GPU vs CPU Summary

| Notebook | CPU Only | GPU Required | Notes |
|----------|----------|--------------|-------|
| tongdot_fetcher_batches | ✅ | | Network I/O |
| tongsan_scraper | ✅ | | Network I/O |
| tedim_hymn_scraper | ✅ | | Network I/O |
| zolai-crawler-v2 / v3 | ✅ | | Network I/O |
| zomi_fetcher | ✅ | | Network I/O |
| kaggle-zolai-cleaner | ✅ | | Text processing |
| zolai-cleaner-v2 | ✅ | | Streaming cleaner |
| zolai-bible-pipeline-v1 | ✅ | | Text processing |
| zolai-loan-word-filter | ✅ | | API calls (Gemini) |
| zolai-dataset-combiner-v1 | ✅ | | Streaming merge |
| zolai-dataset-gap-audit | ✅ | | Analysis |
| zolai-cleaning-pipeline-local-gemma-2b | | ✅ T4 | 4-bit Gemma 2B |
| zolai-end-to-end-pipeline | ✅ | | API calls (Gemini) |
| zolai-llm-correction-and-review | ✅ | | API calls |
| zolai-pipeline-kaggle | ⚠️ | Depends | Configurable |
| zolai-qwen-training-v2 | | ✅ T4 ×2 | QLoRA 4-bit training |
| zolai-language-learner-v1 | ⚠️ | Optional | Inference demo |
