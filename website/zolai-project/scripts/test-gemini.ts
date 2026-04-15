import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const key = process.env.GEMINI_API_KEY;
  const model = new GoogleGenerativeAI(key!).getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `Return a JSON array with 1 simple exercise object. Fields: prompt, correctAnswer, explanation. Example: [{"prompt": "What is 2+2?", "correctAnswer": "4", "explanation": "Basic math"}]`;

  const result = await model.generateContent(prompt);
  const text = result.response.text().trim();
  console.log('Raw response:');
  console.log(text.slice(0, 500));
  console.log('---');
  try {
    const parsed = JSON.parse(text);
    console.log('Parsed OK:', Array.isArray(parsed) ? 'array' : 'object');
    console.log('First item:', JSON.stringify(parsed[0] || parsed, null, 2));
  } catch (e) {
    console.log('Parse error:', (e as Error).message);
  }
}

main().catch(console.error);
