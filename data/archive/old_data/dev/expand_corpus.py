import json
import re

def clean_text(text):
    # Split by newlines and filter out empty lines or page numbers
    lines = [line.strip() for line in text.split('\n') if line.strip() and not re.match(r'^\d+$', line.strip())]
    # Filter out common headers/footers
    lines = [line for line in lines if not any(hdr in line for hdr in ["Zolai STANDARD Format", "LTTUANG", "SINNATE ZON-OLNA", "Zolai Sinna"])]
    return " ".join(lines)

def extract_from_sinna():
    with open('/home/peter/dev/Zolai_Sinna.txt', 'r') as f:
        content = f.read()
    
    # Try splitting by a more common marker in the text if "Sinna" is rare
    # Let's split by "Section" or just by roughly 1000-character blocks to get more entries
    blocks = [content[i:i+2000] for i in range(0, len(content), 2000)]
    entries = []
    for i, block in enumerate(blocks):
        cleaned = clean_text(block)
        if len(cleaned) > 200:
            entries.append({
                "source": f"Zolai Sinna - Part {i}",
                "text": cleaned
            })
    return entries

def append_to_corpus(entries):
    corpus_path = '/home/peter/Documents/Linguistics/Zolai/Corpus/zolai_corpus_v1.jsonl'
    with open(corpus_path, 'a') as f:
        for entry in entries:
            f.write(json.dumps(entry) + '\n')

if __name__ == "__main__":
    new_entries = extract_from_sinna()
    append_to_corpus(new_entries)
    print(f"Added {len(new_entries)} entries to corpus.")
