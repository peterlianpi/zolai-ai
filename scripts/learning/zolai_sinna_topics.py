#!/usr/bin/env python3
"""
Zolai Sinna Topic-by-Topic Deep Learning
Covers every topic in Zolai Sinna Bu (2010) with multi-agent discussion.
"""
import asyncio
import json
import os
from pathlib import Path
from datetime import datetime

try:
    from gemini_webapi import GeminiClient, set_log_level
    set_log_level("WARNING")
except ImportError:
    raise SystemExit("pip install gemini_webapi")

try:
    from dotenv import load_dotenv
    for _p in [Path(__file__).parent.parent / ".env",
               Path(__file__).parent.parent / "config/env/.env"]:
        if _p.exists():
            load_dotenv(_p); break
except ImportError:
    pass

ROOT = Path(__file__).parent.parent

# ── All Sinna topics with examples ───────────────────────────────────────────
SINNA_TOPICS = [
    {
        "id": "sinna_01_phonology_ti",
        "title": "Sinna 1 — Phonology: No 'ti' cluster",
        "rule": "'ti' cluster does not exist in Zolai. Use 'thi' or restructure.",
        "examples": ["thi hi (correct)", "ti hi (WRONG — use thi)", "a thi hi (he died)"],
        "sentences": ["A thi hi.", "Thi-na a om hi.", "Na thi kei ding."],
    },
    {
        "id": "sinna_01_c_restriction",
        "title": "Sinna 1 — Phonology: 'c' restrictions",
        "rule": "'c' cannot combine with a, e, o, aw. Valid: ci, cih, cim, cin, cing, ciang.",
        "examples": ["ci (correct)", "ca (WRONG)", "ciang (correct)", "caw (WRONG)"],
        "sentences": ["Ka ci hi.", "Ciang in a om hi.", "A cin hi."],
    },
    {
        "id": "sinna_01_o_pronunciation",
        "title": "Sinna 1 — Phonology: 'o' = /oʊ/ diphthong",
        "rule": "'o' is always /oʊ/ (diphthong), never pure /o/.",
        "examples": ["om (exist) = /oʊm/", "topa = /toʊpa/", "zo = /zoʊ/"],
        "sentences": ["A om hi.", "Topa in a gen hi.", "Zo pau a pha hi."],
    },
    {
        "id": "sinna_22_compound_writing",
        "title": "Sinna 22 — Compound words written as one unit",
        "rule": "Compound syllables merge: sa+khi=Sakhi, to+pa=Topa, pa+sian=Pasian, lei+tung=Leitung.",
        "examples": ["Pasian (correct)", "Pa Sian (WRONG)", "Leitung (correct)", "Lei Tung (WRONG)"],
        "sentences": ["Pasian in leitung a piangsak hi.", "Leitung a pha hi.", "Topa in a gen hi."],
    },
    {
        "id": "sinna_25_ki_prefix",
        "title": "Sinna 25 — Prefix 'ki-' (Reflexive/Reciprocal)",
        "rule": "'ki-' marks reflexive or reciprocal action.",
        "examples": ["kiit (love one another)", "kideih (love each other)", "kimawl (play together)"],
        "sentences": ["Kiit uh hi.", "Eite kideih ding hi.", "Naute te kimawl uh hi."],
    },
    {
        "id": "sinna_26_sak_causative",
        "title": "Sinna 26 — Suffix '-sak' (Causative)",
        "rule": "'-sak' makes a verb causative: cause someone to do X.",
        "examples": ["deihsak (make lovable)", "phasak (make good)", "samsak (cause to call)"],
        "sentences": ["A phasak hi.", "Pasian in leitung a phasak hi.", "Ka samsak hi."],
    },
    {
        "id": "sinna_26_khia_directional",
        "title": "Sinna 26 — Suffix '-khia' (Away/Out)",
        "rule": "'-khia' indicates movement away or outward completion.",
        "examples": ["genkhia (speak out)", "honkhia (bring out)", "hawlkhia (drive out)"],
        "sentences": ["Genkhia in.", "A honkhia hi.", "Amah in hawlkhia hi."],
    },
    {
        "id": "sinna_29_word_pairs",
        "title": "Sinna 29 — Word Pairs (Kamkop)",
        "rule": "Zolai uses paired words for completeness. 'le' pairs, 'a' pairs, 'na' pairs.",
        "examples": [
            "beh le phung (custom and tradition)",
            "khua le tui (village and water = homeland)",
            "dam le nat (health and sickness)",
            "nek-na dawn-na (food and drink)",
            "a neu a lian (small and great)",
        ],
        "sentences": [
            "Khua le tui ka ngai hi.",
            "Nek-na dawn-na a om hi.",
            "Dam le nat a om hi.",
            "A neu a lian te omkhawm uh hi.",
        ],
    },
    {
        "id": "sinna_33_apostrophe",
        "title": "Sinna 33 — Apostrophe (Tanglak): contraction only",
        "rule": "Apostrophe marks contraction (nu+in=nu'n), NOT possession.",
        "examples": ["Ka nu'n hong it hi. (nu+in contraction)", "Ka pu' (glottal stop, not possessive)"],
        "sentences": ["Ka nu'n hong it hi.", "Ka pa'n a gen hi.", "Aman a gen hi."],
    },
    {
        "id": "sinna_33_comma_le",
        "title": "Sinna 33 — No comma after 'le' (and)",
        "rule": "Do NOT place comma after 'le'. Comma goes before 'le' only in lists.",
        "examples": [
            "WRONG: Thangpi, Lunsen, le, Lian Pau",
            "CORRECT: Thangpi, Lunsen le Lian Pau",
        ],
        "sentences": [
            "Thangpi, Lunsen le Lian Pau pilpen uh hi.",
            "Ka nu le ka pa om uh hi.",
            "Pasian le eite ki-it ding hi.",
        ],
    },
    {
        "id": "sinna_proverbs",
        "title": "Sinna — Proverbs (Paunak)",
        "rule": "Short parallel structure, often animal metaphors. Teach wisdom.",
        "examples": [
            "Buipi leikei zong khua ngai — Even the big rat misses home",
            "Deklam tuktum zong galsuak — Even the slow tortoise reaches the battlefield",
            "Hakai pahtak lung heeng — A forgiving heart heals quickly",
            "Khaikha a gui ah gah — Fruit falls in the tree's shadow",
            "Sialtat nung a sialdai kai — Young bull follows old bull",
        ],
        "sentences": [
            "Buipi leikei zong khua ngai.",
            "Deklam tuktum zong galsuak.",
            "Hakai pahtak lung heeng.",
        ],
    },
    {
        "id": "sinna_similes",
        "title": "Sinna — Similes (Tehpih Kam): X bang",
        "rule": "'X bang' = like X. Always ends with 'bang'.",
        "examples": [
            "Vot si dawn bang (like a leech that won't release)",
            "Baakvat bang (like a bat — ambiguous identity)",
            "Pasan sialnek bang (like a tiger eating a deer)",
        ],
        "sentences": [
            "A it na vot si dawn bang hi.",
            "Baakvat bang a om hi.",
            "Pasan sialnek bang a hawl hi.",
        ],
    },
    {
        "id": "sinna_song_inversions",
        "title": "Sinna — Song Word Inversions (Lakam)",
        "rule": "Poetic register inverts syllables or adds prefix. Only in formal song/poetry.",
        "examples": [
            "sakhi → khisa (fish in song)",
            "vakhu → khuva",
            "nu → tun (mother in song)",
            "inn → saumang (house in song)",
        ],
        "sentences": [
            "Khisa a lam hi. (song: fish swims)",
            "Tun in hong it hi. (song: mother loves me)",
            "Saumang ah i om hi. (song: we are in the house)",
        ],
    },
    {
        "id": "sinna_ergative_in",
        "title": "Ergative Marker 'in' — Subject of transitive verb",
        "rule": "'in' marks the subject (agent) of a transitive verb. Merges with pronouns: Kei+in=Ken, Nang+in=Nangin, Ama+in=Aman.",
        "examples": [
            "Pasian in leitung a piangsak hi. (God created the world)",
            "Ken laibu ka sim hi. (I read a book)",
            "Nangin na pai hi. (You go)",
            "Aman a sim hi. (He reads)",
        ],
        "sentences": [
            "Pasian in leitung a piangsak hi.",
            "Ken laibu ka sim hi.",
            "Aman a gen hi.",
            "Eiten i pai hi.",
        ],
    },
    {
        "id": "sinna_directional_hong",
        "title": "Directional Particle 'hong' — toward speaker",
        "rule": "'hong' = action directed toward speaker. 3rd-person subject + hong + verb. Replaces 'ka' prefix.",
        "examples": [
            "Pasian in hong it hi. (God loves me/us)",
            "Ka nu'n hong it hi. (My mother loves me)",
            "Amah in kei hong sawl hi. (He sent me)",
            "Ka Pa in kei hong it hi. (My Father loves me — John 10:17)",
        ],
        "sentences": [
            "Pasian in hong it hi.",
            "Ka nu'n hong it hi.",
            "Amah in kei hong sawl hi.",
            "Topa in kei hong khen hi.",
        ],
    },
    {
        "id": "sinna_negation",
        "title": "Negation: 'kei' vs 'lo'",
        "rule": "'kei' for conditional/preference/future negation. 'lo' for simple present negation.",
        "examples": [
            "Ka pai kei hi. (I will not go — future/intent)",
            "A pha lo hi. (It is not good — simple negative)",
            "Ka it kei hi. (I don't want to — preference)",
            "A om lo hi. (It does not exist)",
        ],
        "sentences": [
            "Ka pai kei hi.",
            "A pha lo hi.",
            "A om lo hi.",
            "Ka it kei hi.",
        ],
    },
    {
        "id": "sinna_bible_genesis",
        "title": "Bible — Genesis 1:1 (Creation)",
        "rule": "Foundation sentence of Zolai Bible. Tests compound writing, ergative, SOV.",
        "examples": ["A kipat cilin Pasian in vantung leh leitung a piangsak hi."],
        "sentences": [
            "A kipat cilin Pasian in vantung leh leitung a piangsak hi.",
            "Leitung in limlemeel neiloin a awngthawlpi ahi hi.",
            "Pasian in leitung a piangsak hi.",
        ],
    },
    {
        "id": "sinna_plurality",
        "title": "Plurality: '-te' suffix and 'uh' restriction",
        "rule": "Plural suffix '-te'. NEVER use 'uh' with first-person inclusive 'i' (we).",
        "examples": [
            "Naute te ki-mawl uh hi. (The children play together — 3rd person OK)",
            "I pai hi. (We go — NOT 'I pai uh hi')",
            "Pilpen-te hi. (They are wise)",
        ],
        "sentences": [
            "Naute te ki-mawl uh hi.",
            "I pai hi.",
            "Pilpen-te hi.",
            "Eite i om hi.",
        ],
    },
]

# ── Agents ────────────────────────────────────────────────────────────────────
AGENTS = {
    "linguistic-specialist": (
        "You are a Tedim Zolai linguistic specialist (Zolai Standard + Zolai Sinna Bu). "
        "Analyze morphology, phonology, syntax, and Zolai Standard compliance for this topic."
    ),
    "grammar-checker": (
        "You are a strict Tedim Zolai grammar checker. "
        "For each example sentence, confirm correctness or flag specific errors. Be precise."
    ),
    "zolai-learner": (
        "You are an eager Zolai learner. Ask ONE specific question about this topic "
        "that would help a beginner understand when and how to apply this rule."
    ),
    "cultural-context": (
        "You are a Zomi cultural and literary expert. Explain how this grammatical feature "
        "appears in Zomi church life, literature, Bible translation, or daily speech."
    ),
    "translation-expert": (
        "You are a Zolai↔English translation expert. Show how this rule creates "
        "translation challenges or nuances that English cannot easily express."
    ),
}

TOPIC_PROMPT = """TOPIC: {title}

RULE: {rule}

EXAMPLES:
{examples}

SENTENCES TO ANALYZE:
{sentences}

{agent_role}

Respond in 3-4 sentences. Be specific to this topic and these sentences."""

CROSS_PROMPT = """TOPIC: {title}
RULE: {rule}

Other agents said:
{round1_summary}

{agent_role}

Add ONE new insight, correct an error, or give a concrete example not yet mentioned. 2-3 sentences."""


async def ask(client: GeminiClient, prompt: str) -> str:
    try:
        resp = await client.generate_content(prompt, temporary=True)
        return resp.text.strip()
    except Exception as e:
        return f"[error: {e}]"


async def discuss_topic(client: GeminiClient, topic: dict, idx: int, total: int) -> dict:
    print(f"\n{'='*70}")
    print(f"[{idx}/{total}] 📚 {topic['title']}")
    print(f"  Rule: {topic['rule']}")
    print(f"  Sentences: {' | '.join(topic['sentences'][:3])}")

    examples_str = "\n".join(f"  - {e}" for e in topic["examples"])
    sentences_str = "\n".join(f"  - {s}" for s in topic["sentences"])

    # Round 1 — independent
    round1 = {}
    for agent, role in AGENTS.items():
        reply = await ask(client, TOPIC_PROMPT.format(
            title=topic["title"], rule=topic["rule"],
            examples=examples_str, sentences=sentences_str,
            agent_role=role,
        ))
        round1[agent] = reply
        print(f"\n  🤖 [{agent}]\n  {reply[:350]}")

    # Round 2 — cross-discussion
    r1_summary = "\n".join(f"[{a}]: {r[:180]}" for a, r in round1.items())
    round2 = {}
    print("\n  — Cross-discussion —")
    for agent in ["linguistic-specialist", "grammar-checker", "zolai-learner"]:
        reply = await ask(client, CROSS_PROMPT.format(
            title=topic["title"], rule=topic["rule"],
            round1_summary=r1_summary, agent_role=AGENTS[agent],
        ))
        round2[agent] = reply
        print(f"\n  🔄 [{agent}]\n  {reply[:250]}")

    return {
        "topic_id": topic["id"],
        "title": topic["title"],
        "rule": topic["rule"],
        "examples": topic["examples"],
        "sentences": topic["sentences"],
        "discussion": {"round1": round1, "round2": round2},
    }


async def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--topic", help="Run specific topic ID (e.g. sinna_25_ki_prefix)")
    parser.add_argument("--from", dest="from_idx", type=int, default=0, help="Start from topic index")
    args = parser.parse_args()

    psid = os.getenv("GEMINI_PSID")
    if not psid:
        raise SystemExit("Set GEMINI_PSID in .env")

    client = GeminiClient(psid, os.getenv("GEMINI_PSIDTS", ""))
    await client.init(timeout=30, auto_close=True, close_delay=300, auto_refresh=True)

    topics = SINNA_TOPICS
    if args.topic:
        topics = [t for t in SINNA_TOPICS if t["id"] == args.topic]
        if not topics:
            raise SystemExit(f"Topic '{args.topic}' not found. IDs: {[t['id'] for t in SINNA_TOPICS]}")
    else:
        topics = topics[args.from_idx:]

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    out = ROOT / f"data/logs/sinna_topics_{ts}.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)

    results = []
    for i, topic in enumerate(topics, 1):
        result = await discuss_topic(client, topic, i + args.from_idx, len(SINNA_TOPICS))
        results.append(result)
        # Save incrementally
        with open(out, "a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

    print(f"\n✅ {len(results)} topics saved → {out}")
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
