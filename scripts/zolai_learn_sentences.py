#!/usr/bin/env python3
"""
Zolai Multi-Agent Deep Learning
Sources: Bible corpus, Sinna, Gelhmaan Bu, Gentehna, wiki grammar files
Agents: 5 specialists discuss each sentence in multiple rounds.
"""
import asyncio
import json
import random
import os
from pathlib import Path

try:
    from gemini_webapi import GeminiClient, set_log_level
    set_log_level("WARNING")
except ImportError:
    raise SystemExit("pip install gemini_webapi")

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

ROOT = Path(__file__).parent.parent

# ── 5 Agent personas ──────────────────────────────────────────────────────────
AGENTS = {
    "linguistic-specialist": (
        "You are a Tedim Zolai linguistic specialist (ZVS 2018). "
        "Analyze morphology, ergative 'in', directional 'hong', SOV structure, and ZVS compliance. "
        "Reference specific rules from Zolai Sinna Bu when relevant."
    ),
    "grammar-checker": (
        "You are a strict Tedim Zolai grammar checker. "
        "Check: (1) ergative 'in' on transitive subjects, (2) 'hong' for 3rd-person→speaker direction, "
        "(3) 'kei' vs 'lo' negation, (4) compound spelling (nasep/leitung/nading), "
        "(5) no 'uh' with 'i'. Flag errors precisely or confirm correctness."
    ),
    "zolai-learner": (
        "You are an eager Zolai language learner. Ask ONE specific question about this sentence "
        "— about a particle, word choice, or cultural meaning you want to understand better."
    ),
    "cultural-context": (
        "You are a Zomi cultural expert. Explain the cultural, biblical, or social context "
        "of this sentence. How is it used in Zomi community life, church, or literature?"
    ),
    "translation-expert": (
        "You are a Zolai↔English translation expert. Give the most natural English translation, "
        "then explain any translation challenges — words that don't map directly, "
        "or nuances lost in translation."
    ),
}

# ── Sentence sources ──────────────────────────────────────────────────────────

CURATED = [
    # Sinna Bu examples
    ("Ka nu'n hong it hi.", "Sinna 33 — apostrophe contraction"),
    ("Thangpi, Lunsen le Lian Pau pilpen uh hi.", "Sinna 33 — comma/list rule"),
    ("Ka pai kei hi.", "Sinna — negation kei"),
    ("Nek-na dawn-na a om hi.", "Sinna 29 — word pairs"),
    ("Ki-it uh hi.", "Sinna 25 — ki- reciprocal"),
    ("Gen-khia in.", "Sinna 26 — -khia suffix"),
    ("Deih-sak in.", "Sinna 26 — -sak causative"),
    # Gentehna / faith sentences
    ("Pasian in eite hong it hi.", "Gentehna / 1 John 4:10 — God loves us"),
    ("Ka Pa in kei hong it hi.", "Gentehna / John 10:17 — My Father loves me"),
    ("Pasian ka it hi.", "Gentehna — I love God"),
    ("Topa in na hong khen hi.", "Gentehna — The Lord will judge you"),
    ("Kumpipa gam a lian hi.", "Gentehna — The king's country is great"),
    ("Leitung a pha hi.", "Gentehna — The world is good"),
    # Ergative contractions
    ("Ken ka laibu sim hi.", "Ergative — Ken (Kei+in) I read the book"),
    ("Nan na pai hi.", "Ergative — Nan (na'ng+in) you go"),
    ("Aman a sim hi.", "Ergative — Aman (Ama+in) he reads"),
    ("Eiten i sim hi.", "Ergative — Eiten (Eite+in) we read"),
    # Directional hong
    ("Amah in kei hong sawl hi.", "Directional — He sent me"),
    ("Pasian in kei hong pia hi.", "Directional — God gives to me"),
    # Bible
    ("A kipat cilin Pasian in vantung leh leitung a piangsak hi.", "Bible — Genesis 1:1"),
    ("Leitung in limlemeel neiloin a awngthawlpi ahi hi.", "Bible — Genesis 1:2"),
    ("Pasian in leitung a piangsak hi.", "Bible — creation"),
]

def load_bible_sentences(n: int = 15) -> list[tuple[str, str]]:
    corpus = ROOT / "data/corpus/corpus_unified_v1.jsonl"
    if not corpus.exists():
        return []
    lines = corpus.read_text(encoding="utf-8").splitlines()
    random.shuffle(lines)
    results = []
    for line in lines:
        try:
            obj = json.loads(line)
            text = obj.get("text", "").strip()
            if 15 < len(text) < 150:
                results.append((text, "Bible corpus"))
                if len(results) >= n:
                    break
        except Exception:
            continue
    return results

def load_wiki_sentences(n: int = 10) -> list[tuple[str, str]]:
    """Extract example sentences from wiki grammar files."""
    results = []
    grammar_dir = ROOT / "wiki/grammar"
    for md_file in grammar_dir.glob("*.md"):
        text = md_file.read_text(encoding="utf-8", errors="ignore")
        for line in text.splitlines():
            # Extract quoted Zolai sentences from markdown tables/examples
            if "|" in line:
                parts = [p.strip() for p in line.split("|")]
                for part in parts:
                    part = part.strip("*`_ ")
                    if (15 < len(part) < 120 and
                        any(w in part for w in ["hi", "uh", "hi.", "in ", "ka ", "a "]) and
                        not part.startswith("#") and
                        not part.startswith("---")):
                        results.append((part, f"wiki/{md_file.name}"))
                        break
            if len(results) >= n * 3:
                break
        if len(results) >= n * 3:
            break
    # Filter to plausible Zolai sentences
    filtered = [(s, src) for s, src in results
                if any(c.islower() for c in s) and len(s.split()) >= 3]
    random.shuffle(filtered)
    return filtered[:n]


# ── Discussion engine ─────────────────────────────────────────────────────────

async def ask(client: GeminiClient, prompt: str) -> str:
    try:
        resp = await client.generate_content(prompt, temporary=True)
        return resp.text.strip()
    except Exception as e:
        return f"[error: {e}]"

async def get_gloss(client: GeminiClient, sentence: str) -> tuple[str, dict]:
    raw = await ask(client,
        f'Translate to English and give word-by-word gloss for this Tedim Zolai sentence.\n'
        f'Sentence: "{sentence}"\n'
        f'Return JSON only: {{"english":"...","gloss":{{"word":"meaning"}}}}'
    )
    try:
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0].replace("json","").strip()
        start, end = raw.find("{"), raw.rfind("}") + 1
        data = json.loads(raw[start:end])
        return data.get("english", "?"), data.get("gloss", {})
    except Exception:
        return "?", {}

async def discuss(client: GeminiClient, sentence: str, source: str, english: str, gloss: dict) -> dict:
    """Round 1: all agents respond. Round 2: agents respond to each other."""
    gloss_str = " | ".join(f"{k}={v}" for k, v in list(gloss.items())[:8])
    context = f'Sentence: "{sentence}"\nEnglish: "{english}"\nGloss: {gloss_str}\nSource: {source}'

    # Round 1 — independent analysis
    round1 = {}
    for agent, role in AGENTS.items():
        reply = await ask(client,
            f"{role}\n\n{context}\n\nRespond in 2-3 sentences. Be specific to this sentence."
        )
        round1[agent] = reply

    # Round 2 — cross-agent discussion (3 agents respond to round 1 summary)
    r1_summary = "\n".join(f"[{a}]: {r[:200]}" for a, r in round1.items())
    round2 = {}
    for agent in ["linguistic-specialist", "grammar-checker", "zolai-learner"]:
        reply = await ask(client,
            f"{AGENTS[agent]}\n\n{context}\n\n"
            f"Other agents said:\n{r1_summary}\n\n"
            f"Add one new insight or correct something from the above. 2 sentences max."
        )
        round2[agent] = reply

    return {"round1": round1, "round2": round2}


async def process_sentence(client: GeminiClient, sentence: str, source: str, idx: int, total: int) -> dict:
    print(f"\n{'='*65}")
    print(f"[{idx}/{total}] 📖 {sentence}")
    print(f"         Source: {source}")

    english, gloss = await get_gloss(client, sentence)
    print(f"         EN: {english}")
    if gloss:
        print(f"         Gloss: {' | '.join(f'{k}={v}' for k,v in list(gloss.items())[:6])}")

    discussion = await discuss(client, sentence, source, english, gloss)

    print("\n  — Round 1 —")
    for agent, reply in discussion["round1"].items():
        print(f"  🤖 [{agent}]\n     {reply[:300]}\n")

    print("  — Round 2 (cross-discussion) —")
    for agent, reply in discussion["round2"].items():
        print(f"  🔄 [{agent}]\n     {reply[:200]}\n")

    return {
        "sentence": sentence,
        "english": english,
        "gloss": gloss,
        "source": source,
        "discussion": discussion,
    }


async def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--n", type=int, default=20, help="Number of sentences per session")
    parser.add_argument("--bible-only", action="store_true")
    parser.add_argument("--curated-only", action="store_true")
    args = parser.parse_args()

    psid = os.getenv("GEMINI_PSID")
    if not psid:
        raise SystemExit("Set GEMINI_PSID in .env")

    client = GeminiClient(psid, os.getenv("GEMINI_PSIDTS", ""))
    await client.init(timeout=30, auto_close=True, close_delay=300, auto_refresh=True)

    # Build sentence pool
    pool: list[tuple[str, str]] = []
    if not args.bible_only:
        pool.extend(CURATED)
        pool.extend(load_wiki_sentences(15))
    if not args.curated_only:
        pool.extend(load_bible_sentences(20))

    random.shuffle(pool)
    pool = pool[:args.n]

    results = []
    for i, (sentence, source) in enumerate(pool, 1):
        result = await process_sentence(client, sentence, source, i, len(pool))
        results.append(result)

    # Save with timestamp
    from datetime import datetime
    ts = datetime.now().strftime("%Y%m%d_%H%M")
    out = ROOT / f"data/logs/learning_{ts}.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    # Also append to master log
    master = ROOT / "data/logs/sentence_learning.jsonl"
    with open(master, "a", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")

    print(f"\n✅ {len(results)} discussions saved → {out}")
    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
