# Zolai Training Bundle

Training bundle for Zolai (Tedim) language model on Kaggle T4 GPU.

## Data Format

Line-by-line JSONL:
```json
{"text": "Zolai sentence here"}
```

## Files

| File | Entries | Size | Description |
|------|---------|------|-------------|
| `zolai_train.jsonl` | 100,000 | 22MB | Training data |
| `zolai_val.jsonl` | 5,000 | 665KB | Validation data |

## Sources

- TB77 Bible translation
- Judson 1835 Bible
- Tedim 1932 Bible
- Luther 1912 Bible
- zolai-toolkit corpus
- Kaggle LCEA dataset

**Total unique: 2,247,330 → Sampled 100k for training**

## Training

### Model: Qwen2-1.5B

```python
# Config (T4 x2)
per_device_train_batch_size: 4
learning_rate: 2e-4
num_train_epochs: 2
lora_r: 16
max_seq_length: 256
```

### Quick Start

1. Upload files to Kaggle input
2. Run `scripts/kaggle_notebook.py`
3. Use GPU T4 x2 runtime

### Requirements

```bash
pip install transformers peft bitsandbytes accelerate datasets
```

## Output

Trained model saved to `/kaggle/working/zolai-model/`

## Data Validation

- All 100,000 entries valid
- All entries contain "text" field with Zolai text
- No empty entries