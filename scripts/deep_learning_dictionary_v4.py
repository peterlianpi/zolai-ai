from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import hashlib
import sys
import re

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v4"
DB_PATH = DATA_DIR / "dictionary_v4.db"
LEARNING_LOG = DATA_DIR / "learning_log.jsonl"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def log_learning(data: dict) -> None:
    """Log learning progress"""
    with open(LEARNING_LOG, "a", encoding="utf-8") as f:
        f.write(json.dumps(data, ensure_ascii=False) + "\n")

def init_db() -> sqlite3.Connection:
    """Initialize database"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            en TEXT NOT NULL,
            zo TEXT NOT NULL,
            pos TEXT,
            confidence REAL DEFAULT 0.5,
            source TEXT,
            topic TEXT,
            frequency INTEGER DEFAULT 1,
            learning_count INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS learning_history (
            id TEXT PRIMARY KEY,
            entry_id TEXT,
            cycle INTEGER,
            confidence_before REAL,
            confidence_after REAL,
            source TEXT,
            learned_at TEXT
        )
    """)
    conn.commit()
    return conn

def load_existing() -> dict:
    """Load existing v7 dictionary"""
    en_zo = {}
    v7_en = PROJECT_ROOT / "data" / "processed" / "rebuild_v1" / "final_en_zo_dictionary_v7.jsonl"
    
    if v7_en.exists():
        with open(v7_en, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    en_zo[entry["en"]] = entry
                except:
                    pass
    
    log_msg(f"Loaded {len(en_zo)} existing entries")
    return en_zo

def extract_bible_deep(cycle: int) -> dict:
    """Deep extraction from Bible with learning"""
    entries = {}
    bible_dir = PROJECT_ROOT / "data" / "master" / "sources"
    
    if not bible_dir.exists():
        log_msg(f"[Cycle {cycle}] Bible directory not found")
        return entries
    
    bible_files = list(bible_dir.glob("bible_*.jsonl"))
    log_msg(f"[Cycle {cycle}] Processing {len(bible_files)} Bible files")
    
    for bible_file in bible_files:
        try:
            with open(bible_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        en = entry.get("en", "").strip().lower()
                        zo = entry.get("zo", "").strip().lower()
                        
                        if en and zo and len(en) > 1 and len(zo) > 1:
                            key = f"{en}:{zo}"
                            if key not in entries:
                                entries[key] = {
                                    "en": en,
                                    "zo": zo,
                                    "source": "bible",
                                    "confidence": 0.9,
                                    "topic": "religion",
                                    "frequency": 1,
                                    "learning_count": 1
                                }
                            else:
                                entries[key]["frequency"] += 1
                                entries[key]["learning_count"] += 1
                                entries[key]["confidence"] = min(0.95, entries[key]["confidence"] + 0.01)
                    except:
                        pass
        except Exception as e:
            log_msg(f"[Cycle {cycle}] Error in {bible_file.name}: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from Bible")
    log_learning({
        "cycle": cycle,
        "source": "bible",
        "entries_found": len(entries),
        "timestamp": datetime.now().isoformat()
    })
    return entries

def extract_tongdot_deep(cycle: int) -> dict:
    """Deep extraction from TongDot"""
    entries = {}
    
    # Try multiple possible locations
    tongdot_files = [
        PROJECT_ROOT / "data" / "master" / "sources" / "tongdot_dictionary.jsonl",
        PROJECT_ROOT / "data" / "raw" / "tongdot_dictionary.jsonl",
    ]
    
    tongdot_file = None
    for f in tongdot_files:
        if f.exists():
            tongdot_file = f
            break
    
    if not tongdot_file:
        log_msg(f"[Cycle {cycle}] TongDot not found")
        return entries
    
    try:
        with open(tongdot_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    zo = entry.get("zo", "").strip().lower()
                    en = entry.get("en", "").strip().lower()
                    
                    if zo and en and len(zo) > 1 and len(en) > 1:
                        key = f"{en}:{zo}"
                        if key not in entries:
                            entries[key] = {
                                "en": en,
                                "zo": zo,
                                "source": "tongdot",
                                "confidence": 0.85,
                                "frequency": 1,
                                "learning_count": 1
                            }
                        else:
                            entries[key]["frequency"] += 1
                            entries[key]["learning_count"] += 1
                            entries[key]["confidence"] = min(0.95, entries[key]["confidence"] + 0.02)
                except:
                    pass
    except Exception as e:
        log_msg(f"[Cycle {cycle}] Error reading TongDot: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from TongDot")
    log_learning({
        "cycle": cycle,
        "source": "tongdot",
        "entries_found": len(entries),
        "timestamp": datetime.now().isoformat()
    })
    return entries

def extract_rvasia_deep(cycle: int) -> dict:
    """Deep extraction from RVAsia"""
    entries = {}
    
    rvasia_files = [
        PROJECT_ROOT / "data" / "rvasia_tedim.jsonl",
        PROJECT_ROOT / "data" / "master" / "sources" / "rvasia_tedim.jsonl",
    ]
    
    rvasia_file = None
    for f in rvasia_files:
        if f.exists():
            rvasia_file = f
            break
    
    if not rvasia_file:
        log_msg(f"[Cycle {cycle}] RVAsia not found")
        return entries
    
    try:
        with open(rvasia_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    en = entry.get("en", "").strip().lower()
                    zo = entry.get("zo", "").strip().lower()
                    
                    if en and zo and len(en) > 1 and len(zo) > 1:
                        key = f"{en}:{zo}"
                        if key not in entries:
                            entries[key] = {
                                "en": en,
                                "zo": zo,
                                "source": "rvasia",
                                "confidence": 0.8,
                                "topic": "religion",
                                "frequency": 1,
                                "learning_count": 1
                            }
                        else:
                            entries[key]["frequency"] += 1
                            entries[key]["learning_count"] += 1
                            entries[key]["confidence"] = min(0.95, entries[key]["confidence"] + 0.01)
                except:
                    pass
    except Exception as e:
        log_msg(f"[Cycle {cycle}] Error reading RVAsia: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from RVAsia")
    log_learning({
        "cycle": cycle,
        "source": "rvasia",
        "entries_found": len(entries),
        "timestamp": datetime.now().isoformat()
    })
    return entries

def extract_zomidictionary_deep(cycle: int) -> dict:
    """Deep extraction from ZomiDictionary"""
    entries = {}
    
    zomi_files = [
        PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl",
        PROJECT_ROOT / "data" / "raw" / "zomidictionary_app_full.jsonl",
    ]
    
    zomi_file = None
    for f in zomi_files:
        if f.exists():
            zomi_file = f
            break
    
    if not zomi_file:
        log_msg(f"[Cycle {cycle}] ZomiDictionary not found")
        return entries
    
    try:
        with open(zomi_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    en = entry.get("en", "").strip().lower()
                    zo = entry.get("zo", "").strip().lower()
                    
                    if en and zo and len(en) > 1 and len(zo) > 1:
                        key = f"{en}:{zo}"
                        if key not in entries:
                            entries[key] = {
                                "en": en,
                                "zo": zo,
                                "source": "zomidictionary",
                                "confidence": 0.75,
                                "frequency": 1,
                                "learning_count": 1
                            }
                        else:
                            entries[key]["frequency"] += 1
                            entries[key]["learning_count"] += 1
                            entries[key]["confidence"] = min(0.95, entries[key]["confidence"] + 0.01)
                except:
                    pass
    except Exception as e:
        log_msg(f"[Cycle {cycle}] Error reading ZomiDictionary: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from ZomiDictionary")
    log_learning({
        "cycle": cycle,
        "source": "zomidictionary",
        "entries_found": len(entries),
        "timestamp": datetime.now().isoformat()
    })
    return entries

def extract_corpus_deep(cycle: int) -> dict:
    """Deep extraction from master corpus"""
    entries = {}
    
    corpus_files = [
        PROJECT_ROOT / "data" / "master" / "sources" / "zolai_corpus_master.jsonl",
        PROJECT_ROOT / "data" / "master" / "combined" / "sentences.jsonl",
    ]
    
    corpus_file = None
    for f in corpus_files:
        if f.exists():
            corpus_file = f
            break
    
    if not corpus_file:
        log_msg(f"[Cycle {cycle}] Corpus not found")
        return entries
    
    count = 0
    try:
        with open(corpus_file, encoding="utf-8") as f:
            for line in f:
                if count > 2000:  # Sample
                    break
                try:
                    entry = json.loads(line)
                    en = entry.get("en", "").strip().lower()
                    zo = entry.get("zo", "").strip().lower()
                    
                    if en and zo and len(en) > 1 and len(zo) > 1:
                        key = f"{en}:{zo}"
                        if key not in entries:
                            entries[key] = {
                                "en": en,
                                "zo": zo,
                                "source": "corpus",
                                "confidence": 0.7,
                                "frequency": 1,
                                "learning_count": 1
                            }
                        else:
                            entries[key]["frequency"] += 1
                            entries[key]["learning_count"] += 1
                            entries[key]["confidence"] = min(0.95, entries[key]["confidence"] + 0.01)
                    count += 1
                except:
                    pass
    except Exception as e:
        log_msg(f"[Cycle {cycle}] Error reading corpus: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from corpus")
    log_learning({
        "cycle": cycle,
        "source": "corpus",
        "entries_found": len(entries),
        "timestamp": datetime.now().isoformat()
    })
    return entries

def merge_and_learn(conn: sqlite3.Connection, existing: dict, extracted: dict, cycle: int) -> tuple[dict, int]:
    """Merge extracted with existing and track learning"""
    cursor = conn.cursor()
    merged = existing.copy()
    new_entries = 0
    
    for key, entry in extracted.items():
        if "en" in entry and "zo" in entry:
            en = entry["en"]
            zo = entry["zo"]
            
            # Check if entry exists
            cursor.execute("SELECT id, confidence FROM entries WHERE en = ? AND zo = ?", (en, zo))
            result = cursor.fetchone()
            
            if result:
                # Update existing with learning
                entry_id, old_conf = result
                new_conf = min(0.95, old_conf + 0.02)
                cursor.execute(
                    "UPDATE entries SET confidence = ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                    (new_conf, datetime.now().isoformat(), entry_id)
                )
                
                # Log learning
                cursor.execute("""
                    INSERT INTO learning_history (id, entry_id, cycle, confidence_before, confidence_after, source, learned_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                """, (
                    hashlib.md5(f"{entry_id}:{cycle}".encode()).hexdigest(),
                    entry_id,
                    cycle,
                    old_conf,
                    new_conf,
                    entry.get("source", ""),
                    datetime.now().isoformat()
                ))
            else:
                # New entry
                entry_id = hashlib.md5(f"{en}:{zo}".encode()).hexdigest()
                cursor.execute("""
                    INSERT INTO entries (id, en, zo, source, confidence, frequency, learning_count, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    entry_id,
                    en,
                    zo,
                    entry.get("source", ""),
                    entry.get("confidence", 0.5),
                    entry.get("frequency", 1),
                    entry.get("learning_count", 1),
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                new_entries += 1
    
    conn.commit()
    log_msg(f"[Cycle {cycle}] Merged {new_entries} new entries")
    return merged, new_entries

def get_stats(conn: sqlite3.Connection, cycle: int) -> dict:
    """Get current statistics"""
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM entries")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE confidence >= 0.8")
    high_conf = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM learning_history WHERE cycle = ?", (cycle,))
    learned_this_cycle = cursor.fetchone()[0]
    
    stats = {
        "cycle": cycle,
        "total_entries": total,
        "avg_confidence": avg_conf,
        "high_confidence": high_conf,
        "learned_this_cycle": learned_this_cycle,
        "timestamp": datetime.now().isoformat()
    }
    
    log_msg(f"[Cycle {cycle}] Stats: {total} entries, avg conf: {avg_conf:.2f}, high conf: {high_conf}")
    return stats

def main() -> int:
    log_msg("=== DEEP LEARNING DICTIONARY V4 ===")
    
    conn = init_db()
    existing = load_existing()
    
    # Run multiple learning cycles
    for cycle in range(1, 4):  # 3 cycles of deep learning
        log_msg(f"\n=== CYCLE {cycle} ===")
        
        # Extract from all resources
        bible = extract_bible_deep(cycle)
        tongdot = extract_tongdot_deep(cycle)
        rvasia = extract_rvasia_deep(cycle)
        zomi = extract_zomidictionary_deep(cycle)
        corpus = extract_corpus_deep(cycle)
        
        # Merge all
        all_extracted = {**bible, **tongdot, **rvasia, **zomi, **corpus}
        log_msg(f"[Cycle {cycle}] Total extracted: {len(all_extracted)}")
        
        # Merge and learn
        existing, new = merge_and_learn(conn, existing, all_extracted, cycle)
        
        # Get stats
        stats = get_stats(conn, cycle)
        log_learning(stats)
        
        log_msg(f"[Cycle {cycle}] Complete\n")
    
    # Export final results
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM entries")
    final_count = cursor.fetchone()[0]
    
    log_msg(f"\n=== FINAL RESULTS ===")
    log_msg(f"Total entries: {final_count}")
    log_msg(f"Learning cycles: 3")
    log_msg(f"Database: {DB_PATH}")
    
    conn.close()
    log_msg("✅ Deep learning complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
