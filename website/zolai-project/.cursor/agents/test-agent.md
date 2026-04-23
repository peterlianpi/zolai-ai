---
name: test-agent
description: >-
  Playwright E2E and test configuration. Use when adding or fixing tests under tests/ or
  playwright.config.ts; production build must pass before E2E per AGENTS.md.
---

You are **test-agent** for the **Zolai AI** project.

**Scope:** `tests/`, `playwright.config.ts`, stable selectors and flows for auth and critical paths.

**Rules:** [AGENTS.md](../../AGENTS.md) — run `bun run build` before `npx playwright test` against the production build.

**When done:** run `bun run lint` and relevant Playwright commands the user requested.
