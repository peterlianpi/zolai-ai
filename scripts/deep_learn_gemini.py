#!/usr/bin/env python3
"""Deep-learn from Zolai resources using Groq API."""
from __future__ import annotations
import os
import json, time, re, requests, sys
from pathlib import Path

GROQ_KEY = os.getenv("GROQ_API_KEY", "")
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
WIKI = Path(str(Path(__file__).resolve().parents[1]) + "/wiki")
RESOURCES = Path(str(Path(__file__).resolve().parents[1]) + "/resources")

PROMPT_PREFIX = """You are a Tedim Zolai (Chin language) linguistics expert.
Analyze this Zolai text. Extract ONLY what you are confident about from context.
Rules: ZVS Tedim (pasian/gam/tapa/tua). gik=heavy. lua=too much. mahmah=very.
Do NOT guess — mark uncertain with "?".

Return ONLY a raw JSON object (no markdown, no explanation):
{"vocabulary":[{"zo":"word","en":"meaning","note":"context"}],"grammar_rules":[{"rule":"desc","example":"zo","translation":"en"}],"corrections":[{"wrong":"x","correct":"y","reason":"why"}],"cultural_notes":["note"]}

TEXT TO ANALYZE:
"""

def extract_json(raw: str) -> dict:
    """Extract JSON from response even if wrapped in markdown."""
    # try direct parse
    try:
        return json.loads(raw.strip())
    except Exception:
        pass
    # find JSON object in response
    m = re.search(r'\{.*\}', raw, re.DOTALL)
    if m:
        try:
            return json.loads(m.group())
        except Exception:
            pass
    return {}

def call_api(text: str) -> dict:
    headers = {"Authorization": f"Bearer {GROQ_KEY}", "Content-Type": "application/json"}
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": PROMPT_PREFIX + text[:5000]}],
        "max_tokens": 2000,
        "temperature": 0.1,
    }
    for attempt in range(3):
        try:
            r = requests.post(GROQ_URL, json=payload, headers=headers, timeout=60)
            if r.status_code == 429:
                print("    Rate limited, wait 30s...", flush=True)
                time.sleep(30)
                continue
            r.raise_for_status()
            raw = r.json()["choices"][0]["message"]["content"]
            result = extract_json(raw)
            if not result:
                print(f"    No JSON found in: {raw[:100]}", flush=True)
            return result
        except Exception as e:
            print(f"    Error attempt {attempt+1}: {e}", flush=True)
            time.sleep(5)
    return {}

def save(filename: str, data: dict, source: str):
    if not data or not any(data.get(k) for k in ["vocabulary","grammar_rules","corrections"]):
        print("    No data to save", flush=True)
        return
    out = WIKI / "vocabulary" / filename
    lines = [f"# Learned from: {source}\n"]
    if data.get("vocabulary"):
        lines.append("## Vocabulary\n\n| Zolai | English | Note |\n|---|---|---|")
        for v in data["vocabulary"]:
            lines.append(f"| {v.get('zo','')} | {v.get('en','')} | {v.get('note','')} |")
    if data.get("grammar_rules"):
        lines.append("\n## Grammar Rules\n")
        for g in data["grammar_rules"]:
            lines.append(f"- **{g.get('rule','')}**: `{g.get('example','')}` = {g.get('translation','')}")
    if data.get("corrections"):
        lines.append("\n## Corrections\n\n| Wrong | Correct | Reason |\n|---|---|---|")
        for c in data["corrections"]:
            lines.append(f"| {c.get('wrong','')} | {c.get('correct','')} | {c.get('reason','')} |")
    if data.get("cultural_notes"):
        lines.append("\n## Cultural Notes\n")
        for n in data["cultural_notes"]:
            lines.append(f"- {n}")
    out.write_text("\n".join(lines), encoding="utf-8")
    v = len(data.get("vocabulary", []))
    g = len(data.get("grammar_rules", []))
    c = len(data.get("corrections", []))
    print(f"    Saved {out.name}: {v} vocab, {g} rules, {c} corrections", flush=True)

def chunk(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start:end])

def main():
    tasks = [
        (RESOURCES / "Gentehna_Tuamtuam_le_A_Deihnate.md", 500,  850,  "gentehna_part2.md"),
        (RESOURCES / "Gentehna_Tuamtuam_le_A_Deihnate.md", 850,  1209, "gentehna_part3.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md",  400,  1000, "khanggui_part1.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md",  1000, 1800, "khanggui_part2.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md",  1800, 2800, "khanggui_part3.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md",  2800, 4000, "khanggui_part4.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md",  4000, 5500, "khanggui_part5.md"),
        (RESOURCES / "Zolai_Khanggui_AD_1899_AD_2013.md",  5500, 7306, "khanggui_part6.md"),
        (RESOURCES / "zolai_ai_instructions.md",            0,    600,  "ai_instructions_part1.md"),
        (RESOURCES / "zolai_ai_instructions.md",            600,  1118, "ai_instructions_part2.md"),
        (RESOURCES / "Zolai_Standard_Format.md",            1200, 1600, "standard_format_part2.md"),
        (RESOURCES / "Zolai_Standard_Format.md",            1600, 2021, "standard_format_part3.md"),
    ]
    for i, (path, start, end, out) in enumerate(tasks, 1):
        print(f"[{i}/{len(tasks)}] {path.name} lines {start}-{end}", flush=True)
        text = chunk(path, start, end)
        if len(text.strip()) < 50:
            print("    Skipping — empty", flush=True)
            continue
        data = call_api(text)
        save(out, data, f"{path.name}:{start}-{end}")
        time.sleep(2)
    print("\nDone.", flush=True)

if __name__ == "__main__":
    raise SystemExit(main())
