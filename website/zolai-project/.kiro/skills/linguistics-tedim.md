---
name: linguistics-tedim
description: Deep Tedim Zolai linguistics reference — phonology, morphology, syntax, orthography, CEFR levels, corpus structure. Use when working on grammar wiki, tutor curriculum, linguistic analysis, or dataset quality.
---

# Tedim Zolai Linguistics Reference

## Language classification

- Family: Sino-Tibetan → Tibeto-Burman → Kuki-Chin
- Dialect: Tedim ZVS (Zomi Vernacular Standard)
- Speakers: ~500,000 Zomi people (Myanmar, India, diaspora)
- Script: Latin-based orthography

## Phonology

### Vowels
| Grapheme | IPA | Notes |
|---|---|---|
| a | /a/ | open central |
| e | /e/ | mid front |
| i | /i/ | high front |
| o | /oʊ/ | **always diphthong** — never pure /o/ |
| u | /u/ | high back |
| aw | /ɔ/ | open-mid back |

### Consonant restrictions
- No `ti` clusters — use `ci` or restructure
- No `c` + {a, e, o, aw} — `c` only before `i`, `u`
- Initial consonants: p, t, k, b, d, g, m, n, ng, l, s, z, h, v, c

### Tones
Tedim is tonal. Three tones in standard orthography:
- Level (unmarked): `pai`
- Rising: `pái` (rare in standard writing)
- Falling: `pâi` (rare in standard writing)

## Morphology

### Verb system
- Aspect markers: `-in` (completive), `-cing` (progressive)
- Negation: `kei` (conditional), `lo` (simple negative)
- Causative: `-sak`
- Passive: `-na`

### Noun system
- Plural: context-dependent; `i` (we) already implies plural — never add `uh`
- Possessive: suffix `-i` or `-a` depending on person
- Classifier system for counting

### Pronouns
| Person | Singular | Plural |
|---|---|---|
| 1st | `ka` | `i` |
| 2nd | `na` | `na-te` |
| 3rd | `ama` | `ama-te` |

## Syntax

**Word order: SOV** (Subject–Object–Verb)
```
Ka    gal    a    pai.
I     market to   go
"I go to the market."
```

**Postpositions** (not prepositions):
- `a` — directional/locative
- `in` — instrumental/locative
- `leh` — and/with

**Negation patterns:**
- Simple: `Ama pai lo.` (He didn't go.)
- Conditional: `Nong pai kei a leh...` (If you don't go...)
- Never: `nong pai lo a leh` ❌

## CEFR level mapping

| Level | Zolai competency |
|---|---|
| A1 | Greetings, numbers, basic nouns, `ka/na/ama` |
| A2 | Simple SOV sentences, present tense, common verbs |
| B1 | Aspect markers, postpositions, connected sentences |
| B2 | Complex clauses, conditionals, narrative |
| C1 | Idiomatic usage, register variation, formal writing |
| C2 | Native-like fluency, dialect awareness, literary register |

## Orthography rules

- Use standard Tedim ZVS spelling — no dialect variants in primary content
- Capitalize proper nouns and sentence-initial words only
- Sentence-final particle: `hi` (declarative), `maw` (question)
- Quotation: `"..."` same as English

## Corpus structure

| Source | Register | Use |
|---|---|---|
| master_dictionary_semantic.jsonl | Lexical | Dictionary, vocab training |
| parallel.jsonl | Biblical + conversational | Translation pairs |
| sentences.jsonl | Mixed | Language modeling |
| rvasia_tedim.jsonl | Liturgical (Catholic) | Register variation |
| zolai_tedim_hymns.jsonl | Hymnody | Poetic register |
