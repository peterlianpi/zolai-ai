from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v3"
DB_PATH = DATA_DIR / "dictionary_v3.db"

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def connect_db() -> sqlite3.Connection:
    """Connect to database"""
    return sqlite3.connect(DB_PATH)

def audit_quality(conn: sqlite3.Connection) -> dict:
    """Audit dictionary quality"""
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM entries")
    total_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE pos IS NOT NULL AND pos != ''")
    with_pos = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE examples IS NOT NULL AND examples != '[]'")
    with_examples = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE related IS NOT NULL AND related != '[]'")
    with_related = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM zo_en")
    zo_en_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_confidence = cursor.fetchone()[0] or 0
    
    stats = {
        "total_entries": total_entries,
        "with_pos": with_pos,
        "with_pos_pct": (with_pos / total_entries * 100) if total_entries > 0 else 0,
        "with_examples": with_examples,
        "with_examples_pct": (with_examples / total_entries * 100) if total_entries > 0 else 0,
        "with_related": with_related,
        "with_related_pct": (with_related / total_entries * 100) if total_entries > 0 else 0,
        "zo_en_entries": zo_en_count,
        "avg_confidence": avg_confidence,
        "timestamp": datetime.now().isoformat()
    }
    
    return stats

def identify_gaps(conn: sqlite3.Connection) -> dict:
    """Identify gaps in dictionary"""
    cursor = conn.cursor()
    
    gaps = {
        "missing_pos": [],
        "missing_examples": [],
        "missing_related": [],
        "low_confidence": []
    }
    
    # Find entries without POS
    cursor.execute("SELECT en, zo FROM entries WHERE pos IS NULL OR pos = '' LIMIT 10")
    gaps["missing_pos"] = [{"en": row[0], "zo": row[1]} for row in cursor.fetchall()]
    
    # Find entries without examples
    cursor.execute("SELECT en, zo FROM entries WHERE examples IS NULL OR examples = '[]' LIMIT 10")
    gaps["missing_examples"] = [{"en": row[0], "zo": row[1]} for row in cursor.fetchall()]
    
    # Find entries without related words
    cursor.execute("SELECT en, zo FROM entries WHERE related IS NULL OR related = '[]' LIMIT 10")
    gaps["missing_related"] = [{"en": row[0], "zo": row[1]} for row in cursor.fetchall()]
    
    # Find low confidence entries
    cursor.execute("SELECT en, zo, confidence FROM entries WHERE confidence < 0.7 LIMIT 10")
    gaps["low_confidence"] = [{"en": row[0], "zo": row[1], "confidence": row[2]} for row in cursor.fetchall()]
    
    return gaps

def improve_entries(conn: sqlite3.Connection) -> int:
    """Improve entries with missing data"""
    cursor = conn.cursor()
    improved = 0
    
    # Add POS for common words
    pos_map = {
        "ne": "verb", "ka": "marker", "khat": "noun", "pasian": "noun",
        "thlak": "adjective", "hi": "marker", "a": "marker"
    }
    
    for zo, pos in pos_map.items():
        cursor.execute(
            "UPDATE entries SET pos = ? WHERE zo = ? AND (pos IS NULL OR pos = '')",
            (pos, zo)
        )
        improved += cursor.rowcount
    
    conn.commit()
    log_msg(f"Improved {improved} entries with POS")
    return improved

def export_audit(stats: dict, gaps: dict) -> None:
    """Export audit results"""
    audit_file = DATA_DIR / "audit_v3.json"
    
    with open(audit_file, "w", encoding="utf-8") as f:
        json.dump({
            "stats": stats,
            "gaps": gaps,
            "timestamp": datetime.now().isoformat()
        }, f, ensure_ascii=False, indent=2)
    
    log_msg(f"Exported audit to {audit_file}")

def main() -> int:
    log_msg("=== CONTINUOUS IMPROVEMENT V3 ===")
    
    conn = connect_db()
    
    # Audit quality
    log_msg("Auditing dictionary quality...")
    stats = audit_quality(conn)
    
    log_msg(f"Total entries: {stats['total_entries']}")
    log_msg(f"With POS: {stats['with_pos']} ({stats['with_pos_pct']:.1f}%)")
    log_msg(f"With examples: {stats['with_examples']} ({stats['with_examples_pct']:.1f}%)")
    log_msg(f"With related: {stats['with_related']} ({stats['with_related_pct']:.1f}%)")
    log_msg(f"Avg confidence: {stats['avg_confidence']:.2f}")
    
    # Identify gaps
    log_msg("Identifying gaps...")
    gaps = identify_gaps(conn)
    
    log_msg(f"Missing POS: {len(gaps['missing_pos'])}")
    log_msg(f"Missing examples: {len(gaps['missing_examples'])}")
    log_msg(f"Missing related: {len(gaps['missing_related'])}")
    log_msg(f"Low confidence: {len(gaps['low_confidence'])}")
    
    # Improve entries
    log_msg("Improving entries...")
    improved = improve_entries(conn)
    
    # Export audit
    export_audit(stats, gaps)
    
    conn.close()
    log_msg("✅ Continuous improvement complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
