import json
from pathlib import Path
from collections import Counter

DATA = Path("data/training")
CURRENT_FILE = DATA / "master_train_production_complete.jsonl"
OUTPUT_FILE = DATA / "master_train_complete_all_resources.jsonl"
LOG_FILE = DATA / "merge_all_resources.log"

LOG_FILE.write_text("")

def log(msg):
    print(msg, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(msg + "\n")

log("MERGING ALL RESOURCES\n")

# Load current dataset
current_records = []
with open(CURRENT_FILE, "r") as f:
    for line in f:
        current_records.append(json.loads(line))

log(f"Current records: {len(current_records):,}\n")

# Add Bible texts
bible_files = list(Path("data/corpus/bible").glob("*.jsonl"))
bible_count = 0
for bf in bible_files:
    try:
        with open(bf, "r") as f:
            for line in f:
                rec = json.loads(line)
                if rec.get("text"):
                    rec["source_type"] = "religious"
                    rec["dialect"] = rec.get("dialect", "Tedim")
                    rec["level"] = rec.get("language_level", "A2")
                    rec["pos"] = rec.get("pos", "phrase")
                    current_records.append(rec)
                    bible_count += 1
    except:
        pass

log(f"Added Bible texts: {bible_count:,}")

# Add Dictionary entries
dict_files = list(Path("data/dictionary/processed").glob("*.jsonl"))
dict_count = 0
for df in dict_files:
    try:
        with open(df, "r") as f:
            for line in f:
                rec = json.loads(line)
                if rec.get("text") or rec.get("headword"):
                    text = rec.get("text") or rec.get("headword", "")
                    if text:
                        current_records.append({
                            "text": text,
                            "source_type": "reference",
                            "dialect": "Tedim",
                            "level": rec.get("language_level", "A2"),
                            "pos": rec.get("pos", "noun"),
                        })
                        dict_count += 1
    except:
        pass

log(f"Added Dictionary entries: {dict_count:,}")

# Add Parallel translations
parallel_files = list(Path("data/parallel").glob("*.jsonl"))
parallel_count = 0
for pf in parallel_files:
    try:
        with open(pf, "r") as f:
            for line in f:
                rec = json.loads(line)
                text = rec.get("text") or rec.get("zolai", "")
                if text:
                    current_records.append({
                        "text": text,
                        "source_type": "reference",
                        "dialect": "Tedim",
                        "level": rec.get("language_level", "B1"),
                        "pos": rec.get("pos", "phrase"),
                    })
                    parallel_count += 1
    except:
        pass

log(f"Added Parallel translations: {parallel_count:,}")

# Add News/Hymns
news_files = list(Path("data/corpus/news").glob("*.jsonl"))
news_count = 0
for nf in news_files:
    try:
        with open(nf, "r") as f:
            for line in f:
                rec = json.loads(line)
                if rec.get("text"):
                    rec["source_type"] = rec.get("source_type", "corpus")
                    rec["dialect"] = rec.get("dialect", "Tedim")
                    rec["level"] = rec.get("language_level", "A2")
                    rec["pos"] = rec.get("pos", "phrase")
                    current_records.append(rec)
                    news_count += 1
    except:
        pass

log(f"Added News/Hymns: {news_count:,}")

# Save merged dataset
with open(OUTPUT_FILE, "w") as f:
    for i, rec in enumerate(current_records):
        rec["index"] = i
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

log(f"\n{'='*80}")
log(f"Total records: {len(current_records):,}")
log(f"Output: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Merged all resources!")
print(f"Total: {len(current_records):,} records")
print(f"Output: {OUTPUT_FILE}")
