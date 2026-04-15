// AI Provider Integrations for Zolai Chat
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Groq } from "groq-sdk";
import { OpenAI } from "openai";

// Initialize providers once (module-level singletons)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || "placeholder" });
const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "placeholder");
// Lazy-init OpenAI-compatible clients to avoid crash when key is missing
let openai: OpenAI | null = null;
let openrouter: OpenAI | null = null;
let nvidia: OpenAI | null = null;
function getOpenAI() { return openai ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "placeholder" }); }
function getOpenRouter() { return openrouter ??= new OpenAI({ apiKey: process.env.OPENROUTER_API_KEY || "placeholder", baseURL: "https://openrouter.ai/api/v1" }); }
function getNvidia() { return nvidia ??= new OpenAI({ apiKey: process.env.NVIDIA_API_KEY || "placeholder", baseURL: "https://integrate.api.nvidia.com/v1" }); }

// Dynamic model fetching from providers
export async function getAvailableModels(provider: string) {
  try {
    switch (provider) {
      case 'groq':
        const groqModels = await groq.models.list();
        return groqModels.data
          .filter(m => m.id.includes('llama') || m.id.includes('gemma'))
          .map(m => ({ id: m.id, name: m.id, free: true }));
      
      case 'openrouter':
        const orRes = await fetch('https://openrouter.ai/api/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}` }
        });
        const orData = await orRes.json();
        return orData.data
          .filter((m: { pricing?: { prompt: string }; id: string }) => m.pricing?.prompt === '0' || m.id.includes(':free'))
          .map((m: { id: string; name: string }) => ({ id: m.id, name: m.name, free: true }));
      
      case 'gemini':
        // Gemini models are static but free
        return [
          { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', free: true },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', free: true },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', free: true }
        ];
      
      case 'nvidia':
        const nvRes = await fetch('https://integrate.api.nvidia.com/v1/models', {
          headers: { 'Authorization': `Bearer ${process.env.NVIDIA_API_KEY}` }
        });
        const nvData = await nvRes.json();
        return nvData.data
          .filter((m: { id: string }) => m.id.includes('deepseek') || m.id.includes('llama'))
          .map((m: { id: string }) => ({ id: m.id, name: m.id, free: true }));
      
      default:
        return [];
    }
  } catch (error) {
    console.error(`Failed to fetch models for ${provider}:`, error);
    return [];
  }
}

// Model configurations optimized for language tutoring
export const MODEL_CONFIGS = {
  groq: {
    "llama-3.3-70b-versatile": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "llama-3.1-70b-versatile": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "gemma2-9b-it": { maxTokens: 6000, free: true, tutoring: "good" },
    "llama-3.1-8b-instant": { maxTokens: 6000, free: true, tutoring: "fair" },
  },
  gemini: {
    "gemini-2.0-flash-exp": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "gemini-1.5-flash": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "gemini-1.5-flash-8b": { maxTokens: 6000, free: true, tutoring: "good" },
    "gemini-1.5-pro": { maxTokens: 6000, free: true, tutoring: "excellent" },
  },
  openai: {
    "gpt-4o": { maxTokens: 4000, recommended: true, tutoring: "excellent" },
    "gpt-4o-mini": { maxTokens: 4000, recommended: true, tutoring: "good" },
    "gpt-4-turbo": { maxTokens: 4000, tutoring: "excellent" },
    "gpt-3.5-turbo": { maxTokens: 4000, tutoring: "fair" },
  },
  anthropic: {
    "claude-3-5-sonnet-20241022": { maxTokens: 4000, recommended: true, tutoring: "excellent" },
    "claude-3-5-haiku-20241022": { maxTokens: 4000, recommended: true, tutoring: "good" },
    "claude-3-haiku-20240307": { maxTokens: 4000, tutoring: "good" },
  },
  openrouter: {
    "deepseek/deepseek-chat": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "google/gemini-2.0-flash-exp:free": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "microsoft/phi-4:free": { maxTokens: 6000, recommended: true, free: true, tutoring: "good" },
    "google/gemini-flash-1.5:free": { maxTokens: 6000, free: true, tutoring: "excellent" },
    "meta-llama/llama-3.3-70b-instruct:free": { maxTokens: 6000, free: true, tutoring: "excellent" },
  },
  nvidia: {
    "deepseek-ai/deepseek-r1": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "meta/llama-3.3-70b-instruct": { maxTokens: 6000, recommended: true, free: true, tutoring: "excellent" },
    "nvidia/llama-3.1-nemotron-70b-instruct": { maxTokens: 6000, free: true, tutoring: "good" },
  }
};

// Get model info helper
export function getModelInfo(provider: string, model: string) {
  const providerModels = MODEL_CONFIGS[provider as keyof typeof MODEL_CONFIGS];
  if (!providerModels) return { maxTokens: 1000, free: false, recommended: false };
  
  const modelConfig = providerModels[model as keyof typeof providerModels];
  if (!modelConfig) return { maxTokens: 1000, free: false, recommended: false };
  
  return {
    maxTokens: modelConfig.maxTokens,
    free: modelConfig.free || false,
    recommended: modelConfig.recommended || false,
    tutoring: modelConfig.tutoring || 'good',
  };
}

// Get all free models organized by provider
export function getAllFreeModels() {
  const freeModels: Record<string, Array<{
    model: string;
    provider: string;
    displayName: string;
    maxTokens: number;
    tutoring?: string;
    recommended?: boolean;
  }>> = {};
  
  for (const [provider, models] of Object.entries(MODEL_CONFIGS)) {
    freeModels[provider] = [];
    
    for (const [model, config] of Object.entries(models)) {
      if (config.free) {
        // Create display name from model ID
        const displayName = model
          .split('/')
          .pop()!
          .replace(/:free$/, '') // Remove :free suffix for display
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        
        freeModels[provider].push({
          model,
          provider,
          displayName,
          maxTokens: config.maxTokens,
          tutoring: config.tutoring,
          recommended: config.recommended,
        });
      }
    }
  }
  
  return freeModels;
}

// Get free models for a specific provider
export function getFreeModelsForProvider(provider: string) {
  const freeModels = getAllFreeModels();
  return freeModels[provider] || [];
}

// Get recommended free models (best quality-to-speed ratio)
export function getRecommendedFreeModels() {
  const recommended: Array<{
    model: string;
    provider: string;
    displayName: string;
    maxTokens: number;
    tutoring: string;
  }> = [];
  
  for (const [provider, models] of Object.entries(MODEL_CONFIGS)) {
    for (const [model, config] of Object.entries(models)) {
      if (config.free && config.recommended) {
        const displayName = model
          .split('/')
          .pop()!
          .replace(/:free$/, '')
          .replace(/-/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        
        recommended.push({
          model,
          provider,
          displayName,
          maxTokens: config.maxTokens,
          tutoring: config.tutoring || 'good',
        });
      }
    }
  }
  
  // Sort by tutoring quality (excellent first)
  return recommended.sort((a, b) => {
    const qualityOrder = { excellent: 0, good: 1, fair: 2 };
    return qualityOrder[a.tutoring as keyof typeof qualityOrder] - 
           qualityOrder[b.tutoring as keyof typeof qualityOrder];
  });
}

// Get all available providers with free models
export function getProvidersWithFreeModels() {
  const providers: Array<{
    id: string;
    name: string;
    modelCount: number;
    hasRecommended: boolean;
    defaultModel?: {
      model: string;
      displayName: string;
    };
  }> = [];
  
  const providerNames: Record<string, string> = {
    groq: 'Groq',
    gemini: 'Google Gemini',
    openrouter: 'OpenRouter',
    nvidia: 'NVIDIA',
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    huggingface: 'Hugging Face',
  };
  
  for (const [provider, models] of Object.entries(MODEL_CONFIGS)) {
    const modelArray = Object.entries(models);
    const freeModels = modelArray.filter(([, config]) => config.free);
    if (freeModels.length > 0) {
      const defaultModel = getDefaultFreeModel(provider);
      providers.push({
        id: provider,
        name: providerNames[provider] || provider,
        modelCount: freeModels.length,
        hasRecommended: freeModels.some(([, config]) => config.recommended),
        defaultModel: defaultModel ? {
          model: defaultModel.model,
          displayName: defaultModel.displayName,
        } : undefined,
      });
    }
  }
  
  return providers;
}

// Get default free model for a provider
export function getDefaultFreeModel(provider: string) {
  const providerModels = getFreeModelsForProvider(provider);
  if (providerModels.length === 0) return null;
  
  // Return the recommended one if available, otherwise the first one
  const recommended = providerModels.find(m => m.recommended);
  return recommended || providerModels[0];
}

// Get summary of all free models for display
export function getFreeModelsSummary() {
  const summary = {
    totalFreeModels: 0,
    byProvider: {} as Record<string, {
      count: number;
      recommended: number;
      models: Array<{
        name: string;
        displayName: string;
        tutoring: string;
        recommended: boolean;
      }>;
    }>,
  };
  
  for (const [provider, models] of Object.entries(MODEL_CONFIGS)) {
    const freeModels = Object.entries(models).filter(([, config]) => config.free);
    if (freeModels.length > 0) {
      summary.totalFreeModels += freeModels.length;
      summary.byProvider[provider] = {
        count: freeModels.length,
        recommended: freeModels.filter(([, config]) => config.recommended).length,
        models: freeModels.map(([name, config]) => ({
          name,
          displayName: name.split('/').pop()!.replace(/:free$/, '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          tutoring: config.tutoring || 'good',
          recommended: config.recommended || false,
        })),
      };
    }
  }
  
  return summary;
}

export async function generateChatCompletion({
  provider,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 1000,
}: {
  provider: 'groq' | 'gemini' | 'openai' | 'anthropic' | 'openrouter' | 'nvidia';
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature?: number;
  maxTokens?: number;
}) {
  const validMessages = messages.filter(m => 
    m && m.role && ['user', 'assistant', 'system'].includes(m.role) &&
    m.content && typeof m.content === 'string' && m.content.trim().length > 0
  );
  
  if (validMessages.length === 0) {
    throw new Error('No valid messages provided');
  }
  
  try {
    switch (provider) {
      case 'groq': {
        const completion = await groq.chat.completions.create({
          model,
          messages: validMessages.map(m => ({
            role: m.role as 'system' | 'user' | 'assistant',
            content: m.content,
          })),
          temperature,
          max_tokens: maxTokens,
        });
        return completion.choices[0]?.message?.content ?? '';
      }
      
      case 'gemini': {
        const genModel = gemini.getGenerativeModel({ model });
        const lastUserMsg = validMessages.filter(m => m.role === 'user').pop();
        if (!lastUserMsg) throw new Error('No user message found');
        
        const result = await genModel.generateContent(lastUserMsg.content);
        return result.response.text();
      }
      
      case 'openai': {
        const completion = await getOpenAI().chat.completions.create({
          model,
          messages: validMessages as OpenAI.ChatCompletionMessageParam[],
          temperature,
          max_tokens: maxTokens,
        });
        return completion.choices[0]?.message?.content ?? '';
      }
      
      case 'openrouter': {
        const completion = await getOpenRouter().chat.completions.create({
          model,
          messages: validMessages as OpenAI.ChatCompletionMessageParam[],
          temperature,
          max_tokens: maxTokens,
        });
        return completion.choices[0]?.message?.content ?? '';
      }
      
      case 'nvidia': {
        const completion = await getNvidia().chat.completions.create({
          model,
          messages: validMessages as OpenAI.ChatCompletionMessageParam[],
          temperature,
          max_tokens: maxTokens,
        });
        return completion.choices[0]?.message?.content ?? '';
      }
      
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`AI generation error (${provider}:${model}):`, error);
    throw error;
  }
}
