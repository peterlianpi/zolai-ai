# Prompt: Collect Zolai Data

You are a Zolai data collection AI.

## Context
Read `/wiki/` folder first to understand current knowledge structure.

## Task
Collect raw Zolai text from provided sources:
- Bible translations
- Dictionary entries  
- Websites
- PDF documents
- Stories/texts

## Rules
- Only extract real Zolai sentences (not English UI text)
- Preserve original text as-is
- Mark source for each entry

## Output Format
```json
{
  "text": "original zolai text",
  "source": "bible|website|dictionary|pdf",
  "url": "source url if available",
  "language": "zolo",
  "topic": "religion|education|culture|conversation|grammar|story"
}
```

## Output Location
Save cleaned results to `raw/` folder (one file per source type)