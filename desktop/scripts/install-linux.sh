#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

echo "== Install system deps for Tauri (Ubuntu/Debian) =="
sudo apt update
sudo apt install -y \
  build-essential pkg-config libssl-dev \
  libwebkit2gtk-4.1-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev \
  zstd

echo "== Install Rust (rustup) if missing =="
if ! command -v cargo >/dev/null 2>&1; then
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
  # shellcheck disable=SC1090
  source "$HOME/.cargo/env"
fi

echo "== Install Tauri CLI =="
if ! cargo tauri --version >/dev/null 2>&1; then
  cargo install tauri-cli --locked
fi

echo "== Install Bun if missing =="
if ! command -v bun >/dev/null 2>&1; then
  curl -fsSL https://bun.sh/install | bash
  export PATH="$HOME/.bun/bin:$PATH"
fi

echo "== Build sidecars =="
bash "$ROOT_DIR/desktop/scripts/build-sidecars.sh"

echo "== Build desktop app bundle =="
cd "$ROOT_DIR/desktop/src-tauri"
cargo tauri build

echo "Done. Build outputs are in desktop/src-tauri/target/release/bundle/"

