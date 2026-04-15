import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export type Provider = 'gemini' | 'groq' | 'openrouter';

export interface ProviderConfig {
  provider: Provider;
  keys: string[];
  models: string[];
  rpmPerKey?: number;
  retryAttempts?: number;
}

export interface PoolConfig {
  providers: ProviderConfig[];
  defaultProvider?: Provider;
}

interface ProviderInstance {
  provider: Provider;
  keyIdx: number;
  modelIdx: number;
  keys: string[];
  models: string[];
  rpmPerKey: number;
  retryAttempts: number;
}

export class MultiProviderPool {
  private providers: Map<Provider, ProviderInstance> = new Map();
  private providerOrder: Provider[] = [];
  private currentProviderIdx = 0;
  private lastCallTime = 0;
  private globalRateLimitMs: number;

  constructor(config: PoolConfig) {
    for (const providerConfig of config.providers) {
      const keys = providerConfig.keys.filter(Boolean);
      const models = providerConfig.models.filter(Boolean);

      if (keys.length === 0 || models.length === 0) continue;

      this.providers.set(providerConfig.provider, {
        provider: providerConfig.provider,
        keyIdx: 0,
        modelIdx: 0,
        keys,
        models,
        rpmPerKey: providerConfig.rpmPerKey ?? 15,
        retryAttempts: providerConfig.retryAttempts ?? 3,
      });

      this.providerOrder.push(providerConfig.provider);
    }

    if (this.providerOrder.length === 0) {
      throw new Error('No valid providers configured');
    }

    // Global rate limit: distribute across all providers
    const totalRpm = Array.from(this.providers.values()).reduce(
      (sum, p) => sum + p.rpmPerKey * p.keys.length,
      0
    );
    this.globalRateLimitMs = Math.ceil(60000 / totalRpm);
  }

  private getNextProvider(): ProviderInstance {
    const provider = this.providers.get(this.providerOrder[this.currentProviderIdx])!;
    this.currentProviderIdx = (this.currentProviderIdx + 1) % this.providerOrder.length;
    return provider;
  }

  private getNextKey(provider: ProviderInstance): string {
    const key = provider.keys[provider.keyIdx % provider.keys.length];
    provider.keyIdx++;
    return key;
  }

  private getNextModel(provider: ProviderInstance): string {
    const model = provider.models[provider.modelIdx % provider.models.length];
    provider.modelIdx++;
    return model;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.globalRateLimitMs) {
      await new Promise(r => setTimeout(r, this.globalRateLimitMs - elapsed));
    }
    this.lastCallTime = Date.now();
  }

  async generate(
    prompt: string,
    options?: { provider?: Provider; model?: string; key?: string }
  ): Promise<string> {
    const providerInstance = options?.provider
      ? this.providers.get(options.provider)
      : this.getNextProvider();

    if (!providerInstance) {
      throw new Error(`Provider not found: ${options?.provider}`);
    }

    const model = options?.model || this.getNextModel(providerInstance);
    const key = options?.key || this.getNextKey(providerInstance);

    for (let attempt = 0; attempt < providerInstance.retryAttempts; attempt++) {
      try {
        await this.enforceRateLimit();

        let response: string;

        if (providerInstance.provider === 'gemini') {
          const client = new GoogleGenerativeAI(key);
          const m = client.getGenerativeModel({ model });
          const result = await m.generateContent(prompt);
          response = result.response.text().trim();
        } else if (providerInstance.provider === 'groq') {
          const client = new Groq({ apiKey: key });
          const result = await client.chat.completions.create({
            model,
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.7,
          });
          response = result.choices[0]?.message?.content || '';
        } else if (providerInstance.provider === 'openrouter') {
          const response_obj = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model,
              messages: [{ role: 'user', content: prompt }],
              temperature: 0.7,
            }),
          });
          const data = await response_obj.json();
          response = data.choices?.[0]?.message?.content || '';
        } else {
          throw new Error(`Unknown provider: ${providerInstance.provider}`);
        }

        return response.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);

        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }

        if (msg.includes('401') || msg.includes('Unauthorized')) {
          throw new Error(`Invalid API key for ${providerInstance.provider}`);
        }

        if (msg.includes('404') || msg.includes('not found')) {
          throw new Error(`Model not found: ${model}`);
        }

        throw e;
      }
    }

    throw new Error(`Failed after ${providerInstance.retryAttempts} attempts on ${providerInstance.provider}`);
  }

  async generateJson<T = unknown>(
    prompt: string,
    options?: { provider?: Provider; model?: string; key?: string }
  ): Promise<T> {
    const text = await this.generate(prompt, options);
    return JSON.parse(text);
  }

  getStats() {
    const stats: Record<string, unknown> = {};

    for (const [provider, instance] of this.providers) {
      stats[provider] = {
        keys: instance.keys.length,
        models: instance.models.length,
        rpmPerKey: instance.rpmPerKey,
        totalRpm: instance.rpmPerKey * instance.keys.length,
      };
    }

    return {
      providers: stats,
      globalRateLimitMs: this.globalRateLimitMs,
      totalProviders: this.providers.size,
    };
  }
}

// Singleton instance
let poolInstance: MultiProviderPool | null = null;

export function initMultiProviderPool(config: PoolConfig): MultiProviderPool {
  poolInstance = new MultiProviderPool(config);
  return poolInstance;
}

export function getMultiProviderPool(): MultiProviderPool {
  if (!poolInstance) {
    const config: PoolConfig = {
      providers: [
        {
          provider: 'gemini',
          keys: [
            process.env.GEMINI_API_KEY,
            process.env.GEMINI_API_KEY_2,
            process.env.GEMINI_API_KEY_3,
          ].filter(Boolean),
          models: (process.env.GEMINI_MODELS || 'gemini-1.5-flash').split(',').map(m => m.trim()),
          rpmPerKey: 15,
        },
        {
          provider: 'groq',
          keys: [process.env.GROQ_API_KEY].filter(Boolean),
          models: (process.env.GROQ_MODELS || 'mixtral-8x7b-32768').split(',').map(m => m.trim()),
          rpmPerKey: 30,
        },
        {
          provider: 'openrouter',
          keys: [process.env.OPENROUTER_API_KEY].filter(Boolean),
          models: (process.env.OPENROUTER_MODELS || 'openai/gpt-3.5-turbo').split(',').map(m => m.trim()),
          rpmPerKey: 20,
        },
      ],
      defaultProvider: 'gemini',
    };

    poolInstance = new MultiProviderPool(config);
  }
  return poolInstance;
}
