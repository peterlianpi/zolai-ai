# Skill: Add Feature

## Purpose

Scaffold a new feature module following the Zolai AI feature pattern.

## When to Use

Use this skill when user says:
- "Add a new feature"
- "Create feature for X"
- "Scaffold new module"
- "Add feature workflow"

## Feature Module Structure

```
features/<name>/
├── api/
│   └── index.ts      # Typed API functions using Hono client
├── hooks/
│   ├── index.ts      # Re-exports all hooks
│   ├── use-list-<name>.ts
│   ├── use-<name>.ts
│   ├── use-create-<name>.ts
│   ├── use-update-<name>.ts
│   └── use-delete-<name>.ts
├── components/       # React UI components
├── keys.ts           # TanStack Query keys
├── types.ts          # TypeScript types
└── schemas.ts        # Zod validation schemas (optional)
```

## Steps

### 1. Create the Feature Directory

```bash
mkdir -p features/<name>/{api,hooks,components}
```

### 2. Create `types.ts`

```ts
// features/<name>/types.ts
export interface <Name> {
  id: string
  name: string
  // ... fields matching your Prisma model select
  createdAt: string
  updatedAt: string
}

export interface <Name>ListResponse {
  items: <Name>[]
  total: number
  page: number
  limit: number
}
```

### 3. Create `keys.ts`

Query keys live in their own file — imported by all hooks.

```ts
// features/<name>/keys.ts
export const <name>Keys = {
  all: ['<name>'] as const,
  lists: () => [...<name>Keys.all, 'list'] as const,
  list: (params?: object) => [...<name>Keys.lists(), params] as const,
  detail: (id: string) => [...<name>Keys.all, id] as const,
} as const
```

### 4. Create `api/index.ts`

API functions **throw** on error — the hook's `onError` handles it.

```ts
// features/<name>/api/index.ts
import { client, apiCall } from '@/lib/api/hono-client'
import type { <Name>, <Name>ListResponse } from '../types'

export async function list<Name>s(params?: {
  page?: number
  limit?: number
  search?: string
}): Promise<<Name>ListResponse> {
  const response = await apiCall<<Name>ListResponse>(
    client.api['<name>'].$get({ query: params as Record<string, string> }),
  )
  if (!response.ok) throw new Error(response.error.message || 'Failed to fetch')
  return response.data
}

export async function get<Name>ById(id: string): Promise<<Name>> {
  const response = await apiCall<<Name>>(
    client.api['<name>'][':id'].$get({ param: { id } }),
  )
  if (!response.ok) throw new Error(response.error.message || 'Not found')
  return response.data
}

export async function create<Name>(data: Partial<<Name>>): Promise<<Name>> {
  const response = await apiCall<<Name>>(
    client.api['<name>'].$post({ json: data }),
  )
  if (!response.ok) throw new Error(response.error.message || 'Failed to create')
  return response.data
}

export async function update<Name>(id: string, data: Partial<<Name>>): Promise<<Name>> {
  const response = await apiCall<<Name>>(
    client.api['<name>'][':id'].$patch({ param: { id }, json: data }),
  )
  if (!response.ok) throw new Error(response.error.message || 'Failed to update')
  return response.data
}

export async function delete<Name>(id: string): Promise<void> {
  const response = await apiCall<{ success: boolean }>(
    client.api['<name>'][':id'].$delete({ param: { id } }),
  )
  if (!response.ok) throw new Error(response.error.message || 'Failed to delete')
}
```

### 5. Create Hook Files

Each hook is its own file. Use `toast` from `sonner` for user feedback.

**`hooks/use-list-<name>.ts`**
```ts
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { <name>Keys } from '../keys'
import { list<Name>s } from '../api'

export function useList<Name>s(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: <name>Keys.list(params),
    queryFn: () => list<Name>s(params),
    staleTime: 30 * 1000,
  })
}
```

**`hooks/use-create-<name>.ts`**
```ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { <name>Keys } from '../keys'
import { create<Name> } from '../api'

export function useCreate<Name>() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<<Name>>) => create<Name>(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: <name>Keys.lists() })
      toast.success('<Name> created successfully')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create')
    },
  })
}
```

**`hooks/index.ts`** — re-export all hooks:
```ts
export { useList<Name>s } from './use-list-<name>'
export { useCreate<Name> } from './use-create-<name>'
export { useUpdate<Name> } from './use-update-<name>'
export { useDelete<Name> } from './use-delete-<name>'
```

> Note: `"use client"` directive is **not** needed in hook files.

### 6. Add the API Route

Create `app/api/[[...route]]/<name>.ts` using the **RPC chain** pattern.

Then mount it in `app/api/[[...route]]/route.ts`:

```ts
import <name>Route from './<name>'

const routes = app
  .route('/<name>', <name>Route)

export type AppType = typeof routes
```

### 7. Run Audits

After creating feature, run:
```bash
bun run audit:features
```

## Key Patterns

- TanStack Query keys in separate file
- API functions throw on error
- Hooks handle user feedback with `sonner`
- Use Zod for validation
- Follow Feature-Sliced Design pattern
- Use absolute imports via `@/`