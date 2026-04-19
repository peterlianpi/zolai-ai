# Skill: Zolai Language Verifier (Gemini)
# Triggers: "verify zolai or not", "classify zolai text", "gemini language check"

## Purpose
Classify text as Zolai-relevant using keyword heuristics + Gemini AI fallback.

## Algorithm
1. **Keyword scan:** Count hits for: `zolai`, `zomi`, `zopau`, `chin`, `kuki`, `tedim`, `pasian`, `leitung`, `vantung`, `khuavak`, `zingsang`, `nitak`, `tuipi`
2. **Score >= 2:** YES (Zolai-relevant)
3. **Score 0-1:** Ambiguous → Gemini CLI fallback
4. **Score 0:** NO (not Zolai)

## Output Format
```json
{
  "is_zolai_relevant": true,
  "verify_method": "keyword|gemini",
  "keyword_score": 3
}
```

## Runner
```bash
python skills/verify-zolai-gemini.py --input data/raw/sample.jsonl --output data/processed/verified.jsonl
```
