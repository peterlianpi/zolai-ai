# Cultural Content Skill

## Purpose
Extract and structure Zo cultural content from resources/ and wiki/ for web display.

## Zo Cultural Vocabulary
| Term | Meaning |
|---|---|
| Zongeina | Zo culture / customs |
| Zola | Zo songs |
| Zo-an | Zo food |
| Zolam | Zo dance |
| Zomi | Zo people |

## Entry Schema
```json
{
  "type": "proverb",
  "title_zo": "Tua hi.",
  "title_en": "That is so.",
  "content_zo": "...",
  "content_en": "...",
  "source": "resources/proverbs.txt",
  "tags": ["wisdom", "A2"]
}
```

## Categories & Sources
| Category | Source |
|---|---|
| proverbs | resources/, wiki/culture/ |
| folklore | resources/stories/ |
| food (Zo-an) | wiki/culture/food.md |
| dance (Zolam) | wiki/culture/dance.md |
| history | wiki/history/ |
| festivals | wiki/culture/festivals.md |
| music (Zola) | resources/hymns/, wiki/culture/ |

## Rules
- Never fabricate — source only from existing files
- Reference `wiki/glossary/zo_compound_words.md` for terminology
- Separate Zongeina (culture) from religious content
