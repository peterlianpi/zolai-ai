/**
 * scripts/fix-core-vocab.ts
 * Corrects primary English glosses for high-frequency core Zolai words
 * where the seeded data has thesaurus synonyms instead of primary translations.
 *
 * Run: bunx tsx scripts/fix-core-vocab.ts
 */
import "dotenv/config";
import prisma from "../lib/prisma";

// Core vocabulary corrections: [zolai, correct_english, pos]
// These are the most common words where the DB has wrong/obscure primary gloss
const CORRECTIONS: [string, string, string][] = [
  ["ne",      "eat",       "v"],
  ["neek",    "eat",       "v"],
  ["dawn",    "drink",     "v"],
  ["pai",     "go",        "v"],
  ["hong pai","come",      "v"],
  ["om",      "be/exist",  "v"],
  ["hi",      "be/is",     "v"],
  ["nei",     "have",      "v"],
  ["that",    "kill",      "v"],
  ["lum",     "warm",      "adj"],
  ["an",      "food",      "n"],
  ["tui",     "water",     "n"],
  ["inn",     "house",     "n"],
  ["mi",      "person",    "n"],
  ["gam",     "land/country","n"],
  ["ni",      "day/sun",   "n"],
  ["zan",     "night",     "n"],
  ["lui",     "river",     "n"],
  ["mual",    "hill",      "n"],
  ["sih",     "die",       "v"],
  ["piang",   "be born",   "v"],
  ["uk",      "rule/reign","v"],
  ["zang",    "use",       "v"],
  ["ngai",    "wait/think","v"],
  ["mu",      "see",       "v"],
  ["za",      "hear",      "v"],
  ["gen",     "say/speak", "v"],
  ["ci",      "say",       "v"],
  ["kal",     "go/travel", "v"],
  ["khua",    "village",   "n"],
  ["pasian",  "God",       "n"],
  ["topa",    "Lord",      "n"],
];

async function main() {
  let updated = 0;
  for (const [zolai, english, pos] of CORRECTIONS) {
    // Find exact match (case-insensitive)
    const words = await prisma.vocabWord.findMany({
      where: { zolai: { equals: zolai, mode: "insensitive" } },
      select: { id: true, zolai: true, english: true, pos: true },
    });

    for (const word of words) {
      // Only update if current english gloss is not already the correct one
      if (word.english.toLowerCase() !== english.toLowerCase()) {
        await prisma.vocabWord.update({
          where: { id: word.id },
          data: { english, pos, accuracy: "confirmed" },
        });
        console.log(`  ✓ ${word.zolai}: "${word.english}" → "${english}"`);
        updated++;
      }
    }
  }
  console.log(`\nDone. Updated ${updated} entries.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
