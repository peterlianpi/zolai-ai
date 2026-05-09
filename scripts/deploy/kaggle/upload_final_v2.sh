#!/bin/bash

export KAGGLE_API_TOKEN="KGAT_cb3a6cb758d32aa8bba418498b715287"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    UPLOADING DATASET & NOTEBOOK                           ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Update dataset
echo "📦 Updating dataset..."
cd kaggle_dataset
/home/peter/.local/bin/kaggle datasets version -m "Updated with complete training data" 2>&1 | tail -3
cd ..

echo ""
echo "📓 Creating notebook..."

# Create kernel metadata
mkdir -p kaggle_notebook_dir
cp kaggle_notebook.ipynb kaggle_notebook_dir/

cat > kaggle_notebook_dir/kernel-metadata.json << 'METAEOF'
{
  "id": "zolai-llm-finetuning-t4x2",
  "title": "Zolai LLM Fine-Tuning on T4x2",
  "code_file": "kaggle_notebook.ipynb",
  "language": "python",
  "kernel_type": "notebook",
  "is_private": false,
  "enable_gpu": true,
  "enable_tpu": false,
  "dataset_sources": [
    "peterpausianlian/zolai-llm-training-dataset"
  ],
  "docker_image_pinning": "python310"
}
METAEOF

# Upload notebook
cd kaggle_notebook_dir
/home/peter/.local/bin/kaggle kernels push -p . 2>&1 | tail -5
cd ..

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ Upload complete!"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Dataset: https://www.kaggle.com/datasets/peterpausianlian/zolai-llm-training-dataset"
echo "Notebook: https://www.kaggle.com/code/peterpausianlian/zolai-llm-finetuning-t4x2"
echo ""
echo "Next: Go to notebook and run training!"
echo ""
