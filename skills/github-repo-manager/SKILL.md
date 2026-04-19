# Skill: GitHub Repo Manager
# Triggers: "update github", "add github topics", "create milestone", "add project item", "update repo description"
# Version: 1.0.0

## Purpose
Manage GitHub repo metadata, project board, milestones, labels, and CI for peterlianpi/zolai-ai.

## Prerequisites
- gh CLI authenticated: gh auth status
- Workflow scope: gh auth refresh --hostname github.com --scopes workflow
- Project scope: gh auth refresh --hostname github.com --scopes project,read:project

## Key Commands

### Repo metadata
```bash
gh repo edit peterlianpi/zolai-ai \
  --description "..." \
  --homepage "https://huggingface.co/peterpausianlian" \
  --add-topic zolai --add-topic tedim \
  --visibility public \
  --enable-discussions --enable-issues --enable-wiki
```

### Labels
```bash
gh label create "zvs-violation" --description "Tedim ZVS dialect violation" --color "e11d48" --repo peterlianpi/zolai-ai
```

### Milestones
```bash
gh api repos/peterlianpi/zolai-ai/milestones -X POST \
  -f title="Phase 2 — Open Source Release" \
  -f due_on="2026-05-31T00:00:00Z"
```

### Project board items (MUST use GraphQL — gh project item-add does NOT persist)
```bash
gh api graphql -f query='
mutation {
  addProjectV2DraftIssue(input: {
    projectId: "PVT_kwHOAi7Zqc4BVFgz"
    title: "Phase 2: Publish datasets to HuggingFace Hub"
  }) { projectItem { id } }
}'
```

### CI workflow
```bash
# Push CI file (needs workflow scope)
gh auth refresh --hostname github.com --scopes workflow
git add .github/workflows/ci.yml && git push origin master

# Check CI status
gh run list --repo peterlianpi/zolai-ai --limit 5 --json status,conclusion,name
```

## Gotchas
- `gh project item-add --title` does NOT persist items — always use GraphQL
- CI push needs `workflow` scope (separate from default scopes)
- Project creation needs `project,read:project` scope
- `--disable-wiki` flag does not exist — use `--enable-wiki` only
