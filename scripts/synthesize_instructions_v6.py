"""
Bulk instruction generator v5 — all curriculum levels A1→C2 + parallel corpus scale-up.
Target: 50K total instructions.
"""
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
                 "source": "wiki_curriculum_v5", "domain": domain,
                 "dialect": "tedim", "category": "instruction"})

# ── A2: Time markers ──────────────────────────────────────────────────────────
TENSE_PAIRS = [
    ("I will go tomorrow.", "Zingciang ka pai ding hi.", "future"),
    ("She will cook food.", "An a bawl ding hi.", "future"),
    ("We will pray together.", "I kikhawm in thu i ngen ding hi.", "future"),
    ("He will read the Bible.", "Laisiangtho a ciak ding hi.", "future"),
    ("I have already eaten.", "An ka ne khin hi.", "completed past"),
    ("She has already gone.", "A pai khin hi.", "completed past"),
    ("He has already prayed.", "Thu a ngen khin hi.", "completed past"),
    ("I used to go there.", "Tua mun ka pai ngei hi.", "experiential past"),
    ("I have been to Tedim before.", "Tedim ah ka pai ngei hi.", "experiential past"),
    ("She has never lied.", "A ki-it ngei lo hi.", "experiential negation"),
    ("I have never seen it.", "Ka mu ngei lo hi.", "experiential negation"),
]
for en, zo, tense in TENSE_PAIRS:
    add(f"Translate to Zolai ({tense}).", en, zo, "grammar")
    add("Translate this Zolai sentence to English.", zo, en, "grammar")

# ── A2: Pluralization ─────────────────────────────────────────────────────────
PLURAL_PAIRS = [
    ("person","mi","people","mite"),("man","mipa","men","mipate"),("woman","numei","women","numeite"),
    ("child","ngakchia","children","ngakchiate"),("student","sangnaupang","students","sangnaupangte"),
    ("teacher","sia","teachers","siate"),("friend","lungkim","friends","lungkimte"),
    ("elder","pu","elders","pute"),("disciple","nungzui","disciples","nungzuite"),
]
for sg_en, sg_zo, pl_en, pl_zo in PLURAL_PAIRS:
    add(f"What is the plural of '{sg_zo}' ({sg_en}) in Zolai?",
        "", f"Add suffix '-te': '{sg_zo}' → '{pl_zo}' ({pl_en}). Example: '{pl_zo} hong pai uh hi.' (The {pl_en} came.)", "grammar")
    add("Translate to Zolai.", f"The {pl_en} came.", f"{pl_zo} hong pai uh hi.", "grammar")

# ── A2: Positional postpositions ──────────────────────────────────────────────
POSTPOS = [
    ("sungah","inside/in","Innsung**ah** a lum hi.","He sleeps inside the house."),
    ("tungah","on top of","Bawng tung**ah** a dung hi.","He sits on the table."),
    ("mai-ah","in front of","Ka mai-**ah** om in.","Stand in front of me."),
    ("kiangah","beside/to (person)","Ka pa kiang**ah** gen hi.","He speaks to my father."),
    ("hnuai-ah","below/under","Bawng hnuai-**ah** om hi.","It is under the table."),
    ("ngeina-ah","beside/next to","Ka ngeina-**ah** om in.","Stay beside me."),
]
for pp, meaning, ex_zo, ex_en in POSTPOS:
    add(f"What does the postposition '{pp}' mean in Zolai?",
        "", f"'{pp}' = {meaning}. Example: '{ex_zo}' ({ex_en})", "grammar")
    add("Translate to Zolai.", ex_en, ex_zo.replace("**",""), "grammar")

# ── A2: Desire pattern ────────────────────────────────────────────────────────
DESIRE = [
    ("I want to eat.", "Ka ne nuam hi."),("She wants to go.", "A pai nuam hi."),
    ("He wants to sleep.", "A lum nuam hi."),("We want to pray.", "I ngen nuam hi."),
    ("I want to learn Zolai.", "Zolai zang ka nuam hi."),
    ("She wants to sing.", "Hla sa nuam hi."),("He wants to read.", "Laibu sim nuam hi."),
]
for en, zo in DESIRE:
    add("Translate to Zolai (desire pattern V + nuam).", en, zo, "grammar")

# ── A2: Narrative connectors ──────────────────────────────────────────────────
NARR = [
    ("Then God said...", "Tua ciangin Pasian in..."),
    ("After that, he went home.", "Tua ciangin inn ah a pai hi."),
    ("But he did not go.", "Ahi zongin a pai lo hi."),
    ("However, she came.", "Ahi zongin a hong pai hi."),
    ("Just like that, it happened.", "Tua mah bangin piang pah hi."),
    ("Evening came and morning came, it was the first day.", "Nitak hong bei-in, zingsang hong tung a, ni khat ni ahi hi."),
    ("Then, his disciples came.", "Tua ciangin a nungzuite hong pai uh hi."),
]
for en, zo in NARR:
    add("Translate to Zolai (narrative connector).", en, zo, "grammar")

# ── B2: Comparatives ─────────────────────────────────────────────────────────
COMP = [
    ("Gold is better than silver.", "Kham pen ngun sangin a hoihzaw hi."),
    ("He is taller than me.", "Amah pen kei sangin a sangzaw hi."),
    ("This book is more interesting than that one.", "Hih laibu pen hua sangin a nuamzaw hi."),
    ("Faith is more important than wealth.", "Upna pen hauhna sangin a thupitzaw hi."),
    ("He is the tallest among the students.", "Sangnaupangte lakah amah a sangpen hi."),
    ("God is the greatest.", "Pasian pen lian mahmah hi."),
    ("Will you go now, or will you go tomorrow?", "Tu-in na pai ding hiam, ahih kei leh zingciang na pai ding hiam?"),
]
for en, zo in COMP:
    add("Translate to Zolai (comparative/superlative).", en, zo, "grammar")
    add("Translate this Zolai sentence to English.", zo, en, "grammar")

# ── B2: Negative conditionals ─────────────────────────────────────────────────
NEG_COND = [
    ("If you do not go, I will be sad.", "Na pai kei a leh, ka lung a leng ding hi."),
    ("If you do not believe, you will not understand.", "Nong up kei a leh, na theih kei ding hi."),
    ("If you do not pray, you will not receive.", "Nong ngen kei a leh, na ngah kei ding hi."),
    ("Unless you come, I will not go.", "Nong hong pai kei a leh, ka pai kei ding hi."),
    ("If you do not obey, there will be consequences.", "Nong zui kei a leh, a tawpna om ding hi."),
]
for en, zo in NEG_COND:
    add("Translate to Zolai (negative conditional — use 'kei a leh', NEVER 'lo leh').", en, zo, "grammar")

add("What is the critical rule for negative conditionals in Zolai?",
    "", "NEVER use 'lo leh' for negative conditionals. Always use 'kei a leh' or 'kei leh'. Wrong: 'Nong pai lo leh...' Correct: 'Nong pai kei a leh...' (If you do not go...) This is a ZVS 2018 absolute rule.", "grammar")

# ── C1: I AM metaphors ────────────────────────────────────────────────────────
IAM = [
    ("I am the bread of life.", "Kei pen nuntakna an ka hi hi."),
    ("You are the light of the world.", "Note pen leitung mite-a' dingin khuavak tawh na kibang uh hi."),
    ("I AM THAT I AM.", "KEIMAH ka hi hi."),
    ("I am the way, the truth, and the life.", "Keimah pen lam, thukimna, leh nuntakna ka hi hi."),
    ("I am the good shepherd.", "Keimah pen zawlnei hoih ka hi hi."),
    ("I am the resurrection and the life.", "Keimah pen thokiksatna leh nuntakna ka hi hi."),
    ("I am the vine, you are the branches.", "Keimah pen thingkuang ka hi a, note pen a khawhte na hi uh hi."),
]
for en, zo in IAM:
    add("Translate to Zolai (I AM metaphor pattern).", en, zo, "religion")
    add("Translate this Zolai 'I AM' statement to English.", zo, en, "religion")

add("Explain the 'KEIMAH ka hi hi' pattern in Zolai.",
    "", "'KEIMAH ka hi hi' is the emphatic absolute identity declaration. 'KEIMAH' = emphatic 'I' (stronger than 'Kei'). The double 'hi hi' signals absolute, eternal identity — not just a current state. Used for God's self-declaration (Exo 3:14) and Jesus' I AM statements in John. Pattern: [Emphatic pronoun] + [agreement marker] + hi hi.", "grammar")

# ── C1: Rhetorical questions ──────────────────────────────────────────────────
RHET = [
    ("Where is the wise man?", "Lungpil mi koi-ah a om hiam?"),
    ("Where is your faith?", "Na upna uh koi-ah om hiam?"),
    ("Who can separate us from the love of God?", "Pasian' itna panin kote khen thei kua om hiam?"),
    ("What shall we say then?", "Tua ahih ciangin bang i gen ding hiam?"),
    ("Is anything too hard for God?", "Pasian ading in bang zong haksatna om hiam?"),
]
for en, zo in RHET:
    add("Translate to Zolai (rhetorical question).", en, zo, "religion")

# ── C1: Exclusivity pattern ───────────────────────────────────────────────────
EXCL = [
    ("No one knows except the Spirit.", "Kha Siangtho longal kuamah in a thei kei hi."),
    ("Let not your heart be troubled.", "Na lungtang uh patau kei hen."),
    ("No one comes to the Father except through me.", "Keimah tawh longal kuamah in Pa kiangah pai thei kei hi."),
    ("Nothing is impossible with God.", "Pasian ading in bang zong theih lo om kei hi."),
]
for en, zo in EXCL:
    add("Translate to Zolai (exclusivity/prohibitive pattern).", en, zo, "religion")

# ── C1: Complex embedded clauses ─────────────────────────────────────────────
add("Explain the Pauline embedded clause structure in Zolai.",
    "", "C1 Zolai stacks multiple conditions before the main verb (SOV strictly maintained). Pattern: [Condition A] [Condition B] [Instrumental C] [Main Verb]. Example (Romans 8:11): 'Sihna panin Jesuh a thokiksak Pasian' Kha Siangtho note sungah hong om leh... a hong nungtasak ding hi.' — All conditions stack before the final verb 'nungtasak ding hi'.", "grammar")

add("Translate to Zolai (complex embedded clause).",
    "For God so loved the world that he gave his only Son.",
    "Bang hang hiam cih leh, Pasian in leitung mite a it mahmah hi a, ama' tapa khatbek a pia hi.", "religion")

# ── C2: Poetic parallelism ────────────────────────────────────────────────────
C2_PAIRS = [
    ("The Lord is my shepherd; I shall not want.", "Topa pen ka zawlnei ahi hi; bang zong ka dot kei ding hi."),
    ("He makes me lie down in green pastures; he leads me beside still waters.", "Vangam hoihte ah a lum sak hi; tui muanhuai kiangah a kai hi."),
    ("Even though I walk through the valley of the shadow of death, I will fear no evil.", "Sihna ngamual sungah ka pai ahi zongin, siahuai bang zong ka lau kei ding hi."),
    ("Your word is a lamp to my feet and a light to my path.", "Na kammal pen ka ke ading meipi ahi a, ka lam ading khuavak ahi hi."),
]
for en, zo in C2_PAIRS:
    add("Translate to Zolai (poetic parallelism, C2 level).", en, zo, "religion")
    add("Translate this Zolai poetic verse to English.", zo, en, "religion")

# ── Daily conversation expansion ──────────────────────────────────────────────
DAILY_CONV = [
    ("What time is it?", "Hun bang zah hi hiam?"),
    ("I am hungry.", "Ka dot hi."),
    ("I am thirsty.", "Tui ka duh hi."),
    ("I am tired.", "Ka ngawl hi."),
    ("I am happy.", "Ka lungdam hi."),
    ("I am sad.", "Ka lungngaih hi."),
    ("I am afraid.", "Ka lau hi."),
    ("I am busy.", "Ka buai hi."),
    ("I don't understand.", "Ka theih lo hi."),
    ("Please say it again.", "Kik gen pak dih."),
    ("What does this mean?", "Hih bang ci hi hiam?"),
    ("How do you say this in Zolai?", "Hih Zolai-ah bang ci gen ding hiam?"),
    ("I am learning Zolai.", "Zolai ka zang lai hi."),
    ("Zolai is not easy.", "Zolai haksatna nei hi."),
    ("I love Zolai language.", "Zolai pau ka it hi."),
    ("Where are you from?", "Koi pan na hong pai hiam?"),
    ("I am from Tedim.", "Tedim pan ka hong pai hi."),
    ("How long have you been here?", "Tu-ah na om sawt khin hiam?"),
    ("I have been here for two years.", "Kum nnih ka om khin hi."),
    ("See you tomorrow.", "Zingciang i kimu ding hi."),
    ("Take care.", "Ngaihsun in."),
    ("God bless you.", "Pasian in na thupha hen."),
    ("Thank you very much.", "Lungdam mahmah hi."),
    ("You are welcome.", "Lungdam."),
    ("I am sorry.", "Mawhna ka nei hi."),
    ("No problem.", "Haksatna om lo hi."),
    ("Let's go.", "Pai ni."),
    ("Wait a moment.", "Tawm ngak in."),
    ("Come here.", "Hong pai in."),
    ("Go away.", "Va pai in."),
]
for en, zo in DAILY_CONV:
    add("Translate to Zolai.", en, zo, "daily")
    add("Translate this Zolai phrase to English.", zo, en, "daily")

# ── Tutor dialogues — error correction ───────────────────────────────────────
TUTOR_ERRORS = [
    ("Correct: 'Mite hong pai uh hi.' Wrong: 'Mite hong pai hi.' — Why?",
     "", "The plural marker 'uh' is required when the subject is 3rd person plural ('mite' = people). Correct: 'Mite hong pai uh hi.' (The people came.) Without 'uh', the sentence implies a singular subject.", "education"),
    ("A student says: 'Ka ne nuam ding hi.' Is this correct?",
     "", "Not quite. 'nuam' (want) and 'ding' (future) don't combine this way. For 'I want to eat': 'Ka ne nuam hi.' For 'I will eat': 'Ka ne ding hi.' Choose one: desire OR future, not both.", "education"),
    ("A student asks: How do I say 'They are going to school'?",
     "", "Use 3rd person plural 'uh': 'Sang ah a pai uh hi.' (They go to school.) Remember: 'uh' for 3rd person plural, never with 'i' (1st person inclusive).", "education"),
    ("A student asks: What is the difference between 'ding' and 'nuam'?",
     "", "'ding' = future tense (will do): 'Ka pai ding hi.' (I will go.) 'nuam' = desire (want to do): 'Ka pai nuam hi.' (I want to go.) They express different things — future fact vs. current desire.", "education"),
    ("A student asks: How do I say 'I used to live in Tedim'?",
     "", "Use experiential past 'ngei': 'Tedim ah ka om ngei hi.' (I used to live in Tedim / I have lived in Tedim before.) 'ngei' marks past experience or habitual past action.", "education"),
    ("Correct this: 'Amah pen kei sangin a sang hi.'",
     "", "The comparative needs '-zaw' suffix on the adjective. Correct: 'Amah pen kei sangin a sangzaw hi.' (He is taller than me.) Pattern: [A] pen [B] sangin [Adj]-zaw hi.", "education"),
    ("A student asks: How do I say 'Let's eat together'?",
     "", "'I kikhawm in an ne ni.' (Let's eat together.) 'kikhawm' = together, 'ne' = eat, 'ni' = hortative (let us). Or simply: 'An ne ni.' (Let's eat.)", "education"),
    ("A student asks: How do I say 'I have never been to Yangon'?",
     "", "'Yangon ah ka pai ngei lo hi.' (I have never been to Yangon.) Pattern: [Place] ah [Subject] [Verb] ngei lo hi. 'ngei lo' = experiential negation (have never done).", "education"),
]
for item in TUTOR_ERRORS:
    add(*item)

# ── Scale up from parallel corpus ────────────────────────────────────────────
print(f"Wiki instructions added: {len(recs):,}", flush=True)
print("Scaling from parallel corpus...", flush=True)

par_added = 0
with PAR.open(encoding="utf-8") as f:
    for i, line in enumerate(f):
        if i % 8 != 0: continue  # every 8th = ~8,700 pairs
        line = line.strip()
        if not line: continue
        try: obj = json.loads(line)
        except: continue
        en = c(obj.get("english",""))
        zo = c(obj.get("zolai",""))
        ref = c(obj.get("reference",""))
        src = c(obj.get("source",""))
        if not en or not zo or len(en) < 5 or len(zo) < 5: continue
        if len(en) > 300 or len(zo) > 300: continue

        k1 = md5("Translate this English text to Zolai (Tedim Chin)." + zo)
        if k1 not in seen:
            seen.add(k1)
            recs.append({"instruction":"Translate this English text to Zolai (Tedim Chin).","input":en,"output":zo,
                         "source":src or "parallel_corpus","domain":"translation","dialect":"tedim","category":"instruction"})
            par_added += 1

        k2 = md5("Translate this Zolai (Tedim Chin) text to English." + en)
        if k2 not in seen:
            seen.add(k2)
            recs.append({"instruction":"Translate this Zolai (Tedim Chin) text to English.","input":zo,"output":en,
                         "source":src or "parallel_corpus","domain":"translation","dialect":"tedim","category":"instruction"})
            par_added += 1

        if ref:
            k3 = md5(f"What is the Zolai translation of {ref}?" + zo)
            if k3 not in seen:
                seen.add(k3)
                recs.append({"instruction":f"What is the Zolai translation of {ref}?","input":en,"output":zo,
                             "source":src or "parallel_corpus","domain":"religion","dialect":"tedim","category":"instruction"})
                par_added += 1

print(f"Parallel-derived: {par_added:,}", flush=True)

# ── Write ─────────────────────────────────────────────────────────────────────
with OUT.open("a", encoding="utf-8") as f:
    for rec in recs:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

total = sum(1 for _ in OUT.open(encoding="utf-8"))
print(f"Added {len(recs):,} | Total instructions: {total:,}", flush=True)
