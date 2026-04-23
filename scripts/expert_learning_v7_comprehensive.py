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
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v7"
DB_PATH = DATA_DIR / "dictionary_v7.db"
EXPORT_DIR = DATA_DIR / "exports"
DATA_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            en TEXT,
            zo TEXT,
            confidence REAL DEFAULT 0.5,
            sources TEXT,
            frequency INTEGER DEFAULT 1,
            learning_count INTEGER DEFAULT 0,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.commit()
    return conn

def load_all_dicts() -> dict:
    """Load all 4 dictionaries"""
    all_dicts = {"zomidictionary": {}, "tongdot": {}, "wordlist": {}, "bible": {}}
    
    # 1. ZomiDictionary
    zomi_file = PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl"
    if zomi_file.exists():
        with open(zomi_file, encoding="utf-8") as f:
            for line in f:
                try:
                    e = json.loads(line)
                    zo = str(e.get("zolai", "")).strip().lower()
                    en = str(e.get("english", "")).strip().lower()
                    if zo and en and len(zo) > 1 and len(en) > 1:
                        all_dicts["zomidictionary"][f"{en}:{zo}"] = 1
                except:
                    pass
    
    # 2. TongDot
    for tf in [PROJECT_ROOT / "data" / "master" / "sources" / "tongdot_dictionary.jsonl"]:
        if tf.exists():
            with open(tf, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        zo = str(e.get("zo", "")).strip().lower()
                        en = str(e.get("en", "")).strip().lower()
                        if zo and en and len(zo) > 1 and len(en) > 1:
                            all_dicts["tongdot"][f"{en}:{zo}"] = 1
                    except:
                        pass
    
    # 3. Wordlists
    for wf in [PROJECT_ROOT / "data" / "raw" / "wordlist_en_zo.jsonl",
               PROJECT_ROOT / "data" / "raw" / "zo_en_wordlist.jsonl"]:
        if wf.exists():
            with open(wf, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        en = str(e.get("en") or e.get("english", "")).strip().lower()
                        zo = str(e.get("zo") or e.get("zolai", "")).strip().lower()
                        if en and zo and len(en) > 1 and len(zo) > 1:
                            all_dicts["wordlist"][f"{en}:{zo}"] = 1
                    except:
                        pass
    
    # 4. Bible parallel
    for bf in [PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tbr17.jsonl",
               PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tdb77.jsonl",
               PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tedim2010.jsonl"]:
        if bf.exists():
            with open(bf, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        en = str(e.get("en") or e.get("input", "")).strip().lower()
                        zo = str(e.get("zo") or e.get("output", "")).strip().lower()
                        if en and zo and len(en) > 2 and len(zo) > 2:
                            all_dicts["bible"][f"{en}:{zo}"] = 1
                    except:
                        pass
    
    for name, d in all_dicts.items():
        log_msg(f"Loaded {len(d)} from {name}")
    
    return all_dicts

def extract_all_sources(cycle: int) -> dict:
    """Extract from all /data sources"""
    entries = {}
    
    # All JSONL files in /data
    for jsonl_file in PROJECT_ROOT.glob("data/**/*.jsonl"):
        try:
            with open(jsonl_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        for en_f in ["en", "english", "eng", "input"]:
                            for zo_f in ["zo", "zolai", "zomi", "output"]:
                                if en_f in e and zo_f in e:
                                    en = str(e[en_f]).strip().lower()
                                    zo = str(e[zo_f]).strip().lower()
                                    if en and zo and len(en) > 1 and len(zo) > 1:
                                        key = f"{en}:{zo}"
                                        if key not in entries:
                                            entries[key] = 1
                    except:
                        pass
        except:
            pass
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from /data sources")
    return entries

def expert_score(key: str, all_dicts: dict) -> float:
    """Score based on dictionary consensus"""
    found = sum(1 for d in all_dicts.values() if key in d)
    
    if found >= 3:
        return 0.95
    elif found == 2:
        return 0.85
    elif found == 1:
        return 0.75
    else:
        return 0.60

def merge_cycle(conn: sqlite3.Connection, all_dicts: dict, extracted: dict, cycle: int) -> int:
    """Merge with expert scoring"""
    cursor = conn.cursor()
    learned = 0
    now = datetime.now().isoformat()
    
    for key in extracted:
        parts = key.split(":")
        if len(parts) != 2:
            continue
        
        en, zo = parts
        conf = expert_score(key, all_dicts)
        entry_id = hashlib.md5(key.encode()).hexdigest()
        
        cursor.execute("SELECT id, confidence FROM entries WHERE id = ?", (entry_id,))
        result = cursor.fetchone()
        
        if result:
            old_conf = result[1]
            new_conf = min(0.95, max(old_conf, conf))
            cursor.execute(
                "UPDATE entries SET confidence = ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                (new_conf, now, entry_id)
            )
        else:
            cursor.execute("""
                INSERT OR IGNORE INTO entries (id, en, zo, confidence, frequency, learning_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (entry_id, en, zo, conf, 1, 1, now, now))
            learned += 1
    
    conn.commit()
    log_msg(f"[Cycle {cycle}] Learned {learned} new entries")
    return learned

def export_results(conn: sqlite3.Connection) -> None:
    """Export to JSONL"""
    cursor = conn.cursor()
    
    # EN→ZO
    with open(EXPORT_DIR / "dictionary_en_zo.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT en, zo, confidence FROM entries ORDER BY confidence DESC")
        for en, zo, conf in cursor.fetchall():
            f.write(json.dumps({"en": en, "zo": zo, "confidence": conf}, ensure_ascii=False) + "\n")
    
    # ZO→EN
    with open(EXPORT_DIR / "dictionary_zo_en.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT zo, en, confidence FROM entries ORDER BY confidence DESC")
        for zo, en, conf in cursor.fetchall():
            f.write(json.dumps({"zo": zo, "en": en, "confidence": conf}, ensure_ascii=False) + "\n")
    
    log_msg(f"Exported to {EXPORT_DIR}")

def main() -> int:
    log_msg("=== EXPERT LEARNING V7 COMPREHENSIVE ===")
    
    conn = init_db()
    
    # Load all dictionaries
    log_msg("\n=== LOADING DICTIONARIES ===")
    all_dicts = load_all_dicts()
    
    # Deep learning cycles
    for cycle in range(1, 6):
        log_msg(f"\n=== CYCLE {cycle} ===")
        
        extracted = extract_all_sources(cycle)
        log_msg(f"[Cycle {cycle}] Total extracted: {len(extracted)}")
        
        learned = merge_cycle(conn, all_dicts, extracted, cycle)
    
    # Stats
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM entries")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE confidence >= 0.9")
    high_conf = cursor.fetchone()[0]
    
    log_msg(f"\n=== FINAL RESULTS ===")
    log_msg(f"Total entries: {total}")
    log_msg(f"Avg confidence: {avg_conf:.2f}")
    log_msg(f"High confidence (≥0.9): {high_conf}")
    
    # Export
    export_results(conn)
    
    conn.close()
    log_msg("✅ Expert learning V7 complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
