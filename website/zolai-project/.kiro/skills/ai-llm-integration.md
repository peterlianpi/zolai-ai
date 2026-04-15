---
name: ai-llm-integration
description: AI/LLM integration patterns for the Zolai platform — chat proxy, fine-tuned model, streaming, provider selection. Use when working on the Zolai chat, tutor, or training features.
---

# AI/LLM Integration — Zolai Project

## Fine-tuned model endpoint

```
ZOLAI_API_URL=http://13.115.84.100:18789/chat
```

Chat proxied via `features/zolai/api/index.ts` → `POST /api/zolai/chat`

## Chat request shape

```ts
// POST /api/zolai/chat
{
  messages: { role: "user" | "assistant"; content: string }[];
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";  // CEFR
  mode?: "tutor" | "chat" | "translate";
  tutor?: boolean;
}
```

## AI providers (lib/ai/providers.ts)

```ts
import { generateChatCompletion, getModelInfo, getRecommendedFreeModels } from "@/lib/ai/providers";

// Generate a completion
const text = await generateChatCompletion({
  provider: "groq",  // groq | gemini | openai | openrouter | nvidia
  model: "llama-3.3-70b-versatile",
  messages,
  temperature: 0.7,
  maxTokens: 1000,
});

// Get model metadata
const info = getModelInfo("groq", "llama-3.3-70b-versatile");
// { maxTokens, free, recommended, tutoring }

// Get all recommended free models
const models = getRecommendedFreeModels();
```

## Tutor system prompt requirements

- Dialect: Tedim ZVS only (see tedim-dialect-rules skill)
- Socratic method — never give direct answers
- ≤ 4 lines per response
- CEFR adaptive: match `level` param
- Reference `lib/zolai/curriculum.ts` for level guidelines

## Training run tracking

```ts
// POST /api/zolai/training (admin only)
{ name: string, model?: string, notes?: string }

// PATCH /api/zolai/training/:id (webhook — x-webhook-key header or admin)
{ status?: "running" | "complete" | "failed", steps?: number, maxSteps?: number, lossJson?: string }
```
