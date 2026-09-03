# Training Cadence (Weekly)

This cadence is designed around **Kaggle 30h/week** as the primary GPU budget, with free/freemium fallbacks for eval and packaging.

## Weekly schedule

| Day | Platform | Time budget | Primary outcome |
|---|---|---:|---|
| Mon | Kaggle (T4×2) | 12h | Train one corpus chunk, upload adapter |
| Tue | Kaggle (T4×2) | 12h | Train next corpus chunk, upload adapter |
| Wed | Lightning AI (L4/T4) | ~4–6h | Eval + small ablations (no long runs) |
| Thu | Kaggle (T4×2) | 6h | Finish weekly chunk target |
| Fri | Modal (A10G/L4 credits) | ~1–2h | Merge adapter + export GGUF + run benchmarks |
| Sat | HF Spaces (ZeroGPU) | short bursts | Refresh public demo + smoke tests |

## Required artifacts each week

- **Adapter on HF**: update `peterpausianlian/zolai-qwen-0.5b` (or active adapter)
- **Training log**: append metrics (steps, loss, val loss) to `scripts/training/logs/`
- **Eval report**: Bible holdout + ZVS rule score (see `scripts/test_grammar_rules.py`)
- **GGUF**: Q4_K_M (and optional Q8_0) in `peterpausianlian/zolai-qwen-0.5b-gguf`

## Command checklist (per session)

```bash
# 1) Train (Kaggle)
python scripts/training/train_kaggle_t4x2.py   # chunked training

# 2) Merge adapter (workstation or Modal)
python scripts/training/merge_adapter.py --base <BASE> --adapter <ADAPTER> --output ./merged/<name>

# 3) Export GGUF (requires llama.cpp checkout)
bash scripts/training/export_gguf.sh ./merged/<name> /path/to/llama.cpp ./artifacts/gguf/<name>

# 4) Register into Ollama (desktop/workstation)
bash desktop/scripts/ollama_register_gguf.sh ./artifacts/gguf/<name>.Q4_K_M.gguf zolai
```

## Notes

- Prefer **Qwen 0.5B** until you have reliable A100 access; it’s the best quality-per-hour on T4.\n+- When Kaggle quota is exhausted, use Lightning AI for eval and data processing, not training.\n+
