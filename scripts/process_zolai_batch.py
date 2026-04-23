import json
import os

def process_entry(entry):
    # Standardize compounding
    zolai = str(entry.get('zolai', '')).replace(' ', '')
    entry['zolai'] = zolai
    
    # Ensure mandatory fields
    if 'example_zo' not in entry or not entry['example_zo']:
        entry['example_zo'] = f"Hih pen {zolai} hi."
    if 'example_en' not in entry or not entry['example_en']:
        entry['example_en'] = f"This is {entry.get('english', 'a word')}."
    
    # Clean up POS safely
    pos = entry.get('pos')
    if pos:
        pos = str(pos).lower()
        if pos == 'a': entry['pos'] = 'Adjective'
        elif pos == 'n': entry['pos'] = 'Noun'
        elif pos == 'v': entry['pos'] = 'Verb'
        elif pos == 'adv': entry['pos'] = 'Adverb'
        else: entry['pos'] = pos.capitalize()
    else:
        entry['pos'] = 'Noun' # Default
    
    # Add category if missing
    if not entry.get('category'):
        entry['category'] = 'general'
        
    return entry

input_path = '/tmp/batch_final_raw.jsonl'
output_path = str(Path(__file__).resolve().parents[1]) + "/tmp/batch_final_perfect.jsonl'

os.makedirs(os.path.dirname(output_path), exist_ok=True)

with open(input_path, 'r') as f_in, open(output_path, 'w') as f_out:
    for line in f_in:
        try:
            entry = json.loads(line)
            corrected = process_entry(entry)
            f_out.write(json.dumps(corrected, ensure_ascii=False) + '\n')
        except Exception as e:
            continue

print(f"Processed batch into {output_path}")
