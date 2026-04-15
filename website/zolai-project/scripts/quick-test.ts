import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('GEMINI_API_KEY not set');
  process.exit(1);
}

const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

async function test() {
  for (const model of models) {
    try {
      const client = new GoogleGenerativeAI(key);
      const m = client.getGenerativeModel({ model });
      const result = await m.generateContent('OK');
      console.log(`✓ ${model}`);
      return model;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(`✗ ${model}: ${msg.includes('404') ? 'not found' : msg.includes('401') ? 'unauthorized' : 'error'}`);
    }
  }
}

test().then(m => {
  if (m) console.log(`\nUse: GEMINI_MODEL=${m}`);
}).catch(console.error);
