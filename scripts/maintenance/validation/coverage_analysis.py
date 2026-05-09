import json
from pathlib import Path
from collections import Counter

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_production_complete.jsonl"
REPORT_FILE = DATA / "coverage_analysis.txt"

REPORT_FILE.write_text("")

def log(msg):
    print(msg, flush=True)
    with open(REPORT_FILE, "a") as f:
        f.write(msg + "\n")

log("RESOURCE & DATA COVERAGE ANALYSIS\n")
log(f"{'='*80}\n")

# Track sources
sources = Counter()
source_details = {}
level_by_source = {}
pos_by_source = {}

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        try:
            rec = json.loads(line)
            
            # Extract source from original data
            text = rec.get("text", "")
            source_type = rec.get("source_type", "unknown")
            level = rec.get("level", "unknown")
            pos = rec.get("pos", "unknown")
            
            # Detect source by content patterns
            if "Pasian" in text or "bible" in text.lower():
                source = "Bible"
            elif any(x in text.lower() for x in ["hymn", "song", "zomi daily", "rvasia"]):
                source = "News/Hymns"
            elif any(x in text.lower() for x in ["dictionary", "definition", "meaning"]):
                source = "Dictionary"
            elif any(x in text.lower() for x in ["parallel", "translation", "english"]):
                source = "Parallel"
            else:
                source = "Corpus"
            
            sources[source] += 1
            
            if source not in source_details:
                source_details[source] = {"count": 0, "levels": Counter(), "pos": Counter()}
            
            source_details[source]["count"] += 1
            source_details[source]["levels"][level] += 1
            source_details[source]["pos"][pos] += 1
            
            if (i + 1) % 500000 == 0:
                log(f"[{i+1}] Analyzed...")
        except:
            pass

# Report
log("SOURCE COVERAGE\n")
total = sum(sources.values())
for source, count in sources.most_common():
    pct = 100 * count / total
    log(f"{source}: {count:,} ({pct:.1f}%)")

log(f"\n{'='*80}\n")
log("DETAILED COVERAGE BY SOURCE\n")

for source in sorted(sources.keys()):
    details = source_details[source]
    log(f"\n{source} ({details['count']:,} records)")
    log(f"  Language Levels:")
    for level, count in details["levels"].most_common():
        pct = 100 * count / details["count"]
        log(f"    {level}: {count:,} ({pct:.1f}%)")
    log(f"  POS Distribution:")
    for pos, count in details["pos"].most_common():
        pct = 100 * count / details["count"]
        log(f"    {pos}: {count:,} ({pct:.1f}%)")

log(f"\n{'='*80}\n")
log("COVERAGE ASSESSMENT\n")

# Check coverage
assessments = []

if sources.get("Bible", 0) > total * 0.2:
    assessments.append("✓ Bible coverage: Strong (>20%)")
else:
    assessments.append("⚠ Bible coverage: Weak (<20%)")

if sources.get("Dictionary", 0) > total * 0.1:
    assessments.append("✓ Dictionary coverage: Good (>10%)")
else:
    assessments.append("⚠ Dictionary coverage: Limited (<10%)")

if sources.get("Parallel", 0) > total * 0.05:
    assessments.append("✓ Parallel data: Present (>5%)")
else:
    assessments.append("⚠ Parallel data: Minimal (<5%)")

if sources.get("News/Hymns", 0) > total * 0.05:
    assessments.append("✓ News/Hymns: Present (>5%)")
else:
    assessments.append("⚠ News/Hymns: Minimal (<5%)")

for assessment in assessments:
    log(assessment)

log(f"\n{'='*80}\n")
log("RECOMMENDATIONS\n")

recommendations = []

if sources.get("Bible", 0) < total * 0.15:
    recommendations.append("• Add more Bible texts (currently <15%)")

if sources.get("Dictionary", 0) < total * 0.08:
    recommendations.append("• Add more dictionary entries (currently <8%)")

if sources.get("Parallel", 0) < total * 0.03:
    recommendations.append("• Add more parallel translations (currently <3%)")

if sources.get("News/Hymns", 0) < total * 0.03:
    recommendations.append("• Add more contemporary texts (currently <3%)")

if not recommendations:
    recommendations.append("✓ Dataset has good coverage across all resource types")

for rec in recommendations:
    log(rec)

log(f"\n{'='*80}")
log(f"Report: {REPORT_FILE}")
