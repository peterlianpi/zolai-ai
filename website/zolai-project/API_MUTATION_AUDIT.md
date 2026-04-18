# API Mutation Audit & Test Suite

## Overview

This comprehensive audit and test suite validates all mutation endpoints (POST, PUT, PATCH, DELETE) with proper CSRF protection, authentication, and authorization checks.

## Features

✅ **Automatic Account Seeding** - Creates test admin and user accounts  
✅ **CSRF Token Management** - Obtains and validates CSRF tokens for each session  
✅ **Authentication Testing** - Tests both admin and user roles  
✅ **Authorization Testing** - Verifies role-based access control  
✅ **Mutation Endpoint Coverage** - Tests all create, update, delete operations  
✅ **Security Validation** - Confirms CSRF protection and auth requirements  
✅ **Detailed Reporting** - Comprehensive test results with error tracking  

## Running the Audit

### Prerequisites

- Development server running: `bun dev`
- Database seeded with initial data
- Environment variables configured

### Run Full Audit

```bash
# Run API mutation audit only
bun run audit:api

# Run all audits (system, multi-agent, API)
bun run audit:all
```

### Run with Custom Base URL

```bash
API_URL=http://your-server:3000 bun run audit:api
```

## Test Accounts

The audit automatically creates two test accounts:

| Role | Email | Password |
|------|-------|----------|
| Admin | `audit-admin@zolai.space` | `AuditTest123!` |
| User | `audit-user@zolai.space` | `AuditTest123!` |

These accounts are created fresh on each run and can be safely deleted afterward.

## Test Coverage

### 1. Settings Endpoints (Admin Only)

- **GET /api/admin/settings** - Retrieve all site settings
- **PUT /api/admin/settings** - Update a site setting
- **PUT without CSRF** - Verify CSRF protection (should fail with 403)
- **PUT as User** - Verify authorization (should fail with 403)

### 2. Content Endpoints

- **POST /api/content** - Create new content (admin)
- **PATCH /api/content/{id}** - Update content (admin)
- **DELETE /api/content/{id}** - Delete content (admin)

### 3. Media Endpoints

- **GET /api/media** - List media files (admin)

### 4. Menu Endpoints

- **POST /api/menus** - Create menu item (admin)
- **PATCH /api/menus/{id}** - Update menu item (admin)
- **DELETE /api/menus/{id}** - Delete menu item (admin)

### 5. Redirect Endpoints

- **POST /api/redirects** - Create redirect (admin)
- **PATCH /api/redirects/{id}** - Update redirect (admin)
- **DELETE /api/redirects/{id}** - Delete redirect (admin)

### 6. Newsletter Endpoints

- **POST /api/newsletter/subscribe** - Subscribe (public, no auth)
- **POST /api/newsletter/campaigns** - Create campaign (admin)

### 7. Notification Endpoints

- **GET /api/notifications** - Get notifications (user)
- **PATCH /api/notifications/mark-read** - Mark as read (user)

### 8. Comment Endpoints

- **POST /api/comments** - Create comment (user)
- **PATCH /api/comments/{id}** - Update comment (user)
- **DELETE /api/comments/{id}** - Delete comment (user)

### 9. Security Endpoints

- **GET /api/security** - Get security settings (admin)

## CSRF Protection Validation

The audit verifies CSRF protection by:

1. **Obtaining CSRF Token** - Fetches token via `/api/csrf-token` after authentication
2. **Valid Token Test** - Sends mutation with valid CSRF token (should succeed)
3. **Missing Token Test** - Sends mutation without CSRF token (should fail with 403)
4. **Invalid Token Test** - Sends mutation with wrong token (should fail with 403)

### CSRF Token Flow

```
1. User authenticates → receives session cookie
2. Client calls GET /api/csrf-token → receives token
3. Client includes token in X-CSRF-Token header for mutations
4. Server validates token matches stored cookie
5. If valid → mutation proceeds
6. If invalid/missing → returns 403 Forbidden
```

## Authentication & Authorization Testing

### Admin Tests
- ✅ Can read all settings
- ✅ Can update settings with valid CSRF
- ❌ Cannot update settings without CSRF (403)
- ❌ Cannot update settings with invalid CSRF (403)

### User Tests
- ✅ Can create/update/delete own comments
- ✅ Can read own notifications
- ❌ Cannot update site settings (403)
- ❌ Cannot create content (403)

### Public Tests
- ✅ Can subscribe to newsletter (no auth required)
- ❌ Cannot access admin endpoints (401/403)

## Test Results Format

```
✓ Update Site Setting                          PUT    200 [AUTH] [CSRF] (45ms)
✗ Update Setting (No CSRF - Should Fail)       PUT    200 [AUTH] [CSRF] (32ms)
  └─ Error: Expected 403, got 200
```

### Result Indicators

- ✓ = Test passed
- ✗ = Test failed
- [AUTH] = Requires authentication
- [CSRF] = Requires CSRF token
- (Xms) = Response time in milliseconds

## Summary Report

After all tests complete, you'll see:

```
═══════════════════════════════════════════════════════════════════════════════
📊 Test Summary
═══════════════════════════════════════════════════════════════════════════════
Total Tests: 45
✓ Passed: 42
✗ Failed: 3
⏱️  Avg Duration: 52ms

🔐 CSRF Protection Tests: 15/15 passed
🔑 Auth Protection Tests: 30/30 passed
```

## Common Issues & Solutions

### Issue: "Failed to authenticate"
**Solution:** Ensure the development server is running and database is seeded.

```bash
bun dev
# In another terminal:
bun run audit:api
```

### Issue: "Failed to get CSRF token"
**Solution:** CSRF endpoint may not be accessible. Check:
- Server is running
- `/api/csrf-token` endpoint exists
- Session cookie is valid

### Issue: "CSRF token validation error"
**Solution:** Token may have expired. The audit automatically refreshes tokens for each session.

### Issue: "403 Forbidden on valid requests"
**Solution:** Check:
- User has correct role (admin for admin endpoints)
- CSRF token is included in X-CSRF-Token header
- Session cookie is valid and not expired

## Debugging

Enable verbose logging by modifying the script:

```typescript
// Add before request
console.log(`[DEBUG] ${method} ${path}`);
console.log(`[DEBUG] Headers:`, requestHeaders);
console.log(`[DEBUG] Body:`, body);
```

## Integration with CI/CD

Add to your CI/CD pipeline:

```yaml
# .github/workflows/test.yml
- name: Run API Mutation Audit
  run: bun run audit:api
  env:
    API_URL: http://localhost:3000
```

## Security Considerations

### CSRF Protection
- Tokens are stored in secure, httpOnly cookies
- Tokens expire after 24 hours
- Tokens are validated on every mutation
- Invalid/missing tokens return 403 Forbidden

### Authentication
- Sessions are validated before mutations
- Unauthenticated requests return 401 Unauthorized
- Session cookies are secure and httpOnly

### Authorization
- Role-based access control is enforced
- Users cannot access admin endpoints
- Admins can access all endpoints
- Users can only modify their own resources

## Maintenance

### Updating Test Accounts

Edit the script to change test credentials:

```typescript
const TEST_ADMIN_EMAIL = "audit-admin@zolai.space";
const TEST_PASSWORD = "AuditTest123!";
```

### Adding New Endpoints

Add a new test function:

```typescript
async function testNewEndpoints() {
  console.log("\n🆕 New Endpoints");
  console.log("─".repeat(100));

  const { status, error, duration } = await request(
    "POST",
    "/api/new-endpoint",
    { /* payload */ },
    {},
    adminSessionCookie,
    adminCSRFToken
  );

  await recordTest(
    "Create New Resource",
    "/api/new-endpoint",
    "POST",
    status,
    status === 201,
    error,
    duration,
    true,
    true
  );
}
```

Then call it in `main()`:

```typescript
await testNewEndpoints();
```

## Related Documentation

- [CSRF Implementation](./CSRF_IMPLEMENTATION_COMPLETE.md)
- [API Security](./docs/audit/SECURITY-ARCHITECTURE-REVIEW.md)
- [Authentication System](./docs/auth/AUTH_SYSTEM_AUDIT.md)

## Support

For issues or questions:
1. Check the [Common Issues](#common-issues--solutions) section
2. Review server logs: `bun dev` output
3. Check database: `bun prisma studio`
4. Verify environment variables: `.env.local`

---

**Last Updated:** April 18, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
