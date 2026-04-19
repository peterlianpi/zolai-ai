import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
];

async function testKeyModel(keyIdx: number, key: string, model: string): Promise<{ key: number; model: string; status: string }> {
  try {
    const client = new GoogleGenerativeAI(key);
    const m = client.getGenerativeModel({ model });
    const result = await m.generateContent('Say OK');
    const text = result.response.text();
    console.log(`✓ Key${keyIdx + 1} + ${model}: ${text.slice(0, 15)}`);
    return { key: keyIdx, model, status: 'active' };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes('404')) {
      return { key: keyIdx, model, status: 'not_found' };
    } else if (msg.includes('401') || msg.includes('Unauthorized')) {
      console.log(`✗ Key${keyIdx + 1}: invalid`);
      return { key: keyIdx, model, status: 'invalid_key' };
    } else {
      return { key: keyIdx, model, status: 'error' };
    }
  }
}

async function main() {
  console.log(`Testing ${KEYS.length} keys × ${MODELS.length} models...\n`);

  const results: any[] = [];

  for (let i = 0; i < KEYS.length; i++) {
    for (const model of MODELS) {
      const result = await testKeyModel(i, KEYS[i]!, model);
      results.push(result);
      if (result.status === 'active') {
        console.log(`\n✓ FOUND: Key${i + 1} works with ${model}`);
        console.log(`  Rate: 15 RPM per key × ${KEYS.length} keys = ${15 * KEYS.length} RPM total`);
        console.log(`  Delay: ${Math.ceil(60000 / (15 * KEYS.length))}ms between calls`);
        process.exit(0);
      }
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log('\n=== NO ACTIVE MODELS FOUND ===');
  const active = results.filter(r => r.status === 'active');
  const invalid = results.filter(r => r.status === 'invalid_key');
  console.log(`Active: ${active.length}, Invalid keys: ${invalid.length}`);
}

main().catch(console.error);
