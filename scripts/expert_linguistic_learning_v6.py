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
LEARNING_LOG = DATA_DIR / "learning_log.jsonl"
DATA_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def init_db() -> sqlite3.Connection:
    """Initialize expert linguistic database"""
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
            expert_score REAL DEFAULT 0.0,
            context TEXT,
            bible_context TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    """)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS expert_validation (
            id TEXT PRIMARY KEY,
            entry_id TEXT,
            cycle INTEGER,
            dict1_found BOOLEAN,
            dict2_found BOOLEAN,
            dict3_found BOOLEAN,
            bible_found BOOLEAN,
            consensus_score REAL,
            validated_at TEXT
        )
    """)
    conn.commit()
    return conn

def load_all_dictionaries() -> tuple[dict, dict, dict]:
    """Load all 3 dictionary sources"""
    dict1 = {}  # ZomiDictionary
    dict2 = {}  # Wordlists
    dict3 = {}  # Bible parallel
    
    # Dict 1: ZomiDictionary
    zomi_file = PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl"
    if zomi_file.exists():
        with open(zomi_file, encoding="utf-8") as f:
            for line in f:
                try:
                    entry = json.loads(line)
                    zo = entry.get("zolai", "").strip().lower()
                    en = entry.get("english", "").strip().lower()
                    if zo and en:
                        key = f"{en}:{zo}"
                        dict1[key] = {"en": en, "zo": zo, "source": "zomidictionary", "pos": entry.get("part_of_speech", "")}
                except:
                    pass
    
    log_msg(f"Loaded {len(dict1)} from ZomiDictionary")
    
    # Dict 2: Wordlists
    for wl_file in [PROJECT_ROOT / "data" / "raw" / "wordlist_en_zo.jsonl", PROJECT_ROOT / "data" / "raw" / "zo_en_wordlist.jsonl"]:
        if wl_file.exists():
            with open(wl_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        en = entry.get("en", "").strip().lower()
                        zo = entry.get("zo", "").strip().lower()
                        if en and zo:
                            key = f"{en}:{zo}"
                            dict2[key] = {"en": en, "zo": zo, "source": "wordlist"}
                    except:
                        pass
    
    log_msg(f"Loaded {len(dict2)} from wordlists")
    
    # Dict 3: Bible parallel
    for bible_file in [PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tbr17.jsonl",
                       PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tdb77.jsonl",
                       PROJECT_ROOT / "data" / "master" / "sources" / "bible_parallel_tedim2010.jsonl"]:
        if bible_file.exists():
            with open(bible_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        entry = json.loads(line)
                        en = entry.get("en", "").strip().lower()
                        zo = entry.get("zo", "").strip().lower()
                        if en and zo:
                            key = f"{en}:{zo}"
                            dict3[key] = {"en": en, "zo": zo, "source": "bible", "context": entry.get("context", "")}
                    except:
                        pass
    
    log_msg(f"Loaded {len(dict3)} from Bible parallel")
    
    return dict1, dict2, dict3

def extract_zo_words(text: str) -> list[str]:
    """Extract Zolai words from text"""
    words = re.findall(r"\b[a-z']+\b", text.lower())
    return [w for w in words if 2 < len(w) < 20 and w.count("'") <= 1]

def extract_from_bible_md(cycle: int) -> dict:
    """Extract from Bible parallel MD files"""
    entries = {}
    bible_dir = PROJECT_ROOT / "Cleaned_Bible" / "Parallel_Corpus" / "TDB77"
    
    if not bible_dir.exists():
        log_msg(f"[Cycle {cycle}] Bible MD directory not found")
        return entries
    
    md_files = list(bible_dir.glob("*.md"))[:10]  # Sample
    log_msg(f"[Cycle {cycle}] Processing {len(md_files)} Bible MD files")
    
    for md_file in md_files:
        try:
            with open(md_file, encoding="utf-8") as f:
                content = f.read()
                # Extract pairs from markdown
                pairs = re.findall(r"\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|", content)
                for en, zo in pairs:
                    en = en.strip().lower()
                    zo = zo.strip().lower()
                    if en and zo and len(en) > 1 and len(zo) > 1:
                        key = f"{en}:{zo}"
                        if key not in entries:
                            entries[key] = {"en": en, "zo": zo, "source": "bible_md", "context": content[:200]}
        except Exception as e:
            log_msg(f"[Cycle {cycle}] Error reading {md_file.name}: {e}")
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from Bible MD")
    return entries

def extract_from_resources(cycle: int) -> dict:
    """Extract from all .jsonl and .md files in resources"""
    entries = {}
    
    for resource_dir in [PROJECT_ROOT / "resources", PROJECT_ROOT / "data" / "raw"]:
        if not resource_dir.exists():
            continue
        
        # Process JSONL files
        for jsonl_file in list(resource_dir.glob("**/*.jsonl"))[:20]:
            try:
                with open(jsonl_file, encoding="utf-8") as f:
                    for line in f:
                        try:
                            entry = json.loads(line)
                            # Try multiple field combinations
                            for en_field in ["en", "english", "eng"]:
                                for zo_field in ["zo", "zolai", "zomi"]:
                                    if en_field in entry and zo_field in entry:
                                        en = str(entry[en_field]).strip().lower()
                                        zo = str(entry[zo_field]).strip().lower()
                                        if en and zo and len(en) > 1 and len(zo) > 1:
                                            key = f"{en}:{zo}"
                                            if key not in entries:
                                                entries[key] = {"en": en, "zo": zo, "source": jsonl_file.stem}
                        except:
                            pass
            except:
                pass
        
        # Process MD files
        for md_file in list(resource_dir.glob("**/*.md"))[:20]:
            try:
                with open(md_file, encoding="utf-8") as f:
                    content = f.read()
                    # Extract pairs from markdown tables
                    pairs = re.findall(r"\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|", content)
                    for en, zo in pairs:
                        en = en.strip().lower()
                        zo = zo.strip().lower()
                        if en and zo and len(en) > 1 and len(zo) > 1:
                            key = f"{en}:{zo}"
                            if key not in entries:
                                entries[key] = {"en": en, "zo": zo, "source": md_file.stem}
            except:
                pass
    
    log_msg(f"[Cycle {cycle}] Extracted {len(entries)} from resources")
    return entries

def expert_validate(entry: dict, dict1: dict, dict2: dict, dict3: dict, cycle: int) -> tuple[float, dict]:
    """Expert linguistic validation using all 3 dictionaries"""
    en = entry.get("en", "")
    zo = entry.get("zo", "")
    key = f"{en}:{zo}"
    
    scores = []
    validation = {
        "dict1_found": key in dict1,
        "dict2_found": key in dict2,
        "dict3_found": key in dict3,
        "bible_found": False,
        "sources": []
    }
    
    # Check each dictionary
    if key in dict1:
        scores.append(0.9)
        validation["sources"].append("zomidictionary")
    
    if key in dict2:
        scores.append(0.85)
        validation["sources"].append("wordlist")
    
    if key in dict3:
        scores.append(0.95)
        validation["sources"].append("bible")
        validation["bible_found"] = True
    
    # Consensus score: average of found sources
    consensus = sum(scores) / len(scores) if scores else 0.5
    
    # Boost if found in multiple sources
    if len(scores) >= 2:
        consensus = min(0.95, consensus + 0.05)
    
    validation["consensus_score"] = consensus
    
    return consensus, validation

def merge_and_validate(conn: sqlite3.Connection, dict1: dict, dict2: dict, dict3: dict, extracted: dict, cycle: int) -> int:
    """Merge extracted entries with expert validation"""
    cursor = conn.cursor()
    learned = 0
    now = datetime.now().isoformat()
    
    for key, entry in extracted.items():
        en = entry.get("en", "")
        zo = entry.get("zo", "")
        
        if not en or not zo:
            continue
        
        # Expert validation
        confidence, validation = expert_validate(entry, dict1, dict2, dict3, cycle)
        
        # Check if entry exists
        entry_id = hashlib.md5(f"{en}:{zo}".encode()).hexdigest()
        cursor.execute("SELECT id, confidence FROM entries WHERE id = ?", (entry_id,))
        result = cursor.fetchone()
        
        if result:
            # Update with learning
            old_conf = result[1]
            new_conf = min(0.95, max(old_conf, confidence))
            cursor.execute(
                "UPDATE entries SET confidence = ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                (new_conf, now, entry_id)
            )
        else:
            # New entry
            cursor.execute("""
                INSERT OR IGNORE INTO entries (id, en, zo, confidence, sources, frequency, learning_count, expert_score, context, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                entry_id,
                en,
                zo,
                confidence,
                json.dumps(validation["sources"]),
                1,
                1,
                confidence,
                entry.get("context", ""),
                now,
                now
            ))
            learned += 1
        
        # Log validation
        cursor.execute("""
            INSERT OR IGNORE INTO expert_validation (id, entry_id, cycle, dict1_found, dict2_found, dict3_found, bible_found, consensus_score, validated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            hashlib.md5(f"{entry_id}:{cycle}".encode()).hexdigest(),
            entry_id,
            cycle,
            validation["dict1_found"],
            validation["dict2_found"],
            validation["dict3_found"],
            validation["bible_found"],
            validation["consensus_score"],
            now
        ))
    
    conn.commit()
    log_msg(f"[Cycle {cycle}] Validated and learned {learned} entries")
    return learned

def main() -> int:
    log_msg("=== EXPERT LINGUISTIC LEARNING V6 ===")
    
    conn = init_db()
    
    # Load all 3 dictionaries
    log_msg("\n=== LOADING DICTIONARIES ===")
    dict1, dict2, dict3 = load_all_dictionaries()
    
    # Run deep learning cycles
    for cycle in range(1, 6):  # 5 deep cycles
        log_msg(f"\n=== CYCLE {cycle} ===")
        
        # Extract from all sources
        bible_md = extract_from_bible_md(cycle)
        resources = extract_from_resources(cycle)
        
        # Merge all extracted
        all_extracted = {**bible_md, **resources}
        log_msg(f"[Cycle {cycle}] Total extracted: {len(all_extracted)}")
        
        # Expert validation and merge
        learned = merge_and_validate(conn, dict1, dict2, dict3, all_extracted, cycle)
        
        log_msg(f"[Cycle {cycle}] Complete\n")
    
    # Final stats
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM entries")
    total = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM expert_validation WHERE bible_found = 1")
    bible_validated = cursor.fetchone()[0]
    
    log_msg(f"\n=== FINAL RESULTS ===")
    log_msg(f"Total entries: {total}")
    log_msg(f"Avg confidence: {avg_conf:.2f}")
    log_msg(f"Bible-validated entries: {bible_validated}")
    log_msg(f"Database: {DB_PATH}")
    
    conn.close()
    log_msg("✅ Expert linguistic learning complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
