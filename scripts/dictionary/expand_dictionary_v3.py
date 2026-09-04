from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from collections import defaultdict
from datetime import datetime
import hashlib
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v3"
DB_PATH = DATA_DIR / "dictionary_v3.db"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def init_db() -> sqlite3.Connection:
    """Initialize SQLite database"""
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            en TEXT NOT NULL,
            zo TEXT NOT NULL,
            pos TEXT,
            confidence REAL,
            source TEXT,
            topic TEXT,
            synonyms TEXT,
            examples TEXT,
            related TEXT,
            frequency INTEGER,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS zo_en (
            zo TEXT PRIMARY KEY,
            en_list TEXT,
            confidence REAL,
            frequency INTEGER,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT,
            updated_at TEXT
        )
    """)
    conn.commit()
    return conn

def load_existing_dict() -> tuple[dict, dict]:
    """Load existing v7 dictionaries"""
    en_zo = {}
    zo_en = defaultdict(list)
    
    v7_en = PROJECT_ROOT / "data" / "processed" / "rebuild_v1" / "final_en_zo_dictionary_v7.jsonl"
    v7_zo = PROJECT_ROOT / "data" / "processed" / "rebuild_v1" / "final_zo_en_dictionary_v7.jsonl"
    
    if v7_en.exists():
        with open(v7_en, encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                en_zo[entry["en"]] = entry
    
    if v7_zo.exists():
        with open(v7_zo, encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                zo = entry["zo"]
                en_list = entry.get("en", [])
                if isinstance(en_list, list):
                    zo_en[zo] = en_list
    
    log_msg(f"Loaded {len(en_zo)} EN→ZO, {len(zo_en)} ZO→EN entries")
    return en_zo, dict(zo_en)

def extract_bible() -> dict:
    """Extract from Bible corpus"""
    entries = {}
    bible_dir = PROJECT_ROOT / "Cleaned_Bible"
    
    if not bible_dir.exists():
        log_msg("Bible directory not found")
        return entries
    
    bible_files = list(bible_dir.glob("*.txt"))
    log_msg(f"Extracting from {len(bible_files)} Bible files")
    
    for bible_file in bible_files[:10]:
        try:
            with open(bible_file, encoding="utf-8") as f:
                content = f.read()
                words = content.split()
                for word in words:
                    word = word.strip(".,!?;:").lower()
                    if len(word) > 2 and word not in entries:
                        entries[word] = {
                            "source": "bible",
                            "confidence": 0.95,
                            "topic": "religion",
                            "frequency": 1
                        }
                    elif word in entries:
                        entries[word]["frequency"] += 1
        except Exception as e:
            log_msg(f"Error processing {bible_file.name}: {e}")
    
    log_msg(f"Extracted {len(entries)} entries from Bible")
    return entries

def extract_tongdot() -> dict:
    """Extract from TongDot dictionary"""
    entries = {}
    tongdot_file = PROJECT_ROOT / "data" / "master" / "sources" / "tongdot_dictionary.jsonl"
    
    if not tongdot_file.exists():
        log_msg("TongDot dictionary not found")
        return entries
    
    try:
        with open(tongdot_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    zo = entry.get("zo", "").lower()
                    en = entry.get("en", "").lower()
                    if zo and en:
                        key = f"{en}:{zo}"
                        entries[key] = {
                            "en": en,
                            "zo": zo,
                            "source": "tongdot",
                            "confidence": 0.90,
                            "frequency": 1
                        }
                except:
                    pass
    except Exception as e:
        log_msg(f"Error reading TongDot: {e}")
    
    log_msg(f"Extracted {len(entries)} entries from TongDot")
    return entries

def extract_rvasia() -> dict:
    """Extract from RVAsia articles"""
    entries = {}
    rvasia_file = PROJECT_ROOT / "data" / "rvasia_tedim.jsonl"
    
    if not rvasia_file.exists():
        log_msg("RVAsia file not found")
        return entries
    
    try:
        with open(rvasia_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    text = entry.get("text", "")
                    words = text.split()
                    for word in words:
                        word = word.strip(".,!?;:").lower()
                        if len(word) > 2 and word not in entries:
                            entries[word] = {
                                "source": "rvasia",
                                "confidence": 0.85,
                                "topic": "religion",
                                "frequency": 1
                            }
                        elif word in entries:
                            entries[word]["frequency"] += 1
                except:
                    pass
    except Exception as e:
        log_msg(f"Error reading RVAsia: {e}")
    
    log_msg(f"Extracted {len(entries)} entries from RVAsia")
    return entries

def extract_master_corpus() -> dict:
    """Extract from master corpus"""
    entries = {}
    corpus_file = PROJECT_ROOT / "data" / "master" / "sources" / "zolai_corpus_master.jsonl"
    
    if not corpus_file.exists():
        log_msg("Master corpus not found")
        return entries
    
    count = 0
    try:
        with open(corpus_file, encoding="utf-8") as f:
            for line in f:
                if count > 10000:  # Sample first 10k
                    break
                try:
                    entry = json.loads(line)
                    text = entry.get("text", "")
                    words = text.split()
                    for word in words:
                        word = word.strip(".,!?;:").lower()
                        if len(word) > 2 and word not in entries:
                            entries[word] = {
                                "source": "corpus",
                                "confidence": 0.75,
                                "frequency": 1
                            }
                        elif word in entries:
                            entries[word]["frequency"] += 1
                    count += 1
                except:
                    pass
    except Exception as e:
        log_msg(f"Error reading corpus: {e}")
    
    log_msg(f"Extracted {len(entries)} entries from master corpus")
    return entries

def merge_entries(en_zo: dict, extracted: dict) -> dict:
    """Merge extracted entries with existing"""
    merged = en_zo.copy()
    added = 0
    
    for key, entry in extracted.items():
        if isinstance(entry, dict) and "en" in entry and "zo" in entry:
            en = entry["en"]
            if en not in merged:
                merged[en] = entry
                added += 1
    
    log_msg(f"Merged {added} new entries")
    return merged

def save_to_db(conn: sqlite3.Connection, en_zo: dict, zo_en: dict) -> None:
    """Save dictionary to SQLite database"""
    cursor = conn.cursor()
    
    # Clear existing
    cursor.execute("DELETE FROM entries")
    cursor.execute("DELETE FROM zo_en")
    
    # Insert EN→ZO
    for en, entry in en_zo.items():
        entry_id = hashlib.md5(f"{en}:{entry.get('zo', '')}".encode()).hexdigest()
        cursor.execute("""
            INSERT OR REPLACE INTO entries 
            (id, en, zo, pos, confidence, source, topic, synonyms, examples, related, frequency, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            entry_id,
            en,
            entry.get("zo", ""),
            entry.get("pos", ""),
            entry.get("confidence", 1.0),
            entry.get("source", ""),
            entry.get("topic", ""),
            json.dumps(entry.get("synonyms", [])),
            json.dumps(entry.get("examples", [])),
            json.dumps(entry.get("related", [])),
            entry.get("frequency", 1),
            datetime.now().isoformat(),
            datetime.now().isoformat()
        ))
    
    # Insert ZO→EN
    for zo, en_list in zo_en.items():
        cursor.execute("""
            INSERT OR REPLACE INTO zo_en 
            (zo, en_list, confidence, frequency, updated_at)
            VALUES (?, ?, ?, ?, ?)
        """, (
            zo,
            json.dumps(en_list),
            0.9,
            len(en_list),
            datetime.now().isoformat()
        ))
    
    # Update metadata
    cursor.execute("""
        INSERT OR REPLACE INTO metadata (key, value, updated_at)
        VALUES (?, ?, ?)
    """, ("total_entries", str(len(en_zo)), datetime.now().isoformat()))
    
    conn.commit()
    log_msg(f"Saved {len(en_zo)} EN→ZO and {len(zo_en)} ZO→EN entries to database")

def export_jsonl(en_zo: dict, zo_en: dict) -> None:
    """Export to JSONL files"""
    
    # EN→ZO
    with open(DATA_DIR / "dictionary_en_zo_v3.jsonl", "w", encoding="utf-8") as f:
        for en, entry in en_zo.items():
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    # ZO→EN
    with open(DATA_DIR / "dictionary_zo_en_v3.jsonl", "w", encoding="utf-8") as f:
        for zo, en_list in zo_en.items():
            f.write(json.dumps({"zo": zo, "en": en_list}, ensure_ascii=False) + "\n")
    
    log_msg(f"Exported to JSONL files")

def main() -> int:
    log_msg("=== DICTIONARY EXPANSION V3 ===")
    
    # Initialize database
    conn = init_db()
    
    # Load existing
    en_zo, zo_en = load_existing_dict()
    
    # Extract from all resources
    log_msg("Extracting from all resources...")
    bible_entries = extract_bible()
    tongdot_entries = extract_tongdot()
    rvasia_entries = extract_rvasia()
    corpus_entries = extract_master_corpus()
    
    # Merge all
    all_extracted = {**bible_entries, **tongdot_entries, **rvasia_entries, **corpus_entries}
    log_msg(f"Total extracted: {len(all_extracted)} entries")
    
    # Merge with existing
    en_zo = merge_entries(en_zo, all_extracted)
    
    # Rebuild ZO→EN
    zo_en = defaultdict(list)
    for en, entry in en_zo.items():
        zo = entry.get("zo", "")
        if zo and en not in zo_en[zo]:
            zo_en[zo].append(en)
    
    log_msg(f"Final: {len(en_zo)} EN→ZO, {len(zo_en)} ZO→EN entries")
    
    # Save to database
    save_to_db(conn, en_zo, dict(zo_en))
    
    # Export to JSONL
    export_jsonl(en_zo, dict(zo_en))
    
    conn.close()
    log_msg("✅ Dictionary expansion complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
