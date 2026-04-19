import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

const MODELS_TO_TEST = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro',
];

async function testKey(keyIdx: number, key: string) {
  console.log(`\n=== KEY ${keyIdx + 1} ===`);
  const client = new GoogleGenerativeAI(key);

  for (const model of MODELS_TO_TEST) {
    try {
      const m = client.getGenerativeModel({ model });
      const result = await m.generateContent('Say "OK"');
      const text = result.response.text();
      console.log(`✓ ${model}: ${text.slice(0, 20)}`);
      return { key: keyIdx, model, status: 'active' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('404') || msg.includes('not found')) {
        console.log(`✗ ${model}: not available`);
      } else if (msg.includes('401') || msg.includes('Unauthorized')) {
        console.log(`✗ ${model}: unauthorized`);
        return { key: keyIdx, model, status: 'invalid_key' };
      } else {
        console.log(`✗ ${model}: ${msg.slice(0, 50)}`);
      }
    }
  }
  return { key: keyIdx, status: 'no_models' };
}

async function main() {
  console.log(`Testing ${KEYS.length} keys × ${MODELS_TO_TEST.length} models...`);

  const results: any[] = [];
  for (let i = 0; i < KEYS.length; i++) {
    const result = await testKey(i, KEYS[i]!);
    results.push(result);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n=== SUMMARY ===');
  const active = results.filter(r => r.status === 'active');
  const invalid = results.filter(r => r.status === 'invalid_key');
  const noModels = results.filter(r => r.status === 'no_models');

  console.log(`Active keys: ${active.length}`);
  active.forEach(r => console.log(`  Key ${r.key + 1}: ${r.model}`));

  console.log(`Invalid keys: ${invalid.length}`);
  console.log(`No models: ${noModels.length}`);

  if (active.length > 0) {
    console.log(`\n✓ Recommended: Use ${active[0].model} with key rotation`);
    console.log(`  Rate limit: 15 RPM per key = ${active.length * 15} RPM total`);
    console.log(`  Delay between calls: ${Math.ceil(60000 / (active.length * 15))}ms`);
  }
}

main().catch(console.error);
