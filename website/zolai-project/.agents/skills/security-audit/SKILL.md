# Skill: Security Audit

## Purpose

Perform defensive security analysis and vulnerability assessment.

## When to Use

Use this skill when user says:
- "Security audit"
- "Check for vulnerabilities"
- "Penetration testing"
- "Security review"
- "OWASP"
- "Fix security"

## Security Checklist

### 1. Authentication

- [ ] Passwords hashed with bcrypt/argon2
- [ ] Session tokens secure and random
- [ ] 2FA available
- [ ] Rate limiting on login
- [ ] Account lockout after failed attempts

### 2. Authorization

- [ ] Role-based access control (RBAC)
- [ ] Permission checks on API routes
- [ ] Admin routes protected
- [ ] User can only access own data

### 3. Input Validation

- [ ] All inputs validated with Zod
- [ ] No SQL injection (use Prisma)
- [ ] XSS prevention (sanitize HTML)
- [ ] CSRF tokens

### 4. Data Protection

- [ ] Sensitive data encrypted
- [ ] No secrets in code
- [ ] Environment variables used
- [ ] Database SSL/TLS

### 5. API Security

- [ ] Rate limiting
- [ ] Input validation
- [ ] Error messages don't leak info
- [ ] CORS configured

## Common Vulnerabilities

### SQL Injection

**Bad:**
```typescript
const user = await db.query(`SELECT * FROM users WHERE id = ${id}`)
```

**Good:**
```typescript
const user = await db.user.findUnique({ where: { id } })
```

### XSS

**Bad:**
```tsx
<div dangerouslySetInnerHTML={{ __html: content }} />
```

**Good:**
```tsx
<div>{content}</div>
// Or sanitize if needed
import DOMPurify from 'dompurify'
<div>{DOMPurify.sanitize(content)}</div>
```

### CSRF

Use SameSite cookies:

```typescript
cookie('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
})
```

## Security Headers

```typescript
// proxy.ts
c.header('X-Frame-Options', 'DENY')
c.header('X-Content-Type-Options', 'nosniff')
c.header('X-XSS-Protection', '1; mode=block')
c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
c.header('Content-Security-Policy', "default-src 'self'")
```

## Rate Limiting

```typescript
const rateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per window
})
```

## Audit Logging

```typescript
await db.auditLog.create({
  data: {
    userId: user.id,
    action: 'LOGIN',
    ip: c.req.header('x-forwarded-for'),
  },
})
```

## OWASP Top 10 (2021)

1. **Broken Access Control**
2. **Cryptographic Failures**
3. **Injection**
4. **Insecure Design**
5. **Security Misconfiguration**
6. **Vulnerable Components**
7. **Auth Failures**
8. **Data Breaches**
9. **Logging Failures**
10. **SSRF**

## How to Audit

### 1. Code Review

```bash
# Check for hardcoded secrets
grep -r "password" --include="*.ts"
grep -r "secret" --include="*.ts"
```

### 2. Dependencies

```bash
# Check for vulnerabilities
npm audit
npm outdated
```

### 3. API Testing

```bash
# Test auth endpoints
curl -X POST /api/auth/login -d '{"email":"test@test.com"}'
```

### 4. Headers Check

```bash
# Check security headers
curl -I https://site.com
```

## Key Patterns

- Use Zod for all input validation
- Hash passwords with bcrypt
- Use JWT/JWS tokens
- SameSite cookies
- Security headers
- Rate limiting
- Audit logging