# Per-Repo Six-File Context Setup

Copy this file body into each target repo and `context/project-setup.md` after
the monorepo split. Fill in order 1→7.

| Step | File | What to Write |
|------|------|---------------|
| 1 | `context/project-overview.md` | Repo product, goals, scope, success criteria |
| 2 | `context/architecture.md` | Repo stack, boundaries, storage, auth, invariants |
| 3 | `context/code-standards.md` | Language-specific conventions, lint, test, commit |
| 4 | `context/project-setup.md` | Bootstrap + lifecycle + this checklist |
| 5 | `context/ui-context.md` | Web only: theme, components, layout, routes |
| 6 | `context/ai-workflow-rules.md` | Agent behavior, scoping, verification |
| 7 | `context/progress-tracker.md` | Current phase, completed, next, open questions |

### Versioning

- Python repos: `pyproject.toml` `version` + `zolai/__init__.py __version__`.
- Node repos: `package.json` `version`.
- Rust/Tauri: `Cargo.toml` `version`.
- Datasets: timestamped manifest (not semver).
- Tag each release: `v<major>.<minor>.<patch>`.

### Orchestration Hooks

Add `.github` hooks (Cursor/OpenCode ambient) from the pcore-orchestra skill set;
wire `orchestra-loop` config per repo type. Reference the orchestration loop in
`AGENTS.md`.
