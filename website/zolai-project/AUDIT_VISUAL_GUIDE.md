# API Mutation Audit - Visual Guide

## 🎯 What This Audit Does

```
┌─────────────────────────────────────────────────────────────────┐
│                  API Mutation Audit Flow                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. SEED TEST ACCOUNTS                                          │
│     ├─ Create admin@zolai.space (ADMIN role)                   │
│     └─ Create user@zolai.space (USER role)                     │
│                                                                 │
│  2. AUTHENTICATE BOTH ACCOUNTS                                  │
│     ├─ Admin login → session cookie + CSRF token               │
│     └─ User login → session cookie + CSRF token                │
│                                                                 │
│  3. TEST MUTATION ENDPOINTS                                     │
│     ├─ Settings (admin only)                                   │
│     ├─ Content (create/update/delete)                          │
│     ├─ Media (list)                                            │
│     ├─ Menus (create/update/delete)                            │
│     ├─ Redirects (create/update/delete)                        │
│     ├─ Newsletter (subscribe/campaign)                         │
│     ├─ Notifications (get/mark-read)                           │
│     ├─ Comments (create/update/delete)                         │
│     └─ Security (get settings)                                 │
│                                                                 │
│  4. VALIDATE SECURITY                                           │
│     ├─ CSRF protection (token validation)                      │
│     ├─ Authentication (login required)                         │
│     ├─ Authorization (role-based access)                       │
│     └─ Error handling (proper status codes)                    │
│                                                                 │
│  5. GENERATE REPORT                                             │
│     ├─ Test results (pass/fail)                                │
│     ├─ Performance metrics                                     │
│     ├─ Security summary                                        │
│     └─ Failure details                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔐 CSRF Protection Validation

```
┌──────────────────────────────────────────────────────────────────┐
│              CSRF Token Protection Flow                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  STEP 1: User Authenticates                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ POST /api/auth/sign-in/email                            │   │
│  │ {email, password}                                       │   │
│  │                                                         │   │
│  │ Response:                                               │   │
│  │ ✓ Session Cookie (httpOnly, secure)                    │   │
│  │ ✓ User data                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  STEP 2: Get CSRF Token                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ GET /api/csrf-token                                     │   │
│  │ Headers: Cookie: [session-cookie]                       │   │
│  │                                                         │   │
│  │ Response:                                               │   │
│  │ ✓ CSRF Token (random 32-byte hex)                       │   │
│  │ ✓ Stored in secure cookie                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  STEP 3: Send Mutation with CSRF Token                          │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ PUT /api/admin/settings                                 │   │
│  │ Headers:                                                │   │
│  │   Cookie: [session-cookie]                              │   │
│  │   X-CSRF-Token: [csrf-token]                            │   │
│  │ Body: {key: "site_name", value: "..."}                 │   │
│  │                                                         │   │
│  │ Server Validation:                                      │   │
│  │ ✓ Check session cookie valid                            │   │
│  │ ✓ Check CSRF token matches stored cookie                │   │
│  │ ✓ If valid → proceed with mutation                      │   │
│  │ ✗ If invalid → return 403 Forbidden                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│  AUDIT TESTS:                                                   │
│  ✓ Valid token → 200 OK (mutation succeeds)                    │
│  ✓ Missing token → 403 Forbidden (CSRF protection works)       │
│  ✓ Invalid token → 403 Forbidden (CSRF protection works)       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🔑 Authentication & Authorization

```
┌──────────────────────────────────────────────────────────────────┐
│           Role-Based Access Control Testing                     │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ADMIN ROLE                                                      │
│  ├─ ✓ Can read all settings                                     │
│  ├─ ✓ Can update settings                                       │
│  ├─ ✓ Can create/update/delete content                          │
│  ├─ ✓ Can create/update/delete menus                            │
│  ├─ ✓ Can create/update/delete redirects                        │
│  ├─ ✓ Can create newsletter campaigns                           │
│  ├─ ✓ Can access security settings                              │
│  └─ ✗ Cannot access without CSRF token (403)                    │
│                                                                  │
│  USER ROLE                                                       │
│  ├─ ✓ Can create/update/delete own comments                     │
│  ├─ ✓ Can read own notifications                                │
│  ├─ ✓ Can mark notifications as read                            │
│  ├─ ✓ Can subscribe to newsletter                               │
│  ├─ ✗ Cannot update settings (403)                              │
│  ├─ ✗ Cannot create content (403)                               │
│  ├─ ✗ Cannot create menus (403)                                 │
│  └─ ✗ Cannot access security settings (403)                     │
│                                                                  │
│  PUBLIC (No Auth)                                                │
│  ├─ ✓ Can subscribe to newsletter                               │
│  ├─ ✗ Cannot access any protected endpoints (401)               │
│  └─ ✗ Cannot perform mutations (401)                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 📊 Test Results Format

```
┌──────────────────────────────────────────────────────────────────┐
│                    Test Result Example                          │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✓ Update Site Setting                    PUT  200 [A] [C] 45ms │
│  │ │                                       │    │   │   │  │    │
│  │ │                                       │    │   │   │  └─ Response time
│  │ │                                       │    │   │   └─ [C] = CSRF required
│  │ │                                       │    │   └─ [A] = Auth required
│  │ │                                       │    └─ HTTP status code
│  │ │                                       └─ HTTP method
│  │ └─ Test name
│  └─ Result (✓ pass, ✗ fail)
│                                                                  │
│  ✗ Update Setting (No CSRF)               PUT  403 [A] [C] 32ms │
│    └─ Error: Expected 403, got 200                              │
│                                                                  │
│  Legend:                                                         │
│  ✓ = Test passed                                                │
│  ✗ = Test failed                                                │
│  [A] = Requires Authentication                                  │
│  [C] = Requires CSRF Token                                      │
│  Xms = Response time in milliseconds                            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 📈 Summary Report

```
╔══════════════════════════════════════════════════════════════════╗
║                      Test Summary                               ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  Total Tests:        22                                          ║
║  ✓ Passed:           22                                          ║
║  ✗ Failed:            0                                          ║
║  ⏱️  Avg Duration:     45ms                                       ║
║                                                                  ║
║  🔐 CSRF Protection Tests:  15/15 passed                         ║
║  🔑 Auth Protection Tests:  20/20 passed                         ║
║                                                                  ║
║  Status: ✅ All tests passed!                                    ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
```

## 🚀 Quick Start Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Quick Start (2 minutes)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Terminal 1: Start Dev Server                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ $ cd website/zolai-project                              │  │
│  │ $ bun dev                                               │  │
│  │                                                         │  │
│  │ ▲ Next.js 16.2.3 (Turbopack)                            │  │
│  │ - Local:   http://localhost:3000                        │  │
│  │ ✓ Ready in 1087ms                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Terminal 2: Run Audit                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ $ cd website/zolai-project                              │  │
│  │ $ bun run audit:api                                     │  │
│  │                                                         │  │
│  │ 🌱 Seeding test accounts...                             │  │
│  │ ✅ Test accounts created                                │  │
│  │ 🔐 Authenticating...                                    │  │
│  │ ✓ Authenticated                                         │  │
│  │                                                         │  │
│  │ ⚙️  Settings Endpoints                                   │  │
│  │ ✓ Get All Settings              GET  200 [A]      32ms │  │
│  │ ✓ Update Site Setting           PUT  200 [A][C]   45ms │  │
│  │ ✓ Update (No CSRF - Fail)       PUT  403 [A][C]   28ms │  │
│  │ ✓ Update (User - Fail)          PUT  403 [A][C]   35ms │  │
│  │                                                         │  │
│  │ [... more tests ...]                                    │  │
│  │                                                         │  │
│  │ 📊 Test Summary                                         │  │
│  │ Total: 22 | ✓ Passed: 22 | ✗ Failed: 0                │  │
│  │ ✅ All tests passed!                                    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📋 Endpoint Coverage Map

```
┌─────────────────────────────────────────────────────────────────┐
│                  Endpoint Coverage Matrix                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  SETTINGS (Admin Only)                                          │
│  ├─ GET  /api/admin/settings              ✓ Tested             │
│  ├─ PUT  /api/admin/settings              ✓ Tested (+ CSRF)    │
│  └─ PUT  /api/admin/settings (no CSRF)    ✓ Tested (should fail)
│                                                                 │
│  CONTENT                                                        │
│  ├─ POST   /api/content                   ✓ Tested (+ CSRF)    │
│  ├─ PATCH  /api/content/{id}              ✓ Tested (+ CSRF)    │
│  └─ DELETE /api/content/{id}              ✓ Tested (+ CSRF)    │
│                                                                 │
│  MEDIA                                                          │
│  └─ GET  /api/media                       ✓ Tested             │
│                                                                 │
│  MENUS                                                          │
│  ├─ POST   /api/menus                     ✓ Tested (+ CSRF)    │
│  ├─ PATCH  /api/menus/{id}                ✓ Tested (+ CSRF)    │
│  └─ DELETE /api/menus/{id}                ✓ Tested (+ CSRF)    │
│                                                                 │
│  REDIRECTS                                                      │
│  ├─ POST   /api/redirects                 ✓ Tested (+ CSRF)    │
│  ├─ PATCH  /api/redirects/{id}            ✓ Tested (+ CSRF)    │
│  └─ DELETE /api/redirects/{id}            ✓ Tested (+ CSRF)    │
│                                                                 │
│  NEWSLETTER                                                     │
│  ├─ POST /api/newsletter/subscribe        ✓ Tested (public)    │
│  └─ POST /api/newsletter/campaigns        ✓ Tested (+ CSRF)    │
│                                                                 │
│  NOTIFICATIONS                                                  │
│  ├─ GET   /api/notifications              ✓ Tested             │
│  └─ PATCH /api/notifications/mark-read    ✓ Tested (+ CSRF)    │
│                                                                 │
│  COMMENTS                                                       │
│  ├─ POST   /api/comments                  ✓ Tested (+ CSRF)    │
│  ├─ PATCH  /api/comments/{id}             ✓ Tested (+ CSRF)    │
│  └─ DELETE /api/comments/{id}             ✓ Tested (+ CSRF)    │
│                                                                 │
│  SECURITY                                                       │
│  └─ GET  /api/security                    ✓ Tested             │
│                                                                 │
│  Total: 22 endpoints tested                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🎓 Key Concepts

```
┌─────────────────────────────────────────────────────────────────┐
│                    Key Security Concepts                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. CSRF (Cross-Site Request Forgery) Protection               │
│     ├─ Problem: Attacker tricks user into making unwanted      │
│     │           requests from another site                     │
│     ├─ Solution: Require token that attacker can't access      │
│     └─ Test: Verify 403 when token is missing/invalid          │
│                                                                 │
│  2. Authentication (AuthN)                                      │
│     ├─ Problem: Anyone could access protected resources        │
│     ├─ Solution: Require login with valid credentials          │
│     └─ Test: Verify 401 when not authenticated                 │
│                                                                 │
│  3. Authorization (AuthZ)                                       │
│     ├─ Problem: Authenticated user could access others' data   │
│     ├─ Solution: Check user role/permissions                   │
│     └─ Test: Verify 403 when user lacks permission             │
│                                                                 │
│  4. Secure Cookies                                              │
│     ├─ httpOnly: Can't be accessed by JavaScript               │
│     ├─ Secure: Only sent over HTTPS                            │
│     ├─ SameSite: Only sent to same site                         │
│     └─ Test: Verify cookies are set correctly                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Documentation Files

```
┌─────────────────────────────────────────────────────────────────┐
│                  Documentation Structure                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  📄 AUDIT_QUICK_START.md                                        │
│     └─ 2-minute quick start guide                              │
│        • How to run                                            │
│        • What gets tested                                      │
│        • Expected results                                      │
│        • Troubleshooting                                       │
│                                                                 │
│  📄 API_MUTATION_AUDIT.md                                       │
│     └─ Comprehensive documentation                             │
│        • Full feature list                                     │
│        • All endpoints covered                                 │
│        • CSRF flow explanation                                 │
│        • Security considerations                               │
│        • CI/CD integration                                     │
│        • Debugging tips                                        │
│                                                                 │
│  📄 AUDIT_SUMMARY.md                                            │
│     └─ Executive summary                                       │
│        • What was created                                      │
│        • Key features                                          │
│        • Test coverage                                         │
│        • Next steps                                            │
│                                                                 │
│  📄 AUDIT_VISUAL_GUIDE.md (this file)                           │
│     └─ Visual diagrams and flows                               │
│        • Process flows                                         │
│        • Security flows                                        │
│        • Test results format                                   │
│        • Quick reference                                       │
│                                                                 │
│  🔧 scripts/audit-api-mutations.ts                              │
│     └─ Main audit script (24KB)                                │
│        • Automatic account seeding                             │
│        • CSRF token management                                 │
│        • Comprehensive endpoint testing                        │
│        • Detailed reporting                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

**Pro Tip:** Bookmark this guide for quick reference during development!
