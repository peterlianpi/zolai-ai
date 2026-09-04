#!/usr/bin/env bash
set -euo pipefail

BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <merged_model_dir> <llama_cpp_dir> <out_prefix>"
  echo "Example:"
  echo "  $0 ./merged/zolai-qwen-0.5b-merged ../llama.cpp ./artifacts/gguf/zolai-qwen-0.5b"
  exit 2
fi

MERGED_DIR="$1"
LLAMA_CPP_DIR="$2"
OUT_PREFIX="$3"

mkdir -p "$(dirname "$OUT_PREFIX")"

echo "== Convert HF -> GGUF =="
python "$LLAMA_CPP_DIR/convert_hf_to_gguf.py" "$MERGED_DIR" --outtype f16 --outfile "${OUT_PREFIX}.f16.gguf"

echo "== Quantize GGUF (Q4_K_M) =="
"$LLAMA_CPP_DIR/llama-quantize" "${OUT_PREFIX}.f16.gguf" "${OUT_PREFIX}.Q4_K_M.gguf" Q4_K_M

echo "== Quantize GGUF (Q8_0) =="
"$LLAMA_CPP_DIR/llama-quantize" "${OUT_PREFIX}.f16.gguf" "${OUT_PREFIX}.Q8_0.gguf" Q8_0

echo "Wrote:"
ls -la "${OUT_PREFIX}".*.gguf

