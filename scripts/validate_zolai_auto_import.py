#!/usr/bin/env python3
"""Validate Zolai translations using gemini-webapi with manual cookies."""

import asyncio
import json
from pathlib import Path

try:
    from gemini_webapi import GeminiClient, set_log_level
    set_log_level("ERROR")
except ImportError:
    print("❌ gemini-webapi not installed")
    exit(1)

SYSTEM_PROMPT = """You are a Tedim Zolai (Chin) linguistics expert following ZVS 2018.
Validate Zolai translations for grammar, vocabulary, and natural flow."""

TRANSLATIONS = {
    "Story 1: AI Breakthroughs": "AI thupite-te kithuah khawmna, amau leh amau akichep kikinna (amah kia thupite a siamna), leh phawktheihna lam khantohna in AI pen amah kia sem thei panin system thupi-zaw, thupite haksate sem khawm thei dingin bawl ding hi.",
    "Story 2: Google TurboQuant": "Google thupite-te ICLR 2026 ah TurboQuant thak khahkhia uhi. Hih thupite (a siamna) in KV cache (phawktheihna a kizat na) hanga phawktheihna tam lua pen thupitakin kiam sak hi.",
    "Story 3: Spring 2026 AI Launches": "2026 spring sungin AI thupite-te 7 khahkhia uhi—OpenAI-te Spud pan kipan Huawei chip (thupite a siamna) tungah a kizat thei DeepSeek V4 dong kihel hi.",
    "Story 4: GPT-5 & Llama 4": "GPT-5 khahkhiatna (A sepna let 10 in khangto), leh Meta Llama 4 in GPT-4 a tehpih zawhna pen thupite a siamna (a kizat na) in kisuah hi.",
    "Story 5: Quantum + AI": "Quantum (thupite a siamna) leh AI kop khawmna in thupite haksate leh thil kheng khengte khentatna (a om ding a siamna) nading thupitakin khantohna pia ding hi.",
}

async def validate_with_cookies():
    """Validate using cookies.json."""
    cookies_file = Path("/home/peter/Documents/Projects/zolai/cookies.json")
    
    if not cookies_file.exists():
        print("❌ cookies.json not found in project root")
        print("Please export fresh cookies from https://gemini.google.com")
        return
    
    try:
        cookies = json.loads(cookies_file.read_text())
        psid = cookies.get("__Secure-1PSID")
        psidts = cookies.get("__Secure-1PSIDTS")
        
        if not psid or not psidts:
            print("❌ Missing __Secure-1PSID or __Secure-1PSIDTS in cookies.json")
            return
        
        print("🔍 Connecting with cookies from cookies.json...")
        client = GeminiClient(psid, psidts)
        print("✅ Connected to Gemini Web API\n")
    except Exception as e:
        print(f"❌ Failed to connect: {e}")
        return
    
    results = {"translations": {}}
    
    print("🔍 Validating translations...\n")
    for i, (story, translation) in enumerate(TRANSLATIONS.items()):
        try:
            prompt = f"Validate this Zolai translation:\n\n{translation}\n\nProvide brief feedback."
            response = await client.generate_content(
                prompt,
                system_prompt=SYSTEM_PROMPT,
                temperature=0.3
            )
            results["translations"][story] = response.text
            print(f"✅ {story}")
            print(f"   {response.text[:100]}...\n")
            
            if i < len(TRANSLATIONS) - 1:
                await asyncio.sleep(2)
        except Exception as e:
            print(f"❌ {story}: {str(e)}\n")
            results["translations"][story] = f"Error: {str(e)}"
    
    # Save results
    output_file = Path("/home/peter/Documents/Projects/zolai/GEMINI_VALIDATION_RESULTS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Results saved to {output_file}")
    await client.close()

if __name__ == "__main__":
    asyncio.run(validate_with_cookies())
