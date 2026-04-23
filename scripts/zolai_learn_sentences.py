#!/usr/bin/env python3
"""
Zolai Multi-Agent Sentence Learning
Sources: Bible corpus, Sinna rules, Gelhmaan Bu patterns, Gentehna examples
Agents: linguistic-specialist, grammar-checker, zolai-learner discuss each sentence.
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

# ── Agent personas ────────────────────────────────────────────────────────────
AGENTS = {
    "linguistic-specialist": (
        "You are a Tedim Zolai linguistic specialist (ZVS 2018). "
        "Analyze sentence structure, morphology, and ZVS compliance. Be precise and technical."
    ),
    "grammar-checker": (
        "You are a Tedim Zolai grammar checker. "
        "Focus on SOV order, particles (in/hong/ka/uh), negation (kei/lo), and compound spelling. "
        "Point out errors clearly."
    ),
    "zolai-learner": (
        "You are a Zolai language learner. Ask one clarifying question about the sentence "
        "to deepen understanding — about meaning, usage, or cultural context."
    ),
}

DISCUSSION_PROMPT = """Sentence: "{sentence}"
English gloss: "{gloss}"
Source: {source}

{agent_role}

Respond in 2-3 sentences max. Be specific to THIS sentence."""

GLOSS_PROMPT = """Translate this Tedim Zolai sentence to English and give a word-by-word gloss.
Sentence: "{sentence}"
Return JSON only: {{"english": "...", "gloss": {{"word": "meaning"}}}}"""

# ── Sentence sources ──────────────────────────────────────────────────────────

SINNA_EXAMPLES = [
    ("Ka nu'n hong it hi.", "My mother loves me.", "Sinna 33 — apostrophe contraction"),
    ("Thangpi, Lunsen le Lian Pau pilpen uh hi.", "Thangpi, Lunsen and Lian Pau are wise.", "Sinna 33 — comma rule"),
    ("Pasian in leitung a piangsak hi.", "God created the world.", "Sinna — basic sentence"),
    ("Ka pai kei hi.", "I will not go.", "Sinna — negation with kei"),
    ("Nek-na dawn-na a om hi.", "There is food and drink.", "Sinna 29 — word pairs"),
    ("Ki-it uh hi.", "They love one another.", "Sinna 25 — ki- reciprocal"),
    ("Gen-khia in.", "Speak out.", "Sinna 26 — -khia suffix"),
]

GENTEHNA_EXAMPLES = [
    ("Pasian in hong it hi.", "God loves me.", "Gentehna — basic faith"),
    ("Ka Pasian it hi.", "I love God.", "Gentehna — devotion"),
    ("Leitung a pha hi.", "The world is good.", "Gentehna — creation"),
    ("Topa in na hong khen hi.", "The Lord will judge you.", "Gentehna — judgment"),
    ("Kumpipa gam a lian hi.", "The king's country is great.", "Gentehna — kingdom"),
]

def load_bible_sentences(n: int = 20) -> list[tuple[str, str]]:
    """Load n random sentences from Bible corpus."""
    corpus = Path(__file__).parent.parent / "data/corpus/corpus_unified_v1.jsonl"
    if not corpus.exists():
        return []
    lines = corpus.read_text(encoding="utf-8").splitlines()
    sample = random.sample(lines, min(n * 3, len(lines)))
    results = []
    for line in sample:
        try:
            obj = json.loads(line)
            text = obj.get("text", "").strip()
            if 10 < len(text) < 200 and "Pasian" in text or "leitung" in text or "topa" in text.lower():
                results.append((text, "Bible corpus"))
                if len(results) >= n:
                    break
        except Exception:
            continue
    return results


# ── Multi-agent discussion ────────────────────────────────────────────────────

async def get_gloss(client: GeminiClient, sentence: str) -> dict:
    try:
        resp = await client.generate_content(GLOSS_PROMPT.format(sentence=sentence), temporary=True)
        raw = resp.text.strip()
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0].replace("json", "").strip()
        return json.loads(raw)
    except Exception:
        return {"english": "?", "gloss": {}}


async def agent_respond(client: GeminiClient, agent: str, role: str, sentence: str, gloss: str, source: str) -> str:
    prompt = DISCUSSION_PROMPT.format(
        sentence=sentence, gloss=gloss, source=source, agent_role=role
    )
    try:
        resp = await client.generate_content(prompt, temporary=True)
        return resp.text.strip()
    except Exception as e:
        return f"[error: {e}]"


async def discuss_sentence(client: GeminiClient, sentence: str, source: str) -> dict:
    print(f"\n{'='*60}")
    print(f"📖 {sentence}")
    print(f"   Source: {source}")

    gloss_data = await get_gloss(client, sentence)
    english = gloss_data.get("english", "?")
    print(f"   EN: {english}")

    responses = {}
    for agent, role in AGENTS.items():
        print(f"\n🤖 [{agent}]")
        reply = await agent_respond(client, agent, role, sentence, english, source)
        print(f"   {reply}")
        responses[agent] = reply

    return {
        "sentence": sentence,
        "english": english,
        "gloss": gloss_data.get("gloss", {}),
        "source": source,
        "discussion": responses,
    }


async def main():
    psid = os.getenv("GEMINI_PSID")
    psidts = os.getenv("GEMINI_PSIDTS", "")
    if not psid:
        raise SystemExit("Set GEMINI_PSID in .env")

    client = GeminiClient(psid, psidts)
    await client.init(timeout=30, auto_close=True, close_delay=300, auto_refresh=True)

    # Build sentence list
    sentences: list[tuple[str, str]] = []
    for text, en, src in SINNA_EXAMPLES:
        sentences.append((text, src))
    for text, en, src in GENTEHNA_EXAMPLES:
        sentences.append((text, src))
    bible = load_bible_sentences(10)
    sentences.extend(bible)

    random.shuffle(sentences)
    sentences = sentences[:15]  # limit per session

    results = []
    for sentence, source in sentences:
        result = await discuss_sentence(client, sentence, source)
        results.append(result)

    # Save
    out = Path(__file__).parent.parent / "data/logs/sentence_learning.jsonl"
    out.parent.mkdir(parents=True, exist_ok=True)
    with open(out, "a", encoding="utf-8") as f:
        for r in results:
            f.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"\n✅ Saved {len(results)} discussions → {out}")

    await client.close()


if __name__ == "__main__":
    asyncio.run(main())
