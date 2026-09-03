# Zolai Models — Canonical Manifest

> All models live on Hugging Face Hub. Use `huggingface-cli download <repo>` or the desktop app's auto-pull.

## Active LoRA adapters

| HF Repo | Base | Method | Status | Use case |
|---|---|---|---|---|
| `peterpausianlian/zolai-qwen-0.5b` | `Qwen/Qwen2.5-0.5B-Instruct` | LoRA FP16, r=16, alpha=32 | Active training (chunks 300k–800k) | Lightweight inference, on-device |
| `peterpausianlian/zolai-qwen2.5-3b-lora` | `Qwen/Qwen2.5-3B-Instruct` | QLoRA 4-bit NF4, r=8, alpha=16 | Stable | Quality fallback |

## Planned GGUF (Phase 4)

| HF Repo | Source | Quantization | Target runtime |
|---|---|---|---|
| `peterpausianlian/zolai-qwen-0.5b-gguf` | merge of `zolai-qwen-0.5b` | Q4_K_M, Q8_0 | Ollama / llama.cpp on desktop |
| `peterpausianlian/zolai-qwen2.5-3b-gguf` | merge of `zolai-qwen2.5-3b-lora` | Q4_K_M | Ollama on workstation (>= 8 GB RAM) |

## Training scripts

- Primary: [`scripts/training/train_kaggle_t4x2.py`](scripts/training/train_kaggle_t4x2.py) — chunked LoRA on Kaggle T4×2.
- Legacy: [`scripts/training/legacy/train_kaggle_t4x2_qwen7b_chat.py`](scripts/training/legacy/train_kaggle_t4x2_qwen7b_chat.py) — kept for reference.
- Stretch (Phase 6): `scripts/training/train_kaggle_t4x2_qwen1_5b.py` — Qwen2.5-1.5B QLoRA r=8.

## Adapter version log (append, do not rewrite)

| Date | Repo | Commit/Revision | Chunks trained | Eval BLEU (ZO→EN) | Notes |
|---|---|---|---|---|---|
| 2026-04-29 | `zolai-qwen-0.5b` | (record on next push) | 0–300k | TBD | Active |
| 2026-04 | `zolai-qwen2.5-3b-lora` | (record) | full corpus | TBD | Stable |

## Re-merging an adapter to base (Phase 4)

```bash
python scripts/training/merge_adapter.py \
  --base Qwen/Qwen2.5-0.5B-Instruct \
  --adapter peterpausianlian/zolai-qwen-0.5b \
  --output ./merged/zolai-qwen-0.5b-merged
```

(see `scripts/training/` once Phase 4 lands)
