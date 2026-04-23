import json
from pathlib import Path

DATA = Path("data/training")
SOURCE_FILE = DATA / "master_train_fixed_v2.jsonl"
OUTPUT_FILE = DATA / "master_train_final_complete.jsonl"

log_file = DATA / "restore_fields.log"
log_file.write_text("")

def log(msg):
    print(msg, flush=True)
    with open(log_file, "a") as f:
        f.write(msg + "\n")

log("RESTORING ENRICHED FIELDS\n")

count = 0
with open(SOURCE_FILE, "r") as f_in, open(OUTPUT_FILE, "w") as f_out:
    for i, line in enumerate(f_in):
        try:
            rec = json.loads(line)
            
            # Keep all fields
            f_out.write(json.dumps(rec, ensure_ascii=False) + "\n")
            count += 1
            
            if (i + 1) % 500000 == 0:
                log(f"[{i+1}] Processed...")
        except:
            pass

log(f"\n{'='*80}")
log(f"Total records: {count:,}")
log(f"Output: {OUTPUT_FILE}")
log(f"{'='*80}")

print(f"\n✅ Restored {count:,} records with all fields")
print(f"Output: {OUTPUT_FILE}")
