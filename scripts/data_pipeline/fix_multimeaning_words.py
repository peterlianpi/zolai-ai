#!/usr/bin/env python3
"""
Fix apostrophe-prefix noise entries and multi-meaning words.
Also adds correct contextual meanings based on corpus evidence.
"""
import json, re
from pathlib import Path

MASTER = "data/dictionary/processed/dict_master_v1.jsonl"

# Words to remove (pure noise — apostrophe fragments, proper noun artifacts)
REMOVE = {"'laban'"}

# Corrections: apostrophe form → correct headword + proper meanings
# Based on corpus context analysis
CORRECTIONS = {
    "'dawn": {
        "merge_into": "dawn",
        "note": "Contraction of 'adawn' — context: drink"
    },
    "'en": {
        "merge_into": "en",
        "note": "Imperative of 'en' — look/see"
    },
    "'na": {
        "merge_into": "na",
        "note": "Possessive particle — your/others' things"
    },
    "'tu": {
        "merge_into": "tu",
        "note": "Demonstrative — today/this day (tu ni-in = today)"
    },
}

# Multi-meaning corrections — add missing contextual meanings
# Format: word → additional translations to prepend/add
MULTI_MEANING_FIXES = {
    "dawn":  {"add_trans": ["drink","drinking water","to drink"],
              "usage": "Multi-meaning: (1) drink/drinking water (2) dawn/morning. Context determines meaning."},
    "en":    {"add_trans": ["look","see","behold","look!"],
              "usage": "Imperative: 'En in' = Look! / Behold! Also used as 'en' = eye (mit/en)."},
    "na":    {"add_trans": ["your","yours","things","possessive marker"],
              "usage": "'Na na gu kei ding hi' = Do not steal (your/others') things. Na = your/possessive."},
    "tu":    {"add_trans": ["today","this day","now","at this time"],
              "usage": "'Tu ni-in' = today / on this day. 'Tu' alone = this/now in temporal context."},
    "kei":   {"add_trans": ["not","no","negative particle","none"],
              "usage": "Primary negation particle. 'kei lo' = none/not any (Ten Commandments)."},
    "lo":    {"add_trans": ["not","no","negative","or else"],
              "usage": "Valid ZVS negation for 3rd person/past. 'Amah dam lo hi' = He is not well."},
    "kei lo":{"add_trans": ["none","not any","no other","absolute negation"],
              "usage": "'Pasian dang kei lo' = No other God. Compound absolute negation."},
    "dam":   {"add_trans": ["well","healthy","healed","recover","be well"],
              "usage": "'Ka dam hi' = I am well. 'Ka dam kik ta hi' = I am well again."},
    "kik":   {"add_trans": ["again","back","return","once more"],
              "usage": "'Dam kik' = well again. 'Pai kik' = go back/return."},
    "ta":    {"add_trans": ["now","change of state","already","just happened"],
              "usage": "Aspect marker: change has occurred. 'Om ta' = now exists. 'Dam kik ta hi' = well again now."},
    "sanginn":{"add_trans": ["school","academy","place of learning","education"],
               "usage": "ZVS correct spelling (not sanggin). 'Ka tanu sanginn ah a pai hi' = My daughter went to school."},
    "tanu":  {"add_trans": ["daughter","girl","female child"],
              "usage": "Female child. Opposite: tapa (son). 'Ka tanu' = my daughter."},
    "tapa":  {"add_trans": ["son","boy","male child","child"],
              "usage": "Male child. Opposite: tanu (daughter). 'Ka tapa' = my son."},
    "nu":    {"add_trans": ["mother","mom","female parent"],
              "usage": "Mother. Opposite: pa (father). 'Ka nu' = my mother."},
    "pa":    {"add_trans": ["father","dad","male parent"],
              "usage": "Father. Opposite: nu (mother). 'Ka pa' = my father."},
    "pasian":{"add_trans": ["God","Lord","deity","the Almighty"],
              "usage": "ZVS standard (not pathian). 'Pasian in vantung leh leitung a piangsak hi' = God created heaven and earth."},
}


def main():
    import os
    os.chdir(Path(__file__).parent.parent.parent)

    entries = [json.loads(l) for l in open(MASTER, encoding="utf-8")]
    master = {e["zolai"]: e for e in entries}

    fixed = removed = merged = 0

    # 1. Remove noise entries
    for word in REMOVE:
        if word in master:
            del master[word]
            removed += 1
            print(f"  Removed: {word}")

    # 2. Merge apostrophe forms into correct headwords
    for apo_word, info in CORRECTIONS.items():
        if apo_word not in master: continue
        target = info["merge_into"]
        apo_entry = master.pop(apo_word)
        removed += 1
        # If target exists, enrich it with the example from the apostrophe entry
        if target in master:
            if apo_entry.get("examples") and not master[target].get("examples"):
                master[target]["examples"] = apo_entry["examples"]
                merged += 1
        print(f"  Merged '{apo_word}' → '{target}'")

    # 3. Apply multi-meaning fixes
    for word, fix in MULTI_MEANING_FIXES.items():
        if word not in master: continue
        e = master[word]
        # Add new translations (prepend, avoid duplicates)
        existing = e.get("translations", [])
        new_trans = fix["add_trans"]
        merged_trans = new_trans[:]
        for t in existing:
            if t not in merged_trans:
                merged_trans.append(t)
        e["translations"] = merged_trans[:10]
        e["english"] = merged_trans[0]
        e["usage_notes"] = fix["usage"]
        fixed += 1

    # Save
    with open(MASTER, "w", encoding="utf-8") as f:
        for e in sorted(master.values(), key=lambda x: x.get("zolai","")):
            f.write(json.dumps(e, ensure_ascii=False) + "\n")

    print(f"\nRemoved/merged: {removed} | Multi-meaning fixed: {fixed}")
    print(f"Total entries: {len(master)}")

    # Verify key words
    print("\nVerification:")
    for word in ["dawn","en","na","tu","dam","kei","sanginn","tanu","pasian"]:
        e = master.get(word)
        if e:
            print(f"  {word}: {e['translations'][:4]} | {e.get('usage_notes','')[:60]}")


if __name__ == "__main__":
    main()
