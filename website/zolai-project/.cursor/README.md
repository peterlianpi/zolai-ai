# Cursor — project agent context

This folder holds **project-scoped** Agent Skills for Zolai AI. Cursor loads `SKILL.md` files under `.cursor/skills/<name>/` to specialize the AI for this repository.

## Skills index

| Skill | Purpose |
|-------|---------|
| [skills/cursor-workflows](skills/cursor-workflows/SKILL.md) | Generic Cursor workflows (settings, migrate-to-skills, best-of-n, read-branch, review, babysit, authoring skills). |
| [skills/mir-development](skills/mir-development/SKILL.md) | Stack and conventions: Next.js 16, `proxy.ts`, Prisma, Better Auth, `features/`, `lib/site.ts`, i18n, admin tables. |
| [skills/mir-hono-api](skills/mir-hono-api/SKILL.md) | Hono catch-all API: sub-routers, Zod, `AppType`, rate limit, RPC client. |
| [skills/mir-project](skills/mir-project/SKILL.md) | Roadmap, ETL/media/email workflows, pointers to `docs/PROJECT.md`. |

## Documentation

- **[docs/CURSOR-AGENTS.md](../docs/CURSOR-AGENTS.md)** — How skills relate to AGENTS.md, CLAUDE.md, and recommended agent workflow.
- **[AGENTS.md](../AGENTS.md)** — Full coding standards and commands (source of truth for conventions).

## Optional: rules and subagents

- **Rules** (file-scoped hints): add `.cursor/rules/*.mdc` if you want globs or always-on instructions; keep them short.
- **Subagents**: `.cursor/agents/*.md` — one file per role from [docs/PROJECT.md](../docs/PROJECT.md#51-agent-roles) (e.g. `api-agent`, `prisma-agent`); see [docs/CURSOR-AGENTS.md](../docs/CURSOR-AGENTS.md#subagents).

Do not commit secrets. User-specific Cursor settings live under `%APPDATA%\Cursor\User\` on Windows.
