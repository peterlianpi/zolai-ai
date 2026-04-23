#!/bin/bash
# Enrich all dataset splits (train, val, test)
# Usage: ./enrich_all_splits.sh

cd "$(dirname "$0")" || exit 1

echo "=================================="
echo "Enriching All Dataset Splits"
echo "=================================="
echo ""

# Create enrichment script for val/test
cat > /tmp/enrich_split.py << 'ENRICH_EOF'
import json
import sys
from pathlib import Path
from collections import Counter

input_file = sys.argv[1]
output_file = sys.argv[2]

DIALECT_MAP = {
    "tedim": "Tedim", "tedim2010": "Tedim", "tdb77": "Tedim", "tbr17": "Tedim",
    "zokam": "Zokam", "zo": "Tedim",
}

SOURCE_TYPE_MAP = {
    "bible": "religious", "hymn": "religious", "news": "news",
    "dictionary": "reference", "parallel": "parallel", "corpus": "corpus",
    "instruction": "instruction", "synthetic": "synthetic",
}

def detect_dialect(text, source):
    source_lower = source.lower()
    for key, dialect in DIALECT_MAP.items():
        if key in source_lower:
            return dialect
    for word in ["zokam", "zo'kam", "zo kham"]:
        if word in text.lower():
            return "Zokam"
    return "Tedim"

def detect_source_type(source):
    source_lower = source.lower()
    for key, stype in SOURCE_TYPE_MAP.items():
        if key in source_lower:
            return stype
    return "corpus"

def estimate_language_level(text):
    words = text.split()
    avg_word_len = sum(len(w) for w in words) / len(words) if words else 0
    if len(words) < 5 or avg_word_len < 4:
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
    if len(text) < 20:
        return "noun"
    elif text.endswith("ing"):
        return "verb"
    elif text.endswith("ly"):
        return "adverb"
    else:
        return "phrase"

with open(input_file, "r", encoding="utf-8") as fin:
    with open(output_file, "w", encoding="utf-8") as fout:
        for line in fin:
            rec = json.loads(line)
            text = (rec.get("text") or rec.get("output") or 
                   rec.get("zolai") or rec.get("headword") or "")
            text = str(text).strip()
            source = rec.get("source", "unknown")
            
            if text:
                rec["dialect"] = detect_dialect(text, source)
                rec["source_type"] = detect_source_type(source)
                rec["language_level"] = estimate_language_level(text)
                rec["pos"] = guess_pos(text)
            
            fout.write(json.dumps(rec, ensure_ascii=False) + "\n")

print(f"✓ Enriched: {output_file}")
ENRICH_EOF

echo "Enriching validation split..."
python3 /tmp/enrich_split.py data/training/master_val_complete.jsonl data/training/master_val_enriched.jsonl

echo "Enriching test split..."
python3 /tmp/enrich_split.py data/training/master_test_complete.jsonl data/training/master_test_enriched.jsonl

echo ""
echo "=================================="
echo "✅ All splits enriched!"
echo ""
echo "Files created:"
echo "  • master_train_enriched.jsonl"
echo "  • master_val_enriched.jsonl"
echo "  • master_test_enriched.jsonl"
echo ""
echo "New fields added to all records:"
echo "  • dialect (Tedim/Zokam)"
echo "  • source_type (corpus/reference/religious/etc)"
echo "  • language_level (A1-C1)"
echo "  • pos (noun/verb/adverb/phrase)"
echo "=================================="
