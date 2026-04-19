# 9 SOP (Standard Operating Procedure) — Context Expansion

## Overview

The 9 SOP is a standardized framework for enriching dictionary entries with contextual information. Each entry in the Dictionary Rebuild V2 system gets enhanced with these 9 dimensions.

---

## 1. POS (Part of Speech)

**Definition:** Grammatical category of the word

**Categories:**
- **Verb** — Action or state (ne = eat, ka = go)
- **Noun** — Person, place, thing (khat = egg, pasian = God)
- **Adjective** — Describes noun (thlak = good, thla = big)
- **Adverb** — Modifies verb/adjective (ciangin = then, ahih = because)
- **Preposition** — Shows relationship (in = by, a = at)
- **Pronoun** — Replaces noun (ka = I, nang = you)
- **Particle** — Function word (hi = marker, a = marker)
- **Conjunction** — Connects words (leh = and, kei = not)
- **Interjection** — Exclamation (a = oh, ei = hey)

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "pos": "verb"
}
```

---

## 2. Synonyms

**Definition:** Words with similar meaning

**Rules:**
- Include only close synonyms
- Preserve nuance differences
- Link to related entries
- Document register differences

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "synonyms": ["ei", "thei"]
}
```

---

## 3. Antonyms

**Definition:** Words with opposite meaning

**Rules:**
- Include only true opposites
- Document context-dependent antonyms
- Link to related entries

**Example:**
```json
{
  "zo": "thlak",
  "en": "good",
  "antonyms": ["thla", "thla-a"]
}
```

---

## 4. Domains

**Definition:** Subject areas or contexts where the word is used

**Domains:**
- **Religion** — Pasian, gam, tapa, kumpipa
- **Daily Life** — Food, family, home, work
- **Education** — School, learning, teaching
- **Culture** — Customs, traditions, celebrations
- **Government** — Law, politics, administration
- **Healthcare** — Medicine, health, disease
- **Technology** — Modern tools, computers
- **Business** — Commerce, trade, money
- **Nature** — Animals, plants, weather
- **Emotions** — Feelings, states of mind

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "domains": ["daily", "food"]
}
```

---

## 5. Register

**Definition:** Formality level and social context

**Registers:**
- **Formal** — Religious texts, official documents
- **Informal** — Casual conversation, friends
- **Archaic** — Old-fashioned, rarely used
- **Slang** — Colloquial, non-standard
- **Technical** — Specialized terminology
- **Poetic** — Literary, artistic language

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "register": "informal"
}
```

---

## 6. Examples

**Definition:** 2-3 example sentences showing usage

**Rules:**
- Use simple, clear sentences
- Show different contexts
- Include English translation
- Use SOV word order
- Follow ZVS standard

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "examples": [
    "Ka ne hi. (I eat.)",
    "Nang ne hi. (You eat.)",
    "A ne hi. (He/She eats.)"
  ]
}
```

---

## 7. Related Words

**Definition:** Semantically linked entries

**Types:**
- **Synonyms** — Similar meaning
- **Antonyms** — Opposite meaning
- **Compounds** — Words that combine
- **Derivatives** — Words from same root
- **Semantic Field** — Words in same category

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "related": ["khat", "thei", "ne khawh"]
}
```

---

## 8. Etymology

**Definition:** Origin or source of the word

**Information:**
- **Proto-language** — Sino-Tibetan, Tai-Kadai
- **Cognates** — Related words in other languages
- **Historical Changes** — How the word evolved
- **Borrowings** — Words from other languages

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "etymology": "Proto-Sino-Tibetan *s-nik"
}
```

---

## 9. Frequency

**Definition:** How often the word appears in the corpus

**Calculation:**
- Count occurrences in all sources
- Include Bible, news, literature
- Normalize by source size
- Track over time

**Example:**
```json
{
  "zo": "ne",
  "en": "eat",
  "frequency": 156
}
```

---

## Complete Entry Example

```json
{
  "zo": "ne",
  "en": ["eat", "consume"],
  "pos": "verb",
  "synonyms": ["ei", "thei"],
  "antonyms": [],
  "domains": ["daily", "food"],
  "register": "informal",
  "examples": [
    "Ka ne hi. (I eat.)",
    "Nang ne hi. (You eat.)",
    "A ne hi. (He/She eats.)"
  ],
  "related": ["khat", "thei", "ne khawh"],
  "etymology": "Proto-Sino-Tibetan",
  "frequency": 156,
  "confidence": 1.0,
  "source": ["dictionary", "bible"]
}
```

---

## Implementation Guidelines

### For Dictionary Builders
1. Start with POS (most important)
2. Add examples (high value)
3. Add domains (context)
4. Add synonyms/antonyms (relationships)
5. Add related words (semantic field)
6. Add register (formality)
7. Add etymology (optional)
8. Calculate frequency (automatic)

### For Quality Assurance
- ✅ All entries have POS
- ✅ 80%+ entries have examples
- ✅ 70%+ entries have related words
- ✅ All entries have frequency
- ✅ All entries have source

### For Users
- Use POS to understand word type
- Use examples to see usage
- Use synonyms to find alternatives
- Use domains to understand context
- Use register to match formality
- Use related words to explore semantic field

---

## Related Documentation

- [Dictionary Rebuild V2 — System Overview](../dictionary_rebuild_v2/README.md)
- [Dictionary Rebuild V2 — Agent Specifications](../dictionary_rebuild_v2/agents.md)
- [Dictionary Rebuild V2 — Pipeline Guide](../dictionary_rebuild_v2/pipeline.md)

---

**Last Updated:** 2026-04-16T09:05:48Z
