#!/usr/bin/env python3
"""Extract vocabulary with context and usage from all 66 Bible books."""
from __future__ import annotations
import os
import json, time, re, requests
from pathlib import Path
from datetime import datetime

OPENROUTER_KEY = os.getenv("OPENROUTER_API_KEY", "")
GROQ_KEY = os.getenv("GROQ_API_KEY", "")

BIBLE_DIR = Path(str(Path(__file__).resolve().parents[1]) + "/Cleaned_Bible/Parallel_Corpus/Tedim_Chin")
OUTPUT_DIR = Path(str(Path(__file__).resolve().parents[1]) + "/wiki/vocabulary/bible_context")
LOG_FILE = Path(str(Path(__file__).resolve().parents[1]) + "/wiki/testing/bible_vocab_extraction.jsonl")

PROMPT = """Analyze this Zolai Bible text with English translation.

Extract vocabulary with CONTEXT and USAGE:
1. New/interesting words with their meaning from context
2. How existing words are used (different meanings, collocations)
3. Phrases and their contextual meaning
4. Grammar patterns observed

Return ONLY valid JSON:
{
  "words": [{"zo":"word","en":"meaning","context":"how it's used in this passage","example":"Zolai sentence"}],
  "phrases": [{"zo":"phrase","en":"meaning","usage":"when/how to use"}],
  "patterns": [{"pattern":"grammar pattern","explanation":"what it shows","example":""}]
}

TEXT:
"""

def call_api(text: str, model: str = "google/gemini-2.5-flash-lite-preview-09-2025") -> dict:
    """Call OpenRouter with Groq fallback."""
    import sys
    
    # Try Groq with rate limit handling
    for attempt in range(5):  # More attempts for rate limits
        try:
            sys.stdout.write("Groq."); sys.stdout.flush()
            r = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {GROQ_KEY}"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "messages": [{"role": "user", "content": PROMPT + text[:5000]}],
                    "max_tokens": 2000,
                    "temperature": 0.1,
                },
                timeout=60,
            )
            if r.status_code == 200:
                content = r.json()["choices"][0]["message"]["content"]
                result = extract_json(content)
                if result:
                    time.sleep(2)  # Rate limit: 2 sec between successful calls
                    return result, "groq"
            if r.status_code == 429:
                sys.stdout.write("429."); sys.stdout.flush()
                time.sleep(30)  # Longer wait for rate limits
                continue
        except Exception as e:
            sys.stdout.write(f"E({str(e)[:20]})."); sys.stdout.flush()
        
        time.sleep(5)
    return {}, "failed"

def extract_json(raw: str) -> dict:
    raw = re.sub(r'^```[a-z]*\n?', '', raw.strip())
    raw = re.sub(r'\n?```$', '', raw).strip()
    try:
        return json.loads(raw)
    except:
        m = re.search(r'\{[\s\S]*\}', raw)
        if m:
            try:
                return json.loads(re.sub(r',\s*([}\]])', r'\1', m.group()))
            except:
                pass
    return {}

def chunk_verses(text: str, chunk_size: int = 15) -> list[str]:
    """Split into chunks of ~15 verses."""
    verses = re.split(r'\n\*\*\d+:\d+\*\*', text)
    chunks = []
    current = []
    for v in verses:
        if not v.strip():
            continue
        current.append(v)
        if len(current) >= chunk_size:
            chunks.append("\n".join(current))
            current = []
    if current:
        chunks.append("\n".join(current))
    return chunks

def save_results(book: str, chunk_idx: int, data: dict):
    """Save extraction results."""
    if not data or not any(data.get(k) for k in ["words", "phrases", "patterns"]):
        return 0
    
    out = OUTPUT_DIR / f"{book}_part{chunk_idx}.md"
    out.parent.mkdir(parents=True, exist_ok=True)
    
    lines = [f"# {book} - Part {chunk_idx}\n"]
    
    if data.get("words"):
        lines.append("## Vocabulary with Context\n")
        for w in data["words"]:
            lines.append(f"### {w.get('zo', '')} = {w.get('en', '')}")
            if w.get("context"):
                lines.append(f"**Context:** {w['context']}")
            if w.get("example"):
                lines.append(f"**Example:** {w['example']}")
            lines.append("")
    
    if data.get("phrases"):
        lines.append("## Phrases & Usage\n")
        for p in data["phrases"]:
            lines.append(f"- **{p.get('zo', '')}** = {p.get('en', '')}")
            if p.get("usage"):
                lines.append(f"  - Usage: {p['usage']}")
            lines.append("")
    
    if data.get("patterns"):
        lines.append("## Grammar Patterns\n")
        for pat in data["patterns"]:
            lines.append(f"- **{pat.get('pattern', '')}**")
            lines.append(f"  - {pat.get('explanation', '')}")
            if pat.get("example"):
                lines.append(f"  - Example: {pat['example']}")
            lines.append("")
    
    out.write_text("\n".join(lines), encoding="utf-8")
    return len(data.get("words", [])) + len(data.get("phrases", [])) + len(data.get("patterns", []))

def main():
    print("=" * 70)
    print("BIBLE VOCABULARY EXTRACTION — Context & Usage Learning")
    print("=" * 70)
    
    books = sorted(BIBLE_DIR.glob("*_Parallel.md"))
    print(f"\nFound {len(books)} Bible books")
    
    total_items = 0
    
    for book_idx, book_path in enumerate(books, 1):
        book_name = book_path.stem.replace("_Tedim_Chin_Parallel", "")
        print(f"\n[{book_idx}/{len(books)}] {book_name}")
        
        text = book_path.read_text(encoding="utf-8")
        chunks = chunk_verses(text)
        
        print(f"  {len(chunks)} chunks to process")
        
        for chunk_idx, chunk_text in enumerate(chunks, 1):
            if len(chunk_text.strip()) < 100:
                continue
            
            print(f"    [{chunk_idx}/{len(chunks)}] calling API...", end="", flush=True)
            
            try:
                data, provider = call_api(chunk_text)
                print(f" saving...", end="", flush=True)
                items = save_results(book_name, chunk_idx, data)
                total_items += items
                
                print(f" ✓ {provider} | {items} items", flush=True)
                
                # Log
                LOG_FILE.parent.mkdir(parents=True, exist_ok=True)
                with open(LOG_FILE, "a", encoding="utf-8") as f:
                    f.write(json.dumps({
                        "timestamp": datetime.now().isoformat(),
                        "book": book_name,
                        "chunk": chunk_idx,
                        "provider": provider,
                        "items": items,
                        "success": True
                    }, ensure_ascii=False) + "\n")
                
                time.sleep(2)
                
            except Exception as e:
                print(f"✗ {e}")
        
        # Pause between books
        time.sleep(3)
    
    print("\n" + "=" * 70)
    print(f"COMPLETE: {total_items} items extracted from {len(books)} books")
    print("=" * 70)

if __name__ == "__main__":
    raise SystemExit(main())
