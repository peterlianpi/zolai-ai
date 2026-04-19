from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import sys
import re
from collections import defaultdict

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v5"
DB_PATH = DATA_DIR / "dictionary_v5.db"
LEARNING_LOG = DATA_DIR / "learning_log.jsonl"
CHECKPOINT_FILE = DATA_DIR / "checkpoint.json"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def save_checkpoint(cycle: int, source: str, progress: int) -> None:
    """Save progress for resumption"""
    with open(CHECKPOINT_FILE, "w", encoding="utf-8") as f:
        json.dump({"cycle": cycle, "source": source, "progress": progress}, f)

def load_checkpoint() -> dict:
    """Load last checkpoint"""
    if CHECKPOINT_FILE.exists():
        with open(CHECKPOINT_FILE, encoding="utf-8") as f:
            return json.load(f)
    return {"cycle": 1, "source": "", "progress": 0}

def init_db() -> sqlite3.Connection:
    """Initialize database with learning metrics"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            en TEXT,
            zo TEXT,
            confidence REAL DEFAULT 0.5,
            source TEXT,
            frequency INTEGER DEFAULT 1,
            learning_count INTEGER DEFAULT 0,
            metric_score REAL DEFAULT 0.0,
            context TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS zo_patterns (
            id TEXT PRIMARY KEY,
            pattern TEXT,
            frequency INTEGER DEFAULT 1,
            confidence REAL DEFAULT 0.5,
            source TEXT,
            context TEXT,
            created_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS learning_metrics (
            id TEXT PRIMARY KEY,
            cycle INTEGER,
            source TEXT,
            entries_found INTEGER,
            entries_learned INTEGER,
            avg_confidence REAL,
            timestamp TEXT
        )
    """)
    conn.commit()
    return conn

def load_dictionary() -> dict:
    """Load existing dictionary for context lookup"""
    dictionary = {}
    v7_en = PROJECT_ROOT / "data" / "processed" / "rebuild_v1" / "final_en_zo_dictionary_v7.jsonl"
    
    if v7_en.exists():
        with open(v7_en, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    en = entry.get("en", "").strip().lower()
                    zo = entry.get("zo", "").strip().lower()
                    if en and zo:
                        dictionary[en] = zo
                        dictionary[zo] = en
                except:
                    pass
    
    log_msg(f"Loaded {len(dictionary)} dictionary entries for context")
    return dictionary

def extract_zo_patterns(text: str) -> list[str]:
    """Extract Zolai word patterns from text"""
    # Zolai words: typically 2-15 chars, may contain apostrophes
    patterns = re.findall(r"\b[a-z']+\b", text.lower())
    return [p for p in patterns if 2 < len(p) < 20 and p.count("'") <= 1]

def learn_from_zo_text(conn: sqlite3.Connection, text: str, source: str, cycle: int, dictionary: dict) -> int:
    """Learn from Zolai text by extracting patterns and finding context"""
    cursor = conn.cursor()
    learned = 0
    
    patterns = extract_zo_patterns(text)
    pattern_freq = defaultdict(int)
    
    for pattern in patterns:
        pattern_freq[pattern] += 1
    
    for pattern, freq in pattern_freq.items():
        # Check if pattern exists in dictionary
        if pattern in dictionary:
            en_meaning = dictionary[pattern]
            
            # Create entry
            entry_id = hashlib.md5(f"{en_meaning}:{pattern}".encode()).hexdigest()
            cursor.execute("SELECT id, confidence FROM entries WHERE id = ?", (entry_id,))
            result = cursor.fetchone()
            
            if result:
                # Update with learning
                old_conf = result[1]
                new_conf = min(0.95, old_conf + 0.02)
                cursor.execute(
                    "UPDATE entries SET confidence = ?, frequency = frequency + ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                    (new_conf, freq, datetime.now().isoformat(), entry_id)
                )
            else:
                # New entry from context
                cursor.execute("""
                    INSERT OR IGNORE INTO entries (id, en, zo, confidence, source, frequency, learning_count, context, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    entry_id,
                    en_meaning,
                    pattern,
                    0.7,
                    source,
                    freq,
                    1,
                    text[:100],
                    datetime.now().isoformat(),
                    datetime.now().isoformat()
                ))
                learned += 1
        else:
            # Store pattern for later analysis
            pattern_id = hashlib.md5(f"{pattern}:{cycle}".encode()).hexdigest()
            cursor.execute("""
                INSERT OR IGNORE INTO zo_patterns (id, pattern, frequency, source, context, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                pattern_id,
                pattern,
                freq,
                source,
                text[:100],
                datetime.now().isoformat()
            ))
    
    conn.commit()
    return learned

def extract_zomidictionary(conn: sqlite3.Connection, cycle: int, dictionary: dict) -> int:
    """Extract from ZomiDictionary with flexible parsing"""
    zomi_file = PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl"
    
    if not zomi_file.exists():
        log_msg(f"[Cycle {cycle}] ZomiDictionary not found")
        return 0
    
    cursor = conn.cursor()
    learned = 0
    
    try:
        with open(zomi_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    zo = entry.get("zolai", "").strip().lower()
                    en = entry.get("english", "").strip().lower()
                    
                    if zo and en and len(zo) > 1 and len(en) > 1:
                        entry_id = hashlib.md5(f"{en}:{zo}".encode()).hexdigest()
                        cursor.execute("""
                            INSERT OR IGNORE INTO entries (id, en, zo, confidence, source, frequency, learning_count, created_at, updated_at)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            entry_id,
                            en,
                            zo,
                            0.85,
                            "zomidictionary",
                            1,
                            1,
                            datetime.now().isoformat(),
                            datetime.now().isoformat()
                        ))
                        learned += 1
                except:
                    pass
        conn.commit()
    except Exception as e:
        log_msg(f"[Cycle {cycle}] Error reading ZomiDictionary: {e}")
    
    log_msg(f"[Cycle {cycle}] Learned {learned} from ZomiDictionary")
    return learned

def extract_bible_texts(conn: sqlite3.Connection, cycle: int, dictionary: dict) -> int:
    """Extract from Bible texts by learning Zolai patterns"""
    bible_dir = PROJECT_ROOT / "data" / "master" / "sources"
    
    if not bible_dir.exists():
        log_msg(f"[Cycle {cycle}] Bible directory not found")
        return 0
    
    bible_files = list(bible_dir.glob("bible_tb77*.jsonl"))[:3]  # Sample
    learned = 0
    
    for bible_file in bible_files:
        try:
            with open(bible_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        text = entry.get("text", "")
                        if text:
                            learned += learn_from_zo_text(conn, text, "bible", cycle, dictionary)
                    except:
                        pass
        except Exception as e:
            log_msg(f"[Cycle {cycle}] Error reading {bible_file.name}: {e}")
    
    log_msg(f"[Cycle {cycle}] Learned {learned} from Bible texts")
    return learned

def extract_resources(conn: sqlite3.Connection, cycle: int, dictionary: dict) -> int:
    """Extract from all available resources"""
    learned = 0
    
    # ZomiDictionary
    learned += extract_zomidictionary(conn, cycle, dictionary)
    
    # Bible texts
    learned += extract_bible_texts(conn, cycle, dictionary)
    
    # Other JSONL files
    raw_dir = PROJECT_ROOT / "data" / "raw"
    if raw_dir.exists():
        for jsonl_file in list(raw_dir.glob("*.jsonl"))[:5]:
            try:
                with open(jsonl_file, encoding="utf-8") as f:
                    for line in f:
                        try:
                            entry = json.loads(line)
                            # Try multiple text fields
                            for field in ["text", "content", "zo", "zolai", "english", "en"]:
                                if field in entry:
                                    text = str(entry[field]).lower()
                                    if len(text) > 10:
                                        learned += learn_from_zo_text(conn, text, jsonl_file.stem, cycle, dictionary)
                                        break
                        except:
                            pass
            except:
                pass
    
    return learned

def calculate_metrics(conn: sqlite3.Connection, cycle: int, source: str, found: int, learned: int) -> dict:
    """Calculate learning metrics"""
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM entries")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    metrics = {
        "cycle": cycle,
        "source": source,
        "entries_found": found,
        "entries_learned": learned,
        "total_entries": total,
        "avg_confidence": avg_conf,
        "timestamp": datetime.now().isoformat()
    }
    
    # Save metrics
    cursor.execute("""
        INSERT INTO learning_metrics (id, cycle, source, entries_found, entries_learned, avg_confidence, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        hashlib.md5(f"{cycle}:{source}".encode()).hexdigest(),
        cycle,
        source,
        found,
        learned,
        avg_conf,
        datetime.now().isoformat()
    ))
    conn.commit()
    
    log_msg(f"[Cycle {cycle}] Metrics: {total} total, {learned} learned, avg conf: {avg_conf:.2f}")
    return metrics

def main() -> int:
    log_msg("=== INTELLIGENT LEARNING DICTIONARY V5 ===")
    
    conn = init_db()
    dictionary = load_dictionary()
    checkpoint = load_checkpoint()
    
    log_msg(f"Resuming from cycle {checkpoint['cycle']}, source: {checkpoint['source']}")
    
    # Run learning cycles
    for cycle in range(checkpoint["cycle"], 4):
        log_msg(f"\n=== CYCLE {cycle} ===")
        
        # Extract and learn from all resources
        learned = extract_resources(conn, cycle, dictionary)
        
        # Calculate metrics
        metrics = calculate_metrics(conn, cycle, "all_sources", 0, learned)
        
        # Save checkpoint
        save_checkpoint(cycle + 1, "", 0)
        
        log_msg(f"[Cycle {cycle}] Complete - learned {learned} entries\n")
    
    # Final stats
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM entries")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM zo_patterns")
    patterns = cursor.fetchone()[0]
    
    log_msg(f"\n=== FINAL RESULTS ===")
    log_msg(f"Total entries: {total}")
    log_msg(f"Zolai patterns discovered: {patterns}")
    log_msg(f"Avg confidence: {avg_conf:.2f}")
    log_msg(f"Database: {DB_PATH}")
    
    conn.close()
    log_msg("✅ Intelligent learning complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
