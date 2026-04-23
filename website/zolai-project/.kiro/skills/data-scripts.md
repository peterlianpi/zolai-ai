---
name: data-scripts
description: Data pipeline and seeding scripts for the Zolai platform. Use when importing datasets, running migrations, or working with corpus data.
---

# Data Scripts — Zolai Project

## Commands

```bash
bunx prisma migrate dev --name <name>       # create + apply migration
bunx prisma generate                         # regenerate client after schema change
bunx tsx scripts/seed-dictionary.ts          # seed 24,891 VocabWord entries
bunx tsx scripts/import-bible.ts             # import Bible corpus
bunx tsx scripts/import-wiki.ts              # import wiki entries
bunx tsx scripts/import-vocab.ts             # import vocabulary
```

## Source data paths

```
/home/peter/Documents/Projects/zolai/data/processed/
  master_dictionary_semantic.jsonl   # 24,891 ZO↔EN entries
  parallel.jsonl                     # 68,817 Bible + conversational
  sentences.jsonl                    # ~2M raw Zolai sentences
  rvasia_tedim.jsonl                 # 966 Catholic readings
  zolai_tedim_hymns.jsonl            # ~600KB hymns
```

## JSONL entry shape (master_dictionary_semantic.jsonl)

```jsonc
{
  "zo_word": "lungdam",
  "en_word": "happy",
  "pos": "adjective",
  "synonyms": ["omthu"],
  "antonyms": ["lungkham"],
  "related": ["lungdamna"],
  "examples": ["Ka lungdam hi."]
}
```

## Seed script pattern

```ts
import { createReadStream } from "fs";
import { createInterface } from "readline";
import prisma from "@/lib/prisma";

const rl = createInterface({ input: createReadStream(SOURCE_PATH) });
const batch: unknown[] = [];

for await (const line of rl) {
  batch.push(JSON.parse(line));
  if (batch.length >= 500) {
    await prisma.vocabWord.createMany({ data: batch, skipDuplicates: true });
    batch.length = 0;
  }
}
if (batch.length) await prisma.vocabWord.createMany({ data: batch, skipDuplicates: true });
```

## After schema changes

Always run in order:
1. `bunx prisma migrate dev --name <descriptive-name>`
2. `bunx prisma generate`
3. Re-run relevant seed script if data shape changed
