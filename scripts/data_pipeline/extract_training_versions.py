#!/usr/bin/env python3
"""Extract and clean all training versions"""
import json
from pathlib import Path

archive = Path(str(Path(__file__).resolve().parents[2]) + "/data/archive/training_versions')
output = Path(str(Path(__file__).resolve().parents[2]) + "/data/training/master_all_versions.jsonl')

# Key files to extract from
sources = [
    'all_sources_clean_v6.jsonl',
    'all_sources_clean_v5.jsonl',
    'combine mater.jsonl',
    'hf_train.jsonl',
    'ollama_train.jsonl',
]

seen = set()
total = 0

print("Extracting from training_versions archive...\n")

with open(output, 'w') as fout:
    for source in sources:
        filepath = archive / source
        if not filepath.exists():
            continue
        
        print(f"Processing {source}...")
        count = 0
        
        with open(filepath, 'r') as fin:
            for line in fin:
                try:
                    obj = json.loads(line)
                    
                    # Extract text
                    if 'text' in obj:
                        text = obj['text']
                    elif 'instruction' in obj:
                        inst = obj['instruction']
                        out = obj.get('output', '')
                        text = f"### Instruction:\n{inst}\n\n### Response:\n{out}"
                    else:
                        continue
                    
                    # Validate
                    if not text or len(text) < 20:
                        continue
                    
                    if text in seen:
                        continue
                    
                    # Check if Zolai
                    zolai_markers = ['hi', 'in', 'na', 'kei', 'leh', 'ah', 'te', 'om', 'pai']
                    if not any(m in text.lower() for m in zolai_markers):
                        continue
                    
                    seen.add(text)
                    
                    record = {
                        'text': text,
                        'source': source,
                    }
                    
                    fout.write(json.dumps(record, ensure_ascii=False) + '\n')
                    count += 1
                    total += 1
                    
                except:
                    continue
        
        print(f"  Added {count:,} unique records")

print(f"\n✓ Total extracted: {total:,} unique records")
