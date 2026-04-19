"""
build_semantic_dictionary.py
-----------------------------
Enriches master_dictionary_enriched.jsonl with:
  - synonyms (similar meaning)
  - antonyms (opposite meaning)
  - related words (same root/family)
  - variants (alternate spellings)
  - cross-language accuracy notes
  - ZO→EN and EN→ZO explanation

Output: data/processed/master_dictionary_semantic.jsonl
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT    = Path(__file__).resolve().parents[1]
IN_FILE = ROOT / "data/processed/master_dictionary_enriched.jsonl"
OUT     = ROOT / "data/processed/master_dictionary_semantic.jsonl"

# ── Load base ──────────────────────────────────────────────────────────────
records = [json.loads(l) for l in open(IN_FILE, encoding="utf-8")]
zo_to_rec = {r["zolai"]: r for r in records}
en_to_zo  = {r["english"].lower(): r["zolai"] for r in records}
zo_to_en  = {r["zolai"]: r["english"] for r in records}

# ── Antonym pairs (ZVS-confirmed) ─────────────────────────────────────────
ANTONYMS: dict[str, list[str]] = {
    "hoih":      ["siat","siatna"],
    "siat":      ["hoih"],
    "siatna":    ["hoihna"],
    "lian":      ["tawm","hniam"],
    "tawm":      ["lian","tampi"],
    "sang":      ["hniam","nuaiah"],
    "hniam":     ["sang"],
    "dam":       ["natna","dam lo"],
    "natna":     ["dam","nuntakna"],
    "khuavak":   ["khuamial"],
    "khuamial":  ["khuavak"],
    "it":        ["hua","mudah"],
    "itna":      ["huatna","mudahna"],
    "hua":       ["it","itna"],
    "nuntakna":  ["sihna","si"],
    "sihna":     ["nuntakna"],
    "si":        ["nuntakna","hin"],
    "suahtakna": ["khumna","khumsakna"],
    "khumna":    ["suahtakna"],
    "lungdam":   ["lungkham","lunggim"],
    "lungkham":  ["lungdam","lungnop"],
    "lungnop":   ["lungkham"],
    "thuman":    ["holtakna","holtak"],
    "holtakna":  ["thuman"],
    "pai":       ["hong kik","lawm"],
    "lut":       ["suak","khia"],
    "suak":      ["lut"],
    "khia":      ["lut"],
    "tho":       ["lup","nop"],
    "lup":       ["tho"],
    "kipan":     ["zawh","tawp"],
    "zawh":      ["kipan"],
    "tampi":     ["tawmpi","tawm"],
    "tawmpi":    ["tampi"],
    "gualzo":    ["zo lo","thal"],
    "nasem":     ["tawlna","tawl"],
    "tawlna":    ["nasem"],
    "theih":     ["theih lo","siam lo"],
    "theih lo":  ["theih","siam"],
    "omlo":      ["om"],
    "om":        ["omlo","si"],
    "topa":      [],   # no antonym
    "pasian":    [],
    "hoihna":    ["siatna"],
    "nopna":     ["lungkhamna"],
    "lungkhamna":["nopna","lungdamna"],
    "lungdamna": ["lungkhamna"],
    "khuapi":    ["khuazang"],
    "khuazang":  ["khuapi"],
    "sangin":    ["hniam sangin"],
    "lianzaw":   ["tawmzaw"],
    "tawmzaw":   ["lianzaw"],
}

# ── Synonym clusters (ZVS-confirmed) ──────────────────────────────────────
SYNONYMS: dict[str, list[str]] = {
    "pai":       ["kal","lam"],
    "kal":       ["pai","lam"],
    "gen":       ["hilh","thu gen"],
    "hilh":      ["gen","sawl"],
    "mu":        ["en","ngai"],
    "en":        ["mu","ngai"],
    "it":        ["lungit"],
    "lungit":    ["it"],
    "itna":      ["lungitna"],
    "lungitna":  ["itna"],
    "hua":       ["mudah","hehpih lo"],
    "mudah":     ["hua"],
    "dam":       ["hin","nuntakna nei"],
    "hin":       ["dam","om"],
    "nasem":     ["sep","bawl"],
    "sep":       ["nasem","bawl"],
    "bawl":      ["sak","piang","sep"],
    "sak":       ["bawl","piang"],
    "piang":     ["bawl","sak","suak"],
    "lungdam":   ["nopna","kilemna"],
    "nopna":     ["lungdam"],
    "theih":     ["siam"],
    "siam":      ["theih"],
    "khua":      ["mun"],
    "mun":       ["khua"],
    "inn":       ["omna"],
    "omna":      ["inn"],
    "tapa":      ["ta","nungzui"],
    "ta":        ["tapa","naupang"],
    "naupang":   ["ta"],
    "nuntakna":  ["hin","om"],
    "thuman":    ["tak","taktakin"],
    "tak":       ["thuman"],
    "gam":       ["leitung","mun"],
    "leitung":   ["gam"],
    "vantung":   ["van","vaan"],
    "van":       ["vantung"],
    "tui":       ["tuipi"],
    "khuavak":   ["khuavakna"],
    "khuavakna": ["khuavak"],
    "lungkham":  ["lunggim","nopsaklo"],
    "lunggim":   ["lungkham"],
    "maisak":    ["maisakna","hotkhiat"],
    "hotkhiat":  ["maisak","suahtakna piak"],
    "that":      ["siat","sat"],
    "siat":      ["that","sat"],
    "sat":       ["that","siat"],
    "tawl":      ["nop","lup"],
    "nop":       ["tawl","lup"],
    "lup":       ["nop","tawl"],
    "zawh":      ["tawp","bei"],
    "tawp":      ["zawh","bei"],
    "bei":       ["zawh","tawp"],
    "kipan":     ["kipat","kipanin"],
    "kipat":     ["kipan"],
    "zahtakna":  ["zahtak","zahna"],
    "zahtak":    ["zahtakna"],
    "hehpihna":  ["lungdamna","nopsakna"],
    "nopsakna":  ["hehpihna"],
    "thupha":    ["hehpihna","nopsakna"],
}

# ── Related word families (morphological/semantic) ─────────────────────────
RELATED: dict[str, list[str]] = {
    "it":        ["itna","ki-it","itzaw","hong it","itna nei","lungit"],
    "itna":      ["it","ki-it","lungitna","itzaw"],
    "gen":       ["gentna","gensia","genthak","genkhia","ci-in gen","thu gen"],
    "gentna":    ["gen","thu","kammal"],
    "pai":       ["paina","paisak","paikhia","hong pai","va pai","kal"],
    "paina":     ["pai","lam","lampi"],
    "dam":       ["damna","damsak","kidam","natna","nuntakna"],
    "damna":     ["dam","nuntakna","hin"],
    "bawl":      ["bawlna","bawlsak","kibawl","bawlkhia","sak","piang"],
    "mu":        ["muhna","musak","kimu","mu khin","mu ngei","en"],
    "muhna":     ["mu","en","ngai"],
    "theih":     ["theihna","theih lo","siam","zil"],
    "theihna":   ["theih","siam","pilna"],
    "lung":      ["lungdam","lungkham","lunggim","lungit","lunghih","lungkim","lungnop","lunggim"],
    "lungdam":   ["lung","nopna","kilemna","lungdamna"],
    "lungkham":  ["lung","lunggim","nopsaklo"],
    "khua":      ["khuavak","khuamial","khuado","khuapi","khuazang","khuasung"],
    "khuavak":   ["khua","khuamial","khuavakna"],
    "inn":       ["innkuan","innpi","innsang","innsung","innkong","omna"],
    "innkuan":   ["inn","pa","nu","ta","beh"],
    "tui":       ["tuipi","tuikhur","tuikhawm","tuidot","tuihal"],
    "van":       ["vantung","vanpi","vaan","khuavak"],
    "vantung":   ["van","vaan","Pasian omna"],
    "gam":       ["gamzang","gampi","gamlak","gamtakna","leitung"],
    "leitung":   ["gam","mun","khua"],
    "nuntakna":  ["hin","dam","om","sihna","nuntak"],
    "sihna":     ["si","nuntakna","that"],
    "pasian":    ["topa","kumpipa","Jesuh","Khrih"],
    "topa":      ["pasian","kumpipa","ukpa"],
    "tapa":      ["ta","naupang","nungzui","nu","pa"],
    "pa":        ["nu","tapa","tanu","innkuan"],
    "nu":        ["pa","tanu","tapa","innkuan"],
    "beh":       ["phung","innkuan","khanggui"],
    "phung":     ["beh","ngeina","dan"],
    "thuman":    ["tak","taktakin","holtakna"],
    "holtakna":  ["thuman","holtak"],
    "suahtakna": ["khumna","suahtak","hotkhiatna"],
    "khumna":    ["suahtakna","khumsakna"],
    "maisak":    ["maisakna","hotkhiat","suahtakna piak"],
    "thupha":    ["hehpihna","nopsakna","lungdamna"],
    "hehpihna":  ["thupha","nopsakna","lungdamna"],
    "zahtakna":  ["zahtak","zahna","kilemna"],
    "nasem":     ["nasepna","sep","bawl","naseppa"],
    "nasepna":   ["nasem","sep","bawl"],
    "zil":       ["zilna","sinna","theih","siam"],
    "zilna":     ["zil","sinna","pilna"],
    "sinna":     ["zil","zilna","pilna","sang"],
    "pilna":     ["sinna","theihna","siam"],
    "lam":       ["lampi","lamzang","pai","kal"],
    "lampi":     ["lam","lamzang","dan"],
    "thu":       ["thugen","thukham","thupi","kammal"],
    "thukham":   ["thu","dan","ngeina"],
    "kammal":    ["thu","gen","zolai"],
    "zolai":     ["pau","kammal","laigelh"],
    "pau":       ["zolai","gen","thu"],
    "laigelh":   ["zolai","laisim","gelh"],
    "laisim":    ["laigelh","sinna","zil"],
}

# ── Accuracy explanation builder ──────────────────────────────────────────
def build_explanation(zo: str, en: str, pos: str, variants: list,
                       synonyms: list, antonyms: list, related: list,
                       examples: list) -> str:
    parts = []

    # Core meaning
    parts.append(f"'{zo}' means '{en}' in Tedim Zolai.")

    # POS-specific usage
    pos_l = pos.lower().strip()
    if pos_l in ("v", "vt"):
        parts.append(f"As a verb, use in SOV order: [Subject]-in [Object] {zo} hi.")
        if examples:
            ex = examples[0]
            parts.append(f"Bible example: \"{ex['zo'][:80]}\" ({ex['reference']})")
    elif pos_l in ("n", "noun"):
        parts.append(f"As a noun, it can be subject or object. Nominalize: '{zo}na' = the act/state of {en}.")
    elif pos_l in ("adj", "a", "adjective"):
        parts.append(f"As an adjective, place before noun or use as predicate: 'A {zo} hi' = It is {en}.")
    elif pos_l in ("adv", "adverb"):
        parts.append("As an adverb, place before the verb or at sentence start.")

    # Variants
    if variants:
        parts.append(f"Also written/said as: {', '.join(variants[:3])}.")

    # Synonyms
    if synonyms:
        parts.append(f"Similar words: {', '.join(synonyms[:3])}.")

    # Antonyms
    if antonyms:
        parts.append(f"Opposite: {', '.join(antonyms[:3])}.")

    # Related
    if related:
        parts.append(f"Related words: {', '.join(related[:4])}.")

    # ZO→EN direction note
    parts.append(f"ZO→EN: Use '{zo}' when translating '{en}' from Tedim to English.")

    # EN→ZO direction note
    if synonyms:
        parts.append(f"EN→ZO: When translating '{en}' to Tedim, '{zo}' is primary; also consider {', '.join(synonyms[:2])} for nuance.")
    else:
        parts.append(f"EN→ZO: '{zo}' is the standard Tedim equivalent of '{en}'.")

    return " ".join(parts)

# ── Build enriched records ─────────────────────────────────────────────────
print("Building semantic dictionary...", flush=True)
out_records = []

for i, r in enumerate(records):
    if i % 3000 == 0:
        print(f"  {i}/{len(records)}...", flush=True)

    zo  = r["zolai"]
    en  = r["english"]
    pos = r["pos"]

    syns  = SYNONYMS.get(zo, [])
    ants  = ANTONYMS.get(zo, [])
    rels  = RELATED.get(zo, [])

    # Also infer synonyms from variants sharing same English
    for v in r.get("variants", []):
        if v in zo_to_en and zo_to_en[v] == en and v not in syns:
            syns.append(v)

    # Infer related from root family (shared 4-char prefix)
    if len(zo) >= 4:
        root = zo[:4].lower()
        for other_zo, other_r in zo_to_rec.items():
            if other_zo != zo and other_zo.lower().startswith(root):
                if other_zo not in rels and len(rels) < 6:
                    rels.append(other_zo)

    explanation = build_explanation(zo, en, pos, r.get("variants",[]),
                                     syns, ants, rels, r.get("examples",[]))

    out_records.append({
        "zolai":       zo,
        "english":     en,
        "pos":         pos,
        "variants":    r.get("variants", []),
        "synonyms":    syns,
        "antonyms":    ants,
        "related":     rels,
        "dialect":     "tedim",
        "source":      r.get("source",""),
        "examples":    r.get("examples", []),
        "explanation": explanation,
        "usage_notes": r.get("usage_notes",""),
        "accuracy":    r.get("accuracy",""),
        "category":    "dictionary",
    })

print(f"Done: {len(out_records)} entries")

# ── Write ──────────────────────────────────────────────────────────────────
with open(OUT, "w", encoding="utf-8") as f:
    for r in out_records:
        f.write(json.dumps(r, ensure_ascii=False) + "\n")

size = OUT.stat().st_size / 1024 / 1024
print(f"Saved: {OUT} ({size:.1f} MB)")

# Stats
with_syns = sum(1 for r in out_records if r["synonyms"])
with_ants = sum(1 for r in out_records if r["antonyms"])
with_rels = sum(1 for r in out_records if r["related"])
with_exs  = sum(1 for r in out_records if r["examples"])
print(f"  with synonyms:  {with_syns}")
print(f"  with antonyms:  {with_ants}")
print(f"  with related:   {with_rels}")
print(f"  with examples:  {with_exs}")

if __name__ == "__main__":
    pass
