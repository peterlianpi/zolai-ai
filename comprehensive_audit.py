#!/usr/bin/env python3
"""
Comprehensive audit and pattern analysis of entire dataset
"""
import json
from pathlib import Path
from collections import Counter, defaultdict

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_production.jsonl"
AUDIT_FILE = DATA / "comprehensive_audit.jsonl"
REPORT_FILE = DATA / "audit_report.txt"

def log(msg):
    print(msg, flush=True)
    with open(REPORT_FILE, "a") as f:
        f.write(msg + "\n")

REPORT_FILE.write_text("")
log("COMPREHENSIVE DATASET AUDIT & PATTERN ANALYSIS\n")
log(f"{'='*80}\n")

# Statistics
stats = {
    "total": 0,
    "by_dialect": Counter(),
    "by_level": Counter(),
    "by_source": Counter(),
    "by_pos": Counter(),
    "text_length": {"min": float('inf'), "max": 0, "avg": 0},
    "patterns": defaultdict(int),
    "issues": defaultdict(int),
}

# Zolai patterns
ZOLAI_PATTERNS = {
    "SOV_order": r".*\s(in|a|leh)\s.*",  # Subject-Object-Verb markers
    "negation_kei": r".*\skei\s.*",
    "negation_lo": r".*\slo\s.*",
    "plural_uh": r".*\suh\s.*",
    "plural_i": r".*\s\bi\b\s.*",
    "question_maw": r".*\smaw\s*\?",
    "conditional_ding": r".*\sding\s.*",
    "relative_clause": r".*\s(a|in)\s.*",
    "bible_reference": r".*\d+:\d+.*",
    "proper_noun": r".*[A-Z][a-z]+.*",
}

# Load and analyze
text_lengths = []
audit_records = []

log("Analyzing records...\n")

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        try:
            rec = json.loads(line)
            text = rec.get("text", "")
            
            if not text:
                stats["issues"]["empty_text"] += 1
                continue
            
            # Basic stats
            stats["total"] += 1
            stats["by_dialect"][rec.get("dialect", "unknown")] += 1
            stats["by_level"][rec.get("language_level", "unknown")] += 1
            stats["by_source"][rec.get("source_type", "unknown")] += 1
            stats["by_pos"][rec.get("pos", "unknown")] += 1
            
            # Text length
            text_len = len(text)
            text_lengths.append(text_len)
            stats["text_length"]["min"] = min(stats["text_length"]["min"], text_len)
            stats["text_length"]["max"] = max(stats["text_length"]["max"], text_len)
            
            # Pattern detection
            text_lower = text.lower()
            for pattern_name, pattern in ZOLAI_PATTERNS.items():
                import re
                if re.search(pattern, text_lower):
                    stats["patterns"][pattern_name] += 1
            
            # Quality checks
            if len(text) < 5:
                stats["issues"]["too_short"] += 1
            if len(text) > 50000:
                stats["issues"]["too_long"] += 1
            if text.count('\n') > 10:
                stats["issues"]["too_many_newlines"] += 1
            if any(ord(c) < 32 and c not in '\n\t\r' for c in text):
                stats["issues"]["control_chars"] += 1
            
            # Sample audit record
            if i % 100000 == 0:
                audit_records.append({
                    "index": i,
                    "text_len": text_len,
                    "dialect": rec.get("dialect"),
                    "level": rec.get("language_level"),
                    "source": rec.get("source_type"),
                    "pos": rec.get("pos"),
                    "patterns": [p for p, pat in ZOLAI_PATTERNS.items() if re.search(pat, text_lower)]
                })
            
            if (i + 1) % 500000 == 0:
                log(f"[{i+1}] Processed...")
        
        except Exception as e:
            stats["issues"]["parse_error"] += 1

# Calculate averages
if text_lengths:
    stats["text_length"]["avg"] = sum(text_lengths) / len(text_lengths)

# Report
log(f"\n{'='*80}")
log("DATASET STATISTICS")
log(f"{'='*80}\n")

log(f"Total records: {stats['total']:,}")
log(f"Text length: min={stats['text_length']['min']}, max={stats['text_length']['max']}, avg={stats['text_length']['avg']:.0f}")

log(f"\nBy Dialect:")
for dialect, count in stats["by_dialect"].most_common():
    pct = 100 * count / stats["total"]
    log(f"  {dialect}: {count:,} ({pct:.1f}%)")

log(f"\nBy Language Level:")
for level, count in stats["by_level"].most_common():
    pct = 100 * count / stats["total"]
    log(f"  {level}: {count:,} ({pct:.1f}%)")

log(f"\nBy Source Type:")
for source, count in stats["by_source"].most_common():
    pct = 100 * count / stats["total"]
    log(f"  {source}: {count:,} ({pct:.1f}%)")

log(f"\nBy POS:")
for pos, count in stats["by_pos"].most_common():
    pct = 100 * count / stats["total"]
    log(f"  {pos}: {count:,} ({pct:.1f}%)")

log(f"\n{'='*80}")
log("ZOLAI LINGUISTIC PATTERNS")
log(f"{'='*80}\n")

for pattern, count in sorted(stats["patterns"].items(), key=lambda x: x[1], reverse=True):
    pct = 100 * count / stats["total"]
    log(f"  {pattern}: {count:,} ({pct:.1f}%)")

log(f"\n{'='*80}")
log("QUALITY ISSUES")
log(f"{'='*80}\n")

if stats["issues"]:
    for issue, count in sorted(stats["issues"].items(), key=lambda x: x[1], reverse=True):
        log(f"  {issue}: {count:,}")
else:
    log("  No issues detected ✓")

# Save audit records
with open(AUDIT_FILE, "w") as f:
    for rec in audit_records:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

log(f"\n{'='*80}")
log("RECOMMENDATIONS")
log(f"{'='*80}\n")

recommendations = []

# Check coverage
if stats["by_level"]["A1"] < stats["total"] * 0.2:
    recommendations.append("⚠ Low A1 coverage - consider adding beginner materials")

if stats["by_source"]["corpus"] < stats["total"] * 0.8:
    recommendations.append("⚠ Low corpus coverage - consider adding more authentic texts")

if stats["patterns"]["SOV_order"] < stats["total"] * 0.5:
    recommendations.append("⚠ Low SOV pattern detection - verify word order compliance")

if stats["issues"]:
    recommendations.append(f"⚠ {sum(stats['issues'].values())} quality issues detected - review and fix")

if not recommendations:
    recommendations.append("✓ Dataset quality is excellent - ready for production")

for rec in recommendations:
    log(rec)

log(f"\n{'='*80}")
log(f"Audit complete. Report: {REPORT_FILE}")
log(f"Audit records: {AUDIT_FILE}")
log(f"{'='*80}\n")

print(f"\n✅ Audit complete!")
print(f"Report: {REPORT_FILE}")
