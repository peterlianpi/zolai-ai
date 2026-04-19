# Skill: Bible Vocab Extractor
# Triggers: "extract vocab", "bible vocabulary", "chapter words"

## Purpose
Extract unique vocabulary from any Bible book/chapter with dictionary lookup and stemming.

## Algorithm
1. Tokenize verse text (strip punctuation, lowercase)
2. Stem tokens against known suffixes: `-na`, `-te`, `-ah`, `-in`, `-sak`, `-khia`, `-un`, `-a`
3. Lookup root in: semantic dict → enriched dict → zomidictionary → SQLite DB
4. Attach parallel corpus examples (up to 2 per word)
5. Output per-chapter JSONL with coverage stats

## Coverage Targets
- A1 words (top 200 frequency): 100%
- General vocab: >= 85%
- Proper nouns: flagged separately, not counted in coverage

## Output Schema
```json
{
  "word": "khuavak",
  "root": "khuavak",
  "english": ["light", "daylight"],
  "pos": "noun",
  "variants": [],
  "synonyms": ["khuavakna"],
  "antonyms": ["khuamial"],
  "explanation": "visible brightness; daylight",
  "examples": [{"zo": "...", "en": "...", "reference": "GEN.1:3"}],
  "in_dictionary": true,
  "first_seen": "GEN.1:3"
}
```

## Runner
```bash
python scripts/fill_bible_vocab_local.py --book GEN --chapters 1-50
python scripts/fill_bible_vocab_local.py --book EXO
```
