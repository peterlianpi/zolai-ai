import argparse
import json
import random


def run_cli_reviewer(input_file, sample_size=10):
    dataset = []
    with open(input_file, 'r', encoding='utf-8') as f:
        for line in f:
            if line.strip():
                dataset.append(json.loads(line))

    if not dataset:
        print("Dataset is empty.")
        return

    sample = random.sample(dataset, min(sample_size, len(dataset)))

    print("\n=== Zo_Tdm Human-in-the-Loop CLI Reviewer ===")
    print(f"Reviewing a random sample of {len(sample)} sentences.\n")

    for i, item in enumerate(sample):
        print(f"--- Example {i+1} / {len(sample)} ---")
        print(f"[1] Original English Intent (Estimated): {item.get('text', 'N/A')}") # Assuming original tech seed had text as source
        print(f"[2] Broken Zo_Tdm: {item.get('text', 'N/A')}")
        print(f"[3] LLM Fixed Zo_Tdm: {item.get('fixed_zo_tdm', 'N/A')}")
        print(f"[4] LLM Back-Translation: {item.get('back_translation', 'N/A')}")
        print(f"[5] Errors LLM Found: {', '.join(item.get('errors_found', []))}")
        print("-" * 40)

        # Simple interactive pause
        input("Press Enter to view next (or Ctrl+C to quit)...")

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="resources/tech_seed_data_fixed.jsonl")
    parser.add_argument("--samples", type=int, default=10)
    args = parser.parse_args()

    run_cli_reviewer(args.input, args.samples)
