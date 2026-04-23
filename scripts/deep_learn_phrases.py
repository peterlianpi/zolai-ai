#!/usr/bin/env python3
"""
Deep-learn Zolai phrases/compounds/patterns from all resources.
- Fetches available models from OpenRouter + Groq + Gemini Direct at runtime
- Benchmarks top candidates on a Zolai sample to pick best model
- Uses 3 providers: Gemini Direct → OpenRouter Gemini → Groq
- Max 15806 output tokens via OpenRouter
- Logs provider/model/performance for each extraction
"""
from __future__ import annotations
import os
import json, time, re, requests, sys
from pathlib import Path
from dataclasses import dataclass, asdict
from datetime import datetime

# ── Keys ──────────────────────────────────────────────────────────────────────
OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
GROQ_KEY       = os.getenv("GROQ_API_KEY", "")
GEMINI_KEYS    = [
    os.getenv("GEMINI_API_KEY", ""),
    os.getenv("GEMINI_API_KEY_2", ""),
    os.getenv("GEMINI_API_KEY_3", ""),
]

WIKI      = Path(str(Path(__file__).resolve().parents[1]) + "/wiki")
RESOURCES = Path(str(Path(__file__).resolve().parents[1]) + "/resources")
RAW       = Path(str(Path(__file__).resolve().parents[1]) + "/raw")
LOG_FILE  = Path(str(Path(__file__).resolve().parents[1]) + "/wiki/testing/phrase_extraction_log.jsonl")

@dataclass
class ExtractionLog:
    timestamp: str
    task: str
    provider: str
    model: str
    duration_sec: float
    phrases: int
    compounds: int
    patterns: int
    proverbs: int
    total_items: int
    success: bool
    error: str = ""

PROMPT_PREFIX = """You are a Tedim Zolai (Chin language) expert.
From this Zolai text extract:
1. Phrases/idioms (2+ words, combined meaning)
2. Compound words (part1+part2=meaning)
3. Sentence patterns with translation
4. Proverbs or fixed expressions

ZVS rules: pasian/gam/tapa/tua. gik=heavy. aksi=star. sikha=ghost/spirit. singat=saw.
Only extract what context clearly supports. Mark uncertain with "?".

Return ONLY valid JSON, no markdown, no trailing commas:
{"phrases":[{"zo":"","en":"","note":""}],"compounds":[{"word":"","parts":"","en":""}],"patterns":[{"pattern":"","translation":"","example":""}],"proverbs":[{"zo":"","en":""}]}

TEXT:
"""

BENCH_TEXT = """Ka gam ah tui tampi om hi. Nu le pa in naupang te an piak uhhi.
Pasian in leitung a bawl hi. Khua le tui hoih mahmah hi.
Innkuan sung ah lungdam om nading in semkhawm ding hi.
Zomi mite in zolai a gen uh hi. Gam sung ah minam tampi om hi."""

# ── Model discovery ────────────────────────────────────────────────────────────
def get_gemini_direct_models() -> list[str]:
    """Fetch Gemini models from direct API."""
    try:
        r = requests.get(
            f"https://generativelanguage.googleapis.com/v1beta/models?key={GEMINI_KEYS[0]}",
            timeout=10
        )
        if r.status_code == 429:
            return []
        r.raise_for_status()
        models = [
            m["name"].replace("models/", "")
            for m in r.json().get("models", [])
            if "generateContent" in m.get("supportedGenerationMethods", [])
            and "flash" in m["name"].lower()
        ]
        return models[:3]  # top 3
    except Exception as e:
        print(f"  Gemini Direct fetch error: {e}", flush=True)
        return []

def get_openrouter_gemini_models() -> list[str]:
    """Fetch Gemini models from OpenRouter, sorted cheapest first."""
    try:
        r = requests.get("https://openrouter.ai/api/v1/models",
                         headers={"Authorization": f"Bearer {OPENROUTER_KEY}"}, timeout=15)
        r.raise_for_status()
        models = [
            (m["id"], float(m.get("pricing", {}).get("prompt", 0) or 0))
            for m in r.json().get("data", [])
            if "gemini" in m["id"].lower() and m.get("context_length", 0) >= 32768
        ]
        models.sort(key=lambda x: x[1])  # cheapest first
        return [m[0] for m in models]
    except Exception as e:
        print(f"  Model fetch error: {e}", flush=True)
        return ["google/gemini-2.0-flash-lite-001", "google/gemini-2.0-flash-001",
                "google/gemini-2.5-flash-lite"]

def get_groq_models() -> list[str]:
    """Fetch capable Groq models."""
    try:
        r = requests.get("https://api.groq.com/openai/v1/models",
                         headers={"Authorization": f"Bearer {GROQ_KEY}"}, timeout=15)
        r.raise_for_status()
        good = ["llama-3.3-70b-versatile", "qwen/qwen3-32b",
                "meta-llama/llama-4-scout-17b-16e-instruct", "llama-3.1-8b-instant"]
        available = {m["id"] for m in r.json().get("data", [])}
        return [m for m in good if m in available]
    except Exception:
        return ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"]

# ── JSON extraction ────────────────────────────────────────────────────────────
def extract_json(raw: str) -> dict:
    raw = re.sub(r'^```[a-z]*\n?', '', raw.strip())
    raw = re.sub(r'\n?```$', '', raw).strip()
    try:
        return json.loads(raw)
    except Exception:
        pass
    m = re.search(r'\{[\s\S]*\}', raw)
    if m:
        candidate = re.sub(r',\s*([}\]])', r'\1', m.group())
        try:
            return json.loads(candidate)
        except Exception:
            pass
    return {}

# ── API callers ────────────────────────────────────────────────────────────────
def call_gemini_direct(model: str, text: str, key_idx: int = 0) -> tuple[dict, str]:
    """Returns (result, model_used)"""
    if key_idx >= len(GEMINI_KEYS):
        raise Exception("All Gemini keys exhausted")
    
    key = GEMINI_KEYS[key_idx]
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
    
    r = requests.post(
        url,
        json={
            "contents": [{"parts": [{"text": PROMPT_PREFIX + text[:10000]}]}],
            "generationConfig": {"maxOutputTokens": 8000, "temperature": 0.1}
        },
        timeout=90
    )
    
    if r.status_code == 429:
        # Try next key
        if key_idx + 1 < len(GEMINI_KEYS):
            return call_gemini_direct(model, text, key_idx + 1)
        raise requests.HTTPError("429", response=r)
    
    r.raise_for_status()
    content = r.json()["candidates"][0]["content"]["parts"][0]["text"]
    return extract_json(content), f"gemini-direct:{model}"

def call_openrouter(model: str, text: str, max_tokens: int = 15806) -> tuple[dict, str]:
    """Returns (result, model_used)"""
def call_openrouter(model: str, text: str, max_tokens: int = 15806) -> tuple[dict, str]:
    """Returns (result, model_used)"""
    r = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={"Authorization": f"Bearer {OPENROUTER_KEY}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": PROMPT_PREFIX + text[:12000]}],
            "max_tokens": max_tokens,
            "temperature": 0.1,
        },
        timeout=90,
    )
    if r.status_code == 429:
        raise requests.HTTPError("429", response=r)
    r.raise_for_status()
    return extract_json(r.json()["choices"][0]["message"]["content"]), f"openrouter:{model}"

def call_groq(model: str, text: str) -> tuple[dict, str]:
    """Returns (result, model_used)"""
def call_groq(model: str, text: str) -> tuple[dict, str]:
    """Returns (result, model_used)"""
    r = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers={"Authorization": f"Bearer {GROQ_KEY}"},
        json={
            "model": model,
            "messages": [{"role": "user", "content": PROMPT_PREFIX + text[:5000]}],
            "max_tokens": 2000,
            "temperature": 0.1,
        },
        timeout=60,
    )
    if r.status_code == 429:
        raise requests.HTTPError("429", response=r)
    r.raise_for_status()
    return extract_json(r.json()["choices"][0]["message"]["content"]), f"groq:{model}"

# ── Benchmark ─────────────────────────────────────────────────────────────────
def score_result(data: dict) -> int:
    """Score a model result: more valid entries = better."""
    if not data:
        return 0
    score = 0
    for k in ["phrases", "compounds", "patterns", "proverbs"]:
        items = data.get(k, [])
        for item in items:
            # penalise empty or placeholder entries
            vals = list(item.values())
            if any(v and v not in ("", "?") for v in vals):
                score += 1
    return score

def benchmark_models(gemini_models: list[str], or_models: list[str], groq_models: list[str]) -> tuple[str, str, str]:
    """Test models, return (best_gemini, best_or, best_groq)."""
    print("\n── Benchmarking models on Zolai sample ──", flush=True)
    
    best_gemini = ("", 0)
    for model in gemini_models[:2]:
        try:
            t0 = time.time()
            result, _ = call_gemini_direct(model, BENCH_TEXT)
            elapsed = time.time() - t0
            s = score_result(result)
            print(f"  Gemini Direct {model}: score={s}, t={elapsed:.1f}s", flush=True)
            if s > best_gemini[1]:
                best_gemini = (model, s)
            time.sleep(2)
        except Exception as e:
            print(f"  Gemini Direct {model}: FAIL ({e})", flush=True)
    
    best_or = (or_models[0], 0)
    for model in or_models[:3]:
        try:
            t0 = time.time()
            result, _ = call_openrouter(model, BENCH_TEXT, max_tokens=500)
            elapsed = time.time() - t0
            s = score_result(result)
            print(f"  OR {model}: score={s}, t={elapsed:.1f}s", flush=True)
            if s > best_or[1]:
                best_or = (model, s)
            time.sleep(1)
        except Exception as e:
            print(f"  OR {model}: FAIL ({e})", flush=True)

    best_groq = (groq_models[0], 0)
    for model in groq_models[:2]:
        try:
            t0 = time.time()
            result, _ = call_groq(model, BENCH_TEXT)
            elapsed = time.time() - t0
            s = score_result(result)
            print(f"  Groq {model}: score={s}, t={elapsed:.1f}s", flush=True)
            if s > best_groq[1]:
                best_groq = (model, s)
            time.sleep(1)
        except Exception as e:
            print(f"  Groq {model}: FAIL ({e})", flush=True)

    print(f"\n  Best Gemini Direct: {best_gemini[0]} (score={best_gemini[1]})", flush=True)
    print(f"  Best OR model:      {best_or[0]} (score={best_or[1]})", flush=True)
    print(f"  Best Groq model:    {best_groq[0]} (score={best_groq[1]})", flush=True)
    return best_gemini[0] or gemini_models[0] if gemini_models else "", best_or[0], best_groq[0]

# ── Main call with fallback chain ─────────────────────────────────────────────
def call_api(text: str, gemini_model: str, or_model: str, groq_model: str) -> tuple[dict, str, float]:
    """Returns (result, provider:model, duration_sec)"""
    t0 = time.time()
    
    for attempt in range(3):
        # 1. Try Gemini Direct first (if available)
        if gemini_model:
            try:
                result, model_used = call_gemini_direct(gemini_model, text)
                if result:
                    return result, model_used, time.time() - t0
            except requests.HTTPError as e:
                code = e.response.status_code if e.response else 0
                if code == 429:
                    print(f"    Gemini Direct 429, trying OR...", flush=True)
                else:
                    print(f"    Gemini Direct {code}, trying OR...", flush=True)
            except Exception as e:
                print(f"    Gemini Direct error: {e}, trying OR...", flush=True)
        
        # 2. Try OpenRouter Gemini
        try:
            result, model_used = call_openrouter(or_model, text)
            if result:
                return result, model_used, time.time() - t0
        except requests.HTTPError as e:
            code = e.response.status_code if e.response else 0
            if code == 429:
                wait = 15 + attempt * 10
                print(f"    OR 429, wait {wait}s...", flush=True)
                time.sleep(wait)
                continue
            print(f"    OR {code}, trying Groq...", flush=True)
        except Exception as e:
            print(f"    OR error: {e}, trying Groq...", flush=True)

        # 3. Fallback: Groq
        try:
            result, model_used = call_groq(groq_model, text)
            if result:
                return result, model_used, time.time() - t0
        except requests.HTTPError as e:
            code = e.response.status_code if e.response else 0
            if code == 429:
                print(f"    Groq 429, wait 30s...", flush=True)
                time.sleep(30)
                continue
            print(f"    Groq {code}", flush=True)
        except Exception as e:
            print(f"    Groq error: {e}", flush=True)
        time.sleep(5)
    
    return {}, "failed", time.time() - t0

# ── Save ──────────────────────────────────────────────────────────────────────
def save(filename: str, data: dict, source: str) -> tuple[int, int, int, int]:
    """Returns (phrases, compounds, patterns, proverbs) counts."""
    if not data or not any(data.get(k) for k in ["phrases","compounds","patterns","proverbs"]):
        print("    No data to save", flush=True)
        return 0, 0, 0, 0
    out = WIKI / "vocabulary" / filename
    lines = [f"# Phrases & Patterns from: {source}\n"]
    if data.get("phrases"):
        lines.append("## Phrases & Idioms\n\n| Zolai | English | Note |\n|---|---|---|")
        for v in data["phrases"]:
            lines.append(f"| {v.get('zo','')} | {v.get('en','')} | {v.get('note','')} |")
    if data.get("compounds"):
        lines.append("\n## Compound Words\n\n| Word | Parts | Meaning |\n|---|---|---|")
        for c in data["compounds"]:
            lines.append(f"| {c.get('word','')} | {c.get('parts','')} | {c.get('en','')} |")
    if data.get("patterns"):
        lines.append("\n## Sentence Patterns\n")
        for p in data["patterns"]:
            lines.append(f"- `{p.get('pattern','')}` = {p.get('translation','')}")
            if p.get("example"):
                lines.append(f"  - e.g. `{p['example']}`")
    if data.get("proverbs"):
        lines.append("\n## Proverbs\n\n| Zolai | Meaning |\n|---|---|")
        for p in data["proverbs"]:
            lines.append(f"| {p.get('zo','')} | {p.get('en','')} |")
    out.write_text("\n".join(lines), encoding="utf-8")
    ph = len(data.get("phrases", []))
    co = len(data.get("compounds", []))
    pa = len(data.get("patterns", []))
    pr = len(data.get("proverbs", []))
    print(f"    ✓ Saved {out.name}: {ph} phrases, {co} compounds, {pa} patterns, {pr} proverbs", flush=True)
    return ph, co, pa, pr

def log_extraction(log: ExtractionLog):
    """Append log entry to JSONL."""
    LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(asdict(log), ensure_ascii=False) + "\n")

def chunk(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start:end])

# ── Tasks ─────────────────────────────────────────────────────────────────────
def main():
    print("=" * 70, flush=True)
    print("ZOLAI PHRASE EXTRACTION — 3-Provider Model Testing", flush=True)
    print("=" * 70, flush=True)
    
    print("\n[1/4] Fetching available models...", flush=True)
    gemini_models = get_gemini_direct_models()
    or_models     = get_openrouter_gemini_models()
    groq_models   = get_groq_models()
    
    print(f"  • Gemini Direct: {len(gemini_models)} models", flush=True)
    if gemini_models:
        print(f"    {', '.join(gemini_models[:3])}", flush=True)
    print(f"  • OpenRouter Gemini: {len(or_models)} models", flush=True)
    if or_models:
        print(f"    {', '.join(or_models[:3])}", flush=True)
    print(f"  • Groq: {len(groq_models)} models", flush=True)
    if groq_models:
        print(f"    {', '.join(groq_models[:3])}", flush=True)

    print("\n[2/4] Benchmarking models...", flush=True)
    best_gemini, best_or, best_groq = benchmark_models(gemini_models, or_models, groq_models)

    print("\n[3/4] Provider chain:", flush=True)
    if best_gemini:
        print(f"  1. Gemini Direct: {best_gemini}", flush=True)
    print(f"  2. OpenRouter:    {best_or}", flush=True)
    print(f"  3. Groq (backup): {best_groq}", flush=True)

    tasks = [
        # Retry failed chunk from previous run
        (RAW / "zolai_word_list.txt",                         7000, 9000,  "wordlist_phrases_part9_retry.md"),
        # Sinna 2010 — proverbs, idioms, grammar
        (RESOURCES / "zolai_sinna_2010.md",                   0,    400,   "sinna2010_phrases_part1.md"),
        (RESOURCES / "zolai_sinna_2010.md",                   400,  800,   "sinna2010_phrases_part2.md"),
        (RESOURCES / "zolai_sinna_2010.md",                   800,  1200,  "sinna2010_phrases_part3.md"),
        (RESOURCES / "zolai_sinna_2010.md",                   1200, 1600,  "sinna2010_phrases_part4.md"),
        (RESOURCES / "zolai_sinna_2010.md",                   1600, 2000,  "sinna2010_phrases_part5.md"),
        # Course 15 — education phrases
        (RESOURCES / "course15_play_based_learning_zolai.md", 0,    500,   "course15_phrases_part1.md"),
        (RESOURCES / "course15_play_based_learning_zolai.md", 500,  1000,  "course15_phrases_part2.md"),
        # News — formal register phrases
        (RESOURCES / "zolai_news_20260415.md",                0,    300,   "news_phrases.md"),
        # Standard Format — grammar patterns
        (RESOURCES / "Zolai_Standard_Format.md",              0,    200,   "standard_format_phrases.md"),
        # Gentehna — fable phrases (first section)
        (RESOURCES / "Gentehna_Tuamtuam_le_A_Deihnate.md",   0,    500,   "gentehna_phrases_part1.md"),
    ]

    print(f"\n[4/4] Running {len(tasks)} extraction tasks...", flush=True)
    print("=" * 70, flush=True)
    
    total_stats = {"phrases": 0, "compounds": 0, "patterns": 0, "proverbs": 0}
    
    for i, (path, start, end, out) in enumerate(tasks, 1):
        task_name = f"{path.name}:{start}-{end}"
        print(f"\n[{i}/{len(tasks)}] {task_name}", flush=True)
        
        if not path.exists():
            print(f"    ✗ Not found: {path}", flush=True)
            log_extraction(ExtractionLog(
                timestamp=datetime.now().isoformat(),
                task=task_name,
                provider="none",
                model="none",
                duration_sec=0,
                phrases=0, compounds=0, patterns=0, proverbs=0, total_items=0,
                success=False,
                error="File not found"
            ))
            continue
        
        text = chunk(path, start, end)
        if len(text.strip()) < 50:
            print("    ⊘ Skipping — empty chunk", flush=True)
            continue
        
        try:
            data, model_used, duration = call_api(text, best_gemini, best_or, best_groq)
            provider = model_used.split(":")[0] if ":" in model_used else "unknown"
            model = model_used.split(":", 1)[1] if ":" in model_used else model_used
            
            ph, co, pa, pr = save(out, data, task_name)
            total = ph + co + pa + pr
            
            total_stats["phrases"] += ph
            total_stats["compounds"] += co
            total_stats["patterns"] += pa
            total_stats["proverbs"] += pr
            
            print(f"    ⚡ Provider: {provider} | Model: {model} | Time: {duration:.1f}s", flush=True)
            
            log_extraction(ExtractionLog(
                timestamp=datetime.now().isoformat(),
                task=task_name,
                provider=provider,
                model=model,
                duration_sec=round(duration, 2),
                phrases=ph, compounds=co, patterns=pa, proverbs=pr,
                total_items=total,
                success=True
            ))
            
        except Exception as e:
            print(f"    ✗ FAILED: {e}", flush=True)
            log_extraction(ExtractionLog(
                timestamp=datetime.now().isoformat(),
                task=task_name,
                provider="failed",
                model="failed",
                duration_sec=0,
                phrases=0, compounds=0, patterns=0, proverbs=0, total_items=0,
                success=False,
                error=str(e)
            ))
        
        time.sleep(2)

    print("\n" + "=" * 70, flush=True)
    print("EXTRACTION COMPLETE", flush=True)
    print("=" * 70, flush=True)
    print(f"Total extracted:", flush=True)
    print(f"  • Phrases:   {total_stats['phrases']}", flush=True)
    print(f"  • Compounds: {total_stats['compounds']}", flush=True)
    print(f"  • Patterns:  {total_stats['patterns']}", flush=True)
    print(f"  • Proverbs:  {total_stats['proverbs']}", flush=True)
    print(f"\nLog saved to: {LOG_FILE}", flush=True)
    print("\nTo analyze model performance:", flush=True)
    print(f"  python3 -c \"import json; logs=[json.loads(l) for l in open('{LOG_FILE}')]; print('Provider stats:', {{p:sum(1 for x in logs if x['provider']==p) for p in set(x['provider'] for x in logs)}})\"", flush=True)

if __name__ == "__main__":
    raise SystemExit(main())
