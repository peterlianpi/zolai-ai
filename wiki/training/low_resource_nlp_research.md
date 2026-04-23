# Low-Resource NLP Research Reference
> Last updated: 2026-04-17 | Applies to: Zolai / Tedim Zomi AI project

This document consolidates the current state of research on low-resource language AI, covering datasets, data cleaning pipelines, recommended models, training platforms, and key research communities. Everything here is directly actionable for the Zolai project.

---

## 1. Datasets for Low-Resource Languages

### Why Tedim Is Extremely Low-Resource

Tedim/Zomi is absent from every major multilingual dataset:
- Not in mC4 (101 languages), CC-100 (100 languages), FLORES-200 (200 languages), NLLB-200 (200 languages)
- Not in fastText's lid.176 language identifier
- Closest covered language: **Burmese (mya_Mymr)** — same country, different family branch

This means the Zolai project's own corpus is the primary resource. Every sentence we collect, clean, and align is irreplaceable.

### Key Multilingual Datasets (for reference / augmentation)

| Dataset | Languages | Relevance to Zolai |
|---|---|---|
| **OPUS** | 60+ sub-corpora | Bible sub-corpus critical; eBible has 833 languages |
| **eBible Corpus** | 833 languages | Our Bible versions (TB77, TBR17, Tedim1932) align here |
| **FLORES-200** | 200 languages | Evaluation benchmark; Tedim not included |
| **NLLB-200** | 200 languages | Back-translation tool; use Burmese as proxy |
| **SEACrowd** | ~1,000 SEA languages | Most relevant community; submit Zolai data here |
| **Aya Dataset** | 101 languages | Instruction-tuning reference; 513M tokens |
| **CulturaX** | 167 languages | Used by SeaLLMs 3 |
| **MADLAD-400** | 400 languages | May include Burmese/Myanmar data |

**eBible Corpus paper**: "Data and Model Benchmarks for Bible Translation for Low-Resource Languages" — arXiv:2304.09919. Our 4 Bible versions are a major asset.

### Data Augmentation Strategies (Validated for Low-Resource)

#### 1. Back-Translation ⭐ Most Validated
- Translate monolingual English text → approximate Zolai using NLLB-200 or a Burmese MT model
- Filter output with a custom Tedim language classifier
- Paper: "Data Augmentation With Back translation for Low Resource languages" — arXiv:2505.02463
- Outperforms autoencoder approaches; generates more diverse n-grams
- **For Zolai**: Use `facebook/nllb-200-distilled-600M` to back-translate English Wikipedia/news articles

#### 2. Translationese Pretraining
- Translate large English web-crawled documents into Zolai using GPT-4/Claude
- Filter with a tiny LM trained on your clean Zolai corpus
- Paper: "Pretraining Language Models Using Translationese" — arXiv:2403.13638
- **For Zolai**: Use Claude to translate English Wikipedia articles on Zomi history, culture, religion

#### 3. LLM-Assisted Synthetic Data (Already Doing This ✓)
- Use GPT-4/Claude to generate instruction-response pairs in Zolai
- SeaLLMs 3 validated this: "Starting with manual annotation of domain-specific knowledge points, we employed stronger models to generate targeted tutorial-style content"
- Our `synthesize_instructions_v6.py` is the right approach — scale it up

#### 4. Cross-Lingual Transfer
- Fine-tune on Burmese first (closest well-resourced language), then transfer to Tedim
- Multilingual pretraining on Sino-Tibetan languages (Tibetan, Burmese) before Zolai-specific fine-tuning
- SeaLLMs 3 (built on Qwen2 with Burmese support) is the ideal starting point

#### 5. Monolingual Augmentation
- Paraphrasing, word substitution, sentence permutation, noise injection
- Survey: "Overcoming Data Scarcity in Generative Language Modelling for Low-Resource Languages" — arXiv:2505.04531 (reviews 54 studies)

### Current Zolai Data Gaps

| Gap | Current | Target | Action |
|---|---|---|---|
| Instruction pairs | ~1,146 | 10,000 | Scale `synthesize_instructions_v6.py` |
| Parallel pairs | 105k | 250k | Back-translation + Bible alignment |
| Clean sentences | 2M (raw) | 2M (clean) | Run deduplication + quality filter |
| DPO preference pairs | 0 | 5,000 | `generate_dpo_pairs.py` (ZVS correct vs wrong) |

---

## 2. Data Cleaning and Preprocessing Pipelines

### Language Identification

**Problem**: fastText lid.176 does NOT know Tedim. Standard LID tools will misclassify Zolai text.

**Solution**: Train a custom binary classifier:
```python
# Train custom fastText LID on your 2M sentences
import fasttext

# Prepare: label Tedim sentences as __label__tedim, others as __label__other
# Then train:
model = fasttext.train_supervised(
    input="lid_training.txt",
    epoch=25,
    wordNgrams=2,
    dim=64
)
model.save_model("lid_tedim.bin")
```

Use this classifier as the first filter in every data pipeline.

### Deduplication

**Exact deduplication** (fast, do first):
```python
import hashlib, json

seen = set()
with open("output.jsonl", "w") as out:
    for line in open("input.jsonl"):
        doc = json.loads(line)
        h = hashlib.sha256(doc["text"].strip().encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            out.write(line)
```

**Near-duplicate detection** (MinHash LSH):
```bash
pip install datasketch
```
```python
from datasketch import MinHash, MinHashLSH

# Jaccard similarity threshold 0.8 — removes near-duplicates
lsh = MinHashLSH(threshold=0.8, num_perm=128)
```

Run MinHash on `corpus_master_v1.jsonl` before the next training run. Estimated ~15-20% reduction.

### Full Pipeline Tools

| Tool | Purpose | Install |
|---|---|---|
| **datatrove** (HuggingFace) | Full pipeline: LID + quality filter + dedup + PII | `pip install datatrove` |
| **CCNet** (Facebook) | LID → perplexity filter → dedup | `github.com/facebookresearch/cc_net` |
| **Dolma** (Allen AI) | LLM pretraining data toolkit | `github.com/allenai/dolma` |
| **RedPajama** (Together AI) | Open LLaMA-style pipeline | `github.com/togethercomputer/RedPajama-Data` |

**Recommended for Zolai**: `datatrove` — most modern, HuggingFace-native, handles JSONL natively.

### Quality Filtering Heuristics

Standard heuristics used across all major pipelines (apply in order):

1. **Length filter**: min 20 chars, max 10,000 chars per document
2. **Repetition filter**: remove if top 5-gram covers >20% of text
3. **Symbol ratio**: remove if >10% non-alphabetic characters
4. **Line-ending punctuation**: >30% of lines should end with punctuation
5. **Perplexity scoring**: train KenLM on clean Zolai; filter high-perplexity docs
6. **Classifier-based**: fastText trained on clean Zolai (high quality) vs. random web (low quality)

### Text Normalization for Zolai

Critical steps specific to Tedim:
```python
import unicodedata, re

def normalize_zolai(text: str) -> str:
    # 1. Unicode normalization (critical for Myanmar script variants)
    text = unicodedata.normalize("NFKC", text)
    # 2. Normalize whitespace
    text = re.sub(r"\s+", " ", text).strip()
    # 3. Remove HTML artifacts
    text = re.sub(r"<[^>]+>", "", text)
    # 4. Normalize quotes
    text = text.replace("\u201c", '"').replace("\u201d", '"')
    return text
```

ZVS dialect enforcement (post-normalization):
- Replace `pasian` → `pasian`, `gam` → `gam`, `tapa` → `tapa`
- Flag (don't auto-replace) ambiguous cases for human review

### The `###` Noise Problem

Current training data has ~15% `###` prefix noise from markdown artifacts. This is the highest-priority cleaning task. See `scripts/data_pipeline/clean_training_data.py`.

---

## 3. Recommended Models (2024–2025)

### Decision Framework

```
Is Burmese support critical? → SeaLLMs-v3-7B (best Burmese open model)
Already using Qwen? → Qwen2.5-7B (validated, continue)
Need smallest possible? → Phi-3.5-mini-3.8B or Qwen2.5-3B (current)
Need best multilingual instruction? → Aya Expanse 8B
Need translation pairs? → NLLB-200-distilled-600M
```

### Tier 1: Recommended for Zolai

#### SeaLLMs v3 7B — TOP RECOMMENDATION for next base model
- Paper: "SeaLLMs 3: Open Foundation and Chat Multilingual Large Language Models for Southeast Asian Languages" — arXiv:2407.19672
- **Explicitly includes Burmese (my)** — closest language to Tedim in any open model
- Built on Qwen2 (same family as current Zolai model)
- Burmese FLORES-200 chrF: 21.54 (best among open models)
- HuggingFace: `SeaLLMs/SeaLLM-7B-v3`
- **Why**: Burmese is the closest well-resourced language to Tedim. SeaLLMs 3 has the best Burmese support of any open model. Continued pretraining on Zolai from this base will transfer better than from a purely English-centric model.

#### Qwen2.5-7B — Current Validated Choice ✓
- Strong multilingual, strong on Asian languages
- SeaLLMs 3 is built on Qwen2 — confirms Qwen as the right family
- HuggingFace: `Qwen/Qwen2.5-7B-Instruct`
- **Status**: Already using Qwen2.5-3B. Upgrade to 7B when GPU allows.

#### Aya Expanse 8B — Best Open Multilingual Instruction Model
- Paper: "Aya Model: An Instruction Finetuned Open-Access Multilingual Language Model" — arXiv:2402.07827
- Outperforms Google, Meta, Mistral on 23 languages (Oct 2024)
- 101 languages, 50%+ low-resource
- HuggingFace: `CohereForAI/aya-expanse-8b`
- **Use case**: Teacher model for distillation, or base for instruction fine-tuning

### Tier 2: Strong General Multilingual

| Model | Size | Notes |
|---|---|---|
| Llama 3.1 8B | 8B | Strong transfer learning base; minimal Burmese |
| Gemma 2 9B | 9B | Good for low-resource fine-tuning (Kaggle competition validated) |
| Phi-3.5-mini | 3.8B | Surprisingly strong multilingual for its size |
| mT5-large | 580M | Best for seq2seq (translation, summarization) |

### Tier 3: Translation-Specific

| Model | Use Case |
|---|---|
| `facebook/nllb-200-distilled-600M` | Back-translation EN→ZO (via Burmese proxy) |
| `Helsinki-NLP/opus-mt-my-en` | Burmese→English as proxy for Tedim→English |

### Academic Consensus for Myanmar/SEA Languages

From Myanmar XNLI paper (arXiv:2504.09645) and BURMESE-SAN benchmark (arXiv:2602.18788):
- Burmese NLP is severely under-resourced
- Best performing open models on Burmese: **SeaLLMs > Qwen2 > Llama 3**
- Recommended pipeline: **SeaLLMs-v3-7B → continued pretraining on Zolai → SFT → DPO**

### Training Strategy: 3-Stage Pipeline

```
Stage 1: Continued Pretraining (CPT)
  Base: SeaLLMs-v3-7B (or Qwen2.5-7B)
  Data: corpus_master_v1.jsonl (cleaned, deduplicated)
  Goal: Model learns Zolai token distributions
  Expected gain: +8-12 BLEU points (cf. Basque Llama-eus-8B)

Stage 2: Supervised Fine-Tuning (SFT)
  Data: Bible parallel (85k) + ZO-EN pairs (105k) + dict pairs (124k) + instructions (10k target)
  Format: instruction-response pairs
  Tool: Unsloth + QLoRA

Stage 3: DPO Alignment
  Data: ZVS-correct vs ZVS-wrong dialect pairs (5k target)
  Tool: TRL DPOTrainer
  Goal: Model prefers ZVS Tedim over Chin/Burmese dialect mixing
```

---

## 4. Training Platforms and Tools

### Free GPU Platforms

| Platform | Free GPU | Hours/Week | Best For |
|---|---|---|---|
| **Kaggle** ⭐ | T4 ×2 or P100 | 30h | Longer runs, persistent storage |
| **Google Colab** | T4 (16GB) | ~12h/day | Prototyping, quick tests |
| **HuggingFace Spaces** | A10G (ZeroGPU) | Limited | Inference demos |

**Kaggle is better than Colab** for training: 30h/week, 9h per run, no random disconnects, 20GB persistent storage. Current Zolai training already uses Kaggle — correct choice.

### Fine-Tuning Frameworks

#### Unsloth ⭐ TOP PICK
- GitHub: `github.com/unslothai/unsloth` (23k+ stars)
- **2-5× faster** than baseline HuggingFace
- **70-80% less VRAM** — 8B model fits in 8GB with QLoRA
- 100+ pre-built Colab/Kaggle notebooks
- Supports: Llama 3.x, Qwen 2.5, Gemma 2, Mistral, Phi-3.5, SeaLLMs
- License: LGPL (free for research)
- Install: `pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"`

Speed comparison (LLaMA 3.1 8B, A100):

| Tool | Tokens/sec | VRAM (QLoRA 4-bit) |
|---|---|---|
| **Unsloth** | ~4,200 | **~8GB** |
| Axolotl | ~1,500 | ~16GB |
| LLaMA-Factory | ~1,480 | ~16GB |
| TRL | ~1,450 | ~18GB |

#### Axolotl
- GitHub: `github.com/axolotl-ai-cloud/axolotl` (9k+ stars)
- YAML-config driven — reproducible, version-controlled
- Supports: LoRA, QLoRA, full fine-tuning, DPO, PPO
- Best for: Config-as-code, multi-dataset training
- License: Apache 2.0

#### LLaMA-Factory
- GitHub: `github.com/hiyouga/LLaMA-Factory` (67k+ stars, ACL 2024)
- Supports 100+ LLMs, has WebUI (`llamafactory-cli webui`)
- Best for: Beginners, wide model support, DPO without deep knowledge
- License: Apache 2.0

#### TRL (HuggingFace)
- Official RLHF/alignment library
- Native: PPO, DPO, ORPO, KTO, SFT
- Best for: DPO alignment after SFT
- License: Apache 2.0

#### PEFT (HuggingFace)
- Implements: LoRA, QLoRA, IA3, Prefix Tuning
- Used under the hood by all frameworks above

### Recommended Stack for Zolai

```
Kaggle (30h/week T4×2) + Unsloth + QLoRA 4-bit NF4
→ Fine-tune Qwen2.5-7B or SeaLLMs-v3-7B
→ Export to GGUF Q4_K_M via llama.cpp
→ Deploy on HF Spaces + FastAPI + Telegram bot
```

For DPO: Add TRL on top of Unsloth after SFT is complete.

### Paid Options (When Free Tier Is Insufficient)

| Platform | GPU | Cost | Use Case |
|---|---|---|---|
| RunPod | H100 80GB | ~$3.50/hr | Full SFT run (~$10 total) |
| Lambda Labs | A100 80GB | ~$1.99/hr | Longer CPT runs |
| vast.ai | Various | ~$0.50-2/hr | Cheapest option |

---

## 5. Key Research Groups and Papers

### Research Communities

#### SEACrowd — Most Relevant
- Paper: "SEACrowd: A Multilingual Multimodal Data Hub and Benchmark Suite for Southeast Asian Languages" — Lovenia et al., EMNLP 2024
- Covers ~1,000 SEA languages, 36 indigenous languages benchmarked
- GitHub: `github.com/SEACrowd/seacrowd-datahub`
- **Action**: Submit Zolai corpus to SEACrowd. This gives visibility, potential collaborators, and academic credibility.

#### Masakhane — Methodology Model
- Grassroots NLP for African languages — directly applicable methodology
- Key paper: "Participatory Research for Low-resourced Machine Translation" — EMNLP Findings 2020
- URL: `masakhane.io`
- **Lesson**: Their community annotation model (native speakers annotating data) is the gold standard. Recruit native Zomi speakers for data validation.

#### AI4Bharat — Pipeline Blueprint
- IndicLLMSuite: 251B tokens, 74.8M instruction-response pairs for 22 Indian languages
- Paper: "A Blueprint for Creating Pre-training and Fine-Tuning Datasets for Indian Languages" — arXiv:2403.06350
- URL: `ai4bharat.org`
- **Lesson**: Their pipeline for building LLM datasets from scratch for low-resource languages is directly replicable for Zolai.

#### DAMO Academy / Alibaba — SeaLLMs
- Best open models for SEA languages including Burmese
- URL: `seallms.github.io`

#### AI Singapore — SEA-LION
- SEA-LION v3 70B: 200B tokens continued pretraining on SEA languages
- HuggingFace: `aisingapore/sea-lion-7b-instruct`

### Key Papers (2024–2025)

**Datasets & Benchmarks**
1. SEACrowd — Lovenia et al., EMNLP 2024 — https://aclanthology.org/2024.emnlp-main.296/
2. Myanmar XNLI — arXiv:2504.09645
3. BURMESE-SAN benchmark — arXiv:2602.18788
4. eBible corpus — arXiv:2304.09919
5. SEA LLM benchmarks — arXiv:2502.06298

**Models & Fine-tuning**
6. SeaLLMs 3 — arXiv:2407.19672
7. Aya Model — arXiv:2402.07827
8. Fine Tuning for Low-resource Languages — arXiv:2510.04139
9. Adapting Open-Source LLMs for Low-Resource — arXiv:2405.07745
10. Practical Guide to Fine-tuning with Limited Data — arXiv:2411.09539

**Data & Pipelines**
11. Overcoming Data Scarcity (54-study review) — arXiv:2505.04531
12. Building Corpora for Inclusive Language Technologies — arXiv:2512.14576
13. Pretraining with Translationese — arXiv:2403.13638

**Workshops**
14. LoResLM 2025 (COLING 2025) — arXiv:2412.16365 — 35 papers, 28 language families
15. LoResMT 2024 — Workshop on MT for Low-Resource Languages

---

## 6. Immediate Action Items

### This Week
1. **Run MinHash deduplication** on `corpus_master_v1.jsonl` — estimated 15-20% reduction, cleaner training signal
2. **Train custom fastText LID** — binary Tedim vs. non-Tedim classifier on 2M sentences
3. **Fix `###` noise** — run `scripts/data_pipeline/clean_training_data.py` before session 4

### This Month
4. **Scale instruction synthesis** — target 10,000 instruction pairs (currently 1,146)
5. **Generate DPO pairs** — ZVS-correct vs ZVS-wrong dialect pairs (5,000 target)
6. **Submit to SEACrowd** — register Zolai corpus at `github.com/SEACrowd/seacrowd-datahub`

### Next Quarter
7. **Upgrade base model** — evaluate SeaLLMs-v3-7B vs Qwen2.5-7B as next base
8. **Switch to Unsloth** — 2-5× faster training on same Kaggle hardware
9. **Run full 3-stage pipeline** — CPT → SFT → DPO → evaluate with `zolai_benchmark_v1.jsonl`
10. **Write LoResLM paper** — document the Zolai pipeline for LoResLM 2026 (COLING)

---

## 7. Evaluation Metrics

| Metric | Tool | Target |
|---|---|---|
| Translation quality | BLEU, chrF | BLEU > 0.35 |
| Grammar correctness | ZVS rule checker | > 90% |
| Forbidden word rate | Dialect classifier | 0% |
| Register accuracy | Manual eval | > 85% |
| Perplexity | KenLM on clean corpus | Decreasing |

Evaluation dataset: `data/eval/zolai_benchmark_v1.jsonl`
