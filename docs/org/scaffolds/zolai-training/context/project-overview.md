# Zolai Training

LoRA/QLoRA fine-tuning of small Zolai LLMs (0.5B–3B) + evaluation + adapter export.
Consumes Zolai Datasets; produces adapters/GGUF for core inference + desktop.

## Goals
1. Fine-tune on ~5.1M-pair dataset (T4x2 LoRA FP16 r=16; QLoRA NF4 r=8 for 3B).
2. Session-based training with tracked val loss (roadmap in wiki).
3. Adapter merge + GGUF export for Ollama/desktop.
4. Eval against ZVS grammar + held-out parallel pairs.
