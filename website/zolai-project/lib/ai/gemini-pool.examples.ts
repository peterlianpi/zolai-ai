import { initGeminiPool, getGeminiPool } from '@/lib/ai/gemini-pool';

// ── Option 1: Use singleton (auto-initialized from env) ──────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function example1() {
  const pool = getGeminiPool();
  const response = await pool.generate('What is 2+2?');
  console.log(response);
}

// ── Option 2: Initialize with custom config ──────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function example2() {
  const pool = initGeminiPool({
    keys: [
      process.env.GEMINI_API_KEY!,
      process.env.GEMINI_API_KEY_2!,
      process.env.GEMINI_API_KEY_3!,
    ],
    models: ['gemini-1.5-flash', 'gemini-2.0-flash'],
    rpmPerKey: 15,
    retryAttempts: 3,
  });

  const response = await pool.generate('Explain quantum computing');
  console.log(response);
}

// ── Option 3: Generate JSON ───────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function example3() {
  const pool = getGeminiPool();
  const data = await pool.generateJson<{ name: string; age: number }>(
    'Return JSON: {"name": "Alice", "age": 30}'
  );
  console.log(data.name, data.age);
}

// ── Option 4: Use specific model or key ───────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function example4() {
  const pool = getGeminiPool();
  const response = await pool.generate('Hello', {
    model: 'gemini-2.0-flash',
    key: process.env.GEMINI_API_KEY_2,
  });
  console.log(response);
}

// ── Option 5: Check pool stats ─────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function example5() {
  const pool = getGeminiPool();
  const stats = pool.getStats();
  console.log(`Total RPM: ${stats.totalRpm}`);
  console.log(`Rate limit: ${stats.rateLimitMs}ms`);
}
