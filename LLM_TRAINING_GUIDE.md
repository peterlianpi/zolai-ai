# Zolai LLM Fine-Tuning Guide

> Last updated: 2026-04-20

## 📊 Dataset

**Training splits (v3):**
- Train: ~5,115,356 records (80%)
- Val: ~639,419 records (10%)
- Test: ~639,421 records (10%)

**Total: ~6.4M Zolai language examples**

Hosted on Hugging Face: [`peterpausianlian/zolai-llm-training-dataset`](https://www.kaggle.com/datasets/peterpausianlian/zolai-llm-training-dataset)

## 🚀 Quick Start

### 1. Install Dependencies (Pinned)

```bash
pip install torch==2.5.1+cu121 transformers==5.5.4 peft==0.19.1 trl==1.2.0 accelerate==1.13.0 bitsandbytes==0.49.2 datasets
```

### 2. Current Models

**Active training — zolai-qwen-0.5b (T4x2)**
```python
MODEL_NAME = "Qwen/Qwen2.5-0.5B-Instruct"
# Method: LoRA FP16, r=16, alpha=32
# Status: training at chunk 300k–800k of 5.1M
```

**Stable adapter — zolai-qwen2.5-3b-lora (single T4)**
```python
MODEL_NAME = "Qwen/Qwen2.5-3B-Instruct"
# Method: QLoRA 4-bit NF4, r=8, alpha=16
# Adapter: peterpausianlian/zolai-qwen2.5-3b-lora
```

### 3. Run Training

```bash
python scripts/training/train_kaggle_t4x2.py
```

**Training time:** ~30 hours per full pass on T4x2

### 4. Monitor Training

```bash
tensorboard --logdir data/runs/
```

## 📋 Training Configuration

### zolai-qwen-0.5b (Active)
- Base: Qwen2.5-0.5B-Instruct
- Method: LoRA FP16
- LoRA rank: 16, alpha: 32
- Training platform: Kaggle T4x2
- Script: `scripts/training/train_kaggle_t4x2.py`

### zolai-qwen2.5-3b-lora (Stable)
- Base: Qwen2.5-3B-Instruct
- Method: QLoRA 4-bit NF4
- LoRA rank: 8, alpha: 16
- Batch: 4×8, optimizer: paged_adamw_8bit
- Training platform: Kaggle single T4
- Notebook: `notebooks/zolai-llm-fine-tuning-on-t4x2.ipynb`

## 🎯 Expected Results

After fine-tuning:
- ✓ Fluent Zolai (Tedim ZVS) text generation
- ✓ ZVS dialect compliance (`pasian`, `gam`, `topa` — never `pathian`, `ram`, `bawipa`)
- ✓ Translation capability (ZO↔EN)
- ✓ Language learning assistant

## 📁 Output

Adapters pushed to Hugging Face Hub:
- `peterpausianlian/zolai-qwen-0.5b`
- `peterpausianlian/zolai-qwen2.5-3b-lora`

## 🔧 Session-Based Training (Kaggle)

Each Kaggle session processes a chunk of `llm_train.jsonl`:

```python
# UPDATE EACH SESSION in scripts/training/train_kaggle_t4x2.py:
CHUNK_START    = 300000   # current position
CHUNK_END      = 800000   # end of current range
RESUME_ADAPTER = "peterpausianlian/zolai-qwen-0.5b"  # None = fresh start
```

**Kaggle setup:**
1. Dataset: `peterpausianlian/zolai-llm-training-dataset`
2. Secrets: `HF_TOKEN`, `KAGGLE_KEY`
3. Accelerator: T4 x2 GPU
4. Script: `scripts/training/train_kaggle_t4x2.py`

### Hardware Tuning

For T4 (16GB each, x2):
```python
per_device_train_batch_size = 4
gradient_accumulation_steps = 8
max_length = 512
gradient_checkpointing = True
```

For A100 (80GB):
```python
per_device_train_batch_size = 32
gradient_accumulation_steps = 2
max_length = 1024
```

## 📊 Dataset Composition

- **Corpus:** ~90% (news, web, synthetic)
- **Bible:** ~4% (TB77, TBR17, Tedim2010 ↔ KJV)
- **Parallel pairs:** ~6% (105k+ ZO↔EN)
- **ORPO preference pairs:** alignment training set

**Language Levels (CEFR-tagged):**
- A1: 22.6%
- A2: 44.4%
- B1: 30.6%
- B2: 1.6%
- C1: 0.9%

## ✅ Next Steps

1. Complete chunk 300k–800k training for `zolai-qwen-0.5b`
2. Evaluate on test set: `python scripts/evaluate_model.py`
3. Merge adapter: `model.merge_and_unload()`
4. Export GGUF Q4 with llama.cpp
5. Deploy Gradio demo on HF Spaces
6. Integrate with FastAPI (`zolai/api/`)

## 📞 Support

For issues:
- Check training logs in `data/runs/`
- Review `wiki/training/llm_training_roadmap.md`
- Adjust batch size if OOM errors
