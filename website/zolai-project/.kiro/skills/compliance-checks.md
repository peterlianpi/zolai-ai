---
name: compliance-checks
description: The 4 mandatory compliance checks for this project. Use before committing or when reviewing code for violations.
---

# Compliance Checks — Run After Every Edit

All four must return **zero output**. Fix before committing.

## 1. No raw fetch in client code

```bash
grep -rn "await fetch\b" features app --include="*.ts" --include="*.tsx" \
  | grep -v "/api/chat\|zolai/api/index"
```

**Fix:** Use `@/lib/api/client` instead of `fetch("/api/...")`.

## 2. No loose Hono method calls

```bash
find features app/api -name "*.ts" | while read f; do
  var=$(grep -oP "^const \K\w+(?= = new Hono\(\))" "$f" | head -1)
  [ -n "$var" ] && grep -qP "^${var}\.(get|post|patch|delete|put)\(" "$f" && echo "LOOSE: $f"
done
```

**Fix:** Chain all methods — `app.get(...).post(...).patch(...)`.

## 3. No local hc<AppType> instances

```bash
grep -rn "hc<" features app --include="*.ts" --include="*.tsx" \
  | grep -v "lib/api/client.ts"
```

**Fix:** Import the shared client from `@/lib/api/client`.

## 4. No hono-client imports

```bash
grep -rn "hono-client" features app --include="*.ts" --include="*.tsx"
```

**Fix:** Remove — use `@/lib/api/client` exclusively.

## Additional checks (manual)

- No `any` types — use `unknown` or specific types
- All API inputs validated with `@hono/zod-validator`
- Prisma uses `select` not `include`
- Error responses never expose stack traces or DB internals
- Server Actions return `{ success: boolean, error?: string }`
