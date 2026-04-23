# Zomi AI: The Zolai Second Brain

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![HuggingFace](https://img.shields.io/badge/🤗-peterpausianlian-blue)](https://huggingface.co/peterpausianlian)
[![Kaggle](https://img.shields.io/badge/Kaggle-datasets-20BEFF)](https://www.kaggle.com/peterpausianlian)
[![GitHub](https://img.shields.io/badge/GitHub-peterlianpi-black)](https://github.com/peterlianpi/zolai-ai)

> **Vision:** To ensure the Zolai language thrives in the AI era by building a fully capable "Zolai AI Second Brain" — allowing the Zomi people to learn, work, and interact with cutting-edge technology entirely in their native tongue.
>
> **Mission:** To digitize, standardize, and preserve the Zolai language through automated data-harvesting pipelines, creating high-purity bilingual datasets, and fine-tuning open-source LLMs to understand and generate fluent Tedim Zolai.

---

## 🔐 Security & Compliance

✅ **Security Audit:** Multi-agent system scans for sensitive data  
✅ **ZVS 2018 Standard:** 100% compliance with Tedim Zolai orthography  
✅ **Git History:** Cleaned of all sensitive information  
✅ **Wiki Audit:** 1,530 files validated by 3-agent discussion group

---

## Quick Install

**One-line install:**
```bash
git clone https://github.com/peterlianpi/zolai-ai.git
cd zolai-ai
pip install -e .
```

**Or via pip:**
```bash
pip install git+https://github.com/peterlianpi/zolai-ai.git
zolai --help
```

**Or via Docker:**
```bash
docker compose up   # API at http://localhost:8000
```


## Project Structure

```
zolai/
├── zolai/              # Core Python package (CLI, API, modules)
├── scripts/            # Utility scripts (crawlers, data_pipeline, training, maintenance)
├── wiki/               # Knowledge base (grammar, vocabulary, culture, curriculum)
├── data/               # Datasets — gitignored, hosted on Hugging Face Hub
├── agents/             # Agent definitions (34 specialized agents)
├── skills/             # Skill modules (46 skills)
├── website/            # Next.js web app (zolai-project)
├── docs/               # Documentation and guides
├── config/             # LoRA training config, service files
├── notebooks/          # Kaggle training notebooks
├── tests/              # Test suite
└── artifacts/          # Audit reports, analysis
```

---

## Data Assets

All datasets are gitignored and distributed via **[Hugging Face Hub](https://huggingface.co/peterpausianlian)** and **[Kaggle](https://www.kaggle.com/peterpausianlian)**.

| Dataset | Description |
|---|---|
| Parallel ZO↔EN pairs | 105k+ bilingual translation pairs |
| Unified dictionary | 152k entries (ZO↔EN) |
| Bible corpus | TB77, TBR17, Tedim2010 ↔ KJV parallel |
| Training set (v3) | ~5.1M deduplicated Zolai sentences |
| ORPO preference pairs | Preference pairs for alignment training |
| Eval benchmarks | QA, translation, ZVS compliance tests |

**Kaggle datasets:**
- [`zolai-llm-training-dataset`](https://www.kaggle.com/datasets/peterpausianlian/zolai-llm-training-dataset) — LLM train/val/test splits + training script
- [`zolai-adapter-qwen25-3b`](https://www.kaggle.com/datasets/peterpausianlian/zolai-adapter-qwen25-3b) — LoRA adapter checkpoints

```bash
# Download datasets
huggingface-cli download peterpausianlian/zolai-tedim-v3 --repo-type dataset
```

---

## Install & CLI

```bash
# Clone and install
git clone https://github.com/peterlianpi/zolai-ai.git
cd zolai-ai
pip install -e .
pip install -e ".[dev]"

# Core CLI
zolai standardize-jsonl -i INPUT -o OUTPUT [--dedupe] [--min-chars N]
zolai audit-jsonl -i INPUT [--text-field FIELD]

# Interactive menu
python scripts/ui/zolai_menu.py

# Dictionary search
python scripts/search_dictionary.py <word>
```

---

## Key Scripts

```bash
# Data collection
python scripts/crawlers/crawl_all_news.py
python scripts/crawlers/fetch_tongdot_dictionary.py --input FILE --output FILE
python scripts/crawlers/fetch_bible_versions.py

# Dictionary building
python scripts/build_dictionary_db.py
python scripts/build_enriched_dictionary.py
python scripts/build_semantic_dictionary.py

# Training data
python scripts/synthesize_instructions_v6.py
python scripts/data_pipeline/build_llm_dataset_v3.py

# Evaluation
python scripts/evaluate_model.py

# Quality & Security
python scripts/maintenance/test_grammar_rules.py
python scripts/doublecheck_master.py
python scripts/quick_security_audit.py
python scripts/wiki_example_audit_agents.py
```

---

## Website (Next.js)

```bash
cd website/zolai-project
bun install
bunx prisma migrate dev
bun dev
```

---

## Agents

| Agent | Purpose |
|---|---|
| `zomi-data` | Dataset management and processing |
| `zomi-bible-aligner` | Bible verse alignment |
| `zomi-dictionary-builder` | Dictionary construction |
| `zomi-synthesizer` | Instruction synthesis |
| `zomi-evaluator` | Quality evaluation |
| `zomi-wiki-manager` | Wiki maintenance |
| `zomi-cleaner-bot` | Data cleaning |
| `zomi-crawler-bot` | Web crawling |
| `zomi-trainer-bot` | Training pipeline |
| `zolai-learner` | Language learning tutor |
| `linguistic-specialist` | Linguistic analysis |
| `zomi-server-ops` | Server operations |

See `agents/README.md` for the full list of 34 agents.

---

## Zolai Language Rules (ZVS 2018 Standard)

**Dialect:** Tedim ZVS — use `pasian`, `gam`, `tapa`, `topa`, `kumpipa`, `tua`  
**Never:** `pasian`, `gam`, `tapa`, `bawipa`, `siangpahrang`, `cu/cun`  
**Word order:** SOV (Subject-Object-Verb)  
**Negation:** `kei` for conditionals, `lo` for simple negatives  
**Plural:** Use `-te` suffix (e.g., `thupite-te` = machines)  
**Pronunciation:** `o` is always /oʊ/ — never pure /o/

### Verified Grammar Patterns (Session 3)

✅ **Plural Marker Position:** Tu hun lai tak BEFORE subject
- ✅ "Tu hun lai tak AI agent in a sem khawm hi"
- ❌ "AI agent tu hun lai tak in a sem khawm hi"

✅ **Working Together:** a sem khawm (NOT kikhawm)
- ✅ "amau te ki pawl in na a sem khawm hi"
- ❌ "kikhawm" = gather in place only

✅ **Gathering:** kikhawm (place-specific)
- ✅ "biakinn ah i kikhawm hi" (we gather at church)

✅ **Word Order:** Tu hun lai tak + SUBJECT + in + VERB + DIRECTIONAL + hi
- ✅ "Tu hun lai tak AI agent in a sem khawm hong pia hi"

See `wiki/` for full grammar reference and `docs/guides/AGENTS.md` for coding standards.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Core language | Python 3.10+ |
| CLI / API | Typer, FastAPI |
| Frontend | Next.js 16, Tailwind CSS, Bun |
| Database | PostgreSQL (Prisma), SQLite FTS5 |
| ML / LLM | transformers==5.5.4, peft==0.19.1, trl==1.2.0, accelerate==1.13.0, bitsandbytes==0.49.2, torch==2.5.1+cu121 |
| Training platform | Kaggle (T4 GPU, session-based) |
| Model hosting | Hugging Face Hub |
| Deployment | Vercel (website), VPS (API), Docker |

---

## Current Models

**Active training — [peterpausianlian/zolai-qwen-0.5b](https://huggingface.co/peterpausianlian/zolai-qwen-0.5b)**
- Base: Qwen2.5-0.5B-Instruct
- Method: LoRA FP16, r=16, alpha=32
- Training: ~5.1M Zolai sentences, session-based (T4x2), currently at chunk 300k–800k
- Script: `scripts/training/train_kaggle_t4x2.py`

**Stable adapter — [peterpausianlian/zolai-qwen2.5-3b-lora](https://huggingface.co/peterpausianlian/zolai-qwen2.5-3b-lora)**
- Base: Qwen2.5-3B-Instruct
- Method: QLoRA (4-bit NF4), r=8, alpha=16
- Training: ~5.1M Zolai sentences + ORPO preference pairs (session-based, single T4)
- Notebook: `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the full 5-phase plan:
- **Phase 1** ✅ Foundation — data pipeline, dictionary, Bible corpus, ZVS wiki
- **Phase 2** 🔄 Open Source — publish datasets to HuggingFace, CI/CD
- **Phase 3** Model & API — GGUF export, public REST API, Ollama support
- **Phase 4** Community — language learning app, Telegram bot, OCR pipeline
- **Phase 5** Advanced NLP — NER, POS tagger, ASR, TTS, dialect detection

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). We especially need:
- Native Tedim speakers for data validation
- ML engineers with low-resource NLP experience
- Next.js / FastAPI developers

> **AI Agent CLIs:** This project works great with [Kiro CLI](https://kiro.dev) (`.kiro/` auto-loaded) and [Gemini CLI](https://github.com/google-gemini/gemini-cli) (`gemini -f GEMINI.md`). See CONTRIBUTING.md for usage examples.

## Security

✅ **Multi-Agent Security Audit:** Run `python scripts/quick_security_audit.py`  
✅ **Wiki Audit System:** Run `python scripts/wiki_example_audit_agents.py`  
✅ **Git History:** Cleaned of all sensitive data  
✅ **Environment Variables:** Use `.env` (gitignored) for API keys

See [SECURITY.md](SECURITY.md) for detailed security guidelines.

## Author

**Peter Pau Sian Lian**  
Founder, Zolai AI Second Brain  
- GitHub: [@peterlianpi](https://github.com/peterlianpi)  
- HuggingFace: [peterpausianlian](https://huggingface.co/peterpausianlian)  
- Kaggle: [peterpausianlian](https://www.kaggle.com/peterpausianlian)  
- Email: peterpausianlian2020@gmail.com
