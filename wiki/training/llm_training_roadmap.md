# Zolai LLM Training Roadmap

> Last updated: 2026-04-20

## Active Models

| Model | Adapter Repo | Method | LoRA | Hardware |
|-------|-------------|--------|------|----------|
| Qwen2.5-0.5B-Instruct | `peterpausianlian/zolai-qwen-0.5b` | LoRA FP16 | r=16, alpha=32 | Kaggle T4x2 |
| Qwen2.5-3B-Instruct | `peterpausianlian/zolai-qwen2.5-3b-lora` | QLoRA 4-bit NF4 | r=8, alpha=16 | Kaggle T4 x1 |

## Current Status (2026-04-20)

| Item | Value |
|------|-------|
| Primary active model | Qwen2.5-0.5B (zolai-qwen-0.5b) |
| Active training range | Chunks 300k–800k of 5.1M total |
| Chunk size | 100,000–500,000 samples/session |
| Dataset | `peterpausianlian/zolai-llm-training-dataset` (Kaggle) |
| Total dataset | ~5.1M sentences (`llm_train.jsonl`) |
| Sessions/week | ~3 (30h free / ~9.5h per session on T4x2) |
| Samples/week | ~300,000–500,000 |

## Training Progress

### zolai-qwen-0.5b (active — T4x2, LoRA FP16, r=16, alpha=32)
| Session | Chunk Range | Status |
|---------|-------------|--------|
| Early sessions | 0–300k | ✅ Done |
| Current | 300k–800k | 🔄 In progress |
| Remaining | 800k–5.1M | ⏳ Planned |

### zolai-qwen2.5-3b-lora (paused — T4 x1, QLoRA 4-bit NF4, r=8, alpha=16)
| Session | Chunk | Train Loss | Val Loss | Date |
|---------|-------|-----------|----------|------|
| 1 | 0–25k | 3.3243 | 2.9856 | 2026-04-17 |
| 2 | 25k–50k | 3.1365 | 2.7398 | 2026-04-17 |
| 3 | 50k–75k | ~3.00 | ~2.535 | 2026-04-17 |
| 4 | 75k–100k | ✅ Done | - | 2026-04-17 |
| 5+ | 100k+ | ⏳ Paused | - | - |

## Weekly Session Routine

1. Open Kaggle notebook
2. Update session config:
   ```python
   CHUNK_START    = <next value>
   CHUNK_SIZE     = 100_000  # or up to 500_000 for longer sessions
   RESUME_ADAPTER = "peterpausianlian/zolai-qwen-0.5b"  # or 3b adapter
   ```
3. Run all cells (~9.5h overnight on T4x2)
4. Run upload cell to push adapter to HF Hub + Kaggle
5. Note `Next session: CHUNK_START = X` from output

## Dataset

- Train file: `llm_train.jsonl` (~5.1M samples total)
- Val file: `llm_val.jsonl`
- Kaggle dataset: `peterpausianlian/zolai-llm-training-dataset`
- Full coverage: ~51 sessions at 100k/session (~17 weeks)
- Quality plateau expected: ~10–15 sessions (1–1.5M samples, ~5 weeks)

## Library Versions (Current)

```
transformers==5.5.4
peft==0.19.1
trl==1.2.0
accelerate==1.13.0
bitsandbytes==0.49.2
torch==2.5.1+cu121
```

## Model Configs

### zolai-qwen-0.5b (active)
```python
# LoRA FP16 (no quantization — 0.5B fits in VRAM)
r=16, lora_alpha=32
target_modules=["q_proj", "v_proj"]
BATCH_SIZE=8, gradient_accumulation_steps=4  # effective batch=32
MAX_LENGTH=256, fp16=True
optim="adamw_torch"
```

### zolai-qwen2.5-3b-lora (paused)
```python
# QLoRA 4-bit NF4
load_in_4bit=True, bnb_4bit_quant_type="nf4"
bnb_4bit_compute_dtype=torch.bfloat16
r=8, lora_alpha=16
target_modules=["q_proj", "v_proj"]
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

### Primary Script
`scripts/training/train_kaggle_t4x2.py` — extracted from `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`

### Active Model: zolai-qwen-0.5b
| Parameter | Value |
|-----------|-------|
| Base model | Qwen/Qwen2.5-0.5B-Instruct |
| Method | LoRA FP16 (no quantization) |
| LoRA r / alpha | 16 / 32 |
| Target modules | q_proj, v_proj |
| Batch size | 8 × 4 grad accum = 32 effective |
| Max length | 256 tokens |
| Optimizer | adamw_torch |
| Chunk size | 100,000–500,000 rows/session |
| Dataset | peterpausianlian/zolai-llm-training-dataset |
| Adapter repo | peterpausianlian/zolai-qwen-0.5b |
| Hardware | Kaggle T4x2 |

### Session Progress (0.5b model)
| Milestone | Chunk Range | Status |
|-----------|-------------|--------|
| Early training | 0–300k | ✅ Done |
| Current | 300k–800k | 🔄 In progress |
| Mid training | 800k–2M | ⏳ Planned |
| Late training | 2M–5.1M | ⏳ Planned |

### Paused Model: zolai-qwen2.5-3b-lora
| Session | CHUNK_START | Status |
|---------|-------------|--------|
| 1 | 0 | ✅ Done |
| 2 | 25,000 | ✅ Done |
| 3 | 50,000 | ✅ Done |
| 4 | 75,000 | ✅ Done |
| 5+ | 100,000+ | ⏸️ Paused (switched to 0.5b) |

