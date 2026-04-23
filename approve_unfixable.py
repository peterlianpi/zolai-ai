#!/usr/bin/env python3
"""
Manual approval for unfixable records - show and decide
"""
import json
from pathlib import Path

DATA = Path("data/training")
INPUT_FILE = DATA / "validation_local_wiki.jsonl"
OUTPUT_FILE = DATA / "master_train_approved.jsonl"
DECISIONS_FILE = DATA / "approval_decisions.jsonl"

# Load all invalid records
invalid_records = []
with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        rec = json.loads(line)
        if rec.get("valid") == False:
            invalid_records.append((i, rec))

print(f"\n{'='*80}")
print(f"MANUAL APPROVAL - {len(invalid_records)} Invalid Records")
print(f"{'='*80}\n")

# Group by reason
by_reason = {}
for idx, rec in invalid_records:
    reason = rec.get("reason", "unknown")
    if reason not in by_reason:
        by_reason[reason] = []
    by_reason[reason].append((idx, rec))

# Show summary
print("BREAKDOWN:\n")
for reason in sorted(by_reason.keys(), key=lambda x: len(by_reason[x]), reverse=True):
    count = len(by_reason[reason])
    print(f"  {reason}: {count}")

print(f"\n{'='*80}")
print("OPTIONS:")
print("  1. Remove all missing_text (62,591)")
print("  2. Fix pathian → pasian if Zolai, else remove")
print("  3. Keep all as-is")
print("  4. Show examples first")
print(f"{'='*80}\n")

choice = input("Choose (1-4): ").strip()

if choice == "4":
    # Show examples
    print(f"\n{'='*80}")
    print("EXAMPLES BY REASON")
    print(f"{'='*80}\n")
    
    for reason in sorted(by_reason.keys(), key=lambda x: len(by_reason[x]), reverse=True)[:5]:
        print(f"\n{reason} ({len(by_reason[reason])} records):")
        for idx, rec in by_reason[reason][:2]:
            text = rec.get("text", "")[:80]
            print(f"  • {text}")
    
    print(f"\n{'='*80}\n")
    choice = input("Now choose (1-3): ").strip()

# Process based on choice
approved = []
removed = []
decisions = []

if choice == "1":
    print("\n✓ Removing all missing_text records...")
    for idx, rec in invalid_records:
        if rec.get("reason") == "missing_text":
            removed.append(rec)
            decisions.append({"index": idx, "action": "remove", "reason": "missing_text"})
        else:
            rec["valid"] = True
            approved.append(rec)
            decisions.append({"index": idx, "action": "keep", "reason": rec.get("reason")})

elif choice == "2":
    print("\n✓ Fixing pathian → pasian (if Zolai), removing others...")
    
    # Zolai markers to detect if text is Zolai
    ZOLAI_MARKERS = {"pasian", "leitung", "khuavak", "tua", "in", "a", "leh", "kei", "gam", "tapa"}
    
    for idx, rec in invalid_records:
        text = rec.get("text", "").lower()
        reason = rec.get("reason", "")
        
        if "missing_text" in reason:
            removed.append(rec)
            decisions.append({"index": idx, "action": "remove", "reason": "missing_text"})
        elif "pathian" in reason:
            # Check if it's Zolai
            has_zolai = any(marker in text for marker in ZOLAI_MARKERS)
            if has_zolai:
                rec["text"] = rec["text"].replace("Pathian", "Pasian").replace("pathian", "pasian")
                rec["valid"] = True
                approved.append(rec)
                decisions.append({"index": idx, "action": "fix_pathian", "reason": reason})
            else:
                removed.append(rec)
                decisions.append({"index": idx, "action": "remove", "reason": "not_zolai"})
        else:
            rec["valid"] = True
            approved.append(rec)
            decisions.append({"index": idx, "action": "keep", "reason": reason})

elif choice == "3":
    print("\n✓ Keeping all records...")
    for idx, rec in invalid_records:
        rec["valid"] = True
        approved.append(rec)
        decisions.append({"index": idx, "action": "keep", "reason": rec.get("reason")})

# Load all valid records
all_records = []
with open(INPUT_FILE, "r") as f:
    for i, line in enumerate(f):
        rec = json.loads(line)
        if rec.get("valid") == True:
            all_records.append(rec)

# Add approved records
all_records.extend(approved)

# Save
with open(OUTPUT_FILE, "w") as f:
    for rec in all_records:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

with open(DECISIONS_FILE, "w") as f:
    for d in decisions:
        f.write(json.dumps(d, ensure_ascii=False) + "\n")

print(f"\n{'='*80}")
print(f"RESULTS")
print(f"{'='*80}")
print(f"Approved: {len(approved)}")
print(f"Removed: {len(removed)}")
print(f"Total valid: {len(all_records)}")
print(f"\nOutput: {OUTPUT_FILE}")
print(f"Decisions: {DECISIONS_FILE}")
print(f"{'='*80}\n")
