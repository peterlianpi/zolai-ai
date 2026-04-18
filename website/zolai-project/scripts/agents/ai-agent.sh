#!/usr/bin/env bash
# scripts/agents/ai-agent.sh
# Tests all AI providers and reports which are working. Run daily.
set -euo pipefail

TG_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TG_CHAT="${TELEGRAM_CHAT_ID:-}"
SSH="ssh zolai"

notify() {
  [ -n "$TG_TOKEN" ] && curl -s -X POST "https://api.telegram.org/bot${TG_TOKEN}/sendMessage" \
    -d "chat_id=${TG_CHAT}&text=$1&parse_mode=HTML" > /dev/null || true
}

REPORT="🤖 <b>AI Provider Status</b>%0A"

test_provider() {
  local name="$1" url="$2" key="$3" model="$4"
  local result
  result=$(curl -s --max-time 15 "$url" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $key" \
    -d "{\"model\":\"$model\",\"messages\":[{\"role\":\"user\",\"content\":\"hi\"}],\"max_tokens\":5}" \
    2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print("ok" if d.get("choices") else d.get("error",{}).get("message","fail"))' 2>/dev/null || echo "timeout")
  if [ "$result" = "ok" ]; then
    echo "✅ $name"
    REPORT="${REPORT}✅ $name%0A"
  else
    echo "❌ $name: $result"
    REPORT="${REPORT}❌ $name: $result%0A"
  fi
}

# Load keys from server
eval "$($SSH "grep -E 'GEMINI_API_KEY=|GROQ_API_KEY=|OPENROUTER_API_KEY=' /home/ubuntu/zolai/.env.production | head -3" 2>/dev/null)"

test_provider "Gemini 2.5 Flash" \
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" \
  "${GEMINI_API_KEY:-}" "gemini-2.5-flash"

test_provider "Groq Llama 3.3" \
  "https://api.groq.com/openai/v1/chat/completions" \
  "${GROQ_API_KEY:-}" "llama-3.3-70b-versatile"

test_provider "OpenRouter Liquid LFM" \
  "https://openrouter.ai/api/v1/chat/completions" \
  "${OPENROUTER_API_KEY:-}" "liquid/lfm-2.5-1.2b-instruct:free"

# Pollinations (no key)
result=$(curl -s --max-time 15 "https://text.pollinations.ai/openai/chat/completions" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai","messages":[{"role":"user","content":"hi"}],"max_tokens":5}' \
  2>/dev/null | python3 -c 'import sys,json; d=json.load(sys.stdin); print("ok" if d.get("choices") else "fail")' 2>/dev/null || echo "timeout")
[ "$result" = "ok" ] && REPORT="${REPORT}✅ Pollinations%0A" || REPORT="${REPORT}❌ Pollinations%0A"

notify "$REPORT"
