#!/usr/bin/env bash
# init-context.sh — Scaffold six-file context + AGENTS.md from templates.
# Usage: bash scripts/init-context.sh <repo_root> "<Repo Name>" "<type>"
# Adapted from scripts/repo_bootstrap.sh for zolai-ai.
set -euo pipefail

ROOT="${1:?repo root required}"
NAME="${2:?repo name required}"
TYPE="${3:-python}"

TPL_DIR="$ROOT/docs/templates/repo"
if [ ! -d "$TPL_DIR" ]; then
  TPL_DIR="$ROOT/scripts/templates/repo"
fi

mkdir -p "$ROOT/context/specs"

# AGENTS.md
if [ -f "$TPL_DIR/_REPO_AGENTS.md.tpl" ]; then
  sed -e "s/<REPO_NAME>/$NAME/g" "$TPL_DIR/_REPO_AGENTS.md.tpl" > "$ROOT/AGENTS.md"
fi

# six-context setup
if [ -f "$TPL_DIR/_six-context-setup.md.tpl" ]; then
  cp "$TPL_DIR/_six-context-setup.md.tpl" "$ROOT/context/project-setup.md"
fi

# ui-context only for web
if [ "$TYPE" = "node" ]; then
  : > "$ROOT/context/ui-context.md"
else
  printf '# UI Context\n\nNot applicable for %s (not a web repo).\n' "$NAME" > "$ROOT/context/ui-context.md"
fi

# placeholder context files (to be filled per repo)
for f in project-overview architecture code-standards progress-tracker ai-workflow-rules; do
  if [ ! -f "$ROOT/context/$f.md" ]; then
    printf '# %s\n\nFill for %s.\n' "$f" "$NAME" > "$ROOT/context/$f.md"
  fi
done

# specs README
if [ ! -f "$ROOT/context/specs/README.md" ]; then
  printf '# Specs\n\nCopy unit-spec template per feature.\n' > "$ROOT/context/specs/README.md"
fi
if [ ! -f "$ROOT/context/specs/_unit-spec.template.md" ]; then
  if [ -f "$ROOT/context/specs/_unit-spec.template.md" ]; then
    : # already exists
  fi
fi

# Add P-Core seven-file reference to AGENTS.md if it exists
if [ -f "$ROOT/AGENTS.md" ]; then
  if ! grep -q "seven-file" "$ROOT/AGENTS.md" 2>/dev/null; then
    cat >> "$ROOT/AGENTS.md" << 'EOF'

## Seven-File Context (P-Core)

| File | Purpose |
|------|---------|
| `context/project-overview.md` | Product, goals, scope, success criteria |
| `context/architecture.md` | Stack, boundaries, storage, auth, invariants |
| `context/code-standards.md` | Python/TS conventions, lint, commit style |
| `context/project-setup.md` | Bootstrap + lifecycle |
| `context/ui-context.md` | Web theme/components/routes |
| `context/progress-tracker.md` | Current phase, decisions, open questions |
| `context/ai-workflow-rules.md` | Agent behavior + scoping (orchestration) |

Read all seven files at session start — they are ground truth.
EOF
  fi
fi

echo "Bootstrapped $NAME at $ROOT (type=$TYPE)"
echo "Review: $ROOT/AGENTS.md  ;  fill context/ files per setup checklist."
