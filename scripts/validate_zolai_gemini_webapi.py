#!/usr/bin/env python3
"""Validate Zolai tech translations using gemini-webapi."""

import asyncio
import json
from pathlib import Path

try:
    from gemini_webapi import GeminiClient, set_log_level
    set_log_level("WARNING")
except ImportError:
    print("❌ gemini-webapi not installed")
    print("Install with: pip install -U gemini-webapi[browser]")
    exit(1)

SYSTEM_PROMPT = """You are a Tedim Zolai (Chin) linguistics expert following ZVS 2018.
Validate Zolai translations for:
1. Grammar correctness (SOV word order, proper verb forms)
2. Vocabulary accuracy (ZVS 2018 compliant words only)
3. Natural flow and readability
4. Proper use of loan words with explanations

Provide concise feedback on each translation."""

TRANSLATIONS = {
    "Story 1: AI Breakthroughs": "AI thupite-te kithuah khawmna, amau leh amau akichep kikinna (amah kia thupite a siamna), leh phawktheihna lam khantohna in AI pen amah kia sem thei panin system thupi-zaw, thupite haksate sem khawm thei dingin bawl ding hi.",
    "Story 2: Google TurboQuant": "Google thupite-te ICLR 2026 ah TurboQuant thak khahkhia uhi. Hih thupite (a siamna) in KV cache (phawktheihna a kizat na) hanga phawktheihna tam lua pen thupitakin kiam sak hi.",
    "Story 3: Spring 2026 AI Launches": "2026 spring sungin AI thupite-te 7 khahkhia uhi—OpenAI-te Spud pan kipan Huawei chip (thupite a siamna) tungah a kizat thei DeepSeek V4 dong kihel hi.",
    "Story 4: GPT-5 & Llama 4": "GPT-5 khahkhiatna (A sepna let 10 in khangto), leh Meta Llama 4 in GPT-4 a tehpih zawhna pen thupite a siamna (a kizat na) in kisuah hi.",
    "Story 5: Quantum + AI": "Quantum (thupite a siamna) leh AI kop khawmna in thupite haksate leh thil kheng khengte khentatna (a om ding a siamna) nading thupitakin khantohna pia ding hi.",
}

LOAN_WORDS = {
    "AI": "(thupite a siamna - machine intelligence)",
    "algorithm": "(a siamna - method for doing)",
    "memory": "(phawktheihna - remembering/storing)",
    "cache": "(phawktheihna a kizat na - stored remembering)",
    "chip": "(thupite a siamna - machine tool)",
    "quantum": "(thupite a siamna - advanced machine tool)",
    "open-source": "(a kizat na - publicly available)",
}

async def validate_with_gemini():
    """Validate translations using Gemini Web API."""
    try:
        # Initialize with proper headers to avoid unusual traffic detection
        client = GeminiClient(
            timeout=60,
            request_timeout=60,
            auto_close=False,
            close_delay=300
        )
        print("✅ Connected to Gemini Web API\n")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        print("Make sure cookies.json is in project root with valid cookies")
        return
    
    results = {
        "timestamp": str(Path.cwd()),
        "loan_words": {},
        "translations": {},
    }
    
    # Validate loan words
    print("🔍 Validating loan words...\n")
    for i, (word, explanation) in enumerate(LOAN_WORDS.items()):
        try:
            prompt = f"Is this Zolai explanation for '{word}' accurate? {explanation}\nProvide brief feedback."
            response = await client.generate_content(
                prompt, 
                system_prompt=SYSTEM_PROMPT,
                temperature=0.3,
                top_p=0.8
            )
            results["loan_words"][word] = response.text
            print(f"✅ {word}: {response.text[:80]}...")
            # Add delay between requests
            if i < len(LOAN_WORDS) - 1:
                await asyncio.sleep(2)
        except Exception as e:
            print(f"❌ {word}: {str(e)}")
            results["loan_words"][word] = f"Error: {str(e)}"
    
    # Validate translations
    print("\n🔍 Validating translations...\n")
    for i, (story, translation) in enumerate(TRANSLATIONS.items()):
        try:
            prompt = f"Validate this Zolai translation:\n\n{translation}\n\nProvide feedback on grammar, vocabulary, and naturalness."
            response = await client.generate_content(
                prompt,
                system_prompt=SYSTEM_PROMPT,
                temperature=0.3,
                top_p=0.8
            )
            results["translations"][story] = response.text
            print(f"✅ {story}: {response.text[:80]}...")
            # Add delay between requests
            if i < len(TRANSLATIONS) - 1:
                await asyncio.sleep(2)
        except Exception as e:
            print(f"❌ {story}: {str(e)}")
            results["translations"][story] = f"Error: {str(e)}"
    
    # Save results
    output_file = Path("/home/peter/Documents/Projects/zolai/GEMINI_WEBAPI_VALIDATION_RESULTS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Results saved to {output_file}")
    
    await client.close()

if __name__ == "__main__":
    asyncio.run(validate_with_gemini())
