#!/usr/bin/env python3
"""Full cleanup and consolidation of training directory"""
import json
from pathlib import Path
from collections import defaultdict

def convert_to_text_format(obj):
    """Convert any format to text format"""
    if 'text' in obj:
        return obj['text']
    elif 'instruction' in obj:
        inst = obj['instruction']
        inp = obj.get('input', '')
        out = obj.get('output', '')
        if inp:
            return f"### Instruction:\n{inst}\n\n### Input:\n{inp}\n\n### Response:\n{out}"
        else:
            return f"### Instruction:\n{inst}\n\n### Response:\n{out}"
    return None

def consolidate_all():
    base = Path(str(Path(__file__).resolve().parents[2]) + "/data/training')
    
    # All potential sources
    sources = [
        'llm_train.jsonl',
        'llm_val.jsonl', 
        'llm_test.jsonl',
        'master.jsonl',
        'snapshots/training_v11_base.jsonl',
        'snapshots/training_v11_cefr.jsonl',
        'snapshots/training_v11_tagged.jsonl',
    ]
    
    seen_texts = set()
    all_records = []
    stats = defaultdict(int)
    
    print("Reading all sources...")
    for source in sources:
        filepath = base / source
        if not filepath.exists():
            continue
        
        print(f"  Processing {source}...")
        count = 0
        
        with open(filepath, 'r') as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    text = convert_to_text_format(obj)
                    
                    if not text or len(text) < 20:
                        stats['too_short'] += 1
                        continue
                    
                    if text in seen_texts:
                        stats['duplicates'] += 1
                        continue
                    
                    seen_texts.add(text)
                    
                    # Normalize to text format
                    record = {
                        'text': text,
                        'source_file': source,
                    }
                    
                    # Preserve useful metadata
                    for key in ['dialect', 'level', 'source_type', 'pos', 'category', 'domain']:
                        if key in obj:
                            record[key] = obj[key]
                        elif 'metadata' in obj and key in obj['metadata']:
                            record[key] = obj['metadata'][key]
                    
                    all_records.append(record)
                    count += 1
                    
                except Exception as e:
                    stats['errors'] += 1
        
        print(f"    Added {count:,} unique records")
        stats['total_processed'] += count
    
    print(f"\nTotal unique records: {len(all_records):,}")
    print(f"Duplicates removed: {stats['duplicates']:,}")
    print(f"Too short: {stats['too_short']:,}")
    print(f"Errors: {stats['errors']:,}")
    
    # Split into train/val/test (80/10/10)
    import random
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
    
    # Write consolidated files
    print("\nWriting consolidated files...")
    
    for split_name, split_data in [('train', train), ('val', val), ('test', test)]:
        output = base / f'consolidated_{split_name}.jsonl'
        with open(output, 'w') as f:
            for record in split_data:
                f.write(json.dumps(record, ensure_ascii=False) + '\n')
        print(f"  Wrote {output.name}")
    
    return len(all_records)

if __name__ == '__main__':
    consolidate_all()
