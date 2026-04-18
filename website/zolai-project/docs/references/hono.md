# Hono Reference

**Version:** 4.12.10 | **Docs:** https://hono.dev

## Basic Setup

```ts
// app/api/[[...route]]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";

const app = new Hono().basePath("/api");

app.get("/hello", (c) => c.json({ message: "Hello!" }));

export const GET = handle(app);
export const POST = handle(app);
```

## Catch-All Router Pattern

```ts
// app/api/[[...route]]/route.ts
import { Hono } from "hono";
import { handle } from "hono/vercel";
import users from "./users";
import posts from "./posts";
import media from "./media";
import upload from "./upload";
import admin from "./admin";

const app = new Hono().basePath("/api");

const routes = app
  .route("/users", users)
  .route("/posts", posts)
  .route("/media", media)
  .route("/upload", upload)
  .route("/admin", admin);

export const GET = handle(app);
export const POST = handle(app);
export const PUT = handle(app);
export const PATCH = handle(app);
export const DELETE = handle(app);
```

## Sub-Router Pattern

```ts
// app/api/[[...route]]/users.ts
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import prisma from "@/lib/prisma";

const users = new Hono()
  .get("/", async (c) => {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true },
    });
    return c.json({ success: true, data: users });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return c.json({ error: "Not found" }, 404);
    return c.json({ success: true, data: user });
  })
  .post("/", zValidator("json", z.object({
    name: z.string().min(1),
    email: z.string().email(),
  })), async (c) => {
    const body = c.req.valid("json");
    const user = await prisma.user.create({ data: body });
    return c.json({ success: true, data: user }, 201);
  });

export default users;
```

## Middleware

### Custom Middleware
```ts
const authMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "Unauthorized" }, 401);
  c.set("user", session.user);
  await next();
});

app.use("/protected/*", authMiddleware);
```

### Admin Middleware (Router-Level)
```ts
const adminMiddleware = createMiddleware(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session || session.user.role !== "ADMIN") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});

const admin = new Hono().use("*", adminMiddleware)
  .get("/dashboard", (c) => c.json({ data: "admin data" }));
```

## Zod Validator

```ts
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

const userSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(["USER", "ADMIN"]).optional(),
});

app.post("/users", zValidator("json", userSchema), async (c) => {
  const body = c.req.valid("json");
  // body is fully typed and validated
});
```

### Validation Error Handling
```ts
import { zValidator } from "@hono/zod-validator";
import type { ValidationTargets } from "hono";

app.post(
  "/users",
  zValidator("json", userSchema, (result, c) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          details: result.error.flatten(),
        },
      }, 400);
    }
  }),
  async (c) => {
    const body = c.req.valid("json");
    // ...
  }
);
```

## Request Handling

### Query Parameters
```ts
app.get("/posts", async (c) => {
  const page = parseInt(c.req.query("page") ?? "1");
  const limit = parseInt(c.req.query("limit") ?? "20");
  const status = c.req.query("status");
  // ...
});
```

### Path Parameters
```ts
app.get("/posts/:id", async (c) => {
  const id = c.req.param("id");
  // ...
});
```

### JSON Body
```ts
app.post("/posts", async (c) => {
  const body = await c.req.json();
  // ...
});

// Or with validator
app.post("/posts", zValidator("json", schema), async (c) => {
  const body = c.req.valid("json");
  // ...
});
```

### Form Data
```ts
app.post("/upload", async (c) => {
  const formData = await c.req.formData();
  const file = formData.get("file") as File;
  // ...
});
```

## Response Helpers

```ts
// JSON
return c.json({ success: true, data: result });
return c.json({ error: "Not found" }, 404);

// Text
return c.text("Hello World");

// HTML
return c.html("<h1>Hello</h1>");

// Redirect
return c.redirect("/new-path");

// No content
return c.body(null, 204);
```

## Context Variables

```ts
// Set variables
c.set("user", user);
c.set("role", "ADMIN");

// Get variables
const user = c.get("user");
const role = c.get("role");
```

## Error Handling

```ts
app.onError((err, c) => {
  console.error(err);
  return c.json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  }, 500);
});

app.notFound((c) => {
  return c.json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Endpoint not found",
    },
  }, 404);
});
```

## Best Practices

1. **Use sub-routers** — one file per resource
2. **Zod validation** on all inputs
3. **Consistent response shape** — `{ success, data?, error? }`
4. **Auth middleware** — protect routes at router level
5. **Error handling** — global onError handler
6. **Type safety** — use Hono's RPC types
7. **Pagination** — always paginate list endpoints
8. **Select fields** — don't return sensitive data
9. **Rate limiting** — on write endpoints
10. **Audit logging** — log all mutations
