#!/usr/bin/env python3
"""Upload to Kaggle using API"""
import os
import json
from pathlib import Path
from kaggle.api.kaggle_api_extended import KaggleApi

# Initialize API
api = KaggleApi()
api.authenticate()

print("✓ Kaggle API authenticated\n")

# Get username
username = api.config_dict.get('username')
print(f"Username: {username}\n")

# Dataset info
DATASET_DIR = Path("kaggle_dataset")
DATASET_SLUG = f"{username}/zolai-llm-training-dataset"

print(f"Dataset: {DATASET_SLUG}\n")

# Create dataset metadata
metadata = {
    "id": "zolai-llm-training-dataset",
    "ref": DATASET_SLUG,
    "title": "Zolai LLM Training Dataset",
    "subtitle": "6.4M Zolai language examples for fine-tuning",
    "description": "Complete Zolai language dataset with 6.4M records from Bible, corpus, dictionary, and parallel sources. Ready for LLM fine-tuning on Kaggle T4x2 GPUs.",
    "isPrivate": False,
    "licenses": [{"name": "CC0-1.0"}],
    "keywords": ["zolai", "language", "nlp", "fine-tuning", "llm", "qwen", "lora"]
}

# Save metadata
with open(DATASET_DIR / "dataset-metadata.json", "w") as f:
    json.dump(metadata, f, indent=2)

print("Uploading dataset...\n")

try:
    # Create new dataset
    api.dataset_create_new(
        folder=str(DATASET_DIR),
        public=True,
        quiet=False,
        convert_to_csv=False,
        dir_mode="zip"
    )
    print("\n✅ Dataset created successfully!")
    print(f"URL: https://www.kaggle.com/datasets/{DATASET_SLUG}")
except Exception as e:
    if "already exists" in str(e):
        print("Dataset already exists. Updating...\n")
        try:
            api.dataset_create_version(
                folder=str(DATASET_DIR),
                version_notes="Updated training data",
                quiet=False,
                convert_to_csv=False,
                dir_mode="zip"
            )
            print("\n✅ Dataset updated successfully!")
        except Exception as e2:
            print(f"❌ Error updating: {e2}")
    else:
        print(f"❌ Error: {e}")

print("\n" + "="*80)
print("NEXT: Create notebook on Kaggle")
print("="*80)
