#!/usr/bin/env bash
set -euo pipefail

GEMINI_SERVER_URL="${GEMINI_SERVER_URL:-http://localhost:8000}"
ZOLAI_TOOLKIT_URL="${ZOLAI_TOOLKIT_URL:-http://localhost:8200}"

if [[ -z "${GEMINI_SERVER_API_KEY:-}" ]]; then
  echo "Missing GEMINI_SERVER_API_KEY (create one in gemini-server Settings → API Keys)." >&2
  exit 1
fi

echo "== Check gemini-server public health =="
curl -fsS "${GEMINI_SERVER_URL}/health/public" | head -c 200
echo

echo "== Check Zolai Toolkit health =="
curl -fsS "${ZOLAI_TOOLKIT_URL}/health" | head -c 200
echo

echo "== Test: Zolai Toolkit -> gemini-server (non-stream) =="
curl -fsS "${ZOLAI_TOOLKIT_URL}/chat/chat" \
  -H "Content-Type: application/json" \
  -d "$(cat <<'EOF'
{
  "messages": [{"role":"user","content":"Kum. Give one OSV example sentence in Tedim."}],
  "model": "gemini-3-flash",
  "temperature": 0.2
}
EOF
)" | head -c 400
echo

echo "Done."

