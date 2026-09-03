# Zolai Training — Architecture

- Stack: PyTorch, Transformers, PEFT/TRL, bitsandbytes, accelerate.
- Platforms: Kaggle notebooks (T4 GPU), local T4x2.
- Runs: `scripts/training/`, `notebooks/`, eval scripts, GGUF export.
- Outputs: adapters to HF `zolai-adapter-*`, GGUF for tauri.
- Invariants: no secrets; ZVS 2018 data only; sessions logged.
