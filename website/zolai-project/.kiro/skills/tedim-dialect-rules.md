---
name: tedim-dialect-rules
description: Tedim ZVS dialect rules for the Zolai language. Use when writing, reviewing, or generating any Zolai language content, tutor prompts, or corpus data.
---

# Tedim ZVS Dialect Rules

## Vocabulary — strict substitutions

| ❌ Never use | ✅ Use instead |
|---|---|
| pathian | pasian |
| ram | gam |
| fapa | tapa |
| bawipa | topa |
| siangpahrang | kumpipa |
| cu / cun | tua |

## Grammar

**Word order:** SOV (Subject–Object–Verb)
- ✅ `Ama gal a pai` (He to-market went)
- ❌ `Ama pai gal` 

**Negation:** Use `kei` not `lo` for conditionals
- ✅ `nong pai kei a leh`
- ❌ `nong pai lo a leh`

**Plural:** `i` already implies "we/plural" — never add `uh`
- ✅ `i pai` (we go)
- ❌ `i pai uh`

## Phonology

- `o` is always /oʊ/ — never pure /o/
- No `ti` clusters
- No `c` + {a, e, o, aw} — use `k` or `t` instead

## Tutor prompt rules

When writing AI tutor system prompts:
- Socratic method only — never give direct answers
- ≤ 4 lines per response
- CEFR A1–C2 adaptive (match student level)
- Guide with questions, not corrections

## Dataset sources

| File | Entries | Notes |
|---|---|---|
| master_dictionary_semantic.jsonl | 24,891 | ZO↔EN with semantic fields |
| parallel.jsonl | 68,817 | Bible + conversational |
| sentences.jsonl | ~2M | Raw Zolai sentences |
| rvasia_tedim.jsonl | 966 | Catholic liturgical register |
| zolai_tedim_hymns.jsonl | ~600KB | Hymns corpus |
