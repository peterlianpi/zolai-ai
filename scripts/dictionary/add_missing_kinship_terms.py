"""Add 6 missing kinship terms to dictionary wordlists and dict_unified."""
import json

MISSING = [
    {"zolai": "Pu le pa", "english": "Ancestors / Forefathers", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "kinship", "synonyms": ["Pupa"], "cefr": "B1", "example_zo": "Pu le pa ngeina i kep ding hi.", "example_en": "We should preserve our ancestors' culture."},
    {"zolai": "Pa neu",   "english": "Uncle (Father's younger brother)", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "kinship", "synonyms": [], "cefr": "A2", "example_zo": "Ka pa neu sanginn ah syangpa ahi hi.", "example_en": "My uncle is a teacher at the school."},
    {"zolai": "Nu neu",   "english": "Aunt (Mother's younger sister)", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "kinship", "synonyms": ["Nungak"], "cefr": "A2", "example_zo": "Ka nu neu tawh khua ah ka pai hi.", "example_en": "I went to the village with my aunt."},
    {"zolai": "U",        "english": "Older sibling", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "kinship", "synonyms": ["Upa"], "cefr": "A1", "example_zo": "Ka u in lai hong hilh hi.", "example_en": "My older sibling teaches me."},
    {"zolai": "Nau",      "english": "Younger sibling", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "kinship", "synonyms": ["Nauneu"], "cefr": "A1", "example_zo": "Ka nau tawh ka kimawl hi.", "example_en": "I play with my younger sibling."},
    {"zolai": "Mak",      "english": "Son-in-law", "pos": "Noun", "dialect": "tedim", "source": "zolai-dataset", "category": "kinship", "synonyms": ["Makpa"], "cefr": "B1", "example_zo": "A makpa uh in inn lam hi.", "example_en": "Their son-in-law is building a house."},
]

WORDLISTS = [
    "data/dictionary/wordlists/zo_en_singlewords_v1.jsonl",
    "data/dictionary/wordlists/wordlist_zo_en_v1.jsonl",
]

for path in WORDLISTS:
    with open(path, encoding="utf-8") as f:
        lines = [json.loads(l) for l in f if l.strip()]
    existing = {e.get("zolai", "").lower() for e in lines}
    added = []
    for e in MISSING:
        if e["zolai"].lower() not in existing:
            lines.append({"zolai": e["zolai"], "english": e["english"], "pos": e["pos"], "dialect": e["dialect"], "source": e["source"], "category": e["category"]})
            added.append(e["zolai"])
    with open(path, "w", encoding="utf-8") as f:
        for e in lines:
            f.write(json.dumps(e, ensure_ascii=False) + "\n")
    print(f"{path}: added {added}")

with open("data/dictionary/processed/dict_unified_v1.jsonl", "a", encoding="utf-8") as f:
    for e in MISSING:
        f.write(json.dumps({"headword": e["zolai"], "translations": [e["english"]], "pos": [e["pos"]], "sources": [e["source"]], "synonyms": e["synonyms"], "cefr": e["cefr"], "example_zo": e["example_zo"], "example_en": e["example_en"], "dialect": e["dialect"], "category": e["category"]}, ensure_ascii=False) + "\n")
        print(f"dict_unified: added {e['zolai']}")
