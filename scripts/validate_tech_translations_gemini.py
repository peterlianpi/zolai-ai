#!/usr/bin/env python3
"""Validate tech news translations using Gemini Web API for accurate Zolai meanings."""

import asyncio
import json
from pathlib import Path

try:
    from gemini_webapi import GeminiClient
except ImportError:
    print("Installing gemini_webapi...")
    import subprocess
    subprocess.run(["pip", "install", "gemini_webapi"], check=True)
    from gemini_webapi import GeminiClient

SYSTEM_PROMPT = """You are a Tedim Zolai (Chin) linguistics expert. 
Provide accurate Zolai meanings and translations for technical terms.
Use only pure Zolai words or loan words with clear explanations.
Follow ZVS 2018 standard."""

LOAN_WORDS = {
    "AI": "What is the most accurate Zolai explanation for 'AI' (Artificial Intelligence)?",
    "algorithm": "What is the most accurate Zolai explanation for 'algorithm'?",
    "memory": "What is the most accurate Zolai explanation for 'memory' in computing?",
    "cache": "What is the most accurate Zolai explanation for 'cache'?",
    "chip": "What is the most accurate Zolai explanation for 'chip' (computer chip)?",
    "quantum": "What is the most accurate Zolai explanation for 'quantum computing'?",
    "open-source": "What is the most accurate Zolai explanation for 'open-source'?",
}

TRANSLATIONS = {
    "Story 1": "AI thupite-te kithuah khawmna, amau leh amau akichep kikinna (amah kia thupite a siamna), leh phawktheihna lam khantohna in AI pen amah kia sem thei panin system thupi-zaw, thupite haksate sem khawm thei dingin bawl ding hi.",
    "Story 2": "Google thupite-te ICLR 2026 ah TurboQuant thak khahkhia uhi. Hih thupite (a siamna) in KV cache (phawktheihna a kizat na) hanga phawktheihna tam lua pen thupitakin kiam sak hi.",
    "Story 3": "2026 spring sungin AI thupite-te 7 khahkhia uhi—OpenAI-te Spud pan kipan Huawei chip (thupite a siamna) tungah a kizat thei DeepSeek V4 dong kihel hi.",
    "Story 4": "GPT-5 khahkhiatna (A sepna let 10 in khangto), leh Meta Llama 4 in GPT-4 a tehpih zawhna pen thupite a siamna (a kizat na) in kisuah hi.",
    "Story 5": "Quantum (thupite a siamna) leh AI kop khawmna in thupite haksate leh thil kheng khengte khentatna (a om ding a siamna) nading thupitakin khantohna pia ding hi.",
}

async def validate_with_gemini():
    """Validate translations using Gemini Web API."""
    client = GeminiClient()
    
    results = {
        "loan_words": {},
        "translations": {},
        "timestamp": str(Path.cwd())
    }
    
    print("🔍 Validating loan words with Gemini...\n")
    
    for word, question in LOAN_WORDS.items():
        try:
            response = await client.generate_content(
                prompt=question,
                system_prompt=SYSTEM_PROMPT
            )
            results["loan_words"][word] = response
            print(f"✅ {word}: {response[:100]}...")
        except Exception as e:
            print(f"❌ {word}: {str(e)}")
            results["loan_words"][word] = f"Error: {str(e)}"
    
    print("\n🔍 Validating translations with Gemini...\n")
    
    for story, translation in TRANSLATIONS.items():
        try:
            question = f"Is this Zolai translation accurate and natural? '{translation}' Provide feedback on grammar, word choice, and meaning."
            response = await client.generate_content(
                prompt=question,
                system_prompt=SYSTEM_PROMPT
            )
            results["translations"][story] = response
            print(f"✅ {story}: {response[:100]}...")
        except Exception as e:
            print(f"❌ {story}: {str(e)}")
            results["translations"][story] = f"Error: {str(e)}"
    
    # Save results
    output_file = Path("/home/peter/Documents/Projects/zolai/GEMINI_VALIDATION_RESULTS.json")
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Results saved to {output_file}")
    return results

if __name__ == "__main__":
    asyncio.run(validate_with_gemini())
