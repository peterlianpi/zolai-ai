---
name: lesson-curriculum
description: Zolai language lesson and curriculum structure — CEFR levels, patterns, vocabulary, lesson formats, exercise types. Use when planning lessons, writing tutor prompts, or building the grammar/lessons feature.
---

# Lesson Curriculum — Zolai Platform

## CEFR level map

| Level | Focus | Key patterns | Core vocab |
|---|---|---|---|
| A1 | Foundational identity, simple existence | `[S] pen [N] hi.`, `Ka lum hi.` | Pasian, Mi, Pai, Ne, Lum, Tui, Ni |
| A2 | Narrative sequencing, spatial placement | `Tua ciangin...`, `Ka pai ding hi.` | Inn, Mual, Tuni, Zingsang, Nitak |
| B1 | Interrogatives, cause-effect, comparisons | `Bang hang hiam...`, `Ahih manin...` | Bang hang, Ahih manin, Sangin, Hiam |
| B2 | Conditional logic, disjunctive conjunctions | `Nong pai kei a leh...`, `Ahih kei leh...` | Kei a leh, Thukhenna, Kamciam |
| C1 | Metaphor, complex embedded clauses | `Kei pen nuntakna an ka hi hi.` | Nuntakna, Hehpihna, Longal, Bek nangawn |
| C2 | Visionary literature, doxology, poetic parallelism | `...ka khuadak leh vantungah...` | Ka khuadak leh, Kilawm, Minthan'na |

## Content sourcing (MANDATORY — never invent Zolai sentences)

All lesson content MUST come from the database:

```ts
// Vocab for a topic
const words = await prisma.vocabWord.findMany({
  where: { category: { contains: topic, mode: 'insensitive' } },
  select: { zolai: true, english: true, pos: true, example: true },
  take: 10,
});

// Grammar rules
const rules = await prisma.wikiEntry.findMany({
  where: { category: { in: ['grammar', 'phonology', 'morphology'] } },
  select: { title: true, content: true },
});

// Bible examples (B1+)
const verses = await prisma.bibleVerse.findMany({
  where: { book: 'John' },
  select: { tdb77: true, kjv: true },
  take: 3,
});
```

Validate every generated sentence with Gemini (rotate 3 keys):
```ts
// GEMINI_API_KEY, GEMINI_API_KEY_2, GEMINI_API_KEY_3
```

## Lesson structure (standard)

```
1. Warm-up (2 min)     — review previous vocab/pattern
2. Introduction (5 min) — new pattern or grammar point
3. Examples (5 min)    — 3 corpus examples with translation
4. Practice (10 min)   — guided exercises (fill-in, translate, produce)
5. Production (5 min)  — student creates own sentences
6. Review (3 min)      — summarize, preview next lesson
```

## Exercise types

| Type | Description | Best for |
|---|---|---|
| Fill-in-the-blank | Complete sentence with correct form | Grammar patterns |
| Translation | EN→ZO or ZO→EN | Vocabulary, syntax |
| Error correction | Find and fix dialect/grammar errors | Dialect enforcement |
| Sentence production | Create original sentence using target pattern | Fluency |
| Listening/reading | Corpus passage + comprehension questions | C1–C2 |
| Dialogue | Role-play conversation | A2–B2 |

## Tutor modes

- `conversation` — daily life, Zomi cultural context, SOV practice
- `grammar` — explicit rule teaching with corpus examples
- `translation` — EN↔ZO with cultural notes
- `reading` — Bible corpus or wiki passages + comprehension

## Tutor constraints (all levels)

- Socratic method — never give direct answers
- ≤ 4 lines per response
- Respond in Zolai first, explain in English
- Correct errors by showing proper form, not just flagging
- Adapt difficulty based on student responses

## Lesson content sources

- Vocabulary: `VocabWord` model (24,891 entries, filtered by `pos` and `category`)
- Examples: `VocabWord.examples` field
- Reading passages: `BibleVerse` model (TDB77 + KJV alignment)
- Grammar rules: `WikiEntry` model (category: grammar/phonology/morphology)
