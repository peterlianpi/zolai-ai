#!/usr/bin/env python3
"""Validate Zolai translations using gemini-webapi with proper error handling."""

import asyncio
import json
from pathlib import Path
import time

try:
    from gemini_webapi import GeminiClient, set_log_level
    set_log_level("ERROR")
except ImportError:
    print("❌ gemini-webapi not installed")
    exit(1)

SYSTEM_PROMPT = """You are a Tedim Zolai (Chin) linguistics expert following ZVS 2018.
Validate Zolai translations for grammar, vocabulary, and natural flow.
Provide concise feedback."""

TRANSLATIONS = {
    "Story 1: AI Breakthroughs": "AI thupite-te kithuah khawmna, amau leh amau akichep kikinna (amah kia thupite a siamna), leh phawktheihna lam khantohna in AI pen amah kia sem thei panin system thupi-zaw, thupite haksate sem khawm thei dingin bawl ding hi.",
    "Story 2: Google TurboQuant": "Google thupite-te ICLR 2026 ah TurboQuant thak khahkhia uhi. Hih thupite (a siamna) in KV cache (phawktheihna a kizat na) hanga phawktheihna tam lua pen thupitakin kiam sak hi.",
    "Story 3: Spring 2026 AI Launches": "2026 spring sungin AI thupite-te 7 khahkhia uhi—OpenAI-te Spud pan kipan Huawei chip (thupite a siamna) tungah a kizat thei DeepSeek V4 dong kihel hi.",
    "Story 4: GPT-5 & Llama 4": "GPT-5 khahkhiatna (A sepna let 10 in khangto), leh Meta Llama 4 in GPT-4 a tehpih zawhna pen thupite a siamna (a kizat na) in kisuah hi.",
    "Story 5: Quantum + AI": "Quantum (thupite a siamna) leh AI kop khawmna in thupite haksate leh thil kheng khengte khentatna (a om ding a siamna) nading thupitakin khantohna pia ding hi.",
}

async def validate_with_webapi():
    """Validate using gemini-webapi with proper initialization."""
    cookies_file = Path("/home/peter/Documents/Projects/zolai/cookies.json")
    
    if not cookies_file.exists():
        print("❌ cookies.json not found")
        return
    
    try:
        cookies = json.loads(cookies_file.read_text())
        psid = cookies.get("__Secure-1PSID")
        psidts = cookies.get("__Secure-1PSIDTS")
        
        if not psid or not psidts:
            print("❌ Missing required cookies in cookies.json")
            return
        
        print("🔍 Initializing Gemini Web API client...")
        client = GeminiClient(
            psid=psid,
            psidts=psidts,
            timeout=120,
            auto_close=False
        )
        
        # Initialize connection
        await client.init(timeout=30, auto_close=False, close_delay=300)
        print("✅ Connected to Gemini Web API\n")
        
    except Exception as e:
        print(f"❌ Connection failed: {e}")
        print("Cookies may be expired. Please export fresh cookies from https://gemini.google.com")
        return
    
    results = {"translations": {}, "timestamp": time.strftime("%Y-%m-%d %H:%M:%S")}
    
    print("🔍 Validating translations...\n")
    
    for i, (story, translation) in enumerate(TRANSLATIONS.items()):
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nValidate:\n{translation}"
            
            response = await client.generate_content(
                prompt,
                temperature=0.3,
                top_p=0.8
            )
            
            results["translations"][story] = response.text
            print(f"✅ {story}")
            print(f"   {response.text[:100]}...\n")
            
            # Delay between requests
            if i < len(TRANSLATIONS) - 1:
                await asyncio.sleep(3)
                
        except Exception as e:
            print(f"❌ {story}: {str(e)}\n")
            results["translations"][story] = f"Error: {str(e)}"
    
    # Save results
    output_file = Path("/home/peter/Documents/Projects/zolai/GEMINI_WEBAPI_RESULTS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Results saved to {output_file}")
    
    try:
        await client.close()
    except:
        pass

if __name__ == "__main__":
    asyncio.run(validate_with_webapi())
