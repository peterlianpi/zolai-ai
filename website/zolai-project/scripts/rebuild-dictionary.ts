/**
 * scripts/rebuild-dictionary.ts
 *
 * Rebuilds VocabWord table from all 3 source files:
 *   1. data/master/combined/dictionary.jsonl   — mixed ZO/EN headwords
 *   2. data/master/combined/phrases_consolidated.jsonl — ZO→EN phrases
 *   3. data/processed/bible_vocab_resolved.jsonl — ZO→EN bible vocab
 *
 * Strategy:
 *   - Detect headword direction (ZO vs EN) using heuristics
 *   - For EN headwords: create EN→ZO entry AND reverse ZO→EN entry
 *   - For ZO headwords: create ZO→EN entry directly
 *   - Deduplicate by (zolai_normalized, english_normalized)
 *   - Merge duplicate entries (combine synonyms, keep best accuracy)
 *
 * Run: bunx tsx scripts/rebuild-dictionary.ts
 */
import "dotenv/config";
import { createReadStream } from "fs";
import { createInterface } from "readline";
import path from "path";
import prisma from "../lib/prisma";

const DICT_PATH    = "${ZOLAI_ROOT:-../..}/data/master/combined/dictionary.jsonl";
const PHRASES_PATH = "${ZOLAI_ROOT:-../..}/data/master/combined/phrases_consolidated.jsonl";
const BIBLE_PATH   = "${ZOLAI_ROOT:-../..}/data/processed/bible_vocab_resolved.jsonl";

const BATCH_SIZE = 500;

// Zolai-specific character/pattern indicators
const ZO_PATTERNS = /\b(hi|a |in |uh|cih|leh|tawh|ah|na |ka |nang|amah|pasian|topa|khua|gam|inn|pai|om|nei|ne |an |tui|ni |zan|lui|mual|mi |pa |nu |naupang)\b/i;
const EN_ONLY = /^[a-z\s\-'",.()\d&]+$/i;
const HAS_ZO_CHARS = /[^a-z\s\-'",.()\d&]/i; // non-ASCII or unusual combos

function isZolaiHeadword(headword: string): boolean {
  const h = headword.toLowerCase().trim();
  // Short common Zolai words (1-3 chars, no spaces, all lowercase latin)
  if (h.length <= 4 && /^[a-z]+$/.test(h) && !["the","a","an","in","of","to","be","do","go","he","it","me","my","no","on","or","so","up","us","we"].includes(h)) return true;
  // Contains Zolai grammatical markers
  if (ZO_PATTERNS.test(h)) return true;
  // Has non-standard chars for English
  if (HAS_ZO_CHARS.test(h)) return true;
  // Looks like pure English
  if (EN_ONLY.test(h) && h.split(" ").every(w => w.length > 1)) return false;
  return true; // default: treat as Zolai
}

function normalizePos(pos: string | string[]): string {
  const p = (Array.isArray(pos) ? pos[0] : pos ?? "").toLowerCase().trim();
  if (p.startsWith("v")) return "v";
  if (p.startsWith("n")) return "n";
  if (p.startsWith("adj")) return "adj";
  if (p.startsWith("adv")) return "adv";
  if (p.startsWith("prep")) return "prep";
  if (p.startsWith("part")) return "pt";
  return p.slice(0, 4) || "";
}

function cleanText(s: string): string {
  return s.replace(/\s+/g, " ").trim().replace(/^[^a-zA-Z\u1000-\uFFFF]+/, "").trim();
}

function dedupeKey(zolai: string, english: string): string {
  return `${zolai.toLowerCase().trim()}|||${english.toLowerCase().trim()}`;
}

interface Entry {
  zolai: string;
  english: string;
  pos: string;
  category: string;
  definition: string;
  synonyms: string[];
  related: string[];
  accuracy: string;
  tags: string[];
  sources: string[];
}

async function readLines(filePath: string, handler: (line: string) => void) {
  const rl = createInterface({ input: createReadStream(filePath) });
  for await (const line of rl) {
    if (line.trim()) handler(line);
  }
}

async function main() {
  console.log("Building dictionary from 3 sources...\n");

  const entries = new Map<string, Entry>();
  let raw = 0;

  function addEntry(e: Omit<Entry, "sources"> & { source: string }) {
    const zolai = cleanText(e.zolai);
    const english = cleanText(e.english);
    if (!zolai || !english || zolai.length > 200 || english.length > 200) return;
    // Skip obvious noise
    if (/^\d+$/.test(zolai) || /^\d+$/.test(english)) return;
    if (zolai === english) return;

    const key = dedupeKey(zolai, english);
    const existing = entries.get(key);
    if (existing) {
      // Merge: keep best accuracy, combine synonyms
      if (e.accuracy === "confirmed") existing.accuracy = "confirmed";
      if (e.synonyms) existing.synonyms = [...new Set([...existing.synonyms, ...e.synonyms])];
      if (!existing.sources.includes(e.source)) existing.sources.push(e.source);
    } else {
      entries.set(key, {
        zolai, english,
        pos: e.pos,
        category: e.category,
        definition: e.definition,
        synonyms: e.synonyms ?? [],
        related: e.related ?? [],
        accuracy: e.accuracy,
        tags: e.tags,
        sources: [e.source],
      });
    }
    raw++;
  }

  // ── Source 1: dictionary.jsonl ──────────────────────────────────────────
  console.log("Processing dictionary.jsonl...");
  await readLines(DICT_PATH, (line) => {
    try {
      const r = JSON.parse(line);
      const headword = (r.headword ?? "").trim();
      if (!headword) return;

      const translations: string[] = (r.translations ?? [])
        .map((t: string) => cleanText(t))
        .filter((t: string) => t && t.length < 150);

      const pos = normalizePos(r.pos ?? []);
      const category = pos === "v" ? "verb" : pos === "n" ? "noun" : pos === "adj" ? "adjective" : "other";
      const explanation = (r.explanations ?? []).join("; ").slice(0, 300);
      const source = (r.sources ?? []).join(",");

      if (isZolaiHeadword(headword)) {
        // ZO headword → EN translations
        for (const en of translations) {
          if (!en || en === headword) continue;
          addEntry({ zolai: headword, english: en, pos, category, definition: explanation, synonyms: translations.filter(t => t !== en), related: [], accuracy: "unverified", tags: [category, "tedim"], source });
        }
      } else {
        // EN headword → ZO translations (reverse)
        for (const zo of translations) {
          if (!zo || zo === headword) continue;
          // Only add if translation looks like Zolai
          if (isZolaiHeadword(zo)) {
            addEntry({ zolai: zo, english: headword, pos, category, definition: explanation, synonyms: [], related: [], accuracy: "unverified", tags: [category, "tedim"], source });
          }
        }
      }
    } catch { /* skip malformed */ }
  });
  console.log(`  → ${entries.size} unique entries after dictionary.jsonl`);

  // ── Source 2: phrases_consolidated.jsonl ───────────────────────────────
  console.log("Processing phrases_consolidated.jsonl...");
  await readLines(PHRASES_PATH, (line) => {
    try {
      const r = JSON.parse(line);
      const zo = cleanText(r.zo ?? "");
      const en = cleanText(r.en ?? "");
      if (!zo || !en) return;
      const type = r.type ?? "phrase";
      addEntry({ zolai: zo, english: en, pos: type === "compound" ? "n" : "", category: type, definition: r.note ?? "", synonyms: [], related: [], accuracy: "unverified", tags: ["tedim", type], source: "phrases" });
    } catch { /* skip */ }
  });
  console.log(`  → ${entries.size} unique entries after phrases_consolidated.jsonl`);

  // ── Source 3: bible_vocab_resolved.jsonl ───────────────────────────────
  console.log("Processing bible_vocab_resolved.jsonl...");
  await readLines(BIBLE_PATH, (line) => {
    try {
      const r = JSON.parse(line);
      const zo = cleanText(r.zolai ?? "");
      if (!zo) return;
      const englishArr: string[] = Array.isArray(r.english) ? r.english : [r.english ?? ""];
      // Join array into a phrase, skip if too noisy (>4 words)
      const en = englishArr.filter(Boolean).join(" ").trim();
      if (!en || en.split(" ").length > 4) return;
      const accuracy = typeof r.accuracy === "number" ? (r.accuracy > 0.7 ? "confirmed" : "unverified") : "unverified";
      addEntry({ zolai: zo, english: en, pos: normalizePos(r.pos ?? ""), category: "bible", definition: r.reference ?? "", synonyms: [], related: [], accuracy, tags: ["tedim", "bible"], source: `bible:${r.reference ?? ""}` });
    } catch { /* skip */ }
  });
  console.log(`  → ${entries.size} unique entries after bible_vocab_resolved.jsonl`);
  console.log(`\nTotal raw processed: ${raw}, unique: ${entries.size}`);

  // ── Seed DB ─────────────────────────────────────────────────────────────
  console.log("\nClearing existing vocab words...");
  await prisma.vocabWord.deleteMany();

  const all = [...entries.values()];
  let seeded = 0;

  for (let i = 0; i < all.length; i += BATCH_SIZE) {
    const batch = all.slice(i, i + BATCH_SIZE).map(e => ({
      zolai:      e.zolai,
      english:    e.english,
      pos:        e.pos,
      category:   e.category,
      definition: e.definition,
      synonyms:   e.synonyms.slice(0, 10),
      antonyms:   [] as string[],
      related:    e.related.slice(0, 10),
      variants:   [] as string[],
      accuracy:   e.accuracy,
      tags:       e.tags,
      audioUrl:   "",
    }));
    await prisma.vocabWord.createMany({ data: batch, skipDuplicates: true });
    seeded += batch.length;
    process.stdout.write(`\r  Seeded: ${seeded}/${all.length}...`);
  }

  console.log(`\n\nDone! Seeded ${seeded} entries.`);
  const count = await prisma.vocabWord.count();
  console.log(`DB count: ${count}`);

  // Stats
  const confirmed = await prisma.vocabWord.count({ where: { accuracy: "confirmed" } });
  const byCategory = await prisma.vocabWord.groupBy({ by: ["category"], _count: true, orderBy: { _count: { category: "desc" } }, take: 10 });
  console.log(`Confirmed: ${confirmed}`);
  console.log("Top categories:", byCategory.map(c => `${c.category}:${c._count}`).join(", "));
}

main().catch(console.error).finally(() => prisma.$disconnect());
