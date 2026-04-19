# AGENTS.md — Zolai AI Web Platform

## 🛠 Commands

```bash
bun run dev                                    # Start dev server
bun run build                                  # Production build (Turbopack)
bun run lint                                   # Lint with ESLint
bunx prisma migrate dev --name <name>          # Create + apply DB migration
bunx prisma generate                           # Regenerate Prisma client
bunx tsx scripts/seed-dictionary.ts            # Seed 24,891 dictionary entries
bunx tsx scripts/import-wiki.ts               # Import 103 wiki .md files from ${ZOLAI_ROOT:-../..}/wiki/
bunx tsx scripts/seed-curriculum.ts           # Seed curriculum: 6 levels × 5 sections × units × 8 sub-units + phonics track
bunx tsx scripts/seed-curriculum-content.ts   # Fill exercise content for all sub-units (1,008 curriculum + 144 phonics)
```

**Testing (Playwright):**
```bash
npx playwright test                            # Run all E2E tests
npx playwright test --ui                       # UI mode
npx playwright test -g "search query"          # Filter by title
```

---

## ✅ Code Compliance Checks (run after EVERY edit)

All four must return **zero output**. Fix before committing.

```bash
# 1. No raw fetch("/api/...") in client code
grep -rn "await fetch\b" features app --include="*.ts" --include="*.tsx" | grep -v "/api/chat\|zolai/api/index"

# 2. No loose Hono method calls (must use chaining)
find features app/api -name "*.ts" | while read f; do
  var=$(grep -oP "^const \K\w+(?= = new Hono\(\))" "$f" | head -1)
  [ -n "$var" ] && grep -qP "^${var}\.(get|post|patch|delete|put)\(" "$f" && echo "LOOSE: $f"
done

# 3. No local hc<AppType> instances (use @/lib/api/client)
grep -rn "hc<" features app --include="*.ts" --include="*.tsx" | grep -v "lib/api/client.ts"

# 4. No hono-client imports
grep -rn "hono-client" features app --include="*.ts" --include="*.tsx"
```

---

## 📐 Architecture Rules

- `app/*` is thin — all domain logic lives in `features/*`
- TypeScript strict mode — **never use `any`**; use `unknown` or specific types
- Zod validation required for all API inputs via `@hono/zod-validator`
- API responses: `{ success: boolean, data?: T, error?: { code, message } }`
- Use `select` over `include` in Prisma to prevent over-fetching
- RSC by default; `"use client"` only when hooks/interactivity required
- `proxy.ts` replaces `middleware.ts` (Node.js, not Edge)
- Server Actions preferred for all write operations

### Naming
- Components: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- API routes: lowercase with hyphens
- Feature folders: `features/<feature>/` with `components/`, `hooks/`, `api/`, `types.ts`

### Hono Chain Rule
- Declare ALL schemas, constants, and helpers **before** `new Hono()` — never between `new Hono()` and the first `.get()`/`.post()` call
- Breaking the chain causes `Property 'routeName' does not exist` TS errors on the RPC client
- Pattern: `const Schema = z.object({...})` → `const app = new Hono().get(...).post(...)`

### No Raw Fetch
- Never use `await fetch("/api/...")` in client code
- Always use the typed Hono RPC client: `import { client } from "@/lib/api/client"`

### Error Handling
- Server Actions: return `{ success: false, error: "message" }`
- API Routes: return `{ error: { code, message } }` on failure
- Prisma P2002: return `409 Conflict`
- Client: use `toast` from `sonner`
- Never expose raw stack traces or DB internals

---

## 💾 Database

**Provider:** PostgreSQL (Neon) via `@prisma/adapter-pg`

| Model | Purpose |
|---|---|
| `VocabWord` | 24,891 ZO↔EN dictionary entries with synonyms, antonyms, related, examples |
| `BibleVerse` | Tedim Bible parallel corpus (TDB77, Tedim2010, KJV) |
| `WikiEntry` | Linguistics wiki (grammar, phonology, culture) |
| `DatasetStat` | Dataset size/quality metrics |
| `TrainingRun` | LLM fine-tuning run tracking |

**Seed:**
```bash
bunx prisma migrate dev --name add-vocab-semantic-fields
bunx tsx scripts/seed-dictionary.ts
# Source: ${ZOLAI_ROOT:-../..}/data/processed/master_dictionary_semantic.jsonl
```

---

## 🌐 API Structure

All routes mount via `app/api/[[...route]]/route.ts` using Hono RPC chain.

| Router | Mount | Feature |
|---|---|---|
| `dictionary` | `/api/dictionary` | `features/dictionary/api/` |
| `zolai` | `/api/zolai` | `features/zolai/api/` |
| `chatRouter` | `/api/chat` | `features/zolai/api/` (exported separately) |
| `grammar` | `/api/grammar` | `features/grammar/api/` |
| `translation` | `/api/translation` | `features/translation-tools/api/` |
| `forum` | `/api/forum` | `features/forum/api/` |
| `lessons` | `/api/lessons` | `features/lessons/api/` |
| `audio` | `/api/audio` | `features/audio-pronunciation/api/` |
| `agentMemory` | `/api/agent-memory` | `features/agent-memory/api/` |
| `curriculum` | `/api/curriculum` | `features/curriculum/api/` — sections, units, sub-units, phonics |
| `auth` | `/api/auth` | Better Auth |

See `docs/api/API.md` for full endpoint reference.

---

## 🧠 Zolai Language Rules (enforced in tutor system prompt)

- **Dialect:** Tedim ZVS only
- **Use:** `pasian`, `gam`, `tapa`, `topa`, `kumpipa`, `tua`
- **Never:** `pathian`, `ram`, `fapa`, `bawipa`, `siangpahrang`, `cu/cun`
- **Word order:** SOV
- **Negation:** `nong pai kei a leh` — never `lo leh`
- **Plural:** never `I ... uh hi` — `i` already implies plural
- **Phonology:** `o` = /oʊ/; no `ti` clusters; no `c` + {a,e,o,aw}
- **Tutor:** Socratic method, ≤4 lines, CEFR A1–C2 adaptive

---

## 📁 Key File Locations

| File | Purpose |
|---|---|
| `prisma/schema.prisma` | Full DB schema |
| `scripts/seed-dictionary.ts` | Import JSONL → VocabWord |
| `features/zolai/api/index.ts` | Chat, wiki, bible, training, vocab, grammar |
| `features/dictionary/api/index.ts` | Dictionary search/lookup |
| `lib/api/response.ts` | `ok`, `error`, `notFound`, `internalError` helpers |
| `lib/auth/server-guards.ts` | `requireAdmin`, `requireAuth`, `requirePermission`, `checkIsAdmin` for protected routes |

---

## 📂 Docs Structure

```
docs/
├── api/              # API reference (API.md)
├── audit/            # Codebase audits, compliance, security reviews
├── auth/             # Better Auth docs, refactoring guides
├── features/         # Feature-specific implementation docs
├── mcp/              # MCP server setup and registry
├── planning/         # Roadmaps, MVP plans, branching strategy
├── references/       # Library quick-refs (Prisma, Hono, shadcn, etc.)
├── testing/          # Testing strategy and monitoring guides
└── archive/          # Starter template / generic Next.js docs
```
