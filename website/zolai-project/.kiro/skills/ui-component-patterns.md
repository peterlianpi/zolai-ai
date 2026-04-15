---
name: ui-component-patterns
description: shadcn/ui, Tailwind, and React component patterns for this project. Use when building or reviewing UI components.
---

# UI Component Patterns — Zolai Project

## Rules

- RSC by default — add `"use client"` only when using hooks or browser APIs
- Use shadcn/ui primitives — never build from scratch what shadcn provides
- Tailwind only — no inline styles, no CSS modules
- Toasts via `sonner`: `import { toast } from "sonner"`
- Forms: `react-hook-form` + `zod` resolver + shadcn `<Form>` components
- Loading states: shadcn `<Skeleton>` for RSC, `isPending` for mutations

## Component file structure

```tsx
// features/<feature>/components/FeaturePage.tsx
import { FeatureCard } from "./FeatureCard";
import { getFeatureData } from "../server/queries";

// RSC — no "use client"
export async function FeaturePage() {
  const data = await getFeatureData();
  return <FeatureCard data={data} />;
}
```

## Client component with mutation

```tsx
"use client";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

export function SubmitButton() {
  const { mutate, isPending } = useMutation({
    mutationFn: async (data) => { /* call server action or api */ },
    onSuccess: () => toast.success("Saved"),
    onError: () => toast.error("Failed"),
  });
  return <Button disabled={isPending} onClick={() => mutate(data)}>Save</Button>;
}
```

## TanStack Query data fetching (client)

```ts
// features/<feature>/hooks/useFeature.ts
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { featureKeys } from "../keys";

export function useFeature(id: string) {
  return useQuery({
    queryKey: featureKeys.detail(id),
    queryFn: async () => {
      const res = await api.feature[":id"].$get({ param: { id } });
      return res.json();
    },
  });
}
```

## Query key factory

```ts
// features/<feature>/keys.ts
export const featureKeys = {
  all: ["feature"] as const,
  list: () => [...featureKeys.all, "list"] as const,
  detail: (id: string) => [...featureKeys.all, "detail", id] as const,
};
```

## Accessibility

- All interactive elements must have accessible labels
- Use semantic HTML (`<button>`, `<nav>`, `<main>`, `<section>`)
- Images need `alt` text; decorative images use `alt=""`
