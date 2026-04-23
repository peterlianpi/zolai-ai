# Zolai Deep Research Master: Low-Resource Language AI
> Last updated: 2026-04-18 | Status: Living document — update on every major research cycle
> Supersedes: `low_resource_nlp_research.md`, `research_dataset_strategy_paper.md`, `llm_training_roadmap.md`

---

## 0. The Core Problem: Tedim Is Extremely Low-Resource

Tedim Zolai is absent from every major multilingual NLP dataset:
- Not in mC4 (101 langs), CC-100, FLORES-200, NLLB-200, fastText lid.176
- Not in any Hugging Face multilingual benchmark
- Closest proxy: **Burmese (mya_Mymr)** — same country, different family

This means **our own corpus is the primary resource**. Every sentence collected, cleaned, and aligned is irreplaceable. The research below tells us exactly how to maximize what we have.

---

## 1. Dataset Strategy for Low-Resource Languages

### 1.1 What Researchers Say About Data Volume

From peer-reviewed research (2024–2025):

| Data Size | What You Can Train | Quality Expectation |
|---|---|---|
| < 1K parallel pairs | Toy models only | Very poor |
| 1K–10K pairs | Basic MT, limited chatbot | Mediocre |
| 10K–100K pairs | Decent MT, instruction-following | Good with right model |
| 100K+ pairs | Strong MT, fine-tuned LLM | Very good |
| 500K+ tokens monolingual | Continued pretraining | Excellent |

**Zolai current status:** ~105K parallel pairs + ~2M monolingual sentences = **strong position** for a low-resource language. This is better than 95% of low-resource language projects.

### 1.2 Data Sources Hierarchy (Priority Order)

**Tier 1 — Gold (human-verified, parallel)**
- Bible corpus (TB77 + TBR17 + Tedim1932 + Tedim2010 aligned with KJV)
- ZomiDaily news articles (Zolai text, manually written)
- RVAsia Catholic readings (Zolai text)
- Hymns corpus (510 hymns, structured)

**Tier 2 — Silver (monolingual, high quality)**
- Dictionary entries (152K entries, structured)
- Synthetic instruction data (11K lines, GPT-generated)
- Grammar wiki content

**Tier 3 — Bronze (noisy, needs heavy cleaning)**
- Web crawls (Tongsan, TongDot)
- OCR output from PDFs

### 1.3 External Datasets to Mine

| Dataset | URL | What to Extract |
|---|---|---|
| **eBible Corpus** | ebible.org/Scriptures | Cross-reference our Bible versions |
| **OPUS Bible** | opus.nlpl.eu | Align with other language Bibles |
| **SEACrowd** | github.com/SEACrowd | Submit our data; get SEA language tools |
| **Aya Dataset (Cohere)** | huggingface.co/datasets/CohereForAI/aya_dataset | Instruction format reference |
| **FLORES+** | huggingface.co/datasets/openlanguagedata/flores_plus | Evaluation benchmark template |
| **HPLT** | huggingface.co/papers/2403.14009 | Multilingual pretraining data |
| **Common Corpus** | huggingface.co/blog/Pclanglais/two-trillion-tokens-open | Permissive license multilingual |
| **Glot500** | github.com/cisnlp/Glot500 | 500+ language corpus, may have Chin/Kuki-Chin |

### 1.4 Parallel Corpus Mining Techniques

**LASER (Language-Agnostic Sentence Representations)**
- Facebook's tool for mining parallel sentences from multilingual text
- Works even without direct Zolai support — use Burmese as bridge
- `pip install laserembeddings`

**SONAR (Meta AI, 2023)**
- Successor to LASER, supports 200+ languages
- Can mine parallel sentences from web crawls
- Use for finding hidden Zolai-English pairs in mixed-language documents

**LaBSE (Language-agnostic BERT Sentence Embedding)**
- Google's multilingual sentence embeddings
- Good for finding near-duplicate or parallel sentences
- `sentence-transformers/LaBSE` on Hugging Face

**Practical pipeline for Zolai:**
```
1. Crawl Zomi community websites (Facebook groups, church sites)
2. Run LaBSE to find sentences similar to known Zolai sentences
3. Use SONAR to mine parallel pairs from bilingual documents
4. Filter with language ID (use Burmese model as proxy)
```

---

## 2. Data Cleaning Pipeline (Research-Backed)

### 2.1 The NVIDIA NeMo Curator Framework

NVIDIA's research shows these cleaning steps reduce dataset size 30–40% while retaining 85–90% of semantic value:

**Step 1: Language Identification**
- Tool: `fastText` lid.176 or `lingua-py`
- For Zolai: train a custom langid on our known-good corpus
- Filter: keep only lines where Zolai probability > 0.7
- Problem: no off-the-shelf Zolai langid exists — must build one

**Step 2: Exact Deduplication**
- Tool: MD5 hashing on normalized text
- Normalize: lowercase, strip punctuation, collapse whitespace
- Remove exact duplicates before any other processing
- Expected reduction: 10–20% of corpus

**Step 3: Fuzzy Deduplication (MinHash + LSH)**
- Tool: `datasketch` library or NeMo Curator
- Threshold: Jaccard similarity > 0.8 = near-duplicate
- Critical for Bible corpus (many similar verses across versions)
- Expected reduction: additional 5–15%

**Step 4: Quality Filtering (Heuristic)**
```python
# Key filters for Zolai corpus
filters = {
    "min_chars": 20,           # Remove very short lines
    "max_chars": 2000,         # Remove very long lines (OCR artifacts)
    "min_words": 3,            # At least 3 words
    "max_word_repetition": 0.3, # No more than 30% repeated words
    "min_alpha_ratio": 0.6,    # At least 60% alphabetic characters
    "no_html": True,           # Strip HTML tags
    "no_urls": True,           # Remove lines that are mostly URLs
    "zolai_char_check": True,  # Must contain Zolai-specific patterns
}
```

**Step 5: Model-Based Quality Filtering**
- Train a small classifier on known-good vs known-bad Zolai text
- Use perplexity scoring: high perplexity = likely noise
- Tool: KenLM (fast n-gram LM) trained on clean Zolai text
- Filter: keep lines with perplexity < threshold (tune on validation set)

**Step 6: Parallel Pair Validation**
- For parallel data: check alignment quality
- Tool: `bleualign` or `hunalign` for sentence alignment
- Score: LASER/LaBSE cosine similarity > 0.7 for parallel pairs
- Flag low-scoring pairs for human review

### 2.2 Zolai-Specific Cleaning Rules

Based on our ZVS standard:

```python
FORBIDDEN_WORDS = ["pathian", "ram", "fapa", "bawipa", "siangpahrang", "cu", "cun"]
REQUIRED_DIALECT = ["pasian", "gam", "tapa", "topa", "kumpipa", "tua"]

def zolai_dialect_check(text):
    """Flag text that uses wrong dialect markers."""
    for word in FORBIDDEN_WORDS:
        if word in text.lower().split():
            return "WRONG_DIALECT"
    return "OK"

def normalize_zolai(text):
    """Normalize common OCR errors in Zolai text."""
    replacements = {
        "0": "o",   # OCR confuses zero with letter o
        "1": "i",   # OCR confuses 1 with i in some fonts
        "  ": " ",  # Double spaces
    }
    for old, new in replacements.items():
        text = text.replace(old, new)
    return text.strip()
```

### 2.3 Instruction Data Quality

For instruction-tuning data specifically:

**Format validation:**
```json
{
  "instruction": "...",  // Must be non-empty, < 500 chars
  "input": "...",        // Optional context
  "output": "..."        // Must be non-empty, > 10 chars
}
```

**Quality checks:**
- Output must not be a copy of instruction
- Output must contain Zolai text (not pure English)
- Instruction must be grammatically valid (use grammar checker agent)
- No hallucinated Bible verses (cross-check against known corpus)

### 2.4 Recommended Tools

| Tool | Purpose | Install |
|---|---|---|
| `datasketch` | MinHash deduplication | `pip install datasketch` |
| `fasttext` | Language identification | `pip install fasttext` |
| `kenlm` | Perplexity scoring | `pip install kenlm` |
| `sentence-transformers` | LaBSE embeddings | `pip install sentence-transformers` |
| `hunalign` | Sentence alignment | apt/brew install |
| `langdetect` | Backup langid | `pip install langdetect` |
| `ftfy` | Fix text encoding | `pip install ftfy` |
| `lingua-py` | Better langid | `pip install lingua-language-detector` |

---

## 3. Recommended Models (Research-Backed, 2024–2025)

### 3.1 Top Recommendations for Zolai

Based on research from arxiv.org (2024–2025) and community benchmarks:

#### 🥇 Qwen2.5 (7B or 3B) — PRIMARY RECOMMENDATION
- **Why:** Best multilingual coverage among open models; strong on Asian languages
- **Research:** Qwen2 surpasses most prior open-weight models on multilingual benchmarks
- **Sizes:** 0.5B, 1.5B, 3B, 7B, 14B, 32B, 72B
- **For Zolai:** Start with `Qwen2.5-7B-Instruct` (fits in 16GB VRAM with QLoRA)
- **License:** Apache 2.0
- **HF:** `Qwen/Qwen2.5-7B-Instruct`

#### 🥈 Gemma 2 (2B or 9B) — STRONG ALTERNATIVE
- **Research:** Google's paper shows Gemma 2 fine-tuned on low-resource language data achieves strong results; 90% accuracy with QLoRA on multilingual tasks
- **Sizes:** 2B, 9B, 27B
- **For Zolai:** `google/gemma-2-2b-it` (fits in 8GB VRAM with QLoRA)
- **License:** Gemma Terms (free for research)
- **HF:** `google/gemma-2-2b-it`

#### 🥉 Llama 3.2 (3B or 8B) — COMMUNITY FAVORITE
- **Why:** Huge community, tons of tutorials, Unsloth support
- **Research:** Strong instruction-following; good for chat/QA tasks
- **Sizes:** 1B, 3B, 8B, 70B
- **For Zolai:** `meta-llama/Llama-3.2-3B-Instruct` (free tier friendly)
- **License:** Llama 3 Community License
- **HF:** `meta-llama/Llama-3.2-3B-Instruct`

#### Honorable Mentions
- **Phi-4 (3.8B):** Microsoft's small but powerful model; good reasoning
- **Mistral 7B v0.3:** Solid baseline; good multilingual with fine-tuning
- **SeaLLMs 3 (7B):** Specifically designed for Southeast Asian languages — most relevant to Zolai's geographic context
  - HF: `SeaLLMs/SeaLLMs-v3-7B-Chat`

### 3.2 Model Selection Matrix

| Scenario | Recommended Model | Reason |
|---|---|---|
| Free GPU (Kaggle/Colab T4) | Gemma 2 2B or Llama 3.2 3B | Fits in 16GB with QLoRA |
| Free GPU (Kaggle P100) | Qwen2.5 7B | 16GB VRAM, QLoRA 4-bit |
| Local GPU (RTX 3090/4090) | Qwen2.5 7B or Llama 3.2 8B | 24GB VRAM |
| Production deployment | Qwen2.5 7B merged | Best quality/size ratio |
| Fastest iteration | Gemma 2 2B | Smallest, fastest to train |
| Best multilingual | Qwen2.5 7B | Strongest Asian language coverage |
| Best instruction-following | Llama 3.2 8B | RLHF-tuned |

### 3.3 Why NOT These Models

| Model | Why Skip |
|---|---|
| GPT-2 / older models | Too old, poor multilingual |
| mBERT / XLM-R | Encoder-only, not generative |
| BLOOM | Outdated, superseded by newer models |
| Falcon | Less community support now |
| Any 70B+ model | Too large for free tier |

### 3.4 Training Approach: LoRA vs QLoRA vs Full Fine-tuning

**QLoRA (4-bit quantization + LoRA) — RECOMMENDED for Zolai**
- Trains only 0.1–1% of parameters
- Reduces memory by 3–4x vs full fine-tuning
- Achieves 95–100% of full fine-tuning performance
- Can train 7B model on single 16GB GPU
- Tool: `unsloth` (2x faster than standard PEFT)

**LoRA (without quantization)**
- Better quality than QLoRA but needs more VRAM
- Use when you have 24GB+ VRAM
- r=16, alpha=32 is a good starting point for Zolai

**Full Fine-tuning**
- Only if you have A100/H100 access
- Not needed for our data size (< 1M examples)

**Key hyperparameters for Zolai:**
```python
lora_config = {
    "r": 16,              # LoRA rank — higher = more capacity
    "lora_alpha": 32,     # Scaling factor (usually 2x r)
    "target_modules": ["q_proj", "v_proj", "k_proj", "o_proj"],
    "lora_dropout": 0.05,
    "bias": "none",
    "task_type": "CAUSAL_LM"
}

training_args = {
    "num_train_epochs": 3,
    "per_device_train_batch_size": 2,
    "gradient_accumulation_steps": 4,  # Effective batch = 8
    "learning_rate": 2e-4,
    "warmup_ratio": 0.03,
    "lr_scheduler_type": "cosine",
    "fp16": True,  # or bf16 if supported
    "max_seq_length": 2048,
}
```

---

## 4. Training Platforms (Free & Open Source)

### 4.1 Platform Comparison

| Platform | Free GPU | VRAM | Time Limit | Best For |
|---|---|---|---|---|
| **Kaggle** | 2x T4 (30h/week) | 2x 16GB | 12h/session | Primary training |
| **Google Colab** | T4 (free tier) | 16GB | ~4h/session | Prototyping |
| **Colab Pro** | A100 ($10/month) | 40GB | 24h | Serious training |
| **Lightning AI** | T4 (free tier) | 16GB | Limited | Alternative |
| **Vast.ai** | Cheap rental | Varies | Pay-per-hour | Budget GPU |
| **RunPod** | Cheap rental | Varies | Pay-per-hour | Deployment |
| **Modal** | Free credits | A10G | Limited | Serverless |
| **Local** | Your GPU | Varies | Unlimited | Best if available |

### 4.2 Kaggle — Primary Free Platform

**Why Kaggle is best for Zolai:**
- 30 hours/week free GPU (2x T4 = 32GB total)
- Can run 12-hour sessions unattended
- Persistent datasets (upload our training data once)
- Community notebooks for reference
- No credit card required

**Kaggle setup for Zolai:**
```python
# Install in Kaggle notebook
!pip install unsloth
!pip install -q datasets transformers peft trl

# Load our dataset from Kaggle dataset
from datasets import load_dataset
dataset = load_dataset("json", data_files="/kaggle/input/zolai-training/training_v11_cefr.jsonl")
```

**Kaggle limitations:**
- 20GB disk space (compress datasets)
- Internet access must be enabled manually
- Sessions reset after 12 hours

### 4.3 Google Colab — Prototyping

**Free tier:** T4 GPU, ~4 hours before disconnect
**Pro ($10/month):** A100 40GB, longer sessions

**Best use:** Test new ideas, debug code, quick experiments

### 4.4 Unsloth — The Essential Tool

Unsloth is the most important tool for free-tier training:
- 2x faster training than standard HuggingFace PEFT
- 60% less VRAM usage
- Supports Llama, Qwen, Gemma, Mistral
- Free and open source

```python
from unsloth import FastLanguageModel

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name="unsloth/Qwen2.5-7B-Instruct",
    max_seq_length=2048,
    load_in_4bit=True,  # QLoRA
)

model = FastLanguageModel.get_peft_model(
    model,
    r=16,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
    lora_alpha=16,
    lora_dropout=0,
    bias="none",
)
```

### 4.5 HuggingFace Ecosystem

**Essential HF tools for Zolai:**

| Tool | Purpose |
|---|---|
| `transformers` | Load/run any model |
| `datasets` | Load/process datasets |
| `peft` | LoRA/QLoRA training |
| `trl` | SFT, DPO, RLHF training |
| `evaluate` | Metrics (BLEU, ROUGE, etc.) |
| `accelerate` | Multi-GPU training |
| `bitsandbytes` | 4-bit/8-bit quantization |

**HF Hub:** Upload our fine-tuned models to `huggingface.co/zolai-project` for community access.

### 4.6 Training Workflow (End-to-End)

```
1. DATA PREP (local)
   → Clean corpus with our pipeline
   → Format as instruction pairs (Alpaca/ChatML format)
   → Upload to Kaggle dataset

2. TRAINING (Kaggle)
   → Load base model (Qwen2.5-7B or Gemma2-2B)
   → Apply QLoRA with Unsloth
   → Train for 3 epochs on instruction data
   → Save LoRA adapter

3. MERGE & EXPORT (Kaggle)
   → Merge LoRA adapter with base model
   → Export to GGUF format (for local use)
   → Upload to HuggingFace Hub

4. EVALUATION (local)
   → Test on held-out Zolai sentences
   → Check ZVS dialect compliance
   → Human evaluation by native speakers

5. DEPLOYMENT
   → Ollama (local inference)
   → FastAPI server (our existing API)
   → Telegram bot
```

---

## 5. Synthetic Data Generation

### 5.1 Why Synthetic Data Matters

Research (arxiv 2025): "LLM-generated synthetic data, even when noisy, can substantially improve MT performance for low-resource languages."

For Zolai, synthetic data fills gaps where real data is scarce:
- Instruction-following examples
- Question-answer pairs
- Conversational data
- Domain-specific text (medical, legal, tech)

### 5.2 Back-Translation (Most Proven Technique)

**Process:**
1. Take English text (any domain)
2. Translate to Zolai using our current best model
3. Filter translations by quality (LASER score > 0.7)
4. Use as additional training data

**Tools:**
- Our existing `synthesize_instructions_v6.py`
- NLLB-200 (use Burmese as bridge: EN → Burmese → Zolai)
- GPT-4o with Zolai system prompt (expensive but high quality)

### 5.3 LLM-Based Synthesis (Current Approach)

Our `synthetic_all_v1.jsonl` (11K lines) uses GPT-generated data. Research confirms this works well.

**Improvements to make:**
- Increase to 50K+ synthetic examples
- Add domain diversity (medical, legal, tech, daily life)
- Use Claude/GPT-4o with strict ZVS dialect prompts
- Validate all outputs with grammar checker agent

### 5.4 Data Augmentation Techniques

| Technique | Description | Zolai Applicability |
|---|---|---|
| Back-translation | EN→ZO→EN cycle | High — use NLLB as bridge |
| Paraphrasing | Rephrase existing sentences | Medium — needs native speaker validation |
| Template filling | Fill slots in sentence templates | High — easy to implement |
| Cross-lingual transfer | Use related language data | Medium — Burmese/Chin as proxy |
| Noise injection | Add controlled noise then denoise | Low — risky for low-resource |

---

## 6. Evaluation Framework

### 6.1 Metrics for Zolai

**Translation quality:**
- BLEU score (standard MT metric)
- chrF (character-level F-score, better for morphologically rich languages)
- COMET (neural MT metric, more human-aligned)

**Language model quality:**
- Perplexity on held-out Zolai text
- ZVS dialect compliance rate (custom metric)
- Grammar error rate (using our grammar checker)

**Instruction-following:**
- Human evaluation by native Zomi speakers
- Automated: check if output contains Zolai text
- Automated: check ZVS dialect markers

### 6.2 Evaluation Datasets to Build

We need to create these (they don't exist for Tedim):
1. **Zolai-FLORES:** 1,012 sentences translated to Zolai (follow FLORES format)
2. **Zolai-QA:** 500 question-answer pairs in Zolai
3. **Zolai-Grammar:** 200 sentences with known grammar errors for correction testing
4. **Zolai-Dialect:** 100 sentences in wrong dialect + correct ZVS versions

---

## 7. Research Communities & Resources

### 7.1 Key Communities

| Community | Focus | How to Engage |
|---|---|---|
| **SEACrowd** | Southeast Asian NLP | Submit Zolai data; join Discord |
| **Masakhane** | African languages (methodology applies) | Read their papers |
| **AmericasNLP** | Indigenous languages (similar challenges) | Read their papers |
| **SIGMORPHON** | Morphology (relevant for Zolai particles) | Follow workshops |
| **ACL Anthology** | All NLP papers | Search "low-resource" + "Myanmar" |

### 7.2 Must-Read Papers (2024–2025)

1. **"Fine Tuning Methods for Low-resource Languages"** (arxiv 2510.04139)
   - Gemma 2 fine-tuned on underrepresented language
   - Methodology directly applicable to Zolai

2. **"Avoiding Pitfalls in Developing Language Resources when Data is Scarce"** (arxiv 2410.12691)
   - Common mistakes in low-resource NLP
   - Annotation guidelines

3. **"Overcoming Data Scarcity in Generative Language Modelling for Low-Resource Languages"** (arxiv 2505.04531)
   - Survey of 54 studies
   - Back-translation, multilingual training, prompt engineering

4. **"Scaling Low-Resource MT via Synthetic Data Generation with LLMs"** (arxiv 2505.14423)
   - LLM synthetic data for low-resource MT
   - Directly applicable to our synthesis pipeline

5. **"Challenges in Adapting Multilingual LLMs to Low-Resource Languages using LoRA PEFT Tuning"** (arxiv 2411.18571)
   - LoRA fine-tuning challenges
   - Evaluation metrics often mislead — use human eval

### 7.3 Tools & Libraries Reference

| Library | Version | Purpose |
|---|---|---|
| `unsloth` | latest | Fast QLoRA training |
| `transformers` | ≥4.40 | Model loading |
| `trl` | ≥0.8 | SFT/DPO training |
| `peft` | ≥0.10 | LoRA adapters |
| `datasets` | ≥2.18 | Data loading |
| `bitsandbytes` | ≥0.43 | Quantization |
| `sentence-transformers` | ≥3.0 | Embeddings |
| `evaluate` | ≥0.4 | Metrics |
| `sacrebleu` | ≥2.4 | BLEU scoring |
| `kenlm` | latest | Perplexity scoring |
| `datasketch` | latest | MinHash dedup |

---

## 8. Departments & Agent Responsibilities

### 8.1 Data Department
**Agents:** `zomi-data`, `zomi-crawler-bot`, `zomi-cleaner-bot`
**Responsibilities:**
- Run cleaning pipeline on all new data
- Maintain deduplication across corpus versions
- Track data provenance (source, date, quality score)
- Build and maintain Zolai language ID model

### 8.2 Research Department
**Agents:** `zolai-research-tracker`, `zomi-evaluator`, `linguistic-specialist`
**Responsibilities:**
- Monitor arxiv for new low-resource NLP papers
- Benchmark our models against new baselines
- Maintain evaluation datasets
- Report on model quality metrics

### 8.3 Training Department
**Agents:** `zomi-trainer-bot`, `zolai-dpo-builder`
**Responsibilities:**
- Manage training runs on Kaggle/Colab
- Experiment with hyperparameters
- Track experiments (use MLflow or W&B)
- Maintain model registry on HuggingFace Hub

### 8.4 Synthesis Department
**Agents:** `zomi-synthesizer`
**Responsibilities:**
- Generate synthetic instruction data
- Run back-translation pipeline
- Validate synthetic data quality
- Expand domain coverage

### 8.5 Quality Department
**Agents:** `zolai-data-quality`, `zolai-ggammar-checker`
**Responsibilities:**
- ZVS dialect compliance checking
- Grammar error detection
- Human evaluation coordination
- Maintain quality metrics dashboard

---

## 9. Immediate Action Items (Priority Order)

### Phase 1: Data Quality (Now)
- [ ] Run MinHash deduplication on `corpus_master_v1.jsonl`
- [ ] Build Zolai language ID model using fastText
- [ ] Apply ZVS dialect filter to all training data
- [ ] Create held-out evaluation set (1K sentences, human-verified)

### Phase 2: First Training Run (Next 2 weeks)
- [ ] Format `training_v11_cefr.jsonl` in ChatML format
- [ ] Set up Kaggle notebook with Unsloth + Qwen2.5-7B
- [ ] Train first QLoRA model (3 epochs)
- [ ] Evaluate on held-out set

### Phase 3: Synthetic Data Expansion (Month 2)
- [ ] Expand synthetic data to 50K examples
- [ ] Add domain diversity (medical, legal, tech)
- [ ] Run back-translation pipeline with NLLB
- [ ] Retrain with expanded dataset

### Phase 4: Community & Evaluation (Month 3)
- [ ] Submit Zolai data to SEACrowd
- [ ] Create Zolai-FLORES evaluation set
- [ ] Upload model to HuggingFace Hub
- [ ] Write technical report

---

## 10. Key Lessons from Research

1. **Quality > Quantity:** 10K clean parallel pairs beats 100K noisy ones
2. **Deduplication is critical:** Bible corpus has many near-duplicates across versions
3. **Dialect consistency matters:** Mixed dialect data confuses models — enforce ZVS strictly
4. **Evaluation is hard:** BLEU scores often mislead for low-resource languages; use human eval
5. **Small models work:** 3B–7B models with QLoRA outperform larger models with less data
6. **Synthetic data helps:** Even noisy LLM-generated data improves performance
7. **Back-translation is proven:** Most effective augmentation for low-resource MT
8. **Community matters:** SEACrowd, Masakhane have solved similar problems — learn from them
9. **Multilingual base models:** Start from a multilingual model (Qwen2.5, Gemma2) not English-only
10. **Iterative improvement:** Train → evaluate → clean → retrain cycle is more effective than one big run

---

*References: arxiv.org papers 2510.04139, 2410.12691, 2505.04531, 2505.14423, 2411.18571, 2403.13638; NVIDIA NeMo Curator docs; Unsloth documentation; HuggingFace PEFT docs*
