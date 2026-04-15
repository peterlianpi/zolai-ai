# Task Specifications — Zolai AI

**Agents MUST use these templates for consistent, rule-compliant work.**

## Critical Rules Reminder

1. **Hono Chain Rule**: Always `new Hono().get(...).post(...)`
2. **No hardcoded strings**: Import from `lib/constants/site.ts`
3. **No `any`**: Strict TypeScript everywhere
4. **Feature ownership**: Domain logic in `features/`, thin `app/`
5. **Prisma select**: Explicit field selection only
6. **Response shape**: `{ success: boolean, data?: T, error?: { code, message } }`
7. **VocabWord**: field is `zolai`, not `word`

## Verification Checklist

- [ ] `bun run lint && bun run build` passes
- [ ] TypeScript errors: 0
- [ ] Mirrors existing patterns in same feature area
- [ ] No hardcoded brand strings
- [ ] Hono chain rule followed
- [ ] `AppType` updated if new routes added

---

## Feature Implementation Template

```
TASK: [Brief description]
FILES: [Exact file paths to create/modify]
SIMILAR: [Reference existing similar feature, e.g. features/dictionary/]
SPEC:
- Requirements: [What must be implemented]
- Constraints: [Patterns to follow, Zolai linguistic rules if content-related]
- Acceptance: [How to verify]

STEPS:
1. [Step with file path]
2. [Step mirroring existing pattern]
3. [Verification step]

VERIFICATION:
- bun run lint && bun run build
- [Manual checks]
```

## API Development Template

```
TASK: [Endpoint description]
ENDPOINT: [HTTP method + path, e.g. GET /api/zolai/vocab]
FILES: [Router file, client file if needed]
AUTH: [none | user | admin]
INPUT: [Zod schema]
OUTPUT: [Response shape]

IMPLEMENTATION:
1. Add chained route to [router file]
2. Update AppType export in route.ts if new router
3. Add client wrapper if needed

VERIFICATION:
- TypeScript compiles
- Endpoint responds correctly
- bun run lint && bun run build
```

## Zolai Content Template

```
TASK: [Content feature description]
MODELS: [WikiEntry | BibleVerse | VocabWord | DatasetStat | TrainingRun]
LINGUISTIC_RULES: [List applicable Zolai rules]
FILES: [Page file, component file]

SPEC:
- Display: [What to show]
- Filter/Search: [Query params]
- Empty state: [What to show when no data]

VERIFICATION:
- Correct Prisma query (select, orderBy)
- Empty state handled
- bun run lint && bun run build
```

## Bug Fix Template

```
BUG: [Brief description]
REPRODUCE: [Steps]
ROOT CAUSE: [Why — reference lessons-learned]
FIX: [Solution]
FILES: [Files to modify]
VERIFICATION: [How to confirm fixed]
PREVENTION: [Update lessons-learned]
```

---

## Prompt Engineering Guidelines

### For Users Creating Tasks
- Include exact file paths
- Reference similar existing features
- Specify Zolai linguistic constraints if content-related
- Define how to verify completion

### For Agents Processing Tasks
1. Read `lessons-learned/README.md` first
2. Load relevant skills (`general-development`, `hono-api`, `zolai-project`)
3. Find similar features in `features/` and mirror patterns
4. Run lint/build before marking done
5. Update `lessons-learned/README.md` with new learnings
