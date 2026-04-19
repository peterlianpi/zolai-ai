#!/usr/bin/env python3
"""
Zolai Qwen2.5-3B LoRA Training Script — Kaggle T4 (single GPU)
================================================================
Session-based chunked training: each run processes CHUNK_SIZE rows
from llm_train.jsonl, uploads adapter to HF Hub + Kaggle dataset.

Usage on Kaggle:
  1. Add dataset: peterpausianlian/zolai-llm-training-dataset
  2. Add secrets: HF_TOKEN, KAGGLE_KEY
  3. Set CHUNK_START and RESUME_ADAPTER below
  4. Run All

Notebook: notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb
"""

# =========================
# 1. INSTALL
# =========================
import subprocess, sys
subprocess.run([sys.executable, "-m", "pip", "install", "-q",
    "transformers", "peft", "datasets", "accelerate",
    "bitsandbytes", "kaggle", "huggingface_hub", "--upgrade"], check=True)

# =========================
# 2. SECRETS + ENV
# =========================
import os

try:
    from kaggle_secrets import UserSecretsClient
    _s = UserSecretsClient()
    os.environ["HF_TOKEN"]        = _s.get_secret("HF_TOKEN")
    os.environ["KAGGLE_USERNAME"] = "peterpausianlian"
    os.environ["KAGGLE_KEY"]      = _s.get_secret("KAGGLE_KEY")
    print("✓ Secrets loaded from Kaggle")
except Exception as e:
    print(f"Kaggle Secrets unavailable ({e}) — using env vars")

# 4-bit quantized models cannot use DataParallel
os.environ["CUDA_VISIBLE_DEVICES"]   = "0"
os.environ.setdefault("TOKENIZERS_PARALLELISM", "false")

# =========================
# 3. CONFIG  ← UPDATE EACH SESSION
# =========================
CHUNK_START    = 0                                            # 0, 25000, 50000, ...
RESUME_ADAPTER = None                                         # None = fresh; "peterpausianlian/zolai-qwen2.5-3b-lora" to resume

CHUNK_SIZE  = 25_000
MAX_VAL     = 500
MAX_LENGTH  = 128
BATCH_SIZE  = 4
MODEL_NAME  = "Qwen/Qwen2.5-3B-Instruct"
HF_REPO     = "peterpausianlian/zolai-qwen2.5-3b-lora"
KAGGLE_DS   = "peterpausianlian/zolai-adapter-qwen25-3b"

print(f"Session: chunk {CHUNK_START:,} → {CHUNK_START + CHUNK_SIZE:,}")
print(f"Resume:  {RESUME_ADAPTER or 'None (fresh start)'}")

# =========================
# 4. LOAD DATASET
# =========================
import json, glob
import torch
from datasets import Dataset

train_files = glob.glob("/kaggle/input/**/llm_train.jsonl", recursive=True)
val_files   = glob.glob("/kaggle/input/**/llm_val.jsonl",   recursive=True)

if not train_files:
    print("ERROR: Dataset not found. Available jsonl:")
    for f in glob.glob("/kaggle/input/**/*.jsonl", recursive=True): print(f"  {f}")
    raise FileNotFoundError("llm_train.jsonl not found in /kaggle/input")

TRAIN_FILE = train_files[0]
VAL_FILE   = val_files[0] if val_files else train_files[0]
print(f"Train: {TRAIN_FILE}\nVal:   {VAL_FILE}")

with open(TRAIN_FILE) as f:
    TOTAL_TRAIN = sum(1 for _ in f)
print(f"Total train rows: {TOTAL_TRAIN:,}")

if CHUNK_START >= TOTAL_TRAIN:
    raise ValueError(f"CHUNK_START={CHUNK_START:,} exceeds dataset size. Training complete!")

def load_jsonl(filepath, offset=0, limit=None):
    texts = []
    with open(filepath) as f:
        for i, line in enumerate(f):
            if i < offset: continue
            if limit and i >= offset + limit: break
            t = json.loads(line).get("text", "").strip()
            if t: texts.append(t)
    return Dataset.from_dict({"text": texts})

train_dataset = load_jsonl(TRAIN_FILE, offset=CHUNK_START, limit=CHUNK_SIZE)
val_dataset   = load_jsonl(VAL_FILE, limit=MAX_VAL)
print(f"Train: {len(train_dataset):,} | Val: {len(val_dataset):,}")

# =========================
# 5. MODEL + TOKENIZER
# =========================
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import get_peft_model, PeftModel, LoraConfig, TaskType

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
    device_map="cuda:0",
    low_cpu_mem_usage=True,
    token=HF_TOKEN,
)
base_model.gradient_checkpointing_enable()
base_model.enable_input_require_grads()

if RESUME_ADAPTER:
    print(f"Resuming from: {RESUME_ADAPTER}")
    model = PeftModel.from_pretrained(base_model, RESUME_ADAPTER, is_trainable=True, token=HF_TOKEN)
else:
    print("Fresh LoRA init")
    model = get_peft_model(base_model, LoraConfig(
        r=8, lora_alpha=16,
        target_modules=["q_proj", "v_proj"],
        lora_dropout=0.05, bias="none",
        task_type=TaskType.CAUSAL_LM,
    ))

model.print_trainable_parameters()
free, total = torch.cuda.mem_get_info(0)
print(f"GPU 0: {(total-free)/1e9:.1f}GB used / {total/1e9:.1f}GB total")

# =========================
# 6. TRAIN
# =========================
import datetime
from transformers import DataCollatorForLanguageModeling, Trainer, TrainingArguments

def tokenize(examples):
    return tokenizer(examples["text"], truncation=True, max_length=MAX_LENGTH)

train_tok = train_dataset.map(tokenize, batched=True, remove_columns=["text"], num_proc=2)
val_tok   = val_dataset.map(tokenize,   batched=True, remove_columns=["text"], num_proc=2)

training_args = TrainingArguments(
    output_dir="./zolai_model",
    num_train_epochs=1,
    per_device_train_batch_size=BATCH_SIZE,
    per_device_eval_batch_size=BATCH_SIZE,
    gradient_accumulation_steps=8,
    warmup_steps=50,
    weight_decay=0.01,
    logging_steps=10,
    report_to="none",
    eval_strategy="steps",
    eval_steps=200,
    save_steps=500,
    save_total_limit=2,
    bf16=True,
    optim="paged_adamw_8bit",
    gradient_checkpointing=True,
    ddp_find_unused_parameters=False,
    dataloader_num_workers=2,
    dataloader_pin_memory=True,
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_tok,
    eval_dataset=val_tok,
    data_collator=DataCollatorForLanguageModeling(tokenizer, mlm=False),
)

steps = len(train_tok) // (BATCH_SIZE * 8)
print(f"✓ Ready | Train: {len(train_tok):,} | Steps: ~{steps:,} | ~{steps*11/3600:.1f}h")

_start = datetime.datetime.now()
print(f"Starting training... [{_start.strftime('%H:%M:%S')}]")
trainer.train()
print(f"✓ Done! Duration: {str(datetime.datetime.now() - _start).split('.')[0]}")

# Print loss table
print(f"\n{'Step':>6} | {'Train Loss':>10} | {'Val Loss':>9}")
print("-" * 34)
for l in trainer.state.log_history:
    if "eval_loss" in l:
        step = l.get("step", "?")
        tl = next((x["loss"] for x in trainer.state.log_history
                   if x.get("step") == step and "loss" in x), None)
        print(f"{step:>6} | {tl or '':>10} | {l['eval_loss']:>9.6f}")

# =========================
# 7. SAVE + UPLOAD
# =========================
import shutil
from huggingface_hub import HfApi, create_repo

ADAPTER_OUT = "./zolai_adapter"
model.save_pretrained(ADAPTER_OUT)
tokenizer.save_pretrained(ADAPTER_OUT)

zip_path = shutil.make_archive("zolai_adapter", "zip", ".", ADAPTER_OUT)
print(f"✓ Zipped: {zip_path} ({os.path.getsize(zip_path)/1e6:.1f} MB)")

# HuggingFace Hub
token = os.environ["HF_TOKEN"]
api = HfApi()
create_repo(HF_REPO, repo_type="model", token=token, exist_ok=True, private=True)
api.upload_folder(
    folder_path=ADAPTER_OUT,
    repo_id=HF_REPO,
    repo_type="model",
    token=token,
    commit_message=f"Chunk {CHUNK_START:,}-{CHUNK_START + CHUNK_SIZE:,}",
)
print(f"✓ HF Hub: https://huggingface.co/{HF_REPO}")

# Kaggle Dataset
os.makedirs("kaggle_upload", exist_ok=True)
shutil.copy("zolai_adapter.zip", "kaggle_upload/")
with open("kaggle_upload/dataset-metadata.json", "w") as f:
    json.dump({"title": "zolai-adapter-qwen25-3b", "id": KAGGLE_DS,
               "licenses": [{"name": "MIT"}]}, f)

result = subprocess.run(
    ["kaggle", "datasets", "version", "-p", "kaggle_upload",
     "-m", f"Chunk {CHUNK_START}-{CHUNK_START + CHUNK_SIZE}", "--dir-mode", "zip"],
    capture_output=True, text=True
)
if result.returncode == 0:
    print(f"✓ Kaggle: https://www.kaggle.com/datasets/{KAGGLE_DS}")
else:
    print(f"Kaggle upload failed: {result.stderr}")

print(f"\n{'='*50}")
print(f"Next session: CHUNK_START    = {CHUNK_START + CHUNK_SIZE}")
print(f"Next session: RESUME_ADAPTER = \"{HF_REPO}\"")
print(f"{'='*50}")
