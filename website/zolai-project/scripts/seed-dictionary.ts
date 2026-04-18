/**
 * scripts/seed-dictionary.ts
 * Seeds VocabWord table from master_dictionary_semantic.jsonl
 *
 * Run: bunx tsx scripts/seed-dictionary.ts
 */
import "dotenv/config";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import path from "path";
import prisma from "../lib/prisma";

const DICT_PATH = path.resolve(
  process.env.DICT_PATH ?? "/home/peter/Documents/Projects/zolai/data/dictionary/processed/dict_unified_v1.jsonl"
);

const BATCH_SIZE = 200;

async function main() {
  console.log("Clearing existing vocab words...");
  await prisma.vocabWord.deleteMany();

  const rl = createInterface({ input: createReadStream(DICT_PATH) });

  type BatchItem = import("@/lib/generated/prisma").Prisma.VocabWordCreateManyInput;
  let batch: BatchItem[] = [];
  let total = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const r = JSON.parse(line);

    // Map accuracy → category (reuse category field for POS grouping)
    const pos = (String(r.pos ?? "")).toLowerCase().trim();
    const category =
      pos === "v" || pos === "vt" ? "verb"
      : pos === "n" || pos === "noun" ? "noun"
      : pos === "adj" || pos === "a" || pos === "adjective" ? "adjective"
      : pos === "adv" || pos === "adverb" ? "adverb"
      : pos === "prep" ? "preposition"
      : pos === "pt" ? "particle"
      : "other";

    // First example sentence as the `example` field
    const examples: { zo: string; en: string; source: string; reference: string }[] =
      r.examples ?? [];
    const firstExample = examples[0]
      ? `${examples[0].zo} — ${examples[0].en} (${examples[0].reference})`
      : null;

    batch.push({
      zolai:       String(r.zolai       ?? ""),
      english:     String(r.english     ?? ""),
      pos:         Array.isArray(r.pos) ? r.pos[0] ?? null : (r.pos ? String(r.pos) : null),
      category,
      definition:  r.usage_notes ? String(r.usage_notes) : (r.definition ? String(r.definition) : ""),
      example:     firstExample  ?? "",
      explanation: r.explanation ? String(r.explanation) : "",
      synonyms:    (r.synonyms    ?? []).filter((s: unknown) => typeof s === "string"),
      antonyms:    (r.antonyms    ?? []).filter((s: unknown) => typeof s === "string"),
      related:     ((r.related    ?? []) as unknown[]).filter((s): s is string => typeof s === "string").slice(0, 10),
      variants:    (r.variants    ?? []).filter((s: unknown) => typeof s === "string"),
      examples:    examples.slice(0, 3),
      accuracy:    r.accuracy ? String(r.accuracy) : "unverified",
      tags:        [category, r.dialect ?? "tedim", r.accuracy ?? "unverified"].filter(Boolean) as string[],
      audioUrl:    "",
    });

    if (batch.length >= BATCH_SIZE) {
      await prisma.vocabWord.createMany({ data: batch, skipDuplicates: true });
      total += batch.length;
      process.stdout.write(`\r  Seeded: ${total}...`);
      batch = [];
    }
  }

  if (batch.length > 0) {
    await prisma.vocabWord.createMany({ data: batch, skipDuplicates: true });
    total += batch.length;
  }

  console.log(`\nDone. Total seeded: ${total}`);
  const count = await prisma.vocabWord.count();
  console.log(`DB count: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
