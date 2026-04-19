# Zolai Departments, Agents & Research Responsibilities
> Last updated: 2026-04-18

---

## Department Map

```
ZOLAI PROJECT
├── DATA DEPARTMENT
│   ├── zomi-data           — Master data manager
│   ├── zomi-crawler-bot    — Web scraping
│   └── zomi-cleaner-bot    — Data cleaning + quality metrics
│
├── RESEARCH DEPARTMENT
│   ├── zolai-research-tracker  — Monitor arxiv, new models
│   ├── zomi-evaluator          — Benchmark & metrics (owns eval sets)
│   └── linguistic-specialist   — Grammar & linguistics
│
├── TRAINING DEPARTMENT
│   ├── zomi-trainer-bot    — CPT + SFT training runs
│   └── zolai-dpo-builder   — DPO/ORPO alignment
│
├── SYNTHESIS DEPARTMENT
│   └── zomi-synthesizer    — Generate instruction + curriculum data
│
├── QUALITY DEPARTMENT  [NOTE: zolai-data-quality merged into Data dept]
│   └── zolai-grammar-checker — ZVS compliance checking
│
├── LANGUAGE DEPARTMENT
│   ├── zolai-learner       — Language learning tutor
│   ├── zolai-lesson-tutor  — Lesson delivery
│   ├── zolai-grammar-learner — Grammar study
│   └── zomi-philosopher    — Linguistic reasoning
│
├── DICTIONARY DEPARTMENT
│   ├── zomi-dictionary-builder — Build dictionaries
│   └── zolai-bible-dictionary-builder — Bible vocab
│
├── BIBLE DEPARTMENT
│   ├── zomi-bible-aligner  — Verse alignment
│   └── zomi-bible-vocab-builder — Bible vocabulary
│
└── OPS DEPARTMENT
    ├── zomi-server-ops     — Server management
    └── zomi-ops-monitor    — System monitoring
```

---

## Research Responsibilities by Department

### Data Department
**Primary research reference:** `wiki/training/research_v2_datasets_and_cleaning.md`

| Agent | Key Research Task |
|---|---|
| `zomi-crawler-bot` | Mine eBible, OPUS Bible, SEA community sites |
| `zomi-cleaner-bot` | Run FineWeb2-style pipeline on all new data |
| `zolai-data-quality` | Track quality metrics, build Zolai langid model |

**Current priorities:**
1. Check FineWeb2 and MADLAD-400 for any Tedim/Chin content
2. Build custom fastText Zolai language ID model
3. Run MinHash dedup on corpus_master_v1.jsonl
4. Submit corpus to SEACrowd

### Research Department
**Primary research reference:** `wiki/training/research_v2_models_and_platforms.md`

| Agent | Key Research Task |
|---|---|
| `zolai-research-tracker` | Monitor arxiv cs.CL weekly; update wiki |
| `zomi-evaluator` | Build Zolai-FLORES eval set (1012 sentences) |
| `linguistic-specialist` | Validate ZVS compliance in training data |

**Papers to read:**
- arXiv:2502.16961 — UrduLLaMA blueprint (most applicable)
- arXiv:2408.12780 — Quality vs Quantity for low-resource
- arXiv:2410.14815 — CPT + synthetic corpus for low-resource
- arXiv:2412.13337 — Guide for SFT of small LLMs
- arXiv:2403.06350 — AI4Bharat blueprint for Indian languages

### Training Department
**Primary research reference:** `wiki/training/research_v2_models_and_platforms.md`

| Agent | Key Research Task |
|---|---|
| `zomi-trainer-bot` | Run CPT → SFT → ORPO pipeline on Kaggle |
| `zolai-dpo-builder` | Build 2K+ DPO pairs, train ORPO |

**Training stack:**
- Framework: Unsloth (Kaggle) + LLaMA-Factory (multi-GPU)
- Base model: Qwen2.5-7B-Instruct (primary)
- Method: QLoRA (4-bit NF4, r=16, alpha=32)
- Tracking: W&B free tier
- Storage: HuggingFace Hub `zolai-project/`
- Alignment: ORPO (combines SFT+DPO in one pass)

### Synthesis Department
**Primary research reference:** `wiki/training/research_v2_datasets_and_cleaning.md` §5

| Agent | Key Research Task |
|---|---|
| `zomi-synthesizer` | Expand to 50K instructions; add domain diversity |

**Synthesis priorities:**
1. Expand current 11K → 50K synthetic instructions
2. Add domains: medical, legal, tech, daily life, education
3. Use ORPO instead of separate SFT+DPO (saves compute)
4. Validate all outputs with ZVS grammar checker

---

## Key Research Findings (Summary for All Agents)

1. **CPT before SFT** — Always run continued pretraining first (+8–15 BLEU)
2. **Diversity > Quantity** — 10K diverse pairs > 100K repetitive ones (arXiv:2408.12780)
3. **Qwen2.5-7B** — Best multilingual base model (Apache 2.0, 29 languages)
4. **Unsloth on Kaggle** — Best free training setup (2x faster, 70% less VRAM)
5. **ORPO** — Combines SFT+DPO in one pass, saves compute (arXiv:2403.07691)
6. **ZVS compliance** — Must be enforced at data level, not just model level
7. **Human eval** — BLEU misleads for low-resource; always do human evaluation
8. **SEACrowd** — Submit our data; get community support and visibility
9. **FineWeb2** — Check if Tedim is in their 1000+ language dataset
10. **UrduLLaMA** — Most directly applicable published work (arXiv:2502.16961)

---

## Tools Every Agent Should Know

| Tool | Purpose | Install |
|---|---|---|
| `unsloth` | Fast QLoRA training | `pip install unsloth` |
| `trl` | SFT/DPO/ORPO training | `pip install trl` |
| `datatrove` | Data pipeline framework | `pip install datatrove` |
| `datasketch` | MinHash dedup | `pip install datasketch` |
| `fasttext` | Language ID | `pip install fasttext` |
| `sentence-transformers` | LaBSE embeddings | `pip install sentence-transformers` |
| `sacrebleu` | BLEU/chrF metrics | `pip install sacrebleu` |
| `wandb` | Experiment tracking | `pip install wandb` |
| `trafilatura` | Web text extraction | `pip install trafilatura` |
| `ftfy` | Fix text encoding | `pip install ftfy` |
