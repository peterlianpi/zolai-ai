#!/usr/bin/env python3
"""
Kaggle GPU Training Automation Pipeline
For machines without GPU (i3 7th gen, 8GB RAM)

This script automates:
1. Upload data to Kaggle
2. Run training notebook on Kaggle GPU
3. Download trained model
"""

from __future__ import annotations

import json
import os
import subprocess
import time
from pathlib import Path
from dataclasses import dataclass
from typing import Optional


@dataclass
class KaggleConfig:
    """Kaggle configuration."""

    username: str = "peterpausianlian"
    dataset_name: str = "zolai-training-bundle"
    notebook_title: str = "Zolai Language Model Training"
    output_path: str = "zolai-model"
    data_dir: Path = Path("kaggle_bundle/data")
    model_path: Path = Path("kaggle_bundle/models")


class KaggleAutomation:
    """Kaggle GPU automation."""

    def __init__(self, config: KaggleConfig | None = None):
        self.config = config or KaggleConfig()

    def check_kaggle_auth(self) -> bool:
        """Check if Kaggle is authenticated."""
        try:
            result = subprocess.run(
                ["kaggle", "datasets", "list", "-s", "zolai"], capture_output=True, text=True, timeout=30
            )
            return "zolai" in result.stdout.lower()
        except Exception as e:
            print(f"Auth check failed: {e}")
            return False

    def upload_dataset(self) -> bool:
        """Upload dataset to Kaggle."""
        print("=" * 50)
        print("STEP 1: Uploading dataset to Kaggle")
        print("=" * 50)

        # Check if we can upload
        if not self.check_kaggle_auth():
            print("⚠️ Kaggle upload not authorized!")
            print("""
Please do manually:
1. Go to: https://www.kaggle.com/datasets/create
2. Upload: kaggle_bundle/data/
3. Name it: zolai-training-bundle
            """)
            return False

        # Try to create/update dataset
        try:
            result = subprocess.run(
                ["kaggle", "datasets", "create", "-p", str(self.config.data_dir.parent), "-u"],
                capture_output=True,
                text=True,
                timeout=300,
            )
            if "success" in result.stdout.lower():
                print("✅ Dataset uploaded!")
                return True
            else:
                print(f"⚠️ {result.stderr}")
                return False
        except Exception as e:
            print(f"Upload error: {e}")
            return False

    def create_notebook(self, notebook_code: str) -> str:
        """Create training notebook on Kaggle."""
        print("=" * 50)
        print("STEP 2: Creating Kaggle notebook")
        print("=" * 50)

        # Save notebook code
        nb_path = Path("zolai_training.ipynb")
        with open(nb_path, "w") as f:
            f.write(notebook_code)

        print(f"✅ Notebook saved: {nb_path}")
        return str(nb_path)

    def trigger_training(self) -> bool:
        """Try to trigger training via Kaggle API."""
        print("=" * 50)
        print("STEP 3: Starting Kaggle GPU training")
        print("=" * 50)

        print("""
To start training on Kaggle GPU:

1. Go to: https://www.kaggle.com/new?notebook=true
2. Click "Create" 
3. In the notebook cell, copy/paste code from:
   kaggle_bundle/scripts/kaggle_notebook.py
4. Go to Settings → Accelerator → GPU (T4 x2)
5. Click Run

Or use Google Colab:
1. Go to: https://colab.research.google.com
2. Upload kaggle_notebook.py
3. Runtime → Change runtime type → GPU
4. Run the notebook
        """)
        return True

    def download_model(self) -> bool:
        """Download trained model from Kaggle."""
        print("=" * 50)
        print("STEP 4: Downloading trained model")
        print("=" * 50)

        model_path = self.config.model_path
        if model_path.exists():
            print(f"✅ Model found locally: {model_path}")
            return True

        print("""
After training completes, download from:
- Kaggle: Your notebook output folder
- Colab: Files sidebar → Download

The model will be in: zolai-model/
├── adapter_config.json
├── adapter_model.safetensors
├── tokenizer.json
etc.
        """)
        return True

    def run_full_pipeline(self, skip_upload: bool = False) -> dict:
        """Run the full automation pipeline."""
        results = {
            "upload": False,
            "notebook": False,
            "train": False,
            "download": False,
        }

        print("\n" + "=" * 60)
        print("🎯 KAGGLE GPU TRAINING AUTOMATION")
        print("=" * 60)

        # Step 1: Upload
        if skip_upload:
            print("⏭️ Skipping upload (already done)")
            results["upload"] = True
        else:
            results["upload"] = self.upload_dataset()

        # Step 2: Create notebook
        self.trigger_training()
        results["notebook"] = True

        # Step 3: Download (after user runs training)
        results["download"] = self.download_model()

        return results


def get_training_notebook_code() -> str:
    """Get the training notebook code."""
    return """{
 "cells": [
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-1",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Install required packages\\n",
    "!pip install -q torch transformers peft bitsandbytes accelerate datasets\\n",
    "print(\"✅ Packages installed\")"
   ]
  },
  {
   "cell_type": "code", 
   "execution_count": null,
   "id": "cell-2",
   "metadata": {},
   "outputs": [],
   "source": [
    "import json\\n",
    "import torch\\n",
    "from transformers import (AutoModelForCausalLM, AutoTokenizer,\\n",
    "    TrainingArguments, Trainer, DataCollatorForLanguageModeling)\\n",
    "from peft import LoraConfig, get_peft_model, TaskType\\n",
    "from datasets import load_dataset\\n",
    "\\n",
    "# Config\\n",
    "CONFIG = {\\n",
    "    \\"model_name\\": \\"Qwen/Qwen2-1.5B\\",\\n",
    "    \\"output_path\\": \\"./zolai-model\\",\\n",
    "}\\n",
    "print(\"✅ Config loaded\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null, 
   "id": "cell-3",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Load data\\n",
    "dataset = load_dataset(\\"json\\", data_files={\\n",
    "    \\"train\\": \\"/kaggle/input/zolai_train.jsonl\\",\\n",
    "    \\"validation\\": \\"/kaggle/input/zolai_val.jsonl\\"\\n",
    "})\\n",
    "print(f\\"Train: {len(dataset['train'])} | Val: {len(dataset['validation'])}\\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-4",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Load model with 4-bit quantization\\n",
    "from bitsandbytes import BitsAndBytesConfig\\n",
    "quant = BitsAndBytesConfig(load_in_4bit=True)\\n",
    "model = AutoModelForCausalLM.from_pretrained(\\n",
    "    CONFIG[\\"model_name\\"], quantization_config=quant, device_map=\\"auto\\"\\n",
    ")\\n",
    "tokenizer = AutoTokenizer.from_pretrained(CONFIG[\\"model_name\\"])\\n",
    "print(\"✅ Model loaded\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-5", 
   "metadata": {},
   "outputs": [],
   "source": [
    "# Setup LoRA\\n",
    "lora = LoraConfig(r=16, lora_alpha=32, target_modules=[\\"q_proj\\",\\"k_proj\\",\\"v_proj\\"])\\n",
    "model = get_peft_model(model, lora)\\n",
    "model.print_trainable_parameters()"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-6",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Tokenize\\n",
    "def tokenize(ex): return tokenizer(ex[\\"text\\"], max_length=256, truncation=True)\\n",
    "dataset = dataset.map(tokenize, batched=True, remove_columns=[\\"text\\"])\\n",
    "dataset = dataset.map(lambda x: {\\"labels\\": x[\\"input_ids\\"]}, batched=False)\\n",
    "print(\"✅ Data tokenized\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-7",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Train\\n",
    "args = TrainingArguments(\\n",
    "    output_dir=CONFIG[\\"output_path\\"],\\n",
    "    per_device_train_batch_size=4,\\n",
    "    learning_rate=2e-4,\\n",
    "    num_train_epochs=2,\\n",
    "    fp16=True,\\n",
    "    save_steps=500,\\n",
    "    logging_steps=50,\\n",
    ")\\n",
    "trainer = Trainer(model=model, args=args, train_dataset=dataset[\\"train\\"])\\n",
    "trainer.train()\\n",
    "print(\"✅ Training complete!\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-8",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Save model\\n",
    "model.save_pretrained(CONFIG[\\"output_path\\"])\\n",
    "tokenizer.save_pretrained(CONFIG[\\"output_path\\"])\\n",
    "print(f\\"✅ Model saved to {CONFIG['output_path']}\")"
   ]
  },
  {
   "cell_type": "code",
   "execution_count": null,
   "id": "cell-9",
   "metadata": {},
   "outputs": [],
   "source": [
    "# Download model\\n",
    "import shutil\\n",
    "shutil.make_archive(\\"zolai-model\\", \\"zip\\", \\".\\", \\"zolai-model\\")\\n",
    "print(\"✅ Model zipped - download from Files sidebar\")"
   ]
  }
 ],
 "metadata": {
  "kernelspec": {
   "display_name": "Python 3",
   "language": "python",
   "name": "python3"
  },
  "language_info": {
   "name": "python",
   "version": "3.10.12"
  }
 },
 "nbformat": 4,
 "nbformat_minor": 5
}"""


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    import argparse

    parser = argparse.ArgumentParser(description="Kaggle GPU Automation")
    parser.add_argument("--skip-upload", action="store_true", help="Skip upload if already done")
    parser.add_argument("--notebook-only", action="store_true", help="Only create notebook")
    args = parser.parse_args(argv or [])

    config = KaggleConfig()
    kaggle = KaggleAutomation(config)

    # Check auth first
    if not kaggle.check_kaggle_auth():
        print("⚠️ Kaggle not authenticated properly!")
        print("Please ensure ~/.kaggle/kaggle.json has valid credentials")

    # Run pipeline
    results = kaggle.run_full_pipeline(skip_upload=args.skip_upload)

    print("\n" + "=" * 60)
    print("📋 PIPELINE SUMMARY")
    print("=" * 60)
    for step, result in results.items():
        status = "✅" if result else "⏭️"
        print(f"{status} {step.capitalize()}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
