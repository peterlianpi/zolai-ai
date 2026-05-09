#!/usr/bin/env python3
"""Quick audit - sample-based analysis"""
import json
from pathlib import Path
from collections import Counter
import random

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_production.jsonl"
REPORT_FILE = DATA / "quick_audit_report.txt"

REPORT_FILE.write_text("")

def log(msg):
    print(msg, flush=True)
    with open(REPORT_FILE, "a") as f:
        f.write(msg + "\n")

log("QUICK AUDIT - SAMPLE-BASED ANALYSIS\n")

# Count total lines
total = 0
with open(INPUT_FILE, "r") as f:
    for _ in f:
        total += 1

log(f"Total records: {total:,}\n")

# Sample 10K records
sample_size = min(10000, total)
sample_indices = set(random.sample(range(total), sample_size))

stats = {
    "dialect": Counter(),
    "level": Counter(),
    "source": Counter(),
    "pos": Counter(),
    "text_len": [],
    "issues": Counter(),
}

log(f"Sampling {sample_size:,} records...\n")

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        if i not in sample_indices:
            continue
        
        try:
            rec = json.loads(line)
            text = rec.get("text", "")
            
            stats["dialect"][rec.get("dialect", "unknown")] += 1
            stats["level"][rec.get("language_level", "unknown")] += 1
            stats["source"][rec.get("source_type", "unknown")] += 1
            stats["pos"][rec.get("pos", "unknown")] += 1
            stats["text_len"].append(len(text))
            
            if not text:
                stats["issues"]["empty"] += 1
            if len(text) < 5:
                stats["issues"]["too_short"] += 1
            if len(text) > 50000:
                stats["issues"]["too_long"] += 1
        except:
            stats["issues"]["parse_error"] += 1

# Report
log(f"{'='*80}")
log("SAMPLE STATISTICS (10K records)\n")

log("Dialect:")
for d, c in stats["dialect"].most_common():
    pct = 100 * c / sample_size
    log(f"  {d}: {c} ({pct:.1f}%)")

log("\nLanguage Level:")
for l, c in stats["level"].most_common():
    pct = 100 * c / sample_size
    log(f"  {l}: {c} ({pct:.1f}%)")

log("\nSource Type:")
for s, c in stats["source"].most_common():
    pct = 100 * c / sample_size
    log(f"  {s}: {c} ({pct:.1f}%)")

log("\nPOS:")
for p, c in stats["pos"].most_common():
    pct = 100 * c / sample_size
    log(f"  {p}: {c} ({pct:.1f}%)")

if stats["text_len"]:
    avg_len = sum(stats["text_len"]) / len(stats["text_len"])
    log(f"\nText Length:")
    log(f"  Min: {min(stats['text_len'])}")
    log(f"  Max: {max(stats['text_len'])}")
    log(f"  Avg: {avg_len:.0f}")

log(f"\nQuality Issues:")
if stats["issues"]:
    for issue, count in stats["issues"].most_common():
        log(f"  {issue}: {count}")
else:
    log("  None detected ✓")

log(f"\n{'='*80}")
log("✅ Quick audit complete!")
log(f"Report: {REPORT_FILE}")
