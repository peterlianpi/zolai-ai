/**
 * Import Zolai vocabulary from JSONL into the database.
 *
 * Each line: { "zolai": "...", "english": "...", "pos": "n", "category": "...", "definition": "...", "example": "..." }
 *
 * Usage:
 *   bunx tsx scripts/import-vocab.ts --input data/vocab.jsonl [--dry-run]
 */
import prisma from "../lib/prisma";
import fs from "fs";
const inputPath = process.argv[process.argv.indexOf("--input") + 1] ?? process.env.ZOLAI_DATA_PATH + "/vocab.jsonl";
const DRY_RUN = process.argv.includes("--dry-run");

async function main() {
  if (!fs.existsSync(inputPath)) {
    console.error(`File not found: ${inputPath}`);
    process.exit(1);
  }

  const lines = fs.readFileSync(inputPath, "utf-8").split("\n").filter(Boolean);
  const rows = lines.map((l) => JSON.parse(l)).filter((r) => r.zolai && r.english);

  console.log(`Parsed ${rows.length} vocab words`);
  if (!DRY_RUN) {
    await prisma.vocabWord.createMany({ data: rows, skipDuplicates: true });
    console.log(`Imported ${rows.length} words.`);
  } else {
    console.log("[DRY RUN] Would import", rows.length, "words.");
    console.log("Sample:", rows.slice(0, 3));
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
