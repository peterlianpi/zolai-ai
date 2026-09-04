import json

def process_entry(entry):
    # Fix POS labels
    pos_map = {'n': 'Noun', 'v': 'Verb', 'a': 'Adjective', 'adv': 'Adverb'}
    raw_pos = entry.get('pos', '').lower()
    entry['pos'] = pos_map.get(raw_pos, raw_pos.capitalize())
    
    # Ensure standard categories
    if entry.get('category') == 'wordlist':
        # Simple heuristic to improve category
        if 'sim' in entry['zolai'] or 'lung' in entry['zolai']:
            entry['category'] = 'emotion'
        elif 'tui' in entry['zolai']:
            entry['category'] = 'nature'

    # Better example generation
    zolai = entry.get('zolai', '')
    english = entry.get('english', '')
    
    if entry['pos'] == 'Noun':
        entry['example_zo'] = f"Ka {zolai} a lian hi."
        entry['example_en'] = f"My {english} is big."
    elif entry['pos'] == 'Verb':
        entry['example_zo'] = f"Ka {zolai} hi."
        entry['example_en'] = f"I {english}."
    elif entry['pos'] == 'Adjective':
        entry['example_zo'] = f"Ka {zolai} mah hi."
        entry['example_en'] = f"My {zolai} is very {english}."
    else:
        entry['example_zo'] = f"Ka {zolai} a hoih hi."
        entry['example_en'] = f"My {zolai} is good."

    return entry

with open('/tmp/batch_final_raw.jsonl', 'r') as f_in, open(str(Path(__file__).resolve().parents[1]) + "/tmp/batch_final_complete.jsonl', 'w') as f_out:
    for line in f_in:
        try:
            data = json.loads(line)
            processed = process_entry(data)
            f_out.write(json.dumps(processed, ensure_ascii=False) + '\n')
        except:
            continue
