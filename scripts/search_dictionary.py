import json
import os
import sqlite3
import sys

DB_PATH = 'data/master_unified_dictionary.db'

def search(query):
    if not os.path.exists(DB_PATH):
        print(f"Error: Database {DB_PATH} not found. Run scripts/build_dictionary_db.py first.")
        return

    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    query = query.lower().strip()

    print(f"Searching for: '{query}'...")
    results = []

    # 1. Exact Headword Match (Highest Priority)
    c.execute('SELECT raw_json FROM entries WHERE headword = ?', (query,))
    for row in c.fetchall():
        results.append(json.loads(row[0]))

    # 2. Exact Translation Match (English -> Zolai)
    if not results:
        c.execute('''
            SELECT entries.raw_json FROM translations 
            JOIN entries ON translations.entry_id = entries.id 
            WHERE translations.translation = ?
        ''', (query,))
        for row in c.fetchall():
            res = json.loads(row[0])
            if res not in results: results.append(res)

    # 3. Stem Match (Zolai Morphological Match)
    if not results:
        c.execute('''
            SELECT entries.raw_json FROM stems 
            JOIN entries ON stems.entry_id = entries.id 
            WHERE stems.stem = ?
        ''', (query,))
        for row in c.fetchall():
            res = json.loads(row[0])
            if res not in results: results.append(res)

    # 4. FTS (Fuzzy/Full-Text) Match (If no exact matches)
    if not results:
        print("No exact matches found. Trying fuzzy search...")
        c.execute('SELECT headword, translations_text FROM fts_idx WHERE fts_idx MATCH ? LIMIT 10', (query,))
        fts_hits = c.fetchall()
        if fts_hits:
            print("Partial Matches Found:")
            for hw, trans in fts_hits:
                print(f"  - {hw}: {trans[:60]}...")
        else:
            print("No partial matches found.")

    # Display Results
    for data in results:
        print("-" * 50)
        print(f"WORD:           {data['headword']}")
        print(f"POS:            {', '.join(data.get('pos', []))}")
        print(f"SOURCES:        {', '.join(data.get('sources', []))}")
        print(f"TRANSLATIONS:   {', '.join(data.get('translations', []))}")
        if data.get('explanations') and any(data['explanations']):
            print("EXPLANATIONS:")
            for exp in data['explanations']:
                if exp: print(f"  - {exp}")

    conn.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/search_dictionary.py <word>")
    else:
        word = " ".join(sys.argv[1:])
        search(word)
