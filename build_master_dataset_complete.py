#!/usr/bin/env python3
"""
Build Master Dataset - COMPLETE (Training + Dictionary + Parallel + Corpus)
Run: python3 build_master_dataset_complete.py
"""
import json
from pathlib import Path
from datetime import datetime
import hashlib

DATA = Path(__file__).parent / "data"
LOG = DATA / "training/build_master_complete.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG, "a") as f:
        f.write(msg + "\n")

LOG.write_text("")
log("\n" + "="*80)
log("BUILDING MASTER DATASET - COMPLETE (All Files)")
log("="*80 + "\n")

# Stage 1: Collect ALL files
log("[1/4] COLLECTING ALL FILES...")
files = (
    list((DATA / "training").glob("*.jsonl")) +
    list((DATA / "dictionary/processed").glob("*.jsonl")) +
    list((DATA / "dictionary/raw").glob("*.jsonl")) +
    list((DATA / "parallel").glob("*.jsonl")) +
    list((DATA / "corpus").glob("*.jsonl"))
)
files = [f for f in files if not f.name.startswith("master_")]

log(f"  Found: {len(files)} files")
log(f"  • Training: {len(list((DATA / 'training').glob('*.jsonl')))}")
log(f"  • Dictionary: {len(list((DATA / 'dictionary/processed').glob('*.jsonl'))) + len(list((DATA / 'dictionary/raw').glob('*.jsonl')))}")
log(f"  • Parallel: {len(list((DATA / 'parallel').glob('*.jsonl')))}")
log(f"  • Corpus: {len(list((DATA / 'corpus').glob('*.jsonl')))}\n")

# Stage 2: Load and deduplicate
log("[2/4] LOADING AND DEDUPLICATING...")
seen = set()
records = []
duplicates = 0
total = 0

for i, f in enumerate(sorted(files), 1):
    count = 0
    try:
        with open(f, "r", encoding="utf-8") as fp:
            for line in fp:
                try:
                    rec = json.loads(line)
                    total += 1
                    text = (rec.get("text") or rec.get("content") or 
                           rec.get("zo") or rec.get("zolai") or "")
                    text = str(text).strip()
                    
                    if len(text) > 3:
                        h = hashlib.md5(text.encode()).hexdigest()
                        if h not in seen:
                            seen.add(h)
                            records.append(rec)
                            count += 1
                        else:
                            duplicates += 1
                except:
                    pass
    except Exception as e:
        log(f"  Error: {f.name}: {e}")
    
    pct = i / len(files) * 100
    log(f"  [{i:2d}/{len(files)}] {f.name:40} {count:>8,} unique ({pct:5.1f}%)")

log(f"\n  Total input: {total:,} records")
log(f"  Unique: {len(records):,} records")
log(f"  Duplicates: {duplicates:,} ({100*duplicates/total:.1f}%)\n")

# Stage 3: Write unified
log("[3/4] WRITING UNIFIED DATASET...")
out_all = DATA / "training/master_unified_all_complete.jsonl"
with open(out_all, "w", encoding="utf-8") as f:
    for rec in records:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

size = out_all.stat().st_size / (1024**2)
log(f"  ✓ {out_all.name} ({len(records):,} records, {size:.1f}MB)\n")

# Stage 4: Create splits
log("[4/4] CREATING SPLITS...")
n = len(records)
train_n = int(n * 0.8)
val_n = int(n * 0.1)
test_n = n - train_n - val_n

with open(DATA / "training/master_train_complete.jsonl", "w", encoding="utf-8") as f:
    for rec in records[:train_n]:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
log(f"  ✓ master_train_complete.jsonl ({train_n:,} records)")

with open(DATA / "training/master_val_complete.jsonl", "w", encoding="utf-8") as f:
    for rec in records[train_n:train_n+val_n]:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
log(f"  ✓ master_val_complete.jsonl ({val_n:,} records)")

with open(DATA / "training/master_test_complete.jsonl", "w", encoding="utf-8") as f:
    for rec in records[train_n+val_n:]:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")
log(f"  ✓ master_test_complete.jsonl ({test_n:,} records)\n")

# Create manifest
manifest = {
    "generated_at": datetime.now().isoformat(),
    "option": "complete",
    "description": "All files (Training + Dictionary + Parallel + Corpus)",
    "total_records": len(records),
    "duplicates_removed": duplicates,
    "deduplication_rate": f"{100*duplicates/total:.1f}%",
    "splits": {
        "train": train_n,
        "val": val_n,
        "test": test_n,
    },
    "total_size_mb": size,
}

with open(DATA / "training/master_unified_manifest_complete.json", "w") as f:
    json.dump(manifest, f, indent=2)
log(f"  ✓ master_unified_manifest_complete.json")

# Summary
log("\n" + "="*80)
log("✅ MASTER DATASET GENERATION COMPLETE")
log("="*80)
log(f"\nGenerated files:")
log(f"  • master_unified_all_complete.jsonl    {len(records):>12,} records")
log(f"  • master_train_complete.jsonl          {train_n:>12,} records (80%)")
log(f"  • master_val_complete.jsonl            {val_n:>12,} records (10%)")
log(f"  • master_test_complete.jsonl           {test_n:>12,} records (10%)")
log(f"  • master_unified_manifest_complete.json")
log(f"\nStatistics:")
log(f"  • Deduplication: {100*duplicates/total:.1f}% removed")
log(f"  • Total size: {size:.1f}MB")
log(f"  • Option: Complete (All files)")
log("="*80 + "\n")

print("\n✅ COMPLETE!")
print(f"Log: data/training/build_master_complete.log")
