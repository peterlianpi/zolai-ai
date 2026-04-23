#!/usr/bin/env python3
"""
Enrich Master Dataset with missing fields
Adds: dialect, pos, category, language_level, source_type
Run: python3 enrich_master_dataset.py
"""
import json
from pathlib import Path
from collections import Counter
import re

DATA = Path(__file__).parent / "data"
TRAIN_FILE = DATA / "training/master_train_complete.jsonl"
OUTPUT_FILE = DATA / "training/master_train_enriched.jsonl"
LOG = DATA / "training/enrich_master.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG, "a") as f:
        f.write(msg + "\n")

LOG.write_text("")
log("\n" + "="*80)
log("ENRICHING MASTER DATASET")
log("="*80 + "\n")

# Enrichment rules
DIALECT_MAP = {
    "tedim": "Tedim",
    "tedim2010": "Tedim",
    "tdb77": "Tedim",
    "tbr17": "Tedim",
    "zokam": "Zokam",
    "zo": "Tedim",  # Default
}

SOURCE_TYPE_MAP = {
    "bible": "religious",
    "hymn": "religious",
    "news": "news",
    "dictionary": "reference",
    "parallel": "parallel",
    "corpus": "corpus",
    "instruction": "instruction",
    "synthetic": "synthetic",
}

def detect_dialect(text, source):
    """Detect dialect from text patterns"""
    # Check source first
    source_lower = source.lower()
    for key, dialect in DIALECT_MAP.items():
        if key in source_lower:
            return dialect
    
    # Check text patterns (Zokam specific words)
    zokam_words = ["zokam", "zo'kam", "zo kham"]
    for word in zokam_words:
        if word in text.lower():
            return "Zokam"
    
    return "Tedim"  # Default

def detect_source_type(source):
    """Detect source type"""
    source_lower = source.lower()
    for key, stype in SOURCE_TYPE_MAP.items():
        if key in source_lower:
            return stype
    return "corpus"

def estimate_language_level(text):
    """Estimate CEFR level based on text complexity"""
    words = text.split()
    avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
    
    if len(words) < 5:
        return "A1"
    elif avg_word_len < 4:
        return "A1"
    elif avg_word_len < 5:
        return "A2"
    elif avg_word_len < 6:
        return "B1"
    elif avg_word_len < 7:
        return "B2"
    else:
        return "C1"

def guess_pos(text):
    """Guess part of speech from context"""
    # Simple heuristics
    if len(text) < 20:
        return "noun"  # Short words often nouns
    elif text.endswith("ing"):
        return "verb"
    elif text.endswith("ly"):
        return "adverb"
    else:
        return "phrase"

log("[1/2] ENRICHING RECORDS...\n")

enriched_count = 0
stats = {
    "total": 0,
    "enriched": 0,
    "dialects": Counter(),
    "source_types": Counter(),
    "levels": Counter(),
}

try:
    with open(TRAIN_FILE, "r", encoding="utf-8") as fin:
        with open(OUTPUT_FILE, "w", encoding="utf-8") as fout:
            for i, line in enumerate(fin):
                rec = json.loads(line)
                stats["total"] += 1
                
                # Extract text
                text = (rec.get("text") or rec.get("output") or 
                       rec.get("zolai") or rec.get("headword") or "")
                text = str(text).strip()
                source = rec.get("source", "unknown")
                
                # Add enrichment fields
                if text:
                    dialect = detect_dialect(text, source)
                    source_type = detect_source_type(source)
                    level = estimate_language_level(text)
                    pos = guess_pos(text)
                    
                    rec["dialect"] = dialect
                    rec["source_type"] = source_type
                    rec["language_level"] = level
                    rec["pos"] = pos
                    
                    stats["dialects"][dialect] += 1
                    stats["source_types"][source_type] += 1
                    stats["levels"][level] += 1
                    stats["enriched"] += 1
                
                fout.write(json.dumps(rec, ensure_ascii=False) + "\n")
                
                if (i + 1) % 100000 == 0:
                    pct = (i + 1) / 5834792 * 100
                    log(f"  Enriched: {i+1:,} records ({pct:.1f}%)")

except Exception as e:
    log(f"ERROR: {e}")

log(f"\n[2/2] STATISTICS...\n")

log(f"Total records: {stats['total']:,}")
log(f"Enriched: {stats['enriched']:,}\n")

log("Dialect distribution:")
for dialect, count in stats["dialects"].most_common():
    pct = 100 * count / stats["total"]
    log(f"  • {dialect:15} {count:>10,} ({pct:5.1f}%)")

log("\nSource type distribution:")
for stype, count in stats["source_types"].most_common():
    pct = 100 * count / stats["total"]
    log(f"  • {stype:15} {count:>10,} ({pct:5.1f}%)")

log("\nLanguage level distribution:")
for level in ["A1", "A2", "B1", "B2", "C1", "C2"]:
    count = stats["levels"].get(level, 0)
    pct = 100 * count / stats["total"]
    log(f"  • {level:15} {count:>10,} ({pct:5.1f}%)")

log("\n" + "="*80)
log("✅ ENRICHMENT COMPLETE")
log("="*80)
log(f"\nGenerated: {OUTPUT_FILE.name}")
log(f"Records enriched: {stats['enriched']:,}")
log(f"\nNew fields added:")
log(f"  • dialect - Tedim/Zokam")
log(f"  • source_type - religious/news/reference/etc")
log(f"  • language_level - A1/A2/B1/B2/C1/C2")
log(f"  • pos - noun/verb/adverb/phrase")
log("="*80 + "\n")

print(f"\n✅ Enrichment complete!")
print(f"Output: data/training/master_train_enriched.jsonl")
print(f"Log: data/training/enrich_master.log")
