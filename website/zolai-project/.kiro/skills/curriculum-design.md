---
name: curriculum-design
description: Zolai curriculum design patterns — Duolingo-style structure, section/unit/sub-unit layout, XP system, lesson plan format. Use when designing or seeding curriculum content.
---

# Curriculum Design — Zolai Platform

## Structure overview

```
Level (A1–C2)
└── Section 1–4  (content, vocab-gated)
└── Section 5    (Daily Refresh, always unlocked)
    └── Unit (topic)
        └── SubUnit × 8  (fixed types, fixed order)
            └── Lessons (exercises, 5–10 per sub-unit)
```

## Level vocab ranges

| Level | Total vocab | Base |
|-------|-------------|------|
| A1 | 60–129 | 60 |
| A2 | 130–249 | 130 |
| B1 | 250–499 | 250 |
| B2 | 500–999 | 500 |
| C1 | 1000–1999 | 1000 |
| C2 | 2000–4999 | 2000 |

## Section vocab ranges (offset from level base)

| Section | Offset | A1 example |
|---------|--------|------------|
| 1 | base+0 → base+19 | 60–79 |
| 2 | base+20 → base+39 | 80–99 |
| 3 | base+40 → base+54 | 100–114 |
| 4 | base+55 → base+max | 115–129 |
| 5 | Daily Refresh | no new vocab |

## 8 sub-unit types (always in this order)

| # | Type | Exercise types | XP |
|---|------|---------------|----|
| 1 | INTRODUCTION | explanation only | 5 |
| 2 | VOCABULARY | tap_correct, match_pairs | 10 |
| 3 | GRAMMAR | fill_blank, arrange_words | 10 |
| 4 | LISTENING | dictation, multiple_choice | 10 |
| 5 | SPEAKING | speak_sentence | 10 |
| 6 | READING | translate, multiple_choice | 10 |
| 7 | REVIEW | mixed (all types) | 10 |
| 8 | CHALLENGE | harder, error_correction | 20 |

## Lesson exercise types

| Type | Description |
|------|-------------|
| translate | EN→ZO or ZO→EN |
| fill_blank | Complete sentence |
| multiple_choice | Pick correct answer |
| match_pairs | Match word to translation |
| tap_correct | Tap correct word from bank |
| arrange_words | Put words in SOV order |
| dictation | Hear and type |
| speak_sentence | Read sentence aloud |
| error_correction | Find dialect/grammar error |

## Recommended unit topics per section (A1 example)

**Section 1 (60–79 vocab):** Greetings, Numbers 1–10, Colors, Family members, Body parts
**Section 2 (80–99 vocab):** Food & drink, Animals, Daily routines, Weather, Home
**Section 3 (100–114 vocab):** Verbs of motion, Time expressions, Simple questions, Negation
**Section 4 (115–129 vocab):** Emotions, Clothing, Market/shopping, Simple stories, Review

## Daily Refresh (Section 5)
- Spaced repetition of all prior vocab
- 5 exercises per session, adaptive difficulty
- Always unlocked — no gate
- 5 XP per session + streak bonus

## Duolingo improvements for Zolai
1. **Error correction exercises** — enforce Tedim ZVS dialect (no `pathian`, `ram` etc.)
2. **Bible corpus examples** at B1+ — real sentences from TDB77
3. **Cultural notes** in INTRODUCTION sub-units
4. **Phonics cross-reference** in VOCABULARY sub-units (e.g. "note: o = /oʊ/")
5. **SOV arrangement exercises** — unique to Zolai, not in standard Duolingo
6. **Tone drills** integrated into LISTENING sub-units at A2+

## Workflow: Linguistics → Curriculum → Tutor → Assessment

1. **Linguistics dept** defines vocab list + grammar rules for unit
2. **Curriculum dept** designs 8 sub-units, writes exercise content
3. **Tutor dept** writes INTRODUCTION text + hint system
4. **Assessment dept** sets pass thresholds + XP values
5. **Phonics dept** adds phonics cross-references to VOCABULARY sub-units
6. **QA** checks dialect compliance + answer accuracy
