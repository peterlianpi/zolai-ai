#!/usr/bin/env python3
"""
Zolai Qwen2.5-1.5B QLoRA Training Script — Kaggle T4 (single GPU)
=================================================================
Stretch target for when 0.5B plateaus. Keep runs chunked and resumable.

Usage on Kaggle:
  1. Add dataset: peterpausianlian/zolai-llm-training-dataset
  2. Add secrets: HF_TOKEN, KAGGLE_KEY
  3. Set CHUNK_START and RESUME_ADAPTER below
  4. Run All
"""

# =========================
# 1. INSTALL
# =========================
import subprocess
import sys

subprocess.run(
    [
        sys.executable,
        "-m",
        "pip",
        "install",
        "-q",
        "transformers",
        "peft",
        "datasets",
        "accelerate",
        "bitsandbytes",
        "kaggle",
        "huggingface_hub",
        "--upgrade",
    ],
    check=True,
)

# =========================
# 2. SECRETS + ENV
# =========================
import os

try:
    from kaggle_secrets import UserSecretsClient

    _s = UserSecretsClient()
    os.environ["HF_TOKEN"] = _s.get_secret("HF_TOKEN")
    os.environ["KAGGLE_USERNAME"] = "peterpausianlian"
    os.environ["KAGGLE_KEY"] = _s.get_secret("KAGGLE_KEY")
    print("✓ Secrets loaded from Kaggle")
except Exception as e:
    print(f"Kaggle Secrets unavailable ({e}) — using env vars")

os.environ["CUDA_VISIBLE_DEVICES"] = "0"
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

# =========================
# 3. CONFIG  ← UPDATE EACH SESSION
# =========================
CHUNK_START = 0  # 0, 25000, 50000, ...
RESUME_ADAPTER = None  # "peterpausianlian/zolai-qwen2.5-1.5b-lora" to resume

CHUNK_SIZE = 25_000
MAX_VAL = 500
MAX_LENGTH = 256
BATCH_SIZE = 2
GRAD_ACCUM = 8

MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
HF_REPO = "peterpausianlian/zolai-qwen2.5-1.5b-lora"

print(f"Session: chunk {CHUNK_START:,} → {CHUNK_START + CHUNK_SIZE:,}")
print(f"Resume:  {RESUME_ADAPTER or 'None (fresh start)'}")

# =========================
# 4. LOAD DATASET
# =========================
import glob
import json

import torch
from datasets import Dataset

train_files = glob.glob("/kaggle/input/**/llm_train.jsonl", recursive=True)
val_files = glob.glob("/kaggle/input/**/llm_val.jsonl", recursive=True)

if not train_files:
    raise FileNotFoundError("llm_train.jsonl not found in /kaggle/input")

TRAIN_FILE = train_files[0]
VAL_FILE = val_files[0] if val_files else train_files[0]

with open(TRAIN_FILE) as f:
    TOTAL_TRAIN = sum(1 for _ in f)
print(f"Total train rows: {TOTAL_TRAIN:,}")

if CHUNK_START >= TOTAL_TRAIN:
    raise ValueError(f"CHUNK_START={CHUNK_START:,} exceeds dataset size. Training complete!")


def load_jsonl(filepath, offset=0, limit=None):
    texts = []
    with open(filepath) as f:
        for i, line in enumerate(f):
            if i < offset:
                continue
            if limit and i >= offset + limit:
                break
            t = json.loads(line).get("text", "").strip()
            if t:
                texts.append(t)
    return Dataset.from_dict({"text": texts})


train_dataset = load_jsonl(TRAIN_FILE, offset=CHUNK_START, limit=CHUNK_SIZE)
val_dataset = load_jsonl(VAL_FILE, limit=MAX_VAL)
print(f"Train: {len(train_dataset):,} | Val: {len(val_dataset):,}")

# =========================
# 5. MODEL + TOKENIZER
# =========================
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, PeftModel, get_peft_model

HF_TOKEN = os.environ.get("HF_TOKEN")

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.bfloat16,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, token=HF_TOKEN)
tokenizer.pad_token = tokenizer.eos_token

base_model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    token=HF_TOKEN,
)

if RESUME_ADAPTER:
    model = PeftModel.from_pretrained(base_model, RESUME_ADAPTER)
else:
    lora_config = LoraConfig(
        r=8,
        lora_alpha=16,
        target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],
        lora_dropout=0.05,
        bias="none",
        task_type="CAUSAL_LM",
    )
    model = get_peft_model(base_model, lora_config)

# =========================
# 6. TOKENIZE
# =========================
def tokenize(batch):
    out = tokenizer(
        batch["text"],
        truncation=True,
        max_length=MAX_LENGTH,
        padding="max_length",
    )
    out["labels"] = out["input_ids"].copy()
    return out


train_dataset = train_dataset.map(tokenize, batched=True, remove_columns=["text"])
val_dataset = val_dataset.map(tokenize, batched=True, remove_columns=["text"])

# =========================
# 7. TRAIN
# =========================
from transformers import TrainingArguments, Trainer

args = TrainingArguments(
    output_dir="/kaggle/working/out",
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=GRAD_ACCUM,
    learning_rate=2e-4,
    num_train_epochs=1,
    logging_steps=25,
    evaluation_strategy="steps",
    eval_steps=200,
    save_steps=200,
    save_total_limit=2,
    fp16=False,
    bf16=True,
    report_to=[],
)

trainer = Trainer(model=model, args=args, train_dataset=train_dataset, eval_dataset=val_dataset)
trainer.train()

# =========================
# 8. SAVE
# =========================
model.save_pretrained("/kaggle/working/adapter")
tokenizer.save_pretrained("/kaggle/working/adapter")
print("Saved adapter to /kaggle/working/adapter")

