import { initGeminiPool } from '../lib/ai/gemini-pool';

async function main() {
  console.log('Testing Gemini Pool...\n');

  const pool = initGeminiPool({
    keys: [
      process.env.GEMINI_API_KEY || '',
      process.env.GEMINI_API_KEY_2 || '',
      process.env.GEMINI_API_KEY_3 || '',
    ].filter(Boolean),
    models: ['gemini-1.5-flash', 'gemini-2.0-flash'],
    rpmPerKey: 15,
    retryAttempts: 2,
  });

  const stats = pool.getStats();
  console.log('Pool Configuration:');
  console.log(`  Keys: ${stats.keys}`);
  console.log(`  Models: ${stats.models}`);
  console.log(`  Total RPM: ${stats.totalRpm}`);
  console.log(`  Rate limit: ${stats.rateLimitMs}ms\n`);

  try {
    console.log('Testing generate()...');
    const response = await pool.generate('Say "OK"');
    console.log(`✓ Response: ${response.slice(0, 50)}\n`);

    console.log('Testing generateJson()...');
    const json = await pool.generateJson('Return JSON: {"test": true}');
    console.log(`✓ JSON: ${JSON.stringify(json)}\n`);

    console.log('✓ All tests passed');
  } catch (e) {
    console.error('✗ Test failed:', e instanceof Error ? e.message : e);
    process.exit(1);
  }
}

main().catch(console.error);
