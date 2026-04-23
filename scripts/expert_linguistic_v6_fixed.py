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
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v6"
DB_PATH = DATA_DIR / "dictionary_v6.db"
DATA_DIR.mkdir(parents=True, exist_ok=True)

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

def load_zomidictionary() -> dict:
    """Load ZomiDictionary"""
    entries = {}
    zomi_file = PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl"
    
    if zomi_file.exists():
        with open(zomi_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    zo = entry.get("zolai", "").strip().lower()
                    en = entry.get("english", "").strip().lower()
                    if zo and en and len(zo) > 1 and len(en) > 1:
                        key = f"{en}:{zo}"
                        entries[key] = {"en": en, "zo": zo, "source": "zomidictionary"}
                except:
                    pass
    
    log_msg(f"Loaded {len(entries)} from ZomiDictionary")
    return entries

def load_tongdot() -> dict:
    """Load TongDot dictionary"""
    entries = {}
    
    # Try multiple locations
    tongdot_files = [
        PROJECT_ROOT / "data" / "master" / "sources" / "tongdot_dictionary.jsonl",
        PROJECT_ROOT / "data" / "raw" / "tongdot_dictionary.jsonl",
    ]
    
    for tongdot_file in tongdot_files:
        if tongdot_file.exists():
            with open(tongdot_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        zo = entry.get("zo", "").strip().lower()
                        en = entry.get("en", "").strip().lower()
                        if zo and en and len(zo) > 1 and len(en) > 1:
                            key = f"{en}:{zo}"
                            entries[key] = {"en": en, "zo": zo, "source": "tongdot"}
                    except:
                        pass
            break
    
    log_msg(f"Loaded {len(entries)} from TongDot")
    return entries

def load_wordlists() -> dict:
    """Load wordlists"""
    entries = {}
    
    for wl_file in [PROJECT_ROOT / "data" / "raw" / "wordlist_en_zo.jsonl",
                    PROJECT_ROOT / "data" / "raw" / "zo_en_wordlist.jsonl",
                    PROJECT_ROOT / "data" / "raw" / "zo_en_singlewords.jsonl"]:
        if wl_file.exists():
            with open(wl_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        # Try multiple field names
                        en = entry.get("en") or entry.get("english") or entry.get("eng")
                        zo = entry.get("zo") or entry.get("zolai") or entry.get("zomi")
                        
                        if en and zo:
                            en = str(en).strip().lower()
                            zo = str(zo).strip().lower()
                            if len(en) > 1 and len(zo) > 1:
                                key = f"{en}:{zo}"
                                entries[key] = {"en": en, "zo": zo, "source": "wordlist"}
                    except:
                        pass
    
    log_msg(f"Loaded {len(entries)} from wordlists")
    return entries

def load_bible_parallel() -> dict:
    """Load Bible parallel"""
    entries = {}
    
    for bible_file in [PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tbr17.jsonl",
                       PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tdb77.jsonl",
                       PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tedim2010.jsonl"]:
        if bible_file.exists():
            with open(bible_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        # Try multiple field names
                        en = entry.get("en") or entry.get("input") or entry.get("english")
                        zo = entry.get("zo") or entry.get("output") or entry.get("zolai")
                        
                        if en and zo:
                            en = str(en).strip().lower()
                            zo = str(zo).strip().lower()
                            if len(en) > 2 and len(zo) > 2:
                                key = f"{en}:{zo}"
                                entries[key] = {"en": en, "zo": zo, "source": "bible"}
                    except:
                        pass
    
    log_msg(f"Loaded {len(entries)} from Bible parallel")
    return entries

def extract_bible_md(cycle: int) -> dict:
    """Extract from Bible MD files"""
    entries = {}
    bible_dir = PROJECT_ROOT / "Cleaned_Bible" / "Parallel_Corpus" / "TDB77"
    
    if not bible_dir.exists():
        return entries
    
    md_files = list(bible_dir.glob("*.md"))[:5]
    
    for md_file in md_files:
        try:
            with open(md_file, encoding="utf-8") as f:
                lines = f.readlines()
                for i, line in enumerate(lines):
                    # Look for verse pairs (EN | ZO format)
                    if "|" in line:
                        parts = [p.strip() for p in line.split("|")]
                        if len(parts) >= 3:
                            en = parts[1].lower()
                            zo = parts[2].lower()
                            if en and zo and len(en) > 2 and len(zo) > 2:
                                key = f"{en}:{zo}"
                                if key not in entries:
                                    entries[key] = {"en": en, "zo": zo, "source": "bible_md"}
        except:
            pass
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from Bible MD")
    return entries

def extract_resources(cycle: int) -> dict:
    """Extract from all resource files"""
    entries = {}
    
    for resource_dir in [PROJECT_ROOT / "resources", PROJECT_ROOT / "data" / "raw"]:
        if not resource_dir.exists():
            continue
        
        # JSONL files
        for jsonl_file in list(resource_dir.glob("**/*.jsonl"))[:30]:
            try:
                with open(jsonl_file, encoding="utf-8") as f:
                    for line in f:
                        try:
                            entry = json.loads(line)
                            for en_field in ["en", "english", "eng", "english_text"]:
                                for zo_field in ["zo", "zolai", "zomi", "zolai_text"]:
                                    if en_field in entry and zo_field in entry:
                                        en = str(entry[en_field]).strip().lower()
                                        zo = str(entry[zo_field]).strip().lower()
                                        if en and zo and len(en) > 2 and len(zo) > 2:
                                            key = f"{en}:{zo}"
                                            if key not in entries:
                                                entries[key] = {"en": en, "zo": zo, "source": jsonl_file.stem}
                        except:
                            pass
            except:
                pass
        
        # MD files
        for md_file in list(resource_dir.glob("**/*.md"))[:30]:
            try:
                with open(md_file, encoding="utf-8") as f:
                    lines = f.readlines()
                    for line in lines:
                        if "|" in line:
                            parts = [p.strip() for p in line.split("|")]
                            if len(parts) >= 3:
                                en = parts[1].lower()
                                zo = parts[2].lower()
                                if en and zo and len(en) > 2 and len(zo) > 2:
                                    key = f"{en}:{zo}"
                                    if key not in entries:
                                        entries[key] = {"en": en, "zo": zo, "source": md_file.stem}
            except:
                pass
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from resources")
    return entries

def expert_validate(entry: dict, dicts: list[dict]) -> float:
    """Expert validation: score based on dictionary consensus"""
    en = entry.get("en", "")
    zo = entry.get("zo", "")
    key = f"{en}:{zo}"
    
    found_in = sum(1 for d in dicts if key in d)
    
    # Confidence based on consensus
    if found_in >= 3:
        return 0.95
    elif found_in == 2:
        return 0.85
    elif found_in == 1:
        return 0.75
    else:
        return 0.60

def merge_entries(conn: sqlite3.Connection, dicts: list[dict], extracted: dict, cycle: int) -> int:
    """Merge with expert validation"""
    cursor = conn.cursor()
    learned = 0
    now = datetime.now().isoformat()
    
    for key, entry in extracted.items():
        en = entry.get("en", "")
        zo = entry.get("zo", "")
        
        if not en or not zo:
            continue
        
        confidence = expert_validate(entry, dicts)
        entry_id = hashlib.md5(f"{en}:{zo}".encode()).hexdigest()
        
        cursor.execute("SELECT id, confidence FROM entries WHERE id = ?", (entry_id,))
        result = cursor.fetchone()
        
        if result:
            old_conf = result[1]
            new_conf = min(0.95, max(old_conf, confidence))
            cursor.execute(
                "UPDATE entries SET confidence = ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                (new_conf, now, entry_id)
            )
        else:
            cursor.execute("""
                INSERT OR IGNORE INTO entries (id, en, zo, confidence, sources, frequency, learning_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (entry_id, en, zo, confidence, entry.get("source", ""), 1, 1, now, now))
            learned += 1
    
    conn.commit()
    log_msg(f"[Cycle {cycle}] Learned {learned} entries")
    return learned

def main() -> int:
    log_msg("=== EXPERT LINGUISTIC LEARNING V6 (FIXED) ===")
    
    conn = init_db()
    
    # Load all dictionaries
    log_msg("\n=== LOADING DICTIONARIES ===")
    zomi = load_zomidictionary()
    tongdot = load_tongdot()
    wordlists = load_wordlists()
    bible = load_bible_parallel()
    
    dicts = [zomi, tongdot, wordlists, bible]
    total_dict_entries = sum(len(d) for d in dicts)
    log_msg(f"Total dictionary entries: {total_dict_entries}")
    
    # Deep learning cycles
    for cycle in range(1, 6):
        log_msg(f"\n=== CYCLE {cycle} ===")
        
        # Extract
        bible_md = extract_bible_md(cycle)
        resources = extract_resources(cycle)
        
        all_extracted = {**bible_md, **resources}
        log_msg(f"[Cycle {cycle}] Total extracted: {len(all_extracted)}")
        
        # Merge with validation
        learned = merge_entries(conn, dicts, all_extracted, cycle)
    
    # Final stats
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
    log_msg(f"Database: {DB_PATH}")
    
    conn.close()
    log_msg("✅ Expert linguistic learning complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
