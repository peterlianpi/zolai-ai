import json
import re

def standardize(entry):
    # Rule 1: Joined compounds (e.g., 'biak buk' -> 'biakbuk')
    entry['zolai'] = re.sub(r'\s+', '', entry['zolai'])
    
    # Simple semantic fix for common scrapes
    if entry['english'].lower() == 'chapel':
        entry['zolai'] = 'biakinn'
        
    # Apply Pronoun/Verb grid and ZVS formatting logic
    if 'example_zo' in entry:
        # ensure 'hi' at end
        if not entry['example_zo'].endswith('hi.'):
            entry['example_zo'] = entry['example_zo'].rstrip('.') + ' hi.'
            
    return entry

input_file = '/tmp/batch_22_31_raw.jsonl'
output_file = '/home/peter/Documents/Projects/zolai/tmp/batch_22_31_perfect.jsonl'

with open(input_file, 'r') as f_in, open(output_file, 'w') as f_out:
    for line in f_in:
        entry = json.loads(line)
        standardized = standardize(entry)
        f_out.write(json.dumps(standardized, ensure_ascii=False) + '\n')
