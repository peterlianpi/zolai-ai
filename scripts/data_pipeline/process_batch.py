import json

def process_line(line):
    entry = json.loads(line)
    
    # 1. Clean Zolai (if needed)
    # 2. Add/Correct example sentences based on culinary standards if relevant
    # 3. Add placeholder enrichment for missing data
    
    if "zolai" not in entry: return None
    
    # Simple normalization/enrichment template
    entry.setdefault("pos", "Noun")
    entry.setdefault("dialect", "tedim")
    entry.setdefault("source", "zolai-dataset")
    entry.setdefault("category", "wordlist")
    entry.setdefault("synonyms", [])
    entry.setdefault("cefr", "A1")
    entry.setdefault("example_zo", f"{entry['zolai'].capitalize()} pen thupi hi.")
    entry.setdefault("example_en", f"{entry['zolai'].capitalize()} is important.")
    entry.setdefault("original_english", entry.get("english", ""))
    
    return entry

with open(str(Path(__file__).resolve().parents[1]) + "/tmp/batch_12_21_extract.jsonl", "r") as f_in, \
     open(str(Path(__file__).resolve().parents[1]) + "/tmp/batch_12_21_perfect.jsonl", "w") as f_out:
    for line in f_in:
        processed = process_line(line)
        if processed:
            f_out.write(json.dumps(processed, ensure_ascii=False) + "\n")
