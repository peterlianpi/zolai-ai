# Grammar Checker Skill

## Purpose
Validate Zolai sentences against ZVS Tedim standard rules and return structured error reports.

## Rules Enforced

| Rule | Pass | Fail |
|---|---|---|
| Dialect words | `pasian`, `gam`, `tapa` | `pathian`, `ram`, `fapa`, `cu/cun` |
| Plural + we | `I pai hi.` | `I pai uh hi.` |
| Negation | `nong pai kei a leh` | `nong pai lo leh` |
| Phonetics | any valid cluster | `ti`, `ca`, `ce`, `co`, `caw` |
| Word order | SOV | non-SOV without valid OSV |

## Output Format
```json
{
  "valid": false,
  "errors": [
    { "rule": "dialect_word", "span": "pathian", "suggestion": "pasian" },
    { "rule": "plural_with_i", "span": "I pai uh hi", "suggestion": "I pai hi" }
  ]
}
```

## Usage
```bash
python scripts/test_grammar_rules.py              # Run full test suite
POST /api/grammar/validate  { "text": "..." }     # API endpoint
```
