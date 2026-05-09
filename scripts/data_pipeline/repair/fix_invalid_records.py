#!/usr/bin/env python3
"""
Fix invalid records - correct dialect words and clean data
"""
import json
from pathlib import Path

DATA = Path("data/training")
INPUT_FILE = DATA / "validation_local_wiki.jsonl"
OUTPUT_FILE = DATA / "master_train_fixed.jsonl"
LOG_FILE = DATA / "fix_invalid_records.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("FIXING INVALID RECORDS\n")

# Dialect corrections
CORRECTIONS = {
    "ram": "gam",           # wrong dialect
    "pathian": "pasian",    # wrong dialect
    "fapa": "tapa",         # wrong dialect
    "bawipa": "kumpipa",    # wrong dialect
    "siangpahrang": "tua",  # wrong dialect
    "lo leh": "kei",        # wrong negation
}

def fix_record(rec):
    """Fix invalid record"""
    text = rec.get("text", "").strip()
    
    # Skip if no text
    if not text:
        return None
    
    # Skip if too long
    if len(text) > 50000:
        return None
    
    # Skip if too short
    if len(text) < 5:
        return None
    
    # Remove control characters
    text = ''.join(c for c in text if ord(c) >= 32 or c in '\n\t\r')
    
    # Fix dialect words
    text_lower = text.lower()
    for wrong, correct in CORRECTIONS.items():
        if wrong in text_lower:
            # Case-insensitive replacement
            text = text.replace(wrong, correct)
            text = text.replace(wrong.capitalize(), correct.capitalize())
            text = text.replace(wrong.upper(), correct.upper())
    
    # Update record
    rec["text"] = text
    return rec

# Process
stats = {"total": 0, "fixed": 0, "skipped": 0}
fixed_records = []

log(f"Processing {INPUT_FILE.name}...\n")

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        try:
            rec = json.loads(line)
            
            # Only process invalid records
            if rec.get("valid") == False:
                fixed = fix_record(rec)
                if fixed:
                    fixed["valid"] = True
                    fixed["fixed"] = True
                    fixed_records.append(fixed)
                    stats["fixed"] += 1
                else:
                    stats["skipped"] += 1
            else:
                # Keep valid records as-is
                fixed_records.append(rec)
            
            stats["total"] += 1
            
            if (i + 1) % 100000 == 0:
                log(f"[{i+1}] Fixed: {stats['fixed']}, Skipped: {stats['skipped']}")
        except:
            pass

# Save
with open(OUTPUT_FILE, "w") as f:
    for r in fixed_records:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

log(f"\n{'='*80}")
log(f"Total processed: {stats['total']}")
log(f"Fixed: {stats['fixed']}")
log(f"Skipped: {stats['skipped']}")
log(f"Output: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Done! Fixed {stats['fixed']} records")
print(f"Output: {OUTPUT_FILE}")
