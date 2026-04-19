# Zolai AI Second Brain — Model & Training Memory

> Last updated: 2026-04-17

## Current Model

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
| Hardware | Kaggle T4 x1 (15.6GB VRAM) |
| Quantization | 4-bit NF4 + double quant |
| Compute dtype | bfloat16 |
| Optimizer | paged_adamw_8bit |
| Batch size | 4 per device × 8 grad accum = 32 effective |
| Max sequence length | 128 tokens |
| Speed | ~0.09–0.11 it/s |
| Time per 25k session | ~2.4h |
| Time per 100k session | ~9.5h |

## Training Progress

| Session | Chunk | Steps | Train Loss | Val Loss | Date |
|---------|-------|-------|-----------|----------|------|
| 1 | 0–25k | 782 | 3.3243 | 2.9856 | 2026-04-17 |
| 2 | 25k–50k | 782 | 3.1365 | 2.7398 | 2026-04-17 |
| 3 | 50k–75k | in progress | - | - | 2026-04-17 |

## Dataset

| File | Size | Samples |
|------|------|---------|
| `llm_train.jsonl` | ~777MB | ~5.1M |
| `llm_val.jsonl` | - | - |
| Source | `data/training/train_merged_all_v1.jsonl` | - |

## Weekly Training Plan

- Sessions per week: 3 (30h / ~9.5h per session)
- Chunk size from session 4: 100,000 samples
- Samples per week: ~300,000
- Full dataset coverage: ~17 weeks
- Quality plateau expected: ~5 weeks (1–1.5M samples)

## Session Checklist

Each session:
1. Set `CHUNK_START` = previous + CHUNK_SIZE
2. Set `RESUME_ADAPTER = "peterpausianlian/zolai-qwen2.5-3b-lora"`
3. Run notebook `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`
4. Run cell 9 to upload adapter to HF Hub + Kaggle
5. Update this file with new session row

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
