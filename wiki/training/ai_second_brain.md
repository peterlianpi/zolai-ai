# Zolai AI Second Brain — Model & Training Memory

> Last updated: 2026-04-20

## Active Models

### zolai-qwen-0.5b (primary — actively training)

| Field | Value |
|-------|-------|
| Base model | `Qwen/Qwen2.5-0.5B-Instruct` |
| Adapter type | LoRA FP16 (r=16, lora_alpha=32) |
| Target modules | `q_proj`, `v_proj` |
| Adapter repo | `peterpausianlian/zolai-qwen-0.5b` |
| Hardware | Kaggle T4x2 |
| Training range | Chunks 300k–800k of 5.1M total |

### zolai-qwen2.5-3b-lora (stable — paused)

| Field | Value |
|-------|-------|
| Base model | `Qwen/Qwen2.5-3B-Instruct` |
| Adapter type | QLoRA (4-bit NF4, r=8, lora_alpha=16) |
| Target modules | `q_proj`, `v_proj` |
| Trainable params | 1,843,200 (0.06% of 3B) |
| Adapter repo | `peterpausianlian/zolai-qwen2.5-3b-lora` |
| Adapter size | ~7.4MB (safetensors) |
| Kaggle backup | `peterpausianlian/zolai-adapter-qwen25-3b` |

## Training Infrastructure

| Field | Value |
|-------|-------|
| Hardware | Kaggle T4x2 (31.2GB VRAM combined) |
| 0.5b method | LoRA FP16 (no quantization) |
| 3b method | QLoRA 4-bit NF4 + double quant |
| Compute dtype | bfloat16 / fp16 |
| Optimizer | adamw_torch (0.5b) / paged_adamw_8bit (3b) |
| Batch size | 8 × 4 grad accum = 32 effective (0.5b) |
| Max sequence length | 256 tokens (0.5b) / 128 tokens (3b) |
| Speed | ~0.09–0.11 it/s |
| Time per 100k session | ~9.5h |

## Library Versions

```
transformers==5.5.4
peft==0.19.1
trl==1.2.0
accelerate==1.13.0
bitsandbytes==0.49.2
torch==2.5.1+cu121
```

## Training Progress

### zolai-qwen-0.5b (active)
| Milestone | Chunk Range | Status |
|-----------|-------------|--------|
| Early sessions | 0–300k | ✅ Done |
| Current | 300k–800k | 🔄 In progress |
| Remaining | 800k–5.1M | ⏳ Planned |

### zolai-qwen2.5-3b-lora (paused)
| Session | Chunk | Steps | Train Loss | Val Loss | Date |
|---------|-------|-------|-----------|----------|------|
| 1 | 0–25k | 782 | 3.3243 | 2.9856 | 2026-04-17 |
| 2 | 25k–50k | 782 | 3.1365 | 2.7398 | 2026-04-17 |
| 3 | 50k–75k | 782 | ~3.00 | ~2.535 | 2026-04-17 |
| 4 | 75k–100k | 782 | - | - | 2026-04-17 |
| 5+ | 100k+ | — | — | — | ⏸️ Paused |

## Dataset

| File | Samples | Description |
|------|---------|-------------|
| `llm_train.jsonl` | ~5.1M | Full training set |
| `llm_val.jsonl` | ~200k | Validation split |
| Source | `peterpausianlian/zolai-llm-training-dataset` (Kaggle) | — |

## Weekly Training Plan

- Sessions per week: 3 (30h / ~9.5h per session)
- Chunk size: 100,000–500,000 samples/session
- Samples per week: ~300,000–500,000
- Full dataset coverage: ~17 weeks at 100k/session
- Quality plateau expected: ~5 weeks (1–1.5M samples)

## Session Checklist

Each session:
1. Set `CHUNK_START` = previous + CHUNK_SIZE
2. Set `RESUME_ADAPTER = "peterpausianlian/zolai-qwen-0.5b"` (or 3b if resuming that)
3. Run notebook `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`
4. Run upload cell to push adapter to HF Hub + Kaggle
5. Update training progress table above

## Deployment Plan (Post-Training)

1. Merge adapter: `model.merge_and_unload()` → save as `zolai_merged`
2. Convert to GGUF Q4: `python convert_hf_to_gguf.py ./zolai_merged --outtype q4_k_m`
3. Upload merged model to HF Hub
4. Deploy Gradio demo on HF Spaces
5. Integrate with `zolai/api/` FastAPI server
6. Connect to Telegram bot (`scripts/deploy/`)

## Why Qwen2.5-3B

- Best multilingual coverage for Asian/low-resource languages
- Fits on single T4 in 4-bit (no DataParallel issues)
- Well tested with QLoRA + PEFT
- Gemma-3 rejected: `token_type_ids` bug + CUDA illegal memory access with QLoRA
- Gemma-7B rejected: too slow (0.06 it/s) due to model parallelism overhead
