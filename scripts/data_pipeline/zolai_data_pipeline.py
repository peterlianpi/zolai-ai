import json
import re
import sqlite3
from pathlib import Path

"""
Zo_Tdm (Tedim) Unified Data Pipeline v2
Consolidates all dictionary builds and professional markdown generation into a single reusable script.
"""

# --- UTILS & CLEANING ---
def clean_term(text):
    if not text: return ""
    text = re.sub(r'^[a-z]{1,4}\.?\s+', '', text, flags=re.IGNORECASE)
    return text.replace("|", "").replace("\n", " ").strip()

# --- STEP 1: BUILD MASTER DATASET ---
def build_master():
    print("Step 1: Building Unified Master Dataset...")
    master = {}

    # data.sqlite
    db_sqlite = Path("data/data.sqlite")
    if db_sqlite.exists():
        conn = sqlite3.connect(db_sqlite)
        cursor = conn.cursor()
        tables = ["e2z.dict.tkd", "e2z.dict.mcpg", "e2z.dict.dlh", "e2z.dict.common"]
        for table in tables:
            try:
                cursor.execute(f'SELECT mainWord, origin, wordType, definitionArray, credit FROM "{table}"')
                for hw, raw_zol, pos, defs, credit in cursor.fetchall():
                    if not hw or not defs: continue
                    hw_clean = hw.lower().strip()
                    if hw_clean not in master:
                        master[hw_clean] = {"translations": set(), "pos": set(), "sources": set(), "explanation": ""}
                    master[hw_clean]["translations"].add(clean_term(raw_zol if raw_zol else hw))
                    if pos: master[hw_clean]["pos"].add(pos.lower())
                    master[hw_clean]["sources"].add(credit if credit else table)
                    if not master[hw_clean]["explanation"]:
                        master[hw_clean]["explanation"] = defs.replace("\n", " ").strip()
            except: pass
        conn.close()

    # ZomiDictionary.db
    db_zomi = Path("data/ZomiDictionary.db")
    if db_zomi.exists():
        conn = sqlite3.connect(db_zomi)
        cursor = conn.cursor()
        cursor.execute("SELECT English, Tedim FROM TedimEnglish")
        for hw, raw_zo in cursor.fetchall():
            if not hw or not raw_zo: continue
            hw_clean = hw.lower().replace("/a", "").strip()
            if hw_clean not in master:
                master[hw_clean] = {"translations": set(), "pos": set(), "sources": set(), "explanation": ""}
            pos_match = re.match(r'^([a-z]{1,4}\.?)\s+(.*)', raw_zo, re.I)
            if pos_match:
                master[hw_clean]["pos"].add(pos_match.group(1).lower().replace(".", ""))
                content = pos_match.group(2)
                words = content.split(".")[0]
                for w in words.split(";"):
                    master[hw_clean]["translations"].add(clean_term(w))
            master[hw_clean]["sources"].add("ZomiDict")
        conn.close()

    final_dict = {}
    for hw in sorted(master.keys()):
        final_dict[hw] = {
            "headword": hw,
            "translations": sorted(list(master[hw]["translations"])),
            "pos": sorted(list(master[hw]["pos"])),
            "sources": sorted(list(master[hw]["sources"])),
            "explanation": master[hw]["explanation"]
        }

    with open("data/master_zo_tdm_dictionary.json", "w", encoding="utf-8") as f:
        json.dump(final_dict, f, ensure_ascii=False, indent=2)
    print(f"Master Dataset built with {len(final_dict)} headwords.")
    return final_dict

# --- STEP 2: GENERATE ULTIMATE DICTIONARY MD ---
def generate_ultimate_md(master):
    print("Step 2: Generating Ultimate Professional Dictionary MD...")
    output_path = Path("resources/zo_tdm_ultimate_pro_dictionary.md")
    headers = ["English", "Zo_Tdm (Words)", "POS", "Explanation / Context", "Sources"]

    sorted_keys = sorted(master.keys())
    with open(output_path, "w", encoding="utf-8") as md:
        md.write("# Zo_Tdm (Tedim) Integrated Professional Dictionary\n")
        md.write("## Unified Multi-Source Dataset (TKD, MCPG, DLH, ZomiDict)\n\n")
        md.write(f"Total Unique Entries: {len(sorted_keys)}\n\n")

        current_letter = ""
        for eng in sorted_keys:
            entry = master[eng]
            first_char = eng[0].upper()
            if not first_char.isalpha(): first_char = "#"

            if first_char != current_letter:
                current_letter = first_char
                md.write(f"\n## {current_letter}\n")
                md.write("| " + " | ".join(headers) + " |\n")
                md.write("|" + "|".join(["---"] * len(headers)) + "|\n")

            words = " / ".join(entry["translations"][:3])
            pos = " / ".join(entry["pos"])
            explain = entry["explanation"].replace("|", "\\|")
            sources = ", ".join(entry["sources"])
            md.write(f"| {eng} | {words} | {pos} | {explain[:200]} | {sources} |\n")
    print(f"Generated {output_path}.")

# --- STEP 3: GENERATE CURATED LEXICON ---
def generate_lexicon_md():
    print("Step 3: Generating Professional Lexicon MD...")
    curated = {
        "Kinship": [
            {"eng": "uncle", "zo": "pa / pu / gang", "status": "Cultural", "notes": "gang (ni' pasal)"},
            {"eng": "father's elder brother", "zo": "pagi / papi", "status": "Verified", "notes": "gi = big"},
        ],
        "Society": [
            {"eng": "law / constitution", "zo": "thukhun / thukham", "status": "Formal", "notes": "thukhun = foundation"},
            {"eng": "hospital", "zo": "zato / zatopi", "status": "Verified", "notes": "pi = main"},
        ],
        "General": [
            {"eng": "garden", "zo": "huan", "status": "Verified", "notes": ""},
            {"eng": "fish", "zo": "nga", "status": "Verified", "notes": ""},
            {"eng": "read aloud", "zo": "a ngaih a sim", "status": "Daily", "notes": "voice loud"},
        ]
    }
    output_path = Path("resources/zo_tdm_professional_lexicon_v1.md")
    with open(output_path, "w", encoding="utf-8") as md:
        md.write("# Zo_Tdm Professional Lexicon\n")
        for cat, items in curated.items():
            md.write(f"### {cat}\n")
            md.write("| English | Zo_Tdm | Status | Notes |\n")
            md.write("|---------|--------|--------|-------|\n")
            for i in items:
                md.write(f"| {i['eng']} | {i['zo']} | {i['status']} | {i['notes']} |\n")
            md.write("\n")
    print(f"Generated {output_path}.")

# --- EXECUTE PIPELINE ---
def main():
    master = build_master()
    generate_ultimate_md(master)
    generate_lexicon_md()
    print("Unified Pipeline Successful.")

if __name__ == "__main__":
    main()
