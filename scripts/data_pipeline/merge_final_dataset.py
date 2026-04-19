#!/usr/bin/env python3
"""Merge current clean data with extracted versions"""
import json
from pathlib import Path
import random

base = Path(str(Path(__file__).resolve().parents[2]) + "/data/training')

sources = [
    'llm_train.jsonl',
    'llm_val.jsonl',
    'llm_test.jsonl',
    'master_all_versions.jsonl',
]

seen = set()
all_records = []

print("Merging all training sources...\n")

for source in sources:
    filepath = base / source
    if not filepath.exists():
        continue
    
    print(f"Processing {source}...")
    count = 0
    
    with open(filepath, 'r') as f:
        for line in f:
            try:
                obj = json.loads(line)
                text = obj.get('text', '')
                
                if not text or len(text) < 20:
                    continue
                
                if text in seen:
                    continue
                
                seen.add(text)
                all_records.append(obj)
                count += 1
                
            except:
                continue
    
    print(f"  Added {count:,} unique records")

print(f"\n✓ Total unique: {len(all_records):,}")

# Shuffle and split
random.seed(42)
random.shuffle(all_records)

total = len(all_records)
train_size = int(total * 0.8)
val_size = int(total * 0.1)

train = all_records[:train_size]
val = all_records[train_size:train_size + val_size]
test = all_records[train_size + val_size:]

print(f"\nSplitting:")
print(f"  Train: {len(train):,}")
print(f"  Val: {len(val):,}")
print(f"  Test: {len(test):,}")

# Write final files
for split_name, split_data in [('train', train), ('val', val), ('test', test)]:
    output = base / f'final_{split_name}.jsonl'
    with open(output, 'w') as f:
        for record in split_data:
            f.write(json.dumps(record, ensure_ascii=False) + '\n')
    print(f"  Wrote final_{split_name}.jsonl")

print(f"\n✓ Final dataset ready")
