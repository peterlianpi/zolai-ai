# Skill: Zolai Trainer

## Trigger
- "train zolai model"
- "fine-tune model"
- "train on zolai data"

## Description
Fine-tunes a language model on Zolai dataset.

## Workflow

### Step 1: Prepare Dataset
Ensure dataset is ready:
```bash
# Full pipeline
python pipelines/run.py
```

### Step 2: Export Dataset
```bash
python pipelines/export.py -f huggingface
# Output: dataset/huggingface/
```

### Step 3: Train Model
On Kaggle (recommended):
```bash
# Upload notebook to Kaggle
kaggle notebooks push -p notebooks/zolai-qwen-training-v2/
```

Or local with limited GPU:
```bash
# Use LoRA with small model
python -m transformers trainers \
  --model Qwen/Qwen2-0.5B-Instruct \
  --dataset zolai \
  --output_dir models/zolai-qwen-lora/
```

## Models Available
| Model | Params | VRAM | Use Case |
|-------|--------|------|---------|
| Qwen2 | 0.5B-72B | 1-48GB | General |
| Gemma | 2B-27B | 2-32GB | Fast |
| Llama | 3B-70B | 4-80GB | Quality |

## LoRA Config
```yaml
lora_r: 16
lora_alpha: 32
lora_dropout: 0.05
target_modules: q_proj, k_proj, v_proj
```

## Output
- Model weights: `models/zolai-*/
- LoRA adapters: `models/*-lora/`
- Training logs: `runs/`

## Local Training (CPU/Limited)
Not recommended due to time. Use Kaggle free GPU.

## Related Skills
- data-pipeline - Prepare dataset
- model-evaluator - Evaluate model
- model-deployer - Deploy model