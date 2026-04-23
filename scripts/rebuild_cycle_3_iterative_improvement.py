#!/usr/bin/env python3
"""
CYCLE 3: ITERATIVE IMPROVEMENT
Learn from sentences, refine confidence, improve ZO→EN reverse mapping, identify and fill gaps.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from dataclasses import dataclass, field, asdict
from collections import defaultdict
from datetime import datetime
import re

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = DATA_DIR / "processed" / "rebuild_v1"
HEARTBEAT_FILE = OUTPUT_DIR / "heartbeat.log"

def beat(phase: str, msg: str, **kwargs):
    """Log with heartbeat."""
    line = f"[{phase:20s}] {msg}"
    if kwargs:
        line += f" | {json.dumps(kwargs)}"
    print(line)
    sys.stdout.flush()
    with open(HEARTBEAT_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def load_sentences() -> list[dict]:
    """Load sentence corpus for learning."""
    beat("SENTENCES", "Loading sentence corpus...")
    
    sentences_file = DATA_DIR / "master" / "combined" / "sentences.jsonl"
    sentences = []
    
    if sentences_file.exists():
        with open(sentences_file, "r", encoding="utf-8") as f:
            for i, line in enumerate(f):
                if i >= 50000:  # Sample for speed
                    break
                try:
                    sentences.append(json.loads(line))
                except:
                    pass
    
    beat("SENTENCES", "Loaded sentences", count=len(sentences))
    return sentences

def extract_word_pairs_from_sentences(sentences: list[dict]) -> dict[str, list[str]]:
    """Extract word pairs from parallel sentences."""
    beat("PAIRS", "Extracting word pairs from sentences...")
    
    word_pairs = defaultdict(list)
    
    for sent in sentences:
        en_text = sent.get("en") or sent.get("english") or ""
        zo_text = sent.get("zo") or sent.get("zolai") or ""
        
        if en_text and zo_text:
            en_words = re.findall(r"\b\w+\b", en_text.lower())
            zo_words = re.findall(r"\b\w+\b", zo_text.lower())
            
            # Simple alignment: collect co-occurring words
            for en_w in en_words:
                for zo_w in zo_words:
                    if len(en_w) > 2 and len(zo_w) > 2:
                        word_pairs[en_w].append(zo_w)
    
    beat("PAIRS", "Extracted word pairs", unique_en=len(word_pairs))
    return word_pairs

def refine_dictionary_with_sentence_context(
    existing_dict: dict[str, dict],
    word_pairs: dict[str, list[str]]
) -> dict[str, dict]:
    """Refine dictionary using sentence context."""
    beat("REFINE", "Refining dictionary with sentence context...")
    
    refined = existing_dict.copy()
    confidence_updates = 0
    
    for en_word, zo_candidates in word_pairs.items():
        if not zo_candidates:
            continue
        
        # Most common ZO word for this EN word
        from collections import Counter
        most_common_zo = Counter(zo_candidates).most_common(1)[0][0]
        frequency = len(zo_candidates)
        
        if en_word in refined:
            # Boost confidence based on frequency
            old_conf = refined[en_word]["confidence"]
            new_conf = min(1.0, old_conf + (frequency * 0.001))
            refined[en_word]["confidence"] = new_conf
            refined[en_word]["frequency"] = refined[en_word].get("frequency", 1) + frequency
            confidence_updates += 1
        else:
            # Add new entry
            refined[en_word] = {
                "en": en_word,
                "zo": most_common_zo,
                "confidence": min(0.8, 0.5 + (frequency * 0.01)),
                "source": "sentence_extraction",
                "context": "",
                "bible_ref": "",
                "frequency": frequency
            }
    
    beat("REFINE", "Refinement complete", updates=confidence_updates, new_entries=len(refined) - len(existing_dict))
    return refined

def build_reverse_mapping(en_to_zo: dict[str, dict]) -> dict[str, dict]:
    """Build and refine ZO→EN reverse mapping."""
    beat("REVERSE", "Building reverse ZO→EN mapping...")
    
    zo_to_en = {}
    conflicts = 0
    
    for en_word, data in en_to_zo.items():
        zo_word = data["zo"].lower()
        
        if zo_word not in zo_to_en:
            zo_to_en[zo_word] = {
                "zo": zo_word,
                "en": en_word,
                "confidence": data["confidence"],
                "source": data["source"],
                "frequency": data.get("frequency", 1)
            }
        else:
            # Conflict: multiple EN words map to same ZO
            # Keep the one with higher confidence
            if data["confidence"] > zo_to_en[zo_word]["confidence"]:
                zo_to_en[zo_word] = {
                    "zo": zo_word,
                    "en": en_word,
                    "confidence": data["confidence"],
                    "source": data["source"],
                    "frequency": data.get("frequency", 1)
                }
                conflicts += 1
    
    beat("REVERSE", "Reverse mapping complete", zo_entries=len(zo_to_en), conflicts=conflicts)
    return zo_to_en

def identify_gaps(en_to_zo: dict[str, dict], zo_to_en: dict[str, dict]) -> dict[str, list[str]]:
    """Identify coverage gaps."""
    beat("GAPS", "Identifying coverage gaps...")
    
    gaps = {
        "en_only": [],
        "zo_only": [],
        "bidirectional": []
    }
    
    en_words = set(en_to_zo.keys())
    zo_words = set(zo_to_en.keys())
    
    # Words with low confidence
    low_conf_en = [w for w, d in en_to_zo.items() if d["confidence"] < 0.5]
    low_conf_zo = [w for w, d in zo_to_en.items() if d["confidence"] < 0.5]
    
    gaps["en_only"] = list(en_words - zo_words)[:100]
    gaps["zo_only"] = list(zo_words - en_words)[:100]
    gaps["bidirectional"] = low_conf_en + low_conf_zo
    
    beat("GAPS", "Gap analysis complete", en_only=len(gaps["en_only"]), zo_only=len(gaps["zo_only"]), low_conf=len(gaps["bidirectional"]))
    return gaps

def write_cycle_3_output(en_to_zo: dict[str, dict], zo_to_en: dict[str, dict], gaps: dict[str, list[str]]):
    """Write Cycle 3 output."""
    beat("WRITE", "Writing Cycle 3 output...")
    
    # EN→ZO
    en_zo_file = OUTPUT_DIR / "final_en_zo_dictionary_v3.jsonl"
    with open(en_zo_file, "w", encoding="utf-8") as f:
        for en_word, data in sorted(en_to_zo.items()):
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    beat("WRITE", "EN→ZO written", file=str(en_zo_file), entries=len(en_to_zo))
    
    # ZO→EN
    zo_en_file = OUTPUT_DIR / "final_zo_en_dictionary_v3.jsonl"
    with open(zo_en_file, "w", encoding="utf-8") as f:
        for zo_word, data in sorted(zo_to_en.items()):
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    beat("WRITE", "ZO→EN written", file=str(zo_en_file), entries=len(zo_to_en))
    
    # Gaps report
    gaps_file = OUTPUT_DIR / "gaps_v3.json"
    with open(gaps_file, "w", encoding="utf-8") as f:
        json.dump(gaps, f, ensure_ascii=False, indent=2)
    
    beat("WRITE", "Gaps report written", file=str(gaps_file))

def main() -> int:
    """Execute iterative improvement cycle."""
    beat("MAIN", "🔄 CYCLE 3: ITERATIVE IMPROVEMENT STARTING")
    
    try:
        # Load existing dictionary
        existing_file = OUTPUT_DIR / "final_en_zo_dictionary_v2.jsonl"
        existing_dict = {}
        
        if existing_file.exists():
            with open(existing_file, "r", encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        existing_dict[entry["en"].lower()] = entry
                    except:
                        pass
        
        beat("MAIN", "Loaded existing dictionary", entries=len(existing_dict))
        
        # Load sentences
        sentences = load_sentences()
        
        # Extract word pairs
        word_pairs = extract_word_pairs_from_sentences(sentences)
        
        # Refine dictionary
        refined_dict = refine_dictionary_with_sentence_context(existing_dict, word_pairs)
        
        # Build reverse mapping
        zo_to_en = build_reverse_mapping(refined_dict)
        
        # Identify gaps
        gaps = identify_gaps(refined_dict, zo_to_en)
        
        # Write output
        write_cycle_3_output(refined_dict, zo_to_en, gaps)
        
        beat("MAIN", "✅ CYCLE 3 COMPLETE")
        return 0
    
    except Exception as e:
        beat("MAIN", f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
