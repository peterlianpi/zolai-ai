#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    KAGGLE DATASET UPLOAD - FINAL                          ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check Kaggle CLI
echo "Checking Kaggle CLI..."
/home/peter/.local/bin/kaggle --version
echo ""

# Get username
USERNAME=$(/home/peter/.local/bin/kaggle config view | grep username | cut -d' ' -f3)
echo "Username: $USERNAME"
echo ""

DATASET_DIR="kaggle_dataset"
DATASET_SLUG="$USERNAME/zolai-llm-training-dataset"

# Create metadata with correct format
cat > $DATASET_DIR/dataset-metadata.json << METAEOF
{
  "title": "Zolai LLM Training Dataset",
  "id": "$DATASET_SLUG",
  "licenses": [
    {
      "name": "CC0-1.0"
    }
  ],
  "resources": [
    {
      "path": "llm_train.jsonl",
      "description": "Training data - 5.1M records"
    },
    {
      "path": "llm_val.jsonl",
      "description": "Validation data - 639K records"
    },
    {
      "path": "llm_test.jsonl",
      "description": "Test data - 639K records"
    }
  ]
}
METAEOF

echo "Metadata created"
echo ""

# Try upload
echo "Uploading dataset..."
cd $DATASET_DIR

/home/peter/.local/bin/kaggle datasets create -p . --dir-mode zip -q 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Dataset created!"
    echo "URL: https://www.kaggle.com/datasets/$DATASET_SLUG"
else
    echo "Trying to update existing dataset..."
    /home/peter/.local/bin/kaggle datasets version -m "Updated training data" -q 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ Dataset updated!"
    else
        echo "⚠️ Upload failed. Use web upload instead:"
        echo "  https://www.kaggle.com/datasets/create"
    fi
fi

cd ..

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ Done!"
echo "════════════════════════════════════════════════════════════════════════════"
