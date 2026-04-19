#!/usr/bin/env python3
"""
CYCLE 4: CONTINUOUS LEARNING LOOP
Self-improving dictionary with deep analysis, confidence refinement, and iterative enhancement.
Runs continuously with memory and learning capabilities.
"""

from __future__ import annotations

import json
import sys
import time
from pathlib import Path
from dataclasses import dataclass, field, asdict
from collections import defaultdict, Counter
from datetime import datetime
import re
import threading

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
OUTPUT_DIR = DATA_DIR / "processed" / "rebuild_v1"
HEARTBEAT_FILE = OUTPUT_DIR / "heartbeat.log"
LEARNING_LOG = OUTPUT_DIR / "learning_log.jsonl"

@dataclass
class LearningEvent:
    """Record of learning event."""
    timestamp: str
    iteration: int
    event_type: str  # "confidence_boost", "new_entry", "gap_filled", "conflict_resolved"
    details: dict = field(default_factory=dict)

def beat(phase: str, msg: str, **kwargs):
    """Log with heartbeat."""
    line = f"[{phase:20s}] {msg}"
    if kwargs:
        line += f" | {json.dumps(kwargs)}"
    print(line)
    sys.stdout.flush()
    with open(HEARTBEAT_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")

def log_learning(event: LearningEvent):
    """Log learning event."""
    with open(LEARNING_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(asdict(event), ensure_ascii=False) + "\n")

def load_current_dictionary() -> dict[str, dict]:
    """Load current best dictionary."""
    beat("LOAD", "Loading current dictionary...")
    
    dict_file = OUTPUT_DIR / "final_en_zo_dictionary_v3.jsonl"
    dictionary = {}
    
    if dict_file.exists():
        with open(dict_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    dictionary[entry["en"].lower()] = entry
                except:
                    pass
    
    beat("LOAD", "Dictionary loaded", entries=len(dictionary))
    return dictionary

def analyze_confidence_distribution(dictionary: dict[str, dict]) -> dict:
    """Analyze confidence distribution."""
    beat("ANALYSIS", "Analyzing confidence distribution...")
    
    confidences = [d["confidence"] for d in dictionary.values()]
    
    analysis = {
        "total_entries": len(dictionary),
        "avg_confidence": sum(confidences) / len(confidences) if confidences else 0,
        "min_confidence": min(confidences) if confidences else 0,
        "max_confidence": max(confidences) if confidences else 0,
        "high_confidence": len([c for c in confidences if c >= 0.8]),
        "medium_confidence": len([c for c in confidences if 0.5 <= c < 0.8]),
        "low_confidence": len([c for c in confidences if c < 0.5])
    }
    
    beat("ANALYSIS", "Confidence analysis complete", **analysis)
    return analysis

def boost_confidence_from_frequency(dictionary: dict[str, dict]) -> tuple[dict[str, dict], int]:
    """Boost confidence based on frequency."""
    beat("BOOST", "Boosting confidence from frequency...")
    
    updated = dictionary.copy()
    boosts = 0
    
    for en_word, data in updated.items():
        freq = data.get("frequency", 1)
        
        # Frequency-based boost
        if freq > 10:
            old_conf = data["confidence"]
            new_conf = min(1.0, old_conf + 0.1)
            data["confidence"] = new_conf
            boosts += 1
            
            log_learning(LearningEvent(
                timestamp=datetime.now().isoformat(),
                iteration=0,
                event_type="confidence_boost",
                details={"word": en_word, "old": old_conf, "new": new_conf, "freq": freq}
            ))
    
    beat("BOOST", "Confidence boost complete", boosts=boosts)
    return updated, boosts

def identify_and_fill_gaps(dictionary: dict[str, dict], iteration: int) -> tuple[dict[str, dict], int]:
    """Identify gaps and attempt to fill them."""
    beat("GAPS", f"Identifying gaps (iteration {iteration})...")
    
    updated = dictionary.copy()
    filled = 0
    
    # Load all available sources for gap filling
    sources = [
        DATA_DIR / "raw" / "zomidictionary_export.jsonl",
        DATA_DIR / "master" / "sources" / "tongdot_dictionary.jsonl",
    ]
    
    gap_candidates = defaultdict(list)
    
    for source_file in sources:
        if not source_file.exists():
            continue
        
        with open(source_file, "r", encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    en = (entry.get("en") or entry.get("english") or "").lower()
                    zo = entry.get("zo") or entry.get("zolai") or ""
                    
                    if en and zo and en not in updated:
                        gap_candidates[en].append(zo)
                except:
                    pass
    
    # Fill gaps with best candidates
    for en_word, zo_options in gap_candidates.items():
        if len(zo_options) > 0:
            best_zo = Counter(zo_options).most_common(1)[0][0]
            updated[en_word] = {
                "en": en_word,
                "zo": best_zo,
                "confidence": 0.6,
                "source": "gap_filling",
                "context": "",
                "bible_ref": "",
                "frequency": len(zo_options)
            }
            filled += 1
            
            log_learning(LearningEvent(
                timestamp=datetime.now().isoformat(),
                iteration=iteration,
                event_type="gap_filled",
                details={"word": en_word, "zo": best_zo}
            ))
    
    beat("GAPS", "Gap filling complete", filled=filled)
    return updated, filled

def resolve_conflicts(en_to_zo: dict[str, dict], zo_to_en: dict[str, dict], iteration: int) -> tuple[dict[str, dict], dict[str, dict], int]:
    """Resolve bidirectional conflicts."""
    beat("CONFLICTS", f"Resolving conflicts (iteration {iteration})...")
    
    resolved = 0
    
    # Find conflicts: multiple EN words mapping to same ZO
    zo_map = defaultdict(list)
    for en_word, data in en_to_zo.items():
        zo_word = data["zo"].lower()
        zo_map[zo_word].append((en_word, data["confidence"]))
    
    for zo_word, en_list in zo_map.items():
        if len(en_list) > 1:
            # Keep highest confidence
            best_en, best_conf = max(en_list, key=lambda x: x[1])
            
            # Update reverse mapping
            if zo_word in zo_to_en:
                old_en = zo_to_en[zo_word]["en"]
                if old_en != best_en:
                    zo_to_en[zo_word]["en"] = best_en
                    resolved += 1
                    
                    log_learning(LearningEvent(
                        timestamp=datetime.now().isoformat(),
                        iteration=iteration,
                        event_type="conflict_resolved",
                        details={"zo": zo_word, "old_en": old_en, "new_en": best_en}
                    ))
    
    beat("CONFLICTS", "Conflict resolution complete", resolved=resolved)
    return en_to_zo, zo_to_en, resolved

def write_iteration_output(en_to_zo: dict[str, dict], zo_to_en: dict[str, dict], iteration: int):
    """Write iteration output."""
    beat("WRITE", f"Writing iteration {iteration} output...")
    
    # EN→ZO
    en_zo_file = OUTPUT_DIR / f"final_en_zo_dictionary_v{3+iteration}.jsonl"
    with open(en_zo_file, "w", encoding="utf-8") as f:
        for en_word, data in sorted(en_to_zo.items()):
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    beat("WRITE", f"EN→ZO written (v{3+iteration})", entries=len(en_to_zo))
    
    # ZO→EN
    zo_en_file = OUTPUT_DIR / f"final_zo_en_dictionary_v{3+iteration}.jsonl"
    with open(zo_en_file, "w", encoding="utf-8") as f:
        for zo_word, data in sorted(zo_to_en.items()):
            f.write(json.dumps(data, ensure_ascii=False) + "\n")
    
    beat("WRITE", f"ZO→EN written (v{3+iteration})", entries=len(zo_to_en))

def continuous_learning_loop(max_iterations: int = 5):
    """Run continuous learning loop."""
    beat("MAIN", f"🔄 CYCLE 4: CONTINUOUS LEARNING LOOP (max {max_iterations} iterations)")
    
    # Load initial dictionary
    en_to_zo = load_current_dictionary()
    
    # Build reverse mapping
    zo_to_en = {}
    for en_word, data in en_to_zo.items():
        zo_word = data["zo"].lower()
        if zo_word not in zo_to_en:
            zo_to_en[zo_word] = {
                "zo": zo_word,
                "en": en_word,
                "confidence": data["confidence"],
                "source": data["source"]
            }
    
    beat("MAIN", "Initial mappings loaded", en_to_zo=len(en_to_zo), zo_to_en=len(zo_to_en))
    
    for iteration in range(max_iterations):
        beat("MAIN", f"\n{'='*60}")
        beat("MAIN", f"ITERATION {iteration + 1}/{max_iterations}")
        beat("MAIN", f"{'='*60}")
        
        # Analyze
        analysis = analyze_confidence_distribution(en_to_zo)
        
        # Boost confidence
        en_to_zo, boosts = boost_confidence_from_frequency(en_to_zo)
        
        # Fill gaps
        en_to_zo, filled = identify_and_fill_gaps(en_to_zo, iteration)
        
        # Rebuild reverse mapping
        zo_to_en = {}
        for en_word, data in en_to_zo.items():
            zo_word = data["zo"].lower()
            if zo_word not in zo_to_en:
                zo_to_en[zo_word] = {
                    "zo": zo_word,
                    "en": en_word,
                    "confidence": data["confidence"],
                    "source": data["source"]
                }
        
        # Resolve conflicts
        en_to_zo, zo_to_en, resolved = resolve_conflicts(en_to_zo, zo_to_en, iteration)
        
        # Write output
        write_iteration_output(en_to_zo, zo_to_en, iteration)
        
        beat("MAIN", f"Iteration {iteration + 1} complete", boosts=boosts, filled=filled, resolved=resolved)
        beat("MAIN", f"Dictionary size: EN→ZO={len(en_to_zo)}, ZO→EN={len(zo_to_en)}")
    
    beat("MAIN", "\n✅ CYCLE 4 CONTINUOUS LEARNING COMPLETE")
    beat("MAIN", f"Final EN→ZO entries: {len(en_to_zo)}")
    beat("MAIN", f"Final ZO→EN entries: {len(zo_to_en)}")
    beat("MAIN", f"Average confidence: {analysis['avg_confidence']:.3f}")

def main() -> int:
    """Execute continuous learning."""
    try:
        continuous_learning_loop(max_iterations=5)
        return 0
    except Exception as e:
        beat("MAIN", f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
