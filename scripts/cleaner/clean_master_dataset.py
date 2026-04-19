#!/usr/bin/env python3
"""Clean and deduplicate master training dataset"""
import json
import re
from pathlib import Path

def is_zolai_text(text):
    """Check if text is primarily Zolai"""
    # Common non-Zolai patterns
    if re.search(r'\b(the|and|is|are|was|were|have|has|been|will|would|could|should)\b', text.lower()):
        return False
    if re.search(r'\b(der|die|das|und|ist|sind|war|waren)\b', text.lower()):
        return False
    # Must have Zolai markers
    zolai_markers = ['hi', 'in', 'na', 'kei', 'leh', 'ah', 'te', 'uh', 'om', 'pai']
    return any(marker in text.lower() for marker in zolai_markers)

def is_valid_record(obj):
    """Check if record is valid"""
    text = obj.get('text', '').strip()
    
    # Empty or too short
    if len(text) < 20:
        return False
    
    # Incomplete instruction template
    if text.endswith('#') or '###' in text and len(text) < 50:
        return False
    
    # URLs
    if 'http://' in text or 'https://' in text:
        return False
    
    # Navigation/menu text
    if re.search(r'(POLITICS|HEALTH|ARTICLE|INTERVIEW|Sign in|Log into)', text):
        return False
    
    # Check language
    if not is_zolai_text(text):
        return False
    
    return True

def clean_dataset(input_file, output_file):
    """Clean and deduplicate dataset"""
    seen = set()
    valid = 0
    skipped = 0
    duplicates = 0
    
    with open(input_file, 'r') as fin, open(output_file, 'w') as fout:
        for line in fin:
            try:
                obj = json.loads(line)
            except:
                skipped += 1
                continue
            
            if not is_valid_record(obj):
                skipped += 1
                continue
            
            text = obj['text']
            if text in seen:
                duplicates += 1
                continue
            
            seen.add(text)
            fout.write(json.dumps(obj, ensure_ascii=False) + '\n')
            valid += 1
            
            if valid % 100000 == 0:
                print(f"Processed: {valid} valid, {skipped} skipped, {duplicates} duplicates")
    
    print(f"\nFinal: {valid} valid records")
    print(f"Skipped: {skipped} invalid")
    print(f"Duplicates: {duplicates}")
    return valid

if __name__ == '__main__':
    base = Path(str(Path(__file__).resolve().parents[2]) + "/data/training')
    
    print("Cleaning train split...")
    clean_dataset(base / 'llm_train.jsonl', base / 'train_clean.jsonl')
    
    print("\nCleaning val split...")
    clean_dataset(base / 'llm_val.jsonl', base / 'val_clean.jsonl')
    
    print("\nCleaning test split...")
    clean_dataset(base / 'llm_test.jsonl', base / 'test_clean.jsonl')
