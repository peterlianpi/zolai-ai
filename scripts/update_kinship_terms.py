"""
Update dictionary wordlists with correct kinship terms:
  - Papi  = Uncle (Father's older brother)  [was incorrectly "Pa san"]
  - Nupi  = Aunt (Mother's older sister)    [was incorrectly "Nu san"]
Targets: zo_en_singlewords_v1.jsonl, wordlist_zo_en_v1.jsonl
"""
import json

NEW_ENTRIES = [
    {
        "zolai": "Papi",
        "english": "Uncle (Father's older brother)",
        "pos": "Noun",
        "dialect": "tedim",
        "source": "zolai-dataset",
        "category": "kinship",
        "synonyms": ["Pa lian", "Pa san"],
        "cefr": "B1",
        "example_zo": "Ka papi in khua ah ukpi sem hi.",
        "example_en": "My uncle (father's older brother) is the village chief.",
        "notes": "Correct Tedim ZVS term for father's older brother. 'Pa san' is incorrect."
    },
    {
        "zolai": "Nupi",
        "english": "Aunt (Mother's older sister)",
        "pos": "Noun",
        "dialect": "tedim",
        "source": "zolai-dataset",
        "category": "kinship",
        "synonyms": ["Nu lian", "Nu san"],
        "cefr": "B1",
        "example_zo": "Ka nupi in lokho hi.",
        "example_en": "My aunt (mother's older sister) farms the field.",
        "notes": "Correct Tedim ZVS term for mother's older sister. 'Nu san' is incorrect."
    },
]

TARGETS = [
    "data/dictionary/wordlists/zo_en_singlewords_v1.jsonl",
    "data/dictionary/wordlists/wordlist_zo_en_v1.jsonl",
]

for path in TARGETS:
    with open(path, encoding="utf-8") as f:
        lines = [json.loads(l) for l in f if l.strip()]

    existing = {e.get("zolai", "").lower() for e in lines}
    added = []

    for entry in NEW_ENTRIES:
        key = entry["zolai"].lower()
        if key not in existing:
            # minimal fields for wordlist files
            lines.append({
                "zolai": entry["zolai"],
                "english": entry["english"],
                "pos": entry["pos"],
                "dialect": entry["dialect"],
                "source": entry["source"],
                "category": entry["category"],
            })
            added.append(entry["zolai"])
        else:
            # update existing entry's english if it's wrong
            for e in lines:
                if e.get("zolai", "").lower() == key:
                    e["english"] = entry["english"]
                    e["category"] = entry["category"]
                    added.append(f"{entry['zolai']} (updated)")
                    break

    with open(path, "w", encoding="utf-8") as f:
        for e in lines:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    print(f"{path}: {added}")

# Also append full entries to dict_unified_v1.jsonl
UNIFIED = "data/dictionary/processed/dict_unified_v1.jsonl"
with open(UNIFIED, "a", encoding="utf-8") as f:
    for entry in NEW_ENTRIES:
        record = {
            "headword": entry["zolai"],
            "translations": [entry["english"]],
            "pos": [entry["pos"]],
            "sources": [entry["source"]],
            "synonyms": entry["synonyms"],
            "cefr": entry["cefr"],
            "example_zo": entry["example_zo"],
            "example_en": entry["example_en"],
            "dialect": entry["dialect"],
            "category": entry["category"],
            "notes": entry["notes"],
        }
        f.write(json.dumps(record, ensure_ascii=False) + "\n")
        print(f"Appended to dict_unified: {entry['zolai']}")
