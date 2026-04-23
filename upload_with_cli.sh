#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    UPLOADING TO KAGGLE WITH CLI                           ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

USERNAME=$(kaggle config get username)
echo "Username: $USERNAME"
echo ""

DATASET_DIR="kaggle_dataset"
DATASET_SLUG="$USERNAME/zolai-llm-training-dataset"

echo "Dataset: $DATASET_SLUG"
echo ""

# Update metadata with correct ref
cat > $DATASET_DIR/dataset-metadata.json << METAEOF
{
  "id": "zolai-llm-training-dataset",
  "ref": "$DATASET_SLUG",
  "title": "Zolai LLM Training Dataset",
  "subtitle": "6.4M Zolai language examples for fine-tuning",
  "description": "Complete Zolai language dataset with 6.4M records from Bible, corpus, dictionary, and parallel sources. Ready for LLM fine-tuning on Kaggle T4x2 GPUs.",
  "isPrivate": false,
  "licenses": [{"name": "CC0-1.0"}],
  "keywords": ["zolai", "language", "nlp", "fine-tuning", "llm", "qwen", "lora"]
}
METAEOF

echo "Uploading dataset..."
echo ""

cd $DATASET_DIR

# Try to create new dataset
kaggle datasets create -p . --dir-mode zip 2>&1 | tee upload.log

if grep -q "successfully created" upload.log; then
    echo ""
    echo "✅ Dataset created!"
    echo "URL: https://www.kaggle.com/datasets/$DATASET_SLUG"
elif grep -q "already exists" upload.log; then
    echo ""
    echo "Dataset exists. Updating..."
    kaggle datasets version -m "Updated training data" 2>&1
    echo "✅ Dataset updated!"
else
    echo ""
    echo "⚠️ Check upload.log for details"
fi

cd ..

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ Upload complete!"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Next: Create notebook on Kaggle"
echo "  https://www.kaggle.com/code/create"
echo ""
