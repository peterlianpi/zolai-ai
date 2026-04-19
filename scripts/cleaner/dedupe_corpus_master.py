#!/usr/bin/env python3
"""Deduplicate corpus master file"""
import json
from pathlib import Path

input_file = Path(str(Path(__file__).resolve().parents[2]) + "/data/corpus/corpus_master_v1.jsonl')
output_file = Path(str(Path(__file__).resolve().parents[2]) + "/data/corpus/corpus_master_deduped.jsonl')

seen = set()
kept = 0
duplicates = 0
errors = 0

print(f"Deduplicating {input_file.name}...")

with open(input_file, 'r') as fin, open(output_file, 'w') as fout:
    for i, line in enumerate(fin):
        try:
            obj = json.loads(line)
            text = obj.get('text', '')
            
            if not text:
                errors += 1
                continue
            
            if text in seen:
                duplicates += 1
                continue
            
            seen.add(text)
            fout.write(line)
            kept += 1
            
            if kept % 100000 == 0:
                print(f"  Processed: {kept:,} kept, {duplicates:,} duplicates")
                
        except Exception as e:
            errors += 1

print(f"\nFinal:")
print(f"  Kept: {kept:,}")
print(f"  Duplicates: {duplicates:,}")
print(f"  Errors: {errors:,}")
