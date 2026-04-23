---
name: i18n-patterns
description: Internationalisation patterns for the Zolai platform — lib/i18n, locale detection, server/client i18n helpers. Use when adding multilingual support or working with locale-specific content.
---

# i18n Patterns — Zolai Platform

## Files

```
lib/
  i18n/
    index.ts       # Main i18n export
    locales.ts     # Locale definitions
  i18n-server.ts   # Server-side i18n helpers
  i18n-client.ts   # Client-side i18n helpers
```

## Supported locales (lib/i18n/locales.ts)

Primary: `en` (English), `zo` (Tedim Zolai)

## Server usage

```ts
import { getI18n } from "@/lib/i18n-server";

const t = await getI18n();
return t("dictionary.search.placeholder"); // "Search 24,891 words..."
```

## Client usage

```ts
"use client";
import { useI18n } from "@/lib/i18n-client";

const t = useI18n();
return <p>{t("lesson.start")}</p>;
```

## Translation key conventions

```
feature.component.element
dictionary.search.placeholder
lesson.cefr.level
bible.verse.reference
tutor.response.hint
```

## Zolai-specific rules

- Zolai (`zo`) locale always renders Tedim ZVS dialect
- Never mix locales in the same string
- Bilingual display: Zolai first, English second — `zo — en`
- Font size for `zo` locale: minimum 16px body text
