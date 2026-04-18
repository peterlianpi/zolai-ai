import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiPoolConfig {
  keys: string[];
  models: string[];
  rpmPerKey?: number;
  retryAttempts?: number;
}

export class GeminiPool {
  private keys: string[];
  private models: string[];
  private rpmPerKey: number;
  private retryAttempts: number;
  private keyIdx = 0;
  private modelIdx = 0;
  private lastCallTime = 0;
  private rateLimitMs: number;

  constructor(config: GeminiPoolConfig) {
    this.keys = config.keys.filter(Boolean);
    this.models = config.models.filter(Boolean);
    this.rpmPerKey = config.rpmPerKey ?? 15;
    this.retryAttempts = config.retryAttempts ?? 3;

    if (this.keys.length === 0) throw new Error('No API keys provided');
    if (this.models.length === 0) throw new Error('No models provided');

    // Rate limit: 60000ms / (RPM per key × number of keys)
    this.rateLimitMs = Math.ceil(60000 / (this.rpmPerKey * this.keys.length));
  }

  private getNextKey(): string {
    const key = this.keys[this.keyIdx % this.keys.length];
    this.keyIdx++;
    return key;
  }

  private getNextModel(): string {
    const model = this.models[this.modelIdx % this.models.length];
    this.modelIdx++;
    return model;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastCallTime;
    if (elapsed < this.rateLimitMs) {
      await new Promise(r => setTimeout(r, this.rateLimitMs - elapsed));
    }
    this.lastCallTime = Date.now();
  }

  async generate(prompt: string, options?: { model?: string; key?: string }): Promise<string> {
    const model = options?.model || this.getNextModel();
    const key = options?.key || this.getNextKey();

    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        await this.enforceRateLimit();
        const client = new GoogleGenerativeAI(key);
        const m = client.getGenerativeModel({ model });
        const result = await m.generateContent(prompt);
        return result.response.text().trim();
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes('429') || msg.includes('quota') || msg.includes('RESOURCE_EXHAUSTED')) {
          // Rate limited, try next key
          await new Promise(r => setTimeout(r, 2000));
          continue;
        }
        if (msg.includes('401') || msg.includes('Unauthorized')) {
          throw new Error(`Invalid API key: ${key.slice(0, 10)}...`);
        }
        if (msg.includes('404') || msg.includes('not found')) {
          throw new Error(`Model not found: ${model}`);
        }
        throw e;
      }
    }
    throw new Error(`Failed after ${this.retryAttempts} attempts`);
  }

  async generateJson<T = unknown>(prompt: string, options?: { model?: string; key?: string }): Promise<T> {
    const text = await this.generate(prompt, options);
    const cleaned = text.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
    return JSON.parse(cleaned);
  }

  getStats() {
    return {
      keys: this.keys.length,
      models: this.models.length,
      rpmPerKey: this.rpmPerKey,
      totalRpm: this.rpmPerKey * this.keys.length,
      rateLimitMs: this.rateLimitMs,
    };
  }
}

// Singleton instance
let poolInstance: GeminiPool | null = null;

export function initGeminiPool(config: GeminiPoolConfig): GeminiPool {
  poolInstance = new GeminiPool(config);
  return poolInstance;
}

export function getGeminiPool(): GeminiPool {
  if (!poolInstance) {
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_2,
      process.env.GEMINI_API_KEY_3,
    ].filter((k): k is string => Boolean(k));

    const models = (process.env.GEMINI_MODELS || 'gemini-1.5-flash').split(',').map(m => m.trim());

    poolInstance = new GeminiPool({ keys, models });
  }
  return poolInstance;
}
