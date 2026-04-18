# Commit Reorganization Plan

## Branch Analysis & Recommendations

### 1. feature/mysql-support (55 commits - MAIN DEVELOPMENT)
**Current state:** Full history from Next.js init to MySQL support

**Recommended commits (16 logical groups):**

| # | New Commit Message | Original Commits |
|---|-------------------|------------------|
| 1 | `chore: initial Next.js project setup` | Initial commit from Create Next App → v1, v2, v3 |
| 2 | `feat: add core content models and database schema` | add new models for cms extensions → implement WordPress-style content ecosystem |
| 3 | `feat: add rich-text editor and content templates` | add rich-text editor and template selector |
| 4 | `feat: add admin dashboard and analytics` | add analytics dashboard, security enhancements → consolidate content management |
| 5 | `feat: add content and media management APIs` | add content & media APIs, terms manager |
| 6 | `feat: add comment system` | add comment feature with admin and public UI |
| 7 | `feat: add SEO optimization features` | JSON-LD, locale-based URLs, table of contents |
| 8 | `feat: add redirects management` | implement admin redirects management |
| 9 | `refactor: restructure codebase to feature-based architecture` | restructure to feature-based |
| 10 | `perf: optimize API endpoints and database queries` | optimize API, db queries, caching |
| 11 | `security: fix critical P0/P1 vulnerabilities` | Fix critical P0/P1 vulnerabilities |
| 12 | `feat: add authentication with multi-tenant support` | add multi-tenant organizations, 2FA, CAPTCHA, i18n |
| 13 | `feat: add admin pages (organization, security, profile, settings)` | add organization, security, profile, settings pages |
| 14 | `chore: update dependencies to latest versions` | update dependencies |
| 15 | `perf: optimize Prisma query payloads with select` | optimize query payloads with select |
| 16 | `feat: add MySQL database support` | add MySQL database support with Prisma adapter |

---

### 2. fix-error-issues (derived from feature/mysql-support)
**Current state:** Same as feature/mysql-support minus MySQL commit + DB URL changes

**Recommended:** Already clean, just needs minor fixes for commit #15

---

### 3. master (10 commits - STABLE RELEASE)
**Current state:** Security fixes + auth features

**Recommended commits (5 groups):**

| # | New Commit Message | Original Commits |
|---|-------------------|------------------|
| 1 | `feat: add comprehensive optimization` | optimize API endpoints, db queries |
| 2 | `security: fix critical vulnerabilities` | Fix critical P0/P1 vulnerabilities |
| 3 | `feat: add authentication with organizations and 2FA` | add multi-tenant organizations, 2FA, CAPTCHA |
| 4 | `feat: add admin pages and skill documentation` | add organization, security, profile, settings + neon-postgres skill |
| 5 | `fix: resolve navigation and proxy issues` | fix(proxy), fix(nav) |

---

### 4. resources-editor-dev (12 commits - CONTENT EDITOR)
**Current state:** Media handling, cursor skills, proxy refactor

**Recommended commits (6 groups):**

| # | New Commit Message | Original Commits |
|---|-------------------|------------------|
| 1 | `refactor: optimize Prisma client with connection pool` | use pool for prisma client |
| 2 | `chore: adjust pool config for Turbopack dev` | adjust pool config for Turbopack |
| 3 | `feat: add cursor agent skill definitions` | add cursor agent skill definitions |
| 4 | `refactor: streamline proxy and redirect handling` | refactor(proxy), implement redirects |
| 5 | `feat: add public site-settings and improve media handling` | expose public site-settings, improve media |
| 6 | `chore: merge fix-error-issues branch` | Merge branch |

---

### 5. seo-geo-optimize (same as resources-editor-dev)
**Recommendation:** Merge into resources-editor-dev or archive

---

## Implementation Notes

### DO:
- Use `git rebase -i` to squash/rewrite
- Keep merge commits for branch merges
- Use conventional commit format: `type(scope): description`

### DON'T:
- Rewrite commits that are already pushed to shared branches
- Change commit hashes that are referenced elsewhere
- Delete the original branch without backup

### Commands to use:
```bash
# Interactive rebase
git rebase -i HEAD~55

# Example for squashing:
pick e8b2083 Initial commit
squash 15c39b1 v1
squash 3391d40 v2
squash 7b55620 v3
pick cac4784 feat(api): implement comprehensive WordPress-style content ecosystem

# Force push (careful!)
git push --force-with-lease
```