# Local Development Docs — Zolai Kaggle Workspace

> Keep this file updated with latest framework versions, Kaggle platform details, automation recipes, and AI model usage patterns. Last updated: 2026-04-04.

---

## 1. Kaggle Platform Reference

### 1.1 GPU Specs (as of 2026)

| GPU | VRAM | Precision | Notes |
|-----|------|-----------|-------|
| **T4 ×2** (default) | 16 GB each | FP16, INT8, INT4 | Best for QLoRA 4-bit; supports DDP across both |
| **P100** | 16 GB | FP32, FP16 | Older, no INT4 support; avoid for QLoRA |
| **V100** | 16/32 GB | FP32, FP16, TF32 | Rare on Kaggle; faster than T4 for FP16 |
| **TPU v3-8** | N/A | BF16 | Only for JAX/PyTorch XLA; not used in this project |

**Recommendation:** Always use **T4 ×2** for training. Set `USE_DDP_2GPU=True` in `zolai-qwen-training-v2.ipynb` to use both GPUs.

### 1.2 Kaggle Session Limits

| Resource | Limit |
|----------|-------|
| Session duration | 12 hours (CPU/GPU) |
| Disk (`/kaggle/working`) | ~73 GB (varies by GPU type) |
| RAM | 30 GB (standard), 100 GB (large dataset mode) |
| Internet | 30 hrs/week (GPU), unlimited (CPU-only) |
| Notebook versions | Unlimited (auto-saved as drafts) |

### 1.3 Path Conventions

```
/kaggle/input/                          # Read-only mounted datasets
/kaggle/input/datasets/<owner>/<name>/  # Dataset mount point
/kaggle/working/                        # Writable output (session-only)
/kaggle/working/<notebook-name>/        # Output subfolder per notebook
```

### 1.4 Kaggle Secrets

Set via Kaggle UI → Notebook → Settings → **Add-ons → Secrets**:

| Secret Key | Purpose | Accessed Via |
|------------|---------|--------------|
| `HF_TOKEN` | HuggingFace gated models, tokenizer, Hub uploads | `UserSecretsClient().get_secret("HF_TOKEN")` |
| `GEMINI_API_KEY` | Gemini API for LLM correction | `UserSecretsClient().get_secret("GEMINI_API_KEY")` |
| `GITHUB_TOKEN` | GitHub Copilot API, GitHub Models access | `UserSecretsClient().get_secret("GITHUB_TOKEN")` |
| `OPENAI_API_KEY` | OpenAI models (also via GitHub Models) | `UserSecretsClient().get_secret("OPENAI_API_KEY")` |
| `KAGGLE_API_KEY` | Kaggle CLI authentication | Auto-set in notebook sessions |
| `ZOLOAI_USE_ONE_GPU` | Force single GPU mode | `"1"` or `"0"` |

```python
from kaggle_secrets import UserSecretsClient
user_secrets = UserSecretsClient()
hf_token = user_secrets.get_secret("HF_TOKEN")
github_token = user_secrets.get_secret("GITHUB_TOKEN")
```

---

## 2. Kaggle API & Automation

### 2.1 kaggle CLI (v1.6+)

```bash
# Install
pip install kaggle>=1.6.0

# Authenticate (local machine only; auto-auth in Kaggle notebooks)
export KAGGLE_USERNAME=<username>
export KAGGLE_KEY=<api-key>
# Or: ~/.kaggle/kaggle.json with chmod 600

# Dataset operations
kaggle datasets init -p /path/to/dir          # Create metadata
kaggle datasets create -p /path/to/dir        # New dataset
kaggle datasets version -p /path/to/dir -m "message"  # New version
kaggle datasets download -d <owner>/<slug>    # Download dataset
kaggle datasets list -s "zolai"               # Search datasets

# Notebook operations
kaggle kernels push -p /path/to/notebook      # Push notebook
kaggle kernels pull -k <kernel-slug>          # Pull notebook
kaggle kernels output -k <kernel-slug>        # Download outputs
kaggle kernels status -k <kernel-slug>        # Check run status

# Competition operations
kaggle competitions list
kaggle competitions submit -c <comp> -f <file> -m "message"
kaggle competitions submissions -c <comp>
```

### 2.2 kagglehub Python Library (v0.3+)

```python
import kagglehub

# Download dataset
path = kagglehub.dataset_download("peterpausianlian/zolai-master-data")
print("Dataset path:", path)

# Download notebook
path = kagglehub.notebook_download("kernel-slug")

# Upload dataset (requires authentication)
# kagglehub.dataset_upload(...)  # Check latest API
```

### 2.3 Automating Dataset Updates from Local Machine

```python
import os
import subprocess
import json
from pathlib import Path

def publish_kaggle_dataset(staging_dir: str, message: str, dataset_id: str):
    """Stage files and publish a new Kaggle dataset version."""
    staging = Path(staging_dir)
    staging.mkdir(parents=True, exist_ok=True)

    # Write dataset-metadata.json
    metadata = {
        "id": dataset_id,
        "title": "Zolai cleaned corpus",
        "licenses": [{"name": "CC0-1.0"}],
    }
    with open(staging / "dataset-metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # Publish
    cmd = ["kaggle", "datasets", "version", "-p", str(staging), "-m", message]
    print("Running:", " ".join(cmd))
    subprocess.run(cmd, check=True)
```

### 2.4 Automating Notebook Runs via Kaggle API

```python
import subprocess

def trigger_notebook_run(kernel_slug: str):
    """Trigger a Kaggle notebook run via CLI."""
    # Pull latest version, modify, push, and run
    subprocess.run(["kaggle", "kernels", "pull", "-k", kernel_slug], check=True)
    # ... modify notebook programmatically ...
    subprocess.run(["kaggle", "kernels", "push", "-p", kernel_slug], check=True)
    # Check status
    result = subprocess.run(
        ["kaggle", "kernels", "status", "-k", kernel_slug],
        capture_output=True, text=True
    )
    print(result.stdout)
```

---

## 3. Core ML Framework Reference

### 3.1 Current Versions (pinned in notebooks)

| Package | Version | Purpose |
|---------|---------|---------|
| `transformers` | >=4.45.0 | Model loading, tokenization, generation |
| `datasets` | >=2.19.0 | Dataset loading, streaming, HF export |
| `peft` | >=0.12.0 | LoRA adapter configuration |
| `trl` | >=0.9.0 | SFTTrainer for supervised fine-tuning |
| `accelerate` | >=0.34.0 | DDP, device placement, notebook_launcher |
| `bitsandbytes` | >=0.43.0 | 4-bit quantization (NF4) |
| `torch` | latest compatible | Deep learning backend |
| `pandas` | >=2.0,<3 | DataFrame ops (split, stats) |
| `scikit-learn` | latest | train_test_split |
| `sentence-transformers` | latest | Semantic similarity scoring |
| `tqdm` | >=4.66 | Progress bars |
| `kaggle` | >=1.6.0 | CLI for dataset/notebook ops |
| `matplotlib` | >=3.5,<3.10.1 | Histograms, plots |

### 3.2 QLoRA 4-Bit Quantization Config

```python
from transformers import BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",        # NormalFloat4 (best for QLoRA)
    bnb_4bit_compute_dtype=torch.float16,  # FP16 for compute
    bnb_4bit_use_double_quant=True,   # Double quantization saves ~0.4 bits/param
)
```

**Why NF4:** NormalFloat4 uses a non-uniform quantization grid matched to the normal distribution of weights — better than FP4/INT4 for LLMs.

### 3.3 LoRA Config

```python
from peft import LoraConfig

lora_config = LoraConfig(
    r=16,                              # Rank (higher = more params, better quality)
    lora_alpha=32,                     # Scaling factor (typically 2× r)
    target_modules=["q_proj", "k_proj", "v_proj", "o_proj"],  # Attention layers only
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
)
```

**To target more modules** (slower but better quality):
```python
target_modules=["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj", "up_proj", "down_proj"]
```

### 3.4 SFTTrainer Config

```python
from trl import SFTConfig, SFTTrainer

sft_config = SFTConfig(
    output_dir="/kaggle/working/qwen-zolai",
    per_device_train_batch_size=1,
    per_device_eval_batch_size=1,
    gradient_accumulation_steps=8,     # Effective batch = 1 × 8 = 8 (single GPU)
    gradient_accumulation_steps=4,     # Effective batch = 1 × 2 × 4 = 8 (DDP ×2)
    logging_steps=50,
    save_steps=200,
    save_total_limit=3,                # Keep only 3 checkpoints on disk
    eval_strategy="steps",
    eval_steps=400,
    learning_rate=2e-4,
    fp16=True,                         # T4 does not support BF16 well
    bf16=False,                        # Set True if GPU supports BF16
    optim="paged_adamw_32bit",         # Paged optimizer prevents OOM
    max_length=512,
    dataset_text_field="text",
    packing=False,                     # Set True after successful run
    gradient_checkpointing=True,       # Saves VRAM, slightly slower
    dataloader_num_workers=2,
    remove_unused_columns=False,
    ddp_find_unused_parameters=False,  # Required for DDP
)
```

### 3.5 Multi-GPU DDP (2× T4)

```python
from accelerate import notebook_launcher

# In config cell:
USE_DDP_2GPU = True
os.environ["CUDA_VISIBLE_DEVICES"] = "0,1"  # Both GPUs visible

# In train cell:
notebook_launcher(_ddp_train, args=(config_dict,), num_processes=2)
```

**Important:** Restart session after changing `USE_DDP_2GPU`. Each DDP worker loads a full 4-bit replica on its GPU.

### 3.6 Attention Implementations

| Implementation | Speed | VRAM | Notes |
|---------------|-------|------|-------|
| `eager` | Slowest | Highest | Fallback, always works |
| `sdpa` | Faster | Lower | PyTorch 2 scaled-dot-product; **recommended** |
| `flash_attention_2` | Fastest | Lowest | Needs separate install; may not work on T4 |

```python
ATTN_IMPLEMENTATION = "sdpa"  # Default; fall back to "eager" if errors
```

---

## 4. HuggingFace Ecosystem

### 4.1 Dataset Formats

**JSONL (streaming-friendly):**
```python
import json
with open("data.jsonl", "r", encoding="utf-8") as f:
    for line in f:
        obj = json.loads(line)
        text = obj.get("text", "")
```

**HF DatasetDict (save_to_disk / load_from_disk):**
```python
from datasets import Dataset, DatasetDict

# Save
ds = DatasetDict({"train": train_ds, "validation": val_ds})
ds.save_to_disk("/path/to/dataset")

# Load
ds = load_from_disk("/path/to/dataset")
```

**JSONL → DatasetDict:**
```python
ds = Dataset.from_json("data.jsonl")
```

### 4.2 HF Hub Upload

```python
from huggingface_hub import HfApi

api = HfApi()
api.upload_folder(
    folder_path="/kaggle/working/qwen-zolai-final",
    repo_id="peterpausianlian/zolai-qwen2.5-3b-lora",
    repo_type="model",
    path_in_repo="adapters/latest",
)
```

### 4.3 Gated Models

Some models (Gemma, Qwen) require accepting terms on HF Hub:
1. Go to model page on huggingface.co
2. Click "Agree" on terms
3. Use `HF_TOKEN` with read access

---

## 5. AI Model Usage on Kaggle

### 5.1 Local Models (GPU) — Full Comparison

#### Primary Recommendation: Qwen2.5-3B-Instruct ✅

**Why Qwen2.5 over Gemma 3/2 for Zolai:**

| Factor | Qwen2.5-3B | Gemma 3-4B | Gemma 2-2B |
|--------|-----------|-----------|-----------|
| **Tokenizer for unseen scripts** | BPE (150K vocab, excellent for low-resource) | SentencePiece (256K, but English-biased) | SentencePiece (256K, English-biased) |
| **Multilingual training** | 100+ languages, strong Asian/SE Asian coverage | 140+ languages, but shallow per-language | 140+ languages, shallow |
| **Fine-tuning responsiveness** | Excellent — adapts quickly to new morphology | Good, but needs more data to converge | Decent for 2B size |
| **4-bit VRAM on T4** | ~2 GB | ~2.5 GB | ~1.5 GB |
| **License** | Apache 2.0 (no restrictions) | Gemma Terms (restricts some commercial) | Gemma Terms (restrictive) |
| **Coding ability** | Strong (trained on massive code corpus) | Moderate | Weak |
| **Reasoning/teaching** | Strong | Strong | Moderate |
| **Context window** | 32K (native), 128K (extended) | 32K (Gemma 3), 8K (Gemma 2) | 8K |
| **Tokenizer OOV for Zolai** | Very low (BPE handles subword well) | Higher (SentencePiece struggles with rare morphemes) | Higher |
| **SFT/QLoRA community** | Massive — most tutorials use Qwen | Growing but smaller | Smaller |

**Key reasons Gemma 3/2 is NOT the best choice for Zolai:**

1. **Tokenizer mismatch** — Gemma uses SentencePiece trained primarily on high-resource languages. Zolai morphemes (ergative `in`, verb stems, OSV markers) get split into unnatural subword fragments, making fine-tuning less efficient. Qwen's BPE tokenizer handles unseen scripts and agglutinative morphology much better.

2. **License restrictions** — Gemma's license prohibits certain commercial uses and has usage caps. Qwen2.5 is Apache 2.0 — fully open.

3. **Training data bias** — Gemma models are heavily optimized for English and European languages. Qwen2.5 was trained on significantly more diverse multilingual data including Southeast Asian languages (closer to Zolai's typological family).

4. **Fine-tuning convergence** — Studies (IJECE 2026, Springer 2026) show Qwen2.5 converges faster on low-resource language tasks with fewer training steps, which matters on Kaggle's 12-hour session limit.

5. **Gemma 3 is very new** (released March 2026) — less community support, fewer QLoRA tutorials, potential bugs with bitsandbytes integration.

**When to use Gemma instead:**
- **Gemma 2-2B**: Good for quick back-translation tasks (lighter, faster inference)
- **Gemma 3-4B**: If you need better English reasoning and don't care about Zolai-specific morphology

#### All Local Models Ranked for Zolai

| Rank | Model | Size | 4-bit VRAM | Best For |
|------|-------|------|------------|----------|
| **1** | `Qwen/Qwen2.5-3B-Instruct` | 3B | ~2 GB | **Primary fine-tuning target** — best balance |
| **2** | `Qwen/Qwen2.5-7B-Instruct` | 7B | ~4 GB | Higher quality if T4 has headroom |
| **3** | `google/gemma-3-4b-it` | 4B | ~2.5 GB | Good alternative, better chat quality |
| **4** | `google/gemma-2-2b-it` | 2B | ~1.5 GB | Fast back-translation, not fine-tuning |
| **5** | `microsoft/Phi-4-mini-instruct` | 3.8B | ~2.5 GB | English-heavy tasks only |
| **6** | `meta-llama/Llama-3.2-3B-Instruct` | 3B | ~2 GB | General purpose (gated, weaker multilingual) |
| **7** | `Qwen/Qwen2.5-14B-Instruct` | 14B | ~8 GB | Best quality if P100/V100 available |

### 5.2 API Models (Internet Required)

#### GitHub Copilot API / GitHub Models ⭐ **New — Free with GitHub**

GitHub now offers a **free Models API** accessible with any GitHub account. This is the easiest way to access multiple models without managing separate API keys.

```python
import openai

# GitHub Models API (free with GitHub account)
client = openai.OpenAI(
    base_url="https://models.inference.ai.azure.com",
    api_key=UserSecretsClient().get_secret("GITHUB_TOKEN"),  # GitHub PAT
)

# Available models (check catalog for latest):
response = client.chat.completions.create(
    model="gpt-4o",           # Best quality
    # model="gpt-4o-mini",    # Fast, cheap
    # model="o3-mini",        # Reasoning
    # model="claude-sonnet-4", # Anthropic's latest
    # model="claude-opus-4",   # Most powerful
    # model="gemini-2.0-flash", # Google's fast model
    # model="gemini-2.5-pro",   # Google's best
    # model="meta-llama-3.3-70b-instruct",
    # model="mistral-large-2",
    # model="cohere-command-r-plus",
    messages=[{"role": "user", "content": "Your prompt"}],
    response_format={"type": "json_object"},
    temperature=0.1,
)
print(response.choices[0].message.content)
```

**GitHub Models Catalog** (as of 2026-04):
- **OpenAI**: gpt-4o, gpt-4o-mini, o3-mini
- **Anthropic**: claude-sonnet-4, claude-opus-4, claude-haiku
- **Google**: gemini-2.0-flash, gemini-2.5-pro, gemini-2.0-flash-lite
- **Meta**: meta-llama-3.3-70b-instruct, meta-llama-3.1-405b-instruct
- **Mistral**: mistral-large-2, codestral-latest
- **Cohere**: cohere-command-r-plus, cohere-command-r

**Advantages over separate APIs:**
- **Free** (generous rate limits with GitHub account)
- **One token** — no need for separate OpenAI/Google/Anthropic keys
- **All models** — access to 20+ models through a single OpenAI-compatible endpoint
- **No billing setup** — just your GitHub account

**Getting a GitHub Token:**
1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Create token with `github-models` scope
3. Add as Kaggle Secret: `GITHUB_TOKEN`

#### Gemini (Google AI Studio)

```python
import google.generativeai as genai
from kaggle_secrets import UserSecretsClient

api_key = UserSecretsClient().get_secret("GEMINI_API_KEY")
genai.configure(api_key=api_key)

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",  # Fast, cheap, good multilingual
    # model_name="gemini-2.5-pro",  # Best quality, reasoning
    system_instruction="You are a Zolai language expert...",
    generation_config={"response_mime_type": "application/json", "temperature": 0.1}
)
response = model.generate_content("Your prompt here")
```

#### OpenAI (Direct API)

```python
import openai
from kaggle_secrets import UserSecretsClient

client = openai.OpenAI(api_key=UserSecretsClient().get_secret("OPENAI_API_KEY"))
response = client.chat.completions.create(
    model="gpt-4o-mini",  # Fast, cheap
    # model="gpt-4o",     # Higher quality
    messages=[{"role": "user", "content": "Your prompt"}],
    response_format={"type": "json_object"},
)
```

#### OpenRouter (Multiple Models, Single API)

```python
import openai

client = openai.OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=UserSecretsClient().get_secret("OPENROUTER_API_KEY"),
)
response = client.chat.completions.create(
    model="anthropic/claude-3-haiku",  # or meta-llama/llama-3-70b-instruct
    messages=[...],
)
```

### 5.3 Model Selection Guide

| Task | Best Model | Why |
|------|-----------|-----|
| **Bulk text cleaning (2M+ rows)** | Gemini 2.0 Flash (GitHub Models) | Fast, cheap/free, JSON output |
| **Grammar correction (high quality)** | Gemini 2.5 Pro or Claude Sonnet 4 | Best reasoning for Zolai grammar |
| **Local back-translation** | Gemma 2B IT | Fits T4, fast inference |
| **Fine-tuning target** | Qwen2.5-3B-Instruct | Best tokenizer, multilingual, Apache 2.0 |
| **Code generation help** | GPT-4o or Claude Sonnet 4 (GitHub Models) | Best coding models |
| **Semantic similarity** | `all-MiniLM-L6-v2` | Local, fast, no API cost |
| **Teaching/explaining Zolai** | Claude Sonnet 4 or GPT-4o | Best at explanations |
| **Chat/conversation practice** | Qwen2.5-3B (fine-tuned) | Your own model, Zolai-specific |

### 5.4 API Model Cost Comparison (per 1M tokens)

| Model | Input | Output | Via |
|-------|-------|--------|-----|
| Gemini 2.0 Flash | Free (15 req/min) | Free | Google AI Studio |
| Gemini 2.5 Pro | $1.25 | $10.00 | Google AI Studio |
| GPT-4o-mini | $0.15 | $0.60 | OpenAI / GitHub Models |
| GPT-4o | $2.50 | $10.00 | OpenAI / GitHub Models |
| Claude Sonnet 4 | $3.00 | $15.00 | GitHub Models |
| Claude Opus 4 | $15.00 | $75.00 | GitHub Models |
| Llama 3.3 70B | Free | Free | GitHub Models |
| Mistral Large 2 | Free | Free | GitHub Models |

**Recommendation:** Use **GitHub Models** as your primary API — it's free and gives access to all major models. Set `GITHUB_TOKEN` as a Kaggle Secret and use the OpenAI-compatible endpoint.

---

## 6. Automation Recipes

### 6.1 Full Pipeline Automation Script

```python
#!/usr/bin/env python3
"""Automate the full Zolai pipeline: clean → combine → train."""
from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path

STAGING_DIR = Path("/kaggle/working/zolai_upload_staging")
DATASET_ID = "peterpausianlian/zolai-master-data"


def run_notebook(kernel_slug: str, wait: bool = True) -> str:
    """Trigger a Kaggle notebook run and optionally wait for completion."""
    subprocess.run(["kaggle", "kernels", "push", "-p", kernel_slug], check=True)
    if wait:
        result = subprocess.run(
            ["kaggle", "kernels", "status", "-k", kernel_slug],
            capture_output=True, text=True,
        )
        return result.stdout
    return "submitted"


def publish_dataset(output_dir: str, message: str) -> None:
    """Stage files and publish a Kaggle dataset version."""
    STAGING_DIR.mkdir(parents=True, exist_ok=True)

    metadata = {
        "id": DATASET_ID,
        "title": "Zolai cleaned corpus",
        "licenses": [{"name": "CC0-1.0"}],
    }
    with open(STAGING_DIR / "dataset-metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)

    # Copy output files
    out = Path(output_dir)
    if out.is_dir():
        for f in out.glob("*.jsonl"):
            subprocess.run(["cp", str(f), str(STAGING_DIR / f.name)], check=True)

    cmd = ["kaggle", "datasets", "version", "-p", str(STAGING_DIR), "-m", message]
    subprocess.run(cmd, check=True)


def check_disk_space(min_gb: float = 10.0) -> bool:
    """Check if /kaggle/working has enough free space."""
    import shutil
    du = shutil.disk_usage("/kaggle/working")
    free_gb = du.free / (1024 ** 3)
    print(f"Free disk: {free_gb:.1f} GB (need {min_gb:.1f} GB)")
    return free_gb >= min_gb


def main() -> int:
    if not check_disk_space():
        print("ERROR: Not enough disk space. Clean /kaggle/working first.")
        return 1

    # Step 1: Clean
    print("=== Step 1: Cleaning ===")
    run_notebook("peterpausianlian/zolai-cleaner-v2")

    # Step 2: Combine
    print("=== Step 2: Combining ===")
    run_notebook("peterpausianlian/zolai-dataset-combiner-v1")

    # Step 3: Publish dataset
    print("=== Step 3: Publishing dataset ===")
    publish_dataset("/kaggle/working/zolai_combine_out", "Auto-pipeline run")

    # Step 4: Train (GPU required)
    print("=== Step 4: Training ===")
    run_notebook("peterpausianlian/zolai-qwen-training-v2")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

### 6.2 Resume Training After Disconnect

```python
# In zolai-qwen-training-v2.ipynb config cell:
RESUME_FROM_CHECKPOINT = True  # Auto-finds latest checkpoint-*
TOTAL_MAX_STEPS = 10000        # Cumulative target (not incremental)

# After reconnect:
# 1. Restart session
# 2. Run all cells from top
# 3. Training resumes from last checkpoint automatically
```

### 6.3 Auto-Publish After Training

```python
# Add to end of zolai-qwen-training-v2.ipynb:
DO_KAGGLE_UPLOAD = True
KAGGLE_UPLOAD_INCLUDE_FINAL_ZIP = True
KAGGLE_UPLOAD_INCLUDE_CHECKPOINT_ZIPS = True
KAGGLE_VERSION_MESSAGE = "Qwen2.5-3B LoRA — trained 5000 steps"

# Uncomment the subprocess.run in the Zip cell to auto-publish
```

### 6.4 Monitor Long Runs

```bash
# In Kaggle terminal (View → Add terminal):
tail -f /kaggle/working/zolai_cleaner_out/pipeline.log
tail -f /kaggle/working/zolai_combine_out/combine_progress.log
```

---

## 7. Troubleshooting

### 7.1 Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `No space left on device` | `/kaggle/working` full | Delete old checkpoints, set `ZIP_CHECKPOINTS_FOR_DOWNLOAD=False` |
| `CUDA out of memory` | VRAM exceeded | Reduce `MAX_LENGTH`, `per_device_train_batch_size`, or use `gradient_checkpointing=True` |
| `HF_TOKEN not found` | Secret not set | Kaggle UI → Settings → Add-ons → Secrets → add `HF_TOKEN` |
| `Model not found` | Gated model, no token | Accept terms on HF Hub + set `HF_TOKEN` |
| `bitsandbytes import error` | Version mismatch | `pip install -U bitsandbytes` |
| `DDP hangs` | Process sync issue | Set `DATALOADER_NUM_WORKERS=0`, restart session |
| `nvidia-smi not found` | CPU-only session | Kaggle Settings → Accelerator → GPU T4 |

### 7.2 OOM Fixes (Priority Order)

1. Reduce `MAX_LENGTH` (512 → 256)
2. Reduce `per_device_train_batch_size` (1 is minimum)
3. Increase `gradient_accumulation_steps` (keep effective batch size)
4. Enable `gradient_checkpointing=True`
5. Disable `PACKING`
6. Reduce `save_total_limit` (3 → 1)
7. Delete old checkpoints: `rm -rf /kaggle/working/qwen-zolai/checkpoint-*`

### 7.3 Disk Space Fixes

1. `FORCE_RECOPY_DATASET=False` (skip re-copy)
2. `ZIP_CHECKPOINTS_FOR_DOWNLOAD=False`
3. Delete old zips: `rm /kaggle/working/*.zip`
4. Delete old checkpoints
5. Set `save_steps` higher (200 → 500)

---

## 8. Useful Links

| Resource | URL |
|----------|-----|
| Kaggle Docs | https://www.kaggle.com/docs |
| Kaggle API Docs | https://www.kaggle.com/docs/api |
| Kaggle GPU Tips | https://www.kaggle.com/docs/efficient-gpu-usage-tips |
| kagglehub GitHub | https://github.com/Kaggle/kagglehub |
| GitHub Models API | https://github.com/marketplace/models |
| GitHub Models Docs | https://docs.github.com/en/github-models |
| GitHub Copilot SDK | https://github.com/github/copilot-sdk |
| Transformers Docs | https://huggingface.co/docs/transformers |
| TRL Docs | https://huggingface.co/docs/trl |
| PEFT Docs | https://huggingface.co/docs/peft |
| BitsAndBytes Docs | https://huggingface.co/docs/bitsandbytes |
| Datasets Docs | https://huggingface.co/docs/datasets |
| Qwen2.5 Model | https://huggingface.co/Qwen/Qwen2.5-3B-Instruct |
| Qwen2.5-7B | https://huggingface.co/Qwen/Qwen2.5-7B-Instruct |
| Gemma 3 | https://huggingface.co/google/gemma-3-4b-it |
| Gemma 2 | https://huggingface.co/google/gemma-2-2b-it |
| Llama 3.2 | https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct |
| QLoRA Paper | https://arxiv.org/abs/2305.14314 |

---

## 10. Mistral OCR for PDF Extraction

### 10.1 Setup

```bash
pip install mistralai
export MISTRAL_API_KEY="your-key"  # Get from https://console.mistral.ai
# Or add to .env: MISTRAL_API_KEY=your-key
```

### 10.2 Why Mistral OCR

| Feature | Mistral OCR | Tesseract | PyMuPDF |
|---------|------------|-----------|---------|
| Handwritten text | ✅ Yes | ❌ No | ❌ No |
| Complex layouts | ✅ Multi-column, tables | ⚠️ Basic | ⚠️ Basic |
| Tables | ✅ HTML/Markdown output | ❌ No | ❌ No |
| Image extraction | ✅ With base64 | ❌ No | Manual |
| Headers/footers | ✅ Separate extraction | ❌ No | ❌ No |
| Scanned PDFs | ✅ Excellent | ⚠️ Needs training | ❌ No |
| Zolai/Tedim script | ✅ Vision model handles | ⚠️ Needs custom training | ❌ No |
| Cost | ~$0.0014/page | Free | Free |
| Speed | ~2-5s/page | Instant | Instant |

**Mistral OCR is best for:** Zolai lesson PDFs (scanned books, grammar volumes, dictionaries) because:
- Handles scanned/OCR'd content that PyMuPDF can't extract
- Preserves document structure (headers, tables, multi-column)
- Returns clean markdown for downstream processing
- Works with Zolai script without custom training

### 10.3 CLI Usage

```bash
# Single PDF
zolai ocr "data/external/lessons/Tan Lang.pdf" -o data/processed/lessons-ocr/

# Directory of PDFs (with resume)
zolai ocr "data/external/lessons/" --resume --sleep 3

# Dry run (see what would be processed)
zolai ocr "data/external/lessons/" --dry-run

# Extract headers/footers separately
zolai ocr "data/external/lessons/" --extract-header --extract-footer

# Save extracted images
zolai ocr "data/external/lessons/" --save-images
```

### 10.4 Python API

```python
from zolai.ocr.mistral_ocr import get_client, ocr_pdf, extract_markdown, extract_text

client = get_client()

# OCR a single PDF
response = ocr_pdf(client, Path("data/external/lessons/Tan Lang.pdf"))

# Get markdown output
markdown = extract_markdown(response)
print(markdown)

# Get plain text
text = extract_text(response)
print(text)

# Process entire directory
from zolai.ocr.mistral_ocr import process_directory
stats = process_directory(
    client,
    input_dir=Path("data/external/lessons/"),
    output_dir=Path("data/processed/lessons-ocr/"),
    resume=True,
    sleep=3.0,
)
print(f"Processed {stats['success']} files, {stats['pages']} pages")
```

### 10.5 Output Format

Each PDF produces 3 files:
- `filename.md` — Full markdown with page breaks
- `filename.txt` — Plain text (markdown stripped)
- `filename.ocr.json` — Metadata (pages, chars, usage, per-page info)

```json
{
  "source": "Tan Lang.pdf",
  "model": "mistral-ocr-latest",
  "pages": 45,
  "total_chars": 125000,
  "usage_info": {"prompt_tokens": 0, "completion_tokens": 0},
  "pages_detail": [
    {"index": 0, "chars": 2800, "dimensions": {"width": 612, "height": 792}}
  ]
}
```

### 10.6 Batch Processing (Large PDFs)

For large documents (100+ pages), use Mistral's Batch API for cost savings:

```python
from mistralai.client import Mistral

client = Mistral(api_key="your-key")

# Create batch job
batch = client.batch_jobs.create(
    model="mistral-ocr-latest",
    input_files=["file1.pdf", "file2.pdf"],
)

# Check status
status = client.batch_jobs.get(batch.id)
print(status.status)  # "pending", "running", "success", "failed"

# Download results
result = client.batch_jobs.get_result(batch.id)
```

### 10.7 Integration with Zolai Pipeline

```
PDFs (Zolai Lessons)
  ↓ Mistral OCR
Markdown (.md) + Text (.txt)
  ↓ V9 Standardizer
Cleaned Zolai text
  ↓ Dedup + Split
Training data → QLoRA fine-tuning
```

### 10.8 Current Zolai PDFs to OCR

| PDF | Size | Pages (est) | Content |
|-----|------|-------------|---------|
| `zolai-simbu-tan-li-sinna_compress.pdf` | 14 MB | ~100 | Zolai Simbu Lesson 5 |
| `zolai-simbu-tan-nih-sinna_compress.pdf` | 9.4 MB | ~80 | Zolai Simbu Lesson 2 |
| `zolai-simbu-tan-thum-sinna_compress.pdf` | 7.8 MB | ~70 | Zolai Simbu Lesson 3 |
| `zolai-simbu-tan-lang-sinna_compress.pdf` | 5.2 MB | ~50 | Zolai Simbu Lesson 1 |
| `zolai-simbu-tan-khat-sinna_compress.pdf` | 4.6 MB | ~45 | Zolai Simbu Lesson 4 |
| `2_Tone_Sandhi_in_Tedim_Zomi_Toponyms.pdf` | 496K | ~10 | Academic paper |
| `Zolai_Standard_Format.pdf` | 243K | ~8 | Format guide |
| `12_Zolai_Khantohsak_Nang_Hanciamnate_Pa.pdf` | 179K | ~5 | Grammar |
| `16_Zolai_Picinsak_Ding_Hanciam_Huai.pdf` | 140K | ~4 | Grammar |
| `19_Lia_leh_Taang_Vai_02A.pdf` | 109K | ~3 | Grammar |
| `20_Lia_leh_Taang_Vai_02B.pdf` | 116K | ~3 | Grammar |
| `13_Zomi_Nam_Ni_Vai_Dawnna.pdf` | 107K | ~3 | Cultural |
| `8_We_Are_Zomis_Poem.pdf` | 76K | ~2 | Poetry |
| `18_Lia_le_Taang_Vai_01.pdf` | 62K | ~2 | Grammar |

**Estimated cost:** ~500 pages × $0.0014 = ~$0.70 total

---

## 11. Update Checklist

When updating this file:

- [ ] Check latest `pip show <package>` versions in a fresh Kaggle session
- [ ] Verify Kaggle GPU availability (T4 ×2 still default?)
- [ ] Test new model releases for Zolai compatibility
- [ ] Update automation scripts if Kaggle API changes
- [ ] Add new troubleshooting entries as issues arise
- [ ] Update session limits if Kaggle changes quotas
- [ ] Check Mistral OCR pricing and model updates
