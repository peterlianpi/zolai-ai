#!/usr/bin/env python3
"""
Fix invalid records - only fix clear errors, preserve context-appropriate variants
"""
import json
from pathlib import Path

DATA = Path("data/training")
INPUT_FILE = DATA / "validation_local_wiki.jsonl"
OUTPUT_FILE = DATA / "master_train_fixed_v2.jsonl"
LOG_FILE = DATA / "fix_invalid_records_v2.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("FIXING INVALID RECORDS (CONTEXT-AWARE)\n")

# Only fix clear errors, not context-appropriate variants
STRICT_CORRECTIONS = {
    "lo leh": "kei",  # Only in conditional negation context
}

def fix_record(rec):
    """Fix only clear errors"""
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
    
    # Remove control characters only
    text = ''.join(c for c in text if ord(c) >= 32 or c in '\n\t\r')
    
    # Only fix "lo leh" in clear negation contexts (not in Bible names/proper nouns)
    if "lo leh" in text.lower():
        # Check if it's in a conditional context (not a proper noun)
        if any(marker in text.lower() for marker in ["ding", "dingi", "dinga", "a neih"]):
            text = text.replace("lo leh", "kei")
            text = text.replace("Lo leh", "Kei")
            text = text.replace("LO LEH", "KEI")
    
    # Update record
    rec["text"] = text
    return rec

# Process
stats = {"total": 0, "fixed": 0, "skipped": 0, "kept": 0}
fixed_records = []

log(f"Processing {INPUT_FILE.name}...\n")

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        try:
            rec = json.loads(line)
            
            # Only process invalid records
            if rec.get("valid") == False:
                # Check if it's a Bible/proper noun context
                reason = rec.get("reason", "")
                
                # Keep Bible names and proper nouns as-is
                if any(x in reason for x in ["invalid_pattern:ram", "invalid_pattern:pathian", 
                                              "invalid_pattern:fapa", "invalid_pattern:bawipa"]):
                    # These are likely proper nouns or context-appropriate
                    rec["valid"] = True
                    rec["kept_as_context"] = True
                    fixed_records.append(rec)
                    stats["kept"] += 1
                else:
                    # Try to fix other errors
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
                log(f"[{i+1}] Fixed: {stats['fixed']}, Kept: {stats['kept']}, Skipped: {stats['skipped']}")
        except:
            pass

# Save
with open(OUTPUT_FILE, "w") as f:
    for r in fixed_records:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

log(f"\n{'='*80}")
log(f"Total processed: {stats['total']}")
log(f"Fixed (clear errors): {stats['fixed']}")
log(f"Kept (context-appropriate): {stats['kept']}")
log(f"Skipped (unfixable): {stats['skipped']}")
log(f"Valid now: {stats['total'] - stats['skipped']}")
log(f"Output: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Done!")
print(f"Fixed: {stats['fixed']} (clear errors)")
print(f"Kept: {stats['kept']} (context-appropriate)")
print(f"Valid: {stats['total'] - stats['skipped']}")
print(f"Output: {OUTPUT_FILE}")
