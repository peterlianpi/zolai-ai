import json
import random
from pathlib import Path

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_complete_all_resources.jsonl"
TRAIN_FILE = DATA / "llm_train.jsonl"
VAL_FILE = DATA / "llm_val.jsonl"
TEST_FILE = DATA / "llm_test.jsonl"
LOG_FILE = DATA / "training_splits.log"

LOG_FILE.write_text("")

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

log("CREATING TRAINING SPLITS (80/10/10)\n")

# Load all records
records = []
with open(INPUT_FILE, "r") as f:
    for line in f:
        records.append(json.loads(line))

log(f"Total records: {len(records):,}\n")

# Shuffle
random.seed(42)
random.shuffle(records)

# Split
train_size = int(0.8 * len(records))
val_size = int(0.1 * len(records))

train_records = records[:train_size]
val_records = records[train_size:train_size + val_size]
test_records = records[train_size + val_size:]

log(f"Train: {len(train_records):,} ({100*len(train_records)/len(records):.1f}%)")
log(f"Val:   {len(val_records):,} ({100*len(val_records)/len(records):.1f}%)")
log(f"Test:  {len(test_records):,} ({100*len(test_records)/len(records):.1f}%)\n")

# Save splits
def save_split(records, filepath, name):
    with open(filepath, "w") as f:
        for i, rec in enumerate(records):
            rec["split"] = name
            f.write(json.dumps(rec, ensure_ascii=False) + "\n")
    log(f"Saved {name}: {filepath}")

save_split(train_records, TRAIN_FILE, "train")
save_split(val_records, VAL_FILE, "val")
save_split(test_records, TEST_FILE, "test")

log(f"\n{'='*80}")
log("✅ Training splits created!")
log(f"{'='*80}")

print(f"\n✅ Created training splits!")
print(f"Train: {len(train_records):,}")
print(f"Val:   {len(val_records):,}")
print(f"Test:  {len(test_records):,}")
