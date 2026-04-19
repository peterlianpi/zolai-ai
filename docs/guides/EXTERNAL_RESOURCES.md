# External Resources Reference — Zolai Project

> Complete catalog of all external data sources, websites, APIs, documentation, models, and papers used by this project. Last updated: 2026-04-04.

---

## 1. Data Sources (Websites & APIs)

### 1.1 Tongdot Dictionary
- **URL:** https://www.tongdot.com/search/
- **API Pattern:** `https://www.tongdot.com/search/?q=<word>`
- **Audio:** `https://www.gstatic.com/dictionary/static/sounds/de/0/<word>.mp3`
- **Purpose:** Primary Chin language dictionary — Zolai word definitions, translations, audio pronunciations
- **Used by:** `fetch_tongdot_dictionary.py`, `build_tongdot_search_words.py`, `tongdot_fetcher_batches.ipynb`
- **Rate limit:** Add `--sleep SECS` to avoid blocking
- **Languages covered:** Tedim, Haka, Laizo/Falam, Matu, Zolai, Zomi

### 1.2 Tongsan.org
- **URL:** https://tongsan.org
- **WordPress API:** `https://tongsan.org/wp-json/wp/v2/`
- **Endpoints:**
  - Posts: `/wp-json/wp/v2/posts`
  - Categories: `/wp-json/wp/v2/categories`
  - Tags: `/wp-json/wp/v2/tags`
- **Purpose:** Chin news/content site — source for Zolai articles, vocabulary, and cultural content
- **Used by:** `tongsan_scraper.ipynb`, `extract_tongsan_vocabulary.py`
- **Data format:** JSON (WordPress REST API)

### 1.3 Bible Sources
- **Chin Bible Dataset (Kaggle):** `peterpausianlian/bible-datasets`
- **Versions included:**
  - `tdb77` — Zolai/Tedim 1977
  - `tedim1932` — Tedim 1932
  - `kjv` — King James Version (English)
  - `judson` — Judson Myanmar Bible
  - `hcl06` — Hakha Chin 2006
  - `fcl` — Falam Chin
- **Used by:** `zolai-bible-pipeline-v1.ipynb`, `extract_bible_vocabulary.py`

---

## 2. Cloud Platforms

### 2.1 Kaggle
- **Website:** https://www.kaggle.com
- **Docs:** https://www.kaggle.com/docs
- **API Docs:** https://www.kaggle.com/docs/api
- **GPU Tips:** https://www.kaggle.com/docs/efficient-gpu-usage-tips
- **Features:**
  - Free GPU: T4 ×2 (16 GB each), P100, V100 (rare)
  - 30 GB RAM (standard), 100 GB (large dataset mode)
  - ~73 GB disk (`/kaggle/working`)
  - 12-hour session limit
  - 30 hrs/week internet (GPU), unlimited (CPU-only)
- **CLI:** `pip install kaggle`
- **Python library:** `pip install kagglehub`
- **Authentication:** `~/.kaggle/kaggle.json` (chmod 600)

### 2.2 HuggingFace
- **Website:** https://huggingface.co
- **Hub:** https://huggingface.co/models (models), https://huggingface.co/datasets (datasets)
- **CLI:** `pip install huggingface_hub` → `huggingface-cli login`
- **Features:**
  - Free model/dataset hosting
  - Dataset viewer for inspecting data
  - Spaces for demos
  - Inference API for testing
- **Authentication:** `huggingface-cli login` or `HF_TOKEN` env var

### 2.3 GitHub Models API ⭐ **Free with GitHub**
- **Website:** https://github.com/marketplace/models
- **Docs:** https://docs.github.com/en/github-models
- **SDK:** https://github.com/github/copilot-sdk
- **Endpoint:** `https://models.inference.ai.azure.com` (OpenAI-compatible)
- **Authentication:** GitHub Personal Access Token with `github-models` scope
- **Available models (20+):**
  - **OpenAI:** gpt-4o, gpt-4o-mini, o3-mini
  - **Anthropic:** claude-sonnet-4, claude-opus-4, claude-haiku
  - **Google:** gemini-2.0-flash, gemini-2.5-pro, gemini-2.0-flash-lite
  - **Meta:** meta-llama-3.3-70b-instruct, meta-llama-3.1-405b-instruct
  - **Mistral:** mistral-large-2, codestral-latest
  - **Cohere:** cohere-command-r-plus, cohere-command-r
- **Rate limits:** Generous for personal use (check docs for latest)

---

## 3. ML Frameworks & Libraries

### 3.1 Core Training Stack

| Library | Docs | Version | Purpose |
|---------|------|---------|---------|
| **Transformers** | https://huggingface.co/docs/transformers | >=4.45.0 | Model loading, tokenization, generation |
| **TRL** | https://huggingface.co/docs/trl | >=0.9.0 | SFTTrainer for supervised fine-tuning |
| **PEFT** | https://huggingface.co/docs/peft | >=0.12.0 | LoRA adapter configuration |
| **BitsAndBytes** | https://huggingface.co/docs/bitsandbytes | >=0.43.0 | 4-bit quantization (NF4) |
| **Accelerate** | https://huggingface.co/docs/accelerate | >=0.34.0 | DDP, device placement, notebook_launcher |
| **Datasets** | https://huggingface.co/docs/datasets | >=2.19.0 | Dataset loading, streaming, HF export |
| **PyTorch** | https://pytorch.org/docs/ | latest | Deep learning backend |

### 3.2 Data Processing

| Library | Purpose |
|---------|---------|
| **pandas** (>=2.0,<3) | DataFrame operations, split, stats |
| **scikit-learn** | train_test_split, metrics |
| **sentence-transformers** | Semantic similarity scoring (MiniLM) |
| **tqdm** (>=4.66) | Progress bars |
| **jsonlines** | JSONL file handling |
| **matplotlib** (>=3.5,<3.10.1) | Histograms, plots |

### 3.3 Kaggle Integration

| Library | Purpose |
|---------|---------|
| **kaggle** (>=1.6.0) | CLI for dataset/notebook operations |
| **kagglehub** | Python library for Kaggle resource access |
| **kaggle_secrets** | Access Kaggle notebook secrets (built-in) |

---

## 4. AI Models

### 4.1 Local Models (for fine-tuning on Kaggle T4)

| Model | HF Link | Size | 4-bit VRAM | Best For |
|-------|---------|------|------------|----------|
| **Qwen2.5-3B-Instruct** ⭐ | https://huggingface.co/Qwen/Qwen2.5-3B-Instruct | 3B | ~2 GB | **Primary fine-tuning target** |
| Qwen2.5-7B-Instruct | https://huggingface.co/Qwen/Qwen2.5-7B-Instruct | 7B | ~4 GB | Higher quality |
| Qwen2.5-14B-Instruct | https://huggingface.co/Qwen/Qwen2.5-14B-Instruct | 14B | ~8 GB | Best quality (P100/V100) |
| Gemma 3 4B IT | https://huggingface.co/google/gemma-3-4b-it | 4B | ~2.5 GB | Good alternative |
| Gemma 2 2B IT | https://huggingface.co/google/gemma-2-2b-it | 2B | ~1.5 GB | Fast back-translation |
| Llama 3.2 3B Instruct | https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct | 3B | ~2 GB | General purpose (gated) |
| Phi-4-mini | https://huggingface.co/microsoft/Phi-4-mini-instruct | 3.8B | ~2.5 GB | English-heavy tasks |

### 4.2 Embedding Models

| Model | HF Link | Purpose |
|-------|---------|---------|
| all-MiniLM-L6-v2 | https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2 | Semantic similarity scoring |
| paraphrase-multilingual-MiniLM-L12-v2 | https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | Multilingual similarity |

### 4.3 API Models (via GitHub Models — Free)

| Model | Provider | Best For |
|-------|----------|----------|
| gpt-4o | OpenAI | Best quality, coding, explanations |
| gpt-4o-mini | OpenAI | Fast, cheap, bulk processing |
| o3-mini | OpenAI | Reasoning tasks |
| claude-sonnet-4 | Anthropic | Best reasoning, grammar correction |
| claude-opus-4 | Anthropic | Most powerful (expensive) |
| gemini-2.0-flash | Google | Fast, good multilingual |
| gemini-2.5-pro | Google | Best quality, reasoning |
| meta-llama-3.3-70b-instruct | Meta | Open-source 70B model |
| mistral-large-2 | Mistral | Strong general purpose |

---

## 5. Research Papers

| Paper | URL | Relevance |
|-------|-----|-----------|
| **QLoRA** | https://arxiv.org/abs/2305.14314 | Efficient fine-tuning of quantized LLMs |
| **Qwen2.5 Technical Report** | https://arxiv.org/abs/2412.15115 | Qwen2.5 model architecture and training |
| **SEA-LION** | https://huggingface.co/papers/2504.05747 | Southeast Asian Languages in One Network |
| **Tiny Aya** | https://arxiv.org/abs/2603.11510v1 | Small multilingual model |
| **MiniLingua** | https://arxiv.org/pdf/2512.13298 | Small open-source multilingual LLM |
| **LOLA** | https://arxiv.org/html/2409.11272v5 | Massively multilingual LLM |

---

## 6. Kaggle Datasets (peterpausianlian)

| Dataset | Purpose | Priority |
|---------|---------|----------|
| `zolai-master-data` | Primary master dataset — cleaned corpus | Critical |
| `zolai-hf-advanced` | HF-formatted training data for Qwen | Critical |
| `zolai-crawled-dataset` | Web crawler output | High |
| `zolai-crawled-master` | Crawler master (earlier version) | Medium |
| `zolai-bible-dataset` | Bible parallel dataset | High |
| `bible-datasets` | Source Chin Bible datasets | High |
| `Chin-Bible` | Alternative Chin Bible path | Medium |
| `zolai-dataset` | General Zolai dataset | Medium |
| `zolai-language-model` | Language model dataset | Low |
| `zolai-qwen-training-v2` | Qwen training output | Low |

---

## 7. HuggingFace Repos (peterpausianlian)

| Repo | Type | Purpose |
|------|------|---------|
| `zolai-hf-advanced` | Dataset | HF DatasetDict for Qwen training |
| `zolai-qwen2.5-3b-lora` | Model | LoRA adapter weights |

---

## 8. Local Data Structure

```
data/
├── kaggle/                          # Datasets fetched from Kaggle (auto-created)
│   ├── zolai-master-data/
│   ├── zolai-hf-advanced/
│   └── ...
├── hf/                              # Datasets/models from HuggingFace (auto-created)
│   ├── zolai-hf-advanced/
│   └── zolai-qwen2.5-3b-lora/
├── zolai_bible_dataset/             # Bible parallel datasets (local)
│   ├── bible_parallel.jsonl
│   ├── bible_zolai_english_pairs.jsonl
│   ├── bible_tdb77.jsonl
│   └── ...
├── zolai-focused/                   # Zolai-focused cleaned data
│   ├── tongdot_zolai_dictionary.jsonl
│   ├── tongsan_zolai_standardized.jsonl
│   └── ...
├── processed/                       # Processed/standardized outputs
│   ├── zolai_unified_vocabulary_pure.json
│   └── ...
├── intermediate/                    # Intermediate processing results
│   └── ...
├── for-later/                       # Backup/staging files
│   └── ...
├── combined-dict-translation/       # Combined dictionary translations
│   └── ...
├── Zolai Lessons/                   # PDF educational materials
│   └── ...
└── RESOURCE_CATALOG.json            # Auto-generated catalog of all sources

resources/
├── zolai_system_prompt.txt          # Master LLM system prompt
├── zolai_ai_instructions.md         # AI instructions (SVO, ergative, back-translation)
├── zolai_grammar_cheat_sheet.md     # Syntax and structural rules
├── zolai_everyday_vocabulary.md     # Standardized everyday vocabulary
├── zolai_vocabulary_lists.md        # Vocabulary lists
├── data_quality_recommendations.md  # Data quality standards
├── agentic_system_architecture.md   # Multi-agent system design
└── agent_knowledge/                 # Agent knowledge base
    ├── zolai_sinna.md
    ├── gentehna_tuamtuam_le_a_deihnate.md
    ├── sources_index.md
    └── full_sources/                # Extracted source texts (50+ dirs)
```

---

## 9. Setup & Authentication

### 9.1 Kaggle Setup
```bash
# Install
pip install kaggle kagglehub

# Authenticate (local machine)
mkdir -p ~/.kaggle
# Download kaggle.json from Kaggle → Account → API
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json

# Test
kaggle datasets list -s "zolai"
```

### 9.2 HuggingFace Setup
```bash
# Install
pip install huggingface_hub datasets

# Authenticate
huggingface-cli login
# Paste your token from https://huggingface.co/settings/tokens

# Test
huggingface-cli whoami
```

### 9.3 GitHub Models Setup
```bash
# Create GitHub PAT: https://github.com/settings/tokens
# Scope: github-models

# Set as env var
export GITHUB_TOKEN="ghp_..."

# Test (OpenAI-compatible endpoint)
python -c "
import openai
client = openai.OpenAI(
    base_url='https://models.inference.ai.azure.com',
    api_key='ghp_...',
)
r = client.chat.completions.create(
    model='gpt-4o-mini',
    messages=[{'role': 'user', 'content': 'Hello'}],
)
print(r.choices[0].message.content)
"
```

### 9.4 Kaggle Notebook Secrets
In Kaggle UI → Notebook → Settings → Add-ons → Secrets:

| Key | Value |
|-----|-------|
| `HF_TOKEN` | Your HuggingFace token |
| `GITHUB_TOKEN` | Your GitHub PAT (for GitHub Models API) |
| `GEMINI_API_KEY` | Google AI Studio API key |
| `OPENAI_API_KEY` | OpenAI API key (optional if using GitHub Models) |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional) |

---

## 10. Quick Fetch Commands

```bash
# Fetch all data (run from project root)
python scripts/init_project.py

# List all sources without fetching
python scripts/init_project.py --list

# Dry run (show what would be fetched)
python scripts/init_project.py --dry-run

# Fetch only critical datasets
python scripts/init_project.py --critical-only

# Fetch Kaggle datasets only
python scripts/init_project.py --kaggle

# Fetch HuggingFace datasets/models only
python scripts/init_project.py --hf

# Manual Kaggle download
kaggle datasets download -d peterpausianlian/zolai-master-data -p data/kaggle/zolai-master-data --unzip

# Manual HuggingFace download
huggingface-cli download peterpausianlian/zolai-hf-advanced --repo-type dataset --local-dir data/hf/zolai-hf-advanced
```
