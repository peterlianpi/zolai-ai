# Cross-Feature Import Rules

## Overview

This document defines the rules for importing code across features and layers in the Zolai AI project. Following these rules keeps the codebase modular, prevents circular dependencies, and makes features independently testable.

---

## Layer Hierarchy

```
app/          ← thin Next.js routes/pages only
features/     ← domain logic, components, hooks, API routes
lib/          ← shared utilities, clients, helpers
components/   ← shared UI primitives (no domain logic)
```

Imports flow **downward only**:

```
app → features → lib → (external packages)
app → lib
app → components
features → components
```

---

## Rules

### 1. `app/` is thin — no domain logic

`app/` files may only:
- Import from `features/` (page-level components and server actions)
- Import from `lib/` (auth helpers, config)
- Import from `components/` (shared UI)

`app/` must **never** contain business logic. Move it to `features/`.

### 2. Features are isolated — no cross-feature imports

A feature must **not** import directly from another feature's internals.

```ts
// ❌ FORBIDDEN
import { DictionarySearch } from "@/features/dictionary/components/DictionarySearch";
// inside features/zolai/components/ChatPanel.tsx

// ✅ ALLOWED — import from lib/ shared utilities
import { ok } from "@/lib/api/response";
```

**Exception:** A feature may import from another feature's **public barrel export** (`index.ts`) if one is explicitly provided and documented. Currently no cross-feature barrels exist — avoid cross-feature imports entirely.

### 3. `lib/` is shared — no feature imports

`lib/` must **never** import from `features/`.

```ts
// ❌ FORBIDDEN
import { buildChatPayload } from "@/features/zolai/utils";
// inside lib/ai/providers.ts
```

`lib/` is the foundation layer. It may only import from other `lib/` modules or external packages.

### 4. API clients — use `@/lib/api/client`

Never instantiate `hc<AppType>` directly in feature or app code. Always use the shared client:

```ts
// ❌ FORBIDDEN
import { hc } from "hono/client";
const client = hc<AppType>("/api");

// ✅ ALLOWED
import { api } from "@/lib/api/client";
```

### 5. No raw `fetch("/api/...")` in client code

Use the typed Hono RPC client instead of raw fetch for internal API calls:

```ts
// ❌ FORBIDDEN
const res = await fetch("/api/dictionary/search?q=lungdam");

// ✅ ALLOWED
const res = await api.dictionary.search.$get({ query: { q: "lungdam" } });
```

Exception: `fetch` is allowed in `features/zolai/api/index.ts` for the external LLM proxy (`/api/chat`) and in `lib/api/client.ts` itself.

### 6. Hono routers — chaining only, no loose method calls

```ts
// ❌ FORBIDDEN (loose call)
const app = new Hono();
app.get("/search", handler);

// ✅ ALLOWED (chained)
const app = new Hono()
  .get("/search", handler)
  .post("/create", handler);
```

---

## Allowed Import Patterns by Layer

| From \ To        | `app/` | `features/` | `lib/` | `components/` | External |
|------------------|--------|-------------|--------|---------------|----------|
| `app/`           | ✅      | ✅           | ✅      | ✅             | ✅        |
| `features/<X>/`  | ❌      | ❌ (other)   | ✅      | ✅             | ✅        |
| `lib/`           | ❌      | ❌           | ✅ (other lib) | ❌       | ✅        |
| `components/`    | ❌      | ❌           | ✅      | ✅ (other)     | ✅        |

---

## Feature Folder Structure

Each feature follows this layout:

```
features/<feature>/
  api/          ← Hono router (server-only)
  components/   ← React components
  hooks/        ← Client-side hooks
  server/       ← Server Actions and server utilities
  types.ts      ← Shared types for this feature
```

Only `types.ts` and `components/` may be imported by `app/`. The `api/` folder is mounted via `app/api/[[...route]]/route.ts` and never imported directly by pages.

---

## Compliance Checks

Run these after every edit (from `AGENTS.md`):

```bash
# No raw fetch in client code
grep -rn "await fetch\b" features app --include="*.ts" --include="*.tsx" | grep -v "/api/chat\|zolai/api/index"

# No loose Hono method calls
find features app/api -name "*.ts" | while read f; do
  var=$(grep -oP "^const \K\w+(?= = new Hono\(\))" "$f" | head -1)
  [ -n "$var" ] && grep -qP "^${var}\.(get|post|patch|delete|put)\(" "$f" && echo "LOOSE: $f"
done

# No local hc<AppType> instances
grep -rn "hc<" features app --include="*.ts" --include="*.tsx" | grep -v "lib/api/client.ts"

# No hono-client imports
grep -rn "hono-client" features app --include="*.ts" --include="*.tsx"
```

All four must return **zero output**.
