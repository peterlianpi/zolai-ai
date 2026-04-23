# Kaggle Upload & Training Guide

## 📋 Prerequisites

1. **Kaggle Account** - https://www.kaggle.com
2. **Kaggle API Key** - https://www.kaggle.com/settings/account
3. **Kaggle CLI** - `pip install kaggle`

## 🔑 Setup Kaggle Credentials

```bash
# 1. Download API token from Kaggle
# Go to: https://www.kaggle.com/settings/account
# Click: "Create New API Token"

# 2. Save to ~/.kaggle/
mkdir -p ~/.kaggle
# Copy kaggle.json to ~/.kaggle/

# 3. Set permissions
chmod 600 ~/.kaggle/kaggle.json
```

## 📦 Upload Dataset

### Option 1: Automatic (Recommended)

```bash
cd /home/peter/Documents/Projects/zolai
chmod +x upload_to_kaggle.sh
./upload_to_kaggle.sh
```

### Option 2: Manual

**Step 1: Create Dataset**
```bash
cd kaggle_dataset
kaggle datasets create -p . --dir-mode zip
```

**Step 2: Create Notebook**
```bash
kaggle kernels push -p . -k zolai-llm-finetuning-t4x2
```

## 🚀 Run Training on Kaggle

### Step 1: Go to Notebook
```
https://www.kaggle.com/code/YOUR_USERNAME/zolai-llm-finetuning-t4x2
```

### Step 2: Configure Settings
- **Accelerator:** GPU T4x2
- **Persistence:** Enable
- **Internet:** Enable

### Step 3: Add Dataset Input
1. Click "Add input"
2. Select: "zolai-llm-training-dataset"
3. Click "Add"

### Step 4: Run All Cells
- Click "Run all"
- Training starts automatically
- Monitor progress in output

### Step 5: Download Results
- Model: `zolai_model.tar.gz`
- Logs: Training output
- Metrics: Evaluation results

## ⏱️ Training Timeline

| Phase | Time | Status |
|-------|------|--------|
| Setup | 5 min | ✓ |
| Load model | 10 min | ✓ |
| Tokenize | 15 min | ✓ |
| Training | ~28h | ⏳ |
| Save | 5 min | ✓ |
| **Total** | **~30h** | ✓ |

## 📊 Expected Results

- **Samples trained:** 500K
- **Model size:** ~7GB
- **VRAM used:** ~16GB
- **Training loss:** ~2.5 → ~1.8
- **Validation loss:** ~2.0 → ~1.5

## 🔍 Monitor Training

In notebook, check:
```python
# View training logs
!tail -50 /kaggle/working/zolai_llm_t4x2/training_log.txt

# Check GPU usage
!nvidia-smi

# View model size
!du -sh /kaggle/working/zolai_llm_t4x2/
```

## 💾 Download Model

After training completes:

```python
# In notebook
from IPython.display import FileLink
FileLink('/kaggle/working/zolai_model.tar.gz')
```

Or use Kaggle UI:
1. Click "Output" tab
2. Download `zolai_model.tar.gz`

## 🐛 Troubleshooting

### Out of Memory (OOM)
```python
# Reduce batch size
per_device_train_batch_size = 4

# Reduce sequence length
max_length = 128

# Enable gradient checkpointing
gradient_checkpointing = True
```

### Training Too Slow
```python
# Increase batch size
per_device_train_batch_size = 16

# Reduce eval frequency
eval_steps = 500

# Reduce logging
logging_steps = 200
```

### GPU Not Detected
```python
# Check GPU
!nvidia-smi

# Verify CUDA
import torch
print(torch.cuda.is_available())
print(torch.cuda.device_count())
```

## 📝 Files Included

```
kaggle_dataset/
├── llm_train.jsonl (1.8GB)
├── llm_val.jsonl (230MB)
├── llm_test.jsonl (230MB)
├── train_kaggle_t4x2.py
├── kaggle_notebook.ipynb
├── dataset-metadata.json
├── kernel-metadata.json
└── README.md
```

## ✅ Next Steps

1. Upload dataset to Kaggle
2. Create notebook
3. Configure T4x2 GPU
4. Run training
5. Download model
6. Evaluate results
7. Deploy as API

## 📞 Support

For issues:
- Check Kaggle notebook output
- Review training logs
- Adjust hyperparameters
- Reduce batch size if OOM

## 🎯 Success Criteria

✓ Dataset uploaded  
✓ Notebook created  
✓ Training started  
✓ Model saved  
✓ Results downloaded  

**Ready to train!** 🚀
