# Gemini API Configuration

## Quick Start

1. **Detect available models and keys:**
   ```bash
   bunx tsx scripts/detect-gemini-config.ts
   ```

2. **Update `.env.gemini` with the detected model:**
   ```
   GEMINI_MODEL=gemini-1.5-flash
   ```

3. **Run curriculum content generation:**
   ```bash
   bunx tsx scripts/seed-curriculum-content.ts
   ```

## Configuration

### Environment Variables

- `GEMINI_API_KEY` — Primary API key
- `GEMINI_API_KEY_2` — Secondary API key (optional)
- `GEMINI_API_KEY_3` — Tertiary API key (optional)
- `GEMINI_MODEL` — Model name (default: `gemini-1.5-flash`)

### Rate Limiting

- **Per key:** 15 RPM (requests per minute)
- **Total:** 15 × number of keys
- **Delay:** Automatically calculated: `60000 / (15 × num_keys)` ms

Example with 3 keys:
- Total: 45 RPM
- Delay: 4000ms (4 seconds) between calls

### Key Rotation

The script automatically rotates through available keys to distribute load and avoid rate limits.

## Troubleshooting

### Model Not Found (404)

Run the detection script to find available models:
```bash
bunx tsx scripts/detect-gemini-config.ts
```

### Unauthorized (401)

Check that your API keys are valid:
- Verify keys in `.env`
- Ensure keys are from the same Google Cloud project (or different projects if using separate quotas)

### Rate Limited (429)

The script includes automatic retry logic with exponential backoff. If you still hit limits:
- Add more API keys
- Increase the delay in `RATE_LIMIT_MS`
- Reduce the number of sub-units being generated

## Files

- `.env.gemini` — Auto-detected model configuration
- `scripts/detect-gemini-config.ts` — Auto-detection utility
- `scripts/seed-curriculum-content.ts` — Main content generation script
