# ZOLAI AI SCHEMA

## Language Rules
- **Primary**: Zolai (Tedim)
- **Script**: Latin (Tedim charset)
- **Sentence structure**: SOV (Subject-Object-Verb) - ZVS standard
- **Ergative marker**: `in` required for transitive verb subjects

## Dataset Rules
- Minimum 5 characters per sentence
- Remove duplicates (hash-based)
- Keep punctuation
- No mixed languages unless labeled `(data_type: mixed)`
- Lowercase for processing, preserve original case

## Data Types
| Type | Description | Example |
|------|-----------|---------|
| `monolingual` | Zolai-only text | `Keimah in an nei.` |
| `parallel` | Zolai + English | `"text": "Keimah in an nei.", "translation_en": "I eat rice."` |
| `lexicon` | Word/phrase entries | `{"headword": "an", "translation": "eat", "pos": "verb"}` |

## Topics
- `religion` - Christian/biblical content
- `education` - Learning materials
- `conversation` - Daily conversation
- `culture` - Cultural practices
- `grammar` - Language rules
- `story` - Narratives/fables
- `news` - Current events

## Language Variants
| Variant | Code | Notes |
|---------|------|------|
| Tedim | `tedim` | Standard Zolai |
| Zomi | `zomi` | Alternate name |
| Falam | `falam` | Dialect |
| Haka | `haka` | Dialect |
| Matu | `matu` | Dialect |

## Valid JSONL Fields
```json
{
  "language": "zolo",
  "dialect": "tedim",
  "text": "Keimah in an nei.",
  "translation_en": "I eat rice.",
  "topic": "conversation",
  "data_type": "parallel",
  "source": "bible",
  "created_at": "2024-01-01"
}
```

## Wiki Rules
- Each concept must link to others via `## Related`
- Use markdown headers (`#`, `##`, `###`)
- Keep entries short (<500 words) and structured
- Include examples in code blocks
- Use frontmatter for metadata

## Quality Gates
- UTF-8 encoding required
- No truncated characters
- No HTML tags
- No placeholder text `[...]`
- Min confidence: 0.8 for translations

## Pipeline Stages
1. **Collect** → `raw/`
2. **Clean** → `clean/`
3. **Label** → `clean/`
4. **Deduplicate** → `clean/`
5. **Export** → `dataset/`

## Training Schemas

### ORPO / DPO Preference Pairs
```json
{
  "prompt": "...",
  "chosen": "...",
  "rejected": "...",
  "source": "...",
  "dialect": "tedim"
}
```

### Instruction Tuning
```json
{
  "instruction": "...",
  "input": "...",
  "output": "...",
  "source": "...",
  "cefr": "A1",
  "dialect": "tedim"
}
```

### Evaluation
```json
{
  "id": "...",
  "question": "...",
  "answer": "...",
  "type": "translation|qa|grammar",
  "dialect": "tedim"
}
```

Last Updated: 2026-04-20
