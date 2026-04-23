#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    KAGGLE UPLOAD INSTRUCTIONS                             ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if kaggle CLI is installed
if ! command -v kaggle &> /dev/null; then
    echo "❌ Kaggle CLI not found. Installing..."
    pip install -q kaggle
    echo "✓ Installed kaggle CLI"
fi

# Check credentials
if [ ! -f ~/.kaggle/kaggle.json ]; then
    echo ""
    echo "❌ Kaggle credentials not found!"
    echo ""
    echo "To set up:"
    echo "1. Go to: https://www.kaggle.com/settings/account"
    echo "2. Click 'Create New API Token'"
    echo "3. Save kaggle.json to ~/.kaggle/"
    echo "4. Run: chmod 600 ~/.kaggle/kaggle.json"
    echo ""
    exit 1
fi

echo "✓ Kaggle credentials found"
echo ""

# Create dataset
echo "📦 Creating Kaggle dataset..."
echo ""

DATASET_NAME="zolai-llm-training-dataset"
DATASET_DIR="kaggle_dataset"

# Check if dataset exists
if kaggle datasets list | grep -q "$DATASET_NAME"; then
    echo "Dataset already exists. Updating..."
    kaggle datasets version -m "Updated training data" "$DATASET_DIR"
else
    echo "Creating new dataset..."
    kaggle datasets create -p "$DATASET_DIR" --dir-mode zip
fi

echo ""
echo "✅ Dataset uploaded!"
echo ""
echo "Dataset URL: https://www.kaggle.com/datasets/$(kaggle config get username)/$DATASET_NAME"
echo ""

# Create notebook
echo "📓 Creating Kaggle notebook..."
echo ""

NOTEBOOK_NAME="zolai-llm-finetuning-t4x2"

# Check if notebook exists
if kaggle kernels list | grep -q "$NOTEBOOK_NAME"; then
    echo "Notebook already exists. Updating..."
    kaggle kernels push -p . -k "$NOTEBOOK_NAME"
else
    echo "Creating new notebook..."
    kaggle kernels push -p . -k "$NOTEBOOK_NAME"
fi

echo ""
echo "✅ Notebook created!"
echo ""
echo "Notebook URL: https://www.kaggle.com/code/$(kaggle config get username)/$NOTEBOOK_NAME"
echo ""

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                         NEXT STEPS                                        ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "1. Go to your notebook:"
echo "   https://www.kaggle.com/code/$(kaggle config get username)/$NOTEBOOK_NAME"
echo ""
echo "2. Edit notebook settings:"
echo "   - Accelerator: GPU T4x2"
echo "   - Persistence: Enable"
echo ""
echo "3. Add dataset as input:"
echo "   - Click 'Add input'"
echo "   - Select: $DATASET_NAME"
echo ""
echo "4. Run all cells"
echo ""
echo "5. Download results:"
echo "   - zolai_model.tar.gz (trained model)"
echo ""
