#!/usr/bin/env python3
"""
Kaggle T4x2 optimized training (30h limit)
"""
import json
import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForCausalLM, TrainingArguments, Trainer
from peft import get_peft_model, LoraConfig, TaskType
from datasets import Dataset

# Kaggle paths
TRAIN_FILE = Path("/kaggle/input/zolai-dataset/llm_train.jsonl")
VAL_FILE = Path("/kaggle/input/zolai-dataset/llm_val.jsonl")
OUTPUT_DIR = Path("/kaggle/working/zolai_llm_t4x2")

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print("🚀 Starting Kaggle T4x2 Training (30h limit)")
print(f"GPU: {torch.cuda.get_device_name(0)}")
print(f"VRAM: {torch.cuda.get_device_properties(0).total_memory / 1e9:.1f}GB\n")

# Model (lightweight for T4)
MODEL_NAME = "Qwen/Qwen-7B-Chat"
print(f"Loading model: {MODEL_NAME}")

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    torch_dtype=torch.float16,
    device_map="auto",
    trust_remote_code=True
)

# LoRA (aggressive for T4)
lora_config = LoraConfig(
    r=4,  # Reduced from 8
    lora_alpha=8,  # Reduced from 16
    target_modules=["q_proj", "v_proj"],
    lora_dropout=0.05,
    bias="none",
    task_type=TaskType.CAUSAL_LM
)

model = get_peft_model(model, lora_config)
print("\nTrainable parameters:")
model.print_trainable_parameters()

# Load data (sample for speed)
def load_dataset(filepath, max_samples=None):
    texts = []
    with open(filepath, "r") as f:
        for i, line in enumerate(f):
            if max_samples and i >= max_samples:
                break
            rec = json.loads(line)
            texts.append(rec.get("text", ""))
    return Dataset.from_dict({"text": texts})

print("\nLoading datasets...")
# Use 500K samples for 30h training on T4x2
train_dataset = load_dataset(TRAIN_FILE, max_samples=500000)
val_dataset = load_dataset(VAL_FILE, max_samples=50000)

print(f"Train samples: {len(train_dataset):,}")
print(f"Val samples: {len(val_dataset):,}")

# Tokenize
def tokenize_function(examples):
    return tokenizer(
        examples["text"],
        padding="max_length",
        truncation=True,
        max_length=256  # Reduced from 512
    )

print("Tokenizing...")
train_dataset = train_dataset.map(tokenize_function, batched=True, batch_size=1000)
val_dataset = val_dataset.map(tokenize_function, batched=True, batch_size=1000)

# Training args (T4x2 optimized)
training_args = TrainingArguments(
    output_dir=str(OUTPUT_DIR),
    num_train_epochs=1,  # Single epoch for 30h
    per_device_train_batch_size=8,  # Small for T4
    per_device_eval_batch_size=8,
    gradient_accumulation_steps=4,
    learning_rate=2e-4,
    warmup_steps=100,
    weight_decay=0.01,
    logging_steps=50,
    save_steps=200,
    eval_steps=200,
    evaluation_strategy="steps",
    save_strategy="steps",
    load_best_model_at_end=True,
    fp16=True,
    max_steps=2000,  # ~30h on T4x2
    dataloader_num_workers=2,
    remove_unused_columns=False,
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
print("\n" + "="*80)
print("STARTING TRAINING (30h limit)")
print("="*80 + "\n")

trainer.train()

# Save
print("\nSaving model...")
model.save_pretrained(OUTPUT_DIR / "final_model")
tokenizer.save_pretrained(OUTPUT_DIR / "final_model")

print(f"\n✅ Training complete!")
print(f"Model: {OUTPUT_DIR}/final_model")
print(f"Samples trained: 500K")
print(f"Time: ~30 hours on T4x2")
