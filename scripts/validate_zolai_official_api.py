#!/usr/bin/env python3
"""Validate Zolai translations using official Google Generative AI API."""

import json
from pathlib import Path
import google.generativeai as genai
import os
from dotenv import load_dotenv

# Load .env
load_dotenv(Path(__file__).parent.parent / ".env")

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

def validate_with_official_api():
    """Validate using official Google Generative AI API."""
    api_key = os.getenv("GEMINI_API_KEY")
    
    if not api_key:
        print("❌ GEMINI_API_KEY not found in .env")
        return
    
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    
    print("✅ Connected to Google Generative AI API\n")
    print("🔍 Validating translations...\n")
    
    results = {"translations": {}}
    
    for i, (story, translation) in enumerate(TRANSLATIONS.items()):
        try:
            prompt = f"{SYSTEM_PROMPT}\n\nValidate this Zolai translation:\n\n{translation}\n\nProvide brief feedback on grammar, vocabulary, and naturalness."
            
            response = model.generate_content(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.3,
                    top_p=0.8,
                    max_output_tokens=200
                )
            )
            
            results["translations"][story] = response.text
            print(f"✅ {story}")
            print(f"   {response.text[:100]}...\n")
        except Exception as e:
            print(f"❌ {story}: {str(e)}\n")
            results["translations"][story] = f"Error: {str(e)}"
    
    # Save results
    output_file = Path("/home/peter/Documents/Projects/zolai/GEMINI_OFFICIAL_API_RESULTS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Results saved to {output_file}")

if __name__ == "__main__":
    validate_with_official_api()
