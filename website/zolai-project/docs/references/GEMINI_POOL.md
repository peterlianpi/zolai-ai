# Gemini Pool — Multi-Model & Multi-Key Manager

Reusable pool manager for Gemini API with automatic key rotation, model selection, rate limiting, and retry logic.

## Features

- ✅ **Multi-key rotation** — Distribute load across multiple API keys
- ✅ **Multi-model support** — Rotate between different Gemini models
- ✅ **Automatic rate limiting** — Respects 15 RPM per key
- ✅ **Retry logic** — Automatic retry on rate limits
- ✅ **JSON parsing** — Built-in JSON generation & parsing
- ✅ **Singleton pattern** — Auto-initialized from environment
- ✅ **Stats tracking** — Monitor pool configuration

## Installation

Already included in the project at `lib/ai/gemini-pool.ts`.

## Quick Start

### 1. Auto-initialized from environment
```typescript
import { getGeminiPool } from '@/lib/ai/gemini-pool';

const pool = getGeminiPool();
const response = await pool.generate('What is 2+2?');
```

### 2. Custom initialization
```typescript
import { initGeminiPool } from '@/lib/ai/gemini-pool';

const pool = initGeminiPool({
  keys: [key1, key2, key3],
  models: ['gemini-1.5-flash', 'gemini-2.0-flash'],
  rpmPerKey: 15,
  retryAttempts: 3,
});
```

## Configuration

### Environment Variables
```bash
GEMINI_API_KEY=...           # Primary key
GEMINI_API_KEY_2=...         # Secondary key (optional)
GEMINI_API_KEY_3=...         # Tertiary key (optional)
GEMINI_MODELS=gemini-1.5-flash,gemini-2.0-flash  # Comma-separated models
```

### Pool Config
```typescript
interface GeminiPoolConfig {
  keys: string[];              // API keys
  models: string[];            // Model names
  rpmPerKey?: number;          // Requests per minute per key (default: 15)
  retryAttempts?: number;      // Retry attempts (default: 3)
}
```

## API

### `generate(prompt, options?)`
Generate text response.

```typescript
const response = await pool.generate('Hello');

// With options
const response = await pool.generate('Hello', {
  model: 'gemini-2.0-flash',
  key: process.env.GEMINI_API_KEY_2,
});
```

### `generateJson<T>(prompt, options?)`
Generate and parse JSON response.

```typescript
const data = await pool.generateJson<{ name: string }>('Return JSON: {"name": "Alice"}');
console.log(data.name); // "Alice"
```

### `getStats()`
Get pool statistics.

```typescript
const stats = pool.getStats();
// {
//   keys: 3,
//   models: 2,
//   rpmPerKey: 15,
//   totalRpm: 45,
//   rateLimitMs: 1333
// }
```

## Rate Limiting

The pool automatically calculates rate limits based on:
- **RPM per key:** 15 (default, configurable)
- **Number of keys:** Multiplies available quota
- **Delay:** `60000 / (rpmPerKey × numKeys)` milliseconds

Example with 3 keys:
- Total RPM: 45
- Delay: 1333ms between calls

## Key Rotation

Keys are rotated automatically on each call:
```
Call 1: Key 1
Call 2: Key 2
Call 3: Key 3
Call 4: Key 1 (cycles back)
```

## Model Rotation

Models are rotated automatically on each call:
```
Call 1: Model 1
Call 2: Model 2
Call 3: Model 1 (cycles back)
```

## Error Handling

### Rate Limited (429)
Automatically retries with exponential backoff.

### Invalid Key (401)
Throws error with key identifier.

### Model Not Found (404)
Throws error with model name.

### All Retries Exhausted
Throws error after `retryAttempts` attempts.

## Usage Examples

### Curriculum Content Generation
```typescript
import { getGeminiPool } from '@/lib/ai/gemini-pool';

const pool = getGeminiPool();
const exercises = await pool.generateJson(
  'Generate 3 Zolai vocabulary exercises...'
);
```

### Tutor Chat
```typescript
const pool = getGeminiPool();
const response = await pool.generate(
  'You are a Zolai tutor. Respond to: ' + userMessage
);
```

### Batch Processing
```typescript
const pool = getGeminiPool();
const results = await Promise.all(
  items.map(item => pool.generate(`Process: ${item}`))
);
```

## Performance

With 3 keys and 2 models:
- **Total RPM:** 45
- **Throughput:** ~0.75 requests/second
- **Latency:** ~1.3 seconds between calls (rate-limited)

## Files

- `lib/ai/gemini-pool.ts` — Pool implementation
- `lib/ai/gemini-pool.examples.ts` — Usage examples
- `scripts/seed-curriculum-content.ts` — Real-world usage

## Migration from Old Code

### Before
```typescript
const key = GEMINI_KEYS[keyIdx % GEMINI_KEYS.length];
const model = new GoogleGenerativeAI(key).getGenerativeModel({ model: 'gemini-1.5-flash' });
const result = await model.generateContent(prompt);
```

### After
```typescript
const pool = getGeminiPool();
const response = await pool.generate(prompt);
```

---

**Status:** Production-ready
**Last updated:** 2026-04-15
