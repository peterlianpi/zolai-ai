#!/usr/bin/env python3
"""
Zolai Language Model Fine-tuning for Kaggle (T4 x2 GPU)
Optimized for 2x T4 (16GB VRAM total)
"""

from __future__ import annotations

import os
import json
import argparse
from pathlib import Path


def get_install_commands():
    """Return pip install commands for Kaggle."""
    return """\
pip install -q torch transformers datasets peft accelerate bitsandbytes
pip install -q -U transformers datasets
pip install -q scipy
""".strip()


def get_training_config() -> dict:
    """Training configuration optimized for 2x T4."""
    return {
        # Model settings
        "model_name": "Qwen/Qwen2-1.5B",
        "base_model": "qwen2:1.5b",
        # Training hyperparameters (T4 x2 optimized)
        "per_device_train_batch_size": 4,
        "per_device_eval_batch_size": 8,
        "gradient_accumulation_steps": 4,
        "learning_rate": 2e-4,
        "num_train_epochs": 2,
        "max_steps": 10000,
        "warmup_steps": 500,
        "weight_decay": 0.01,
        # LoRA settings (memory efficient)
        "lora_r": 16,
        "lora_alpha": 32,
        "lora_dropout": 0.05,
        "target_modules": ["q_proj", "k_proj", "v_proj", "o_proj", "gate_proj"],
        # Quantization (4-bit for memory savings)
        "load_in_4bit": True,
        "bnb_4bit_compute_dtype": "float16",
        "bnb_4bit_use_double_quant": True,
        "bnb_4bit_quant_type": "nf4",
        # Other settings
        "logging_steps": 10,
        "save_steps": 500,
        "eval_steps": 500,
        "fp16": True,
        "gradient_checkpointing": True,
    }


def main(argv: list[str] | None = None) -> int:
    """Main entry point."""
    parser = argparse.ArgumentParser(description="Zolai Training Script")
    parser.add_argument("--data-dir", type=Path, default=Path("/kaggle/input"))
    parser.add_argument("--output-dir", type=Path, default=Path("/kaggle/working output"))
    parser.add_argument("--model", type=str, default="Qwen/Qwen2-1.5B")
    args = parser.parse_args(argv or [])

    print("=" * 50)
    print("ZOLAI LANGUAGE MODEL TRAINING")
    print("=" * 50)
    print(f"Data: {args.data_dir}")
    print(f"Model: {args.model}")
    print(f"Output: {args.output_dir}")
    print()
    print("Config:", json.dumps(get_training_config(), indent=2))
    print()
    print("To run on Kaggle, use this as your training notebook code.")
    print("See scripts/kaggle_notebook.py for full implementation.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
