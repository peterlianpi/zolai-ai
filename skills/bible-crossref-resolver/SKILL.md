# Skill: Bible Cross-Reference Resolver
# Triggers: "resolve gaps", "crossref vocab", "fill missing words"

## Purpose
Resolve unknown Zolai words by aligning them against KJV English using positional
alignment across TB77, TBR17, and TDB versions.

## Algorithm
1. For each gap word, find its verse reference
2. Fetch the same verse from all 3 Zolai versions + KJV English
3. Tokenize both ZO and EN verse
4. Map word position proportionally: `en_idx = int((zo_idx / len(zo_tokens)) * len(en_tokens))`
5. Take ±1 window of EN tokens as translation candidates
6. Insert into DB with `accuracy=0.55`, flagged for human review

## Resolution Rate (Genesis baseline)
- 434/482 gaps resolved (90%) using local crossref only
- 48 remaining = proper nouns + hapax legomena → Gemini queue

## Output Schema
```json
{
  "zolai": "khuamial",
  "english": ["darkness", "dark"],
  "pos": "",
  "reference": "GEN.1:2",
  "en_verse": "...",
  "zo_verse": "...",
  "source": "crossref_bible",
  "accuracy": 0.55
}
```

## Runner
```bash
python scripts/crossref_bible_vocab.py
```
