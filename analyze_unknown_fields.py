#!/usr/bin/env python3
"""
Analyze unknown/missing fields in master dataset
Run: python3 analyze_unknown_fields.py
"""
import json
from pathlib import Path
from collections import defaultdict, Counter

DATA = Path(__file__).parent / "data"
TRAIN_FILE = DATA / "training/master_train_complete.jsonl"
LOG = DATA / "training/analyze_unknown.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG, "a") as f:
        f.write(msg + "\n")

LOG.write_text("")
log("\n" + "="*80)
log("ANALYZING UNKNOWN/MISSING FIELDS")
log("="*80 + "\n")

# Track all fields and their values
field_stats = defaultdict(lambda: {"count": 0, "values": Counter(), "missing": 0})
sample_records = defaultdict(list)

log("[1/2] SCANNING DATASET...\n")

try:
    with open(TRAIN_FILE, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= 50000:  # Sample 50k records
                break
            
            rec = json.loads(line)
            
            # Track all fields
            for key, value in rec.items():
                field_stats[key]["count"] += 1
                
                if value is None or value == "" or value == []:
                    field_stats[key]["missing"] += 1
                else:
                    # Store sample values
                    val_str = str(value)[:50]  # Truncate for display
                    field_stats[key]["values"][val_str] += 1
            
            # Store sample records
            if i < 10:
                sample_records["samples"].append(rec)
            
            if (i + 1) % 10000 == 0:
                log(f"  Scanned: {i+1:,} records")

except Exception as e:
    log(f"ERROR: {e}")

log(f"\n[2/2] FIELD ANALYSIS...\n")

# Sort by frequency
sorted_fields = sorted(field_stats.items(), key=lambda x: -x[1]["count"])

log(f"Total fields found: {len(sorted_fields)}\n")

for field, stats in sorted_fields:
    count = stats["count"]
    missing = stats["missing"]
    missing_pct = 100 * missing / count if count > 0 else 0
    
    log(f"\n{field}:")
    log(f"  • Present: {count:,} ({100*count/50000:.1f}%)")
    log(f"  • Missing/Empty: {missing:,} ({missing_pct:.1f}%)")
    
    if stats["values"]:
        log(f"  • Sample values:")
        for val, cnt in stats["values"].most_common(3):
            log(f"    - {val} ({cnt}x)")

# Identify "unknown" values
log(f"\n" + "="*80)
log("UNKNOWN/MISSING PATTERNS")
log("="*80 + "\n")

unknown_patterns = {
    "source": [],
    "dialect": [],
    "pos": [],
    "category": [],
    "tags": [],
}

for field, stats in sorted_fields:
    if stats["missing"] > 0:
        missing_pct = 100 * stats["missing"] / stats["count"]
        if missing_pct > 10:  # More than 10% missing
            log(f"⚠️  {field}: {missing_pct:.1f}% missing/empty")

log(f"\n" + "="*80)
log("SAMPLE RECORDS (First 3)")
log("="*80 + "\n")

for i, rec in enumerate(sample_records["samples"][:3], 1):
    log(f"\nRecord {i}:")
    log(json.dumps(rec, indent=2, ensure_ascii=False)[:500])

print(f"\n✅ Analysis complete!")
print(f"Log: data/training/analyze_unknown.log")
