# Zolai Training Guide

## Option 1: Kaggle GPU Training (Free)

### Get Kaggle GPU Access:

1. **Create Account**: https://www.kaggle.com
2. **Verify Phone** (required for GPU):
   - Go to Account Settings
   - Add phone number and verify

3. **Start Notebook with GPU**:
   - New Notebook → Select "GPU" as accelerator
   - Or: Notebook → Settings → Accelerator → GPU (T4 x2)

4. **Upload Data**:
   ```python
   # In Kaggle cell
   from IPython.display import FileLink
   FileLink('zolai_train_full.jsonl')
   ```
   
   Or use Kaggle API:
   ```bash
   kaggle datasets download -p ./data peterpausianlian/zolai-training-bundle
   ```

### Train on Kaggle:

```python
# Upload kaggle_notebook.py to Kaggle and run it
# Or copy the training code from scripts/kaggle_notebook.py
```

---

## Option 2: Local Training (Your Machine)

### Requirements:
- NVIDIA GPU with 8GB+ VRAM (T4 equivalent or better)
- CUDA installed

### Setup:

```bash
# Install requirements
pip install torch transformers peft bitsandbytes accelerate datasets

# Clone/download the kaggle_bundle
# Run training:
python scripts/kaggle_notebook.py
```

### Local Training Script:

```python
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer, TrainingArguments, Trainer
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

# Config
CONFIG = {
    "model_name": "Qwen/Qwen2-1.5B",
    "output_path": "./zolai-model"
}

# Load model
model = AutoModelForCausalLM.from_pretrained(
    CONFIG["model_name"],
    torch_dtype=torch.float16,
    device_map="auto"
)
tokenizer = AutoTokenizer.from_pretrained(CONFIG["model_name"])

# LoRA
lora_config = LoraConfig(r=16, lora_alpha=32, target_modules=["q_proj", "k_proj", "v_proj", "o_proj"])
model = get_peft_model(model, lora_config)

# Load data
dataset = load_dataset("json", data_files={
    "train": "zolai_train_full.jsonl",
    "validation": "zolai_val.jsonl"
})

# Train
training_args = TrainingArguments(
    output_dir=CONFIG["output_path"],
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    num_train_epochs=2,
    fp16=True,
    save_steps=500,
    logging_steps=50,
)

trainer = Trainer(model=model, args=training_args, train_dataset=dataset["train"])
trainer.train()

# Save
model.save_pretrained(CONFIG["output_path"])
tokenizer.save_pretrained(CONFIG["output_path"])
```

---

## Option 3: Google Colab (Alternative Free GPU)

1. Go to: https://colab.research.google.com
2. Upload `scripts/kaggle_notebook.py` as notebook
3. Connect to GPU runtime
4. Upload data from Google Drive

```python
# Mount Google Drive
from google.colab import drive
drive.mount('/content/drive')

# Or upload files directly
from google.colab import files
uploaded = files.upload()
```

---

## Hardware Comparison

| Platform | GPU | VRAM | Speed | Cost |
|----------|-----|------|-------|------|
| Kaggle | T4 x2 | 16GB | Fast | Free |
| Colab | T4 | 15GB | Fast | Free |
| Local | Varies | Varies | Depends | Your electricity |

---

## Quick Start Commands

### On Kaggle:
```python
# Just run the notebook!
```

### Locally:
```bash
# Install
pip install torch transformers peft bitsandbytes

# Train
python scripts/kaggle_notebook.py
```

### Download data for local:
```bash
# Copy from the project folder
cp /home/peter/Documents/Projects/zolai/kaggle_bundle/data/*.jsonl ./
```