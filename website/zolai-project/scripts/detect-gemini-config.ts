import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const KEYS = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY_3,
].filter(Boolean);

async function getAvailableModels(key: string): Promise<string[]> {
  try {
    const client = new GoogleGenerativeAI(key);
    const response = await client.getGenerativeModel({ model: 'gemini-1.5-flash' }).generateContent('test');
    // If we got here, at least gemini-1.5-flash works
    return ['gemini-1.5-flash'];
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // Try to extract available models from error message or try common ones
    const models = [];
    for (const model of ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']) {
      try {
        const client = new GoogleGenerativeAI(key);
        await client.getGenerativeModel({ model }).generateContent('test');
        models.push(model);
      } catch {
        // Model not available
      }
    }
    return models;
  }
}

async function testKey(keyIdx: number, key: string): Promise<{ key: number; model: string; status: string } | null> {
  console.log(`\nTesting Key${keyIdx + 1}...`);
  
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  
  for (const model of models) {
    try {
      const client = new GoogleGenerativeAI(key);
      const m = client.getGenerativeModel({ model });
      const result = await m.generateContent('Say OK');
      const text = result.response.text();
      console.log(`  ✓ ${model}: works`);
      return { key: keyIdx, model, status: 'active' };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes('401') || msg.includes('Unauthorized')) {
        console.log(`  ✗ Key invalid (401)`);
        return { key: keyIdx, model: '', status: 'invalid_key' };
      }
      // Try next model
    }
  }
  
  console.log(`  ✗ No working models found`);
  return null;
}

async function main() {
  console.log(`Testing ${KEYS.length} API keys for available models...\n`);

  let activeKey: { key: number; model: string } | null = null;

  for (let i = 0; i < KEYS.length; i++) {
    const result = await testKey(i, KEYS[i]!);
    if (result?.status === 'active') {
      activeKey = { key: result.key, model: result.model };
      break;
    }
    if (result?.status === 'invalid_key') {
      console.log(`Key${i + 1} is invalid, skipping remaining models`);
      break;
    }
    await new Promise(r => setTimeout(r, 1000));
  }

  if (activeKey) {
    console.log(`\n✓ ACTIVE: Key${activeKey.key + 1} + ${activeKey.model}`);
    console.log(`\nRate limiting:`);
    console.log(`  - 15 RPM per key`);
    console.log(`  - ${KEYS.length} keys available`);
    console.log(`  - Total: ${15 * KEYS.length} RPM`);
    console.log(`  - Delay between calls: ${Math.ceil(60000 / (15 * KEYS.length))}ms`);
    console.log(`\nUpdate seed-curriculum-content.ts to use: ${activeKey.model}`);
  } else {
    console.log(`\n✗ No active keys found`);
  }
}

main().catch(console.error);
