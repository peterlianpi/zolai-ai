import json
import os
import re
import sqlite3

# File paths
JSONL_PATH = 'data/dictionary/processed/zvs_final_master_dictionary_v3.jsonl'
DB_PATH = 'data/dictionary/db/zvs_master_dictionary.db'

def setup_db(conn):
    c = conn.cursor()
    # Main Entry Table
    c.execute('''CREATE TABLE IF NOT EXISTS entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        headword TEXT UNIQUE,
        pos TEXT,
        sources TEXT,
        raw_json JSON
    )''')

    # Translations Table (for fast English -> Zolai searches)
    c.execute('''CREATE TABLE IF NOT EXISTS translations (
        entry_id INTEGER,
        translation TEXT,
        FOREIGN KEY(entry_id) REFERENCES entries(id)
    )''')

    # Stemming Table (to find 'lungdam' when searching 'lungdamna')
    c.execute('''CREATE TABLE IF NOT EXISTS stems (
        entry_id INTEGER,
        stem TEXT,
        FOREIGN KEY(entry_id) REFERENCES entries(id)
    )''')

    # FTS5 for global full-text search
    c.execute('DROP TABLE IF EXISTS fts_idx')
    c.execute('CREATE VIRTUAL TABLE fts_idx USING fts5(headword, translations_text, explanations_text)')

    # Indices
    c.execute('CREATE INDEX IF NOT EXISTS idx_headword ON entries(headword)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_trans ON translations(translation)')
    c.execute('CREATE INDEX IF NOT EXISTS idx_stems ON stems(stem)')

def get_stems(word):
    """Simple Zolai stemming rules."""
    stems = set()
    w = word.lower().strip()
    # Remove common nominalizers and markers
    for suffix in ['na', 'ta', 'te', 'hi', 'pa', 'nu', 'pi']:
        if w.endswith(suffix) and len(w) > len(suffix) + 2:
            stems.add(w[:-len(suffix)])
    return stems

def migrate():
    if not os.path.exists(JSONL_PATH):
        print(f"Error: {JSONL_PATH} not found.")
        return

    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

    conn = sqlite3.connect(DB_PATH)
    setup_db(conn)
    c = conn.cursor()

    print(f"Migrating {JSONL_PATH} to {DB_PATH}...")

    with open(JSONL_PATH, 'r', encoding='utf-8') as f:
        batch_size = 1000
        current_batch = []

        for i, line in enumerate(f):
            try:
                data = json.loads(line)
                hw = data['headword']
                pos = ','.join(data.get('pos', []))
                src = ','.join(data.get('sources', []))

                # Insert Entry
                c.execute('INSERT OR IGNORE INTO entries (headword, pos, sources, raw_json) VALUES (?,?,?,?)',
                          (hw, pos, src, line))
                entry_id = c.lastrowid

                if not entry_id: # If ignored, find the existing ID
                    c.execute('SELECT id FROM entries WHERE headword = ?', (hw,))
                    res = c.fetchone()
                    if res: entry_id = res[0]

                if entry_id:
                    # Insert Translations
                    for trans in data.get('translations', []):
                        # Clean translation for index (remove punctuation)
                        clean_trans = re.sub(r'[^\w\s]', '', trans.lower()).strip()
                        c.execute('INSERT INTO translations (entry_id, translation) VALUES (?,?)', (entry_id, clean_trans))

                    # Insert Stems
                    for stem in get_stems(hw):
                        c.execute('INSERT INTO stems (entry_id, stem) VALUES (?,?)', (entry_id, stem))

                    # Insert into FTS
                    trans_text = ' '.join(data.get('translations', []))
                    expl_text = ' '.join(data.get('explanations', []) or [])
                    c.execute('INSERT INTO fts_idx (headword, translations_text, explanations_text) VALUES (?,?,?)',
                              (hw, trans_text, expl_text))

                if i % batch_size == 0 and i > 0:
                    conn.commit()
                    print(f"  Processed {i} entries...")
            except Exception as e:
                print(f"Error on line {i}: {e}")

    conn.commit()
    conn.close()
    print("Migration Complete.")

if __name__ == "__main__":
    migrate()
