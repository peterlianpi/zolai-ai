---
name: zolai-dictionary-editor
description: Verify, correct, and enrich Zolai dictionary entries. Use when cleaning dictionary datasets, verifying translations, or adding linguistic context (POS, examples, ZVS compliance).
---

# Zolai Dictionary Editor

This skill provides workflows for maintaining a high-quality Tedim Zolai dictionary.

## Workflow: Verify and Correct Entries

When provided with one or more dictionary entries (JSON format), follow these steps:

1.  **Linguistic Validation:** Check against [ZVS Rules](references/zvs_rules.md).
    - Ensure `Pasian` is used instead of `Pathian`.
    - Ensure compounds like `nasep` and `nading` are joined.
    - Check for SOV word order in examples.
2.  **Semantic Accuracy:** Verify that the English translation matches the Zolai headword.
    - If the entry is `{"zolai": "Alu", "english": "Potato"}`, it is correct.
    - If the entry is `{"zolai": "Adj", "english": "beforehand"}`, it is likely a POS error and should be flagged or fixed (e.g., `headword` might be missing or wrong).
3.  **Enrichment:**
    - Add `pos` (Part of Speech) if missing or incorrect.
    - Generate short, natural example sentences in Zolai and English.
    - Assign a `cefr` level (A1-C2).
4.  **Output:** Return the corrected entries as JSONL (one JSON object per line).

## Example Prompt for Gemini

```
You are a Zolai (Tedim ZVS) dictionary editor. Verify and correct these entries:
[JSON ENTRIES]

Use ZVS standards. If an entry is correct, mark it as "verified". If wrong, output the corrected JSON.
```

## Tools and Resources
- `references/zvs_rules.md`: Core linguistic rules.
- `data/dictionary/`: Directory containing source wordlists and processed dictionaries.
