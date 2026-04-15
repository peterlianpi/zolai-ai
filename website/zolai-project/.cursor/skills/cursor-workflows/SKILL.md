---
name: cursor-workflows
description: >-
  Orchestrates common Cursor agent workflows: user settings edits, rules/subagents/skills,
  PR babysitting, parallel model runs in git worktrees, branch-context diffs, and focused
  code review. Use when the user invokes slash-style intents (e.g. best-of-n, read-branch,
  review, babysit) or asks to migrate rules/commands to skills.
---

# Cursor workflow orchestration

Use this skill as the **single playbook** when the user’s request matches any workflow below. Prefer the dedicated built-in skills (`update-cursor-settings`, `migrate-to-skills`, `create-subagent`, `create-rule`, `create-skill`, `babysit`) when they are attached or available; this file ties them together and fills gaps.

## User settings (`update-cursor-settings`)

- **Windows path**: `%APPDATA%\Cursor\User\settings.json` (expand to full path before editing).
- Read first; change only requested keys; preserve everything else; valid JSON (comments allowed).
- Mention reload if needed. Workspace overrides live in `.vscode/settings.json`.

## Migrate rules/commands → skills (`migrate-to-skills`)

- **Rules**: Only “applied intelligently” — has `description`, **no** `globs`, **no** `alwaysApply: true`. Convert `.mdc` → `.cursor/skills/<name>/SKILL.md` with new frontmatter; **body must be copied verbatim** (no rewrites).
- **Commands**: Migrate all `.md` under `.cursor/commands/` (and user `~/.cursor/commands/` when in scope). Add `disable-model-invocation: true` for former slash commands.
- Ignore `~/.cursor/worktrees` and `~/.cursor/skills-cursor`.
- Heavy migrations: use parallel subagents per category if appropriate; do not use the parent checkout for competing best-of-n-style runs.

## Create subagent (`create-subagent`)

- **Project**: `.cursor/agents/<name>.md` — **User**: `~/.cursor/agents/<name>.md`.
- Frontmatter: `name` (lowercase-hyphens), `description` (specific, when to delegate).
- Body = system prompt with clear steps and output shape.

## Create rule (`create-rule`)

- Path: `.cursor/rules/<name>.mdc` with YAML frontmatter: `description`, optional `globs`, `alwaysApply`.
- If scope is unclear, ask: always apply vs which glob patterns.

## Babysit PR (`babysit`)

- Triaging: address comments you agree with; explain disagreements.
- Conflicts: sync with base; resolve only when intent is obvious.
- CI: small scoped fixes; re-check until mergeable and green.

## Best-of-n (`best-of-n`)

- **Coordinator only** in the primary worktree: do **not** read/edit/shell/git the main checkout for the task once runners exist.
- Parse `model_csv` and task prompt; one `best-of-n-runner` (or equivalent) per model, **in parallel**.
- Each runner: dedicated git worktree first (`/worktree` or project’s worktree flow); all repo work stays there.
- **Never** merge, apply, or copy the winning patch back to main as part of this command—compare and recommend, then stop.

## Review (`review`)

- Mindset: bugs, regressions, security, missing tests first; order by severity.
- **Do not change code** unless the user explicitly asks for fixes.

## Read branch (`read-branch`)

- Determine default branch (e.g. `git symbolic-ref refs/remotes/origin/HEAD` or repo convention).
- Merge base: `git merge-base <default> HEAD`.
- Context diff: `git -c diff.autoRefreshIndex=false diff --no-color --ignore-space-change <merge-base> HEAD`
- Use that diff as primary context for answers or edits.

## Create / author skills (`create-skill`)

- Location: `.cursor/skills/<skill-name>/SKILL.md` (project) or `~/.cursor/skills/` (personal). Never use `~/.cursor/skills-cursor/`.
- Frontmatter: `name` (≤64 chars, lowercase-hyphens), `description` (third person, WHAT + WHEN, trigger terms).
- Keep `SKILL.md` under 500 lines; optional `reference.md` / `examples.md` one level deep.

## Quick routing

| User intent | Primary action |
|-------------|----------------|
| Change font, theme, format on save, etc. | Edit user `settings.json` per rules above |
| Move .mdc rules / slash commands to skills | `migrate-to-skills` rules |
| New specialized agent | `create-subagent` |
| New always-on or globbed rule | `create-rule` |
| PR merge-ready | `babysit` |
| Same task, N models, isolated | `best-of-n` |
| Audit changed code | `review` |
| “What’s on this branch?” | `read-branch` |
| New SKILL.md from scratch | `create-skill` checklist |
| Code in **Zolai AI** repo | **general-development** + **hono-api** + **zolai-project**; [AGENTS.md](../../../AGENTS.md), [docs/PROJECT.md](../../../docs/PROJECT.md), [docs/CURSOR-AGENTS.md](../../../docs/CURSOR-AGENTS.md) |

## Project skills (this repository)

- **general-development** — Next.js 16, `proxy.ts`, Prisma, Better Auth, `features/`, `lib/site.ts`, validation workflow.
- **hono-api** — Hono catch-all, sub-routers, Zod, `AppType`, RPC client.
- **zolai-project** — Phased roadmap, MySQL→Postgres ETL scripts, media/email pipelines; index of `docs/PROJECT.md`.

Index: [.cursor/README.md](../../README.md).
