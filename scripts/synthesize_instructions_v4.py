"""Bulk pattern expansion — pronoun × verb × tense matrix + parallel-derived instructions."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT  = ROOT / "data/master/combined/instructions.jsonl"
PAR  = ROOT / "data/master/combined/parallel.jsonl"

def md5(s): return hashlib.md5(s.encode()).hexdigest()
def c(v):   return " ".join(str(v or "").split()).strip()

seen: set[str] = set()
with OUT.open(encoding="utf-8") as f:
    for line in f:
        try:
            obj = json.loads(line.strip())
            k = c(obj.get("instruction","")) + c(obj.get("output",""))
            if k: seen.add(md5(k))
        except: pass
print(f"Existing: {len(seen):,}", flush=True)

recs: list[dict] = []

def add(ins: str, inp: str, out: str, domain: str = "grammar") -> None:
    ins, inp, out = c(ins), c(inp), c(out)
    if not ins or not out: return
    k = md5(ins + out)
    if k in seen: return
    seen.add(k)
    recs.append({"instruction": ins, "input": inp, "output": out,
                 "source": "wiki_synthesizer_v4", "domain": domain,
                 "dialect": "tedim", "category": "instruction"})

# ── Pronoun × verb × tense matrix ────────────────────────────────────────────
PRONOUNS = [
    ("ka","1sg","I","Ka"),("na","2sg","You","Na"),("a","3sg","He/She","A"),
    ("i","1pl_inc","We","I"),("ko","1pl_exc","We (excl.)","Ko"),
]
VERBS_SIMPLE = [
    ("pai","go","goes","went","will go","is going"),
    ("ne","eat","eats","ate","will eat","is eating"),
    ("om","stay/exist","stays","stayed","will stay","is staying"),
    ("gen","speak","speaks","spoke","will speak","is speaking"),
    ("ngen","pray","prays","prayed","will pray","is praying"),
    ("sim","read","reads","read","will read","is reading"),
    ("sa","sing","sings","sang","will sing","is singing"),
    ("lum","sleep","sleeps","slept","will sleep","is sleeping"),
]
TENSE_MAP = [
    ("present","hi","{en_3sg}","{pr} {zo} hi."),
    ("past","ta hi","{en_past}","{pr} {zo} ta hi."),
    ("future","ding hi","will {en_inf}","{pr} {zo} ding hi."),
    ("progressive","lai hi","is {en_prog}","{pr} {zo} lai hi."),
    ("neg_present","lo hi","does not {en_inf}","{pr} {zo} lo hi."),
    ("neg_future","kei ding hi","will not {en_inf}","{pr} {zo} kei ding hi."),
]
for pr_marker, pr_label, pr_en, pr_cap in PRONOUNS[:3]:  # ka/na/a only to keep size manageable
    for stem, en_inf, en_3sg, en_past, en_fut, en_prog in VERBS_SIMPLE[:5]:
        for tense_name, marker, en_pat_tmpl, zo_pat_tmpl in TENSE_MAP:
            en_pat = en_pat_tmpl.format(en_inf=en_inf, en_3sg=en_3sg, en_past=en_past, en_prog=en_prog)
            zo_pat = zo_pat_tmpl.format(pr=pr_marker, zo=stem)
            en_sent = f"{pr_en} {en_pat}."
            add(f"Translate to Zolai ({pr_label}, {tense_name}).", en_sent, zo_pat, "grammar")

# ── Question word drills ──────────────────────────────────────────────────────
Q_WORDS = [
    ("Bang","What","Bang na duh hiam?","What do you want?"),
    ("Kua","Who","Kua na hi hiam?","Who are you?"),
    ("Koi ah","Where","Koi ah na om hiam?","Where are you?"),
    ("Bang hun","When","Bang hun ah na pai ding hiam?","When will you go?"),
    ("Bang hang","Why","Bang hang na kap hiam?","Why are you crying?"),
    ("Bang ci","How","Bang ci na bawl hiam?","How do you do it?"),
    ("Bang zah","How many/much","Bang zah na nei hiam?","How many do you have?"),
]
for qw, en_qw, ex_zo, ex_en in Q_WORDS:
    add(f"What is the Zolai question word for '{en_qw}'?",
        "", f"'{qw}' = {en_qw}. Example: '{ex_zo}' ({ex_en}). All content questions end with 'hiam'.", "grammar")
    add(f"Form a question using '{qw}' in Zolai.", "", f"{ex_zo} ({ex_en})", "grammar")

# ── Preposition / postposition drills ─────────────────────────────────────────
PREPS = [
    ("ah","in/at/to (location/direction)","Khua ah om hi.","He is in the village."),
    ("tawh","with/using","Amah tawh pai hi.","He goes with him."),
    ("pan","from","Tedim pan hong pai hi.","He comes from Tedim."),
    ("kiang","to/toward (person)","Ka pa kiang gen hi.","He speaks to my father."),
    ("tungah","about/concerning","Pasian tungah gen hi.","He speaks about God."),
    ("ding","for/in order to","Nek ding ah pai hi.","He goes in order to eat."),
    ("sung","inside/within","Inn sung ah om hi.","He is inside the house."),
    ("tung","on top of/above","Bawng tung ah dung hi.","He sits on top of the table."),
    ("hnuai","below/under","Bawng hnuai ah om hi.","It is under the table."),
    ("ngeina","beside/next to","Ka ngeina ah om in.","Stay beside me."),
]
for prep, meaning, ex_zo, ex_en in PREPS:
    add(f"What does the Zolai postposition '{prep}' mean?",
        "", f"'{prep}' = {meaning}. Example: '{ex_zo}' ({ex_en})", "grammar")
    add(f"Translate to Zolai (use '{prep}').", ex_en, ex_zo, "grammar")

# ── Derive instructions from parallel corpus (sample 500 pairs) ───────────────
print("Sampling parallel corpus...", flush=True)
par_count = 0
with PAR.open(encoding="utf-8") as f:
    for i, line in enumerate(f):
        if i % 400 != 0: continue  # sample every 400th = ~500 pairs
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue
        en = c(obj.get("english",""))
        zo = c(obj.get("zolai",""))
        ref = c(obj.get("reference",""))
        if not en or not zo or len(en) < 5 or len(zo) < 5: continue
        if len(en) > 200 or len(zo) > 200: continue  # skip very long verses

        add("Translate this English text to Zolai (Tedim Chin).", en, zo, "translation")
        add("Translate this Zolai text to English.", zo, en, "translation")
        if ref:
            add(f"What is the Zolai translation of this verse ({ref})?", en, zo, "religion")
        par_count += 1
        if par_count >= 500: break

print(f"Derived {par_count} parallel pairs → {par_count*2} translation instructions", flush=True)

# ── Write ─────────────────────────────────────────────────────────────────────
with OUT.open("a", encoding="utf-8") as f:
    for rec in recs:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

print(f"Added {len(recs):,} new instructions", flush=True)
print(f"Total now: {len(seen):,}", flush=True)
