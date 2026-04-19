#!/usr/bin/env python3
"""
learn_grammar_from_corpus.py
Rerunnable grammar pattern extractor from:
  - 3 Zolai Bible parallel corpora (TDB77, TBR17, Tedim2010)
  - data/master_source_v1.jsonl (parallel_combined, dict_semantic, wiki_*)
  - wiki/grammar/*.md, wiki/translation/*.md, wiki/linguistics/*.md

Usage:
  python scripts/maintenance/learn_grammar_from_corpus.py --topic pronouns
  python scripts/maintenance/learn_grammar_from_corpus.py --topic verbs
  python scripts/maintenance/learn_grammar_from_corpus.py --topic all
  python scripts/maintenance/learn_grammar_from_corpus.py --search "love"
"""

import json, re, argparse
from pathlib import Path
from collections import defaultdict

ROOT   = Path(__file__).resolve().parents[2]
DATA   = ROOT / "data"
WIKI   = ROOT / "wiki/grammar"
WIKI.mkdir(parents=True, exist_ok=True)

BIBLE_FILES = [
    (DATA / "parallel/bible_parallel_tdb77_kjv.jsonl",     "TDB77"),
    (DATA / "parallel/bible_parallel_tbr17_kjv.jsonl",     "TBR17"),
    (DATA / "parallel/bible_parallel_tedim2010_kjv.jsonl", "Tedim2010"),
]
MASTER_FILE = DATA / "master_source_v1.jsonl"

WIKI_MD_FILES = [
    ROOT / "wiki/grammar/core_grammar_reference.md",
    ROOT / "wiki/grammar/sentence_structures.md",
    ROOT / "wiki/grammar/tense_markers.md",
    ROOT / "wiki/grammar/particle_differentiations.md",
    ROOT / "wiki/grammar/verb_stems.md",
    ROOT / "wiki/grammar/phonology.md",
    ROOT / "wiki/translation/decision_patterns.md",
    ROOT / "wiki/translation/english_to_zolai_mapping.md",
    ROOT / "wiki/linguistics/tedim_pau_language_reference.md",
    ROOT / "wiki/linguistics/zolai_sinna_2010_knowledge.md",
    ROOT / "wiki/grammar/social_registers.md",
    ROOT / "wiki/grammar/morphemics.md",
]

SKIP_HEADERS = {"zolai","zo","word","phrase","term","english","en","pattern",
                "example","form","suffix","prefix","marker","particle","type",
                "function","usage","note","description","rule","category","label"}


def load_bible_pairs(max_per_file=None):
    pairs = []
    for fpath, version in BIBLE_FILES:
        count = 0
        with open(fpath) as f:
            for line in f:
                d = json.loads(line)
                en = d.get("input","").strip()
                zo = d.get("output","").strip()
                if en and zo:
                    pairs.append(("bible", version, en, zo))
                    count += 1
                    if max_per_file and count >= max_per_file:
                        break
    return pairs


def load_master_pairs(sources=None, max_total=200000):
    pairs = []
    with open(MASTER_FILE) as f:
        for line in f:
            if len(pairs) >= max_total:
                break
            d = json.loads(line)
            zo = d.get("zolai","").strip()
            en = d.get("english","").strip()
            if not zo or not en:
                continue
            src = d.get("source","")
            if sources and src not in sources:
                continue
            pairs.append(("master", src, en, zo))
    return pairs


def load_wiki_md_pairs():
    pairs = []
    for fpath in WIKI_MD_FILES:
        if not fpath.exists():
            continue
        for line in fpath.read_text(errors="ignore").splitlines():
            parts = [p.strip() for p in line.split("|") if p.strip()]
            if len(parts) < 2:
                continue
            zo, en = parts[0], parts[1]
            if zo.startswith("-") or en.startswith("-"):
                continue
            if zo.lower() in SKIP_HEADERS or en.lower() in SKIP_HEADERS:
                continue
            if len(zo) < 2 or len(en) < 2:
                continue
            pairs.append(("wiki_md", fpath.name, en, zo))
    return pairs


def search_all(query, max_results=15):
    pat = re.compile(re.escape(query), re.IGNORECASE)
    results = []
    seen = set()

    for fpath, ver in BIBLE_FILES:
        with open(fpath) as f:
            for line in f:
                d = json.loads(line)
                en, zo = d.get("input",""), d.get("output","")
                if pat.search(en) and zo[:50] not in seen:
                    seen.add(zo[:50])
                    results.append((f"Bible/{ver}", en[:70], zo[:70]))
                    if len(results) >= max_results: break
        if len(results) >= max_results: break

    if len(results) < max_results:
        with open(MASTER_FILE) as f:
            for line in f:
                d = json.loads(line)
                en, zo = d.get("english",""), d.get("zolai","")
                if en and zo and pat.search(en) and zo[:50] not in seen:
                    seen.add(zo[:50])
                    results.append((d.get("source","master"), en[:70], zo[:70]))
                    if len(results) >= max_results: break

    if len(results) < max_results:
        for fpath in WIKI_MD_FILES:
            if not fpath.exists(): continue
            for line in fpath.read_text(errors="ignore").splitlines():
                if pat.search(line) and "|" in line:
                    parts = [p.strip() for p in line.split("|") if p.strip()]
                    if len(parts) >= 2 and parts[0][:50] not in seen:
                        seen.add(parts[0][:50])
                        results.append((f"wiki/{fpath.name}", parts[1][:70], parts[0][:70]))
                        if len(results) >= max_results: break

    print(f"\nSearch: '{query}' — {len(results)} results\n")
    for src, en, zo in results:
        print(f"[{src}]\n  EN: {en}\n  ZO: {zo}\n")


def learn_pronouns(bible, master, wiki):
    patterns = {
        "1sg_I":      (r"\bI\b",          ["ka ", "kei "]),
        "1sg_me":     (r"\bme\b",          ["kei", "keima"]),
        "1sg_my":     (r"\bmy\b",          ["ka "]),
        "1sg_myself": (r"\bmyself\b",      ["ka pumpi","keimah"]),
        "2sg_thou":   (r"\bthou\b",        ["nang","na "]),
        "2sg_thee":   (r"\bthee\b",        ["nang","na "]),
        "2sg_thy":    (r"\bthy\b",         ["na "]),
        "2sg_thyself":(r"\bthyself\b",     ["nangmah"]),
        "3sg_he":     (r"\bhe\b",          ["amah","ama "]),
        "3sg_him":    (r"\bhim\b",         ["amah","ama "]),
        "3sg_his":    (r"\bhis\b",         ["ama'","ama "]),
        "3sg_himself":(r"\bhimself\b",     ["eimah","amah mah"]),
        "3sg_she":    (r"\bshe\b",         ["amah","ama "]),
        "3sg_her":    (r"\bher\b",         ["amah","ama "]),
        "3sg_it":     (r"\bit\b",          ["tua ","amah"]),
        "1pl_we":     (r"\bwe\b",          ["eite"," i ","kote"]),
        "1pl_us":     (r"\bus\b",          ["eite","kote"]),
        "1pl_our":    (r"\bour\b",         ["i ","eite","kote"]),
        "1pl_ours":   (r"\bourselves\b",   ["i pumpi","eimah"]),
        "2pl_you":    (r"\byou\b|\bye\b",  ["note","na "]),
        "2pl_your":   (r"\byour\b",        ["na ","note"]),
        "3pl_they":   (r"\bthey\b",        ["amaute","amau"]),
        "3pl_them":   (r"\bthem\b",        ["amaute","amau"]),
        "3pl_their":  (r"\btheir\b",       ["amau'","amau "]),
        "3pl_selves": (r"\bthemselves\b",  ["amaute mah","amau mah"]),
    }
    canonical = {
        "1sg_I":"ka (prefix) / kei (emphatic standalone)",
        "1sg_me":"kei / keima",
        "1sg_my":"ka",
        "1sg_myself":"ka pumpi",
        "2sg_thou":"nang",
        "2sg_thee":"nang / nangma",
        "2sg_thy":"na",
        "2sg_thyself":"nangmah",
        "3sg_he":"amah",
        "3sg_him":"amah",
        "3sg_his":"ama / ama'",
        "3sg_himself":"eimah / amah mah",
        "3sg_she":"amah (no gender distinction)",
        "3sg_her":"amah",
        "3sg_it":"tua / amah",
        "1pl_we":"i (subject prefix) / eite (emphatic/object) / kote (inclusive formal)",
        "1pl_us":"eite / kote",
        "1pl_our":"i / eite",
        "1pl_ours":"i pumpi / eimah mah",
        "2pl_you":"note",
        "2pl_your":"na / note",
        "3pl_they":"amaute",
        "3pl_them":"amaute",
        "3pl_their":"amau / amau'",
        "3pl_selves":"amaute mah",
    }
    display = {
        "1sg_I":("1st Sing.","I (subj)"),
        "1sg_me":("1st Sing.","me (obj)"),
        "1sg_my":("1st Sing.","my (poss adj)"),
        "1sg_myself":("1st Sing.","myself (refl)"),
        "2sg_thou":("2nd Sing.","thou/you (subj)"),
        "2sg_thee":("2nd Sing.","thee/you (obj)"),
        "2sg_thy":("2nd Sing.","thy/your (poss adj)"),
        "2sg_thyself":("2nd Sing.","thyself/yourself (refl)"),
        "3sg_he":("3rd Sing. M","he (subj)"),
        "3sg_him":("3rd Sing. M","him (obj)"),
        "3sg_his":("3rd Sing. M","his (poss)"),
        "3sg_himself":("3rd Sing. M","himself (refl)"),
        "3sg_she":("3rd Sing. F","she (subj)"),
        "3sg_her":("3rd Sing. F","her (obj)"),
        "3sg_it":("3rd Sing. N","it (subj/obj)"),
        "1pl_we":("1st Plural","we (subj)"),
        "1pl_us":("1st Plural","us (obj)"),
        "1pl_our":("1st Plural","our (poss adj)"),
        "1pl_ours":("1st Plural","ourselves (refl)"),
        "2pl_you":("2nd Plural","you/ye (subj)"),
        "2pl_your":("2nd Plural","your (poss adj)"),
        "3pl_they":("3rd Plural","they (subj)"),
        "3pl_them":("3rd Plural","them (obj)"),
        "3pl_their":("3rd Plural","their (poss adj)"),
        "3pl_selves":("3rd Plural","themselves (refl)"),
    }
    notes = {
        "1sg_I":"ka = prefix attached to verb/noun; kei = standalone emphatic",
        "3sg_he":"No gender in Zolai — amah = he/she/it",
        "3sg_she":"Same as he — amah (Zolai has no grammatical gender)",
        "1pl_we":"i = subject prefix with verb; eite = emphatic/object; kote = inclusive formal",
        "2pl_you":"note = plural you (all); nang = singular you",
    }

    results = defaultdict(list)
    seen = defaultdict(set)
    for src_type, version, en, zo in (bible + master + wiki):
        if len(en) > 120: continue
        for label, (pat, hints) in patterns.items():
            if len(results[label]) >= 4: continue
            if re.search(pat, en, re.IGNORECASE):
                for hint in hints:
                    if hint in zo.lower() and zo[:40] not in seen[label]:
                        seen[label].add(zo[:40])
                        results[label].append((version, en[:65], zo[:65]))
                        break

    out = WIKI / "pronouns_complete.md"
    lines = [
        "# Zolai Complete Pronoun Reference\n\n",
        "> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md\n\n",
        "## Pronoun Table\n\n",
        "| Person | English | Zolai | Notes |\n",
        "|---|---|---|---|\n",
    ]
    for label, (person, en_form) in display.items():
        zo = canonical.get(label,"?")
        note = notes.get(label,"")
        lines.append(f"| {person} | {en_form} | `{zo}` | {note} |\n")

    lines.append("\n## Corpus Examples\n\n")
    for label, exs in results.items():
        if not exs: continue
        _, en_form = display.get(label,(label,label))
        lines.append(f"### {en_form}\n\n")
        for ver, en, zo in exs[:3]:
            lines.append(f"- `[{ver}]` *{en}* → **{zo}**\n")
        lines.append("\n")

    out.write_text("".join(lines))
    print(f"Written: {out} ({sum(len(v) for v in results.values())} examples from {len(results)} categories)")


def learn_verbs(bible, master, wiki):
    verbs = {
        "go/went":      r"\bgo\b|\bwent\b|\bgone\b",
        "come/came":    r"\bcome\b|\bcame\b",
        "say/said":     r"\bsay\b|\bsaid\b",
        "give/gave":    r"\bgive\b|\bgave\b|\bgiven\b",
        "take/took":    r"\btake\b|\btook\b|\btaken\b",
        "see/saw":      r"\bsee\b|\bsaw\b|\bseen\b",
        "know/knew":    r"\bknow\b|\bknew\b|\bknown\b",
        "love/loved":   r"\blove\b|\bloved\b",
        "eat/ate":      r"\beat\b|\bate\b|\beaten\b",
        "drink/drank":  r"\bdrink\b|\bdrank\b|\bdrunk\b",
        "hear/heard":   r"\bhear\b|\bheard\b",
        "speak/spoke":  r"\bspeak\b|\bspoke\b|\bspoken\b",
        "do/did":       r"\bdo\b|\bdid\b|\bdone\b",
        "make/made":    r"\bmake\b|\bmade\b",
        "send/sent":    r"\bsend\b|\bsent\b",
        "bring/brought":r"\bbring\b|\bbrought\b",
        "return":       r"\breturn\b|\breturned\b",
        "die/died":     r"\bdie\b|\bdied\b|\bdead\b",
        "live/lived":   r"\blive\b|\blived\b",
        "fear/feared":  r"\bfear\b|\bfeared\b",
        "pray/prayed":  r"\bpray\b|\bprayed\b",
        "worship":      r"\bworship\b|\bworshipped\b",
        "believe":      r"\bbelieve\b|\bbelieved\b",
        "ask/asked":    r"\bask\b|\basked\b",
        "answer":       r"\banswer\b|\banswered\b",
    }
    results = defaultdict(list)
    seen = defaultdict(set)
    for src_type, version, en, zo in (bible + master + wiki):
        if len(en) > 100: continue
        for verb, pat in verbs.items():
            if len(results[verb]) >= 5: continue
            if re.search(pat, en, re.IGNORECASE) and zo[:40] not in seen[verb]:
                seen[verb].add(zo[:40])
                results[verb].append((version, en[:65], zo[:65]))

    out = WIKI / "verbs_corpus.md"
    lines = [
        "# Zolai Verb Reference — Corpus Verified\n\n",
        "> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md\n\n",
    ]
    for verb, examples in results.items():
        lines.append(f"## {verb}\n\n")
        for ver, en, zo in examples[:4]:
            lines.append(f"- `[{ver}]` *{en}* → **{zo}**\n")
        lines.append("\n")
    out.write_text("".join(lines))
    print(f"Written: {out} ({len(results)} verbs, {sum(len(v) for v in results.values())} examples)")


def make_topic(topic_name, word_map, output_file):
    """Generic topic learner — searches EN patterns, collects ZO examples."""
    def learn(bible, master, wiki):
        results = defaultdict(list)
        seen = defaultdict(set)
        for src_type, version, en, zo in (bible + master + wiki):
            if len(en) > 120: continue
            for label, pat in word_map.items():
                if len(results[label]) >= 8: continue
                if re.search(pat, en, re.IGNORECASE) and zo[:40] not in seen[label]:
                    seen[label].add(zo[:40])
                    results[label].append((version, en[:70], zo[:70]))
        out = WIKI / output_file
        lines = [f"# Zolai {topic_name} Reference — Corpus Verified\n\n",
                 "> Sources: Bible (TDB77+TBR17+Tedim2010) + master_source_v1.jsonl + wiki/grammar/*.md\n\n"]
        for label, examples in results.items():
            lines.append(f"## {label}\n\n")
            for ver, en, zo in examples[:4]:
                lines.append(f"- `[{ver}]` *{en}* → **{zo}**\n")
            lines.append("\n")
        out.write_text("".join(lines))
        print(f"Written: {out} ({len(results)} entries, {sum(len(v) for v in results.values())} examples)")
    return learn


learn_tense = make_topic("Tense Markers", {
    "future (will/shall)":  r"\bwill\b|\bshall\b",
    "past (did/was/were)":  r"\bdid\b|\bwas\b|\bwere\b",
    "perfect (has/have had)":r"\bhas\b|\bhave\b|\bhad\b",
    "already/completed":    r"\balready\b|\bhath\b",
    "not yet":              r"\bnot yet\b|\bnever\b",
    "continuous (-ing)":    r"\b\w+ing\b",
}, "tense_markers_corpus.md")

learn_particles = make_topic("Particles & Conjunctions", {
    "and":          r"\band\b",
    "but":          r"\bbut\b",
    "because":      r"\bbecause\b|\bfor\b",
    "therefore":    r"\btherefore\b|\bso\b",
    "if":           r"\bif\b",
    "when":         r"\bwhen\b",
    "until":        r"\buntil\b|\btill\b",
    "although":     r"\balthough\b|\bthough\b",
    "then":         r"\bthen\b",
    "also/too":     r"\balso\b|\btoo\b",
}, "particles_corpus.md")

learn_negation = make_topic("Negation", {
    "not (verb neg)":   r"\bnot\b|\bno\b",
    "never":            r"\bnever\b",
    "neither/nor":      r"\bneither\b|\bnor\b",
    "do not":           r"\bdo not\b|\bdoth not\b|\bdid not\b",
    "shall not":        r"\bshall not\b|\bwill not\b",
    "cannot":           r"\bcannot\b|\bcan not\b",
    "without":          r"\bwithout\b",
}, "negation_corpus.md")

learn_questions = make_topic("Question Words", {
    "who":      r"\bwho\b",
    "what":     r"\bwhat\b",
    "where":    r"\bwhere\b",
    "when":     r"\bwhen\b",
    "why":      r"\bwhy\b",
    "how":      r"\bhow\b",
    "which":    r"\bwhich\b",
    "how many": r"\bhow many\b|\bhow much\b",
}, "questions_corpus.md")

learn_directional = make_topic("Directional Particles", {
    "come (toward)":    r"\bcome\b|\bcame\b",
    "go (away)":        r"\bgo\b|\bwent\b",
    "bring (toward)":   r"\bbring\b|\bbrought\b",
    "take (away)":      r"\btake\b|\btook\b",
    "send":             r"\bsend\b|\bsent\b",
    "return/come back": r"\breturn\b|\bcome back\b",
    "go up":            r"\bgo up\b|\bwent up\b|\bascend\b",
    "go down":          r"\bgo down\b|\bwent down\b|\bdescend\b",
    "go out":           r"\bgo out\b|\bwent out\b|\bcome out\b",
    "go in/enter":      r"\bgo in\b|\benter\b|\bcame in\b",
}, "directional_particles_corpus.md")

learn_numbers = make_topic("Numbers", {
    "one":      r"\bone\b|\bfirst\b",
    "two":      r"\btwo\b|\bsecond\b",
    "three":    r"\bthree\b|\bthird\b",
    "four":     r"\bfour\b|\bfourth\b",
    "five":     r"\bfive\b|\bfifth\b",
    "seven":    r"\bseven\b|\bseventh\b",
    "ten":      r"\bten\b|\btenth\b",
    "twelve":   r"\btwelve\b",
    "hundred":  r"\bhundred\b",
    "thousand": r"\bthousand\b",
}, "numbers_corpus.md")

learn_body = make_topic("Body Parts", {
    "head":     r"\bhead\b",
    "hand":     r"\bhand\b|\bhands\b",
    "foot/feet":r"\bfoot\b|\bfeet\b",
    "eye":      r"\beye\b|\beyes\b",
    "ear":      r"\bear\b|\bears\b",
    "mouth":    r"\bmouth\b",
    "heart":    r"\bheart\b",
    "face":     r"\bface\b",
    "arm":      r"\barm\b|\barms\b",
    "blood":    r"\bblood\b",
}, "body_parts_corpus.md")

learn_time = make_topic("Time Expressions", {
    "day":      r"\bday\b|\bdays\b",
    "night":    r"\bnight\b",
    "morning":  r"\bmorning\b",
    "evening":  r"\bevening\b",
    "year":     r"\byear\b|\byears\b",
    "month":    r"\bmonth\b|\bmonths\b",
    "now":      r"\bnow\b",
    "today":    r"\btoday\b",
    "tomorrow": r"\btomorrow\b",
    "always":   r"\balways\b|\bforever\b",
}, "time_expressions_corpus.md")

learn_prepositions = make_topic("Prepositions & Postpositions", {
    "in/inside":    r"\bin\b|\binside\b",
    "on/upon":      r"\bon\b|\bupon\b",
    "at":           r"\bat\b",
    "from":         r"\bfrom\b",
    "to/toward":    r"\bto\b|\btoward\b|\bunto\b",
    "with":         r"\bwith\b",
    "by/through":   r"\bby\b|\bthrough\b",
    "for":          r"\bfor\b",
    "of":           r"\bof\b",
    "before":       r"\bbefore\b",
    "after":        r"\bafter\b",
    "against":      r"\bagainst\b",
}, "prepositions_corpus.md")

learn_adjectives = make_topic("Common Adjectives", {
    "good":     r"\bgood\b",
    "great":    r"\bgreat\b",
    "holy":     r"\bholy\b",
    "righteous":r"\brighteous\b|\bright\b",
    "evil":     r"\bevil\b",
    "strong":   r"\bstrong\b",
    "small":    r"\bsmall\b|\blittle\b",
    "many":     r"\bmany\b|\bmuch\b",
    "all":      r"\ball\b",
    "new":      r"\bnew\b",
    "old":      r"\bold\b",
    "first":    r"\bfirst\b",
    "last":     r"\blast\b",
}, "adjectives_corpus.md")


TOPICS = {
    "pronouns":    learn_pronouns,
    "verbs":       learn_verbs,
    "tense":       learn_tense,
    "particles":   learn_particles,
    "negation":    learn_negation,
    "questions":   learn_questions,
    "directional": learn_directional,
    "numbers":     learn_numbers,
    "body_parts":  learn_body,
    "time":        learn_time,
    "prepositions":learn_prepositions,
    "adjectives":  learn_adjectives,
}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", default="all", help=f"Topic: {list(TOPICS.keys())} or 'all'")
    parser.add_argument("--search", help="Free search any English word across all sources")
    parser.add_argument("--max-bible", type=int, default=None)
    parser.add_argument("--max-master", type=int, default=200000)
    args = parser.parse_args()

    if args.search:
        search_all(args.search)
    else:
        print("Loading Bible pairs...")
        bible = load_bible_pairs(max_per_file=args.max_bible)
        print(f"  {len(bible):,} pairs")
        print("Loading master_source pairs...")
        master = load_master_pairs(
            sources=None,  # ALL sources with English
            max_total=args.max_master
        )
        print(f"  {len(master):,} pairs")
        print("Loading wiki MD pairs...")
        wiki = load_wiki_md_pairs()
        print(f"  {len(wiki):,} pairs")

        topics = TOPICS if args.topic == "all" else {args.topic: TOPICS[args.topic]}
        for name, fn in topics.items():
            print(f"\n=== Learning: {name} ===")
            fn(bible, master, wiki)
