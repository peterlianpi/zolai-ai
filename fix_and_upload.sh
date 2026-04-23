#!/bin/bash

echo "Fixing Kaggle CLI upload..."
echo ""

# Get username from credentials
USERNAME=$(python3 -c "import json; print(json.load(open('~/.kaggle/kaggle.json'.replace('~', '$HOME')))['username'])")

echo "Username: $USERNAME"
echo ""

DATASET_DIR="kaggle_dataset"
DATASET_SLUG="$USERNAME/zolai-llm-training-dataset"

# Create proper metadata
cat > $DATASET_DIR/dataset-metadata.json << METAEOF
{
  "id": "zolai-llm-training-dataset",
  "ref": "$DATASET_SLUG",
  "title": "Zolai LLM Training Dataset",
  "subtitle": "6.4M Zolai language examples for fine-tuning",
  "description": "Complete Zolai language dataset with 6.4M records from Bible, corpus, dictionary, and parallel sources. Ready for LLM fine-tuning on Kaggle T4x2 GPUs.",
  "isPrivate": false,
  "licenses": [
    {
      "name": "CC0-1.0"
    }
  ],
  "keywords": [
    "zolai",
    "language",
    "nlp",
    "fine-tuning",
    "llm",
    "qwen",
    "lora"
  ]
}
METAEOF

echo "Metadata created:"
cat $DATASET_DIR/dataset-metadata.json
echo ""
echo ""

# Upload
echo "Uploading to Kaggle..."
cd $DATASET_DIR

kaggle datasets create -p . --dir-mode zip 2>&1 | tee upload.log

if grep -q "successfully created" upload.log || grep -q "Dataset created" upload.log; then
    echo ""
    echo "✅ Dataset created successfully!"
    echo "URL: https://www.kaggle.com/datasets/$DATASET_SLUG"
elif grep -q "already exists" upload.log; then
    echo ""
    echo "Dataset exists. Updating version..."
    kaggle datasets version -m "Updated training data" 2>&1
    echo "✅ Dataset updated!"
else
    echo ""
    echo "Upload output:"
    cat upload.log
fi

cd ..

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ Upload complete!"
echo "════════════════════════════════════════════════════════════════════════════"
