#!/bin/bash

export KAGGLE_API_TOKEN="KGAT_cb3a6cb758d32aa8bba418498b715287"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    UPLOADING DATASET & NOTEBOOK                           ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Upload dataset
echo "📦 Uploading dataset..."
cd kaggle_dataset
/home/peter/.local/bin/kaggle datasets create -p . --dir-mode zip 2>&1 | grep -E "successfully|created|error|Error"
cd ..

echo ""
echo "📓 Uploading notebook..."

# Create kernel metadata
cat > kaggle_notebook_meta.json << 'METAEOF'
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
/home/peter/.local/bin/kaggle kernels push -p . -k zolai-llm-finetuning-t4x2 2>&1 | grep -E "successfully|created|error|Error|Kernel"

echo ""
echo "════════════════════════════════════════════════════════════════════════════"
echo "✅ Upload complete!"
echo "════════════════════════════════════════════════════════════════════════════"
echo ""
echo "Dataset: https://www.kaggle.com/datasets/peterpausianlian/zolai-llm-training-dataset"
echo "Notebook: https://www.kaggle.com/code/peterpausianlian/zolai-llm-finetuning-t4x2"
echo ""
