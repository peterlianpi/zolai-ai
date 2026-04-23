---
name: bible-corpus
description: Tedim Bible corpus structure and usage — TDB77, Tedim2010, KJV alignment, BibleVerse model, book/chapter/verse queries. Use when working on the Bible feature, corpus analysis, or parallel text.
---

# Bible Corpus — Zolai Platform

## Versions available

| Code | Name | Language |
|---|---|---|
| `tdb77` | Tedim Bible 1977 | Tedim Zolai |
| `tedim2010` | Tedim Bible 2010 | Tedim Zolai (revised) |
| `kjv` | King James Version | English |

## BibleVerse model fields

```ts
{
  book: string,      // e.g. "Genesis", "John"
  chapter: number,
  verse: number,
  tdb77: string,     // Tedim 1977 text
  tedim2010: string, // Tedim 2010 text
  kjv: string,       // KJV English text
}
```

## API endpoint

```
GET /api/zolai/bible/:book?chapter=1
```

Returns all verses for a book/chapter with all three versions aligned.

## Query patterns

```ts
// Single verse
await prisma.bibleVerse.findFirst({
  where: { book, chapter, verse },
  select: { tdb77: true, tedim2010: true, kjv: true },
});

// Full chapter
await prisma.bibleVerse.findMany({
  where: { book, chapter },
  orderBy: { verse: "asc" },
  select: { verse: true, tdb77: true, kjv: true },
});

// Search in Tedim text
await prisma.bibleVerse.findMany({
  where: { tdb77: { contains: keyword, mode: "insensitive" } },
  select: { book: true, chapter: true, verse: true, tdb77: true, kjv: true },
  take: 20,
});
```

## Corpus use cases

- Parallel translation training data (tdb77 ↔ kjv)
- Grammar examples at C1–C2 level (biblical register)
- Reading comprehension passages for advanced learners
- Dialect comparison (tdb77 vs tedim2010 differences)

## Coverage

66 books, full Old and New Testament. 68,817 total parallel entries (Bible + conversational combined in parallel.jsonl).
