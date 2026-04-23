#!/usr/bin/env python3
"""
Zolai Language Model Training - Kaggle Notebook
Optimized for T4 x2 GPU (16GB VRAM)

Data Format: {"text": "Zolai sentence"}
"""

from __future__ import annotations

import os
import json
import torch
from pathlib import Path

# ============== CONFIG ==============
CONFIG = {
    "model_name": "Qwen/Qwen2-1.5B",
    "per_device_train_batch_size": 4,
    "per_device_eval_batch_size": 8,
    "gradient_accumulation_steps": 4,
    "learning_rate": 2e-4,
    "num_train_epochs": 2,
    "max_seq_length": 256,
    "lora_r": 16,
    "lora_alpha": 32,
    "lora_dropout": 0.05,
    "data_path": "/kaggle/input",
    "output_path": "/kaggle/working/zolai-model",
}

# ============== IMPORTS ==============
print("Loading libraries...")
from transformers import (
    AutoModelForCausalLM,
    AutoTokenizer,
    TrainingArguments,
    Trainer,
    DataCollatorForLanguageModeling,
)
from peft import LoraConfig, get_peft_model, TaskType
from datasets import load_dataset

# ============== DATA ==============
print("Loading training data...")
train_file = f"{CONFIG['data_path']}/zolai_train_full.jsonl"
val_file = f"{CONFIG['data_path']}/zolai_val.jsonl"

dataset = load_dataset("json", data_files={"train": train_file, "validation": val_file})

print(f"Train size: {len(dataset['train'])}")
print(f"Val size: {len(dataset['validation'])}")

# ============== MODEL ==============
print("Loading model...")

tokenizer = AutoTokenizer.from_pretrained(CONFIG["model_name"], trust_remote_code=True, padding_side="right")
tokenizer.pad_token = tokenizer.eos_token

# 4-bit quantization for memory efficiency
try:
    from bitsandbytes import BitsAndBytesConfig

    quantization_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
        bnb_4bit_use_double_quant=True,
        bnb_4bit_quant_type="nf4",
    )
    model = AutoModelForCausalLM.from_pretrained(
        CONFIG["model_name"], quantization_config=quantization_config, device_map="auto", trust_remote_code=True
    )
    print("Loaded with 4-bit quantization")
except:
    # Fallback to FP16
    model = AutoModelForCausalLM.from_pretrained(
        CONFIG["model_name"], torch_dtype=torch.float16, device_map="auto", trust_remote_code=True
    )
    print("Loaded with FP16")

# ============== LORA ==============
lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=CONFIG["lora_r"],
    lora_alpha=CONFIG["lora_alpha"],
    lora_dropout=CONFIG["lora_dropout"],
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj"],
    bias="none",
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()


# ============== TOKENIZE ==============
def tokenize_function(examples):
    # Tokenize the text field
    return tokenizer(examples["text"], max_length=CONFIG["max_seq_length"], truncation=True, padding="max_length")


tokenized_dataset = dataset.map(tokenize_function, batched=True, remove_columns=dataset["train"].column_names)

# Add labels (same as input_ids for causal LM)
tokenized_dataset = tokenized_dataset.map(lambda x: {"labels": x["input_ids"]}, batched=False)

print(f"Tokenized train: {len(tokenized_dataset['train'])}")

# ============== TRAIN ==============
training_args = TrainingArguments(
    output_dir=CONFIG["output_path"],
    per_device_train_batch_size=CONFIG["per_device_train_batch_size"],
    per_device_eval_batch_size=CONFIG["per_device_eval_batch_size"],
    gradient_accumulation_steps=CONFIG["gradient_accumulation_steps"],
    learning_rate=CONFIG["learning_rate"],
    num_train_epochs=CONFIG["num_train_epochs"],
    warmup_steps=100,
    logging_steps=50,
    save_steps=200,
    eval_steps=200,
    save_total_limit=2,
    fp16=True,
    gradient_checkpointing=True,
    load_best_model_at_end=True,
    report_to="none",
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset["train"],
    eval_dataset=tokenized_dataset["validation"],
    data_collator=DataCollatorForLanguageModeling(
        tokenizer=tokenizer,
        mlm=False,  # Causal LM
    ),
)

print("Starting training...")
trainer.train()

# ============== SAVE ==============
print("Saving model...")
model.save_pretrained(CONFIG["output_path"])
tokenizer.save_pretrained(CONFIG["output_path"])

with open(f"{CONFIG['output_path']}/training_config.json", "w") as f:
    json.dump(CONFIG, f, indent=2)

print(f"Model saved to {CONFIG['output_path']}")
print("=" * 40)
print("TRAINING COMPLETE!")
print("=" * 40)
