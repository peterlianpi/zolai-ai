#!/usr/bin/env python3
"""Combine all corpus sources into single master"""
import json
from pathlib import Path

base = Path(str(Path(__file__).resolve().parents[2]) + "/data/corpus')

sources = [
    'corpus_master_v1.jsonl',
    'zo_sentences_v1.jsonl',
    'bible/bible_tb77_tedim_1977.jsonl',
    'bible/bible_tbr17_tedim_2017.jsonl',
    'bible/bible_tedim_2010.jsonl',
    'bible/bible_tdb_tedim_online.jsonl',
    'news/zomidaily_crawl_v1.jsonl',
    'news/tongsan_crawl_v1.jsonl',
    'news/rvasia_catholic_readings_v1.jsonl',
    'hymns/tedim_hymns_v1.jsonl',
    'synthetic/synthetic_all_v1.jsonl',
]

seen = set()
total = 0
output = base / 'corpus_unified_v1.jsonl'

print("Combining all corpus sources...\n")

with open(output, 'w') as fout:
    for source in sources:
        filepath = base / source
        if not filepath.exists():
            print(f"  ⚠ Skip {source} (not found)")
            continue
        
        print(f"  Processing {source}...")
        count = 0
        
        with open(filepath, 'r') as fin:
            for line in fin:
                try:
                    obj = json.loads(line)
                    text = obj.get('text', '')
                    
                    if not text or len(text) < 10:
                        continue
                    
                    if text in seen:
                        continue
                    
                    seen.add(text)
                    
                    # Normalize format
                    record = {
                        'text': text,
                        'source': source,
                    }
                    
                    # Preserve metadata
                    for key in ['dialect', 'reference', 'category', 'domain', 'book', 'chapter', 'verse']:
                        if key in obj:
                            record[key] = obj[key]
                    
                    fout.write(json.dumps(record, ensure_ascii=False) + '\n')
                    count += 1
                    total += 1
                    
                except:
                    continue
        
        print(f"    Added {count:,} unique records")

print(f"\n✓ Total unified: {total:,} unique records")
print(f"✓ Output: {output.name}")
