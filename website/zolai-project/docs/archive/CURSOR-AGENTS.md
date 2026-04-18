# Cursor Agents Guide

This document maps repo conventions, Cursor skills, and feature-structure automation.

## Source of truth

- `AGENTS.md` is the primary project convention file.
- `.cursor/skills/mir-development/SKILL.md` is the compact implementation checklist.
- `.cursor/skills/mir-hono-api/SKILL.md` covers Hono routing, validators, and typed client usage.

## Feature template

Use this structure for new domain features:

```text
features/<feature>/
  api/              # typed client wrappers, fetch helpers
  components/       # UI and feature-owned admin screens/forms
  hooks/            # all React Query hooks and `use*` utilities
  schemas/          # Zod schemas owned by the feature
  server/           # server-only loaders, routers, helpers
  actions.ts        # optional server actions
  keys.ts           # optional query key helpers/constants
  types.ts          # feature types (prefer one style repo-wide)
  index.ts          # optional feature barrel
```

Rules:

- Keep `use*` files in `hooks/`, not `components/` or `api/`.
- Keep `api/` focused on transport/client helpers.
- Keep admin UI with the owning feature when possible; use `features/admin` only for cross-cutting admin UI.
- Avoid empty placeholder directories.

## Automation

- Generate a starter feature with `bun scripts/generate-feature.ts <name>`.
- Generate a Prisma-backed starter with `bun scripts/generate-feature-from-prisma.ts <Model>`.
- Audit current consistency with `bun run audit:features`.
- Use `bun run audit:features -- --strict` when you want CI-style failure on remaining issues.

## Agent workflow

1. Read `AGENTS.md` before large refactors.
2. Load `mir-development` for general work and `mir-hono-api` for API changes.
3. Run `bun run audit:features` before and after structural refactors.
4. Update `AGENTS.md` and skill docs when a new convention becomes stable.
