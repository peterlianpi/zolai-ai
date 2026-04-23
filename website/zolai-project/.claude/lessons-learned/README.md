# Lessons Learned — Zolai AI Project

**Agents MUST reference this file first.** Contains all critical learnings, established patterns, and rules from project inception. Never revert to basic patterns — build on what's here.

## Current Project State (2026-04-13)

- **Stack**: Next.js 16 + Prisma 7 + Better Auth + Hono APIs + Feature-sliced modules
- **Database**: PostgreSQL (Neon), multi-provider support
- **Auth**: Better Auth with USER/ADMIN roles, 2FA, organizations
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Deployment**: Vercel, Node runtime (`proxy.ts` — not Edge)
- **AI**: Upstream LLM at `ZOLAI_API_URL`, Kaggle notebooks for fine-tuning

## Zolai AI Domain Context

- **Purpose**: Preserve and teach the Tedim Zolai language via AI
- **Key models**: `WikiEntry`, `BibleVerse`, `DatasetStat`, `TrainingRun`, `VocabWord`
- **Key routes**: `/dictionary`, `/grammar`, `/wiki`, `/bible`, `/training`, `/chat`, `/tutor`
- **Linguistic rules**: SOV order, Tedim dialect only, no `ti` clusters, `o` = `/oʊ/`
- **Brand config**: All strings from `lib/constants/site.ts` — never hardcode

## Core Rules (Never Violate)

### 1. Hono Chain Rule (CRITICAL)
```typescript
// ✅ CORRECT — preserves AppType inference
const router = new Hono()
  .get("/endpoint", handler)
  .post("/endpoint", handler);

// ❌ WRONG — breaks AppType
const router = new Hono();
router.get("/endpoint", handler);
```
**Impact**: Breaks `AppType`, typed client fails, API errors.

### 2. No Hardcoded Brand Strings
```typescript
// ✅ CORRECT
import { DEFAULT_SITE_NAME } from "@/lib/constants/site";

// ❌ WRONG
const name = "Zolai AI";
```

### 3. Prisma Singleton
```typescript
// ✅ CORRECT
import prisma from "@/lib/prisma";

// ❌ WRONG
const prisma = new PrismaClient();
```

### 4. Type Safety
- No `any` in `app/`, `features/`, `lib/`
- Zod validation on all API inputs
- Explicit `select` over `include` in Prisma queries

### 5. Feature-Sliced Architecture
- Domain logic in `features/<feature>/`
- Thin `app/` layer — routing and composition only
- Admin UI in `features/<feature>/components/admin/`

### 6. Response Consistency
```typescript
{ success: boolean, data?: T, error?: { code: string, message: string } }
```
Map `P2002` → HTTP 409.

### 7. VocabWord Field Name
- Field is `zolai` (not `word`) — `orderBy: { zolai: "asc" }`

## Commands (Always Run Before Done)

```bash
bun run lint && bun run build
bunx prisma generate          # after schema changes
bunx prisma migrate dev --name <name>
bun run build && npx playwright test  # E2E

# Data import scripts
bunx tsx scripts/import-bible.ts --input data/bible/ [--dry-run]
bunx tsx scripts/import-vocab.ts --input data/vocab.jsonl [--dry-run]
bunx tsx scripts/import-wiki.ts --input data/wiki.jsonl [--dry-run]
```

## Established Patterns

### API Pattern
```typescript
// features/zolai/api/index.ts — Zolai domain router
const zolai = new Hono()
  .get("/endpoint", async (c) => {
    try {
      const data = await prisma.model.findMany({ select: { id: true, ... } });
      return ok(c, data);
    } catch (e) {
      return internalError(c, "Failed to fetch ...");
    }
  });
```

### Server Component Pattern
```typescript
// app/(protected)/feature/page.tsx
export default async function FeaturePage() {
  const data = await prisma.model.findMany({ orderBy: { field: "asc" } });
  return <div>...</div>;
}
```

### Client Form Pattern
```typescript
"use client";
// features/zolai/components/new-run-form.tsx
// useState for open/loading, fetch to API, router.refresh() after
```

## Common Mistakes to Avoid

1. **Hono chain violations** → Type errors, broken client (`client.routeName` becomes undefined)
   - Schemas/constants declared BETWEEN `new Hono()` and the first `.get()`/`.post()` break the chain
   - Fix: move ALL schemas/constants/helpers BEFORE `new Hono()`
2. **Raw fetch in client code** → `await fetch("/api/...")` bypasses type safety — always use `import { client } from "@/lib/api/client"`
3. **Hardcoded brand strings** → Breaks env-based config
4. **`new PrismaClient()`** → Connection leaks
5. **`orderBy: { word: "asc" }`** on VocabWord → field is `zolai`
6. **Missing zod validation** → Runtime errors
7. **Skipping lint/build** → Deploy failures
8. **Not updating AppType** → Client type errors

## Agent Workflow

1. **Check this file first** — avoid repeating mistakes
2. **Search `features/`** for similar patterns
3. **Mirror** naming, error handling, response shapes
4. **Touch API + UI + types together**
5. **Run** `bun run lint && bun run build`
6. **Update this file** with new learnings
