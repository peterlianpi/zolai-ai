# API Mutation Audit - Quick Start Guide

## 🚀 Quick Start (2 minutes)

### Step 1: Start Development Server
```bash
cd website/zolai-project
bun dev
```

Wait for: `✓ Ready in XXXms`

### Step 2: Run Audit (in another terminal)
```bash
cd website/zolai-project
bun run audit:api
```

### Step 3: Review Results
Look for:
- ✓ = Test passed
- ✗ = Test failed
- Summary at the end shows pass/fail counts

## 📊 What Gets Tested

| Category | Tests | Coverage |
|----------|-------|----------|
| Settings | 4 | Admin-only updates with CSRF |
| Content | 3 | Create, update, delete posts |
| Media | 1 | List media files |
| Menus | 3 | Create, update, delete menu items |
| Redirects | 3 | Create, update, delete redirects |
| Newsletter | 2 | Subscribe, create campaigns |
| Notifications | 2 | Get, mark as read |
| Comments | 3 | Create, update, delete comments |
| Security | 1 | Get security settings |
| **Total** | **22** | **Full mutation coverage** |

## 🔐 Security Checks

✅ **CSRF Protection** - Validates tokens on all mutations  
✅ **Authentication** - Verifies login required  
✅ **Authorization** - Checks role-based access  
✅ **Error Handling** - Tests invalid requests  

## 📝 Test Accounts (Auto-Created)

```
Admin:  audit-admin@zolai.space / AuditTest123!
User:   audit-user@zolai.space  / AuditTest123!
```

## 🎯 Expected Results

### ✅ All Tests Pass
```
Total Tests: 22
✓ Passed: 22
✗ Failed: 0
⏱️  Avg Duration: 45ms

🔐 CSRF Protection Tests: 15/15 passed
🔑 Auth Protection Tests: 20/20 passed
```

### ⚠️ Common Failures

**CSRF Token Missing (403)**
- Mutation sent without X-CSRF-Token header
- Expected behavior - security working correctly

**Unauthorized (401)**
- User not authenticated
- Expected for public endpoints

**Forbidden (403)**
- User lacks permission (e.g., user trying to update settings)
- Expected behavior - authorization working correctly

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| "Failed to authenticate" | Ensure `bun dev` is running |
| "Connection refused" | Check BASE_URL in script (default: http://localhost:3000) |
| "CSRF token validation error" | Server may be restarting, try again |
| "403 on valid requests" | Check user role and CSRF token header |

## 📈 Performance Baseline

- Average response time: 40-60ms
- Total test duration: 1-2 seconds
- Database operations: ~50

## 🔄 Running Specific Tests

Edit the script to comment out test suites you don't need:

```typescript
// In main() function:
await testSettingsEndpoints();      // ← Keep this
// await testContentEndpoints();    // ← Skip this
await testMediaEndpoints();         // ← Keep this
```

## 📋 Checklist Before Deployment

- [ ] Run `bun run audit:api` - all tests pass
- [ ] Check CSRF protection tests pass
- [ ] Verify auth tests pass
- [ ] Review any failed tests
- [ ] Check performance metrics
- [ ] Test with production database (if applicable)

## 🎓 Understanding CSRF Flow

```
1. User logs in
   ↓
2. Server creates session cookie
   ↓
3. Client calls GET /api/csrf-token
   ↓
4. Server returns CSRF token
   ↓
5. Client sends mutation with X-CSRF-Token header
   ↓
6. Server validates token matches cookie
   ↓
7. If valid → mutation succeeds
   If invalid → returns 403 Forbidden
```

## 📚 Full Documentation

See [API_MUTATION_AUDIT.md](./API_MUTATION_AUDIT.md) for:
- Detailed test descriptions
- All endpoints covered
- Security considerations
- Integration with CI/CD
- Debugging tips

## 🆘 Need Help?

1. Check server logs: `bun dev` output
2. Verify database: `bun prisma studio`
3. Check environment: `.env.local`
4. Review full docs: [API_MUTATION_AUDIT.md](./API_MUTATION_AUDIT.md)

---

**Pro Tip:** Run audit after every major API change to catch regressions early!
