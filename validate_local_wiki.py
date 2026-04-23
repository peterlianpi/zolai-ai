#!/usr/bin/env python3
"""
Validate dataset using local wiki knowledge - no API calls
"""
import json, re
from pathlib import Path

DATA = Path("data/training")
INPUT_FILE = DATA / "master_train_enriched.jsonl"
OUTPUT_FILE = DATA / "validation_local_wiki.jsonl"
LOG_FILE = DATA / "validation_local_wiki.log"

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

LOG_FILE.write_text("")
log("LOCAL WIKI-BASED VALIDATION\n")

# Zolai grammar rules from wiki
VALID_DIALECTS = {"Tedim", "Zokam"}
VALID_LEVELS = {"A1", "A2", "B1", "B2", "C1"}
VALID_SOURCE_TYPES = {"corpus", "reference", "religious", "synthetic"}
VALID_POS = {"noun", "verb", "adverb", "phrase", "adjective", "pronoun"}

# Common Zolai words/patterns
ZOLAI_MARKERS = {
    "pasian", "leitung", "khuavak", "tua", "in", "a", "leh", "kei",
    "tuipi", "tung", "tengah", "nitak", "hong", "bei", "van", "kuumpi",
    "gam", "tapa", "topa", "kumpipa", "uh", "i", "o", "ei",
}

# Invalid patterns (from wiki)
INVALID_PATTERNS = {
    "pathian",  # wrong dialect
    "ram",      # wrong dialect
    "fapa",     # wrong dialect
    "bawipa",   # wrong dialect
    "siangpahrang",  # wrong dialect
    "lo leh",   # wrong negation
}

def validate_record(rec, idx):
    """Validate record against wiki rules"""
    errors = []
    
    # Check required fields
    text = rec.get("text", "").strip()
    if not text:
        return False, "missing_text"
    
    if len(text) < 5:
        return False, "text_too_short"
    if len(text) > 50000:
        return False, "text_too_long"
    
    # Check dialect
    dialect = rec.get("dialect", "")
    if dialect and dialect not in VALID_DIALECTS:
        errors.append(f"invalid_dialect:{dialect}")
    
    # Check language level
    level = rec.get("language_level", "")
    if level and level not in VALID_LEVELS:
        errors.append(f"invalid_level:{level}")
    
    # Check source type
    source_type = rec.get("source_type", "")
    if source_type and source_type not in VALID_SOURCE_TYPES:
        errors.append(f"invalid_source:{source_type}")
    
    # Check POS
    pos = rec.get("pos", "")
    if pos and pos not in VALID_POS:
        errors.append(f"invalid_pos:{pos}")
    
    # Check text patterns
    text_lower = text.lower()
    
    # Check for invalid patterns
    for invalid in INVALID_PATTERNS:
        if invalid in text_lower:
            errors.append(f"invalid_pattern:{invalid}")
    
    # Check for at least some Zolai markers
    has_zolai = any(word in text_lower for word in ZOLAI_MARKERS)
    if not has_zolai:
        errors.append("no_zolai_markers")
    
    # Allow Unicode (Zolai uses extended chars) - just check for control chars
    invalid_chars = set(c for c in text if ord(c) < 32 and c not in '\n\t\r')
    if invalid_chars:
        errors.append(f"control_chars:{len(invalid_chars)}")
    
    is_valid = len(errors) == 0
    return is_valid, ",".join(errors) if errors else "ok"

# Validate
results = []
stats = {"total": 0, "valid": 0, "invalid": 0}

log(f"Validating {INPUT_FILE.name}...\n")

with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        try:
            rec = json.loads(line)
            is_valid, reason = validate_record(rec, i)
            
            if is_valid:
                stats["valid"] += 1
            else:
                stats["invalid"] += 1
            
            if (i + 1) % 10000 == 0:
                pct = 100 * stats["valid"] / (i + 1)
                log(f"[{i+1}] Valid: {stats['valid']}/{i+1} ({pct:.1f}%)")
            
            results.append({
                "index": i,
                "text": rec.get("text", "")[:60],
                "valid": is_valid,
                "reason": reason,
                "dialect": rec.get("dialect"),
                "level": rec.get("language_level"),
            })
            
            stats["total"] += 1
        except:
            stats["invalid"] += 1
            stats["total"] += 1

# Save results
with open(OUTPUT_FILE, "w") as f:
    for r in results:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

# Summary
pct_valid = 100 * stats["valid"] / stats["total"] if stats["total"] > 0 else 0
log(f"\n{'='*80}")
log(f"Total: {stats['total']}")
log(f"Valid: {stats['valid']} ({pct_valid:.1f}%)")
log(f"Invalid: {stats['invalid']}")
log(f"Results: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Done! Validated {stats['total']} records")
print(f"Valid: {stats['valid']} ({pct_valid:.1f}%)")
print(f"Results: {OUTPUT_FILE}")
