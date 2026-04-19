# Zolai LLM Training Roadmap

> Last updated: 2026-04-17

## Current Status

| Item | Value |
|------|-------|
| Base model | Qwen2.5-3B-Instruct |
| Adapter repo | `peterpausianlian/zolai-qwen2.5-3b-lora` |
| Kaggle dataset | `peterpausianlian/zolai-adapter-qwen25-3b` |
| Notebook | `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb` |
| Training hardware | Kaggle T4 x1 (single GPU, CUDA_VISIBLE_DEVICES=0) |
| Chunk size | 100,000 samples/session |
| Sessions/week | ~3 (30h free / ~9.5h per session) |
| Samples/week | ~300,000 |

## Training Progress

| Session | Chunk | Train Loss | Val Loss | Date |
|---------|-------|-----------|----------|------|
| 1 | 0–25k | 3.32 | 2.99 | 2026-04-17 |
| 2 | 25k–50k | 3.14 | 2.74 | 2026-04-17 |
| 3 | 50k–75k | in progress | - | 2026-04-17 |

> From session 4 onwards: CHUNK_SIZE = 100,000

## Weekly Session Routine

1. Open Kaggle notebook
2. Update cell 3:
   ```python
   CHUNK_START    = <next value>
   RESUME_ADAPTER = "peterpausianlian/zolai-qwen2.5-3b-lora"
   ```
3. Run all cells (~9.5h overnight)
4. Run cell 9 to upload adapter to HF Hub + Kaggle
5. Note `Next session: CHUNK_START = X` from output

## Dataset

- Train file: `llm_train.jsonl` (~5.1M samples)
- Val file: `llm_val.jsonl`
- Kaggle dataset: `peterpausianlian/zolai-llm-training-dataset`
- Full coverage: ~51 sessions at 100k/session (~17 weeks)
- Quality plateau expected: ~10–15 sessions (1–1.5M samples, ~5 weeks)

## Model Config

```python
# QLoRA
load_in_4bit=True, bnb_4bit_quant_type="nf4"
bnb_4bit_compute_dtype=torch.bfloat16

# LoRA
r=8, lora_alpha=16
target_modules=["q_proj", "v_proj"]

# Training
BATCH_SIZE=4, gradient_accumulation_steps=8  # effective batch=32
MAX_LENGTH=128, bf16=True
optim="paged_adamw_8bit"
```

## Roadmap

> Full strategy: see `wiki/training/data_pipeline_and_training_strategy.md`

### Phase 0 — Data Cleaning (Priority: NOW)
- [ ] Run `scripts/data_pipeline/clean_training_data.py`
  - Strip `###` noise from llm_train/val/test (~15% of 2.9M lines)
  - Deduplicate, filter non-Tedim dialects
  - Output: `llm_train_clean_v2.jsonl` + `instructions_recovered_v1.jsonl`
- [ ] Run `scripts/data_pipeline/clean_dict_files.py`
  - Deduplicate dict_semantic/enriched/en_zo (21.8% dups each)

### Phase 1 — Generate Supervised Data
- [ ] Run `scripts/synthesis/unsupervised_to_supervised.py`
  - Convert corpus_unified (2.97M sentences) → instruction pairs
  - Generate ~124k pairs from dict_semantic entries
- [ ] Run `scripts/synthesis/generate_dpo_pairs.py`
  - Generate DPO pairs: correct ZVS (chosen) vs wrong dialect (rejected)
  - Output: `data/training/dpo_pairs_v1.jsonl`

### Phase 2 — SFT on Clean Instruction Data (Kaggle or RunPod ~$10)
- [ ] Create `notebooks/zolai-sft-instruction-tuning.ipynb`
- [ ] Train on: Bible parallel (85k) + zo_en_pairs (105k) + dict pairs (124k)
- [ ] Target: val loss < 1.5
- [ ] Hardware: Kaggle T4 (free, slow) or RunPod H100 (~$10, 3-4h)

### Phase 3 — DPO Alignment (RunPod ~$5)
- [ ] Create `notebooks/zolai-dpo-alignment.ipynb`
- [ ] Use TRL DPOTrainer on `dpo_pairs_v1.jsonl`
- [ ] Target: ZVS compliance > 95%, reduced dialect mixing

### Phase 4 — Evaluate
- [ ] Build `data/eval/zolai_benchmark_v1.jsonl` (200 hand-verified pairs)
- [ ] Run `scripts/maintenance/evaluate_model.py`
- [ ] Check: BLEU, ZVS compliance, mixed-language penalty

### Phase 5 — Merge & Export (RunPod ~$3)
- [ ] Merge adapter: `model.merge_and_unload()` → `zolai_merged`
- [ ] Convert: `python convert_hf_to_gguf.py ./zolai_merged --outtype q4_k_m`
- [ ] Upload merged model to HF Hub

### Phase 6 — Deployment
- [ ] Deploy Gradio demo on HF Spaces
- [ ] Integrate with existing FastAPI (`zolai/api/`)
- [ ] Add `/translate`, `/chat`, `/correct` endpoints
- [ ] Connect to Telegram bot (`scripts/deploy/`)

### Phase 7 — Continue Pretraining (Kaggle, ongoing)
- [ ] Continue sessions on `llm_train_clean_v2.jsonl`
- [ ] Monitor val loss — target < 2.0
- [ ] Test Zolai generation quality after each 5 sessions

## Notes

- Adapter is cumulative — each session builds on all previous
- HF Hub is primary storage; Kaggle dataset is backup
- `adapter_model.safetensors` is always the full current adapter (~7.4MB)
- Base model (3B params) never changes — only adapter weights update
- Final merged model will be ~6GB (bf16) or ~1.8GB (GGUF Q4)

## Active Training Setup (2026-04-20)

### Script
`scripts/training/train_kaggle_t4x2.py` — extracted from `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`

### Session Config
| Parameter | Value |
|-----------|-------|
| Base model | Qwen/Qwen2.5-3B-Instruct |
| Method | QLoRA 4-bit NF4 |
| LoRA r / alpha | 8 / 16 |
| Target modules | q_proj, v_proj |
| Batch size | 4 × 8 grad accum |
| Max length | 128 tokens |
| Optimizer | paged_adamw_8bit |
| Chunk size | 25,000 rows/session |
| Dataset | peterpausianlian/zolai-llm-training-dataset |
| Adapter repo | peterpausianlian/zolai-qwen2.5-3b-lora |

### Session Progress
| Session | CHUNK_START | Status |
|---------|-------------|--------|
| 1 | 0 | ✅ Done |
| 2 | 25,000 | ✅ Done |
| 3 | 50,000 | ✅ Done |
| 4 | 75,000 | ✅ Done |
| 5 | 100,000 | 🔄 Next |
| ... | ... | ... |
| ~80 | ~2,000,000 | Full epoch |

