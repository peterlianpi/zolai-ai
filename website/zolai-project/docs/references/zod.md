# Zod 4 Reference

**Version:** 4.3.6 | **Docs:** https://zod.dev

## Basic Schemas

```ts
import { z } from "zod";

// Primitives
const stringSchema = z.string();
const numberSchema = z.number();
const booleanSchema = z.boolean();
const nullSchema = z.null();
const undefinedSchema = z.undefined();

// With validation
const email = z.string().email();
const url = z.string().url();
const uuid = z.string().uuid();
const minLen = z.string().min(2).max(100);
const positive = z.number().int().positive();
const range = z.number().min(0).max(100);
```

## Objects

```ts
const userSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  email: z.string().email(),
  age: z.number().int().min(0).optional(),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
  createdAt: z.coerce.date(),
});

type User = z.infer<typeof userSchema>;
```

### Partial, Pick, Omit
```ts
const partialUser = userSchema.partial(); // all optional
const nameEmail = userSchema.pick({ name: true, email: true });
const withoutId = userSchema.omit({ id: true });
```

### Extend
```ts
const createUserSchema = userSchema.extend({
  password: z.string().min(8),
});

const updateUserSchema = userSchema.partial();
```

## Arrays

```ts
const stringArray = z.array(z.string());
const minItems = z.array(z.string()).min(1);
const exactLength = z.array(z.number()).length(3);

type Tags = z.infer<typeof stringArray>; // string[]
```

## Unions & Intersections

```ts
// Union
const stringOrNumber = z.union([z.string(), z.number()]);
const discriminated = z.discriminatedUnion("type", [
  z.object({ type: z.literal("success"), data: z.string() }),
  z.object({ type: z.literal("error"), message: z.string() }),
]);

// Intersection
const combined = z.intersection(userSchema, z.object({ role: z.string() }));
```

## Records & Maps

```ts
const stringRecord = z.record(z.string(), z.number()); // { [key: string]: number }
const mapSchema = z.map(z.string(), z.number());
```

## Enums

```ts
const roleSchema = z.enum(["USER", "ADMIN", "MODERATOR"]);
type Role = z.infer<typeof roleSchema>; // "USER" | "ADMIN" | "MODERATOR"

// Native enum
enum Status { Active, Inactive }
const statusSchema = z.nativeEnum(Status);
```

## Transforms & Coerce

```ts
// Coerce types
const numberSchema = z.coerce.number(); // "123" → 123
const dateSchema = z.coerce.date(); // "2024-01-01" → Date
const booleanSchema = z.coerce.boolean(); // "true" → true

// Transform
const stringToNumber = z.string().transform((val) => parseInt(val, 10));

// Preprocess
const preprocessSchema = z.preprocess(
  (val) => (val === "" ? undefined : val),
  z.string().optional()
);
```

## Validation

```ts
// Parse (throws on error)
const result = userSchema.parse(data);

// Safe parse (returns result object)
const result = userSchema.safeParse(data);
if (!result.success) {
  console.log(result.error.flatten());
  // { fieldErrors: { email: ["Invalid email"] } }
}

// Async parse
const result = await asyncSchema.parseAsync(data);
```

## Error Handling

```ts
const result = schema.safeParse(data);

if (!result.success) {
  // Flat field errors
  const fieldErrors = result.error.flatten().fieldErrors;
  // { email: ["Invalid email"], name: ["Required"] }

  // Form errors
  const formErrors = result.error.formErrors.fieldErrors;

  // Issue list
  const issues = result.error.issues;
  // [{ path: ["email"], message: "Invalid email", code: "invalid_string" }]
}
```

## Common Patterns

### API Request Validation
```ts
import { zValidator } from "@hono/zod-validator";

const createPostSchema = z.object({
  title: z.string().min(1).max(500),
  slug: z.string().min(1).max(500),
  contentHtml: z.string(),
  status: z.enum(["DRAFT", "PUBLISHED", "TRASH"]),
  locale: z.string().min(2),
  featuredMediaId: z.string().nullable(),
});

app.post("/posts", zValidator("json", createPostSchema), async (c) => {
  const body = c.req.valid("json");
  // body is fully typed
});
```

### Form Validation
```ts
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const form = useForm<FormValues>({
  resolver: zodResolver(formSchema),
  defaultValues: { name: "", email: "", password: "" },
});
```

### File Upload Validation
```ts
const fileSchema = z.object({
  name: z.string(),
  type: z.string().refine(
    (type) => ["image/jpeg", "image/png", "image/webp"].includes(type),
    "Invalid file type"
  ),
  size: z.number().max(5 * 1024 * 1024, "File too large (max 5MB)"),
});
```

### Pagination Schema
```ts
const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.string().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
```

## Best Practices

1. **Validate at the boundary** — API inputs, form submissions, file uploads
2. **Use `safeParse`** — handle errors gracefully
3. **Infer types** — `z.infer<typeof schema>` instead of duplicating
4. **Coerce types** — `z.coerce.number()` for query params
5. **Default values** — `.default()` for optional fields
6. **Custom messages** — `.min(1, "Required")` for user-friendly errors
7. **Refine for complex validation** — `.refine()` for cross-field checks
8. **Reuse schemas** — `.extend()`, `.partial()`, `.pick()`, `.omit()`
9. **Discriminated unions** — for polymorphic data
10. **Async validation** — `.refine(async () => ...)` for DB checks
