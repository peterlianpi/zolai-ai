#!/usr/bin/env python3
"""
Zolai Gemini Tool: ZVS-compliant Tedim Zolai validator & dataset builder.

Priority:
  1. Official Google AI SDK (GEMINI_API_KEY/2/3) — fastest, structured JSON, auto key rotation
  2. gemini_webapi v2.0.0 cookie fallback (GEMINI_PSID + GEMINI_PSIDTS or cookies.json)
"""
import asyncio
import json
import os
import time
import argparse
from pathlib import Path
from typing import Any

try:
    from google import genai
    from google.genai import types as genai_types
except ImportError:
    genai = None

try:
    from gemini_webapi import GeminiClient, set_log_level
    set_log_level("WARNING")
except ImportError:
    GeminiClient = None

# Auto-load .env from project root
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent.parent / ".env")
except ImportError:
    pass

# ── ZVS 2018 system prompt ────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are a Tedim Zolai (Chin) linguistics expert following ZVS 2018.

STRICT RULES (never violate):
1. Vocabulary: pasian, gam, tapa, topa, kumpipa, tua — NEVER pathian/ram/fapa/bawipa/siangpahrang/cu/cun
2. Orthography: compounds joined — nasep, leitung, nading, hihleh, hihna
3. Plurality: never combine 'uh' with first-person inclusive 'i'
4. Negation: 'kei' for conditionals, 'lo' for simple negatives
5. Word order: SOV
6. Stem II for nominalization (mu → muhna)

Quality: 'high' = fully ZVS; 'medium' = minor issues; 'low' = non-Tedim words or severe errors.
"""

VERIFY_PROMPT = """You are a strict Tedim Zolai (Chin) linguistics expert enforcing ZVS 2018.

ZVS RULES:
1. VOCABULARY: pasian/gam/tapa/topa/kumpipa/tua are correct. FORBIDDEN: pathian/ram/fapa/bawipa/siangpahrang/cu/cun
2. ORTHOGRAPHY: compounds joined — nasep/leitung/nading/hihleh/hihna
3. PLURALITY: never 'uh' with first-person 'i'
4. NEGATION: 'kei' for conditionals, 'lo' for simple negatives
5. WORD ORDER: SOV strictly
6. SEMANTICS: sentence must make logical sense in context, not just use correct words

EXAMPLES OF ERRORS:
- "Pasian in gam a om hi" → WRONG: 'in' (topic/agent marker) misused; 'om' (exist) needs a location. Fix: "Pasian gam a om hi" (God's country exists)
- "I pai uh hi" → WRONG: 'uh' with 'i'. Fix: "I pai hi"
- "Pathian in ka it hi" → WRONG: 'Pathian' is Hakha dialect. Fix: "Pasian in ka it hi"

GRAMMAR NOTE — 'in' is the SUBJECT/ERGATIVE marker. 'hong' is directional particle (toward speaker = me/us):
- "Pasian in hong it hi" → "God loves me" (Pasian=SUBJ, hong=toward-me, it=love)
- "Pasian in kei hong it hi" → "God loves me" (kei=me, emphatic object)
- "Pasian ka it hi" → "I love God" (Pasian=OBJ, ka=I SUBJ)
- "Ka Pasian it hi" → "I love God" (explicit SOV)
- 'ka' = I/my (subject/possessive), NOT object pronoun for "me" in verb phrases

CORRECT EXAMPLES (do NOT flag these as errors):
- "Pasian in hong it hi" → CORRECT: "God loves me"
- "Pasian in kei hong it hi" → CORRECT: "God loves me" (emphatic)
- "Pasian ka it hi" → CORRECT: "I love God"
- "Pasian gam a om hi" → CORRECT: "God's country exists"
- "Ka pai kei hi" → CORRECT: "I will not go"

Analyze: {text}

Return ONLY JSON, no markdown:
{{"original":"{text}","corrected":"<fix or same>","is_zvs":<true/false>,"semantic_ok":<true/false>,"errors":["<specific issue>"],"quality":"<high|medium|low>","explanation":"<brief reason>"}}

quality: high=ZVS+semantic correct; medium=ZVS words but grammar/semantic issues; low=forbidden words or severe errors"""


def _load_cookies() -> dict[str, str] | None:
    psid = os.getenv("GEMINI_PSID")
    psidts = os.getenv("GEMINI_PSIDTS")
    if psid:
        return {"__Secure-1PSID": psid, "__Secure-1PSIDTS": psidts or ""}
    for path in [Path("cookies.json"), Path("config/env/cookies.json")]:
        if path.exists():
            data = json.loads(path.read_text())
            if isinstance(data, list):
                data = {c["name"]: c["value"] for c in data if "name" in c}
            if data.get("__Secure-1PSID"):
                return data
    return None


def _parse_json(raw: str) -> dict:
    raw = raw.strip()
    if "```json" in raw:
        raw = raw.split("```json")[1].split("```")[0].strip()
    elif "```" in raw:
        raw = raw.split("```")[1].split("```")[0].strip()
    return json.loads(raw)


class OfficialGeminiBackend:
    def __init__(self, api_keys: list[str], model: str):
        self.api_keys = api_keys
        self.model = model
        self._idx = 0

    def verify(self, text: str) -> dict:
        last_err = None
        for _ in range(len(self.api_keys)):
            try:
                client = genai.Client(api_key=self.api_keys[self._idx])
                resp = client.models.generate_content(
                    model=self.model,
                    contents=VERIFY_PROMPT.format(text=text),
                    config=genai_types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        response_mime_type="application/json",
                    ),
                )
                return _parse_json(resp.text)
            except Exception as e:
                last_err = e
                self._idx = (self._idx + 1) % len(self.api_keys)
        raise last_err


class WebGeminiBackend:
    def __init__(self, psid: str, psidts: str, loop: asyncio.AbstractEventLoop):
        self.psid = psid
        self.psidts = psidts
        self._loop = loop
        self._client: GeminiClient | None = None

    async def _get_client(self) -> GeminiClient:
        if self._client is None:
            self._client = GeminiClient(self.psid, self.psidts)
            await self._client.init(timeout=30, auto_close=True, close_delay=120, auto_refresh=True)
        return self._client

    async def verify(self, text: str) -> dict:
        client = await self._get_client()
        resp = await client.generate_content(VERIFY_PROMPT.format(text=text), temporary=True)
        return _parse_json(resp.text)

    async def close(self):
        if self._client:
            await self._client.close()
            self._client = None


class ZolaiGeminiTool:
    def __init__(self, api_key: str | None = None, model: str = "gemini-2.0-flash"):
        keys = []
        if api_key:
            keys.append(api_key)
        for var in ("GEMINI_API_KEY", "GEMINI_API_KEY_2", "GEMINI_API_KEY_3"):
            k = os.getenv(var)
            if k and k not in keys:
                keys.append(k)

        self._sdk: OfficialGeminiBackend | None = None
        self._web: WebGeminiBackend | None = None
        self._loop: asyncio.AbstractEventLoop | None = None

        if keys and genai:
            print(f"[zolai] Official SDK ({model}, {len(keys)} key(s)) — fallback only")
            self._sdk = OfficialGeminiBackend(keys, model)

        cookies = _load_cookies()
        if cookies and GeminiClient:
            self._loop = asyncio.new_event_loop()
            self._web = WebGeminiBackend(
                cookies["__Secure-1PSID"], cookies.get("__Secure-1PSIDTS", ""), self._loop
            )
            print("[zolai] Using gemini_webapi (primary)")

        if not self._sdk and not self._web:
            raise RuntimeError(
                "No auth found. Set GEMINI_API_KEY, or GEMINI_PSID+GEMINI_PSIDTS, "
                "or place cookies.json in project root."
            )

    def verify_sentence(self, text: str) -> dict[str, Any]:
        # Web primary
        if self._web:
            try:
                return self._loop.run_until_complete(self._web.verify(text))
            except Exception as e:
                if not self._sdk:
                    return {"error": str(e), "original": text}
                print(f"[zolai] Web failed, trying SDK...")
        # SDK fallback
        try:
            return self._sdk.verify(text)
        except Exception as e:
            return {"error": str(e), "original": text}

    def batch_audit(self, input_file: str, output_file: str, delay: float = 2.0):
        sentences = [l.strip() for l in Path(input_file).read_text(encoding="utf-8").splitlines() if l.strip()]
        print(f"[zolai] Auditing {len(sentences)} sentences → {output_file}")
        with open(output_file, "w", encoding="utf-8") as out:
            for i, text in enumerate(sentences, 1):
                print(f"  [{i}/{len(sentences)}] {text[:50]}...")
                out.write(json.dumps(self.verify_sentence(text), ensure_ascii=False) + "\n")
                if i < len(sentences):
                    time.sleep(delay)
        print(f"[zolai] Done → {output_file}")

    def close(self):
        if self._web and self._loop and not self._loop.is_closed():
            try:
                self._loop.run_until_complete(self._web.close())
            except Exception:
                pass
            self._loop.close()


def main():
    parser = argparse.ArgumentParser(description="Zolai Gemini Tool — ZVS validator")
    parser.add_argument("--verify", metavar="TEXT", help="Verify a single sentence")
    parser.add_argument("--batch", metavar="FILE", help="Input .txt/.jsonl for batch audit")
    parser.add_argument("--output", metavar="FILE", default="audit_results.jsonl")
    parser.add_argument("--key", metavar="KEY", help="Gemini API key (overrides env)")
    parser.add_argument("--model", default="gemini-2.0-flash")
    parser.add_argument("--delay", type=float, default=2.0, help="Seconds between batch requests")
    args = parser.parse_args()

    tool = ZolaiGeminiTool(api_key=args.key, model=args.model)
    try:
        if args.verify:
            print(json.dumps(tool.verify_sentence(args.verify), indent=2, ensure_ascii=False))
        elif args.batch:
            tool.batch_audit(args.batch, args.output, delay=args.delay)
        else:
            parser.print_help()
    finally:
        tool.close()


if __name__ == "__main__":
    main()
