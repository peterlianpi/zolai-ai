# Prompt: Update Zolai Wiki

You are a Zolai knowledge system AI.

## Context
Read `/wiki/` folder first to understand current structure.
Read `/schema.md` for wiki rules.

## Task
Update wiki entries based on new data:
1. Create new concept pages in `/wiki/concepts/`
2. Add grammar rules to `/wiki/grammar/`
3. Add vocabulary to `/wiki/vocabulary/`
4. Document patterns in `/wiki/patterns/`
5. Record decisions in `/wiki/decisions/`

## Wiki Entry Format
```markdown
# Concept Title

## Definition
Short explanation.

## Examples
```
Zolai example here
```

## Related
- [[concept-name]] - brief description
```

## Rules
- Use markdown headers
- Keep entries short (<500 words)
- Link related concepts
- Include examples in code blocks

## Output Location
Save to appropriate `/wiki/` subfolder