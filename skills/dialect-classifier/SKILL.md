# Dialect Classifier Skill

## Purpose
Detect whether input text is Tedim ZVS, Hakha, Falam, or mixed dialect.

## Forbidden → Correct Mapping

| Forbidden (non-Tedim) | Correct (Tedim ZVS) |
|---|---|
| pathian | pasian |
| ram | gam |
| fapa | tapa |
| bawipa | topa |
| siangpahrang | kumpipa |
| cu / cun | tua |

## Workflow
1. Tokenize input
2. Check each token against forbidden word list
3. Score: `tedim_score = 1 - (forbidden_count / total_tokens)`
4. Classify: ≥0.95 = tedim, ≤0.5 = hakha/falam, else = mixed

## Output
```json
{
  "dialect": "mixed",
  "confidence": 0.72,
  "flags": [
    { "word": "pathian", "position": 3, "suggestion": "pasian" }
  ]
}
```
