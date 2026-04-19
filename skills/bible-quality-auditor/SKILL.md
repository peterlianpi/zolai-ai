# Skill: Bible Quality Auditor
# Triggers: "audit bible", "flag quality", "sentence review", "recommendations"

## Purpose
Scan Bible corpus sentences for quality issues and generate improvement recommendations.

## Checks Performed
1. **HTML entities** — `&#8220;`, `&#8217;`, `&amp;` etc. (should be 0 after fix_bible_data.py)
2. **Dialect violations** — forbidden words: `pathian`, `ram`, `fapa`, `bawipa`, `cu`, `cun`
3. **Conditional negation** — `lo leh` (should be `kei leh` or `kei a leh`)
4. **Plural violation** — `i ... uh` combination
5. **Alignment mismatch** — verse length ratio > 3x vs KJV (likely missing/extra content)
6. **Truncated sentences** — ends with lowercase non-punctuation (fragment)
7. **Short verses** — < 5 tokens (may be header/label not verse)

## Severity Levels
- `critical` — dialect violation, HTML artifact (must fix before training)
- `warning`  — alignment mismatch, conditional negation error
- `info`     — short verse, truncation suspicion

## Output Schema
```json
{
  "reference": "GEN.1:2",
  "source": "TB77_online",
  "text": "...",
  "issues": ["html_entity", "dialect_violation"],
  "severity": "critical",
  "recommendation": "Decode HTML entities; replace 'pathian' with 'pasian'"
}
```

## Runner
```bash
python scripts/bible_vocab_pipeline.py --audit-only --book GEN
```
