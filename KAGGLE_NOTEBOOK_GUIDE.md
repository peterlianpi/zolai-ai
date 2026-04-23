# Kaggle Notebook: Zolai LLM Fine-Tuning on T4x2

> Last updated: 2026-04-20

## Setup

```python
# Install pinned dependencies
!pip install -q torch==2.5.1+cu121 transformers==5.5.4 peft==0.19.1 trl==1.2.0 accelerate==1.13.0 bitsandbytes==0.49.2 datasets

# Check GPU
import torch
print(f"GPU: {torch.cuda.get_device_name(0)}")
print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")
print(f"Count: {torch.cuda.device_count()}")
```

## Dataset

Use the Kaggle dataset: [`peterpausianlian/zolai-llm-training-dataset`](https://www.kaggle.com/datasets/peterpausianlian/zolai-llm-training-dataset)

Files:
- `llm_train_v3.jsonl` — ~5.1M training records
- `llm_val_v3.jsonl` — ~639k validation records
- `llm_test_v3.jsonl` — ~639k test records

## Current Training State

- **Active model:** `peterpausianlian/zolai-qwen-0.5b`
- **Base:** Qwen2.5-0.5B-Instruct
- **Method:** LoRA FP16, r=16, alpha=32
- **Current chunk:** 300k–800k of 5.1M total
- **Platform:** T4 x2

## Run Training

```python
# Copy training script from dataset
!cp /kaggle/input/zolai-llm-training-dataset/train_kaggle_t4x2.py .

# Update chunk range before running
# CHUNK_START = 300000
# CHUNK_END   = 800000
# RESUME_ADAPTER = "peterpausianlian/zolai-qwen-0.5b"

# Run training
!python3 train_kaggle_t4x2.py
```

## Monitor Training

```python
# View logs
!tail -100 /kaggle/working/training_log.txt
```

## Push Adapter to Hugging Face

```python
from huggingface_hub import HfApi
import os

api = HfApi(token=os.environ["HF_TOKEN"])
api.upload_folder(
    folder_path="/kaggle/working/final_adapter/",
    repo_id="peterpausianlian/zolai-qwen-0.5b",
    repo_type="model"
)
```

## Download Results

```python
# Compress adapter
!cd /kaggle/working && tar -czf zolai_adapter.tar.gz final_adapter/

# Download
from IPython.display import FileLink
FileLink('/kaggle/working/zolai_adapter.tar.gz')
```

## Expected Results

- **Training time:** ~30 hours per full pass
- **Total samples:** ~5.1M (processed in chunks)
- **Current chunk:** 300k–800k
- **VRAM usage:** ~14GB per T4 (x2)

## Optimization Tips

If running out of memory:
```python
per_device_train_batch_size = 2
max_length = 256
gradient_checkpointing = True
```

If training too slow:
```python
per_device_train_batch_size = 8
eval_steps = 500
```

## Secrets Required

Add these to Kaggle notebook secrets:
- `HF_TOKEN` — Hugging Face write token
- `KAGGLE_KEY` — Kaggle API key (for dataset access)

## Next Steps

1. Complete chunk 300k–800k
2. Evaluate: `python scripts/evaluate_model.py`
3. Merge adapter and export GGUF Q4
4. Deploy Gradio demo on HF Spaces
