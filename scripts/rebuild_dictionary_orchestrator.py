#!/usr/bin/env python3
"""
ZOLAI DICTIONARY REBUILD ORCHESTRATOR
Complete EN↔ZO bidirectional dictionary system with parallel agents, deep learning, and iterative improvement.
"""

from __future__ import annotations

import json
import sys
import time
import hashlib
from pathlib import Path
from dataclasses import dataclass, field, asdict
from collections import defaultdict
from typing import Generator
import subprocess
import threading
from datetime import datetime

# ============================================================================
# CONFIGURATION & PATHS
# ============================================================================

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data"
PROCESSED_DIR = DATA_DIR / "processed"
MASTER_DIR = DATA_DIR / "master"
BIBLE_DIR = PROJECT_ROOT / "Cleaned_Bible"
WEBSITE_DIR = PROJECT_ROOT / "website" / "zolai-project"

# Dictionary sources
DICT_SOURCES = {
    "semantic": PROCESSED_DIR / "master_dictionary_semantic.jsonl",
    "en_zo": PROCESSED_DIR / "master_dictionary_en_zo.jsonl",
    "enriched": PROCESSED_DIR / "master_dictionary_enriched.jsonl",
    "tongdot": MASTER_DIR / "sources" / "tongdot_dictionary.jsonl",
    "zomidictionary": DATA_DIR / "raw" / "zomidictionary_export.jsonl",
}

# Bible sources
BIBLE_SOURCES = {
    "tdb_online": MASTER_DIR / "sources" / "bible_tdb_online.jsonl",
    "tbr17": MASTER_DIR / "sources" / "bible_tbr17.jsonl",
}

# Output paths
OUTPUT_DIR = PROCESSED_DIR / "rebuild_v1"
MEMORY_FILE = OUTPUT_DIR / "memory.jsonl"
HEARTBEAT_FILE = OUTPUT_DIR / "heartbeat.log"
AUDIT_FILE = OUTPUT_DIR / "audit.jsonl"
FINAL_EN_ZO = OUTPUT_DIR / "final_en_zo_dictionary.jsonl"
FINAL_ZO_EN = OUTPUT_DIR / "final_zo_en_dictionary.jsonl"

# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class DictEntry:
    """Single dictionary entry with bidirectional support."""
    en: str
    zo: str
    source: str
    confidence: float = 1.0
    context: str = ""
    bible_ref: str = ""
    frequency: int = 1
    metadata: dict = field(default_factory=dict)

    def to_dict(self) -> dict:
        return asdict(self)

    @staticmethod
    def from_dict(d: dict) -> DictEntry:
        return DictEntry(**d)


@dataclass
class Memory:
    """Long-term and short-term memory for learning."""
    timestamp: str
    phase: str
    entries_processed: int = 0
    entries_learned: int = 0
    bidirectional_pairs: int = 0
    confidence_avg: float = 0.0
    gaps_identified: list = field(default_factory=list)
    improvements: list = field(default_factory=list)
    errors: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


@dataclass
class AuditReport:
    """Audit findings and quality metrics."""
    timestamp: str
    total_entries: int
    en_to_zo_pairs: int
    zo_to_en_pairs: int
    bidirectional_coverage: float
    confidence_distribution: dict = field(default_factory=dict)
    gaps: list = field(default_factory=list)
    duplicates_found: int = 0
    quality_issues: list = field(default_factory=list)

    def to_dict(self) -> dict:
        return asdict(self)


# ============================================================================
# HEARTBEAT & LOGGING
# ============================================================================

class Heartbeat:
    """Real-time progress tracking with memory."""
    
    def __init__(self, output_file: Path):
        self.output_file = output_file
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        self.start_time = time.time()
        self.memory: list[Memory] = []
        self.lock = threading.Lock()
        
    def beat(self, phase: str, msg: str, **kwargs):
        """Log heartbeat with timestamp."""
        elapsed = time.time() - self.start_time
        timestamp = datetime.now().isoformat()
        
        with self.lock:
            line = f"[{elapsed:8.1f}s] [{phase:20s}] {msg}"
            if kwargs:
                line += f" | {json.dumps(kwargs)}"
            
            print(line)
            sys.stdout.flush()
            
            with open(self.output_file, "a", encoding="utf-8") as f:
                f.write(line + "\n")
    
    def save_memory(self, mem: Memory):
        """Save memory checkpoint."""
        with self.lock:
            self.memory.append(mem)
            with open(MEMORY_FILE, "a", encoding="utf-8") as f:
                f.write(json.dumps(mem.to_dict(), ensure_ascii=False) + "\n")


hb = Heartbeat(HEARTBEAT_FILE)

# ============================================================================
# PHASE 1: LOAD & MERGE DICTIONARIES
# ============================================================================

def load_jsonl(path: Path) -> Generator[dict, None, None]:
    """Stream JSONL file."""
    if not path.exists():
        hb.beat("LOAD", f"File not found: {path}")
        return
    
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    yield json.loads(line)
                except json.JSONDecodeError:
                    pass


def phase_1_load_dictionaries() -> dict[str, list[DictEntry]]:
    """Load all dictionary sources."""
    hb.beat("PHASE_1", "Starting dictionary load...")
    
    all_entries = defaultdict(list)
    total_loaded = 0
    
    for source_name, source_path in DICT_SOURCES.items():
        if not source_path.exists():
            hb.beat("PHASE_1", f"Skipping missing: {source_name}")
            continue
        
        count = 0
        for item in load_jsonl(source_path):
            # Normalize entry format
            en = item.get("en") or item.get("english") or item.get("word") or ""
            zo = item.get("zo") or item.get("zolai") or item.get("definition") or ""
            
            if en and zo:
                entry = DictEntry(
                    en=en.strip().lower(),
                    zo=zo.strip(),
                    source=source_name,
                    confidence=item.get("confidence", 1.0),
                    context=item.get("context", ""),
                    bible_ref=item.get("bible_ref", ""),
                    frequency=item.get("frequency", 1),
                    metadata=item.get("metadata", {})
                )
                all_entries[en].append(entry)
                count += 1
                total_loaded += 1
        
        hb.beat("PHASE_1", f"Loaded {source_name}", count=count)
    
    mem = Memory(
        timestamp=datetime.now().isoformat(),
        phase="PHASE_1_LOAD",
        entries_processed=total_loaded,
        entries_learned=len(all_entries)
    )
    hb.save_memory(mem)
    hb.beat("PHASE_1", "Dictionary load complete", total=total_loaded, unique_en=len(all_entries))
    
    return all_entries


# ============================================================================
# PHASE 2: EXTRACT BIBLE VOCABULARY
# ============================================================================

def phase_2_extract_bible_vocab() -> dict[str, str]:
    """Extract vocabulary from Bible corpus."""
    hb.beat("PHASE_2", "Starting Bible vocabulary extraction...")
    
    bible_vocab = {}
    total_verses = 0
    
    for source_name, source_path in BIBLE_SOURCES.items():
        if not source_path.exists():
            hb.beat("PHASE_2", f"Skipping missing Bible: {source_name}")
            continue
        
        count = 0
        for item in load_jsonl(source_path):
            zo_text = item.get("zo") or item.get("zolai") or ""
            en_text = item.get("en") or item.get("english") or ""
            
            if zo_text and en_text:
                # Extract words
                for word in zo_text.split():
                    word_clean = word.lower().strip(".,;:!?\"'")
                    if len(word_clean) > 2:
                        if word_clean not in bible_vocab:
                            bible_vocab[word_clean] = en_text[:100]
                
                count += 1
                total_verses += 1
        
        hb.beat("PHASE_2", f"Extracted from {source_name}", verses=count, unique_words=len(bible_vocab))
    
    mem = Memory(
        timestamp=datetime.now().isoformat(),
        phase="PHASE_2_BIBLE",
        entries_processed=total_verses,
        entries_learned=len(bible_vocab)
    )
    hb.save_memory(mem)
    hb.beat("PHASE_2", "Bible extraction complete", total_verses=total_verses, unique_words=len(bible_vocab))
    
    return bible_vocab


# ============================================================================
# PHASE 3: BUILD BIDIRECTIONAL MAPPING
# ============================================================================

def phase_3_build_bidirectional(en_zo_dict: dict[str, list[DictEntry]]) -> tuple[dict, dict]:
    """Create EN→ZO and ZO→EN mappings."""
    hb.beat("PHASE_3", "Building bidirectional mappings...")
    
    en_to_zo = {}
    zo_to_en = defaultdict(list)
    
    for en_word, entries in en_zo_dict.items():
        # Pick best entry (highest confidence, most frequent)
        best = max(entries, key=lambda e: (e.confidence, e.frequency))
        
        en_to_zo[en_word] = {
            "zo": best.zo,
            "confidence": best.confidence,
            "source": best.source,
            "context": best.context,
            "bible_ref": best.bible_ref,
            "frequency": best.frequency
        }
        
        # Reverse mapping
        zo_key = best.zo.lower()
        zo_to_en[zo_key].append({
            "en": en_word,
            "confidence": best.confidence,
            "source": best.source
        })
    
    # Deduplicate ZO→EN
    zo_to_en_final = {}
    for zo_word, en_list in zo_to_en.items():
        best_en = max(en_list, key=lambda e: e["confidence"])
        zo_to_en_final[zo_word] = best_en
    
    mem = Memory(
        timestamp=datetime.now().isoformat(),
        phase="PHASE_3_BIDIRECTIONAL",
        entries_processed=len(en_to_zo),
        bidirectional_pairs=len(zo_to_en_final)
    )
    hb.save_memory(mem)
    hb.beat("PHASE_3", "Bidirectional mapping complete", en_to_zo=len(en_to_zo), zo_to_en=len(zo_to_en_final))
    
    return en_to_zo, zo_to_en_final


# ============================================================================
# PHASE 4: AUDIT & IDENTIFY GAPS
# ============================================================================

def phase_4_audit(en_to_zo: dict, zo_to_en: dict, bible_vocab: dict) -> AuditReport:
    """Audit dictionary coverage and identify gaps."""
    hb.beat("PHASE_4", "Starting audit...")
    
    # Coverage analysis
    bidirectional_count = len(set(en_to_zo.keys()) & set(zo_to_en.keys()))
    coverage = bidirectional_count / max(len(en_to_zo), 1) * 100
    
    # Confidence distribution
    conf_dist = defaultdict(int)
    for entry in en_to_zo.values():
        conf_bucket = int(entry["confidence"] * 10) / 10
        conf_dist[conf_bucket] += 1
    
    # Identify gaps (Bible words not in dictionary)
    gaps = []
    for zo_word in bible_vocab.keys():
        if zo_word not in zo_to_en:
            gaps.append(zo_word)
    
    report = AuditReport(
        timestamp=datetime.now().isoformat(),
        total_entries=len(en_to_zo),
        en_to_zo_pairs=len(en_to_zo),
        zo_to_en_pairs=len(zo_to_en),
        bidirectional_coverage=coverage,
        confidence_distribution=dict(conf_dist),
        gaps=gaps[:100]  # Top 100 gaps
    )
    
    mem = Memory(
        timestamp=datetime.now().isoformat(),
        phase="PHASE_4_AUDIT",
        entries_processed=len(en_to_zo),
        gaps_identified=len(gaps)
    )
    hb.save_memory(mem)
    
    with open(AUDIT_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(report.to_dict(), ensure_ascii=False) + "\n")
    
    hb.beat("PHASE_4", "Audit complete", coverage_pct=f"{coverage:.1f}%", gaps=len(gaps))
    
    return report


# ============================================================================
# PHASE 5: WRITE FINAL DICTIONARIES
# ============================================================================

def phase_5_write_output(en_to_zo: dict, zo_to_en: dict):
    """Write final EN→ZO and ZO→EN dictionaries."""
    hb.beat("PHASE_5", "Writing output dictionaries...")
    
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    # EN→ZO
    with open(FINAL_EN_ZO, "w", encoding="utf-8") as f:
        for en_word, data in sorted(en_to_zo.items()):
            entry = {
                "en": en_word,
                "zo": data["zo"],
                "confidence": data["confidence"],
                "source": data["source"],
                "context": data["context"],
                "bible_ref": data["bible_ref"],
                "frequency": data["frequency"]
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    hb.beat("PHASE_5", f"Wrote EN→ZO", file=str(FINAL_EN_ZO), entries=len(en_to_zo))
    
    # ZO→EN
    with open(FINAL_ZO_EN, "w", encoding="utf-8") as f:
        for zo_word, data in sorted(zo_to_en.items()):
            entry = {
                "zo": zo_word,
                "en": data["en"],
                "confidence": data["confidence"],
                "source": data["source"]
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    hb.beat("PHASE_5", f"Wrote ZO→EN", file=str(FINAL_ZO_EN), entries=len(zo_to_en))
    
    mem = Memory(
        timestamp=datetime.now().isoformat(),
        phase="PHASE_5_OUTPUT",
        entries_processed=len(en_to_zo) + len(zo_to_en)
    )
    hb.save_memory(mem)


# ============================================================================
# PHASE 6: SEED NEXTJS DATABASE
# ============================================================================

def phase_6_seed_nextjs():
    """Seed the Next.js Prisma database."""
    hb.beat("PHASE_6", "Seeding Next.js database...")
    
    seed_script = WEBSITE_DIR / "scripts" / "seed-dictionary.ts"
    if not seed_script.exists():
        hb.beat("PHASE_6", f"Seed script not found: {seed_script}")
        return
    
    try:
        result = subprocess.run(
            ["bunx", "tsx", str(seed_script)],
            cwd=str(WEBSITE_DIR),
            capture_output=True,
            text=True,
            timeout=300
        )
        
        if result.returncode == 0:
            hb.beat("PHASE_6", "Database seeding successful")
        else:
            hb.beat("PHASE_6", f"Seeding failed: {result.stderr}")
    except Exception as e:
        hb.beat("PHASE_6", f"Seeding error: {str(e)}")


# ============================================================================
# MAIN ORCHESTRATOR
# ============================================================================

def main() -> int:
    """Execute complete dictionary rebuild."""
    hb.beat("MAIN", "🚀 ZOLAI DICTIONARY REBUILD ORCHESTRATOR STARTING")
    hb.beat("MAIN", f"Project root: {PROJECT_ROOT}")
    hb.beat("MAIN", f"Output directory: {OUTPUT_DIR}")
    
    try:
        # Phase 1: Load dictionaries
        en_zo_dict = phase_1_load_dictionaries()
        
        # Phase 2: Extract Bible vocabulary
        bible_vocab = phase_2_extract_bible_vocab()
        
        # Phase 3: Build bidirectional mappings
        en_to_zo, zo_to_en = phase_3_build_bidirectional(en_zo_dict)
        
        # Phase 4: Audit
        audit_report = phase_4_audit(en_to_zo, zo_to_en, bible_vocab)
        
        # Phase 5: Write output
        phase_5_write_output(en_to_zo, zo_to_en)
        
        # Phase 6: Seed Next.js
        phase_6_seed_nextjs()
        
        hb.beat("MAIN", "✅ REBUILD COMPLETE")
        hb.beat("MAIN", f"EN→ZO entries: {len(en_to_zo)}")
        hb.beat("MAIN", f"ZO→EN entries: {len(zo_to_en)}")
        hb.beat("MAIN", f"Bidirectional coverage: {audit_report.bidirectional_coverage:.1f}%")
        hb.beat("MAIN", f"Gaps identified: {len(audit_report.gaps)}")
        
        return 0
    
    except Exception as e:
        hb.beat("MAIN", f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
