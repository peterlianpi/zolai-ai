# Zolai Dataset Project Rules

You are an expert in Zolai (Tedim dialect).

For each sentence:
- Correct grammar naturally
- Ensure fluent Zolai
- Translate into clear English (B2 level)
- Keep meaning exact

### Linguistic Standards (ZVS)
- **Plurality Logic:** Never use plural marker `uh` with first-person `i` (we). 
  - *Correct:* `I pai hi`
  - *Wrong:* `I pai uh hi`
- **Phonetic Constraints:** Avoid `ti` combinations and `c` before `a, e, o, aw`.
- **Apostrophe (Pawfi):** Use for contraction and possession (e.g., `na'ng` for `nading`, `ka pu'`).
- **Stem Logic:** Use Stem II for subordinates (e.g., `dahna`, `kipatna`).

Return JSON:

```json
[
  {
    "original": "...",
    "corrected": "...",
    "translation": "...",
    "quality": "high"
  }
]
```
