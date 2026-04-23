# Gemini Web API Setup Guide

## Installation

### 1. Install gemini-webapi with browser support
```bash
pip install -U gemini-webapi[browser]
```

### 2. Authentication Methods

#### Option A: Browser Cookie Auto-Import (Recommended)
If `browser-cookie3` is installed, the library automatically imports cookies from your logged-in browser:

1. Log in to https://gemini.google.com in your default browser
2. Keep the browser open or just ensure you're logged in
3. Run your script - cookies will be auto-imported

#### Option B: Manual Cookie Export
1. Go to https://gemini.google.com
2. Open DevTools (F12)
3. Go to Application → Cookies
4. Find and copy `__Secure-1PSID` and `__Secure-1PSIDTS` values
5. Create `cookies.json` in project root:

```json
{
  "__Secure-1PSID": "your_psid_value_here",
  "__Secure-1PSIDTS": "your_psidts_value_here"
}
```

#### Option C: Environment Variables
```bash
export GEMINI_PSID="your_psid_value"
export GEMINI_PSIDTS="your_psidts_value"
```

## Usage Example

```python
import asyncio
from gemini_webapi import GeminiClient

async def main():
    # Initialize client (auto-loads cookies)
    client = GeminiClient()
    
    # Generate content
    response = await client.generate_content(
        "Validate this Zolai translation: AI thupite-te kithuah khawmna..."
    )
    
    print(response.text)
    
    # Close connection
    await client.close()

asyncio.run(main())
```

## Zolai Translation Validation Script

```python
#!/usr/bin/env python3
import asyncio
import json
from pathlib import Path
from gemini_webapi import GeminiClient

SYSTEM_PROMPT = """You are a Tedim Zolai (Chin) linguistics expert following ZVS 2018.
Validate Zolai translations for accuracy, grammar, and natural flow.
Provide feedback on word choice, grammar, and meaning."""

async def validate_translations():
    client = GeminiClient()
    
    translations = {
        "Story 1": "AI thupite-te kithuah khawmna, amau leh amau akichep kikinna (amah kia thupite a siamna), leh phawktheihna lam khantohna in AI pen amah kia sem thei panin system thupi-zaw, thupite haksate sem khawm thei dingin bawl ding hi.",
        "Story 2": "Google thupite-te ICLR 2026 ah TurboQuant thak khahkhia uhi. Hih thupite (a siamna) in KV cache (phawktheihna a kizat na) hanga phawktheihna tam lua pen thupitakin kiam sak hi.",
        "Story 3": "2026 spring sungin AI thupite-te 7 khahkhia uhi—OpenAI-te Spud pan kipan Huawei chip (thupite a siamna) tungah a kizat thei DeepSeek V4 dong kihel hi.",
        "Story 4": "GPT-5 khahkhiatna (A sepna let 10 in khangto), leh Meta Llama 4 in GPT-4 a tehpih zawhna pen thupite a siamna (a kizat na) in kisuah hi.",
        "Story 5": "Quantum (thupite a siamna) leh AI kop khawmna in thupite haksate leh thil kheng khengte khentatna (a om ding a siamna) nading thupitakin khantohna pia ding hi.",
    }
    
    results = {}
    
    for story, translation in translations.items():
        prompt = f"Is this Zolai translation accurate and natural? Provide feedback:\n\n{translation}"
        
        response = await client.generate_content(
            prompt,
            system_prompt=SYSTEM_PROMPT
        )
        
        results[story] = response.text
        print(f"✅ {story}: {response.text[:100]}...")
    
    # Save results
    output_file = Path("GEMINI_VALIDATION_RESULTS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Results saved to {output_file}")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(validate_translations())
```

## Troubleshooting

### "No cookies found" error
- Ensure you're logged into https://gemini.google.com
- Try closing and reopening your browser
- Manually export cookies to `cookies.json`

### "Connection timeout" error
- Check your internet connection
- Try increasing timeout: `client = GeminiClient(timeout=60)`
- Use a proxy if needed

### "Invalid cookie" error
- Cookies may have expired
- Re-export cookies from browser
- Log out and log back in to gemini.google.com

## References

- [gemini-webapi PyPI](https://pypi.org/project/gemini-webapi/)
- [gemini-webapi GitHub](https://github.com/HanaokaYuzu/Gemini-API)
- [Gemini Web Wrapper](https://github.com/eriksonssilva/gemini-web-wrapper)
