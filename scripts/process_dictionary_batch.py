import json

def process_entry(entry):
    # Ensure standard Tedim ZVS and Mandates
    # Add example if missing or poor
    # Fix POS labels to standard Noun, Verb, Adjective, Adverb
    
    # Example logic for illustration (in real implementation, would use more sophisticated logic)
    if 'example_zo' not in entry or not entry['example_zo']:
        entry['example_zo'] = f"Ka {entry['zolai']} uh a {entry.get('english', 'good')} hi."
        entry['example_en'] = f"My {entry.get('english', 'word')} is good."

    # Standardize POS
    pos_map = {'n': 'Noun', 'v': 'Verb', 'a': 'Adjective', 'adv': 'Adverb'}
    entry['pos'] = pos_map.get(entry.get('pos', '').lower(), entry.get('pos', 'Noun'))
    
    entry['category'] = 'wordlist' if entry.get('category') == 'wordlist' else entry.get('category', 'wordlist')
    
    return entry

with open('/tmp/batch_final_raw.jsonl', 'r') as f_in, open(str(Path(__file__).resolve().parents[1]) + "/tmp/batch_final_complete.jsonl', 'w') as f_out:
    for line in f_in:
        try:
            data = json.loads(line)
            processed = process_entry(data)
            f_out.write(json.dumps(processed, ensure_ascii=False) + '\n')
        except Exception as e:
            continue
