---
name: react-query-hooks
description: TanStack Query + Hono RPC client patterns for this project. Use when writing hooks in features/*/hooks/. The canonical pattern from features/dictionary/hooks/index.ts.
---

# React Query + Hono Client Hooks — Zolai Project

## Client import (always this, never raw fetch)

```ts
import { client } from "@/lib/api/client";
// client.api.<route>.<method>.$get/post/patch/delete(...)
```

## Canonical hook pattern (from features/dictionary/hooks/index.ts)

```ts
"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/api/client";
import type { MyType } from "../types";

// 1. Query key factory — always in the same file
export const myKeys = {
  all:    () => ["my-feature"] as const,
  list:   (page: number) => ["my-feature", "list", page] as const,
  detail: (id: string)   => ["my-feature", "detail", id] as const,
};

// 2. List query
export function useMyList(page = 1) {
  return useQuery({
    queryKey: myKeys.list(page),
    queryFn: async () => {
      const res = await client.api["my-feature"].$get({ query: { page: String(page) } });
      if (!res.ok) throw new Error("Fetch failed");
      return res.json(); // { success: true, data: [...], meta: { total, page, limit, totalPages } }
    },
    placeholderData: prev => prev, // keeps previous data while loading next page
  });
}

// 3. Detail query
export function useMyItem(id: string) {
  return useQuery({
    queryKey: myKeys.detail(id),
    queryFn: async () => {
      const res = await client.api["my-feature"][":id"].$get({ param: { id } });
      if (!res.ok) throw new Error("Fetch failed");
      return res.json(); // { success: true, data: { item } }
    },
    enabled: !!id,
  });
}

// 4. Mutation with cache invalidation
export function useCreateItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (body: CreateInput) => {
      const res = await client.api["my-feature"].$post({ json: body });
      if (!res.ok) throw new Error("Create failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myKeys.all() });
    },
  });
}
```

## Hono client URL patterns

```ts
// GET /api/dictionary/search?q=...
client.api.dictionary.search.$get({ query: { q, lang, page: String(page) } })

// GET /api/dictionary/:id
client.api.dictionary[":id"].$get({ param: { id } })

// POST /api/forum
client.api.forum.$post({ json: body })

// PATCH /api/zolai/training/:id
client.api.zolai.training[":id"].$patch({ param: { id }, json: body })

// Note: query params must be strings — use String(number) for coerced params
```

## staleTime guidelines

| Data type | staleTime |
|---|---|
| Static/rarely changes (stats, config) | `300_000` (5 min) |
| User-specific data | `60_000` (1 min) |
| Real-time / frequently updated | `0` |
| Random/one-shot | `60_000` |

## Error handling in hooks

```ts
queryFn: async () => {
  const res = await client.api.feature.$get();
  if (!res.ok) throw new Error("Fetch failed"); // triggers onError / isError
  return res.json();
},
```

Client-side error display: `toast.error(error.message)` from `sonner`.

## File location

```
features/<feature>/
  hooks/
    index.ts    # all hooks + key factory for this feature
  types/
    index.ts    # or types.ts — Zod schemas + inferred types
```
