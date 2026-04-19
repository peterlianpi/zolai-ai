#!/usr/bin/env python3
"""Chat with Ollama model - Zo_Tdm language assistant."""

from __future__ import annotations

import json
import urllib.error
import urllib.request

MODEL = "qwen3-coder:480b-cloud"
URL = "http://localhost:11434"

SYSTEM_PROMPT = """You are a Zo_Tdm/Tedim language assistant. Zo_Tdm (Tedim) is a Kuki-Chin language spoken in Chin State, Myanmar and parts of India.

Zo_Tdm Grammar:
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

    with urllib.request.urlopen(req, timeout=120) as resp:
        result = json.loads(resp.read().decode("utf-8"))
        return result.get("response", "").strip()


def main() -> int:
    print("🤖 Zo_Tdm Chat Assistant")
    print(f"Model: {MODEL}")
    print("Type '/help' for commands, '/clear' to clear history, Ctrl+C to exit\n")

    history = []

    while True:
        try:
            user_input = input("You: ").strip()
        except EOFError:
            print("\nBye!")
            break

        if not user_input:
            continue

        if user_input.lower() == "/bye" or user_input.lower() == "/quit":
            print("Bye!")
            break

        if user_input.lower() == "/help":
            print("Commands: /help, /clear, /bye, /quit")
            print("Context: Zo_Tdm/Tedim language assistant")
            continue

        if user_input.lower() == "/clear":
            history = []
            print("History cleared.")
            continue

        if user_input.lower() == "/models":
            req = urllib.request.Request(f"{URL}/api/tags")
            with urllib.request.urlopen(req) as resp:
                models = json.loads(resp.read().decode("utf-8"))
                print("Available models:")
                for m in models.get("models", []):
                    print(f"  - {m['name']}")
            continue

        print("Assistant: ", end="", flush=True)
        try:
            response = chat(user_input, "\n".join(history[-MAX_HISTORY:]))
            print(response)
            history.append(f"user: {user_input}")
            history.append(f"assistant: {response}")
        except Exception as e:
            print(f"Error: {e}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
