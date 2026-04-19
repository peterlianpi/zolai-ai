/**
 * Generate Zolai training data using Gemini API
 * Usage: bunx tsx scripts/generate-training-data.ts
 * Usage (append mode): bunx tsx scripts/generate-training-data.ts --append
 *
 * Outputs JSONL to data/generated/zolai-synthetic.jsonl
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import { writeFileSync, mkdirSync, appendFileSync, existsSync } from "fs";
import { join } from "path";

// Validate keys
const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean) as string[];

if (KEYS.length === 0) {
  console.error("No GEMINI_API_KEY found. Add to .env.local");
  process.exit(1);
}

const APPEND = process.argv.includes("--append");
const OUTPUT_DIR = join(process.cwd(), "data/generated");
const OUTPUT_FILE = join(OUTPUT_DIR, "zolai-synthetic.jsonl");

// Rotate keys to spread rate limits
let keyIndex = 0;
function getModel() {
  const key = KEYS[keyIndex % KEYS.length];
  keyIndex++;
  return new GoogleGenerativeAI(key).getGenerativeModel({
    model: "gemini-2.5-flash", // latest stable
    generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
  });
}

// Dialect rules injected into every prompt
const DIALECT_RULES = `
STRICT Tedim ZVS dialect rules:
- USE: pasian, gam, tapa, topa, kumpipa, tua
- NEVER: pathian, ram, fapa, bawipa, siangpahrang, cu/cun
- Word order: SOV (Subject-Object-Verb)
- Negation: "kei" for conditionals (nong pai kei a leh), "lo" for simple negative
- o = /oʊ/ always. No "ti" clusters. No c+{a,e,o,aw}
- Plural: never combine "uh" with "i" (we)
`.trim();

const TASKS = [
  {
    name: "translation_en_to_zo",
    batchSize: 25,
    prompt: (n: number) => `Generate ${n} English→Tedim Zolai translation pairs.
${DIALECT_RULES}
Topics: daily life, nature, family, faith, learning, greetings, food, work.
Output ONLY a valid JSON array, no markdown:
[{"english": "...", "zolai": "..."}]`,
  },
  {
    name: "translation_zo_to_en",
    batchSize: 25,
    prompt: (n: number) => `Generate ${n} Tedim Zolai→English translation pairs.
${DIALECT_RULES}
Use varied vocabulary. Include sentences from different CEFR levels (A1-C1).
Output ONLY a valid JSON array, no markdown:
[{"zolai": "...", "english": "..."}]`,
  },
  {
    name: "grammar_qa",
    batchSize: 20,
    prompt: (n: number) => `Generate ${n} Tedim Zolai grammar Q&A pairs for language learners.
${DIALECT_RULES}
Cover: SOV order, negation (kei vs lo), verb aspects (-in completive, -cing progressive),
postpositions (a, in, leh), causative (-sak), reciprocal (ki-), sentence-final particles (hi, maw).
Output ONLY a valid JSON array, no markdown:
[{"question": "...", "answer": "..."}]`,
  },
  {
    name: "conversation",
    batchSize: 15,
    prompt: (n: number) => `Generate ${n} short natural Tedim Zolai conversations (3-5 turns each).
${DIALECT_RULES}
Contexts: market, school, church, home, greeting a friend, asking directions.
Output ONLY a valid JSON array, no markdown:
[{"context": "...", "turns": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}]`,
  },
  {
    name: "cefr_exercises",
    batchSize: 20,
    prompt: (n: number) => `Generate ${n} Tedim Zolai language exercises across CEFR levels A1-C1.
${DIALECT_RULES}
Exercise types: fill-in-the-blank, error correction, sentence production, translation.
Output ONLY a valid JSON array, no markdown:
[{"level": "A1"|"A2"|"B1"|"B2"|"C1", "type": "...", "instruction": "...", "zolai": "...", "english": "...", "answer": "..."}]`,
  },
  {
    name: "proverbs_similes",
    batchSize: 15,
    prompt: (n: number) => `Generate ${n} Tedim Zolai proverbs (paunak) and similes (tehpih kam).
${DIALECT_RULES}
Similes end with "bang". Include cultural context.
Output ONLY a valid JSON array, no markdown:
[{"type": "proverb"|"simile", "zolai": "...", "english_meaning": "...", "usage": "..."}]`,
  },
];

async function generateBatch(
  taskName: string,
  promptFn: (n: number) => string,
  batchSize: number,
  retries = 3
): Promise<{ taskName: string; items: unknown[] }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const model = getModel();
      const result = await model.generateContent(promptFn(batchSize));
      const text = result.response.text();
      // Strip markdown code fences if present
      const clean = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const match = clean.match(/\[[\s\S]*\]/);
      if (!match) throw new Error("No JSON array in response");
      const items = JSON.parse(match[0]);
      if (!Array.isArray(items) || items.length === 0) throw new Error("Empty array");
      return { taskName, items };
    } catch (e) {
      console.warn(`  [${taskName}] Attempt ${attempt}/${retries} failed:`, (e as Error).message);
      if (attempt < retries) await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
  return { taskName, items: [] };
}

function toJsonl(taskName: string, items: unknown[]): string {
  return items
    .map((item) => JSON.stringify({ task: taskName, ...(item as object) }))
    .join("\n");
}

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  if (!APPEND) {
    writeFileSync(OUTPUT_FILE, "");
    console.log(`Output: ${OUTPUT_FILE} (reset)`);
  } else {
    console.log(`Output: ${OUTPUT_FILE} (append)`);
  }

  console.log(`Using ${KEYS.length} API key(s)\n`);

  let total = 0;
  for (const task of TASKS) {
    process.stdout.write(`Generating ${task.name} (${task.batchSize} items)... `);
    const { taskName, items } = await generateBatch(task.name, task.prompt, task.batchSize);
    if (items.length > 0) {
      appendFileSync(OUTPUT_FILE, toJsonl(taskName, items) + "\n");
      total += items.length;
      console.log(`✓ ${items.length}`);
    } else {
      console.log("✗ failed");
    }
    // Respect rate limits between tasks
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n✓ Done. ${total} items → ${OUTPUT_FILE}`);
}

main();
