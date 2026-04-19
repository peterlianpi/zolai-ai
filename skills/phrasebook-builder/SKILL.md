# Phrasebook Builder Skill

## Purpose
Extract and categorize parallel phrases from corpus into domain-specific phrasebooks for learners.

## Categories
`greetings` | `food` | `travel` | `family` | `numbers` | `time` | `religion` | `health` | `work`

## Entry Schema
```json
{
  "zo": "Na dam maw?",
  "en": "How are you?",
  "category": "greetings",
  "cefr_level": "A1",
  "source": "parallel.jsonl"
}
```

## Workflow
1. Stream `data/master/combined/parallel.jsonl`
2. Filter by category keywords (English side)
3. Validate ZVS compliance via grammar-checker
4. Deduplicate by normalized Zolai text
5. Write to `data/raw/phrasebook/<category>.jsonl`

## CEFR Tagging
- A1: greetings, numbers, family, basic food
- A2: time, travel, health basics
- B1+: work, complex religion, idioms
