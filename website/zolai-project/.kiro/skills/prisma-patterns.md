---
name: prisma-patterns
description: Prisma query patterns for this project. Use when writing database queries, migrations, or seeding scripts.
---

# Prisma Patterns — Zolai Project

## Always use `select`, never `include`

```ts
// ✅ correct
const word = await prisma.vocabWord.findUnique({
  where: { id },
  select: { id: true, zolai: true, english: true, pos: true },
});

// ❌ wrong — over-fetches
const word = await prisma.vocabWord.findUnique({
  where: { id },
  include: { synonyms: true },
});
```

## Pagination

```ts
const [items, total] = await prisma.$transaction([
  prisma.vocabWord.findMany({
    where,
    select: { id: true, zolai: true, english: true },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { zolai: "asc" },
  }),
  prisma.vocabWord.count({ where }),
]);
```

## Handle P2002 (unique constraint)

```ts
import { Prisma } from "@/lib/generated/prisma/client";

try {
  await prisma.model.create({ data });
} catch (e) {
  if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
    // return 409
  }
  throw e;
}
```

## Migrations

```bash
bunx prisma migrate dev --name <descriptive-name>
bunx prisma generate   # after schema changes
```

## Key models

| Model | Key fields |
|---|---|
| `VocabWord` | `zolai`, `english`, `pos`, `category`, `synonyms`, `antonyms`, `examples` |
| `BibleVerse` | `book`, `chapter`, `verse`, `tdb77`, `tedim2010`, `kjv` |
| `WikiEntry` | `slug`, `title`, `content`, `category` |
| `TrainingRun` | `name`, `status`, `steps`, `maxSteps`, `lossJson` |
