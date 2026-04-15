import { MultiProviderPool, Provider } from './multi-provider-pool';

export interface ModelScore {
  provider: Provider;
  model: string;
  score: number;
  reason: string;
  latency?: number;
  costPerMTok?: number;
}

export interface ContentContext {
  type: 'curriculum' | 'phonics' | 'translation' | 'grammar' | 'chat' | 'analysis';
  complexity: 'simple' | 'medium' | 'complex';
  requiresJson: boolean;
  requiresAccuracy: boolean;
  requiresSpeed: boolean;
  contentLength: number;
}

const MODEL_PROFILES: Record<string, { speed: number; accuracy: number; cost: number; json: number }> = {
  // Gemini models
  'gemini-1.5-flash': { speed: 9, accuracy: 8, cost: 9, json: 9 },
  'gemini-2.0-flash': { speed: 9, accuracy: 8, cost: 8, json: 9 },
  'gemini-1.5-pro': { speed: 7, accuracy: 9, cost: 6, json: 9 },

  // Groq models (fast, good for real-time)
  'mixtral-8x7b-32768': { speed: 10, accuracy: 8, cost: 8, json: 8 },
  'llama-2-70b-chat': { speed: 9, accuracy: 7, cost: 8, json: 7 },
  'llama-3-70b-8192': { speed: 9, accuracy: 8, cost: 8, json: 8 },

  // OpenRouter models
  'openai/gpt-3.5-turbo': { speed: 8, accuracy: 7, cost: 9, json: 8 },
  'openai/gpt-4': { speed: 6, accuracy: 10, cost: 4, json: 10 },
  'anthropic/claude-3-opus': { speed: 7, accuracy: 10, cost: 5, json: 10 },
  'meta-llama/llama-2-70b-chat': { speed: 9, accuracy: 7, cost: 8, json: 7 },
};

export class ModelSelector {
  constructor(private pool: MultiProviderPool) {}

  private scoreModel(model: string, context: ContentContext): number {
    const profile = MODEL_PROFILES[model] || { speed: 5, accuracy: 5, cost: 5, json: 5 };
    let score = 0;

    // Base score from profile
    if (context.requiresSpeed) score += profile.speed * 2;
    if (context.requiresAccuracy) score += profile.accuracy * 2;
    score += profile.cost; // Always prefer cheaper

    // JSON support bonus
    if (context.requiresJson) score += profile.json * 1.5;

    // Complexity matching
    if (context.complexity === 'simple' && profile.speed > 8) score += 10;
    if (context.complexity === 'complex' && profile.accuracy > 8) score += 10;

    // Content type optimization
    if (context.type === 'curriculum' && profile.accuracy > 7) score += 5;
    if (context.type === 'phonics' && profile.accuracy > 7) score += 5;
    if (context.type === 'chat' && profile.speed > 8) score += 5;
    if (context.type === 'translation' && profile.accuracy > 8) score += 10;

    return score;
  }

  async rankModels(context: ContentContext): Promise<ModelScore[]> {
    const stats = this.pool.getStats();
    const scores: ModelScore[] = [];

    for (const [provider, providerStats] of Object.entries(stats.providers)) {
      const ps = providerStats as Record<string, unknown>;
      for (const model of (ps.models as string[]) || []) {
        const score = this.scoreModel(model, context);
        const profile = MODEL_PROFILES[model] || { speed: 5, accuracy: 5, cost: 5, json: 5 };

        let reason = '';
        if (context.requiresSpeed && profile.speed > 8) reason += 'Fast ';
        if (context.requiresAccuracy && profile.accuracy > 8) reason += 'Accurate ';
        if (context.requiresJson && profile.json > 8) reason += 'JSON-capable ';
        if (context.complexity === 'complex' && profile.accuracy > 8) reason += 'Complex-ready ';

        scores.push({
          provider: provider as Provider,
          model,
          score,
          reason: reason || 'Balanced',
          latency: 11 - profile.speed, // Lower is better
          costPerMTok: 11 - profile.cost, // Lower is better
        });
      }
    }

    return scores.sort((a, b) => b.score - a.score);
  }

  async testModels(
    prompt: string,
    context: ContentContext,
    limit: number = 3
  ): Promise<{ model: ModelScore; response: string; duration: number }[]> {
    const ranked = await this.rankModels(context);
    const results: { model: ModelScore; response: string; duration: number }[] = [];

    for (const modelScore of ranked.slice(0, limit)) {
      try {
        const start = Date.now();
        const response = await this.pool.generate(prompt, {
          provider: modelScore.provider,
          model: modelScore.model,
        });
        const duration = Date.now() - start;

        results.push({ model: modelScore, response, duration });
      } catch (err) {
        console.error(`Failed to test ${modelScore.provider}/${modelScore.model}:`, err);
      }
    }

    return results;
  }

  async selectBest(context: ContentContext): Promise<{ provider: Provider; model: string }> {
    const ranked = await this.rankModels(context);
    if (ranked.length === 0) throw new Error('No models available');

    const best = ranked[0];
    return { provider: best.provider, model: best.model };
  }

  printRanking(ranked: ModelScore[]): string {
    let output = '\n=== Model Ranking ===\n';
    ranked.forEach((m, i) => {
      output += `${i + 1}. ${m.provider}/${m.model}\n`;
      output += `   Score: ${m.score.toFixed(1)} | ${m.reason}\n`;
      output += `   Latency: ${m.latency}ms | Cost: ${m.costPerMTok}¢/MTok\n`;
    });
    return output;
  }
}
