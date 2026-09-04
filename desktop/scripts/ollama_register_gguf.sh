#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <gguf_path> <model_name>"
  echo "Example: $0 ./artifacts/gguf/zolai-qwen-0.5b.Q4_K_M.gguf zolai"
  exit 2
fi

GGUF_PATH="$1"
MODEL_NAME="$2"

if ! command -v ollama >/dev/null 2>&1; then
  echo "ollama not found on PATH."
  echo "If using the desktop bundle, run the sidecar binary at: desktop/src-tauri/bin/ollama"
  exit 1
fi

TMP_DIR="$(mktemp -d)"
trap 'rm -rf "$TMP_DIR"' EXIT

cat > "$TMP_DIR/Modelfile" <<EOF
FROM $GGUF_PATH
PARAMETER temperature 0.7
PARAMETER num_ctx 4096
SYSTEM You are Zolai AI. Respond in Tedim Zolai where possible. Enforce ZVS rules.
EOF

echo "Registering model: $MODEL_NAME"
ollama create "$MODEL_NAME" -f "$TMP_DIR/Modelfile"

echo "Done. Try:"
echo "  ollama run $MODEL_NAME"

