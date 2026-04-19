"""Zolai instruction synthesizer v3 — wiki-grounded, all grammar domains."""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
OUT  = ROOT / "data/master/combined/instructions.jsonl"

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
                 "source": "wiki_synthesizer_v3", "domain": domain,
                 "dialect": "tedim", "category": "instruction"})

# ── MORPHEMICS: noun formation (Stem II + na) ─────────────────────────────────
STEM_NOUNS = [
    ("si","sih","die","sihna","death"),("la","laak","take","laakna","taking"),
    ("sa","sat","hot","satna","heat"),("nei","neih","have","neihna","possession"),
    ("thei","theih","know","theihna","knowledge"),("sal","salh","shout","salhna","calling"),
    ("hau","hauh","rich","hauhna","wealth"),("hak","hah","hard","hahna","hardness"),
    ("kap","kah","cry","kahna","crying"),("that","thah","kill","thahna","killing"),
    ("sam","sap","call","sapna","calling"),("dam","dap","well","dapna","wellness"),
    ("kipan","kipat","start","kipatna","origin"),("man","mat","catch","matna","capture"),
    ("thang","than'","famous","than'na","fame"),("taang","tat","transfer","tatna","redemption"),
    ("om","om","exist","omna","existence"),("lau","lau","fear","launa","fear"),
    ("it","it","love","itna","love"),("up","up","believe","upna","faith"),
    ("gup","gup","save","gupna","salvation"),("mu","muh","see","muhna","sight"),
    ("gen","gent","speak","gentna","speech"),("sim","sim","read","simna","reading"),
    ("gelh","gelh","write","gelhna","writing"),("zang","zat","use","zatna","usage"),
]
for s1,s2,en_v,noun,en_n in STEM_NOUNS:
    add(f"Form the abstract noun from '{s1}' ({en_v}) in Zolai.",
        "", f"Use Stem II '{s2}' + na = '{noun}' ({en_n}). Example: '{noun} hoih hi.' (Good {en_n}.)", "grammar")
    add(f"What is wrong with '{s1}na' as a noun in Zolai?",
        "", f"'{s1}na' uses Stem I — incorrect. The noun requires Stem II: '{noun}' ({en_n}). Rule: always use Stem II before the '-na' suffix.", "grammar")

# ── MORPHEMICS: compound words ────────────────────────────────────────────────
COMPOUNDS = [
    ("vantung","van + tung","heaven","sky + above"),
    ("leitung","lei + tung","earth","ground + above"),
    ("tuipi","tui + pi","sea","water + big"),
    ("laitak","lai + tak","middle","space + exact"),
    ("lungdam","lung + dam","happy","heart + well"),
    ("siangtho","siang + tho","holy","pure + clean"),
    ("laisiangtho","lai + siangtho","Bible","book + holy"),
    ("tawntung","tawn + tung","forever","always + above"),
    ("tonkhawm","ton + khawm","meeting","gather + together"),
    ("Kha Siangtho","kha + siangtho","Holy Spirit","spirit + holy"),
]
for word,parts,en,meaning in COMPOUNDS:
    add(f"Break down the Zolai compound word '{word}' into its parts.",
        "", f"'{word}' = {parts} → {en} (lit. {meaning}). Zolai forms new concepts by joining morphemes.", "grammar")
    add(f"What does '{word}' mean in Zolai?",
        "", f"'{word}' means '{en}' (lit. {meaning}). It is a compound: {parts}.", "grammar")

# ── MORPHEMICS: ki- prefix ────────────────────────────────────────────────────
KI_WORDS = [
    ("kipawl","associate/group","pawl (group)"),("kituak","meet each other","tuak (encounter)"),
    ("kibawl","be made","bawl (make)"),("kigawm","combine","gawm (join)"),
    ("kikhop","gather","khop (enough)"),("kikhawm","gather together","khawm (together)"),
    ("kigen","talk to each other","gen (speak)"),("kiit","love each other","it (love)"),
    ("kipan","start together","pan (begin)"),("kimu","see each other","mu (see)"),
]
for word,en,root in KI_WORDS:
    add(f"What does '{word}' mean and how is it formed?",
        "", f"'{word}' means '{en}'. Formed with prefix 'ki-' (reciprocal/reflexive) + {root}. The 'ki-' prefix creates mutual or passive meaning.", "grammar")

# ── ERGATIVE: contractions ────────────────────────────────────────────────────
ERGATIVE = [
    ("Kei in","Ken","I (agent)","Ken ka sim hi.","I read it."),
    ("Nang in","Nan","You (agent)","Nan na sim hi.","You read it."),
    ("Amah in","Aman","He/She (agent)","Aman a sim hi.","He reads it."),
    ("Eite in","Eiten","We (agent)","Eiten i sim hi.","We read it."),
]
for full,contracted,meaning,ex_zo,ex_en in ERGATIVE:
    add(f"What is the contracted ergative form of '{full}' in Zolai?",
        "", f"'{full}' contracts to '{contracted}' ({meaning}). Example: '{ex_zo}' ({ex_en}). Contracted forms put stronger emphasis on the agent's responsibility.", "grammar")

add("When is the ergative particle 'in' required in Zolai?",
    "", "The particle 'in' is required whenever a subject performs an action on an object (transitive verb). Example: 'Amah in laibu sim hi.' (He reads the book.) For intransitive verbs (no object), 'in' is not needed: 'Amah pai hi.' (He goes.)", "grammar")
add("What is the difference between 'Amah pai hi' and 'Amah in laibu sim hi'?",
    "", "'Amah pai hi' is intransitive — no object, no 'in' needed. (He goes.) 'Amah in laibu sim hi' is transitive — 'in' marks Amah as the agent acting on 'laibu' (book). (He reads the book.)", "grammar")

# ── LOCATIVE particle 'ah' ────────────────────────────────────────────────────
LOCATIVE = [
    ("He is in the village.","Khua ah om hi.","location"),
    ("He goes to school.","Sang ah pai hi.","direction"),
    ("At that time...","Tua hun ah...","time"),
    ("For eating...","Nek ding ah...","purpose"),
    ("I live in Tedim.","Tedim ah ka om hi.","location"),
    ("She went to the market.","Bazar ah a pai hi.","direction"),
    ("In the morning...","Zing ah...","time"),
    ("He sat on the chair.","Dung ah a dung hi.","location"),
]
for en,zo,usage in LOCATIVE:
    add("Translate to Zolai (use locative particle 'ah').", en, zo, "grammar")

add("Explain the locative particle 'ah' in Zolai.",
    "", "'ah' marks location, direction, time, or purpose. Location: 'Khua ah om hi.' (He is in the village.) Direction: 'Sang ah pai hi.' (He goes to school.) Time: 'Tua hun ah...' (At that time...) Purpose: 'Nek ding ah...' (For eating...)", "grammar")

# ── PHONOLOGY ─────────────────────────────────────────────────────────────────
add("List all vowels in Zolai with their pronunciation.",
    "", "6 monophthongs: a /a/, e /e/, i /i/, o /oʊ/ (always like 'ou' in soul), u /u/, aw /ɔː/ (long, distinct from o). Note: 'o' is always realized as /oʊ/ — never as a short 'o'.", "grammar")
add("What are the consonant clusters in Zolai?",
    "", "4 consonant clusters: kh (khua = village), ph (pha = good), ng (ngah = receive), th (thu = word). Single consonants: b, c, d, g, h, k, l, m, n, p, s, t, v, z. Letters absent in native Zolai: F, J, R, X, Q, Y.", "grammar")
add("What are the 8 final consonants in Zolai?",
    "", "Final consonants: -k (hak = hard), -l (sal = shout), -m (gam = country), -n (man = price), -ng (thang = fame), -p (kap = cry), -t (that = kill), -h (sih = die, glottal stop).", "grammar")
add("What is the difference between 'o' and 'aw' in Zolai?",
    "", "'o' is realized as /oʊ/ (diphthong, like 'soul'). 'aw' is /ɔː/ (long open-mid back rounded vowel, like 'law'). They are distinct phonemes. Example: 'topa' (lord) vs 'tawntung' (forever).", "grammar")
add("What is the Pawfi (apostrophe) rule in Zolai?",
    "", "Pawfi (') has two uses: 1. Contraction — joins two words: 'na'ng' = na + in (you + agent). 'Ama'n' = Amah + in. 2. Possession — marks ownership: 'ka pu'' (my grandfather), 'Pasian' thu' (God's word). Never confuse contraction with possession.", "grammar")

# ── RELATIVE CLAUSES ──────────────────────────────────────────────────────────
REL_PAIRS = [
    ("The person who goes.","A pai mi."),
    ("The book that I read.","Ka sim laibu."),
    ("The God who is good.","A hoih Pasian."),
    ("The woman who prays.","Thu a ngen numei."),
    ("The child who cries.","A kap ngakchia."),
    ("The word that he spoke.","A gen thu."),
    ("The place where he lives.","A om mun."),
    ("The day when he came.","A hong pai ni."),
]
for en,zo in REL_PAIRS:
    add("Translate to Zolai (relative clause).", en, zo, "grammar")
add("How are relative clauses formed in Zolai?",
    "", "Relative clauses use 'a' before the verb + head noun. Pattern: a + [Verb] + [Noun]. Examples: 'A pai mi.' (The man who goes.) 'A hoih Pasian.' (The God who is good.) For object relatives: [Subject] + [Verb] + [Noun]: 'Ka sim laibu.' (The book that I read.)", "grammar")

# ── ALTHOUGH / EVEN IF ────────────────────────────────────────────────────────
CONC_PAIRS = [
    ("Although it is important, I cannot go.","A thupit hangin, ka pai thei lo hi."),
    ("Even if it rains, we will go.","Guah a zu ahi phial zongin, i pai ding hi."),
    ("Although he is poor, he is happy.","A hau lo ahi hangin, a lungdam hi."),
    ("Even if you don't believe, it is true.","Nong up kei ahi phial zongin, man hi."),
]
for en,zo in CONC_PAIRS:
    add("Translate to Zolai (concessive/although).", en, zo, "grammar")
add("Explain 'ahih hangin' and 'ahi phial zongin' in Zolai.",
    "", "'ahih hangin' = although/even though: 'A thupit hangin...' (Although it is important...) 'ahi phial zongin' = even if: 'Guah a zu ahi phial zongin...' (Even if it rains...) Both introduce concessive clauses.", "grammar")

# ── BIBLICAL PATTERNS from wiki ───────────────────────────────────────────────
BIBLE_WIKI = [
    ("Translate to Zolai (Gen 1:1).","In the beginning God created the heaven and the earth.",
     "A kipat cil-in Pasian in vantung leh leitung a piangsak hi."),
    ("Translate to Zolai (Gen 1:3).","God said, 'Let there be light.'",
     "Pasian in, \"Khuavak om ta hen,\" ci hi."),
    ("Translate to Zolai (Gen 1:4).","God saw the light, that it was good.",
     "Pasian in khuavak hoih hi ci-in mu hi."),
    ("Translate to Zolai (Gen 1:26).","Let us make man in our image.",
     "Eima' lim bangin mihing bawl ni."),
    ("Translate to Zolai (Gen 1:27).","God created man in his own image.",
     "Pasian in ama' lim bangin mihing piangsakin..."),
    ("Translate to Zolai (Exo 3:14).","God said to Moses, 'I AM THAT I AM.'",
     "Pasian in Moses' kiangah, \"KEIMAH ka hi hi,\" ci hi."),
    ("Translate to Zolai (Gen 2:3).","Because on it he rested from all his work.",
     "Bang hang hiam cih leh pian'sak nasepna...tua ni-in Pasian tawlnga hi."),
]
for ins,inp,out in BIBLE_WIKI:
    add(ins, inp, out, "religion")
    add("Translate this Zolai Bible verse to English.", out, inp, "religion")

# ── NARRATIVE CONNECTORS ──────────────────────────────────────────────────────
NARR = [
    ("Tua ciangin","Then / At that time","A2 level, everyday narrative"),
    ("Tua ahih ciangin","So when that was / Therefore","C1 level, biblical register"),
    ("Tua mah bangin","Just like that / In that manner","Narrative repetition"),
    ("A kipat cil-in","In the beginning","Opening formula"),
    ("Tu-in","Now / At this time","Present reference"),
    ("Tua hun sungin","In that time / In those days","Historical narrative"),
    ("A zing ciangin","In the morning / When morning came","Temporal"),
    ("Nitak hong bei-in, zingsang hong tung a","Evening came and morning came","Day formula (Genesis)"),
]
for connector,meaning,note in NARR:
    add(f"What does the narrative connector '{connector}' mean in Zolai?",
        "", f"'{connector}' means '{meaning}'. Usage: {note}. Example in context: '{connector}, Pasian in a gen hi.' ({meaning}, God spoke.)", "grammar")

# ── NEOLOGISM / WORD FORMATION ────────────────────────────────────────────────
add("How do you say 'knowledge' in Zolai?",
    "", "'Theihna' — from 'thei' (know) → Stem II 'theih' + na = 'theihna'. Example: 'Theihna pen thupi hi.' (Knowledge is important.)", "grammar")
add("How do you say 'salvation' in Zolai?",
    "", "'Gupna' — from 'gup' (save) + na = 'gupna'. Example: 'Gupna ka nei hi.' (I have salvation.)", "religion")
add("How do you say 'faith/belief' in Zolai?",
    "", "'Upna' — from 'up' (believe) + na = 'upna'. Example: 'Upna tawh pai in.' (Go with faith.)", "religion")
add("How do you say 'Holy Spirit' in Zolai?",
    "", "'Kha Siangtho' — compound: 'kha' (spirit/breath) + 'siangtho' (holy/pure). Example: 'Kha Siangtho in hong pang in.' (May the Holy Spirit guide us.)", "religion")
add("How do you say 'theology' or 'matters of God' in Zolai?",
    "", "'Pasian thu' — compound: 'Pasian' (God) + 'thu' (word/matter). The 'thu' suffix creates abstract information domains. Example: 'Pasian thu zang hi.' (He studies theology.)", "religion")
add("How do you form a word for a tool or machine in Zolai?",
    "", "Use [Action Stem II] + na + Set. Example: 'tuat' (calculate) → 'Tuatna Set' (calculator/calculating machine). 'gelh' (write) → 'Gelhna' (writing tool/pen). The 'Set' modifier denotes mechanical/automated versions.", "grammar")
add("How do you say 'writing' or 'a place to write' in Zolai?",
    "", "'Gelhna' — from 'gelh' (write) + na. Can mean: the act of writing, a writing tool, or a place for writing. Context determines meaning. Example: 'Gelhna ka nei lo hi.' (I don't have a pen.)", "grammar")

# ── ASPECT drills ─────────────────────────────────────────────────────────────
ASPECT_PAIRS = [
    ("He tried to go.","A pai sawm hi.","attempted"),
    ("He went immediately.","A pai pah hi.","immediate action"),
    ("He went again.","A pai kik hi.","resumptive"),
    ("It is very good.","A hoih mahmah hi.","intensive"),
    ("He had already gone.","A pai khinsa hi.","past perfect"),
    ("He will have gone.","A pai khinzo ding hi.","future perfect"),
    ("He has already gone.","A pai khinzo hi.","present perfect"),
    ("He keeps working.","Nasep den hi.","habitual"),
    ("I am going right now.","Ka pai laitak hi.","immediate progressive"),
]
for en,zo,aspect in ASPECT_PAIRS:
    add(f"Translate to Zolai ({aspect} aspect).", en, zo, "grammar")

# ── TUTOR DIALOGUES ───────────────────────────────────────────────────────────
TUTOR = [
    ("A student asks: How do I say 'I believe in God' in Zolai?",
     "", "Use 'up' (believe) with ergative 'in': 'Pasian ka up hi.' (I believe in God.) Or more formally: 'Kei in Pasian ka up hi.' (I believe in God — emphatic agent.)", "education"),
    ("A student asks: What is the difference between 'khin' and 'zo'?",
     "", "'khin' = experiential perfect — has done at least once: 'Ka mu khin hi.' (I have seen it.) 'zo' = completive — fully finished: 'Ka ne zo hi.' (I have finished eating.) Use 'khin' for experience, 'zo' for completion.", "education"),
    ("A student asks: How do I say 'I am afraid' in Zolai?",
     "", "'Ka lau hi.' (I am afraid.) 'lau' = fear. Noun form: 'launa' (fear). 'Lau kei in.' (Don't be afraid.) — imperative negative.", "education"),
    ("A student asks: How do I say 'I don't understand'?",
     "", "'Ka theih lo hi.' (I don't understand/know.) 'thei' = know/can. Negation: 'thei' + lo = 'theih lo' (Stem II before lo). Full: 'Ka theih lo hi.'", "education"),
    ("A student asks: How do I say 'God bless you'?",
     "", "'Pasian in na thupha hen.' (May God bless you.) Pattern: Pasian in + [object] + thupha + hen (benedictive mood). 'thupha' = blessing.", "religion"),
    ("A student asks: What is the difference between 'pai' and 'hong pai'?",
     "", "'pai' = go (neutral direction). 'hong pai' = come (toward the speaker). 'hong' is the directional particle meaning 'toward speaker'. Example: 'Ka pai hi.' (I go.) 'Hong pai in.' (Come here.)", "education"),
    ("A student asks: How do I say 'I miss you' in Zolai?",
     "", "'Nang ka ngaih hi.' (I miss you.) 'ngaih' = to miss/long for/think of. Or: 'Na tungah ka ngaihtuah hi.' (I think of you / I miss you.)", "daily"),
    ("A student asks: How do I say 'I am sorry' in Zolai?",
     "", "'Ka lungngaih hi.' (I am sorry/sad.) Or more formally: 'Mawhna ka nei hi.' (I have fault/I am sorry.) 'mawh' = fault/sin. 'Lungngaih' = sad/regretful.", "daily"),
    ("A student asks: How do I say 'please' in Zolai?",
     "", "Use 'pak dih' after the verb for polite requests: 'Hong pai pak dih.' (Please come.) Or 'dih' alone: 'Pia dih.' (Please give.) 'pak' intensifies the politeness.", "daily"),
    ("A student asks: How do I say 'I love you' in Zolai?",
     "", "'Nang ka it hi.' (I love you.) 'it' = love. With ergative: 'Kei in nang ka it hi.' (I love you — emphatic.) Noun form: 'itna' (love).", "daily"),
    ("Correct this sentence: 'Ka theihna lo hi.'",
     "", "Error: 'theihna' is a noun (knowledge), not a verb. For 'I don't know', use the verb 'thei' with negation: 'Ka theih lo hi.' (I don't know.) 'theihna' would be used as: 'Theihna ka nei lo hi.' (I don't have knowledge.)", "education"),
    ("A student asks: How do I say 'Let's go' in Zolai?",
     "", "'Pai ni.' (Let's go.) 'ni' is the hortative marker meaning 'let us'. Do NOT say 'I pai uh ni' — never combine 'uh' with 'i'. Simply: 'Pai ni.' or 'I pai ni.'", "education"),
    ("A student asks: How do I say 'I am hungry'?",
     "", "'Ka dot hi.' (I am hungry.) 'dot' = hungry. Or: 'An ka duh hi.' (I want food.) 'an' = rice/food, 'duh' = want.", "daily"),
    ("A student asks: How do I say 'It is raining'?",
     "", "'Guah a zu hi.' (It is raining.) 'guah' = rain (noun), 'zu' = fall/flow. Literally: 'Rain falls.' This is the standard Zolai expression for rain.", "daily"),
    ("A student asks: How do I say 'I am tired'?",
     "", "'Ka ngawl hi.' (I am tired.) 'ngawl' = tired/weary. Or: 'Ka ngawl mahmah hi.' (I am very tired.) Noun form: 'ngawlna' (tiredness).", "daily"),
]
for item in TUTOR:
    add(*item)

# ── DIALECT COMPARISON ────────────────────────────────────────────────────────
DIALECT_COMPARE = [
    ("God","Pasian (Tedim ✓)","Pathian (Hakha ✗)"),
    ("land/country","gam (Tedim ✓)","ram (Hakha ✗)"),
    ("son","tapa (Tedim ✓)","fapa (Hakha ✗)"),
    ("lord/master","topa (Tedim ✓)","bawipa (Hakha ✗)"),
    ("life (noun)","nuntakna (Tedim ✓)","nunnak (Hakha ✗)"),
    ("freedom","suahtakna (Tedim ✓)","zalenna (non-standard ✗)"),
    ("king","kumpipa (Tedim ✓)","bawipa (Hakha ✗)"),
    ("that/then","tua (Tedim ✓)","cu/cun (Hakha ✗)"),
]
for concept,correct,wrong in DIALECT_COMPARE:
    add(f"What is the correct Tedim Zolai word for '{concept}'?",
        "", f"Correct (Tedim ZVS): {correct}. NEVER use: {wrong} — that is the Hakha/Falam dialect form, forbidden in Tedim standard.", "grammar")

# ── WRITE ─────────────────────────────────────────────────────────────────────
with OUT.open("a", encoding="utf-8") as f:
    for rec in recs:
        f.write(json.dumps(rec, ensure_ascii=False) + "\n")

print(f"Added {len(recs):,} new instructions", flush=True)
print(f"Total now: {len(seen):,}", flush=True)
