# Upload Instructions

## Option 1: Upload to HuggingFace (Recommended)

### Steps:
1. Go to: https://huggingface.co/datasets/new
2. Drag & drop files from `kaggle_bundle/data/`:
   - `zolai_train_full.jsonl` (444MB)
   - `zolai_val.jsonl` (665KB)
3. Set name: `zolai-training-bundle`
4. Set visibility: Public

### Or via CLI (after installing):
```bash
pip install huggingface_hub
huggingface-cli login
huggingface-cli upload_dataset peterpausianlian/zolai-training-bundle ./data/
```

## Option 2: Upload to Kaggle (Manual)

1. Download: `/home/peter/Documents/Projects/zolai/kaggle_bundle.zip`
2. Go to: https://www.kaggle.com/datasets/create
3. Upload the zip file

## Option 3: Google Drive

1. Upload `kaggle_bundle.zip` to Google Drive
2. Use gdown to download in Kaggle:
```python
!pip install gdown
!gdown --fuzzy YOUR_GOOGLE_DRIVE_LINK
```

## Option 4: Direct Download Link

After uploading to any platform, share the link for training.