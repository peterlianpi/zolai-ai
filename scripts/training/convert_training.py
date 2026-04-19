#!/usr/bin/env python3
"""Convert all raw Zo_Tdm data to AI fine-tuning formats."""

import json
from pathlib import Path

PROJECT_ROOT = Path("/path/to/zolai/Documents/Projects/zo_tdm")
OUTPUT_DIR = PROJECT_ROOT / "data" / "training"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def load_jsonl(path):
    """Load JSONL file."""
    records = []
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            try:
                records.append(json.loads(line.strip()))
            except:
                pass
    return records


def extract_text(record):
    """Extract text from record."""
    for key in ["text", "zo_tdm", "input", "english", "output"]:
        if key in record and record[key]:
            return record[key]
    return ""


def convert_to_chatml(records, source_name):
    """Convert to ChatML format (Ollama/LLaMA)."""
    output = []
    for i, r in enumerate(records):
        text = extract_text(r)
        if not text or len(text) < 5:
            continue

        # Build ChatML format
        chatml = {
            "messages": [
                {"role": "system", "content": "You are a helpful Zo_Tdm language assistant."},
                {"role": "user", "content": f"Complete or translate this Zo_Tdm text: {text[:200]}"},
                {"role": "assistant", "content": text},
            ]
        }
        output.append(chatml)

    return output


def convert_to_qa(records, source_name):
    """Convert to Q&A format."""
    output = []
    for r in records:
        zo_tdm = r.get("zo_tdm", "")
        english = r.get("english", "") or r.get("translation", "")

        if zo_tdm and english:
            output.append({"instruction": f"Translate to English: {zo_tdm}", "input": zo_tdm, "output": english})
        elif zo_tdm:
            output.append({"instruction": "Complete this Zo_Tdm text:", "input": zo_tdm[:100], "output": zo_tdm})

    return output


def convert_to_plain(records, source_name):
    """Convert to plain text for continue training."""
    output = []
    for r in records:
        text = extract_text(r)
        if text and len(text) > 10:
            output.append({"text": text})
    return output


def convert_to_alpaca(records, source_name):
    """Convert to Alpaca format."""
    output = []
    for r in records:
        text = extract_text(r)
        if not text or len(text) < 5:
            continue

        # Create instruction-style entry
        entry = {
            "instruction": "Continue or complete this Zo_Tdm sentence:",
            "input": text[:150],
            "output": text,
            "source": source_name,
        }
        output.append(entry)

    return output


def main():
    stats = {}

    # Process each source directory
    sources = {
        "bible": PROJECT_ROOT / "raw" / "bible",
        "kaggle": PROJECT_ROOT / "raw" / "kaggle",
        "toolkit": PROJECT_ROOT / "raw" / "toolkit",
    }

    for src_name, src_dir in sources.items():
        if not src_dir.exists():
            continue

        print(f"\n{'=' * 50}")
        print(f"Processing: {src_name}")
        print(f"{'=' * 50}")

        all_records = []

        # Load all JSONL files from this source
        for jsonl_file in src_dir.glob("*.jsonl"):
            print(f"  Loading: {jsonl_file.name}")
            records = load_jsonl(jsonl_file)
            all_records.extend(records)
            print(f"    -> {len(records)} records")

        if not all_records:
            print("  No records found")
            continue

        print(f"\n  Total: {len(all_records)} records")

        # Convert to different formats
        formats = {
            "chatml": convert_to_chatml,
            "qa": convert_to_qa,
            "plain": convert_to_plain,
            "alpaca": convert_to_alpaca,
        }

        for fmt_name, convert_fn in formats.items():
            print(f"\n  Converting to {fmt_name}...")
            converted = convert_fn(all_records, src_name)

            if converted:
                output_file = OUTPUT_DIR / f"{src_name}_{fmt_name}.jsonl"
                with open(output_file, "w", encoding="utf-8") as f:
                    for item in converted:
                        f.write(json.dumps(item, ensure_ascii=False) + "\n")

                stats[f"{src_name}_{fmt_name}"] = len(converted)
                print(f"    -> {output_file.name} ({len(converted)} records)")

    # Create merged training file
    print(f"\n{'=' * 50}")
    print("Creating merged training files...")
    print(f"{'=' * 50}")

    merged_files = list(OUTPUT_DIR.glob("*_chatml.jsonl"))
    if merged_files:
        merged_records = []
        for mf in merged_files:
            merged_records.extend(load_jsonl(mf))

        # Limit to 500K for manageable size
        merged_records = merged_records[:500000]

        merged_file = OUTPUT_DIR / "train_merged.jsonl"
        with open(merged_file, "w", encoding="utf-8") as f:
            for item in merged_records:
                f.write(json.dumps(item, ensure_ascii=False) + "\n")

        print(f"  train_merged.jsonl: {len(merged_records)} records")

    print(f"\n✅ Training data saved to: {OUTPUT_DIR}")

    print("\n📊 Summary:")
    for name, count in sorted(stats.items()):
        print(f"  {name}: {count:,}")

    return stats


if __name__ == "__main__":
    main()
