// scripts/seed-dictionary.js
// Seeds VocabWord table from master_dictionary_semantic.jsonl
// Uses the project's prisma instance

require("dotenv").config();
const fs = require("fs");
const readline = require("readline");
const path = require("path");

// We need to use ts-node or similar to import the .ts lib
// but since we are in a Bun environment (likely), we can try calling it.
// Actually, let's just make a standalone PrismaClient that works with env vars.

const { PrismaClient } = require("@prisma/client");
const { Pool } = require("pg");
const { PrismaPg } = require("@prisma/adapter-pg");

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DICT_PATH = "${ZOLAI_ROOT:-../..}/data/processed/master_dictionary_semantic.jsonl";
const BATCH_SIZE = 500;

async function main() {
  console.log("Clearing existing vocab words...");
  try {
    await prisma.vocabWord.deleteMany();
  } catch (e) {
    console.error("Clear failed, might be empty:", e.message);
  }

  const fileStream = fs.createReadStream(DICT_PATH);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  let batch = [];
  let total = 0;

  for await (const line of rl) {
    if (!line.trim()) continue;
    try {
      const r = JSON.parse(line);

      const pos = (r.pos ?? "").toLowerCase().trim();
      const category =
        pos === "v" || pos === "vt" ? "verb"
        : pos === "n" || pos === "noun" ? "noun"
        : pos === "adj" || pos === "a" || pos === "adjective" ? "adjective"
        : pos === "adv" || pos === "adverb" ? "adverb"
        : pos === "prep" ? "preposition"
        : pos === "pt" ? "particle"
        : "other";

      const examples = r.examples ?? [];
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
        related:     (r.related    ?? []).slice(0, 10),
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
    } catch (e) {
      console.error("Error parsing line:", e);
    }
  }

  if (batch.length > 0) {
    await prisma.vocabWord.createMany({ data: batch, skipDuplicates: true });
    total += batch.length;
  }

  console.log(`\nDone. Total seeded: ${total}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
