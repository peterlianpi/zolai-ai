from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import sys

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
                    en = entry.get("en", "").strip().lower()
                    zo = entry.get("zo", "").strip().lower()
                    if en and zo:
                        key = f"{en}:{zo}"
                        en_zo[key] = entry
                except:
                    pass
    
    log_msg(f"Loaded {len(en_zo)} existing entries")
    return en_zo

def extract_zomidictionary(cycle: int) -> dict:
    """Extract from ZomiDictionary (zolai/english fields)"""
    entries = {}
    zomi_file = PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl"
    
    if not zomi_file.exists():
        log_msg(f"[Cycle {cycle}] ZomiDictionary not found")
        return entries
    
    try:
        with open(zomi_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    zo = entry.get("zolai", "").strip().lower()
                    en = entry.get("english", "").strip().lower()
                    
                    if zo and en and len(zo) > 1 and len(en) > 1:
                        key = f"{en}:{zo}"
                        if key not in entries:
                            entries[key] = {
                                "en": en,
                                "zo": zo,
                                "source": "zomidictionary",
                                "confidence": 0.8,
                                "pos": entry.get("part_of_speech", ""),
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
    return entries

def extract_wordlists(cycle: int) -> dict:
    """Extract from wordlists"""
    entries = {}
    
    wordlist_files = [
        PROJECT_ROOT / "data" / "raw" / "wordlist_en_zo.jsonl",
        PROJECT_ROOT / "data" / "raw" / "zo_en_wordlist.jsonl",
    ]
    
    for wl_file in wordlist_files:
        if not wl_file.exists():
            continue
        
        try:
            with open(wl_file, encoding="utf-8") as f:
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
                                    "source": "wordlist",
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
            log_msg(f"[Cycle {cycle}] Error reading {wl_file.name}: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from wordlists")
    return entries

def extract_bible_parallel(cycle: int) -> dict:
    """Extract from parallel Bible (en/zo fields)"""
    entries = {}
    
    bible_files = [
        PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tbr17.jsonl",
        PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tdb77.jsonl",
        PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tedim2010.jsonl",
    ]
    
    for bible_file in bible_files:
        if not bible_file.exists():
            continue
        
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
            log_msg(f"[Cycle {cycle}] Error reading {bible_file.name}: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from Bible parallel")
    return entries

def merge_and_learn(conn: sqlite3.Connection, existing: dict, extracted: dict, cycle: int) -> tuple[dict, int]:
    """Merge extracted with existing and track learning"""
    cursor = conn.cursor()
    merged = existing.copy()
    new_entries = 0
    now = datetime.now().isoformat()
    
    # Batch insert new entries
    new_rows = []
    for key, entry in extracted.items():
        en = entry.get("en", "")
        zo = entry.get("zo", "")
        
        if not en or not zo:
            continue
        
        # Check if entry exists
        cursor.execute("SELECT id, confidence FROM entries WHERE en = ? AND zo = ?", (en, zo))
        result = cursor.fetchone()
        
        if result:
            # Update existing with learning
            entry_id, old_conf = result
            new_conf = min(0.95, old_conf + 0.02)
            cursor.execute(
                "UPDATE entries SET confidence = ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                (new_conf, now, entry_id)
            )
        else:
            # New entry
            entry_id = hashlib.md5(f"{en}:{zo}".encode()).hexdigest()
            new_rows.append((
                entry_id,
                en,
                zo,
                entry.get("source", ""),
                entry.get("confidence", 0.5),
                entry.get("frequency", 1),
                entry.get("learning_count", 1),
                now,
                now
            ))
            new_entries += 1
    
    # Batch insert
    if new_rows:
        cursor.executemany("""
            INSERT OR IGNORE INTO entries (id, en, zo, source, confidence, frequency, learning_count, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, new_rows)
    
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
    log_msg("=== DEEP LEARNING DICTIONARY V4 (FIXED) ===")
    
    conn = init_db()
    existing = load_existing()
    
    # Run multiple learning cycles
    for cycle in range(1, 4):  # 3 cycles
        log_msg(f"\n=== CYCLE {cycle} ===")
        
        # Extract from all resources
        zomi = extract_zomidictionary(cycle)
        wordlists = extract_wordlists(cycle)
        bible = extract_bible_parallel(cycle)
        
        # Merge all
        all_extracted = {**zomi, **wordlists, **bible}
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
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    log_msg(f"\n=== FINAL RESULTS ===")
    log_msg(f"Total entries: {final_count}")
    log_msg(f"Avg confidence: {avg_conf:.2f}")
    log_msg(f"Learning cycles: 3")
    log_msg(f"Database: {DB_PATH}")
    
    conn.close()
    log_msg("✅ Deep learning complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
