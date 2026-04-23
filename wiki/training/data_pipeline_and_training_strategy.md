# Zolai Data Pipeline & Training Strategy

> Last updated: 2026-04-20
> Inspired by: Burmese-Coder-4B (Dr. Wai Yan Nyein Naing, April 2026)

## Library Versions (Current)

```
transformers==5.5.4
peft==0.19.1
trl==1.2.0
accelerate==1.13.0
bitsandbytes==0.49.2
torch==2.5.1+cu121
```

---

## Key Lesson: Quality Over Quantity

Burmese-Coder-4B matched Gemma-3 4B on Pass@1 using only **974 clean examples** and **$40 compute**.
Our current approach uses millions of noisy samples. The priority is:

1. **Clean first** — remove noise, deduplicate, separate dialects
2. **Convert unsupervised → supervised** — turn raw text into instruction pairs
3. **SFT** — supervised fine-tuning on clean instruction data
4. **DPO** — preference alignment to enforce ZVS dialect standards
5. **Evaluate properly** — language-aware metrics, not just loss

---

## Current Dataset Audit (2026-04-17)

### Active Files — Status

| File | Lines | Issues | Action |
|---|---|---|---|
| `corpus/corpus_unified_v1.jsonl` | 2,973,157 | 0.1% dups | ✅ clean enough |
| `parallel/zo_en_pairs_combined_v1.jsonl` | 105,511 | 0.2% dups | ✅ use as-is |
| `parallel/zo_en_pairs_master_v1.jsonl` | 58,011 | 3.2% dups | ⚠️ dedupe |
| `parallel/bible_parallel_tdb77_kjv.jsonl` | 28,756 | 0.9% | ✅ use as-is |
| `parallel/bible_parallel_tbr17_kjv.jsonl` | 27,113 | 0.2% | ✅ use as-is |
| `parallel/bible_parallel_tedim2010_kjv.jsonl` | 29,255 | 0.5% | ✅ use as-is |
| `dict_unified_v1.jsonl` | 152,093 | 1.1% short | ✅ use as-is |
| `dict_semantic_v1.jsonl` | 24,891 | **21.8%** dups | 🔴 dedupe |
| `dict_enriched_v1.jsonl` | 24,891 | **21.8%** dups | 🔴 dedupe |
| `dict_en_zo_v1.jsonl` | 24,891 | **21.8%** dups | 🔴 dedupe |
| `training/llm_train.jsonl` | ~5.1M | **~15%** noise | 🔴 clean |
| `training/llm_val.jsonl` | ~200k | **~15%** noise | 🔴 clean |
| `training/llm_test.jsonl` | ~200k | **~15%** noise | 🔴 clean |

### Do Not Use for Training

| File | Reason |
|---|---|
| `training/final_train.jsonl` (1.2G) | llm_train + val + test merged + untagged old data |
| `training/master_all_versions.jsonl` (1.7G) | All metadata lost, all `source: unknown` |
| `archive/training_versions/*` | Superseded, untagged |

### Total Supervised Pairs Available

| Source | Pairs |
|---|---|
| `zo_en_pairs_combined_v1.jsonl` | 105,511 |
| Bible parallel (3 versions × KJV) | ~85,000 |
| `dict_semantic_v1.jsonl` (examples field) | ~24,891 entries |
| **Total** | **~215,000** |

---

## Step 1: Data Cleaning Pipeline

### Script: `scripts/data_pipeline/clean_training_data.py`

What it does:
- Strips `###` instruction-formatted lines from `llm_train/val/test` → saves them separately as recovered instruction data
- Deduplicates all three files
- Filters non-Tedim dialects (HCL06, FCL, Tedim_Chin) into a separate file
- Strips HTML, URLs, encoding garbage

Output files:
```
data/training/llm_train_clean_v2.jsonl       # clean Tedim-only raw text
data/training/llm_val_clean_v2.jsonl
data/training/instructions_recovered_v1.jsonl # rescued ### instruction pairs
data/training/non_tedim_dialects_v1.jsonl    # HCL06/FCL/Tedim_Chin (keep for later)
```

### Script: `scripts/data_pipeline/clean_dict_files.py`

What it does:
- Deduplicates `dict_semantic`, `dict_enriched`, `dict_en_zo`
- Removes stub entries (headword < 3 chars, no translations)

---

## Step 2: Unsupervised → Supervised Conversion

Source: `corpus/corpus_unified_v1.jsonl` (2.97M raw Zolai sentences)

### Method A: Fill-in-the-blank (MLM-style)
```python
# Mask a content word, make it a QA pair
{"instruction": "Zolai sentence ah missing word hong suah leh:",
 "input": "Pasian in eite hong __ hi",
 "output": "it"}
```

### Method B: Translation pairs via back-translation
- Use existing parallel pairs to fine-tune a ZO→EN model
- Run it on raw sentences → auto-generate EN translations
- Creates new parallel pairs at scale

### Method C: Instruction synthesis (already doing with synthesize_instructions_v6.py)
- Feed raw sentences to LLM
- Ask it to generate ZO↔EN QA pairs, grammar questions, fill-in-the-blank

### Method D: Dictionary-to-instruction
Each `dict_semantic` entry has: zolai, english, examples, synonyms, antonyms
Generate 5 instruction types per entry:
```
1. "Translate to English: {zolai}" → {english}
2. "Translate to Zolai: {english}" → {zolai}
3. "Give a synonym for: {zolai}" → {synonyms[0]}
4. "Use {zolai} in a sentence" → {examples[0]}
5. "What is the opposite of {zolai}?" → {antonyms[0]}
```
24,891 entries × 5 = ~124,000 new supervised pairs from dictionary alone.

### Script: `scripts/synthesis/unsupervised_to_supervised.py`

---

## Step 3: SFT (Supervised Fine-Tuning)

Inspired by Burmese-Coder-4B Stage 1.

### Training data priority (high quality first):
1. Bible parallel pairs (85k) — gold standard, verified translations
2. `zo_en_pairs_combined_v1.jsonl` (105k) — curated parallel pairs
3. Dictionary-generated pairs (~124k) — from dict_semantic
4. `instructions_recovered_v1.jsonl` — rescued from llm_train noise
5. `instructions_v1.jsonl` (30MB existing)

### Format (instruction-tuning):
```json
{
  "instruction": "Translate this English text to Zolai (Tedim ZVS).",
  "input": "God loves us.",
  "output": "Pasian in eite hong it hi."
}
```

### Kaggle notebook: `notebooks/zolai-sft-instruction-tuning.ipynb`
- Base: `Qwen/Qwen2.5-3B-Instruct` (current adapter already trained)
- Or: start fresh SFT on clean instruction data only

---

## Step 4: DPO (Preference Alignment)

Inspired by Burmese-Coder-4B Stage 2. This is what we haven't done yet.

**Goal:** Make the model prefer correct Tedim ZVS over wrong dialect forms.

### DPO pair format:
```json
{
  "prompt": "Translate: God is our Father",
  "chosen": "Pasian hi eite Pa a hi.",
  "rejected": "pasian hi eite Pa a hi."
}
```

### ZVS violation pairs to generate:
| Wrong (rejected) | Correct (chosen) |
|---|---|
| `pasian` | `pasian` |
| `gam` | `gam` |
| `tapa` | `tapa` |
| `topa` | `topa` / `kumpipa` |
| `???` | (avoid entirely) |
| `tua` / `tuan` | `tua` |
| `kei a leh` (conditional) | `kei a leh` |
| `uh i` (plural+we) | never combine |

### Script: `scripts/synthesis/generate_dpo_pairs.py`
- Read `zo_en_pairs_combined_v1.jsonl`
- For each pair, generate a "rejected" version by substituting wrong dialect words
- Output: `data/training/dpo_pairs_v1.jsonl`

### Kaggle notebook: `notebooks/zolai-dpo-alignment.ipynb`
- Run after SFT adapter is stable
- Use TRL's `DPOTrainer`

---

## Step 5: Evaluation Framework

Inspired by Burmese-Coder-4B's language-aware evaluation (not just loss).

### Metrics to track:
1. **Translation accuracy** — BLEU on held-out Bible verses
2. **ZVS compliance** — % of outputs using correct Tedim dialect words
3. **Mixed-language penalty** — % of outputs containing HCL06/FCL words
4. **Instruction following** — does it answer in Zolai when asked?
5. **Grammar correctness** — SOV order, correct negation, no `uh+i` combo

### Benchmark dataset: `data/eval/zolai_benchmark_v1.jsonl`
- 200 hand-verified ZO↔EN pairs (50 Bible, 50 news, 50 dictionary, 50 conversation)
- Build this manually — quality matters more than quantity

### Script: `scripts/maintenance/evaluate_model.py`

---

## RunPod vs Kaggle

### Kaggle (current — free)
- T4 x1, 15.6GB VRAM
- 30h/week free
- ~9.5h per 100k sample session
- Good for: continued pretraining, slow SFT
- Limit: slow (0.09 it/s), no persistent storage, session restarts

### RunPod (paid — for speed)
- H100 80GB: ~$2.50/hr
- A100 40GB: ~$1.50/hr
- Burmese-Coder-4B: 2.75h on H100 = ~$7 for full SFT
- Our SFT on 300k clean pairs: ~3-4h on H100 = ~$10
- Our DPO on 50k pairs: ~1-2h on H100 = ~$5

### When to use RunPod:
- SFT on clean instruction data (one-shot, ~$10)
- DPO alignment run (~$5)
- Final merged model export (~$3)
- **Total estimated cost: ~$20-30 for full pipeline**

### RunPod setup:
```bash
# Use RunPod PyTorch 2.1 template
# Mount volume for persistent storage
pip install transformers peft trl bitsandbytes datasets

# Upload data via:
# Option 1: HuggingFace dataset (already have peterpausianlian/zolai-llm-training-dataset)
# Option 2: runpodctl send <file>
# Option 3: wget from HF Hub
```

### Kaggle notebook for RunPod-style training:
Use the same notebook structure but with:
```python
# No 4-bit quantization needed on H100
load_in_4bit = False
torch_dtype = torch.bfloat16
# Larger batch size
BATCH_SIZE = 16
gradient_accumulation_steps = 4  # effective batch = 64
MAX_LENGTH = 512  # can afford longer sequences
```

---

## Full Pipeline Execution Order

```
Phase 0: Clean (local, free)
  scripts/data_pipeline/clean_training_data.py
  scripts/data_pipeline/clean_dict_files.py

Phase 1: Generate supervised data (local, free)
  scripts/synthesis/unsupervised_to_supervised.py
  scripts/synthesis/generate_dpo_pairs.py

Phase 2: SFT (Kaggle T4 or RunPod H100)
  notebooks/zolai-sft-instruction-tuning.ipynb
  Target: val loss < 1.5 on instruction data

Phase 3: DPO (RunPod H100, ~$5)
  notebooks/zolai-dpo-alignment.ipynb
  Target: ZVS compliance > 95%

Phase 4: Evaluate
  scripts/maintenance/evaluate_model.py
  Manual review of 200-item benchmark

Phase 5: Merge & Export (RunPod, ~$3)
  model.merge_and_unload() → zolai_merged
  convert_hf_to_gguf.py → zolai_q4.gguf

Phase 6: Deploy
  HF Hub upload
  Ollama local test
  Gradio demo on HF Spaces
```

---

## Reference

- Burmese-Coder-4B paper: https://waiyannyeinnaing.github.io/assets/pdf/burmese_coder_4b.pdf
- Burmese-Coder-4B weights: https://huggingface.co/WYNN747/burmese-coder-4b-SFT
- TRL DPO docs: https://huggingface.co/docs/trl/dpo_trainer
- Current Zolai adapter: `peterpausianlian/zolai-qwen2.5-3b-lora`
- Current training notebook: `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`
