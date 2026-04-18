// AI Provider Integrations for Zolai Chat
import { OpenAI } from "openai";

// OpenAI-compatible clients
function makeClient(apiKey: string, baseURL?: string) {
  return new OpenAI({ apiKey: apiKey || "placeholder", ...(baseURL ? { baseURL } : {}) });
}

let _gemini: OpenAI | null = null;
let _groq: OpenAI | null = null;
let _openrouter: OpenAI | null = null;
let _pollinations: OpenAI | null = null;

function getGemini() { return _gemini ??= makeClient(process.env.GEMINI_API_KEY!, "https://generativelanguage.googleapis.com/v1beta/openai"); }
function getGroq() { return _groq ??= makeClient(process.env.GROQ_API_KEY!, "https://api.groq.com/openai/v1"); }
function getOpenRouter() { return _openrouter ??= makeClient(process.env.OPENROUTER_API_KEY!, "https://openrouter.ai/api/v1"); }
function getPollinations() { return _pollinations ??= makeClient("pollinations", "https://text.pollinations.ai/openai"); }

// Provider → model → config
export const MODEL_CONFIGS = {
  gemini: {
    "gemini-2.5-flash":      { maxTokens: 8000, recommended: true,  free: true, tutoring: "excellent" },
    "gemini-2.5-flash-lite": { maxTokens: 8000, recommended: false, free: true, tutoring: "good" },
    "gemini-2.5-pro":        { maxTokens: 8000, recommended: false, free: true, tutoring: "excellent" },
  },
  groq: {
    "llama-3.3-70b-versatile":  { maxTokens: 6000, recommended: true,  free: true, tutoring: "excellent" },
    "llama-3.1-8b-instant":     { maxTokens: 6000, recommended: false, free: true, tutoring: "fair" },
    "gemma2-9b-it":             { maxTokens: 6000, recommended: false, free: true, tutoring: "good" },
  },
  openrouter: {
    "liquid/lfm-2.5-1.2b-instruct:free":      { maxTokens: 4000, recommended: true,  free: true, tutoring: "good" },
    "google/gemma-3-27b-it:free":              { maxTokens: 6000, recommended: false, free: true, tutoring: "excellent" },
    "google/gemma-4-31b-it:free":              { maxTokens: 6000, recommended: false, free: true, tutoring: "excellent" },
    "meta-llama/llama-3.3-70b-instruct:free":  { maxTokens: 6000, recommended: false, free: true, tutoring: "excellent" },
  },
  pollinations: {
    "openai":       { maxTokens: 4000, recommended: false, free: true, tutoring: "good" },
    "mistral":      { maxTokens: 4000, recommended: false, free: true, tutoring: "good" },
    "deepseek-v3":  { maxTokens: 6000, recommended: false, free: true, tutoring: "good" },
  },
} as const;

export type Provider = keyof typeof MODEL_CONFIGS;

// Fallback chain: try each provider in order until one succeeds
const FALLBACK_CHAIN: Array<{ provider: Provider; model: string }> = [
  { provider: "gemini",      model: "gemini-2.5-flash" },
  { provider: "groq",        model: "llama-3.3-70b-versatile" },
  { provider: "openrouter",  model: "liquid/lfm-2.5-1.2b-instruct:free" },
  { provider: "pollinations", model: "openai" },
];

function getClient(provider: Provider): OpenAI {
  switch (provider) {
    case "gemini":      return getGemini();
    case "groq":        return getGroq();
    case "openrouter":  return getOpenRouter();
    case "pollinations": return getPollinations();
  }
}

export async function generateChatCompletion({
  provider,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 1000,
  stream = false,
}: {
  provider?: Provider;
  model?: string;
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}) {
  const validMessages = messages.filter(
    m => m?.role && ["user", "assistant", "system"].includes(m.role) && m.content?.trim()
  );
  if (!validMessages.length) throw new Error("No valid messages");

  // If specific provider+model requested, use it directly
  if (provider && model) {
    return callProvider(getClient(provider), model, validMessages, temperature, maxTokens, stream);
  }

  // Otherwise try fallback chain
  let lastError: unknown;
  for (const entry of FALLBACK_CHAIN) {
    try {
      return await callProvider(getClient(entry.provider), entry.model, validMessages, temperature, maxTokens, stream);
    } catch (e) {
      lastError = e;
      console.warn(`[ai] ${entry.provider}/${entry.model} failed, trying next`);
    }
  }
  throw lastError;
}

async function callProvider(
  client: OpenAI,
  model: string,
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>,
  temperature: number,
  maxTokens: number,
  stream: boolean,
) {
  if (stream) {
    return client.chat.completions.create({
      model, messages: messages as OpenAI.ChatCompletionMessageParam[],
      temperature, max_tokens: maxTokens, stream: true,
    });
  }
  const res = await client.chat.completions.create({
    model, messages: messages as OpenAI.ChatCompletionMessageParam[],
    temperature, max_tokens: maxTokens, stream: false,
  });
  return res.choices[0]?.message?.content ?? "";
}

// Model listing helpers
export async function getAvailableModels(provider: string) {
  const configs = MODEL_CONFIGS[provider as Provider];
  if (!configs) return [];
  return Object.entries(configs).map(([id, cfg]) => ({ id, name: id, ...cfg }));
}

export function getModelInfo(provider: string, model: string) {
  const cfg = (MODEL_CONFIGS[provider as Provider] as Record<string, { maxTokens: number; free: boolean; recommended: boolean; tutoring: string }>)?.[model];
  return cfg ?? { maxTokens: 1000, free: false, recommended: false, tutoring: "unknown" };
}

export function getAllFreeModels() {
  const result: Record<string, Array<{ model: string; provider: string; displayName: string; maxTokens: number; tutoring: string; recommended: boolean }>> = {};
  for (const [provider, models] of Object.entries(MODEL_CONFIGS)) {
    result[provider] = Object.entries(models)
      .filter(([, c]) => c.free)
      .map(([model, c]) => ({
        model, provider,
        displayName: model.split("/").pop()!.replace(/:free$/, "").replace(/-/g, " ").replace(/\b\w/g, ch => ch.toUpperCase()),
        maxTokens: c.maxTokens,
        tutoring: c.tutoring,
        recommended: c.recommended,
      }));
  }
  return result;
}

export function getFreeModelsForProvider(provider: string) {
  return getAllFreeModels()[provider] ?? [];
}

export function getRecommendedFreeModels() {
  return Object.values(getAllFreeModels()).flat().filter(m => m.recommended)
    .sort((a, b) => ({ excellent: 0, good: 1, fair: 2 }[a.tutoring as "excellent" | "good" | "fair"] ?? 3) - ({ excellent: 0, good: 1, fair: 2 }[b.tutoring as "excellent" | "good" | "fair"] ?? 3));
}

export function getProvidersWithFreeModels() {
  return Object.entries(getAllFreeModels()).map(([id, models]) => ({
    id,
    name: { gemini: "Google Gemini", groq: "Groq", openrouter: "OpenRouter", pollinations: "Pollinations" }[id] ?? id,
    modelCount: models.length,
    hasRecommended: models.some(m => m.recommended),
    defaultModel: models.find(m => m.recommended) ?? models[0],
  }));
}

export function getFreeModelsSummary() {
  const all = getAllFreeModels();
  return {
    totalFreeModels: Object.values(all).flat().length,
    byProvider: Object.fromEntries(Object.entries(all).map(([p, ms]) => [p, {
      count: ms.length,
      recommended: ms.filter(m => m.recommended).length,
      models: ms.map(m => ({ name: m.model, displayName: m.displayName, tutoring: m.tutoring, recommended: m.recommended })),
    }])),
  };
}
