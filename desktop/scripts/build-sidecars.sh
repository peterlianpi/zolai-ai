#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
DESKTOP_DIR="$ROOT_DIR/desktop"
TAURI_DIR="$DESKTOP_DIR/src-tauri"
BIN_DIR="$TAURI_DIR/bin"

WEBSITE_DIR="$ROOT_DIR/website/zolai-project"

mkdir -p "$BIN_DIR"

download() {
  local url="$1"
  local out="$2"
  if command -v curl >/dev/null 2>&1; then
    curl -L --fail --retry 3 --retry-delay 2 "$url" -o "$out"
  elif command -v wget >/dev/null 2>&1; then
    wget -O "$out" "$url"
  else
    echo "Need curl or wget to download: $url" >&2
    exit 1
  fi
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    echo "node found: $(node --version)"
    return 0
  fi

  echo "node not found; downloading portable Node.js (linux-x64) into bin/..."
  local ver="${NODE_VERSION:-v22.17.1}"
  local tgz="node-${ver}-linux-x64.tar.xz"
  local url="https://nodejs.org/dist/${ver}/${tgz}"
  local tmp
  tmp="$(mktemp -d)"
  download "$url" "$tmp/$tgz"
  tar -C "$tmp" -xf "$tmp/$tgz"
  rm -rf "$BIN_DIR/node"
  mkdir -p "$BIN_DIR/node"
  cp -R "$tmp/node-${ver}-linux-x64/"* "$BIN_DIR/node/"
  rm -rf "$tmp"
  echo "Portable node installed at: $BIN_DIR/node/bin/node"
}

echo "== Build Next.js standalone (Pattern A sidecar) =="
(
  cd "$WEBSITE_DIR"
  export TAURI_BUILD=1
  bun install
  bun run build

  # Next.js standalone output: `.next/standalone` + `.next/static`
)

ensure_node

echo "== Package Next standalone into desktop/bin =="
rm -rf "$BIN_DIR/next-standalone"
mkdir -p "$BIN_DIR/next-standalone"
cp -R "$WEBSITE_DIR/.next/standalone/"* "$BIN_DIR/next-standalone/"
mkdir -p "$BIN_DIR/next-standalone/.next"
cp -R "$WEBSITE_DIR/.next/static" "$BIN_DIR/next-standalone/.next/static"

cat > "$BIN_DIR/next-server" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$ROOT/next-standalone"

NODE_BIN="${NODE_BIN:-}"
if [[ -z "$NODE_BIN" ]]; then
  if command -v node >/dev/null 2>&1; then
    NODE_BIN="$(command -v node)"
  elif [[ -x "$ROOT/node/bin/node" ]]; then
    NODE_BIN="$ROOT/node/bin/node"
  else
    echo "node not found. Install node or rerun build-sidecars.sh to download portable node." >&2
    exit 1
  fi
fi

export NODE_ENV=production
export PORT="${PORT:-3000}"
cd "$APP_DIR"
exec "$NODE_BIN" server.js
EOF
chmod +x "$BIN_DIR/next-server"

echo "== Build zolai-cli sidecar (PyInstaller) =="
cat > "$BIN_DIR/zolai-cli" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "zolai-cli placeholder (build-sidecars.sh ran)."
echo "TODO: build PyInstaller binary for zolai CLI and place here."
exit 0
EOF
chmod +x "$BIN_DIR/zolai-cli"

echo "== Prepare Ollama sidecar =="
if [[ "$(uname -s)" == "Linux" && "$(uname -m)" == "x86_64" ]]; then
  echo "Downloading Ollama (linux-amd64) into bin/ollama..."
  local_ver="${OLLAMA_VERSION:-v0.20.3}"
  pkg="ollama-linux-amd64.tar.zst"
  url="https://github.com/ollama/ollama/releases/download/${local_ver}/${pkg}"
  tmp="$(mktemp -d)"
  download "$url" "$tmp/$pkg"
  if ! command -v zstd >/dev/null 2>&1; then
    echo "Missing zstd. Install: sudo apt install zstd" >&2
    exit 1
  fi
  tar --use-compress-program=unzstd -C "$tmp" -xf "$tmp/$pkg"
  # The tar contains `ollama` binary at root
  cp "$tmp/ollama" "$BIN_DIR/ollama"
  chmod +x "$BIN_DIR/ollama"
  rm -rf "$tmp"
else
  cat > "$BIN_DIR/ollama" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail
echo "ollama sidecar not bundled for this OS/arch by build-sidecars.sh."
echo "Install ollama system-wide or provide desktop/src-tauri/bin/ollama manually."
exit 1
EOF
  chmod +x "$BIN_DIR/ollama"
fi

echo "Sidecar placeholders created in: $BIN_DIR"

