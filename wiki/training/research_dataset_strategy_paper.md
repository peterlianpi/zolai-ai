# Dataset Strategy for Low-Resource Language LLM Development: A Research Paper for the Zolai Project

> Author: Zolai Project Research
> Date: 2026-04-17
> Status: Living document — update as new research emerges

---

## Abstract

This paper synthesizes current research on dataset strategies for training and evaluating large language models (LLMs) in low-resource language settings, with direct application to the Zolai (Tedim Zomi) language AI project. Drawing from peer-reviewed work on Basque, Burmese, and other low-resource language pipelines, alongside established benchmarking literature, we identify the optimal data pipeline for Zolai: a three-stage approach of continual pre-training, supervised fine-tuning (SFT), and direct preference optimization (DPO), supported by a language-aware evaluation framework. We map each stage to the specific datasets already available in the Zolai project and identify the gaps that must be filled.

---

## 1. The Core Problem: Why Generic Data Is Not Enough

Standard LLMs (GPT-4, Llama, Qwen) are trained predominantly on English and high-resource languages. For Zolai (Tedim), this creates three compounding problems:

1. **Tokenization inefficiency** — English-centric tokenizers fragment Zolai words into many subword tokens, increasing inference cost and reducing coherence.
2. **Knowledge gap** — The model has seen almost no Zolai text, so it cannot generate fluent Zolai even if it understands the task.
3. **Dialect confusion** — Without explicit training, the model cannot distinguish Tedim ZVS from related dialects (Falam Chin, Hakha Chin, Zokam).

The research consensus (Corral et al. 2024 on Basque; Dr. Wai Yan on Burmese; Lin et al. 2024 on MaLA-500) is that all three problems require **language-specific data at every stage of the pipeline**, not just at fine-tuning.

---

## 2. The Three-Stage Pipeline (Proven for Low-Resource Languages)

### Stage 1: Continual Pre-training (CPT)

**What it does:** Teaches the base model the grammar, vocabulary, and patterns of the target language by training on raw text.

**Evidence:** Corral et al. (2024) showed that continual pre-training on ~600M words of Basque improved NLU performance by **+12.47 points** over the base Llama-3.1-8B. Critically, they used only ~1.5B tokens — far less than English pre-training corpora.

**Key finding:** Quality beats quantity. ZelaiHandi (521M words, high quality) performed nearly as well as a 1.22B word noisier dataset. The difference was only 0.62 points average.

**Anti-catastrophic-forgetting:** Mix 80% target language + 20% English during CPT. This preserves English reasoning ability while building Zolai competence.

**For Zolai:**
| Data | Tokens (est.) | Quality |
|---|---|---|
| `corpus_unified_v1.jsonl` (2.97M sentences) | ~400M tokens | Medium (needs cleaning) |
| Bible corpus (TDB77 + TBR17 + Tedim2010) | ~15M tokens | High |
| ZomiDaily news crawl | ~8M tokens | Medium |
| Hymns corpus | ~1M tokens | High |
| **Total Zolai** | **~424M tokens** | — |

This is comparable to the Basque ZelaiHandi corpus that achieved +12 points improvement. We have enough for effective CPT.

---

### Stage 2: Supervised Fine-Tuning (SFT)

**What it does:** Teaches the model to follow instructions in the target language using labeled input-output pairs.

**Evidence:** Burmese-Coder-4B achieved Pass@1 of 62% (matching Gemma-3 4B) using only **974 clean instruction examples**. Corral et al. used translated SlimOrca (518k examples) and achieved +17 points over baseline on instruction following.

**Key finding:** A language-adapted base model (post-CPT) benefits far more from SFT than a generic base model. Corral et al. showed +9 points advantage from starting with the Basque-adapted model vs. the generic Llama-3.1-8B.

**Data sources for SFT (ranked by quality):**

| Source | Pairs | Format | Quality |
|---|---|---|---|
| Bible parallel (TDB77/TBR17/Tedim2010 × KJV) | ~85,000 | `{instruction, input, output}` | ⭐⭐⭐⭐⭐ |
| `zo_en_pairs_combined_v1.jsonl` | 105,511 | `{zolai, english}` | ⭐⭐⭐⭐ |
| Dictionary-generated pairs (from dict_semantic) | ~124,000 | generated | ⭐⭐⭐ |
| `instructions_v1.jsonl` (existing) | ~30MB | instruction | ⭐⭐⭐ |
| Recovered `###` instruction lines from llm_train | ~220,000 | instruction | ⭐⭐ |
| Synthesized (synthesize_instructions_v6.py) | variable | instruction | ⭐⭐ |

**Instruction format (standard):**
```json
{
  "instruction": "Translate this English text to Zolai (Tedim ZVS).",
  "input": "God loves us.",
  "output": "Pasian in eite hong it hi."
}
```

**Task diversity matters.** Following the No_Robots taxonomy, SFT data should cover:
- Translation (ZO→EN, EN→ZO) — primary task
- Open QA in Zolai
- Summarization of Zolai text
- Grammar correction (wrong dialect → correct ZVS)
- Fill-in-the-blank
- Sentence completion
- Brainstorming / generation in Zolai

---

### Stage 3: DPO (Direct Preference Optimization)

**What it does:** Aligns the model to prefer correct outputs over incorrect ones, without needing a reward model. Simpler and more effective than RLHF for this scale.

**Evidence:** Corral et al. achieved +7 points improvement in correct instruction-following after DPO on translated UltraFeedback (61k triplets). Burmese-Coder-4B used DPO to reduce mixed-language drift and unstable terminology.

**Critical finding:** DPO only works well when the base model is already language-adapted. Applying DPO to a generic Llama-3.1-8B-instruct actually made performance *worse* (Corral et al. Table 4).

**For Zolai — DPO pair types:**

| Prompt | Chosen (correct ZVS) | Rejected (wrong dialect) |
|---|---|---|
| "Translate: God loves us." | "Pasian in eite hong it hi." | "Pathian in eite hong it hi." |
| "Translate: God is our Father" | "Pasian hi eite Pa a hi." | "Pathian hi eite Pa a hi." |
| "What is the land called?" | "Gam hi..." | "Ram hi..." |
| "He is our Lord" | "Topa a hi." | "Bawipa a hi." |
| "If you don't go..." | "Na pai kei a leh..." | "Na pai lo leh..." |
| "We went." | "I pai hi." | "I pai uh hi." |

**DPO dataset to build:** `data/training/dpo_pairs_v1.jsonl`
- Source: `zo_en_pairs_combined_v1.jsonl` + ZVS grammar rules from `wiki/ggammar/`
- Method: For each correct Tedim pair, generate a "rejected" version by substituting wrong dialect words
- Target size: 10,000–60,000 triplets (even 10k is sufficient per Corral et al.)

**DPO format:**
```json
{
  "prompt": "Translate to Zolai: God is our Father.",
  "chosen": "Pasian hi eite Pa a hi.",
  "rejected": "Pathian hi eite Pa a hi."
}
```

---

## 3. Generic vs. Specialized Data: The Right Mix

Based on Hou (2024) and the Basque pipeline research:

| Stage | Data Type | Ratio |
|---|---|---|
| CPT | Generic (English) + Specialized (Zolai) | 20% EN + 80% ZO |
| SFT | Specialized Zolai instruction pairs | 100% ZO |
| DPO | Specialized ZVS preference pairs | 100% ZO |

**Why keep English in CPT:** Prevents catastrophic forgetting of reasoning, world knowledge, and multilingual transfer. The model's English reasoning ability is what makes it capable of complex tasks — we want to add Zolai on top, not replace English.

**Why pure Zolai for SFT/DPO:** At this stage we are teaching dialect-specific behavior. Mixing in English instruction data would dilute the ZVS signal.

---

## 4. Evaluation Framework

### 4.1 What Standard Benchmarks Miss

Standard benchmarks (MMLU, ARC, HumanEval) are English-centric. They measure whether code runs or whether a multiple-choice answer is correct — but they cannot measure:
- Whether the output is in fluent Tedim ZVS
- Whether the model uses `pasian` vs `pasian`
- Whether SOV word order is maintained
- Whether the model mixes Falam Chin words into Tedim output

This is the same problem Burmese-Coder-4B identified: "A model can pass a coding task and still produce poor Burmese explanations."

### 4.2 Zolai-Specific Evaluation Metrics

| Metric | How to measure | Target |
|---|---|---|
| **Translation BLEU** | Compare ZO→EN output vs reference KJV on held-out Bible verses | > 25 BLEU |
| **ZVS compliance** | % of outputs using correct Tedim words (pasian, gam, topa, etc.) | > 95% |
| **Mixed-language penalty** | % of outputs containing HCL06/FCL/Zokam words | < 2% |
| **Instruction following** | Does it answer in Zolai when asked in Zolai? | > 90% |
| **Grammar correctness** | SOV order, correct negation (`kei` not `lo`), no `uh+i` combo | Manual review |
| **Dialect consistency** | Does it stay in Tedim throughout a multi-turn conversation? | Manual review |

### 4.3 Benchmark Dataset to Build

`data/eval/zolai_benchmark_v1.jsonl` — 200 hand-verified pairs:
- 50 Bible verse translations (ZO→EN, from held-out verses not in training)
- 50 news sentence translations (from ZomiDaily)
- 50 dictionary definition QA (from dict_semantic examples)
- 50 conversational exchanges (manually written)

This is the Zolai equivalent of what Corral et al. built for Basque (ARC_HT_eu, MMLU_HT_eu, etc.) — manually translated/created benchmarks in the target language.

### 4.4 Evaluation Metrics to Use

**Token-overlap (fast, automated):**
- BLEU — for translation tasks
- ROUGE-L — for summarization/generation
- chrF — better for morphologically complex languages (Zolai has agglutinative features)

**Semantic (slower, more accurate):**
- BERTScore — using a multilingual BERT model
- Embedding cosine similarity

**Language-aware (Zolai-specific):**
- ZVS word compliance checker (script: `scripts/maintenance/evaluate_model.py`)
- Dialect classifier (train a simple classifier on HCL06/FCL/Tedim samples)

---

## 5. Unsupervised → Supervised Conversion

The Zolai project has 2.97M raw sentences in `corpus_unified_v1.jsonl`. These are unsupervised (no labels). Converting them to supervised pairs is the highest-leverage data work available.

### Method 1: Back-Translation (Highest Value)
Use existing 105k parallel pairs to fine-tune a ZO→EN translation model, then run it on raw sentences to generate EN translations. Each raw sentence becomes a parallel pair.
- Input: 2.97M Zolai sentences
- Output: up to 2.97M ZO↔EN pairs (filter by confidence)
- Even 10% yield = 297k new supervised pairs

### Method 2: Dictionary-to-Instruction
Each `dict_semantic_v1.jsonl` entry has: zolai word, english translation, examples, synonyms, antonyms, usage notes.
Generate 5 instruction types per entry:
```
1. "Translate to English: {zolai}" → {english}
2. "Translate to Zolai: {english}" → {zolai}
3. "Give a synonym for: {zolai}" → {synonyms[0]}
4. "Use {zolai} in a sentence" → {examples[0]}
5. "What is the opposite of {zolai}?" → {antonyms[0]}
```
24,891 entries × 5 = **~124,000 new supervised pairs** from dictionary alone.

### Method 3: Fill-in-the-Blank (MLM-style)
Mask content words in raw sentences, create QA pairs:
```json
{"instruction": "Zolai sentence ah missing word hong suah leh:",
 "input": "Pasian __ a nei",
 "output": "lungdam"}
```

### Method 4: LLM Synthesis (Already Doing)
Feed raw sentences to GPT-4/Claude, ask it to generate ZO↔EN QA pairs. Already implemented in `scripts/synthesis/synthesize_instructions_v6.py`. Scale this up.

---

## 6. Compute Strategy: Kaggle vs. RunPod

### Cost Comparison

| Task | Kaggle T4 (free) | RunPod H100 ($2.50/hr) |
|---|---|---|
| CPT on 400M tokens | ~170 sessions × 9.5h = impractical | ~40h = ~$100 |
| SFT on 300k pairs | ~3 sessions × 9.5h = 28.5h | ~3h = ~$7.50 |
| DPO on 60k pairs | ~1 session = 9.5h | ~1h = ~$2.50 |
| Merge + export | ~1 session | ~0.5h = ~$1.25 |

**Recommendation:**
- Use **Kaggle** for: continued CPT (slow, free, ongoing)
- Use **RunPod** for: SFT + DPO (one-shot, fast, ~$15 total)

### RunPod Setup for Zolai

```bash
# 1. Rent H100 80GB on RunPod (PyTorch 2.1 template)
# 2. Load data from HuggingFace
from datasets import load_dataset
ds = load_dataset("peterpausianlian/zolai-llm-training-dataset")

# 3. No 4-bit quantization needed on H100
model = AutoModelForCausalLM.from_pretrained(
    "Qwen/Qwen2.5-3B-Instruct",
    torch_dtype=torch.bfloat16,
    device_map="auto"
)

# 4. Larger batch, longer sequences
BATCH_SIZE = 16
gradient_accumulation_steps = 4  # effective batch = 64
MAX_LENGTH = 512
```

### Kaggle Notebook Config (Current)
```python
# Keep as-is for CPT sessions
load_in_4bit = True
BATCH_SIZE = 4
gradient_accumulation_steps = 8
MAX_LENGTH = 128
```

---

## 7. What We Have vs. What We Need

### Have ✅
- 2.97M raw Zolai sentences (CPT corpus)
- 105k parallel ZO↔EN pairs (SFT gold data)
- 85k Bible parallel pairs (SFT gold data)
- 24k semantic dictionary entries (SFT generation source)
- ZVS grammar rules in `wiki/ggammar/` (DPO pair generation source)
- Qwen2.5-3B base model + existing adapter (3 sessions done)
- Kaggle training pipeline (working)

### Need ❌
- **Clean CPT corpus** — `llm_train_clean_v2.jsonl` (remove 15% noise from current)
- **SFT instruction dataset** — convert parallel pairs to instruction format, generate from dict
- **DPO pairs** — `dpo_pairs_v1.jsonl` (ZVS correct vs. wrong dialect)
- **Eval benchmark** — `zolai_benchmark_v1.jsonl` (200 hand-verified pairs)
- **RunPod notebook** — for SFT + DPO runs

### Gap Analysis

| Gap | Effort | Impact |
|---|---|---|
| Clean llm_train | Low (1 script) | High — removes 15% noise |
| Build SFT dataset | Medium (2 scripts) | Very High — enables instruction following |
| Build DPO pairs | Low (1 script + wiki rules) | High — enforces ZVS dialect |
| Build eval benchmark | High (manual work) | High — enables proper measurement |
| RunPod SFT run | Low ($10) | Very High — 10x faster than Kaggle |

---

## 8. Recommended Execution Order

```
Week 1 (local, free):
  1. scripts/data_pipeline/clean_training_data.py
     → llm_train_clean_v2.jsonl (remove ### noise, dedupe, filter non-Tedim)
  2. scripts/synthesis/unsupervised_to_supervised.py
     → sft_from_dict_v1.jsonl (~124k pairs from dict_semantic)
     → sft_from_parallel_v1.jsonl (convert parallel pairs to instruction format)
  3. scripts/synthesis/generate_dpo_pairs.py
     → dpo_pairs_v1.jsonl (~10-60k ZVS preference pairs)

Week 2 (RunPod H100, ~$15):
  4. SFT run: notebooks/zolai-sft-instruction-tuning.ipynb
     → Train on: Bible parallel + zo_en_pairs + dict pairs (~300k total)
     → Target: val loss < 1.5
  5. DPO run: notebooks/zolai-dpo-alignment.ipynb
     → Train on: dpo_pairs_v1.jsonl
     → Target: ZVS compliance > 95%

Week 3 (manual + local):
  6. Build data/eval/zolai_benchmark_v1.jsonl (200 hand-verified pairs)
  7. Run scripts/maintenance/evaluate_model.py
  8. Review outputs manually for ZVS compliance

Week 4+ (Kaggle, ongoing):
  9. Continue CPT on llm_train_clean_v2.jsonl
  10. Iterate SFT with new synthesized data
```

---

## 9. Key Lessons from Comparable Projects

### Basque (Llama-eus-8B, Corral et al. 2024)
- Language: Basque (low-resource, agglutinative — similar to Zolai)
- Base: Llama-3.1-8B
- CPT data: 521M words (ZelaiHandi)
- SFT data: 518k translated instructions (SlimOrca_eu)
- DPO data: 61k translated preference pairs (UltraFeedback_eu)
- Result: +12 pts NLU, +24 pts instruction following over baseline
- **Key lesson:** Translated English datasets work well for SFT/DPO when no native data exists

### Burmese-Coder-4B (Dr. Wai Yan, 2026)
- Language: Burmese (low-resource)
- Base: Gemma-3 4B
- SFT data: 974 clean coding examples
- DPO: Used to reduce mixed-language drift
- Cost: $40 total on H100
- Result: Matched Gemma-3 4B on Pass@1, better Burmese quality
- **Key lesson:** Quality over quantity. 974 clean examples beat millions of noisy ones.

### MaLA-500 (Lin et al. 2024)
- Adapted Llama-2 to 534 languages using continual pre-training on Glot500-c
- **Key lesson:** Even very small amounts of target language data (30k sentences) improve performance significantly

### Quality vs. Quantity (Corral et al. 2024, Appendix C)
- ZelaiHandi (521M words, high quality): avg score 61.22
- ZelaiHandi + Latxa (1.22B words, noisier): avg score 61.84
- Difference: only 0.62 points for 2.3× more data
- **Key lesson:** Cleaning existing data is more valuable than adding more noisy data

---

## 10. References

1. Corral, A., Sarasua, I., Saralegi, X. (2024). "Pipeline Analysis for Developing Instruct LLMs in Low-Resource Languages: A Case Study on Basque." arXiv:2412.13922. https://arxiv.org/html/2412.13922v1
2. Dr. Wai Yan Nyein Naing (2026). "Building Burmese-Coder-4B: A Burmese Coding LLM for Low-Resource Language AI." Technical Report. https://waiyannyeinnaing.github.io/assets/pdf/burmese_coder_4b.pdf
3. Hou, Y. (2024). "Generic vs. Specialized Datasets for Training Large Language Models." https://blogs.vreamer.org/generic-vs-specialized-datasets-for-training-large-language-models-d10f14f0667b
4. Jain, S. (2025). "LLM Benchmark Datasets for Training and Evaluation." https://sulbhajain.medium.com/llm-benchmark-datasets-for-training-and-evaluation-1ec271129d7c
5. ODSC (2026). "15 Datasets for Training and Evaluating AI Agents." https://odsc.medium.com/15-datasets-for-training-and-evaluating-ai-agents-c171dde4e0ce
6. Lin, P. et al. (2024). "MaLA-500: Massive Language Adaptation of Large Language Models." arXiv:2401.13303.
7. Rafailov, R. et al. (2023). "Direct Preference Optimization: Your Language Model is Secretly a Reward Model." NeurIPS 2023.
8. Hu, E. et al. (2021). "LoRA: Low-Rank Adaptation of Large Language Models." arXiv:2106.09685.
9. Penedo, G. et al. (2024). "The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale." arXiv:2406.17557.

---

## Appendix A: Useful External Datasets for Zolai

These are publicly available datasets that can be adapted for Zolai training:

| Dataset | Use for Zolai | Link |
|---|---|---|
| **No_Robots** (9.5k instructions) | Translate to Zolai → SFT data | https://huggingface.co/datasets/HuggingFaceH4/no_robots |
| **UltraFeedback** (64k preference pairs) | Translate to Zolai → DPO data | https://huggingface.co/datasets/openbmb/UltraFeedback |
| **SlimOrca** (518k GPT-4 instructions) | Translate to Zolai → SFT data | https://huggingface.co/datasets/Open-Orca/SlimOrca |
| **FLORES-200** (multilingual benchmark) | Check if Zolai/Chin is included | https://huggingface.co/datasets/facebook/flores |
| **Bible corpus** (parallel, 100 languages) | Already have — use for alignment | https://huggingface.co/datasets/christos-c/bible-corpus |
| **Belebele** (122 language reading comprehension) | Check Chin coverage | https://huggingface.co/datasets/facebook/belebele |

**Priority action:** Translate No_Robots (9.5k) and a subset of UltraFeedback (10k) to Zolai using GPT-4 or Claude. This gives us:
- 9.5k high-quality SFT instruction pairs
- 10k DPO preference pairs
- Total cost: ~$50-100 in API calls
- This is exactly what the Basque team did and it gave them +24 points improvement

---

## Appendix B: Scripts to Build

| Script | Input | Output | Priority |
|---|---|---|---|
| `scripts/data_pipeline/clean_training_data.py` | `llm_train.jsonl` | `llm_train_clean_v2.jsonl` | 🔴 NOW |
| `scripts/synthesis/unsupervised_to_supervised.py` | `corpus_unified_v1.jsonl`, `dict_semantic_v1.jsonl` | `sft_dict_v1.jsonl`, `sft_parallel_v1.jsonl` | 🔴 NOW |
| `scripts/synthesis/generate_dpo_pairs.py` | `zo_en_pairs_combined_v1.jsonl` + ZVS rules | `dpo_pairs_v1.jsonl` | 🔴 NOW |
| `scripts/synthesis/translate_no_robots.py` | No_Robots HF dataset | `sft_no_robots_zo_v1.jsonl` | 🟡 WEEK 2 |
| `scripts/synthesis/translate_ultrafeedback.py` | UltraFeedback HF dataset | `dpo_ultrafeedback_zo_v1.jsonl` | 🟡 WEEK 2 |
| `scripts/maintenance/evaluate_model.py` | Model + benchmark | Metrics report | 🟡 WEEK 3 |
| `notebooks/zolai-sft-instruction-tuning.ipynb` | SFT dataset | Fine-tuned adapter | 🔴 WEEK 2 |
| `notebooks/zolai-dpo-alignment.ipynb` | DPO pairs | Aligned adapter | 🔴 WEEK 2 |
