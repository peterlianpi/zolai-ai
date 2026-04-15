# Skill: Git Workflow

## Purpose

Standard Git workflows for this project - branching, commits, merging, and collaboration.

## When to Use

Use this skill when user says:
- "git"
- "branch"
- "commit"
- "merge"
- "pull request"
- "push"

## Branch Naming

| Type | Example | When |
|------|--------|------|
| `develop` | develop | Main integration branch |
| `master` | master | Production releases |
| `feature/*` | feature/mysql-support | New features |
| `feat/*` | feat/authentication | Sub-features |
| `perf/*` | perf/database-optimization | Performance |
| `fix/*` | fix/login-validation | Bug fixes |

## Common Workflows

### Start New Feature
```bash
# Always from develop
git checkout develop
git pull
git checkout -b feature/my-new-feature

# Work, commit
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push -u origin feature/my-new-feature
```

### Keep Updated
```bash
# While on feature branch
git fetch origin
git merge origin/develop
```

### Merge Completed Work
```bash
git checkout develop
git merge feature/my-feature
git push

# Delete merged branch
git branch -d feature/my-feature
```

### Emergency Hotfix
```bash
git checkout master
git checkout -b hotfix/critical-fix

# Fix and test
git commit -m "hotfix: critical fix"

# Merge to both
git checkout master
git merge hotfix/critical-fix
git push

git checkout develop
git merge hotfix-critica-fix
git push
```

## Commit Messages

Conventional commits:
```
<type>(<scope>): <description>

Types: feat, fix, perf, chore, refactor, docs, style, test
```

### Examples
```bash
git commit -m "feat(auth): add 2FA support"
git commit -m "fix(api): resolve login validation"
git commit -m "perf(db): optimize query payloads"
git commit -m "docs: update README"
```

## Pull Requests

### Create PR
```bash
gh pr create --title "feat: add MySQL support" --body "$(cat <<'EOF'
## Summary
- Add MySQL database support
- Update Prisma config

## Testing
- [ ] Tested with PostgreSQL
- [ ] Tested with MySQL
EOF
)"
```

### Review PR
```bash
gh pr view 1 --web  # Open in browser
gh pr diff 1         # View changes
gh pr comment 1       # Add comment
```

## Operations

### Undo Last Commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Undo Commit (discard)
```bash
git reset --hard HEAD~1
```

### Stash Changes
```bash
git stash              # Save changes
git stash pop         # Restore
git stash list        # Show stashes
```

### View History
```bash
git log --oneline -10    # Recent commits
git log --graph          # Visual tree
```

### Diff
```bash
git diff                    # Unstaged
git diff --staged           # Staged
git diff main..feature      # Between branches
```

## Best Practices

1. **Short-lived branches** (< 2 days)
2. **Feature flags** over branches
3. **Merge frequently** to develop
4. **Use PRs** for code review
5. **Delete old branches** after merge
6. **Never force push** to shared branches

## Project Branches

```bash
develop                      # Integration
feature/mysql-support        # MySQL support
feat/authentication        # Auth features
feat/admin-ui            # Admin UI
feat/content-management   # Content CMS
feat/seo-optimization     # SEO
feat/testing           # Tests
perf/database-optimization  # DB optimization
```

## Common Errors

### Merge Conflicts
```bash
git status                    # See conflicts
# Edit files to resolve
git add .
git commit -m "Merge: resolve conflicts"
```

### Detached HEAD
```bash
git checkout -b new-branch   # Create branch from detached
```

### Restore Deleted File
```bash
git restore path/to/file.txt
```