# Branching Strategy & Workflow Guide

## Overview

This project uses a **Trunk-Based Development** approach with scoped feature branches. Short-lived branches merge to `develop`, then to `master` for release.

---

## Branch Types & Purpose

| Branch | Purpose | When to Use |
|--------|---------|-------------|
| `master` | Production-ready code | Only for releases |
| `develop` | Integration branch | Daily development |
| `feature/*` | New features | When adding new functionality |
| `feat/*` | Sub-features | Component-level features |
| `perf/*` | Performance | Optimization work |
| `fix/*` | Bug fixes | Non-critical bug fixes |
| `hotfix/*` | Urgent fixes | Critical production bugs |

---

## Branch Usage Guide

### 1. Master Branch (Production)
```
master ───────────────────────────────────────────────►
  │          ▲          ▲          ▲
  │          │          │          │
  └──────────┴──────────┴──────────┘
    releases    releases    releases
```

**When to use:**
- Only for tagged releases
- Never commit directly
- Always merge from `develop`

**How to use:**
```bash
# Create release
git checkout master
git merge develop
git tag v1.0.0
git push origin master --tags
```

---

### 2. Develop Branch (Integration)
```
develop ─────────────────────────────────────────────►
  │    ▲    ▲    ▲    ▲    ▲    ▲
  │    │    │    │    │    │    │
  └────┴────┴────┴────┴────┴────┘
   feature/* branches
```

**When to use:**
- Daily development
- Integrating multiple features
- Running CI/CD tests

**How to use:**
```bash
# Start new feature
git checkout develop
git pull
git checkout -b feature/my-new-feature

# Merge when done
git checkout develop
git merge feature/my-new-feature
git push
```

---

### 3. Feature Branches (Specific Features)

#### `feature/mysql-support`
- **Purpose:** Multi-database support (PostgreSQL + MySQL)
- **When:** Adding MySQL compatibility
- **Scope:** Database layer, Prisma config, connection pooling

```bash
git checkout develop
git checkout -b feature/mysql-support
# Work on MySQL support
# Test both PostgreSQL and MySQL
git checkout develop && git merge feature/mysql-support
```

#### `feat/authentication`
- **Purpose:** Auth features
- **When:** 2FA, organizations, sessions, password management
- **Scope:** Better Auth, login/signup forms, security

```bash
git checkout develop
git checkout -b feat/authentication
# Implement auth features
```

#### `feat/admin-ui`
- **Purpose:** Admin dashboard and pages
- **When:** Building admin interface
- **Scope:** Admin pages, settings forms, user management

#### `feat/content-management`
- **Purpose:** Content, media, menus, comments
- **When:** CMS functionality
- **Scope:** Posts, pages, media library, menus, comments

#### `feat/seo-optimization`
- **Purpose:** SEO improvements
- **When:** JSON-LD, sitemaps, metadata
- **Scope:** SEO features, performance

#### `feat/testing`
- **Purpose:** Testing infrastructure
- **When:** Adding tests
- **Scope:** Playwright, Vitest, test utilities

#### `perf/database-optimization`
- **Purpose:** Database performance
- **When:** Query optimization, indexing
- **Scope:** Prisma queries, migrations, connections

---

## Working with Branches

### Start New Work
```bash
# Always start from develop
git checkout develop
git pull

# Create feature branch
git checkout -b feature/description
# or
git checkout -b feat/description
```

### Keep Branch Updated
```bash
# While on feature branch
git fetch origin
git merge origin/develop
# Resolve conflicts if any
```

### Merge Completed Work
```bash
# After testing and lint passes
git checkout develop
git merge feature/my-feature
git push

# Delete merged branch (optional)
git branch -d feature/my-feature
```

### Push Branch to Remote
```bash
git push -u origin feature/my-feature
```

---

## When to Use Each Branch

### Daily Development
1. `git checkout develop`
2. `git pull`
3. `git checkout -b feature/your-task`
4. Make changes, commit
5. `git push -u origin feature/your-task`
6. Create PR → merge to `develop`

### Bug Fixes
- **Non-critical:** `fix/description` → `develop`
- **Critical:** `hotfix/description` → `master` + `develop`

### Performance Work
- `perf/database-optimization` → `develop`

### Experimental Features
- Try in feature branch first
- If successful, merge to `develop`
- If not, just close branch

---

## Branch Naming Convention

```
<type>/<scope>-<description>

Examples:
- feature/mysql-support
- feat/authentication
- feat/admin-ui
- perf/database-optimization
- fix/login-validation
- hotfix/security-patch
```

**Types:** feature, feat, perf, fix, hotfix, chore, refactor, docs

---

## Common Workflows

### Feature Development Flow
```
develop → feature/xyz → develop → master → release
```

### Bug Fix Flow
```
develop → fix/xyz → develop → master (if urgent)
```

### Release Flow
```
develop → master → tag → deploy
```

---

## Tips

1. **Short-lived branches** (< 2 days) - merge frequently
2. **Use feature flags** instead of branches when possible
3. **Always test** before merging to `develop`
4. **Delete old branches** after merge to keep clean
5. **Use PRs** for code review before merge

---

## Emergency Hotfix

For critical production bugs:

```bash
# Create hotfix from master
git checkout master
git checkout -b hotfix/critical-fix

# Fix and test
git commit -m "hotfix: critical fix"

# Merge to master AND develop
git checkout master
git merge hotfix/critical-fix
git push

git checkout develop
git merge hotfix/critical-fix
git push

# Delete hotfix branch
git branch -d hotfix/critical-fix
```