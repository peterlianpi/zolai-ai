#!/usr/bin/env python3
"""Generate clean Zolai word lists by CEFR, topic, and POS."""
import json
from pathlib import Path
from collections import defaultdict

MASTER = "data/dictionary/processed/dict_master_v1.jsonl"
OUT    = Path("wiki/vocabulary/wordlists")
OUT.mkdir(parents=True, exist_ok=True)

def load():
    return [json.loads(l) for l in open(MASTER, encoding="utf-8")
            if json.loads(l).get("zolai") and json.loads(l).get("english")]

def clean(word):
    """Skip noise: proper nouns, apostrophe fragments, very short."""
    w = word.strip()
    if len(w) < 2: return False
    if w.endswith("'") or w.startswith("'"): return False
    if w[0].isupper(): return False  # proper noun
    return True

def fmt(e, show_example=False):
    zo = e["zolai"]
    en = e.get("english","")
    trans = e.get("translations",[])
    all_means = " | ".join(t for t in trans[:4] if t and t != en)
    line = f"{zo} — {en}"
    if all_means: line += f" ({all_means})"
    if show_example and e.get("examples"):
        ex = e["examples"][0]
        line += f"\n    → {ex.get('zo','')} / {ex.get('en','')}"
    return line

def main():
    import os; os.chdir(Path(__file__).parent.parent)
    entries = [e for e in load() if clean(e["zolai"])]

    cefr_order = {"A1":0,"A2":1,"B1":2,"B2":3,"C1":4,"C2":5,"":6}
    entries.sort(key=lambda e: (cefr_order.get(e.get("cefr",""),6), e["zolai"]))

    by_cefr = defaultdict(list)
    for e in entries:
        by_cefr[e.get("cefr","?")].append(e)

    # ── 1. CEFR word lists ─────────────────────────────────────────────────────
    for level in ["A1","A2","B1","B2","C1"]:
        words = by_cefr.get(level, [])
        lines = [f"# Zolai Word List — {level} ({len(words)} words)\n"]
        lines.append(f"> ZVS Tedim standard | Generated from dict_master_v1.jsonl\n\n")
        for e in words:
            lines.append(fmt(e, show_example=(level in ("A1","A2"))))
        (OUT / f"wordlist_{level}.md").write_text("\n".join(lines), encoding="utf-8")
        print(f"  wordlist_{level}.md — {len(words)} words")

    # ── 2. Simple flat list (just Zolai words, one per line) ──────────────────
    for level in ["A1","A2","B1"]:
        words = [e["zolai"] for e in by_cefr.get(level,[]) if clean(e["zolai"])]
        (OUT / f"flat_{level}.txt").write_text("\n".join(words), encoding="utf-8")

    # ── 3. Bilingual TSV (Zolai TAB English) ──────────────────────────────────
    tsv_lines = ["zolai\tenglish\ttranslations\tcefr\texample"]
    for e in entries:
        if not clean(e["zolai"]): continue
        trans = " | ".join(e.get("translations",[])[:4])
        ex = e["examples"][0]["zo"] if e.get("examples") else ""
        tsv_lines.append(f"{e['zolai']}\t{e.get('english','')}\t{trans}\t{e.get('cefr','')}\t{ex}")
    (OUT / "wordlist_bilingual.tsv").write_text("\n".join(tsv_lines), encoding="utf-8")
    print(f"  wordlist_bilingual.tsv — {len(tsv_lines)-1} words")

    # ── 4. Topic-based lists ───────────────────────────────────────────────────
    TOPICS = {
        "family":   ["nu","pa","tapa","tanu","ngakchia","innkuan","zi","pasal","pu","pi",
                     "nau","sanggam","tate","unau","unaute","nungak","mipa","numei"],
        "body":     ["pumpi","lu","mit","na","ka","khe","khut","lung","lungsim","muh",
                     "kham","kha","pum","kik","khe","bel","ngo","muk","sim"],
        "time":     ["ni","zan","zingsang","nitak","hun","kum","thla","tuni","sunin",
                     "zingsang","nitak","bei","tung","kipat","nitawp","kum","thla"],
        "nature":   ["leitung","vantung","tui","tuipi","gam","mual","khua","van","ni",
                     "zan","khuavak","khuamial","huih","khuabu","sing","kung","lei"],
        "emotions": ["lungdam","lungkham","lunggulh","lungnem","nuam","dah","lau",
                     "ngaihsun","deih","it","heh","kipak","lungduai","lamdang"],
        "verbs":    ["pai","hong","lut","suak","gen","ci","mu","ngai","nei","pia",
                     "bawl","sak","sim","zang","om","hi","that","nungta","dam","na"],
        "greetings":["lungdam","damdam","dam","kei","nang","ka","hong","pai","zingsang",
                     "nitak","tuni","lawmthu","lungdam mahmah"],
        "numbers":  ["khat","nih","thum","li","nga","guk","sagih","giat","kua","sawm",
                     "sawmkhat","sawmnih","zabi","za","sanggom"],
        "church":   ["pasian","biakinn","biak","thu","thukham","laibu","topa","kumpipa",
                     "vantung","kha","siangtho","mawhna","lungdam","pahtawi"],
        "school":   ["sanginn","pilna","sim","laibu","gelh","thu","pilna","zumh",
                     "theih","kisin","hilh","hilhna","thugenna","thusim"],
    }

    topic_lines = ["# Zolai Topic Word Lists\n"]
    master_map = {e["zolai"]: e for e in entries}

    for topic, words in TOPICS.items():
        topic_lines.append(f"\n## {topic.title()}\n")
        for w in words:
            e = master_map.get(w)
            if e:
                topic_lines.append(fmt(e))
            else:
                topic_lines.append(f"{w} — (not in dictionary)")

    (OUT / "wordlist_by_topic.md").write_text("\n".join(topic_lines), encoding="utf-8")
    print(f"  wordlist_by_topic.md — {len(TOPICS)} topics")

    # ── 5. Master summary ─────────────────────────────────────────────────────
    summary = ["# Zolai Complete Word List\n"]
    summary.append(f"> {len(entries)} words | ZVS Tedim standard\n\n")
    summary.append("| Zolai | English | Meanings | CEFR |\n")
    summary.append("|-------|---------|----------|------|\n")
    for e in entries:
        if not clean(e["zolai"]): continue
        trans = " / ".join(e.get("translations",[])[:3])
        summary.append(f"| {e['zolai']} | {e.get('english','')} | {trans} | {e.get('cefr','')} |")
    (OUT / "wordlist_master.md").write_text("\n".join(summary), encoding="utf-8")
    size_kb = (OUT / "wordlist_master.md").stat().st_size // 1024
    print(f"  wordlist_master.md — {size_kb} KB")

    print(f"\nAll word lists → {OUT}/")

if __name__ == "__main__":
    main()
