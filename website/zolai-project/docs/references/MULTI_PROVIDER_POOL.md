# Multi-Provider AI Pool with Model Selector

Advanced AI infrastructure with automatic provider/model selection based on content context.

## Features

✅ **Multi-Provider Support**
- Gemini (3 keys, 15 RPM each)
- Groq (1 key, 30 RPM)
- OpenRouter (1 key, 20 RPM)
- **Total: ~65 RPM across all providers**

✅ **Automatic Key Rotation**
- Distributes load across all available keys
- Fallback to next key on rate limit
- Exponential backoff on errors

✅ **Context-Aware Model Selection**
- Ranks models by content type
- Optimizes for speed, accuracy, cost
- JSON support detection
- Complexity matching

✅ **Model Profiles**
Each model scored on:
- Speed (1-10)
- Accuracy (1-10)
- Cost (1-10)
- JSON support (1-10)

## Architecture

### Multi-Provider Pool
**File:** `lib/ai/multi-provider-pool.ts`

```typescript
const pool = getMultiProviderPool();

// Auto-selects best provider/model
const response = await pool.generate(prompt);

// Specific provider/model
const response = await pool.generate(prompt, {
  provider: 'gemini',
  model: 'gemini-1.5-flash',
});

// JSON generation
const data = await pool.generateJson(prompt);
```

### Model Selector
**File:** `lib/ai/model-selector.ts`

```typescript
const selector = new ModelSelector(pool);

// Rank models for context
const ranked = await selector.rankModels({
  type: 'curriculum',
  complexity: 'medium',
  requiresJson: true,
  requiresAccuracy: true,
  requiresSpeed: false,
  contentLength: 500,
});

// Get best model
const best = await selector.selectBest(context);

// Test top models
const results = await selector.testModels(prompt, context, 3);
```

## Content Types

- **curriculum** — Lesson generation (accuracy > speed)
- **phonics** — Sound exercises (accuracy > speed)
- **translation** — Language translation (accuracy >> speed)
- **grammar** — Grammar rules (accuracy > speed)
- **chat** — Conversational (speed > accuracy)
- **analysis** — Data analysis (accuracy > speed)

## Complexity Levels

- **simple** — Prefers fast models
- **medium** — Balanced
- **complex** — Prefers accurate models

## Configuration

### Environment Variables

```bash
# Gemini
GEMINI_API_KEY=...
GEMINI_API_KEY_2=...
GEMINI_API_KEY_3=...
GEMINI_MODELS=gemini-1.5-flash,gemini-2.0-flash

# Groq
GROQ_API_KEY=...
GROQ_MODELS=mixtral-8x7b-32768,llama-3-70b-8192

# OpenRouter
OPENROUTER_API_KEY=...
OPENROUTER_MODELS=openai/gpt-3.5-turbo,anthropic/claude-3-opus
```

## Model Profiles

### Gemini
- `gemini-1.5-flash` — Fast, accurate, good JSON (9/8/9/9)
- `gemini-2.0-flash` — Faster, accurate, good JSON (9/8/8/9)
- `gemini-1.5-pro` — Slower, very accurate, excellent JSON (7/9/6/9)

### Groq
- `mixtral-8x7b-32768` — Very fast, accurate (10/8/8/8)
- `llama-3-70b-8192` — Very fast, good accuracy (9/8/8/8)
- `llama-2-70b-chat` — Very fast, decent accuracy (9/7/8/7)

### OpenRouter
- `openai/gpt-3.5-turbo` — Fast, good accuracy (8/7/9/8)
- `openai/gpt-4` — Slower, very accurate (6/10/4/10)
- `anthropic/claude-3-opus` — Slower, very accurate (7/10/5/10)

## Usage Examples

### Curriculum Content Generation
```typescript
const selector = new ModelSelector(pool);
const best = await selector.selectBest({
  type: 'curriculum',
  complexity: 'medium',
  requiresJson: true,
  requiresAccuracy: true,
  requiresSpeed: false,
  contentLength: 500,
});

const response = await pool.generate(prompt, {
  provider: best.provider,
  model: best.model,
});
```

### Fast Chat Response
```typescript
const best = await selector.selectBest({
  type: 'chat',
  complexity: 'simple',
  requiresJson: false,
  requiresAccuracy: false,
  requiresSpeed: true,
  contentLength: 300,
});

const response = await pool.generate(prompt, {
  provider: best.provider,
  model: best.model,
});
```

### Accurate Translation
```typescript
const best = await selector.selectBest({
  type: 'translation',
  complexity: 'complex',
  requiresJson: false,
  requiresAccuracy: true,
  requiresSpeed: false,
  contentLength: 1000,
});

const response = await pool.generate(prompt, {
  provider: best.provider,
  model: best.model,
});
```

### Test Multiple Models
```typescript
const results = await selector.testModels(prompt, context, 3);
results.forEach(r => {
  console.log(`${r.model.provider}/${r.model.model}: ${r.duration}ms`);
  console.log(r.response);
});
```

## Rate Limiting

Global rate limit calculated as:
```
Total RPM = sum of (RPM per key × number of keys) for all providers
Global delay = 60000ms / Total RPM
```

Example with default config:
- Gemini: 3 keys × 15 RPM = 45 RPM
- Groq: 1 key × 30 RPM = 30 RPM
- OpenRouter: 1 key × 20 RPM = 20 RPM
- **Total: 95 RPM**
- **Delay: ~630ms between calls**

## Error Handling

### Rate Limited (429)
- Automatic retry with 2s backoff
- Rotates to next key
- Respects global rate limit

### Invalid Key (401)
- Throws error with provider name
- Suggests checking API keys

### Model Not Found (404)
- Throws error with model name
- Suggests checking model availability

### All Retries Exhausted
- Throws error after max attempts
- Includes provider name

## Testing

### Test Model Selector
```bash
bunx tsx scripts/test-model-selector.ts
```

Output:
```
📋 Context: curriculum (medium)
   Accuracy: ✓ | Speed: ✗ | JSON: ✓

=== Model Ranking ===
1. gemini/gemini-1.5-flash
   Score: 45.2 | Accurate JSON-capable Complex-ready
   Latency: 2ms | Cost: 1¢/MTok

2. groq/mixtral-8x7b-32768
   Score: 42.1 | Fast Accurate JSON-capable
   Latency: 1ms | Cost: 2¢/MTok

3. openrouter/openai/gpt-4
   Score: 38.5 | Accurate JSON-capable
   Latency: 4ms | Cost: 6¢/MTok

✅ Recommended: gemini/gemini-1.5-flash
```

## Files

- `lib/ai/multi-provider-pool.ts` — Multi-provider pool manager
- `lib/ai/model-selector.ts` — Context-aware model selector
- `scripts/test-model-selector.ts` — Benchmark script
- `scripts/seed-curriculum-content.ts` — Uses model selector

## Performance

| Metric | Value |
|--------|-------|
| Total Providers | 3 |
| Total Keys | 5 |
| Total Models | 10+ |
| Total RPM | ~95 |
| Global Delay | ~630ms |
| Retry Attempts | 3 |
| Backoff | Exponential |

## Future Enhancements

- [ ] Model performance caching
- [ ] Cost tracking per model
- [ ] A/B testing framework
- [ ] Custom model profiles
- [ ] Fallback chains
- [ ] Load balancing
- [ ] Metrics dashboard

---

**Status:** Production-ready
**Last Updated:** 2026-04-15
