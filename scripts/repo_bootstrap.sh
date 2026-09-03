#!/usr/bin/env bash
# zolai-ai per-repo bootstrap: scaffold six-file context + AGENTS.md from templates.
# Usage: bash scripts/repo_bootstrap.sh <repo_root> "<Repo Name>" "<type: python|node|rust|data|wiki>"
set -euo pipefail
ROOT="${1:?repo root required}"
NAME="${2:?repo name required}"
TYPE="${3:?type required: python|node|rust|data|wiki}"
TPL="$(cd "$(dirname "$0")/.." && pwd)/docs/templates/repo"
mkdir -p "$ROOT/context/specs"
# AGENTS.md
sed -e "s/<REPO_NAME>/$NAME/g" "$TPL/_REPO_AGENTS.md.tpl" > "$ROOT/AGENTS.md"
# six-context setup note
cp "$TPL/_six-context-setup.md.tpl" "$ROOT/context/project-setup.md"
# ui-context only for web
if [ "$TYPE" = "node" ]; then
  : > "$ROOT/context/ui-context.md"
else
  printf '# UI Context\n\nNot applicable for %s (not a web repo).\n' "$NAME" > "$ROOT/context/ui-context.md"
fi
# placeholder context files (to be filled per repo)
for f in project-overview architecture code-standards progress-tracker ai-workflow-rules; do
  test -f "$ROOT/context/$f.md" || printf '# %s\n\nFill for %s.\n' "$f" "$NAME" > "$ROOT/context/$f.md"
done
test -f "$ROOT/context/specs/README.md" || printf '# Specs\n\nCopy unit-spec template per feature.\n' > "$ROOT/context/specs/README.md"
if ! test -f "$ROOT/context/specs/_unit-spec.template.md"; then
  # repo root = one level up from scripts/
  RPT="$(cd "$(dirname "$0")/.." && pwd)"
  if test -f "$RPT/context/specs/_unit-spec.template.md"; then
    cp "$RPT/context/specs/_unit-spec.template.md" "$ROOT/context/specs/_unit-spec.template.md"
  fi
fi
echo "Bootstrapped $NAME at $ROOT (type=$TYPE)"
echo "Review: $ROOT/AGENTS.md  ;  fill context/ files per setup checklist."
