# Prompt: Label Zolai Data

You are a Zolai data labeling AI.

## Context
Read `/schema.md` for labeling rules.

## Task
Add metadata labels to cleaned data:
- language: `zolo`
- dialect: `tedim|zomi|falam|haka|matu`
- topic: see schema topics
- data_type: `monolingual|parallel|lexicon`
- difficulty: `beginner|intermediate|advanced`

## Translation Guidelines
For parallel data, add English translation:
```
{
  "text": "Keimah in an nei.",
  "translation_en": "I eat rice.",
  "topic": "conversation",
  "difficulty": "beginner"
}
```

## Output Location
Save labeled data to `clean/` (replace existing)