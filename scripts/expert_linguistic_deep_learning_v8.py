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
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v8"
DB_PATH = DATA_DIR / "dictionary_v8.db"
EXPORT_DIR = DATA_DIR / "exports"
LOG_FILE = DATA_DIR / "learning_log.txt"
DATA_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")
    sys.stdout.flush()

def init_db() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id TEXT PRIMARY KEY,
            en TEXT,
            zo TEXT,
            confidence REAL DEFAULT 0.5,
            dict_count INTEGER DEFAULT 0,
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
    for zf in [PROJECT_ROOT / "data" / "raw" / "zomidictionary_export.jsonl",
               PROJECT_ROOT / "data" / "raw" / "zomidictionary_app_full.jsonl"]:
        if zf.exists():
            with open(zf, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        zo = str(e.get("zolai", "")).strip().lower()
                        en = str(e.get("english", "")).strip().lower()
                        if zo and en and len(zo) > 1 and len(en) > 1:
                            entries[f"{en}:{zo}"] = 1
                    except:
                        pass
    return entries

def load_tongdot() -> dict:
    """Load TongDot dictionary"""
    entries = {}
    for tf in [PROJECT_ROOT / "data" / "master" / "sources" / "tongdot_dictionary.jsonl",
               PROJECT_ROOT / "data" / "master" / "sources" / "tongdot_words_sample.jsonl"]:
        if tf.exists():
            with open(tf, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        # TongDot has nested structure: results array with headword/translation
                        if "results" in e and isinstance(e["results"], list):
                            for result in e["results"]:
                                headword = str(result.get("headword", "")).strip().lower()
                                translation = str(result.get("translation", "")).strip().lower()
                                if headword and translation and len(headword) > 1 and len(translation) > 1:
                                    entries[f"{headword}:{translation}"] = 1
                        else:
                            # Fallback for flat structure
                            zo = str(e.get("zo", "")).strip().lower()
                            en = str(e.get("en", "")).strip().lower()
                            if zo and en and len(zo) > 1 and len(en) > 1:
                                entries[f"{en}:{zo}"] = 1
                    except:
                        pass
    return entries

def load_wordlists() -> dict:
    """Load wordlists"""
    entries = {}
    for wf in [PROJECT_ROOT / "data" / "raw" / "wordlist_en_zo.jsonl",
               PROJECT_ROOT / "data" / "raw" / "zo_en_wordlist.jsonl",
               PROJECT_ROOT / "data" / "raw" / "zo_en_singlewords.jsonl"]:
        if wf.exists():
            with open(wf, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        en = str(e.get("en") or e.get("english", "")).strip().lower()
                        zo = str(e.get("zo") or e.get("zolai", "")).strip().lower()
                        if en and zo and len(en) > 1 and len(zo) > 1:
                            entries[f"{en}:{zo}"] = 1
                    except:
                        pass
    return entries

def load_bible_parallel() -> dict:
    """Load Bible parallel"""
    entries = {}
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
                            entries[f"{en}:{zo}"] = 1
                    except:
                        pass
    return entries

def extract_bible_md() -> dict:
    """Extract from Bible MD files with proper regex"""
    entries = {}
    bible_dir = PROJECT_ROOT / "Cleaned_Bible"
    
    for md_file in bible_dir.glob("**/*.md"):
        try:
            with open(md_file, encoding="utf-8") as f:
                content = f.read()
                # Match verse blocks: **1:1** ... **1:2**
                verses = re.split(r'\*\*\d+:\d+\*\*', content)
                
                for verse_block in verses[1:]:
                    lines = verse_block.strip().split('\n')
                    en_text = ""
                    zo_text = ""
                    
                    for line in lines:
                        line = line.strip()
                        if line.startswith("KJV:"):
                            en_text = line.replace("KJV:", "").strip().lower()
                        elif line.startswith("TDB77:") or line.startswith("Tedim2010:"):
                            zo_text = line.split(":", 1)[1].strip().lower()
                    
                    if en_text and zo_text and len(en_text) > 2 and len(zo_text) > 2:
                        entries[f"{en_text}:{zo_text}"] = 1
        except:
            pass
    
    return entries

def extract_all_jsonl() -> dict:
    """Extract from ALL JSONL files in workspace"""
    entries = {}
    
    # Scan all JSONL files
    for jsonl_file in list(PROJECT_ROOT.glob("data/master/sources/*.jsonl")) + \
                      list(PROJECT_ROOT.glob("data/dictionary/raw/*.jsonl")) + \
                      list(PROJECT_ROOT.glob("data/processed/*.jsonl")) + \
                      list(PROJECT_ROOT.glob("data/processed/bible_vocab/*.jsonl")):
        try:
            with open(jsonl_file, encoding="utf-8") as f:
                for line in f:
                    try:
                        e = json.loads(line)
                        # Try all field combinations
                        for en_f in ["en", "english", "eng", "input", "text", "source", "english_text"]:
                            for zo_f in ["zo", "zolai", "zomi", "output", "target", "translation", "zolai_text"]:
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
    
    return entries

def expert_score(key: str, dicts: list[dict]) -> tuple[float, int]:
    """Score based on dictionary consensus. Returns (confidence, dict_count)"""
    found = sum(1 for d in dicts if key in d)
    
    if found >= 3:
        return 0.95, found
    elif found == 2:
        return 0.90, found
    elif found == 1:
        return 0.80, found
    else:
        return 0.70, found

def merge_cycle(conn: sqlite3.Connection, dicts: list[dict], extracted: dict, cycle: int) -> tuple[int, int, int]:
    """Merge with expert scoring. Returns (learned, improved, refined)"""
    cursor = conn.cursor()
    learned = 0
    improved = 0
    refined = 0
    now = datetime.now().isoformat()
    
    for key in extracted:
        parts = key.split(":")
        if len(parts) != 2:
            continue
        
        en, zo = parts
        conf, dict_count = expert_score(key, dicts)
        entry_id = hashlib.md5(key.encode()).hexdigest()
        
        cursor.execute("SELECT id, confidence, dict_count FROM entries WHERE id = ?", (entry_id,))
        result = cursor.fetchone()
        
        if result:
            old_conf = result[1]
            old_dict_count = result[2]
            new_conf = min(0.95, max(old_conf, conf))
            
            if new_conf > old_conf:
                improved += 1
            if dict_count > old_dict_count:
                refined += 1
            
            cursor.execute(
                "UPDATE entries SET confidence = ?, dict_count = ?, learning_count = learning_count + 1, updated_at = ? WHERE id = ?",
                (new_conf, dict_count, now, entry_id)
            )
        else:
            cursor.execute("""
                INSERT OR IGNORE INTO entries (id, en, zo, confidence, dict_count, frequency, learning_count, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (entry_id, en, zo, conf, dict_count, 1, 1, now, now))
            learned += 1
    
    conn.commit()
    return learned, improved, refined

def get_stats(conn: sqlite3.Connection) -> dict:
    """Get current stats"""
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*) FROM entries")
    total = cursor.fetchone()[0]
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    cursor.execute("SELECT COUNT(*) FROM entries WHERE confidence >= 0.9")
    high_conf = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM entries WHERE confidence >= 0.85")
    med_conf = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(*) FROM entries WHERE dict_count >= 2")
    multi_dict = cursor.fetchone()[0]
    return {"total": total, "avg": avg_conf, "high": high_conf, "med": med_conf, "multi": multi_dict}

def export_results(conn: sqlite3.Connection) -> None:
    """Export to JSONL"""
    cursor = conn.cursor()
    
    with open(EXPORT_DIR / "dictionary_en_zo.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT en, zo, confidence, dict_count FROM entries ORDER BY confidence DESC, dict_count DESC")
        for en, zo, conf, dict_count in cursor.fetchall():
            f.write(json.dumps({"en": en, "zo": zo, "confidence": conf, "dict_count": dict_count}, ensure_ascii=False) + "\n")
    
    with open(EXPORT_DIR / "dictionary_zo_en.jsonl", "w", encoding="utf-8") as f:
        cursor.execute("SELECT zo, en, confidence, dict_count FROM entries ORDER BY confidence DESC, dict_count DESC")
        for zo, en, conf, dict_count in cursor.fetchall():
            f.write(json.dumps({"zo": zo, "en": en, "confidence": conf, "dict_count": dict_count}, ensure_ascii=False) + "\n")

def main() -> int:
    log_msg("=== EXPERT LINGUISTIC DEEP LEARNING V8 (100+ CYCLES) ===\n")
    
    conn = init_db()
    
    log_msg("=== LOADING 3+ DICTIONARIES ===")
    zomi = load_zomidictionary()
    tongdot = load_tongdot()
    wordlist = load_wordlists()
    bible = load_bible_parallel()
    dicts = [zomi, tongdot, wordlist, bible]
    
    log_msg(f"  ZomiDictionary: {len(zomi)} entries")
    log_msg(f"  TongDot: {len(tongdot)} entries")
    log_msg(f"  Wordlists: {len(wordlist)} entries")
    log_msg(f"  Bible parallel: {len(bible)} entries")
    
    log_msg("\n=== EXTRACTING ALL SOURCES ===")
    bible_md = extract_bible_md()
    all_jsonl = extract_all_jsonl()
    log_msg(f"  Bible MD: {len(bible_md)} verses")
    log_msg(f"  All JSONL: {len(all_jsonl)} entries")
    
    total_learned = 0
    total_improved = 0
    total_refined = 0
    
    log_msg("\n=== STARTING 100+ DEEP CYCLES ===\n")
    
    for cycle in range(1, 101):
        if cycle == 1:
            extracted = {**bible_md, **all_jsonl}
        else:
            extracted = all_jsonl
        
        learned, improved, refined = merge_cycle(conn, dicts, extracted, cycle)
        total_learned += learned
        total_improved += improved
        total_refined += refined
        
        stats = get_stats(conn)
        
        if cycle % 10 == 0 or cycle == 1:
            log_msg(f"[Cycle {cycle:3d}] L:{learned:6d} I:{improved:6d} R:{refined:6d} | Total:{stats['total']:7d} | Avg:{stats['avg']:.3f} | High:{stats['high']:6d} | Multi:{stats['multi']:6d}")
        
        sys.stdout.flush()
    
    log_msg("\n=== FINAL RESULTS ===")
    stats = get_stats(conn)
    log_msg(f"Total entries: {stats['total']}")
    log_msg(f"Avg confidence: {stats['avg']:.3f}")
    log_msg(f"High confidence (≥0.9): {stats['high']}")
    log_msg(f"Medium confidence (≥0.85): {stats['med']}")
    log_msg(f"Multi-dict entries (≥2 dicts): {stats['multi']}")
    log_msg(f"Total learned: {total_learned}")
    log_msg(f"Total improved: {total_improved}")
    log_msg(f"Total refined: {total_refined}")
    
    log_msg("\n=== EXPORTING RESULTS ===")
    export_results(conn)
    log_msg(f"Exported to {EXPORT_DIR}")
    
    conn.close()
    
    log_msg("\n✅ Expert linguistic deep learning V8 complete (100+ cycles)")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
