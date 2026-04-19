# Skill: Git History Cleaner
# Triggers: "squash history", "remove secret from git", "clean git history", "purge credentials"
# Version: 1.0.0

## Purpose
Remove secrets from git history and squash all commits into a single clean commit.

## Prerequisites
- git-filter-repo: which git-filter-repo (at ~/.local/bin/git-filter-repo)
- Clean working tree: git stash if needed

## Remove specific files from ALL history
```bash
git stash  # save uncommitted changes
git filter-repo --force \
  --path "path/to/secret.json" --invert-paths \
  --path ".env.local" --invert-paths
# NOTE: filter-repo REMOVES the remote — must re-add:
git remote add origin https://github.com/peterlianpi/zolai-ai.git
git push --force origin master
git stash pop
```

## Squash ALL history into single clean commit
```bash
git stash
git checkout --orphan clean-branch
git add -A
git commit -m "init: Zolai AI Second Brain — clean initial commit"
git branch -D master
git branch -m master
# Re-add remote if missing:
git remote add origin https://github.com/peterlianpi/zolai-ai.git 2>/dev/null || true
git push --force origin master
git stash pop
```

## Verify clean
```bash
# Check no secrets remain in tracked files
git ls-files | xargs grep -rl \
  -E 'AIzaSy[A-Za-z0-9_-]{33}|sk-or-v1-[a-f0-9]{40,}|gsk_[A-Za-z0-9]{40,}|AKIA[A-Z0-9]{16}' \
  2>/dev/null && echo 'FOUND' || echo 'CLEAN'

# Check no local paths
git ls-files | xargs grep -rl '/home/peter' 2>/dev/null && echo 'FOUND' || echo 'CLEAN'
```

## Gotchas
- git filter-repo ALWAYS removes the remote — always re-add after
- Squash with --orphan loses ALL history permanently
- After force push, collaborators must re-clone
- Rotate ALL exposed credentials even after history purge
