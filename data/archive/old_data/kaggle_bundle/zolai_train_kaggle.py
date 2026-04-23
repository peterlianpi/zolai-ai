"""
Zolai QLoRA Training — Kaggle T4 x2
Paste this entire file into a Kaggle notebook cell and run.
Data format: {"instruction": ..., "input": ..., "output": ...}
"""

# ── CELL 1: Install ──────────────────────────────────────────────────────────
import subprocess
subprocess.run(["pip", "install", "-q", "transformers", "peft", "bitsandbytes",
                "accelerate", "datasets", "trl"], check=True)

# ── CELL 2: Config ───────────────────────────────────────────────────────────
MODEL_NAME   = "Qwen/Qwen2.5-7B-Instruct"   # change to Qwen2-1.5B for faster test
DATA_FILE    = "/kaggle/input/zolai-training/zolai_tedim_train.jsonl"
OUTPUT_DIR   = "/kaggle/working/zolai-lora"
HF_REPO      = ""   # optional: "your-hf-username/zolai-qwen-lora"
MAX_SEQ_LEN  = 1024
EPOCHS       = 2
BATCH_SIZE   = 2
GRAD_ACCUM   = 8    # effective batch = 2*8 = 16

# ── CELL 3: Load data ────────────────────────────────────────────────────────
# Data is pre-filtered Tedim-only in ChatML messages format:
# {"messages": [{"role":"system",...},{"role":"user",...},{"role":"assistant",...}]}
import json, torch
from datasets import Dataset

def load_jsonl(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                rows.append(json.loads(line))
    return rows

def messages_to_text(row):
    """Convert ChatML messages list to a single training string."""
    parts = []
    for m in row["messages"]:
        parts.append(f"<|im_start|>{m['role']}\n{m['content']}<|im_end|>")
    return {"text": "\n".join(parts)}

raw = load_jsonl(DATA_FILE)
print(f"Loaded {len(raw):,} rows (Tedim Zolai only, pre-filtered)")

split = int(len(raw) * 0.98)
train_data = Dataset.from_list([messages_to_text(r) for r in raw[:split]])
val_data   = Dataset.from_list([messages_to_text(r) for r in raw[split:]])
print(f"Train: {len(train_data):,}  Val: {len(val_data):,}")

# ── CELL 4: Model + tokenizer ────────────────────────────────────────────────
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, TaskType

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_compute_dtype=torch.float16,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_use_double_quant=True,
)

tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME, trust_remote_code=True)
tokenizer.pad_token = tokenizer.eos_token
tokenizer.padding_side = "right"

model = AutoModelForCausalLM.from_pretrained(
    MODEL_NAME,
    quantization_config=bnb_config,
    device_map="auto",
    trust_remote_code=True,
)
model.config.use_cache = False

lora_config = LoraConfig(
    task_type=TaskType.CAUSAL_LM,
    r=64,
    lora_alpha=128,
    lora_dropout=0.05,
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"],
    bias="none",
)
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

# ── CELL 5: Train ────────────────────────────────────────────────────────────
from trl import SFTTrainer, SFTConfig

training_args = SFTConfig(
    output_dir=OUTPUT_DIR,
    num_train_epochs=EPOCHS,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=GRAD_ACCUM,
    learning_rate=1e-4,
    lr_scheduler_type="cosine",
    warmup_ratio=0.05,
    fp16=True,
    gradient_checkpointing=True,
    logging_steps=50,
    save_steps=500,
    eval_steps=500,
    save_total_limit=2,
    load_best_model_at_end=True,
    report_to="none",
    max_seq_length=MAX_SEQ_LEN,
    dataset_text_field="text",
    packing=True,   # pack short sequences → faster training
)

trainer = SFTTrainer(
    model=model,
    args=training_args,
    train_dataset=train_data,
    eval_dataset=val_data,
    tokenizer=tokenizer,
)

print("Starting training...")
trainer.train()

# ── CELL 6: Save ─────────────────────────────────────────────────────────────
model.save_pretrained(OUTPUT_DIR)
tokenizer.save_pretrained(OUTPUT_DIR)
print(f"Saved to {OUTPUT_DIR}")

# ── CELL 7: Push to Hugging Face (optional) ──────────────────────────────────
if HF_REPO:
    from huggingface_hub import HfApi
    import os
    # Set HF_TOKEN in Kaggle Secrets → Add-ons → Secrets
    token = os.environ.get("HF_TOKEN", "")
    if token:
        api = HfApi()
        api.upload_folder(folder_path=OUTPUT_DIR, repo_id=HF_REPO,
                          repo_type="model", token=token)
        print(f"Pushed to https://huggingface.co/{HF_REPO}")
    else:
        print("Set HF_TOKEN in Kaggle Secrets to auto-push to Hugging Face")
