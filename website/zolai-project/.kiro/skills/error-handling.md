---
name: error-handling
description: Error handling patterns across the full stack. Use when implementing error boundaries, API errors, Server Action errors, or client-side error display.
---

# Error Handling Patterns — Zolai Project

## Server Actions

```ts
export async function myAction(data: unknown): Promise<{ success: boolean; error?: string }> {
  try {
    const parsed = schema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Invalid input" };
    await prisma.model.create({ data: parsed.data, select: { id: true } });
    return { success: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { success: false, error: "Already exists" };
    }
    console.error(e); // log internally
    return { success: false, error: "Something went wrong" }; // never expose internals
  }
}
```

## API Routes (Hono)

```ts
import { ok, error, notFound, internalError, badRequest, conflict } from "@/lib/api/response";

return badRequest(c, "Invalid input");       // 400
return notFound(c, "Word not found");        // 404
return conflict(c, "Already exists");        // 409
return internalError(c, "DB error");         // 500
```

## Client — calling Server Actions

```ts
const result = await myAction(data);
if (!result.success) {
  toast.error(result.error ?? "Something went wrong");
  return;
}
toast.success("Done");
```

## Client — TanStack Query errors

```ts
useQuery({
  queryFn: ...,
  onError: () => toast.error("Failed to load"),
});
```

## Never

- Never expose stack traces, Prisma errors, or DB internals to clients
- Never `throw` from Server Actions — always return `{ success: false, error }`
- Never swallow errors silently — always log server-side
