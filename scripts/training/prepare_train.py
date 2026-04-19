#!/usr/bin/env python3
"""Simple training data preparation for Zo_Tdm."""

import json
from pathlib import Path

# Settings
TRAIN_FILE = "data/master/combined/sentences.jsonl"
VAL_FILE = "data/master/combined/parallel.jsonl"
OUTPUT_DIR = Path("runs/zo_tdm_v1")
SPLIT_RATIO = 0.02  # 2% for validation


def convert_format(input_path: Path, output_path: Path, max_lines: int = 0):
    """Convert to simple text format for training."""
    print(f"Converting: {input_path}")

    count = 0
    with open(input_path, "r", encoding="utf-8") as fin:
        with open(output_path, "w", encoding="utf-8") as fout:
            for line in fin:
                try:
                    record = json.loads(line.strip())
                    text = record.get("text", "")

                    # Extract Input/Response from instruction format
                    if "### Input:" in text and "### Response:" in text:
                        fout.write(text + "\n")
                        count += 1
                    elif text.strip():
                        fout.write(text + "\n")
                        count += 1
                    else:
                        # parallel format: zo/en fields
                        zo = record.get("zo", record.get("zolai", ""))
                        en = record.get("en", record.get("english", ""))
                        if zo and en:
                            fout.write(f"### Input: Translate to Zolai: {en}\n### Response: {zo}\n")
                            count += 1

                    if max_lines > 0 and count >= max_lines:
                        break
                except:
                    pass

    print(f"Written: {count} lines to {output_path}")
    return count


def main():
    # Create output directory
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Convert training data (limit to 100k for first run)
    train_output = OUTPUT_DIR / "train.txt"
    convert_format(Path(TRAIN_FILE), train_output, max_lines=100000)

    # Convert validation data
    val_output = OUTPUT_DIR / "val.txt"
    convert_format(Path(VAL_FILE), val_output, max_lines=5000)

    print(f"\n✅ Data prepared in {OUTPUT_DIR}/")
    print("   train.txt - Training data")
    print("   val.txt - Validation data")
    print("\nNext: Use Ollama to fine-tune")
    print(f"   ollama train --data {OUTPUT_DIR}/train.txt")


if __name__ == "__main__":
    main()
