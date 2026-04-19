# Skill: Training Session Manager
# Triggers: "start training session", "next chunk", "resume training", "update chunk start"
# Version: 1.0.0

## Purpose
Manage session-based chunked training on Kaggle T4 GPU.
Each session processes 25,000 rows from llm_train_v3.jsonl.

## Session Config (update each run)
```python
# In scripts/training/train_kaggle_t4x2.py:
CHUNK_START    = 0        # Previous + 25000 each session
RESUME_ADAPTER = None     # None for first; "peterpausianlian/zolai-qwen2.5-3b-lora" after
```

## Session Progress Tracking
| Session | CHUNK_START | Status |
|---------|-------------|--------|
| 1 | 0 | ✅ Done |
| 2 | 25,000 | ✅ Done |
| 3 | 50,000 | ✅ Done |
| 4 | 75,000 | ✅ Done |
| 5 | 100,000 | 🔄 Next |
| ... | ... | ... |
| ~80 | ~2,000,000 | Full epoch |

## Kaggle Setup
1. Dataset: peterpausianlian/zolai-llm-training-dataset
2. Secrets: HF_TOKEN, KAGGLE_KEY
3. Accelerator: T4 GPU (single)
4. Run: train_kaggle_t4x2.py

## After Each Session
- Adapter auto-uploaded to HF Hub + Kaggle
- Update wiki/training/llm_training_roadmap.md session table
- Next: CHUNK_START += 25000

## Val Loss Targets
- CPT phase: < 2.0
- SFT phase: < 1.5
- ZVS compliance: > 95%

## Gotchas
- CUDA_VISIBLE_DEVICES=0 required (4-bit QLoRA breaks DataParallel)
- Adapter is cumulative — always load previous before training next chunk
- Val loss is the real metric — train loss can be misleading
- ~11 min per 25k chunk on T4
