#!/bin/bash

echo "Preparing Kaggle dataset..."

# Create Kaggle dataset directory
mkdir -p kaggle_dataset

# Copy training files
cp data/training/llm_train.jsonl kaggle_dataset/
cp data/training/llm_val.jsonl kaggle_dataset/
cp data/training/llm_test.jsonl kaggle_dataset/

# Copy training script
cp train_kaggle_t4x2.py kaggle_dataset/

# Create README
cat > kaggle_dataset/README.md << 'READMEEOF'
# Zolai LLM Training Dataset

## Files
- llm_train.jsonl: 5.1M training records
- llm_val.jsonl: 639K validation records
- llm_test.jsonl: 639K test records
- train_kaggle_t4x2.py: Training script

## Usage
1. Upload to Kaggle Datasets
2. Use in notebook with: /kaggle/input/zolai-dataset/
3. Run: python3 train_kaggle_t4x2.py

## Dataset Info
- Total: 6.4M Zolai language examples
- Language levels: A1-C1
- Sources: Bible, corpus, dictionary, parallel
- Format: JSONL (text, dialect, level, source_type, pos)

## Training
- Model: Qwen 7B Chat
- Hardware: T4x2 (30h limit)
- Samples: 500K
- Epochs: 1
- Batch size: 8
- Learning rate: 2e-4
READMEEOF

# Create archive
tar -czf zolai_kaggle_dataset.tar.gz kaggle_dataset/

echo "✅ Kaggle dataset prepared!"
echo "Files in: kaggle_dataset/"
echo "Archive: zolai_kaggle_dataset.tar.gz"
echo ""
echo "Next steps:"
echo "1. Create Kaggle dataset: https://www.kaggle.com/datasets/create"
echo "2. Upload kaggle_dataset/ folder"
echo "3. Create notebook and use /kaggle/input/zolai-dataset/"
