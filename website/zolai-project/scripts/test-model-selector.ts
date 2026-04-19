import 'dotenv/config';
import { getMultiProviderPool } from '../lib/ai/multi-provider-pool';
import { ModelSelector, ContentContext } from '../lib/ai/model-selector';

async function main() {
  console.log('🧪 Multi-Provider Model Selector Test\n');

  const pool = getMultiProviderPool();
  const selector = new ModelSelector(pool);

  // Test contexts
  const contexts: ContentContext[] = [
    {
      type: 'curriculum',
      complexity: 'medium',
      requiresJson: true,
      requiresAccuracy: true,
      requiresSpeed: false,
      contentLength: 500,
    },
    {
      type: 'phonics',
      complexity: 'simple',
      requiresJson: false,
      requiresAccuracy: true,
      requiresSpeed: true,
      contentLength: 200,
    },
    {
      type: 'translation',
      complexity: 'complex',
      requiresJson: false,
      requiresAccuracy: true,
      requiresSpeed: false,
      contentLength: 1000,
    },
    {
      type: 'chat',
      complexity: 'simple',
      requiresJson: false,
      requiresAccuracy: false,
      requiresSpeed: true,
      contentLength: 300,
    },
  ];

  for (const context of contexts) {
    console.log(`\n📋 Context: ${context.type} (${context.complexity})`);
    console.log(`   Accuracy: ${context.requiresAccuracy ? '✓' : '✗'} | Speed: ${context.requiresSpeed ? '✓' : '✗'} | JSON: ${context.requiresJson ? '✓' : '✗'}`);

    const ranked = await selector.rankModels(context);
    console.log(selector.printRanking(ranked));

    // Get best model
    const best = await selector.selectBest(context);
    console.log(`✅ Recommended: ${best.provider}/${best.model}\n`);
  }

  // Show pool stats
  const stats = pool.getStats();
  console.log('\n📊 Pool Statistics:');
  for (const [provider, providerStats] of Object.entries(stats.providers)) {
    const ps = providerStats as any;
    console.log(`  ${provider}: ${ps.keys} keys × ${ps.models} models = ${ps.totalRpm} RPM`);
  }
  console.log(`  Global rate limit: ${stats.globalRateLimitMs}ms`);
}

main().catch(console.error);
