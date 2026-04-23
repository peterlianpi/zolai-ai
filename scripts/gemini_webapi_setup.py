#!/usr/bin/env python3
"""
Gemini Web API setup and test for Zolai project.
Uses browser-cookie3 to auto-import cookies from Chrome.

Usage:
    python scripts/gemini_webapi_setup.py
    python scripts/gemini_webapi_setup.py --zvs "Ka pathian in ram a piangsak hi."
"""
import asyncio
import argparse
from gemini_webapi import GeminiClient

async def test_basic(client: GeminiClient):
    response = await client.generate_content("Say 'Zolai AI ready' in one line.")
    print("Basic test:", response.text)

async def fix_zvs(client: GeminiClient, sentence: str):
    prompt = (
        "Fix this Zolai sentence to ZVS standard. "
        "Replace: pathian→Pasian, ram→gam, fapa→tapa, bawipa→topa, siangpahrang→kumpipa. "
        f"Reply with ONLY the corrected sentence.\n\n{sentence}"
    )
    response = await client.generate_content(prompt)
    print(f"Input:  {sentence}")
    print(f"Fixed:  {response.text.strip()}")

async def main(zvs_sentence: str | None = None):
    # Auto-import cookies from Chrome (browser-cookie3)
    client = GeminiClient()
    await client.init(timeout=30, auto_close=True, close_delay=60, auto_refresh=True)

    if zvs_sentence:
        await fix_zvs(client, zvs_sentence)
    else:
        await test_basic(client)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--zvs", type=str, help="Zolai sentence to fix to ZVS standard")
    args = parser.parse_args()
    asyncio.run(main(zvs_sentence=args.zvs))
