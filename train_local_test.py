#!/usr/bin/env python3
"""Local training test - mimics Kaggle notebook"""

import os
import json
import torch
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForCausalLM, DataCollatorForLanguageModeling, Trainer, TrainingArguments
from peft import get_peft_model, LoraConfig, TaskType

os.environ['HF_TOKEN'] = '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'

# GPU setup
print(f"GPU: {torch.cuda.get_device_name(0)}")
print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB")

BATCH_SIZE = 8
MAX_LENGTH = 256

# Load datasets
TRAIN_FILE = "/home/peter/Documents/Projects/zolai/data/training/llm_train.jsonl"
VAL_FILE = "/home/peter/Documents/Projects/zolai/data/training/llm_val.jsonl"

def load_dataset(filepath, max_samples=10000):
    texts = []
    with open(filepath, "r") as f:
        for i, line in enumerate(f):
            if i >= max_samples:
                break
            rec = json.loads(line)
            texts.append(rec.get("text", ""))
    return Dataset.from_dict({"text": texts})

print("\nLoading datasets...")
train_dataset = load_dataset(TRAIN_FILE, max_samples=10000)
val_dataset = load_dataset(VAL_FILE, max_samples=1000)
print(f"Train: {len(train_dataset):,} samples")
print(f"Val: {len(val_dataset):,} samples")

# Load model
MODEL_NAME = "mistralai/Mistral-7B-v0.1"
print(f"\nLoading model: {MODEL_NAME}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto"
)

lora_config = LoraConfig(
    r=4,
    lora_alpha=8,
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# Tokenize
def tokenize_function(examples):
    return tokenizer(examples["text"], truncation=True, max_length=MAX_LENGTH)

print("\nTokenizing datasets...")
train_tokenized = train_dataset.map(tokenize_function, batched=True, remove_columns=["text"])
val_tokenized = val_dataset.map(tokenize_function, batched=True, remove_columns=["text"])

data_collator = DataCollatorForLanguageModeling(tokenizer, mlm=False)

# Training
training_args = TrainingArguments(
    output_dir="./zolai_model_test",
    num_train_epochs=1,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    warmup_steps=100,
    weight_decay=0.01,
    logging_steps=10,
    eval_strategy="steps",
    eval_steps=50,
    save_steps=50,
    save_total_limit=2,
    fp16=True,
    gradient_accumulation_steps=2,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_tokenized,
    eval_dataset=val_tokenized,
    data_collator=data_collator,
)

print("\n✓ Training setup complete")
print("Starting training...\n")
trainer.train()
print("\n✓ Training complete!")

# Save
model.save_pretrained("./zolai_model_test_final")
tokenizer.save_pretrained("./zolai_model_test_final")
print("✓ Model saved")
