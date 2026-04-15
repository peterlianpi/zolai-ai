---
name: feature-structure
description: How to scaffold a new feature in this project. Use when adding a new feature folder or asking about project structure conventions.
---

# Feature Structure — Zolai Project

## Standard layout

```
features/<feature>/
  api/
    index.ts          # Hono router — export default router
  components/
    FeaturePage.tsx   # RSC by default; "use client" only if needed
  hooks/
    index.ts          # TanStack Query hooks + key factory
  server/
    queries.ts        # Server-side data fetching (RSC / Server Actions)
  types/
    index.ts          # Zod schemas + inferred TS types (or types.ts)
  keys.ts             # (optional) query key factory if not in hooks/index.ts
```

## Naming rules

- Components: `PascalCase`
- Hooks: `camelCase` with `use` prefix
- API routes: lowercase with hyphens
- Feature folders: lowercase with hyphens

## Adding a new feature checklist

1. Create `features/<name>/api/index.ts` — Hono router, `export default`
2. Mount in `app/api/[[...route]]/route.ts` — add `.route("/name", router)` to the `routes` chain
3. Export `AppType` is inferred automatically — client gets type-safe access immediately
4. Add types in `features/<name>/types/index.ts` (Zod + inferred)
5. Server queries in `features/<name>/server/queries.ts`
6. Client hooks in `features/<name>/hooks/index.ts` using `client` from `@/lib/api/client`
7. Components in `features/<name>/components/`
8. Pages in `app/(routes)/...` — thin, import from features only

## app/* is thin — example page

```tsx
// app/(routes)/dictionary/page.tsx
import { DictionaryPage } from "@/features/dictionary/components/DictionaryPage";
export default function Page() { return <DictionaryPage />; }
```

## Hook file pattern (canonical)

```ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

export const featureKeys = {
  all:    () => ["feature"] as const,
  list:   (page: number) => ["feature", "list", page] as const,
  detail: (id: string)   => ["feature", "detail", id] as const,
};

export function useFeatureList(page = 1) {
  return useQuery({
    queryKey: featureKeys.list(page),
    queryFn: async () => {
      const res = await client.api.feature.$get({ query: { page: String(page) } });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    placeholderData: prev => prev,
  });
}
```

## Server Action pattern

```ts
"use server";
export async function createEntry(data: unknown) {
  const parsed = schema.safeParse(data);
  if (!parsed.success) return { success: false, error: "Invalid input" };
  try {
    await prisma.model.create({ data: parsed.data, select: { id: true } });
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create" };
  }
}
```

## Route mounting (app/api/[[...route]]/route.ts)

The `routes` const is typed as `const` — adding a new `.route()` automatically extends `AppType` and the Hono client gets full type inference.

```ts
const routes = app
  .route("/existing", existingRouter)
  .route("/my-new-feature", myRouter) // ← add here
  // ...
  as const;

export type AppType = typeof routes;
```
