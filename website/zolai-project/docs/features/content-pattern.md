# Content Feature Pattern

This document defines the standard pattern for implementing content-related features in Zolai AI, combining Hono APIs, Server Actions, and React Query.

## 1. Backend Layer (Hono)

Location: `app/api/[[...route]]/content.ts`

- **RPC Chain**: Extend the sub-router with new endpoints.
- **Validation**: Use `zValidator` for params, query, and json body.
- **Responses**: Use helpers from `@/lib/api/response`.

```typescript
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ok, created, list } from "@/lib/api/response";

const router = new Hono()
  .get("/", zValidator("query", schema), async (c) => {
    // ... logic
    return list(c, items, meta);
  });
```

## 2. Server Action Layer (Next.js)

Location: `features/content/actions.ts` (or `action/content.ts`)

- **Purpose**: Initial data fetching for RSCs and all mutating operations (POST, PATCH, DELETE).
- **Benefit**: Native Next.js performance optimizations and `useTransition` support.

```typescript
"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createContent(data: any) {
  const result = await prisma.post.create({ data });
  revalidatePath("/admin/content");
  return result;
}
```

## 3. Client Layer (React Query)

Location: `features/content/hooks/`

- **Purpose**: Manage client-side state, caching, and background revalidation.
- **Typed Client**: Always use `hc<AppType>` via `client`.

```typescript
import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/hono-client";

export function useContent(id: string) {
  return useQuery({
    queryKey: ["content", id],
    queryFn: async () => {
      const res = await client.api.content[":id"].$get({ param: { id } });
      const json = await res.json();
      return json.data;
    }
  });
}
```

## 4. Types & Schemas

- **Prisma**: Base models from `@/lib/generated/prisma/models`.
- **Shared**: Common interfaces in `lib/types/content.ts`.
- **Zod**: Validation schemas in `features/content/schemas/`.

## 5. Performance Recommendations

1. **RSC First**: Fetch initial data in Server Components using direct Prisma calls or Server Actions.
2. **Hydrate Query**: If client-side interactivity is needed, hydrate React Query with the RSC data.
3. **Optimistic Updates**: Use React Query `onMutate` for a snappier admin UX.
4. **Transition Pending**: Wrap mutations in `useTransition` for the native loading feel.
