# Copilot Setup for Zolai AI

This directory contains configuration and guidance for GitHub Copilot and compatible AI assistants (Cursor, GitHub Copilot CLI, etc.).

## Files in this directory

| File | Purpose |
|------|---------|
| **copilot-instructions.md** | Complete reference guide for working in this repository (282 lines) |
| **copilot-settings.json** | MCP server configuration (Playwright test automation) |
| **COPILOT_SETUP.md** | This file—quick overview |

## Quick Setup

### For GitHub Copilot (VS Code)
1. No additional setup needed—Copilot automatically discovers `.github/copilot-instructions.md`
2. Optional: Enable MCP servers in VS Code settings for test running

### For Cursor IDE
1. Cursor automatically loads project from `.cursor/skills/` directory
2. MCP configuration: Use settings in `copilot-settings.json` for Playwright integration
3. Reference: `.cursor/README.md` for Cursor-specific agent skills

### For GitHub Copilot CLI (command-line)
```bash
gh copilot explain "code snippet"
gh copilot suggest "describe what you need"
```

## What's Configured

✅ **Playwright MCP Server** — Copilot can execute and analyze tests  
✅ **Filesystem MCP Server** — File operations and search  
✅ **Prisma MCP Server** (optional) — Database introspection  
✅ **Full coding conventions** — Next.js 16, Prisma, Hono, Better Auth patterns  
✅ **Comprehensive command reference** — Build, test, lint, database, deployment  
✅ **Architecture overview** — File structure, stack, database strategy, i18n  
✅ **Error handling & security** — CSRF, rate limiting, audit logging, validation  
✅ **Feature examples** — 3 full walkthroughs: admin, public, API-only  
✅ **Deployment & CI/CD** — Vercel, self-hosted, Docker, GitHub Actions  
✅ **Testing strategy** — Playwright E2E modes, Vitest unit tests  

## Getting Started

1. **Read first:** `.github/copilot-instructions.md` (1000+ lines, comprehensive)
2. **Study examples:** 3 full feature walkthroughs included (admin, public, API-only)
3. **Implement:** Follow patterns in `features/` and `lib/` directories
4. **Validate:** Run `bun run lint && bun run build && npx playwright test`
5. **Deploy:** Use Vercel (recommended) or self-host with PM2/Docker

## Key Commands

```bash
# Development
bun run dev          # Start dev server
bun run build        # Production build
bun run lint         # ESLint + TypeScript check

# Testing
npx playwright test           # Run all E2E tests
bun run test:unit            # Run unit tests
npx playwright test --headed  # Debug mode

# Database
bunx prisma migrate dev --name <name>  # Create migration
bunx prisma db seed                    # Seed test data
```

## Feature Implementation Examples

**Copilot-instructions.md includes 3 complete, production-ready examples:**

1. **Admin Feature (Bulk Update Posts)** — Zod schema → Hono API → React client → E2E test
2. **Public Feature (Post Search)** — Search form → TanStack Query → Pagination
3. **API-Only Feature (Redirects Lookup)** — Simple API endpoint used by proxy.ts

Each example shows:
- Schema definition (Zod validation)
- Database queries (Prisma with select optimization)
- API implementation (Hono RPC)
- Client hooks (TanStack Query)
- UI components (React Server/Client Components)
- E2E tests (Playwright)

Use these as templates when building new features.

## For Copilot Issues

- **Commands not recognized?** Ensure Node.js and Bun are in PATH
- **Tests failing?** Run `bun run build` first, then `npx playwright test`
- **Build errors?** Clear cache: `rm -rf .next/ && bun install`
- **Prisma types stale?** Run `bunx prisma generate`

## Deployment Options

**Vercel (Recommended):**
- Auto-deploy on push to GitHub
- Preview deployments on PRs
- Built-in analytics & monitoring
- Zero-downtime deployments

**Self-Hosted (PM2 + Nginx):**
- Full control over environment
- Cost-effective for stable traffic
- Requires Linux VPS with Node.js/Bun
- See copilot-instructions.md for full setup

**Docker:**
- Multi-stage builds included in copilot-instructions.md
- Deploy to any container orchestration (Kubernetes, Docker Compose)
- Portable across environments

**GitHub Actions CI/CD:**
- Lint → Build → Unit Test → E2E Test → Deploy
- Auto-rollback on failure
- Full CI pipeline example in copilot-instructions.md

See **Deployment & CI/CD section** in copilot-instructions.md for detailed configs.

## References

- **AGENTS.md** — Complete coding standards (source of truth)
- **CLAUDE.md** — Architecture and agent roles
- **README.md** — Project purpose and setup
- **.cursor/README.md** — Cursor Agent Skills index
