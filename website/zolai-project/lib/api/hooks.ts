import { useMutation, useQuery } from "@tanstack/react-query";
import { client } from "@/lib/api/client";

// Static fallback models
const FALLBACK_MODELS = {
  openrouter: [
    { id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
    { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B' }
  ],
  groq: [
    { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B' },
    { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B' }
  ],
  gemini: [
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
  ],
  nvidia: [
    { id: 'deepseek-ai/deepseek-r1', name: 'DeepSeek R1' },
    { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B' }
  ]
};

// Get available models using Hono client
export function useAvailableModels(provider: string) {
  return useQuery({
    queryKey: ["models", provider],
    queryFn: async () => {
      try {
      const res = await client.api.chat.models[":provider"].$get({ param: { provider } });
        const data = await res.json() as { success: boolean; data: { models: { id: string; name: string }[] } };
        if (data.success && data.data?.models) {
          return { models: data.data.models };
        }
        throw new Error('Invalid response');
      } catch (error) {
        console.warn(`Using fallback models for ${provider}:`, error);
        return { models: FALLBACK_MODELS[provider as keyof typeof FALLBACK_MODELS] || [] };
      }
    },
    enabled: !!provider,
    staleTime: 5 * 60 * 1000,
    // Always provide fallback data
    initialData: { models: FALLBACK_MODELS[provider as keyof typeof FALLBACK_MODELS] || [] }
  });
}

// Chat mutation using Hono client
export function useChat() {
  return useMutation({
    mutationFn: async (data: {
      message?: string;
      messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
      provider?: string;
      model?: string;
      tutor?: boolean;
      level?: string;
      mode?: string;
      sessionId?: string;
    }) => {
      // Always add Zolai system prompt if not present
      let messages = data.messages || [];
      if (messages.length > 0 && messages[0]?.role !== 'system') {
        const { getChatSystemPrompt, getTutorSystemPrompt } = await import('@/lib/zolai/curriculum');
        const systemPrompt = data.tutor 
          ? getTutorSystemPrompt(data.level, data.mode)
          : getChatSystemPrompt();
        messages = [{ role: 'system', content: systemPrompt }, ...messages];
      }
      
      const res = await client.api.chat.$post({ 
        json: { ...data, messages } 
      });
      if (!res.ok) {
        const error = await res.json() as unknown as { error?: string };
        throw new Error(error.error || 'Chat failed');
      }
      return await res.json();
    },
  });
}

// Mock test model
export function useTestModel() {
  return {
    mutateAsync: async ({ provider, model }: { provider: string; model: string }) => {
      return { available: true, provider, model };
    },
    isPending: false
  };
}