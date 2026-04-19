# Security Auditor Skill

## Purpose
Passive security audit of public Zolai API endpoints — no active exploitation.

## Checks

| Check | Expected | Fail Condition |
|---|---|---|
| Content-Security-Policy | Present | Missing header |
| X-Frame-Options | DENY or SAMEORIGIN | Missing or ALLOW-ALL |
| CORS origin | Specific domain | Wildcard `*` on auth routes |
| Rate limiting | X-RateLimit-* headers | No rate limit headers |
| Error responses | Generic message | Stack trace or internal path |
| Auth endpoints | 401 on missing token | 200 or 500 |

## Workflow
1. List all public endpoints from API spec
2. Send probe requests (no auth, malformed input)
3. Inspect response headers and body
4. Score each endpoint: PASS / WARN / FAIL
5. Write report to `artifacts/security_audit.md`

## Report Format
```markdown
## Security Audit — <date>
| Endpoint | Check | Status | Detail |
|---|---|---|---|
| GET /api/dictionary/search | Rate Limit | WARN | No X-RateLimit headers |
```

## Scope
- Public endpoints only
- No credential testing
- No fuzzing or injection
