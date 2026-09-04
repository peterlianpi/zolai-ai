#!/usr/bin/env python3
"""
Zolai CEFR Tagger
Tags a JSONL dataset with CEFR levels (A1-C2) based on source, reference,
and linguistic patterns. Filters non-Tedim dialects.
"""
import argparse
import json
import re
from pathlib import Path

# --- Dialect Filter ---
FORBIDDEN_DIALECTS = {"FCL", "HCL", "HCL06", "Hakha", "Falam", "Chin", "Burmese"}

# --- Level Patterns (Heuristics) ---
P_A2 = re.compile(r"\b(tua ciangin|ding hi|khin hi|ngei hi|nuam hi|te|uh hi)\b", re.IGNORECASE)
P_B1 = re.compile(r"\b(hiam\?|diam\?|bang hang|cih leh|ahih manin|sangin|zaw hi|ci hi|ci-in)\b", re.IGNORECASE)
P_B2 = re.compile(r"\b(kei a leh|kei leh|ahih kei leh)\b", re.IGNORECASE)
P_C1 = re.compile(r"\b(hi hi|KEIMAH|longal|kei hen|loh nadingin)\b")
P_C2 = re.compile(r"\b(ka khuadak leh|ka mu hi|kilawm hi|tawntung)\b", re.IGNORECASE)

# --- Source/Reference Mapping ---
SOURCE_MAP = {
    # Pentateuch
    "GEN": "A2", "EXO": "A2", "LEV": "B2", "NUM": "B2", "DEU": "B2",
    # History
    "JOS": "A2", "JDG": "A2", "RUT": "A2", "1SA": "A2", "2SA": "A2", "1KI": "A2", "2KI": "A2",
    "1CH": "A2", "2CH": "A2", "EZR": "A2", "NEH": "A2", "EST": "A2",
    # Wisdom
    "JOB": "C2", "PSA": "C2", "PRO": "C2", "ECC": "C2", "SNG": "C2",
    # Prophets
    "ISA": "C2", "JER": "C2", "LAM": "C2", "EZE": "C2", "EZK": "C2", "DAN": "C2",
    "HOS": "B2", "JOE": "B2", "JOL": "B2", "AMO": "B2", "OBA": "B2", "JON": "A2",
    "MIC": "B2", "NAH": "B2", "HAB": "B2", "ZEP": "B2", "HAG": "B2", "ZEC": "B2", "MAL": "B2",
    # Gospels/Acts
    "MAT": "B1", "MRK": "B1", "LUK": "B1", "JHN": "C1", "ACT": "B1",
    # Epistles
    "ROM": "C1", "1CO": "C1", "2CO": "C1", "GAL": "C1", "EPH": "C1", "PHP": "C1",
    "COL": "C1", "1TH": "C1", "2TH": "C1", "1TI": "C1", "2TI": "C1", "TIT": "C1",
    "PHM": "C1", "HEB": "C1", "JAS": "C1", "1PE": "C1", "2PE": "C1", "1JN": "C1",
    "2JN": "C1", "3JN": "C1", "JUD": "C1", "REV": "C2",

    # Generic
    "rvasia": "B2",
    "dictionary": "A1",
    "tongdot": "A1",
    "lesson": "A1",
}

def detect_level(text, metadata):
    source = metadata.get("source", "").upper()
    ref = metadata.get("reference", "").upper()
    dialect = metadata.get("dialect", "").upper()

    # 0. Dialect Filtering
    if dialect in FORBIDDEN_DIALECTS or any(d in ref for d in FORBIDDEN_DIALECTS):
        return "SKIP"

    # 1. Bible Reference Logic
    for book, level in SOURCE_MAP.items():
        if book in ref:
            return level

    # 2. Source-based Logic
    for src_key, level in SOURCE_MAP.items():
        if src_key in source:
            return level

    if "RVASIA" in source:
        return "B2"
    if "SYNTHETIC" in source:
        return "B1"

    # 3. Linguistic Pattern Logic
    if P_C2.search(text): return "C2"
    if P_C1.search(text): return "C1"
    if P_B2.search(text): return "B2"
    if P_B1.search(text): return "B1"
    if P_A2.search(text): return "A2"

    # 4. Complexity Heuristic
    words = text.split()
    if len(words) > 20: return "B1"
    if len(words) > 8: return "A2"

    return "A1"

def main():
    parser = argparse.ArgumentParser(description="Tag Zolai JSONL with CEFR levels")
    parser.add_argument("-i", "--input", required=True, help="Input JSONL file")
    parser.add_argument("-o", "--output", required=True, help="Output JSONL file")
    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        print(f"Error: {input_path} not found.")
        return

    print(f"Tagging {input_path}...")

    count = 0
    skipped = 0
    levels = {"A1": 0, "A2": 0, "B1": 0, "B2": 0, "C1": 0, "C2": 0}

    with open(input_path, "r", encoding="utf-8") as f_in, \
         open(output_path, "w", encoding="utf-8") as f_out:

        for line in f_in:
            try:
                record = json.loads(line)

                # Handle all 3 v11 structures:
                # 1. {instruction, input, output, metadata?}
                # 2. {source, data: {text, source?, reference?}}
                # 3. {instruction, input, output}
                if "data" in record and "output" not in record:
                    # Structure 2: raw sentence wrapper
                    data = record.get("data", {})
                    text = data.get("text", "")
                    metadata = {
                        "source": data.get("source", record.get("source", "")),
                        "reference": data.get("reference", ""),
                        "dialect": data.get("dialect", ""),
                    }
                else:
                    text = record.get("output", record.get("text", ""))
                    metadata = record.get("metadata", {})
                    # Also check instruction for dialect filter
                    instr = record.get("instruction", "")
                    if any(d in instr for d in ("FCL", "HCL", "Hakha", "Falam")):
                        skipped += 1
                        continue

                level = detect_level(text, metadata)

                if level == "SKIP":
                    skipped += 1
                    continue

                if "metadata" not in record:
                    record["metadata"] = {}
                record["metadata"]["cefr_level"] = level

                f_out.write(json.dumps(record, ensure_ascii=False) + "\n")
                levels[level] += 1
                count += 1

            except Exception:
                pass

    print(f"Total: {count} | Skipped: {skipped}")
    for lvl, val in levels.items():
        print(f"  {lvl}: {val} ({val/count*100:.1f}%)")

if __name__ == "__main__":
    main()
