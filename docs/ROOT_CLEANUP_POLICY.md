## Root cleanup policy

Goal: keep the repository root small and predictable.

### What stays in repo root

- `README.md`, `LICENSE`
- `pyproject.toml`, `requirements.txt`
- `Dockerfile`, `docker-compose.yml`
- `package.json` (if the monorepo needs it at root)
- High-level governance docs: `CONTRIBUTING.md`, `SECURITY.md`, `ROADMAP.md`

### What moves out of repo root

- **One-off scripts** (`*.py`, `*.sh`) → `scripts/` (by purpose)
- **Reports / summaries / checklists** (`*REPORT*.md`, `*SUMMARY*.md`, etc.) → `docs/reports/`
- **How-to guides** (`*GUIDE*.md`, `*SETUP*.md`, etc.) → `docs/guides/`
- **Indexes** (`INDEX.md`, `QUICK_INDEX.md`, etc.) → `docs/index/`

### Canonical locations

- Training entrypoints: `scripts/training/`
- Data pipeline: `scripts/data_pipeline/`
- Validation & audits: `scripts/maintenance/`
- Deploy & upload helpers: `scripts/deploy/`

