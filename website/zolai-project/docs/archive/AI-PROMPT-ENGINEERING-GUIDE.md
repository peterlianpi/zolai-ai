# AI Agent Prompt Engineering Guide

> How to write effective prompts for AI-assisted development in this codebase.

---

## Table of Contents

1. [Prompt Anatomy](#1-prompt-anatomy)
2. [Prompt Templates by Task Type](#2-prompt-templates-by-task-type)
3. [What Makes a Good Prompt](#3-what-makes-a-good-prompt)
4. [Common Mistakes & Fixes](#4-common-mistakes--fixes)
5. [Subagent Team Coordination](#5-subagent-team-coordination)
6. [Verification Prompts](#6-verification-prompts)
7. [Codebase-Specific Context](#7-codebase-specific-context)

---

## 1. Prompt Anatomy

Every effective prompt has these components:

```
┌─────────────────────────────────────────┐
│ 1. TASK: Clear, specific action         │
│ 2. CONTEXT: Current state, target state │
│ 3. CONSTRAINTS: What NOT to change      │
│ 4. PATTERNS: What to follow             │
│ 5. OUTPUT: What to return               │
└─────────────────────────────────────────┘
```

### Example Breakdown

```markdown
Your task: Extract admin user management routes from admin.ts into a feature router.

Context:
- Current: Routes are inline in app/api/[[...route]]/admin.ts (lines 184-266)
- Target: New file at features/users/server/admin-router.ts
- Pattern: Follow features/content/server/router.ts structure

What to do:
1. Read admin.ts and find all user-related routes
2. Create new router file with those routes
3. Use ok(), list(), notFound() from @/lib/api/response
4. Update admin.ts to import and mount the new router

Rules:
- Do NOT break any other admin routes
- Keep all Prisma queries unchanged
- Mounted path must stay /admin/users

Return:
- Summary of changes made
- Confirmation no other routes were affected
```

---

## 2. Prompt Templates by Task Type

### 2.1 Extract Router

```markdown
Your task: Extract [feature] routes from [source file] into [target file].

Context:
- Current: Routes are inline in [source]
- Target: New file at [target path]
- Pattern: Follow [existing router] structure

What to do:
1. Read [source] and find all [feature]-related routes
2. Create new router with those routes
3. Use response helpers from @/lib/api/response
4. Update [source] to import and mount new router
5. Add revalidateTag calls after mutations

Rules:
- Do NOT break other routes
- Keep all business logic unchanged
- Use proper types from @/lib/generated/prisma/models
- Mounted path must stay the same

Return:
- Changes summary
- Safety confirmation
```

### 2.2 Standardize API Responses

```markdown
Your task: Standardize [file] to use lib/api/response.ts helpers.

Context:
- Current: Uses raw c.json() calls
- Available helpers: ok, created, list, notFound, badRequest, conflict, forbidden

What to do:
1. Read [file] completely
2. Replace c.json({ success: true, data }) with ok(c, data)
3. Replace c.json({ success: true, data }, 201) with created(c, data)
4. Replace paginated responses with list(c, data, meta)
5. Replace error responses with appropriate helpers

Rules:
- Do NOT change business logic
- Keep all validation and Prisma queries
- Response shape must stay { success, data?, error? }

Return:
- Table of changes (route, before, after)
- Lint status
```

### 2.3 Add Cache Invalidation

```markdown
Your task: Add cache invalidation to [feature] mutations.

Context:
- Cache tags defined in: features/settings/server/constants.ts
- Current mutations in: [file]
- Tags to use: [TAG_NAME], [PUBLIC_LAYOUT_CACHE_TAG]

What to do:
1. Import revalidateTag from next/cache
2. Import cache tag constants
3. Add revalidateTag calls after each mutation
4. Use "max" as second argument for immediate invalidation

Rules:
- Add after successful operations only
- Don't add before validation
- Keep existing audit logging

Return:
- List of mutations updated
- Tags used for each
```

### 2.4 Fix Type Errors

```markdown
Your task: Fix type errors in [file] without using `any`.

Context:
- Current error: [paste error message]
- File location: [path]
- Related types: [list related type files]

What to do:
1. Read the file and understand the type mismatch
2. Use proper types from @/lib/generated/prisma/models or @/lib/types/
3. Create new interfaces if needed in [feature]/types.ts
4. Use Record<string, unknown> instead of any for dynamic objects

Rules:
- Never use `any`
- Use `unknown` if type is truly dynamic
- Extend Prisma models instead of redefining
- Use SerializedPrismaModel for API responses

Return:
- What was wrong
- How it was fixed
- Types used
```

### 2.5 Move Feature Logic

```markdown
Your task: Move [feature] logic from app/* to features/*.

Context:
- Current: [app file] contains [X lines] of feature logic
- Target: features/[feature]/components/[component].tsx
- Pattern: Thin app wrapper, feature component owns logic

What to do:
1. Create feature component in features/[feature]/components/
2. Move all business logic, state, API calls to feature component
3. Create thin wrapper in app/* that imports feature component
4. Keep admin shell in features/admin/components/
5. Keep domain logic in features/[domain]/components/

Rules:
- app/* should only wire routes to features
- Admin shells go in features/admin/*
- Domain logic goes in features/[domain]/*
- Use absolute imports (@/features/...)

Return:
- New file structure
- What moved where
- Import changes
```

---

## 3. What Makes a Good Prompt

### ✅ Good Prompt Characteristics

1. **Specific** — Names exact files, lines, functions
2. **Bounded** — Clear scope, not "fix everything"
3. **Contextual** — References existing patterns to follow
4. **Constrained** — Explicitly states what NOT to change
5. **Verifiable** — Asks for confirmation of safety

### ❌ Bad Prompt Characteristics

1. **Vague** — "Fix the code", "improve performance"
2. **Unbounded** — "Refactor the whole app"
3. **Contextless** — No reference to existing patterns
4. **Unconstrained** — No safety boundaries
5. **Unverifiable** — No way to confirm correctness

### Comparison Table

| Aspect | Bad | Good |
|--------|-----|------|
| Scope | "Fix types" | "Replace `any` in features/comments/hooks/use-comments.ts with Comment type from features/comments/types.ts" |
| Context | None | "Follow the pattern in features/content/server/router.ts" |
| Constraints | None | "Do NOT change Prisma queries or business logic" |
| Output | None | "Return table of changes and lint status" |

---

## 4. Common Mistakes & Fixes

### Mistake 1: Too Broad
```
❌ "Standardize all API routes"
✅ "Standardize app/api/[[...route]]/forms.ts to use response helpers"
```

### Mistake 2: Missing Context
```
❌ "Move the router"
✅ "Extract menus router from app/api/[[...route]]/menus.ts to features/menus/server/router.ts, keeping mounted path /api/menus"
```

### Mistake 3: No Constraints
```
❌ "Fix type errors"
✅ "Fix type errors in features/auth/components/password-input.ts without using `any`. Use FieldValues from react-hook-form for dynamic field names."
```

### Mistake 4: No Verification
```
❌ "Do the changes"
✅ "Make changes, run bun run lint, and confirm 0 errors"
```

---

## 5. Subagent Team Coordination

### When to Use Subagents

Use subagents when:
- Multiple independent files need changes
- Tasks can run in parallel without conflicts
- Each task has clear boundaries

Don't use subagents when:
- Changes depend on each other
- Files overlap or conflict
- Sequential order matters

### Parallel Task Distribution

```
Task: Standardize API responses across 4 files

Agent 1: app/api/[[...route]]/forms.ts
Agent 2: app/api/[[...route]]/audit.ts
Agent 3: app/api/[[...route]]/media.ts
Agent 4: app/api/[[...route]]/admin.ts (response helpers only)
```

### Sequential Task Distribution

```
Task: Extract feature routers (must be sequential)

Step 1: Extract menus router
Step 2: Update app/api route.ts to import new router
Step 3: Verify lint passes
Step 4: Extract settings router
Step 5: Verify lint passes
```

### Coordination Prompt
```markdown
You are one of 4 agents standardizing API responses.

Your specific file: [file path]
Other agents are handling: [list other files]

Rules:
- Only modify your assigned file
- Use the same response helpers as other agents
- Run bun run lint after your changes
- Report your changes so others can avoid conflicts

Return:
- Your changes summary
- Lint status
- Any potential conflicts with other files
```

---

## 6. Verification Prompts

### After Changes
```markdown
Verify the changes you just made:

1. Run bun run lint — confirm 0 errors
2. Check that [specific route] still works
3. Confirm no other files were affected
4. Report any warnings (even if unrelated)

Return:
- Lint output
- Confirmation of safety
- Any warnings found
```

### Before Committing
```markdown
Before we commit these changes:

1. Run bun run lint
2. Check git status for unexpected changes
3. Verify all modified files are intentional
4. Report any files that shouldn't be committed

Return:
- Clean git status
- List of intended changes
- Confirmation to proceed
```

---

## 7. Codebase-Specific Context

### Project Conventions to Reference

Always mention these in prompts:

```markdown
Project conventions to follow:
- Use @/ alias for absolute imports
- RSC by default, "use client" only when needed
- Server Actions for mutations
- Hono for API routes with zValidator
- Response helpers from @/lib/api/response
- Prisma types from @/lib/generated/prisma/models
- Feature types in features/<feature>/types.ts
- Cache tags from features/settings/server/constants.ts
```

### Common Import Paths

```typescript
// Response helpers
import { ok, created, list, notFound, badRequest, conflict } from "@/lib/api/response";

// Prisma types
import type { PostWhereInput, UserWhereInput } from "@/lib/generated/prisma/models";

// Cache tags
import { PUBLIC_LAYOUT_CACHE_TAG, SITE_SETTINGS_CACHE_TAG } from "@/features/settings/server/constants";

// Feature types
import type { Comment, CommentStats } from "@/features/comments/types";
```

### File Structure Reference

```
app/api/[[...route]]/     → Thin wrappers only
features/<name>/
  server/router.ts        → Hono routers
  components/             → React components
  hooks/                  → React Query hooks
  api/                    → Client API helpers
  types.ts                → Feature types
  schemas/                → Zod validation
lib/
  types/                  → Shared global types
  api/response.ts         → Response helpers
  generated/prisma/       → Generated types
```

---

## Quick Reference: Prompt Checklist

Before sending any prompt, verify:

- [ ] Task is specific and bounded
- [ ] Context includes file paths and patterns
- [ ] Constraints explicitly state what NOT to change
- [ ] Output format is specified
- [ ] Verification step is included
- [ ] Codebase conventions are referenced

---

*Last updated: 2026-04-08*