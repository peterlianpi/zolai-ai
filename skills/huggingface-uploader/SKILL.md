# Skill: HuggingFace Hub Automation

## Trigger
- "upload to huggingface"
- "hf dataset"
- "publish model"

## Description
Uploads datasets and models to HuggingFace Hub.

## Prerequisites
```bash
# Install HF tools
pip install huggingface_hub datasets

# Login
huggingface-cli login
# Or set HF_TOKEN env var
```

## Workflow

### Step 1: Prepare Data
```bash
# Export to HF format
python pipelines/export.py -f huggingface
# Creates: dataset/huggingface/
```

### Step 2: Create Dataset
```python
from datasets import load_dataset, DatasetDict

# Load local dataset
ds = DatasetDict({
    "train": load_dataset("json", data_files="dataset/huggingface/train/*.jsonl")["train"],
    "val": load_dataset("json", data_files="dataset/huggingface/val/*.jsonl")["train"],
})

# Push to Hub
ds.push_to_hub("peterpausianlian/zolai-dataset")
```

### Step 3: Upload Model
```python
from transformers import AutoModelForCausalLM, AutoTokenizer

# Save model
model = AutoModelForCausalLM.from_pretrained("models/zolai-qwen")
tokenizer = AutoTokenizer.from_pretrained("models/zolai-qwen")

# Push to Hub
model.push_to_hub("peterpausianlian/zolai-qwen")
tokenizer.push_to_hub("peterpausianlian/zolai-qwen")
```

## Commands
```bash
# Login
huggingface-cli login

# Download dataset
huggingface-cli download peterpausianlian/zolai-dataset

# Upload folder as dataset
huggingface-cli upload peterpausianlian zolai-data ./data --repo-type dataset

# Create Space
huggingface-cli space create zolai-chat --sdk streamlit
```

## Environment Variables
```bash
HF_TOKEN=hf_...  # Get from huggingface.co/settings/tokens
```

## Related Skills
- kaggle-automation - Train on Kaggle
- model-deployer - Deploy model
- rag-builder - Build RAG system