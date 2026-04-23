#!/usr/bin/env python3
"""
Generate enriched vocabulary wiki pages + master prompts + Google Sheets export.

Outputs:
  wiki/vocabulary/generated/vocab_<letter>.md  — per-letter vocab pages
  wiki/vocabulary/master_vocab_reference.md     — full master reference
  wiki/vocabulary/master_prompts.md             — prompts for AI generation
  data/exports/dict_master_export.csv           — Google Sheets ready
  data/exports/dict_master_export.tsv           — TSV alternative
"""

import json, csv, re
from pathlib import Path
from collections import defaultdict

MASTER = "data/dictionary/processed/dict_master_v1.jsonl"

def load_entries():
    entries = []
    for line in open(MASTER, encoding="utf-8"):
        try:
            e = json.loads(line)
            if e.get("zolai") and e.get("english"):
                entries.append(e)
        except: pass
    return entries


def format_entry_md(e):
    """Format one dictionary entry as markdown."""
    word    = e.get("zolai","")
    english = e.get("english","")
    trans   = e.get("translations",[])
    pos     = e.get("pos","")
    if isinstance(pos, list): pos = ", ".join(pos)
    syns    = e.get("synonyms",[])
    ants    = e.get("antonyms",[])
    related = e.get("related",[])
    usage   = e.get("usage_notes","")
    cefr    = e.get("cefr","")
    examples= e.get("examples",[])
    variants= e.get("variants",[])

    lines = [f"### {word}"]
    lines.append(f"**[{pos}]** {english}")

    if len(trans) > 1:
        lines.append(f"**Meanings:** {' | '.join(trans[:6])}")

    if variants:
        lines.append(f"**Variants:** {', '.join(str(v) for v in variants[:3])}")

    if syns:
        lines.append(f"**Synonyms:** {', '.join(syns[:4])}")

    if ants:
        lines.append(f"**Antonyms:** {', '.join(ants[:4])}")

    if related:
        lines.append(f"**Related:** {', '.join(related[:5])}")

    if cefr:
        lines.append(f"**CEFR:** {cefr}")

    if usage:
        lines.append(f"**Usage:** {usage[:120]}")

    for ex in examples[:2]:
        zo = ex.get("zo","").strip()
        en = ex.get("en","").strip()
        ref = ex.get("ref","")
        if zo:
            lines.append(f"> *{zo}*")
            if en: lines.append(f"> → {en}")
            if ref: lines.append(f"> `{ref}`")

    return "\n".join(lines)


def build_vocab_pages(entries):
    """Build per-letter vocabulary wiki pages."""
    out_dir = Path("wiki/vocabulary/generated")
    out_dir.mkdir(parents=True, exist_ok=True)

    by_letter = defaultdict(list)
    for e in entries:
        letter = e["zolai"][0].lower()
        if letter.isalpha():
            by_letter[letter].append(e)

    for letter, words in sorted(by_letter.items()):
        # Sort by CEFR then alphabetically
        cefr_order = {"A1":0,"A2":1,"B1":2,"B2":3,"C1":4,"C2":5,"":6}
        words.sort(key=lambda e: (cefr_order.get(e.get("cefr",""),6), e["zolai"]))

        out = out_dir / f"vocab_{letter}.md"
        header = f"# Zolai Vocabulary — {letter.upper()}\n\n"
        header += f"> {len(words)} entries | Generated from dict_master_v1.jsonl\n\n"

        # Group by CEFR
        by_cefr = defaultdict(list)
        for e in words:
            by_cefr[e.get("cefr","?")].append(e)

        sections = []
        for level in ["A1","A2","B1","B2","C1","C2","?"]:
            if level not in by_cefr: continue
            group = by_cefr[level]
            section = f"## {level} Level ({len(group)} words)\n\n"
            section += "\n\n".join(format_entry_md(e) for e in group[:50])  # cap at 50/level
            sections.append(section)

        out.write_text(header + "\n\n".join(sections), encoding="utf-8")

    print(f"  Vocab pages: {len(by_letter)} letter files → {out_dir}")
    return len(by_letter)


def build_master_reference(entries):
    """Build one master vocabulary reference sorted by CEFR."""
    cefr_order = {"A1":0,"A2":1,"B1":2,"B2":3,"C1":4,"C2":5,"":6}
    entries_sorted = sorted(entries, key=lambda e: (cefr_order.get(e.get("cefr",""),6), e["zolai"]))

    out = Path("wiki/vocabulary/master_vocab_reference.md")
    lines = ["# Zolai Master Vocabulary Reference\n"]
    lines.append(f"> {len(entries_sorted)} entries | Sorted by CEFR level\n")
    lines.append("> Generated from all dictionary sources\n\n---\n")

    current_cefr = None
    for e in entries_sorted:
        cefr = e.get("cefr","?")
        if cefr != current_cefr:
            lines.append(f"\n## {cefr} Level\n")
            current_cefr = cefr
        lines.append(format_entry_md(e))
        lines.append("")

    out.write_text("\n".join(lines), encoding="utf-8")
    size_kb = out.stat().st_size // 1024
    print(f"  Master reference: {size_kb} KB → {out}")


def build_master_prompts(entries):
    """Build master prompts file for AI generation tasks."""
    # Sample words by CEFR for prompt examples
    by_cefr = defaultdict(list)
    for e in entries:
        by_cefr[e.get("cefr","?")].append(e)

    a1_sample = [e["zolai"] for e in by_cefr.get("A1",[])[:20]]
    a2_sample = [e["zolai"] for e in by_cefr.get("A2",[])[:20]]

    content = f"""# Zolai AI Master Prompts
> Use these prompts with Gemini NotebookLM or any LLM loaded with the Zolai wiki.
> Language: Tedim Zolai (ZVS v9 standard)

---

## 1. Vocabulary Generation Prompts

### Generate word meanings with context
```
For the Zolai word "[WORD]", provide:
1. Primary meaning in English
2. All contextual meanings (multi-meaning)
3. Part of speech
4. 3 example sentences (Zolai + English)
5. Synonyms in Zolai
6. Antonyms in Zolai
7. Related words
8. CEFR level (A1-C2)
9. Usage notes
```

### Generate vocabulary by topic
```
Generate 20 Zolai vocabulary words for the topic "[TOPIC]".
For each word provide: Zolai | English | Example sentence
Topics: family, food, nature, body, time, emotions, work, school, church, numbers
```

### Generate example sentences
```
Write 5 natural Zolai sentences using the word "[WORD]".
Each sentence should be 5-12 words.
Include English translation.
Use ZVS standard (pasian not pathian, kei for negation).
```

### Multi-meaning disambiguation
```
The Zolai word "[WORD]" has multiple meanings.
List each meaning with:
- Context where this meaning applies
- Example sentence for each meaning
- English equivalent
```

---

## 2. Translation Prompts

### Basic translation
```
Zolai panin English ah let in: [ZOLAI SENTENCE]
```

```
English panin Zolai ah let in: [ENGLISH SENTENCE]
```

### ZVS audit
```
Check this Zolai text for ZVS compliance:
[TEXT]
Flag: pathian→pasian, sanggin→sanginn, ram→gam, lo in conditionals
```

### Batch translation
```
Translate these 10 sentences from English to Zolai (ZVS standard):
1. [sentence]
2. [sentence]
...
```

---

## 3. Dictionary Entry Generation

### Full entry generation
```
Create a complete Zolai dictionary entry for "[WORD]" with:
- zolai: headword
- english: primary translation
- translations: list of all meanings
- pos: part of speech
- synonyms: Zolai synonyms
- antonyms: Zolai antonyms
- related: related terms
- examples: 2 example sentences (zo + en)
- usage_notes: when/how to use
- cefr: A1/A2/B1/B2/C1/C2
```

### Fill gaps prompt
```
These Zolai words are missing examples. For each, write one short
natural sentence (5-10 words) showing the word in context:
{chr(10).join(f"- {e['zolai']} ({e['english']})" for e in entries if not e.get('examples'))[:30]}
```

---

## 4. Grammar Generation Prompts

### Pattern drilling
```
Generate 10 Zolai sentences demonstrating [GRAMMAR PATTERN]:
Patterns: negation with kei, negation with lo, conditional kei a leh,
tense marker ding, aspect marker zo, directional hong, ergative in
```

### Minimal pairs
```
Show the difference between these Zolai words with example sentences:
- kei vs lo (negation)
- pai vs hong pai (direction)
- tapa vs tanu (son vs daughter)
- pasian vs topa (God - different registers)
```

---

## 5. Export & Data Prompts

### Generate training pairs
```
Generate 20 instruction-output pairs for fine-tuning a Zolai LLM.
Format: {{"instruction": "...", "output": "..."}}
Topic: [TOPIC]
```

### CEFR word lists
```
List all A1-level Zolai words a complete beginner must learn first.
Group by: greetings, numbers, family, basic verbs, common nouns.
```

---

## 6. Current A1 Vocabulary Sample
{', '.join(a1_sample)}

## 7. Current A2 Vocabulary Sample
{', '.join(a2_sample)}

---

## 8. Google Sheets Formula Prompts

After importing dict_master_export.csv to Google Sheets:

```
=FILTER(A:H, D:D="A1")           — Show only A1 words
=COUNTIF(D:D,"A1")               — Count A1 words
=FILTER(A:H, LEN(F:F)>0)         — Words with examples only
=SORT(FILTER(A:H,D:D="A1"),1,1)  — Sort A1 words alphabetically
```
"""
    Path("wiki/vocabulary/master_prompts.md").write_text(content, encoding="utf-8")
    print(f"  Master prompts → wiki/vocabulary/master_prompts.md")


def export_sheets(entries):
    """Export to CSV and TSV for Google Sheets."""
    out_dir = Path("data/exports")
    out_dir.mkdir(parents=True, exist_ok=True)

    fields = ["zolai","english","pos","cefr","translations","synonyms",
              "antonyms","related","example_zo","example_en","usage_notes",
              "sources","book_count","first_book"]

    rows = []
    for e in entries:
        trans = e.get("translations",[])
        syns  = e.get("synonyms",[])
        ants  = e.get("antonyms",[])
        rel   = e.get("related",[])
        ex    = e.get("examples",[{}])[0] if e.get("examples") else {}
        pos   = e.get("pos","")
        if isinstance(pos, list): pos = "|".join(pos)
        rows.append({
            "zolai":        e.get("zolai",""),
            "english":      e.get("english",""),
            "pos":          pos,
            "cefr":         e.get("cefr",""),
            "translations": " | ".join(str(t) for t in trans[:5]),
            "synonyms":     ", ".join(str(s) for s in syns[:4]),
            "antonyms":     ", ".join(str(a) for a in ants[:4]),
            "related":      ", ".join(str(r) for r in rel[:5]),
            "example_zo":   ex.get("zo",""),
            "example_en":   ex.get("en",""),
            "usage_notes":  (e.get("usage_notes","") or "")[:200],
            "sources":      ", ".join(e.get("sources",[])[:3]),
            "book_count":   e.get("book_count",""),
            "first_book":   e.get("first_book",""),
        })

    # CSV
    csv_out = out_dir / "dict_master_export.csv"
    with open(csv_out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(rows)

    # TSV
    tsv_out = out_dir / "dict_master_export.tsv"
    with open(tsv_out, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields, delimiter="\t")
        w.writeheader()
        w.writerows(rows)

    print(f"  CSV: {csv_out} ({len(rows)} rows)")
    print(f"  TSV: {tsv_out}")


def main():
    import os
    os.chdir(Path(__file__).parent.parent)

    print("Loading dictionary...")
    entries = load_entries()
    print(f"  {len(entries)} entries loaded")

    print("\nBuilding vocab pages...")
    build_vocab_pages(entries)

    print("\nBuilding master reference...")
    build_master_reference(entries)

    print("\nBuilding master prompts...")
    build_master_prompts(entries)

    print("\nExporting to Google Sheets...")
    export_sheets(entries)

    print("\nDone! Files created:")
    print("  wiki/vocabulary/generated/vocab_*.md  (per-letter pages)")
    print("  wiki/vocabulary/master_vocab_reference.md")
    print("  wiki/vocabulary/master_prompts.md")
    print("  data/exports/dict_master_export.csv")
    print("  data/exports/dict_master_export.tsv")

if __name__ == "__main__":
    main()
