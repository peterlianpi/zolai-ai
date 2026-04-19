import json
import re
import sqlite3
from pathlib import Path

"""
Zo_Tdm Shared Utilities
Reusable functions for cleaning, file IO, and database interaction.
"""

def clean_text(text):
    """Standard text cleaning for Zolai entries."""
    if not text: return ""
    # Remove metadata like (n), (v), vt.
    text = re.sub(r'^[a-z]{1,4}\.?\s+', '', text, flags=re.IGNORECASE)
    # Remove pipes used in some list formats
    text = text.replace("|", "").replace("\n", " ").strip()
    return text

def load_json(path):
    if not Path(path).exists(): return {}
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_json(data, path):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

def stream_jsonl(path):
    if not Path(path).exists(): return
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            yield json.loads(line)

def get_db_conn(db_path):
    return sqlite3.connect(db_path)
