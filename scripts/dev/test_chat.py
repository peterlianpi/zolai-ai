#!/usr/bin/env python3
"""Test script for Zolai chat functionality."""

import json
import sys
import urllib.request
import urllib.error

MODEL = "qwen3-coder:480b-cloud"
URL = "http://localhost:11434"

SYSTEM_PROMPT = """You are a Zolai/Tedim language assistant. Zolai (Tedim) is a Kuki-Chin language spoken in Chin State, Myanmar and parts of India.

Zolai Grammar:
- Ergative marker: "in" for transitive verb subjects (e.g., "Ken" = "Kei in")
- Word order: OSV (Object-Subject-Verb), e.g., "Laibu ka sim hi" (book I read)
- Verb stems: Stem I (affirmative) vs Stem II (negative)
- Tense markers: "hi" (present), "ta" (past), "ding" (future), "ngei" (perfect)

Common words:
- Hello: Kum
- Thank you: Ka tlung
- Yes: Aw
- No: Ai
- Good: Nung
- Bad: Koh"""

HISTORY_TEMPLATE = """system
{system}

{history}

user
{user}

assistant
"""

MAX_HISTORY = 10


def chat(prompt: str, history: str = "") -> str:
    """Send chat request to Ollama."""
    full_prompt = HISTORY_TEMPLATE.format(system=SYSTEM_PROMPT, history=history, user=prompt)

    payload = {"model": MODEL, "prompt": full_prompt, "stream": False}
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(f"{URL}/api/generate", data=data, headers={"Content-Type": "application/json"})

    with urllib.request.urlopen(req, timeout=30) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        return result.get("response", "").strip()


def test_chat():
    """Test the chat functionality with a simple greeting."""
    print("Testing Zolai chat...")

    # Test 1: Greeting
    response = chat("Hello")
    print(f"Q: Hello")
    print(f"A: {response}")

    # Check if response contains Zolai greeting
    if "kum" in response.lower() or "Kum" in response:
        print("✓ Correctly responded with Zolai greeting")
    else:
        print("✗ Did not respond with expected Zolai greeting")

    # Test 2: Thank you
    response = chat("Thank you")
    print(f"\nQ: Thank you")
    print(f"A: {response}")

    # Check if response contains Zolai thank you
    if "tlung" in response.lower() or "tlung" in response:
        print("✓ Correctly responded with Zolai thank you")
    else:
        print("✗ Did not respond with expected Zolai thank you")

    # Test 3: Grammar question
    response = chat("What is the word order in Zolai?")
    print(f"\nQ: What is the word order in Zolai?")
    print(f"A: {response}")

    # Check if response mentions OSV
    if "osv" in response.lower() or "object-subject-verb" in response.lower():
        print("✓ Correctly mentioned OSV word order")
    else:
        print("✗ Did not mention expected OSV word order")


if __name__ == "__main__":
    test_chat()
