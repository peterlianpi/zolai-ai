# Zomi AI: End-to-End Kaggle Automation Roadmap

This roadmap transforms the Zolai AI pipeline from a manual set of scripts into a fully automated "loop" that runs on Kaggle's infrastructure, leveraging their 12h sessions for both data prep and training.

## 🏗️ The "Infinite Loop" Architecture

The system is split into three autonomous Kaggle Kernels that trigger each other via the Kaggle API.

### Phase 1: The Harvester (Crawl & Store)
**Purpose:** Pure data acquisition.
- **Kaggle Kernel:** `zolai-harvester`
- **Action:**
    - Runs a headless crawler (e.g., using `playwright` or `requests`) targeting Zolai web sources.
    - Cleans raw HTML tags immediately using `BeautifulSoup`.
    - Saves raw text as `.jsonl` (one line per document).
- **Output:** Pushes result as a version update to Kaggle Dataset: `zolai-raw-corpus`.
- **Trigger:** Scheduled to run every 12 hours via `kaggle kernels push`.

### Phase 2: The Refiner (Clean & Format)
**Purpose:** Data purity and standardization.
- **Kaggle Kernel:** `zolai-refiner`
- **Action:**
    - Mounts `zolai-raw-corpus`.
    - **Cleaning Pipeline:** 
        - Noise removal (regex for common web garbage).
        - Standard Zolai (LT Tuang) normalization.
        - Deduplication (SHA-256 hashing of lines).
        - Language Purity Check (Filtering out non-Zolai text).
- **Output:** Pushes result to Kaggle Dataset: `zolai-clean-dataset`.
- **Trigger:** Starts immediately after `zolai-harvester` completes.

### Phase 3: The Trainer (Fine-Tune)
**Purpose:** Model evolution.
- **Kaggle Kernel:** `zolai-trainer`
- **Action:**
    - Mounts `zolai-clean-dataset`.
    - Loads Qwen2.5-3B / Llama-3.
    - Performs LoRA fine-tuning on the fresh dataset.
- **Output:** Pushes trained weights/adapters to Kaggle Dataset: `zolai-model-weights`.
- **Trigger:** Weekly or when `zolai-clean-dataset` grows by >10%.

---

## 🛠️ Implementation Plan

### 1. Local Orchestration (OpenClaw's Role)
OpenClaw acts as the "Brain" (CEO) that manages the Kaggle API. Instead of you manually clicking, OpenClaw runs:
```bash
# OpenClaw Automation Script
kaggle kernels push -f harvester_metadata.json
# Wait for harvester...
kaggle kernels push -f refiner_metadata.json
# Wait for refiner...
kaggle kernels push -f trainer_metadata.json
```

### 2. Automated Notebook Logic (The "Background" Secret)
To make the notebooks run in the background:
- **Kaggle API Push:** Use `kaggle kernels push`. This submits the notebook to Kaggle's backend. It runs in a separate session (up to 12h) without you needing to keep the browser open.
- **Persistence:** All data MUST be saved to Kaggle Datasets, as `/kaggle/working` is wiped after the session ends.

## 🚀 Immediate Action Items

1. **Move Project Root:** I will align all future paths to `/home/peter/Downloads/Kaggle`.
2. **Build Harvester Notebook:** I need to create the `zolai_harvester.ipynb` which includes the web-scraping logic.
3. **Build Refiner Notebook:** I will upgrade the existing `zolai_fetch_clean.ipynb` to include advanced noise removal and deduplication.
4. **Kaggle API Sync:** Ensure your `kaggle.json` is in the correct place.

**Shall I start by building the `zolai_harvester.ipynb` for the web-crawling phase?**