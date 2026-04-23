import json
from pathlib import Path

DATA = Path("data/training")
ENRICHED_FILE = DATA / "master_train_enriched.jsonl"
VALIDATED_FILE = DATA / "master_train_final_complete.jsonl"
OUTPUT_FILE = DATA / "master_train_production_complete.jsonl"

log_file = DATA / "merge_complete.log"
log_file.write_text("")

def log(msg):
    print(msg, flush=True)
    with open(log_file, "a") as f:
        f.write(msg + "\n")

log("MERGING ENRICHED FIELDS\n")

# Load enriched data by text
enriched_map = {}
with open(ENRICHED_FILE, "r") as f:
    for line in f:
        rec = json.loads(line)
        text = rec.get("text", "")
        enriched_map[text] = rec

log(f"Loaded {len(enriched_map):,} enriched records\n")

# Merge
count = 0
matched = 0
with open(VALIDATED_FILE, "r") as f_in, open(OUTPUT_FILE, "w") as f_out:
    for i, line in enumerate(f_in):
        try:
            rec = json.loads(line)
            text = rec.get("text", "")
            
            # Merge enriched fields
            if text in enriched_map:
                enriched = enriched_map[text]
                rec["source_type"] = enriched.get("source_type")
                rec["pos"] = enriched.get("pos")
                matched += 1
            
            f_out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            count += 1
            
            if (i + 1) % 500000 == 0:
                log(f"[{i+1}] Processed... Matched: {matched}")
        except:
            pass

log(f"\n{'='*80}")
log(f"Total records: {count:,}")
log(f"Matched enriched: {matched:,} ({100*matched/count:.1f}%)")
log(f"Output: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Merged {matched:,} enriched records")
print(f"Output: {OUTPUT_FILE}")
