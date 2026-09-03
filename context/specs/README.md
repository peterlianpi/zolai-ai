# Unit specs (methodology Part 3)

One file per feature/unit. Copy `_unit-spec.template.md` to `context/specs/<slug>.md` in the target project.

## Naming

- `context/specs/auth-login.md`
- `context/specs/orchestra-adaptive-routing.md`

## When to write

- Before non-trivial implementation (planner references the spec)
- When acceptance criteria are not already in `progress-tracker.md`

## Orchestra integration

1. Planner reads matching specs under `context/specs/` when present
2. Implementer implements only what the spec + plan require
3. Verifier checks "Done when" against evidence (commands, not claims)
