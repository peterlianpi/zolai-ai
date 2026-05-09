#!/usr/bin/env python3
"""
Validate Master Dataset - Stream check for training quality
Run: python3 validate_master_dataset.py
"""
import json
from pathlib import Path
from collections import defaultdict

DATA = Path(__file__).parent / "data"
TRAIN_FILE = DATA / "training/master_train_complete.jsonl"
LOG = DATA / "training/validate_master.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG, "a") as f:
        f.write(msg + "\n")

LOG.write_text("")
log("\n" + "="*80)
log("VALIDATING MASTER DATASET")
log("="*80 + "\n")

# Validation rules
MIN_TEXT_LEN = 5
MAX_TEXT_LEN = 50000
SAMPLE_SIZE = 10000

stats = {
    "total": 0,
    "valid": 0,
    "invalid": 0,
    "missing_text": 0,
    "too_short": 0,
    "too_long": 0,
    "invalid_json": 0,
    "empty_fields": 0,
    "format_types": defaultdict(int),
}

log(f"[1/2] STREAMING VALIDATION ({SAMPLE_SIZE} samples)...\n")

try:
    with open(TRAIN_FILE, "r", encoding="utf-8") as f:
        for i, line in enumerate(f):
            if i >= SAMPLE_SIZE:
                break
            
            stats["total"] += 1
            
            try:
                rec = json.loads(line)
                
                # Detect format type
                if "instruction" in rec:
                    stats["format_types"]["instruction"] += 1
                    text = rec.get("output", "")
                elif "text" in rec:
                    stats["format_types"]["corpus"] += 1
                    text = rec.get("text", "")
                elif "headword" in rec:
                    stats["format_types"]["dictionary"] += 1
                    text = rec.get("headword", "")
                elif "zolai" in rec:
                    stats["format_types"]["parallel"] += 1
                    text = rec.get("zolai", "")
                else:
                    stats["format_types"]["unknown"] += 1
                    text = ""
                
                text = str(text).strip()
                
                # Validate
                if not text:
                    stats["missing_text"] += 1
                    stats["invalid"] += 1
                elif len(text) < MIN_TEXT_LEN:
                    stats["too_short"] += 1
                    stats["invalid"] += 1
                elif len(text) > MAX_TEXT_LEN:
                    stats["too_long"] += 1
                    stats["invalid"] += 1
                else:
                    stats["valid"] += 1
                
            except json.JSONDecodeError:
                stats["invalid_json"] += 1
                stats["invalid"] += 1
            except Exception as e:
                stats["invalid"] += 1
            
            if (i + 1) % 1000 == 0:
                pct = (i + 1) / SAMPLE_SIZE * 100
                log(f"  Processed: {i+1:,} records ({pct:.1f}%)")

except Exception as e:
    log(f"ERROR: {e}")

log(f"\n[2/2] ANALYSIS...\n")

# Calculate percentages
valid_pct = 100 * stats["valid"] / stats["total"] if stats["total"] > 0 else 0
invalid_pct = 100 * stats["invalid"] / stats["total"] if stats["total"] > 0 else 0

log(f"Total records sampled: {stats['total']:,}")
log(f"Valid records: {stats['valid']:,} ({valid_pct:.1f}%)")
log(f"Invalid records: {stats['invalid']:,} ({invalid_pct:.1f}%)\n")

log("Invalid breakdown:")
log(f"  • Missing text: {stats['missing_text']:,}")
log(f"  • Too short (<{MIN_TEXT_LEN}): {stats['too_short']:,}")
log(f"  • Too long (>{MAX_TEXT_LEN}): {stats['too_long']:,}")
log(f"  • Invalid JSON: {stats['invalid_json']:,}\n")

log("Format distribution:")
for fmt, count in sorted(stats["format_types"].items(), key=lambda x: -x[1]):
    pct = 100 * count / stats["total"]
    log(f"  • {fmt:15} {count:>8,} ({pct:5.1f}%)")

log("\n" + "="*80)
if valid_pct >= 95:
    log(f"✅ DATASET QUALITY: EXCELLENT ({valid_pct:.1f}% valid)")
    log("   Ready for training!")
elif valid_pct >= 85:
    log(f"⚠️  DATASET QUALITY: GOOD ({valid_pct:.1f}% valid)")
    log("   Acceptable for training with minor cleanup")
else:
    log(f"❌ DATASET QUALITY: POOR ({valid_pct:.1f}% valid)")
    log("   Needs significant cleanup before training")

log("="*80 + "\n")

print(f"\n✅ Validation complete!")
print(f"Log: data/training/validate_master.log")
