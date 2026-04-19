from __future__ import annotations
import json
import sqlite3
from pathlib import Path
from datetime import datetime
import hashlib
import sys

PROJECT_ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = PROJECT_ROOT / "data" / "processed" / "rebuild_v5"
DB_PATH = DATA_DIR / "dictionary_v5.db"
EXPORT_DIR = DATA_DIR / "exports"
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

def log_msg(msg: str) -> None:
    ts = datetime.now().isoformat()
    print(f"[{ts}] {msg}")
    sys.stdout.flush()

def export_dictionary(conn: sqlite3.Connection) -> None:
    """Export dictionary to JSONL"""
    cursor = conn.cursor()
    
    # Export EN→ZO
    en_zo_file = EXPORT_DIR / "dictionary_en_zo.jsonl"
    with open(en_zo_file, "w", encoding="utf-8") as f:
        cursor.execute("SELECT en, zo, confidence, source, frequency FROM entries WHERE en IS NOT NULL AND zo IS NOT NULL ORDER BY confidence DESC")
        for en, zo, conf, source, freq in cursor.fetchall():
            entry = {
                "en": en,
                "zo": zo,
                "confidence": conf,
                "source": source,
                "frequency": freq
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    log_msg(f"Exported EN→ZO to {en_zo_file}")
    
    # Export ZO→EN
    zo_en_file = EXPORT_DIR / "dictionary_zo_en.jsonl"
    with open(zo_en_file, "w", encoding="utf-8") as f:
        cursor.execute("SELECT zo, en, confidence, source, frequency FROM entries WHERE en IS NOT NULL AND zo IS NOT NULL ORDER BY confidence DESC")
        for zo, en, conf, source, freq in cursor.fetchall():
            entry = {
                "zo": zo,
                "en": en,
                "confidence": conf,
                "source": source,
                "frequency": freq
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    log_msg(f"Exported ZO→EN to {zo_en_file}")
    
    # Export patterns
    patterns_file = EXPORT_DIR / "zolai_patterns.jsonl"
    with open(patterns_file, "w", encoding="utf-8") as f:
        cursor.execute("SELECT pattern, frequency, source, context FROM zo_patterns ORDER BY frequency DESC LIMIT 5000")
        for pattern, freq, source, context in cursor.fetchall():
            entry = {
                "pattern": pattern,
                "frequency": freq,
                "source": source,
                "context": context
            }
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
    
    log_msg(f"Exported patterns to {patterns_file}")

def generate_report(conn: sqlite3.Connection) -> dict:
    """Generate learning report"""
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM entries")
    total_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE en IS NOT NULL AND zo IS NOT NULL")
    paired_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE en IS NULL OR zo IS NULL")
    unpaired_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT AVG(confidence) FROM entries")
    avg_conf = cursor.fetchone()[0] or 0
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE confidence >= 0.9")
    high_conf = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM zo_patterns")
    patterns = cursor.fetchone()[0]
    
    cursor.execute("SELECT source, COUNT(*) FROM entries GROUP BY source ORDER BY COUNT(*) DESC")
    sources = cursor.fetchall()
    
    report = {
        "timestamp": datetime.now().isoformat(),
        "total_entries": total_entries,
        "paired_entries": paired_entries,
        "unpaired_entries": unpaired_entries,
        "avg_confidence": avg_conf,
        "high_confidence_entries": high_conf,
        "zolai_patterns": patterns,
        "sources": {source: count for source, count in sources}
    }
    
    return report

def main() -> int:
    log_msg("=== CONTINUOUS LEARNING REPORT V5 ===")
    
    if not DB_PATH.exists():
        log_msg(f"Database not found: {DB_PATH}")
        return 1
    
    conn = sqlite3.connect(DB_PATH)
    
    # Generate report
    report = generate_report(conn)
    
    log_msg(f"\n=== LEARNING REPORT ===")
    log_msg(f"Total entries: {report['total_entries']}")
    log_msg(f"Paired (EN↔ZO): {report['paired_entries']}")
    log_msg(f"Unpaired: {report['unpaired_entries']}")
    log_msg(f"Avg confidence: {report['avg_confidence']:.2f}")
    log_msg(f"High confidence (≥0.9): {report['high_confidence_entries']}")
    log_msg(f"Zolai patterns discovered: {report['zolai_patterns']}")
    
    log_msg(f"\n=== SOURCES ===")
    for source, count in report['sources'].items():
        log_msg(f"{source}: {count} entries")
    
    # Export
    export_dictionary(conn)
    
    # Save report
    report_file = EXPORT_DIR / "learning_report.json"
    with open(report_file, "w", encoding="utf-8") as f:
        json.dump(report, f, ensure_ascii=False, indent=2)
    
    log_msg(f"\nReport saved to {report_file}")
    
    conn.close()
    log_msg("✅ Continuous learning report complete")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
