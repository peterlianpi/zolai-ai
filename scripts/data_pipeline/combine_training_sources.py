#!/usr/bin/env python3
"""Combine all training sources into single master file"""
import json
from pathlib import Path

def combine_sources():
    base = Path(str(Path(__file__).resolve().parents[2]) + "/data/training')
    
    sources = [
        ('llm_train.jsonl', 'main'),
        ('instructions_v1.jsonl', 'instructions'),
        ('zo_en_pairs_train_v1.jsonl', 'parallel'),
    ]
    
    seen = set()
    total = 0
    
    with open(base / 'train_combined.jsonl', 'w') as fout:
        for filename, source_type in sources:
            filepath = base / filename
            if not filepath.exists():
                continue
            
            print(f"Processing {filename}...")
            count = 0
            
            with open(filepath, 'r') as fin:
                for line in fin:
                    try:
                        obj = json.loads(line)
                        
                        # Handle different formats
                        if 'text' in obj:
                            text = obj['text']
                        elif 'instruction' in obj:
                            # Convert instruction format to text
                            text = f"### Instruction:\n{obj['instruction']}\n\n### Response:\n{obj.get('output', '')}"
                            obj['text'] = text
                        else:
                            continue
                        
                        if not text or len(text) < 20:
                            continue
                        
                        if text in seen:
                            continue
                        
                        seen.add(text)
                        obj['source_file'] = filename
                        fout.write(json.dumps(obj, ensure_ascii=False) + '\n')
                        count += 1
                        total += 1
                        
                    except:
                        continue
            
            print(f"  Added {count:,} records")
    
    print(f"\nTotal combined: {total:,} unique records")
    return total

if __name__ == '__main__':
    combine_sources()
