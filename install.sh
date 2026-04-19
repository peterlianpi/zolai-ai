#!/usr/bin/env bash
# Zolai AI Second Brain — one-line installer
# Usage: curl -fsSL https://raw.githubusercontent.com/peterlianpi/zolai-ai/master/install.sh | bash

set -e

REPO="https://github.com/peterlianpi/zolai-ai.git"
INSTALL_DIR="$HOME/zolai"

echo "🧠 Installing Zolai AI Second Brain..."

# Clone
if [ -d "$INSTALL_DIR" ]; then
  echo "→ Updating existing install at $INSTALL_DIR"
  git -C "$INSTALL_DIR" pull
else
  git clone --depth 1 "$REPO" "$INSTALL_DIR"
fi

cd "$INSTALL_DIR"

# Python venv
python3 -m venv .venv
source .venv/bin/activate
pip install -q -e ".[dev]"

# Shell alias
SHELL_RC="$HOME/.bashrc"
[ -n "$ZSH_VERSION" ] && SHELL_RC="$HOME/.zshrc"

if ! grep -q "zolai-ai" "$SHELL_RC" 2>/dev/null; then
  echo "" >> "$SHELL_RC"
  echo "# Zolai AI" >> "$SHELL_RC"
  echo "export PATH=\"$INSTALL_DIR/.venv/bin:\$PATH\"" >> "$SHELL_RC"
fi

echo ""
echo "✅ Done! Run: source ~/.bashrc && zolai --help"
echo "   Or:       cd $INSTALL_DIR && source .venv/bin/activate"
