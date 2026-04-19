/**
 * Import Bible parallel corpus into the database.
 *
 * Expects a directory of TSV/CSV files at ZOLAI_BIBLE_PATH, one per book:
 *   Genesis.tsv  (columns: book, chapter, verse, testament, tdb77, tedim2010, kjv)
 *
 * Usage:
 *   bunx tsx scripts/import-bible.ts [--path /custom/path] [--dry-run]
 */
import prisma from "../lib/prisma";
import fs from "fs";
import path from "path";

const BIBLE_PATH = process.env.ZOLAI_BIBLE_PATH ?? path.join(process.cwd(), "data", "bible");
const DRY_RUN = process.argv.includes("--dry-run");

interface VerseRow {
  book: string;
  chapter: number;
  verse: number;
  testament: string;
  tdb77?: string;
  tedim2010?: string;
  kjv?: string;
}

function parseTsv(filePath: string): VerseRow[] {
  const lines = fs.readFileSync(filePath, "utf-8").split("\n").filter(Boolean);
  const [header, ...rows] = lines;
  const cols = header.split("\t").map((c) => c.trim().toLowerCase());
  return rows.map((line) => {
    const vals = line.split("\t");
    const row: Record<string, string> = {};
    cols.forEach((col, i) => { row[col] = vals[i]?.trim() ?? ""; });
    return {
      book: row.book,
      chapter: parseInt(row.chapter, 10),
      verse: parseInt(row.verse, 10),
      testament: row.testament?.toUpperCase() === "NT" ? "NT" : "OT",
      tdb77: row.tdb77 || undefined,
      tedim2010: row.tedim2010 || undefined,
      kjv: row.kjv || undefined,
    };
  }).filter((r) => r.book && !isNaN(r.chapter) && !isNaN(r.verse));
}

async function main() {
  if (!fs.existsSync(BIBLE_PATH)) {
    console.error(`Bible path not found: ${BIBLE_PATH}`);
    console.error("Set ZOLAI_BIBLE_PATH in .env or pass --path");
    process.exit(1);
  }

  const files = fs.readdirSync(BIBLE_PATH).filter((f) => f.endsWith(".tsv") || f.endsWith(".csv"));
  if (files.length === 0) {
    console.error("No .tsv or .csv files found in", BIBLE_PATH);
    process.exit(1);
  }

  let total = 0;
  for (const file of files) {
    const rows = parseTsv(path.join(BIBLE_PATH, file));
    console.log(`${file}: ${rows.length} verses`);
    if (!DRY_RUN) {
      await prisma.bibleVerse.createMany({
        data: rows,
        skipDuplicates: true,
      });
    }
    total += rows.length;
  }

  console.log(`\n${DRY_RUN ? "[DRY RUN] Would import" : "Imported"} ${total} verses from ${files.length} files.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
