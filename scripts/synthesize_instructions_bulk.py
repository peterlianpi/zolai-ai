"""
Bulk instruction generator — expands grammar patterns across vocabulary domains.
Agents: Zomi Synthesizer + Linguistic Specialist
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT  = ROOT / "data/master/combined/instructions.jsonl"

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return " ".join(str(v or "").split()).strip()

# Load existing hashes
seen: set[str] = set()
with OUT.open(encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line: continue
        try:
            obj = json.loads(line)
            k = c(obj.get("instruction","")) + c(obj.get("output",""))
            if k: seen.add(md5(k))
        except: pass
print(f"Existing: {len(seen):,}", flush=True)

records: list[dict] = []

def add(ins: str, inp: str, out: str, domain: str = "grammar") -> None:
    ins, inp, out = c(ins), c(inp), c(out)
    if not ins or not out: return
    k = md5(ins + out)
    if k in seen: return
    seen.add(k)
    records.append({"instruction": ins, "input": inp, "output": out,
                    "source": "wiki_synthesizer_v2", "domain": domain,
                    "dialect": "tedim", "category": "instruction"})

# ── SOV translations — daily vocabulary ──────────────────────────────────────
DAILY_EN_ZO = [
    ("I drink water.", "Tui ka dawn hi."),
    ("She cooks food.", "Amah in an a bawl hi."),
    ("We pray together.", "I kikhawm in thu i ngen hi."),
    ("He reads the Bible.", "Amah in Laisiangtho a sim hi."),
    ("The child plays.", "Ngakchia in a zin hi."),
    ("My mother is kind.", "Ka nu pen lungkim mahmah ahi hi."),
    ("The dog runs fast.", "Ui in a hat mahmah hi."),
    ("I love my family.", "Ka inn-uan ka it hi."),
    ("He works hard.", "Amah in nasep a bawl mahmah hi."),
    ("We sing hymns.", "I hla i sa hi."),
    ("She teaches children.", "Amah in ngakchia a zang hi."),
    ("I thank God.", "Pasian ka lungdam hi."),
    ("He prays every day.", "Amah in ni khat khat thu a ngen hi."),
    ("We eat together.", "I kikhawm in an i ne hi."),
    ("The rain falls.", "Guah a zu hi."),
    ("I sleep early.", "Zingkhua in ka lum hi."),
    ("He comes home.", "Amah in inn ah a hong pai hi."),
    ("She is happy today.", "Tuni amah lungdam hi."),
    ("I study Zolai.", "Zolai pau ka zang hi."),
    ("God loves us.", "Pasian in i te a it hi."),
]
for en, zo in DAILY_EN_ZO:
    add("Translate to Zolai using SOV word order.", en, zo, "daily")
    add("Translate this Zolai sentence to English.", zo, en, "daily")

# ── Tense expansion ───────────────────────────────────────────────────────────
VERBS = [
    ("ne", "eat", "an", "rice/food"),
    ("pai", "go", "sangah", "to school"),
    ("gen", "speak", "thu", "words"),
    ("mu", "see", "amah", "him/her"),
    ("piang", "be born", "", ""),
    ("si", "die", "", ""),
    ("bawl", "do/make", "nasep", "work"),
    ("ngen", "pray", "thu", "words"),
    ("ciak", "read", "laibu", "book"),
    ("sa", "sing", "hla", "song"),
]
TENSES = [
    ("present",    "hi",          "He {en}s.",              "A {zo} hi."),
    ("past",       "ta hi",       "He {en}ed.",             "A {zo} ta hi."),
    ("perfect",    "khin hi",     "He has {en}ed.",         "A {zo} khin hi."),
    ("future",     "ding hi",     "He will {en}.",          "A {zo} ding hi."),
    ("progressive","lai hi",      "He is {en}ing.",         "A {zo} lai hi."),
    ("completive", "zo hi",       "He has finished {en}ing.","A {zo} zo hi."),
    ("neg present","lo hi",       "He does not {en}.",      "A {zo} lo hi."),
    ("neg future", "kei ding hi", "He will not {en}.",      "A {zo} kei ding hi."),
]
for stem, en_v, obj_zo, obj_en in VERBS[:6]:
    for tense_name, marker, en_pat, zo_pat in TENSES:
        en_sent = en_pat.format(en=en_v)
        zo_sent = zo_pat.format(zo=stem)
        add(f"Translate to Zolai ({tense_name} tense).", en_sent, zo_sent, "grammar")

# ── Question formation ────────────────────────────────────────────────────────
Q_PAIRS = [
    ("What is your name?", "Na min bang hiam?"),
    ("Where do you live?", "Koi ah na om hiam?"),
    ("How old are you?", "Na kum bang zah hiam?"),
    ("Do you speak Zolai?", "Zolai pau na gen thei hiam?"),
    ("Is God good?", "Pasian hoih hiam?"),
    ("Will you come tomorrow?", "Nitak na hong pai ding hiam?"),
    ("Who is your teacher?", "Na sia kua hiam?"),
    ("Why are you sad?", "Bang hang na lungngaih hiam?"),
    ("How many children do you have?", "Ngakchia bang zah na nei hiam?"),
    ("When did he go?", "Bang hun ah a pai hiam?"),
    ("Did she eat?", "An a ne khin hiam?"),
    ("Is this correct?", "Hih dik hiam?"),
    ("Can you help me?", "Ka panpih thei na hiam?"),
    ("Do you understand?", "Na theih hiam?"),
    ("Is he coming?", "A hong pai ding hiam?"),
]
for en, zo in Q_PAIRS:
    add("Translate to Zolai (question form).", en, zo, "daily")
    add("Translate this Zolai question to English.", zo, en, "daily")

# ── Conditional sentences ─────────────────────────────────────────────────────
COND_PAIRS = [
    ("If it rains, I will stay home.", "Guah a zu leh, innah ka om ding hi."),
    ("If you study, you will pass.", "Na zang leh, na lam ding hi."),
    ("If God wills, we will go.", "Pasian duh leh, i pai ding hi."),
    ("If you are hungry, eat.", "Na dot leh, ne in."),
    ("If he comes, tell me.", "A hong pai leh, ka hnenah gen in."),
    ("If you don't go, I won't go either.", "Nong pai kei a leh, kei zong ka pai kei ding hi."),
    ("If you don't believe, you won't understand.", "Nong zang kei a leh, na theih kei ding hi."),
]
for en, zo in COND_PAIRS:
    add("Translate to Zolai (conditional).", en, zo, "grammar")

# ── Negation drills ───────────────────────────────────────────────────────────
NEG_PAIRS = [
    ("I don't know.", "Ka thei lo hi."),
    ("She doesn't eat meat.", "Sa a ne lo hi."),
    ("We don't have money.", "Ngul i nei lo hi."),
    ("He has never lied.", "A ki-it ngei lo hi."),
    ("Don't be afraid.", "Hih kei in."),
    ("Don't forget.", "Ngaihtuah kei in."),
    ("I will never leave you.", "Nang ka bei kei ding hi ngei."),
    ("No one knows.", "Kuamah in a thei kei hi."),
    ("I cannot go.", "Ka pai thei lo hi."),
    ("She did not come.", "A hong pai lo hi."),
]
for en, zo in NEG_PAIRS:
    add("Translate to Zolai (negation).", en, zo, "grammar")

# ── Verb stem drills ──────────────────────────────────────────────────────────
STEM_DRILLS = [
    ("si", "sih", "die", "death", "A si hi. (He dies.) | A sih lo hi. (He did not die.) | Sihna pen lungkimna ahi hi. (Death is a comfort.)"),
    ("nei", "neih", "have", "possession", "Ka nei hi. (I have.) | Ka neih lo hi. (I don't have.) | Neihna tampi nei hi. (He has many possessions.)"),
    ("mu", "muh", "see", "sight", "Ka mu hi. (I see.) | Ka muh lo hi. (I don't see.) | Muhna hoih nei hi. (He has good vision.)"),
    ("hau", "hauh", "be rich", "wealth", "A hau hi. (He is rich.) | A hauh lo hi. (He is not rich.) | Hauhna a nei hi. (He has wealth.)"),
    ("that", "thah", "kill", "killing", "A that hi. (He kills.) | A thah lo hi. (He did not kill.) | Thahna dik lo hi. (Killing is wrong.)"),
    ("kap", "kah", "cry", "crying", "A kap hi. (He cries.) | A kah lo hi. (He did not cry.) | Kahna pen lungngaihna ahi hi. (Crying is sadness.)"),
    ("sam", "sap", "call/name", "naming", "A sam hi. (He calls.) | A sap lo hi. (He did not call.) | Sapna hoih nei hi. (He has a good name.)"),
    ("gen", "gent", "speak", "speech", "A gen hi. (He speaks.) | A gent lo hi. (He did not speak.) | Gentna hoih hi. (Good speech.)"),
]
for s1, s2, en_v, en_n, examples in STEM_DRILLS:
    add(f"What is the Stem II of '{s1}' ({en_v}) and how is it used?", "",
        f"Stem II of '{s1}' is '{s2}'. Used in negation and subordinate clauses. Noun form: '{s2}na' ({en_n}). Examples: {examples}", "grammar")
    add(f"Form the noun from the verb '{s1}' ({en_v}) in Zolai.", "",
        f"Use Stem II '{s2}' + na = '{s2}na' ({en_n}). Example: '{s2}na pen thupi hi.' (The {en_n} is important.)", "grammar")

# ── Imperative drills ─────────────────────────────────────────────────────────
IMP_PAIRS = [
    ("Sit down.", "Dung in."),
    ("Stand up.", "Tho in."),
    ("Be quiet.", "Ngaih in."),
    ("Listen carefully.", "Ngaih zelin in."),
    ("Read this.", "Hih sim in."),
    ("Write your name.", "Na min ziak in."),
    ("Come here.", "Hong pai in."),
    ("Go home.", "Inn ah pai in."),
    ("Eat your food.", "Na an ne in."),
    ("Pray now.", "Tua ciangin thu ngen in."),
    ("Don't be late.", "Nai kei in."),
    ("Don't worry.", "Lunggulh kei in."),
    ("Let us pray.", "Thu ngen ni."),
    ("Let us go.", "Pai ni."),
    ("Let there be peace.", "Muanhuaina om hen."),
]
for en, zo in IMP_PAIRS:
    add("Translate to Zolai (imperative).", en, zo, "daily")

# ── Religious / Bible patterns ────────────────────────────────────────────────
BIBLE_PAIRS = [
    ("In the beginning God created the heavens and the earth.", "A kipat cilin Pasian in vantung leh leitung a piangsak hi."),
    ("Let there be light.", "Khuavak om hen."),
    ("God saw that it was good.", "Pasian in a hoih hi ci-in a mu hi."),
    ("God blessed them.", "Pasian in amaute a thupha hi."),
    ("The Lord is my shepherd.", "Topa pen ka zawlnei ahi hi."),
    ("God is love.", "Pasian pen itna ahi hi."),
    ("Fear not, for I am with you.", "Hih kei in, keimah na kiang ka om hi."),
    ("I am the way, the truth, and the life.", "Keimah pen lam, thukimna, leh nuntakna ka hi hi."),
    ("Blessed are the poor in spirit.", "Lungkim nei lo te pen lungdam ding hi."),
    ("Love your neighbor as yourself.", "Na kiim mi na it bangin it in."),
]
for en, zo in BIBLE_PAIRS:
    add("Translate this Bible verse to Zolai.", en, zo, "religion")
    add("Translate this Zolai Bible verse to English.", zo, en, "religion")

# ── Cultural / Gentehna ───────────────────────────────────────────────────────
CULTURE = [
    ("What does 'lungdam' mean in Zolai?", "", "Lungdam means 'happy' or 'thankful' (lit. heart-good). 'Ka lungdam hi.' (I am happy/thankful.) 'Lungdam' is also used as a greeting response meaning 'thank you' or 'I am grateful'.", "culture"),
    ("What does 'kikhawm' mean in Zolai?", "", "'Kikhawm' means 'to gather together' or 'to meet'. 'I kikhawm hi.' (We gather together.) It implies unity and community — a core Zomi cultural value.", "culture"),
    ("Explain the Zolai greeting 'Na dam na?'", "", "'Na dam na?' means 'Are you well?' (lit. Are you healthy?). Standard responses: 'Dam mah.' (I am well.) or 'Ka dam hi.' (I am well.) This is the most common Zolai greeting.", "daily"),
    ("What is the Zolai word for 'thank you'?", "", "'Lungdam' or 'Ka lungdam hi.' (I am thankful.) In informal speech: 'Lungdam.' alone is sufficient. More formal: 'Lungdam mahmah hi.' (I am very grateful.)", "daily"),
    ("How do you say 'good morning' in Zolai?", "", "'Zingkhua hoih.' (Good morning — lit. good morning-time.) Or simply 'Na dam na?' as a morning greeting. 'Zingkhua' = morning, 'hoih' = good.", "daily"),
    ("What is 'Pawfi' (apostrophe) in Zolai?", "", "Pawfi (') has two uses: 1. Contraction: 'na'ng' = na + in (you + agent marker). 2. Possession: 'ka pu'' = my grandfather. These must not be confused. Contraction joins words; possession marks ownership.", "grammar"),
]
for item in CULTURE:
    add(*item)

# ── Error correction drills ───────────────────────────────────────────────────
ERRORS = [
    ("Correct this sentence: 'Ka pai lo ding hi.'", "", "Error: future negation uses 'kei' not 'lo'. Correct: 'Ka pai kei ding hi.' (I will not go.) Rule: present negation = lo, future negation = kei.", "education"),
    ("Correct this sentence: 'I pai uh hi.'", "", "Error: never combine 'uh' with 'i' (1st person inclusive). Correct: 'I pai hi.' (We go.) 'uh' is only for 3rd person plural.", "education"),
    ("Correct this sentence: 'Pathian in leitung a piangsak hi.'", "", "Error: 'Pathian' is Hakha/Falam dialect. Use 'Pasian' in Tedim Zolai. Correct: 'Pasian in leitung a piangsak hi.'", "education"),
    ("Correct this sentence: 'Ka neina tampi nei hi.'", "", "Error: nominalization requires Stem II. 'nei' → Stem II 'neih'. Correct: 'Ka neihna tampi nei hi.' (I have many possessions.)", "education"),
    ("Correct this sentence: 'Na pai lo leh, ka om ding hi.'", "", "Error: negative conditional must use 'nong...kei a leh', never 'lo leh'. Correct: 'Nong pai kei a leh, ka om ding hi.' (If you don't go, I will stay.)", "education"),
    ("Correct this sentence: 'Ka fapa sangah pai hi.'", "", "Error: 'fapa' is Hakha/Falam. Use 'tapa' in Tedim Zolai. Correct: 'Ka tapa sangah pai hi.' (My son goes to school.)", "education"),
    ("Correct this sentence: 'Ka ram hoih mahmah hi.'", "", "Error: 'ram' is Hakha/Falam for land/country. Use 'gam' in Tedim Zolai. Correct: 'Ka gam hoih mahmah hi.' (My country is very good.)", "education"),
    ("Correct this sentence: 'Zalenna ka duh hi.'", "", "Error: 'Zalenna' is non-standard. Use 'Suahtakna' for freedom. Correct: 'Suahtakna ka duh hi.' (I want freedom.)", "education"),
]
for item in ERRORS:
    add(*item)

# ── Fill-in-the-blank drills ──────────────────────────────────────────────────
FILL = [
    ("Fill in the blank: 'Ka pai ___ hi.' (I will go.)", "", "Answer: 'ding' — Ka pai ding hi. 'ding' is the future tense marker in Zolai.", "education"),
    ("Fill in the blank: 'A pai ___ hi.' (He has gone.)", "", "Answer: 'khin' — A pai khin hi. 'khin' marks experiential perfect (has done at least once).", "education"),
    ("Fill in the blank: 'Ka ne ___ hi.' (I don't eat.)", "", "Answer: 'lo' — Ka ne lo hi. 'lo' is the present negation marker.", "education"),
    ("Fill in the blank: 'Pasian in leitung a ___ hi.' (God created the earth.)", "", "Answer: 'piangsak' — Pasian in leitung a piangsak hi. 'piangsak' = to create/cause to be born.", "education"),
    ("Fill in the blank: 'Na dam ___?' (Are you well?)", "", "Answer: 'na' — Na dam na? The final 'na' turns the statement into a question in informal speech.", "education"),
    ("Fill in the blank: 'Khuavak om ___.' (Let there be light.)", "", "Answer: 'hen' — Khuavak om hen. 'hen' is the benedictive mood marker meaning 'let it be'.", "education"),
    ("Fill in the blank: 'Pai ___ in.' (Don't go.)", "", "Answer: 'kei' — Pai kei in. 'kei in' is the prohibitive imperative (don't do).", "education"),
]
for item in FILL:
    add(*item)

# ── Write all ─────────────────────────────────────────────────────────────────
with OUT.open("a", encoding="utf-8") as f:
    for rec in records:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

print(f"[Zomi Synthesizer] Added {len(records):,} new instructions", flush=True)
print(f"[Zomi Data Manager] Total instructions now: {len(seen):,}", flush=True)
