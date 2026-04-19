# Skill: Open Source Auditor
# Triggers: "audit for secrets", "check open source ready", "scan for credentials"
# Version: 1.0.0

## Purpose
Audit the codebase for secrets, hardcoded local paths, and open-source readiness before publishing.

## Prerequisites
- `git`, `ruff`, `git-filter-repo` installed

## Steps

1. Scan for secrets in tracked files
2. Check for hardcoded local paths
3. Verify `parents[]` depth in scripts
4. Check for tracked `.env` files
5. Check CI status
6. Purge sensitive history if needed

## Commands
```bash
# 1. Scan for secrets (tracked files only)
git ls-files | xargs grep -ln 'AIzaSy\|sk-or-v1\|gsk_\|nvapi-\|npg_\|GOCSPX-\|AKIA'

# 2. Check for hardcoded local paths
grep -rn '/home/peter\|/home/ubuntu/zolai' scripts/
# Expected: no output

# 3. Verify parents[] depth matches script location
# scripts/foo.py          → parents[1]
# scripts/sub/foo.py      → parents[2]
grep -rn 'parents\[' scripts/

# 4. Check for tracked .env files
git ls-files | grep '\.env'
# Expected: no output

# 5. Check CI status
gh run list --limit 1

# 6. Purge a file from git history (if secrets found)
git filter-repo --path PATH/TO/FILE --invert-paths --force
git remote add origin https://github.com/peterlianpi/zolai-ai.git
git push --force

# 7. Squash entire history to a clean init commit
git checkout --orphan clean
git add -A
git commit -m 'init: clean history'
git branch -D master
git branch -m master
git push --force
```

## Notes
- After `git filter-repo`, the remote is removed — re-add it before pushing
- Squash (step 7) is destructive and irreversible; confirm before running
- Run `ruff check .` to catch any linting issues before publishing
