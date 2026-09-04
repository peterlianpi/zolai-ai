# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2026-09-04

### Changed

- Reconciled version across all package managers: `pyproject.toml`, `package.json`, `zolai/__init__.py` now all report `2.0.0`.
- Restructured repository root: doc/metadata files restored to root per GitHub conventions; `zolai/` package kept at project root for `parents[N]` path compatibility.
- Adapted P-Core orchestra tooling into `scripts/` (`init-context.sh`, `session-claims.sh`, `update-free-models.sh`).

### Added

- `CHANGELOG.md` — root-level changelog tracking project milestones.
- `scripts/init-context.sh` — per-repo context bootstrap from templates.
- `scripts/session-claims.sh` — concurrent session coordination for orchestra agents.
- `scripts/update-free-models.sh` — free-model list updater from upstream.

### Fixed

- `pyproject.toml` `packages.find` where = `["."]` verified for `zolai/` at root.
- `Dockerfile` COPY paths verified for current layout.
- `.github/workflows/ci.yml` ruff/pytest paths verified.

## [1.0.0] - prior

Initial project release.
