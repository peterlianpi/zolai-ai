# Prisma 7 Reference

**Version:** 7.6.0 | **Docs:** https://www.prisma.io/docs

## Schema

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model User {
  id        String    @id
  name      String
  email     String    @unique
  role      UserRole  @default(USER)
  posts     Post[]    @relation("PostAuthor")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([email])
  @@index([role])
  @@map("user")
}

model Post {
  id        String     @id @default(cuid())
  title     String
  slug      String
  status    PostStatus @default(DRAFT)
  authorId  String
  author    User       @relation("PostAuthor", fields: [authorId], references: [id])
  createdAt DateTime   @default(now())

  @@unique([slug, authorId])
  @@index([status])
  @@map("post")
}

enum UserRole {
  USER
  ADMIN
}

enum PostStatus {
  DRAFT
  PUBLISHED
  TRASH
}
```

## Singleton Pattern

```ts
// lib/prisma.ts
import { PrismaClient } from "@/lib/generated/prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
```

## Common Query Patterns

### Find Unique
```ts
const user = await prisma.user.findUnique({
  where: { id: "123" },
  include: { posts: true },
});
```

### Find Many with Filtering
```ts
const posts = await prisma.post.findMany({
  where: {
    status: "PUBLISHED",
    authorId: { in: ["1", "2", "3"] },
    title: { contains: "search", mode: "insensitive" },
  },
  include: { author: { select: { name: true, email: true } } },
  orderBy: { createdAt: "desc" },
  skip: 0,
  take: 20,
});
```

### Create
```ts
const post = await prisma.post.create({
  data: {
    title: "My Post",
    slug: "my-post",
    status: "DRAFT",
    authorId: "user-123",
  },
});
```

### Update
```ts
const post = await prisma.post.update({
  where: { id: "post-123" },
  data: {
    title: "Updated Title",
    status: "PUBLISHED",
    publishedAt: new Date(),
  },
});
```

### Upsert
```ts
const user = await prisma.user.upsert({
  where: { email: "test@example.com" },
  update: { name: "Updated Name" },
  create: {
    id: "user-123",
    email: "test@example.com",
    name: "New User",
  },
});
```

### Delete
```ts
await prisma.post.delete({
  where: { id: "post-123" },
});
```

### Count
```ts
const total = await prisma.post.count({
  where: { status: "PUBLISHED" },
});
```

### Aggregation
```ts
const stats = await prisma.post.aggregate({
  _count: { id: true },
  _min: { createdAt: true },
  _max: { createdAt: true },
  where: { status: "PUBLISHED" },
});
```

## Relations

### One-to-Many
```prisma
model User {
  posts Post[]
}

model Post {
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

### Many-to-Many (Implicit)
```prisma
model Post {
  categories Category[]
}

model Category {
  posts Post[]
}
```

### Many-to-Many (Explicit)
```prisma
model Post {
  terms PostTerm[]
}

model Term {
  posts PostTerm[]
}

model PostTerm {
  postId String
  termId String
  post   Post   @relation(fields: [postId], references: [id])
  term   Term   @relation(fields: [termId], references: [id])

  @@id([postId, termId])
}
```

### Self-Relation
```prisma
model Post {
  parentId   String?
  parent     Post?   @relation("PostHierarchy", fields: [parentId], references: [id])
  children   Post[]  @relation("PostHierarchy")
}
```

## Pagination

### Offset Pagination
```ts
const page = 1;
const limit = 20;
const skip = (page - 1) * limit;

const [items, total] = await Promise.all([
  prisma.post.findMany({ skip, take: limit, orderBy: { createdAt: "desc" } }),
  prisma.post.count(),
]);

const totalPages = Math.ceil(total / limit);
```

### Cursor Pagination
```ts
const items = await prisma.post.findMany({
  take: 21, // fetch one extra to check for next page
  skip: 1,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: "desc" },
});

const hasNextPage = items.length > 20;
const nextCursor = hasNextPage ? items[items.length - 1].id : undefined;
const result = hasNextPage ? items.slice(0, -1) : items;
```

## Generated Types

```ts
import type { PostWhereInput, MediaWhereInput, RedirectWhereInput } from "@/lib/generated/prisma/models";
import type { PostStatus, UserRole } from "@/lib/generated/prisma/enums";

// Use in API routes
const where: PostWhereInput = {
  status: "PUBLISHED",
  title: { contains: search, mode: "insensitive" },
};
```

## Migrations

```bash
# Create migration after schema changes
bunx prisma migrate dev --name add_user_role

# Apply pending migrations
bunx prisma migrate deploy

# Reset database (dev only)
bunx prisma migrate reset

# Generate Prisma client
bunx prisma generate

# Seed database
bunx prisma db seed
```

## Error Handling

```ts
import { Prisma } from "@/lib/generated/prisma";

try {
  await prisma.user.create({ data: { email: "test@example.com" } });
} catch (error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2002": // Unique constraint violation
        return { success: false, error: "Email already exists" };
      case "P2025": // Record not found
        return { success: false, error: "Record not found" };
      case "P2003": // Foreign key constraint
        return { success: false, error: "Invalid reference" };
      default:
        throw error;
    }
  }
  throw error;
}
```

## Best Practices

1. **Use singleton** — never instantiate PrismaClient directly
2. **Select only needed fields** — avoid returning sensitive data
3. **Use transactions** for related writes
4. **Index frequently queried fields** — `@@index([field])`
5. **Use `@@unique`** for natural unique constraints
6. **Avoid N+1 queries** — use `include` or batch queries
7. **Use `findUnique`** when possible (uses indexes)
8. **Validate input** before database operations
9. **Use `upsert`** for create-or-update patterns
10. **Run `prisma generate`** after schema changes
