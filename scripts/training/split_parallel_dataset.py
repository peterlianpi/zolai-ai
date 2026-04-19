import json
import random


def split_and_validate(input_path: str, train_path: str, val_path: str):
    """
    Splits the synthesized dataset into training and validation sets.
    """
    with open(input_path, "r", encoding="utf-8") as f:
        data = [json.loads(line) for line in f]

    random.seed(42)
    random.shuffle(data)

    split_idx = int(len(data) * 0.95)  # 95% Train, 5% Val
    train_data = data[:split_idx]
    val_data = data[split_idx:]

    # Save Train
    with open(train_path, "w", encoding="utf-8") as f:
        for entry in train_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    # Save Val
    with open(val_path, "w", encoding="utf-8") as f:
        for entry in val_data:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    print(f"Split complete: {len(train_data)} Train, {len(val_data)} Val.")


if __name__ == "__main__":
    input_file = "/path/to/zolai/Documents/Projects/zo_tdm/data/zo_tdm_parallel_master.jsonl"
    train_file = "/path/to/zolai/Documents/Projects/zo_tdm/data/zo_tdm_parallel_train.jsonl"
    val_file = "/path/to/zolai/Documents/Projects/zo_tdm/data/zo_tdm_parallel_val.jsonl"
    split_and_validate(input_file, train_file, val_file)
