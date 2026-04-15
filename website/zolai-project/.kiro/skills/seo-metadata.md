---
name: seo-metadata
description: SEO and metadata patterns for the Zolai platform — Next.js Metadata API, OG tags, JSON-LD, sitemap, robots. Use when adding or reviewing page metadata.
---

# SEO & Metadata — Zolai Platform

## Next.js Metadata API (App Router)

```ts
// app/(routes)/dictionary/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dictionary — Zolai AI | Tedim Zolai Language Platform",
  description: "Search 24,891 Tedim Zolai ↔ English dictionary entries with synonyms, antonyms, and corpus examples.",
  openGraph: {
    title: "Zolai Dictionary",
    description: "24,891 ZO↔EN entries",
    url: "https://zolai.app/dictionary",
    siteName: "Zolai AI",
    locale: "en_US",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};
```

## Dynamic metadata (word pages)

```ts
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const word = await getWord(params.id);
  return {
    title: `${word.zolai} — ${word.english} | Zolai Dictionary`,
    description: `${word.zolai} (${word.pos}): ${word.english}. ${word.examples?.[0] ?? ""}`,
  };
}
```

## Title formula

```
[Page/Feature] — Zolai AI | Tedim Zolai Language Platform
```
- Max 60 chars for the page/feature part
- Always include "Tedim Zolai" for SEO

## Meta description formula

- 150–160 characters
- Include primary keyword + "Tedim Zolai"
- End with a value statement

## JSON-LD (lib/seo/json-ld.ts)

Use `WebPageJsonLd`, `ArticleJsonLd`, `OrganizationJsonLd` helpers already in the codebase.

## Sitemap

`app/sitemap.ts` — include all public routes, dictionary words, wiki entries, Bible books.

## robots.txt

Block `/api/`, `/admin/`, `/dashboard/`. Allow everything else.

## Keywords to target

- "Tedim Zolai language"
- "Zomi language learning"
- "Tedim dictionary"
- "Zolai AI tutor"
- "Chin language"
