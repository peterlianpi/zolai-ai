# Runs - Training Run Logs

**Size:** 32MB | **Format:** Checkpoints, Logs

## Contents

### Training Runs
- `run_qwen_zolai_7b_lora_v7/` — Qwen 7B LoRA v7
- `run_zolai_v1/` — Zolai v1
- `run_zo_tdm_v1/` — Zo-TDM v1

## Structure
Each run folder contains:
- `checkpoint-*/` — Model checkpoints
- `logs/` — Training logs
- `config.json` — Training configuration
- `results.json` — Training results

## Usage

```python
from transformers import AutoModel

model = AutoModel.from_pretrained('run_qwen_zolai_7b_lora_v7/checkpoint-1000')
```

---
**Last Updated:** 2026-04-16
