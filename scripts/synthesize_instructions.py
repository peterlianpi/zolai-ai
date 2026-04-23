"""
Zolai Instruction Synthesizer — generates instruction records from wiki grammar patterns.
Agents: Zomi Synthesizer + Linguistic Specialist + Zolai Learner (Zola)
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

ROOT     = Path(__file__).parent.parent
COMBINED = ROOT / "data/master/combined"
OUT      = COMBINED / "instructions.jsonl"

def md5(s: str) -> str:
    return hashlib.md5(s.encode()).hexdigest()

def c(v) -> str:
    return " ".join(str(v or "").split()).strip()

# ── Load existing hashes ──────────────────────────────────────────────────────
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
print(f"[Zomi Synthesizer] Existing: {len(seen):,} instruction hashes", flush=True)

# ── Instruction bank ──────────────────────────────────────────────────────────
# Each entry: (instruction, input, output, domain)
INSTRUCTIONS: list[tuple[str,str,str,str]] = []

def add(ins: str, inp: str, out: str, domain: str = "grammar") -> None:
    INSTRUCTIONS.append((c(ins), c(inp), c(out), domain))

# ── A1: SOV Identity & Existence ─────────────────────────────────────────────
add("Translate to Zolai using SOV word order.", "I am a student.", "Kei pen student ka hi hi.", "education")
add("Translate to Zolai using SOV word order.", "He is a teacher.", "Amah pen sia khat ahi hi.", "education")
add("Translate to Zolai using SOV word order.", "She is a doctor.", "Amah pen doctor khat ahi hi.", "education")
add("Translate to Zolai using SOV word order.", "We are Zomi.", "Zomi i hi hi.", "education")
add("Translate to Zolai using SOV word order.", "You are my friend.", "Nang pen ka lungkim ahi hi.", "education")
add("Translate to Zolai using SOV word order.", "God exists.", "Pasian om hi.", "religion")
add("Translate to Zolai using SOV word order.", "I eat rice.", "Kei in an ka ne hi.", "daily")
add("Translate to Zolai using SOV word order.", "My father goes to school.", "Ka pa sangah pai hi.", "daily")
add("Translate to Zolai using SOV word order.", "God created the earth.", "Pasian in leitung a piangsak hi.", "religion")
add("Translate to Zolai using SOV word order.", "God gave them blessings.", "Pasian in amaute thupha a pia hi.", "religion")

add("What is the correct Zolai word order?", "", "Zolai uses SOV (Subject-Object-Verb) word order. The verb always comes last. Example: 'Pasian in leitung a piangsak hi.' (God created the earth.) — Subject (Pasian) + Object (leitung) + Verb (piangsak) + hi.", "grammar")
add("Explain the ergative particle 'in' in Zolai.", "", "The particle 'in' marks the agent (doer) of a transitive verb. Example: 'Pasian in leitung a piangsak hi.' — Pasian (God) + in (agent marker) + leitung (earth) + piangsak (created). Without 'in', the sentence would be intransitive.", "grammar")
add("What does the declarative marker 'hi' do in Zolai?", "", "Every standard factual statement in Zolai must end with 'hi'. It marks the sentence as a declaration. Without 'hi', the sentence is grammatically incomplete. Example: 'A pai hi.' (He goes.)", "grammar")

# ── A1: Personal Pronouns ─────────────────────────────────────────────────────
add("List the Zolai personal pronouns with examples.", "", "ka = I (1st sg), na = you (2nd sg), a = he/she/it (3rd sg), i = we inclusive (1st pl), ko = we exclusive. Examples: 'Ka pai hi.' (I go.) 'Na pai hi.' (You go.) 'A pai hi.' (He goes.) 'I pai hi.' (We go.)", "grammar")
add("Translate to Zolai.", "I go.", "Ka pai hi.", "daily")
add("Translate to Zolai.", "You go.", "Na pai hi.", "daily")
add("Translate to Zolai.", "He goes.", "A pai hi.", "daily")
add("Translate to Zolai.", "We go.", "I pai hi.", "daily")
add("Translate to Zolai.", "They go.", "A pai uh hi.", "daily")

# ── A1: Phonetic rules ────────────────────────────────────────────────────────
add("What are the phonetic restrictions in Zolai (Tedim)?", "", "1. No 'ti' clusters — 't' and 'i' never combine. 2. 'c' only pairs with 'i' and 'u' — never with a, e, o, aw. 3. 'o' is always pronounced like 'ou' (as in 'soul'). These rules apply at all levels.", "grammar")
add("Is 'tipa' or 'cipa' correct Zolai for 'son'?", "", "Neither. The correct Zolai word is 'tapa' (son). 'ti' clusters are forbidden in Zolai phonology. Always use 'tapa', never 'tipa'.", "grammar")

# ── A2: Tense markers ─────────────────────────────────────────────────────────
add("Explain Zolai tense markers with examples.", "", "Present: 'A pai hi.' (He goes.) | Past simple: 'A pai ta hi.' (He went.) | Present perfect: 'A pai khin hi.' (He has gone.) | Completive: 'A pai zo hi.' (He finished going.) | Future: 'A pai ding hi.' (He will go.) | Progressive: 'A pai lai hi.' (He is going.)", "grammar")
add("Translate to Zolai (past tense).", "He went.", "A pai ta hi.", "grammar")
add("Translate to Zolai (future tense).", "She will go.", "A pai ding hi.", "grammar")
add("Translate to Zolai (progressive).", "I am eating.", "Ka ne lai hi.", "daily")
add("Translate to Zolai (completive).", "He has finished eating.", "A ne zo hi.", "daily")
add("Translate to Zolai (experiential).", "I have seen it before.", "Ka mu khin hi.", "daily")
add("Translate to Zolai (habitual).", "He keeps working.", "Nasep den hi.", "daily")
add("Translate to Zolai (immediate).", "I am going right now.", "Ka pai laitak hi.", "daily")

# ── A2: Negation ──────────────────────────────────────────────────────────────
add("Explain negation patterns in Zolai.", "", "Present negation: V + lo — 'Ka ne lo hi.' (I don't eat.) | Future negation: V + kei — 'Ka pai kei ding hi.' (I won't go.) | Imperative negative: 'Pai kei in.' (Don't go.) | Experiential negation: V + ngei lo — 'Ka mu ngei lo hi.' (I have never seen.)", "grammar")
add("Translate to Zolai (negative).", "I don't eat.", "Ka ne lo hi.", "daily")
add("Translate to Zolai (future negative).", "I will not go.", "Ka pai kei ding hi.", "daily")
add("Translate to Zolai (imperative negative).", "Don't go.", "Pai kei in.", "daily")
add("Translate to Zolai (never).", "I have never seen it.", "Ka mu ngei lo hi.", "daily")
add("What is wrong with this sentence: 'Ka pai lo ding hi'?", "", "The negation is incorrect. For future negation, use 'kei' not 'lo'. Correct form: 'Ka pai kei ding hi.' (I will not go.) 'lo' is for present negation only.", "grammar")

# ── A2: Plurality rule ────────────────────────────────────────────────────────
add("Explain the plurality rule for 'i' (we) in Zolai.", "", "NEVER combine 'uh' with 'i' (1st person inclusive). 'uh' marks 3rd person plural (they). 'i' already means 'we (all)'. Correct: 'I pai hi.' (We go.) WRONG: 'I pai uh hi.' — The Khanggui states: when using 'i' or 'ei', 'uh' is no longer needed.", "grammar")
add("Is this sentence correct: 'I pai uh hi'?", "", "No. This is incorrect. 'uh' must never be combined with 'i' (1st person inclusive). The correct form is simply 'I pai hi.' (We go.) 'uh' is only for 3rd person plural: 'A pai uh hi.' (They go.)", "grammar")
add("Translate to Zolai.", "They go.", "A pai uh hi.", "grammar")
add("Translate to Zolai.", "We (all) go.", "I pai hi.", "grammar")

# ── B1: Questions ─────────────────────────────────────────────────────────────
add("Explain how to form questions in Zolai.", "", "Yes/No questions: add 'hiam' at the end — 'Na pai ding hiam?' (Will you go?) | Content questions use question words: Bang (what), Kua (who), Koi/Koilah (where), Bang hang (why), Bang ci (how), Bang zah (how much), Bang hun (when). All end with 'hiam'.", "grammar")
add("Translate to Zolai.", "What do you want?", "Bang na duh hiam?", "daily")
add("Translate to Zolai.", "Where are you going?", "Koi ah na pai hiam?", "daily")
add("Translate to Zolai.", "Who are you?", "Kua na hi hiam?", "daily")
add("Translate to Zolai.", "Why?", "Bang hang hiam?", "daily")
add("Translate to Zolai.", "How is it?", "Bang ci hiam?", "daily")
add("Translate to Zolai.", "When will you go?", "Bang hun ah na pai ding?", "daily")
add("Translate to Zolai.", "Will you go?", "Na pai ding hiam?", "daily")
add("Translate to Zolai.", "Did you eat?", "An na ne khin hiam?", "daily")

# ── B1: Cause & Effect ────────────────────────────────────────────────────────
add("Explain 'Bang hang hiam cih leh' in Zolai.", "", "'Bang hang hiam cih leh' means 'Because' or 'The reason is'. It introduces a reason clause. Example: 'Ka pai ngei kei hi. Bang hang hiam cih leh hun ka nei kei hi.' (I did not go. Because I had no time.)", "grammar")
add("Explain 'ahih manin' in Zolai.", "", "'ahih manin' means 'therefore' or 'because of this'. It follows the cause clause. Example: 'Guah zu ahih manin, innah ka om hi.' (Because it rained, I stayed home.)", "grammar")
add("Translate to Zolai using cause-effect.", "I did not go because I had no time.", "Ka pai ngei kei hi. Bang hang hiam cih leh hun ka nei kei hi.", "grammar")
add("Translate to Zolai.", "Because it rained, I stayed home.", "Guah zu ahih manin, innah ka om hi.", "daily")

# ── B1: Conditionals ─────────────────────────────────────────────────────────
add("Explain conditional sentences in Zolai.", "", "Simple conditional uses 'leh': 'Na pai leh, ka lungdam ding.' (If you go, I'll be happy.) Negative conditional: ONLY use 'nong pai kei a leh' — NEVER 'lo leh'. Example: 'Nong pai kei a leh, ka lungdam kei ding.' (If you don't go, I won't be happy.)", "grammar")
add("Translate to Zolai (conditional).", "If you go, I will be happy.", "Na pai leh, ka lungdam ding hi.", "grammar")
add("What is the correct negative conditional form in Zolai?", "", "Use 'nong [verb] kei a leh' for negative conditionals. NEVER use 'lo leh'. Correct: 'Nong pai kei a leh...' (If you don't go...) Wrong: 'Na pai lo leh...' — this form is forbidden in ZVS standard.", "grammar")
add("Translate to Zolai (negative conditional).", "If you don't go, I won't be happy.", "Nong pai kei a leh, ka lungdam kei ding hi.", "grammar")

# ── B1: Quotatives ────────────────────────────────────────────────────────────
add("Explain quotative patterns in Zolai.", "", "'ci hi' = said/says (reported speech): 'A pai ding ci hi.' (He said he will go.) | 'ci-in' = saying/having said: 'A pai ding ci-in a ciah hi.' (Having said he would go, he left.) | 'kici' = is called/named: 'Pasian kici hi.' (It is called God.)", "grammar")
add("Translate to Zolai (reported speech).", "He said he will go.", "A pai ding ci hi.", "grammar")
add("Translate to Zolai.", "It is called Zolai.", "Zolai kici hi.", "grammar")

# ── B2: Directional particles ─────────────────────────────────────────────────
add("Explain directional verb particles in Zolai.", "", "hong = toward speaker: 'Hong pai in.' (Come here.) | va = away from speaker: 'Va pai in.' (Go away.) | khia = outward: 'Khia pai in.' (Go out.) | lut = inward: 'Lut pai in.' (Go in.) | kik = back/return: 'Kik pai in.' (Go back.) | pih = send/bring: 'Hong pih in.' (Bring it here.)", "grammar")
add("Translate to Zolai.", "Come here.", "Hong pai in.", "daily")
add("Translate to Zolai.", "Go out.", "Khia pai in.", "daily")
add("Translate to Zolai.", "Go back.", "Kik pai in.", "daily")
add("Translate to Zolai.", "Go in.", "Lut pai in.", "daily")

# ── B2: Comparatives ─────────────────────────────────────────────────────────
add("Explain comparative structures in Zolai.", "", "Comparative 'more than': [A] [B] sangin [Adj]-zaw hi. Example: 'Sumkuang sangin bilpi a hatzaw hi.' (A rabbit is faster than a snail.) Superlative: [Noun] pen [Adj] mahmah hi. Example: 'Pasian pen hoih mahmah hi.' (God is the best/most good.)", "grammar")
add("Translate to Zolai (comparative).", "This book is better than that one.", "Hih laibu sangin hua laibu a hoihzaw hi.", "education")
add("Translate to Zolai (superlative).", "God is the greatest.", "Pasian pen lian mahmah hi.", "religion")

# ── Verb stems ────────────────────────────────────────────────────────────────
add("Explain Stem I vs Stem II in Zolai verbs.", "", "Stem I is used in simple affirmative sentences. Stem II is used in negation, subordinate clauses, and before 'leh'. Examples: si→sih (die), nei→neih (have), hau→hauh (rich), hak→hah (hard), kap→kah (cry), that→thah (kill), sam→sap (call), mu→muh (see), gen→gent (say). Noun form uses Stem II + na: sihna (death), neihna (possession).", "grammar")
add("What is the Stem II of 'si' (die) and how is it used?", "", "Stem II of 'si' is 'sih'. Used in: negation ('A sih lo hi.' — He did not die.), subordinate clauses, and noun form 'sihna' (death). Example: 'A sihna pen lungkimna ahi hi.' (His death is a comfort.)", "grammar")
add("What is the Stem II of 'nei' (have)?", "", "Stem II of 'nei' is 'neih'. Used in negation: 'Ka neih lo hi.' (I don't have.) Noun form: 'neihna' (possession/having). Example: 'Neihna tampi nei hi.' (He has many possessions.)", "grammar")
add("What is the Stem II of 'mu' (see)?", "", "Stem II of 'mu' is 'muh'. Used in negation: 'Ka muh lo hi.' (I don't see.) and subordinate clauses: 'A muh leh...' (If he sees...). Noun form: 'muhna' (sight/vision).", "grammar")
add("What is wrong with 'Ka neina tampi nei hi'?", "", "The nominalization is wrong. 'nei' (have) uses Stem II 'neih' before '-na'. Correct: 'Ka neihna tampi nei hi.' (I have many possessions.) Never use Stem I + na for nominalization.", "grammar")

# ── Imperatives & Mood ────────────────────────────────────────────────────────
add("Explain imperative forms in Zolai.", "", "Direct command (plural): V + un — 'Pai un.' (Go! — to group) | Polite: 'Hong pai pak dih.' (Please come.) | Hortative 'let us': V + ni — 'Mihing bawl ni.' (Let us make man. — Gen 1:26) | Benedictive 'let it be': V + hen — 'Khuavak om hen.' (Let there be light. — Gen 1:3) | Prohibitive: V + kei in — 'Pai kei in.' (Don't go.)", "grammar")
add("Translate to Zolai (hortative).", "Let us make man.", "Mihing bawl ni.", "religion")
add("Translate to Zolai (benedictive).", "Let there be light.", "Khuavak om hen.", "religion")
add("Translate to Zolai (polite request).", "Please come.", "Hong pai pak dih.", "daily")

# ── Common mistakes ───────────────────────────────────────────────────────────
add("What is the correct Zolai word for God?", "", "The correct Tedim Zolai word for God is 'Pasian'. Never use 'Pathian' — that is the Hakha/Falam dialect form and is forbidden in Tedim ZVS standard.", "grammar")
add("How do you respond to 'Na dam na?' in Zolai?", "", "Correct responses: 'Dam mah.' or 'Ka dam hi.' (I am well.) Do NOT say 'Man ei' as a greeting response — that means 'That's correct/true'. Do NOT mix 'lungdamna' (gospel/good news) into a greeting response.", "daily")
add("What is the correct word for 'freedom' in Zolai?", "", "Use 'Suahtakna' for freedom/liberty. Do NOT use 'Zalenna' — that is a non-standard form.", "grammar")
add("What is the correct word for 'life' as a noun in Zolai?", "", "Use 'Nuntakna' for life (as a noun/concept). Do NOT use 'Nunnak' — that is the Hakha/Falam form.", "grammar")
add("What is the Zolai word for 'land/country'?", "", "Use 'gam' for land/country/territory. NEVER use 'ram' — that is the Hakha/Falam dialect word. Example: 'Ka gam' (my land/country).", "grammar")
add("What is the Zolai word for 'son'?", "", "Use 'tapa' for son. NEVER use 'fapa' — that is the Hakha/Falam form. Example: 'Ka tapa' (my son).", "grammar")
add("What is the Zolai word for 'lord/master'?", "", "Use 'topa' for lord/master. NEVER use 'bawipa' — that is the Hakha/Falam form. Example: 'Ka Topa Jesuh' (My Lord Jesus).", "grammar")

# ── C1: Embedded clauses & rhetoric ──────────────────────────────────────────
add("Explain the 'I Am' metaphor pattern in Zolai (C1 level).", "", "The emphatic 'I Am' uses 'KEIMAH ka hi hi' for strong identity assertion. Example: 'Zolai pau ka hi hi.' (I AM a Zolai speaker — emphatic.) 'KEIMAH' is the emphatic form of 'Kei' (I). Used in biblical and rhetorical contexts for strong self-identification.", "grammar")
add("Explain 'Tua ahih ciangin' as a narrative connector.", "", "'Tua ahih ciangin' means 'And when that happened' or 'Then after that'. It is a C1-level biblical narrative connector used to sequence events. Example: 'Tua ahih ciangin, Pasian in a gen hi.' (And then, God spoke.) Used extensively in Genesis narrative.", "grammar")
add("Translate to Zolai (narrative sequence).", "And then God spoke.", "Tua ahih ciangin, Pasian in a gen hi.", "religion")
add("Explain 'Tua ciangin' vs 'Tua ahih ciangin'.", "", "'Tua ciangin' = 'Then / After that' (simple sequence, A2 level). 'Tua ahih ciangin' = 'And when that was so / Then after that happened' (stronger narrative connector, C1 level, biblical register). Use 'Tua ciangin' for everyday narrative, 'Tua ahih ciangin' for formal/biblical text.", "grammar")

# ── Culture & Gentehna ────────────────────────────────────────────────────────
add("What is 'Gentehna' in Zolai culture?", "", "Gentehna (plural: Gentehna Tuamtuam) are Zomi cultural proverbs, parables, and wisdom sayings. They encode moral principles and cultural values. Example: 'Ei le ei mah kipanpih ding, kigum, kihuai ding cih sam hang' — a proverb about mutual support and unity among Zomi people.", "culture")
add("What does 'Lung' mean in Zolai?", "", "'Lung' literally means 'stone/rock' but culturally refers to the heart/mind/inner self. 'Ka lung' = my heart/mind. 'Lungdam' = happy (lit. 'heart-good'). 'Lungkim' = friend (lit. 'heart-close'). 'Lunggulh' = worry/concern. The 'Lung' is the seat of emotion and thought in Zolai worldview.", "culture")
add("What is 'Khanggui' in Zolai tradition?", "", "Khanggui is the Zomi genealogical and clan history tradition. It records lineage (suan/beh), historical milestones, and clan identity. 'Ka khanggui' = my genealogy/heritage. It is central to Zomi identity and is referenced in formal speech and literature.", "culture")

# ── Tutor dialogues ───────────────────────────────────────────────────────────
add("A student says: 'Ka pai lo ding hi.' Is this correct?", "", "Not quite. For future negation, use 'kei' not 'lo'. Correct form: 'Ka pai kei ding hi.' (I will not go.) 'lo' is for present negation: 'Ka pai lo hi.' (I don't go.) Remember: future = kei, present = lo.", "education")
add("A student asks: How do I say 'I am happy' in Zolai?", "", "Hint: 'happy' in Zolai is 'lungdam' (lit. heart-good). Now apply the SOV pattern with 1st person marker 'ka'. Try: 'Ka lungdam hi.' (I am happy.) For emphasis: 'Ka lungdam mahmah hi.' (I am very happy.)", "education")
add("A student asks: What is the difference between 'ta' and 'zo' in Zolai?", "", "'ta' marks a change of state or new situation: 'A hoih ta hi.' (It has become good now.) 'zo' marks completive aspect — the action is fully finished: 'A ne zo hi.' (He has finished eating.) Use 'ta' for transitions, 'zo' for completion.", "education")
add("A student asks: How do I say 'Let's eat' in Zolai?", "", "Use the hortative marker 'ni': 'An ne ni.' (Let's eat.) Remember: 'an' = rice/food, 'ne' = eat, 'ni' = let us. Do NOT say 'I ne uh ni' — never combine 'uh' with 'i' (1st person inclusive).", "education")
add("A student asks: How do I say 'I have never been to Tedim'?", "", "Use experiential negation 'ngei lo': 'Tedim ah ka pai ngei lo hi.' (I have never gone to Tedim.) Pattern: [Subject] + [Place] + ah + [Verb] + ngei lo + hi.", "education")
add("Correct this sentence: 'Pasian in pathian a hi hi.'", "", "Two errors: 1. 'pathian' is the Hakha/Falam word — use 'Pasian'. 2. Redundant subject. Correct: 'Pasian a hi hi.' (God is [God].) Or better: 'Pasian pen lian mahmah hi.' (God is the greatest.)", "education")
add("A student asks: How do I say 'because' in Zolai?", "", "Two options: 1. 'Bang hang hiam cih leh' — starts the reason clause: 'Ka pai lo hi. Bang hang hiam cih leh hun ka nei kei hi.' (I didn't go. Because I had no time.) 2. 'ahih manin' — follows the cause: 'Hun ka nei kei ahih manin, ka pai lo hi.' (Because I had no time, I didn't go.)", "education")

print(f"[Zomi Synthesizer] Generated {len(INSTRUCTIONS):,} instruction templates", flush=True)

# ── Write new records ─────────────────────────────────────────────────────────
added = 0
with OUT.open("a", encoding="utf-8") as f:
    for ins, inp, out, domain in INSTRUCTIONS:
        if not ins or not out: continue
        k = md5(ins + out)
        if k in seen: continue
        seen.add(k)
        f.write(json.dumps({
            "instruction": ins, "input": inp, "output": out,
            "source": "wiki_synthesizer_v1", "domain": domain,
            "dialect": "tedim", "category": "instruction"
        }, ensure_ascii=False) + "\n")
        added += 1

print(f"[Zomi Synthesizer] Added {added:,} new instructions", flush=True)
print(f"[Zomi Data Manager] Total instructions: {len(seen):,}", flush=True)
