#!/usr/bin/env python3
"""
Fine-tune Qwen/Llama on Zolai dataset using LoRA
"""
import json
import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
from peft import get_peft_model, LoraConfig, TaskType
from datasets import Dataset

# Config
MODEL_NAME = "Qwen/Qwen-7B-Chat"  # or "meta-llama/Llama-2-7b-chat"
TRAIN_FILE = Path("data/training/llm_train.jsonl")
VAL_FILE = Path("data/training/llm_val.jsonl")
OUTPUT_DIR = Path("data/runs/zolai_llm_v1")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print(f"Loading model: {MODEL_NAME}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)

# LoRA config
lora_config = LoraConfig(
    r=8,
    lora_alpha=16,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# Load data
def load_dataset(filepath):
    texts = []
    with open(filepath, "r") as f:
        for line in f:
            rec = json.loads(line)
            texts.append(rec.get("text", ""))
    return Dataset.from_dict({"text": texts})

print("Loading datasets...")
train_dataset = load_dataset(TRAIN_FILE)
val_dataset = load_dataset(VAL_FILE)

# Tokenize
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=512
    )

train_dataset = train_dataset.map(tokenize_function, batched=True)
val_dataset = val_dataset.map(tokenize_function, batched=True)

# Training args
training_args = TrainingArguments(
    output_dir=str(OUTPUT_DIR),
    num_train_epochs=3,
    per_device_train_batch_size=32,
    per_device_eval_batch_size=32,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    warmup_steps=500,
    weight_decay=0.01,
    logging_steps=100,
    save_steps=500,
    eval_steps=500,
    evaluation_strategy="steps",
    save_strategy="steps",
    load_best_model_at_end=True,
    fp16=True,
)

# Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
)

# Train
print("Starting training...")
trainer.train()

# Save
model.save_pretrained(OUTPUT_DIR / "final_model")
tokenizer.save_pretrained(OUTPUT_DIR / "final_model")

print(f"\n✅ Training complete!")
print(f"Model saved to: {OUTPUT_DIR}/final_model")
