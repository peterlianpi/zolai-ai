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
  "${ZOLAI_ROOT:-../..}/data/dictionary/processed/dict_semantic_v1.jsonl"
);

const BATCH_SIZE = 200;

async function main() {
  console.log("Clearing existing vocab words...");
  await prisma.vocabWord.deleteMany();

  const rl = createInterface({ input: createReadStream(DICT_PATH) });

  type BatchItem = Parameters<typeof prisma.vocabWord.createMany>[0]["data"][number];
  let batch: BatchItem[] = [];
  let total = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    const r = JSON.parse(line);

    // Map accuracy → category (reuse category field for POS grouping)
    const pos = (r.pos ?? "").toLowerCase().trim();
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
      zolai:       r.zolai       ?? "",
      english:     r.english     ?? "",
      pos:         r.pos         ?? "",
      category,
      definition:  r.usage_notes ?? "",
      example:     firstExample  ?? "",
      explanation: r.explanation ?? "",
      synonyms:    r.synonyms    ?? [],
      antonyms:    r.antonyms    ?? [],
      related:     (r.related    ?? []).slice(0, 10), // cap at 10
      variants:    r.variants    ?? [],
      examples:    examples.slice(0, 3),
      accuracy:    r.accuracy    ?? "unverified",
      tags:        [category, r.dialect ?? "tedim", r.accuracy ?? "unverified"],
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
