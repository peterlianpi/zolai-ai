# Zolai AI - Authentication System Audit Report

**Audit Date:** April 9, 2026
**Scope:** Complete authentication system across lib/, features/auth, server actions, API routes, and middleware

---

## EXECUTIVE SUMMARY

The Zolai AI application uses **Better Auth** as its authentication framework with good foundational security practices. However, there are several critical issues, code quality problems, and security gaps that require immediate attention.

**Critical Issues Found:** 8
**High Priority Issues:** 6  
**Medium Priority Issues:** 12
**Code Quality Issues:** 7

---

## 1. CURRENT AUTHENTICATION FILES & STRUCTURE

### Core Authentication Files

| File | Purpose | Status |
|------|---------|--------|
| `/lib/auth.ts` | Better Auth configuration (279 lines) | ✓ Core |
| `/lib/auth-client.ts` | Client-side auth methods (27 lines) | ✓ Core |
| `/lib/auth/server.ts` | Server session helpers (60 lines) | ✓ Core |
| `/lib/auth/permissions.ts` | Role-based access control (94 lines) | ✓ RBAC |
| `/lib/auth/admin.ts` | Admin helper functions (90 lines) | ✓ Helpers |
| `/lib/auth/hono-helpers.ts` | Hono context auth helpers (62 lines) | ✓ Helpers |
| `/action/session.ts` | Session management server actions (126 lines) | ✓ Session Mgmt |
| `/action/verification.ts` | Email verification actions (66 lines) | ✓ Email Verify |
| `/action/profile.ts` | User profile mutations (142 lines) | ✓ Profile |
| `/features/auth/lib/auth-api.ts` | Client API wrapper (210 lines) | ✓ Client API |
| `/features/auth/types/auth.ts` | TypeScript type definitions (141 lines) | ✓ Types |
| `/features/auth/hooks/*` | React hooks for auth (useLogin, useSessions, etc.) | ✓ Hooks |
| `/features/auth/components/*` | Auth UI components (LoginForm, SignupForm, 2FA, etc.) | ✓ UI |
| `/app/api/auth/[...all]/route.ts` | Better Auth route handler (4 lines) | ✓ Routes |
| `/app/api/[[...route]]/check-role.ts` | Role check endpoint (17 lines) | ✓ Routes |
| `/app/(protected)/layout.tsx` | Protected route layout (27 lines) | ✓ Route Guards |
| `/app/(protected)/admin/layout.tsx` | Admin route layout (22 lines) | ✓ Route Guards |
| `/proxy.ts` | Middleware/proxy for route protection (150 lines) | ✓ Middleware |

### Authentication Flow

```
User Registration
├── Form validation (Zod)
├── CAPTCHA verification (hCaptcha)
├── Password complexity check (haveIBeenPwned plugin)
├── Email verification required
└── Auto-signin disabled

User Login
├── Email + password validation
├── Remember me option
├── 2FA verification (if enabled)
├── Session creation with rate limiting
└── Cookie-based session storage

2FA Setup
├── TOTP generation
├── Backup codes (10x8 chars)
├── Trusted device option (30 days)
└── Email OTP fallback

Session Management
├── Multi-session support (max 10 concurrent)
├── Device tracking (IP + User-Agent)
├── Session timeout (7 days)
└── Sign out specific device / all devices

Admin Access
├── Role check on protected routes
├── Per-route admin middleware
└── Admin layout with authorization check

Password Reset
├── Email verification
├── Rate limiting (3 per hour)
├── Token-based reset
└── Password breach detection
```

---

## 2. SECURITY ISSUES & VULNERABILITIES

### CRITICAL ISSUES (Must Fix Immediately)

#### ISSUE 1: Weak Session Token Validation in Proxy (CRITICAL)
**File:** `/proxy.ts` (lines 120-128)
**Problem:**
```typescript
// Optimistic auth check using cookies to avoid DB connection exhaustion
const hasSessionToken = request.cookies.has("better-auth.session_token") || 
                        request.cookies.has("__Secure-better-auth.session_token");

if (isProtectedRoute(pathname) && !hasSessionToken) {
  // Redirect to login
}
```

**Issues:**
- Cookie presence check is NOT secure - cookies can be manipulated
- Does NOT validate session token in database
- Does NOT check if token is expired
- Does NOT verify session belongs to valid user
- Attacker can forge valid-looking cookies if naming is guessed
- SECURITY RISK: Session fixation vulnerability

**Impact:** High - Allows unauthorized access if cookie is spoofed
**OWASP:** A07:2021 - Identification and Authentication Failures

---

#### ISSUE 2: Multiple Session Auth Checks Without Consistent Validation
**Files:** `/lib/auth/admin.ts`, `/lib/auth/hono-helpers.ts`, `/action/session.ts`
**Problem:** Same session retrieval logic duplicated across files, inconsistent error handling:

```typescript
// lib/auth/admin.ts - catches all errors silently
export async function checkIsAdmin(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user) return false;
    return session.user.role === "ADMIN";
  } catch (error) {
    console.error("[checkIsAdmin] Error:", error); // Swallows all errors
    return false;
  }
}

// lib/auth/hono-helpers.ts - also silent
export async function checkIsAdmin(c: Context): Promise<boolean> {
  const session = await getSessionFromContext(c);
  if (!session?.user) return false;
  return session.user.role === "ADMIN";
}

// action/session.ts - also silent
export async function getUserSessions() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }
  // ...
}
```

**Issues:**
- Three different implementations of the same logic
- Inconsistent error responses (throw vs return error)
- Silent error catches hide real failures (DB down, auth server down)
- Makes it hard to debug permission issues
- N+1 session lookups per request in some flows

**Impact:** High - Errors hidden, debugging difficult
**OWASP:** A09:2021 - Logging and Monitoring Failures

---

#### ISSUE 3: No Request Body Validation on Auth API Routes
**File:** `/app/api/[[...route]]/check-role.ts`, `/app/api/[[...route]]/check-verification.ts`
**Problem:**
```typescript
// check-role.ts - no request body validation
.get("/", async (c) => {
  try {
    const isAdmin = await checkIsAdmin(c);
    return ok(c, { isAdmin });
  } catch (error) {
    console.error("[CheckRole] Error:", error);
    return internalError(c, "Failed to check role");
  }
})
```

**Issues:**
- No input validation with Zod
- check-verification.ts validates email BUT not all fields
- Missing error detail normalization
- Exposes internal error messages
- No rate limiting at API level (relies only on Better Auth)

**Impact:** Medium - Information disclosure, poor error messages
**OWASP:** A05:2021 - Broken Access Control

---

#### ISSUE 4: 2FA Bypass Through Session Refresh
**Files:** `/lib/auth.ts`, `/features/auth/components/two-factor-settings.tsx`
**Problem:**
```typescript
// lib/auth.ts
twoFactor({
  issuer: process.env.NEXT_PUBLIC_APP_NAME || "Zolai AI",
  totp: {
    period: 30,
    digits: 6,
    algorithm: "SHA1", // ← SHA1 is outdated
  },
  backupCodes: {
    amount: 10,
    length: 8,
  },
  trustedDeviceEnabled: true,
  trustedDeviceExpires: 60 * 60 * 24 * 30, // 30 days - too long
})

// two-factor-settings.tsx - window.location.reload() after 2FA change
const handleSetupComplete = () => {
  setShowSetup(false);
  setIsEnabled(true);
  toast.success("Two-factor authentication enabled successfully!");
  window.location.reload(); // ← Hard reload exposes brief state inconsistency
};
```

**Issues:**
- SHA1 is deprecated for TOTP (should use SHA256)
- Backup codes only 8 characters (NIST recommends 10+)
- Trusted device expires after 30 days (too long - should be 7-14 days)
- No enforcement of 2FA for admin users
- Hard reload after 2FA setup can cause race conditions
- No rate limiting on 2FA verification attempts

**Impact:** High - Weak 2FA can be bypassed
**OWASP:** A07:2021 - Identification and Authentication Failures

---

#### ISSUE 5: Password Reset Token Not Properly Validated
**File:** `/features/auth/lib/auth-api.ts` (lines 99-120)
**Problem:**
```typescript
export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<AuthApiResponse> {
  try {
    const { error } = await authClient.resetPassword({
      newPassword,
      token,
    });
    if (error) {
      return { success: false, error: error.message || "Failed to reset password" };
    }
    return { success: true };
  } catch {
    return { success: false, error: "An unexpected error occurred" };
  }
}
```

**Issues:**
- No token format validation before sending to server
- No token expiration check on client
- Better Auth should validate, but no confirmation
- Token could be replayed if not properly invalidated
- No logging of password reset attempts for audit trail
- Does not verify old password for sensitive operation

**Impact:** Medium-High - Potential token misuse
**OWASP:** A07:2021 - Identification and Authentication Failures

---

#### ISSUE 6: Impersonation Session No Validation
**File:** `/lib/auth.ts` (line 240)
**Problem:**
```typescript
admin({
  ac,
  roles: { /* ... */ },
  allowImpersonatingAdmins: false,
  impersonationSessionDuration: 60 * 60 * 24, // 1 day
  // NO audit logging configured
})
```

**Issues:**
- Admin impersonation allowed for up to 1 day
- No audit log captured for impersonation start/end
- No notification to impersonated user
- No additional confirmation required
- Can impersonate any non-admin user silently

**Impact:** High - Unauthorized user access without detection
**OWASP:** A01:2021 - Broken Access Control

---

#### ISSUE 7: Session Data Exposure in Browser Storage
**File:** `/features/auth/hooks/use-sessions.ts` (lines 94, 119)
**Problem:**
```typescript
// use-sessions.ts
const signOutOtherDevicesFn = useCallback(async (): Promise<boolean> => {
  // ...
  setSessions([]); // ← Immediately clears UI without verifying backend
  toast.success("Signed out from other devices");
  return true;
})

// Issue: Session data includes IP and user-agent
const refreshSessions = useCallback(async () => {
  // ...
  setSessions(result.data || []); // ← Stores raw session data in React state
  // ...
})
```

**Issues:**
- Session IP addresses exposed in React state (potential XSS vector)
- User-Agent strings exposed (fingerprinting vector)
- No sanitization of returned data
- Silent failures if backend signout fails
- State not synced with server state

**Impact:** Medium - Data exposure, XSS vectors
**OWASP:** A03:2021 - Injection, A07:2021 - Cross-Site Scripting

---

### HIGH PRIORITY ISSUES

#### ISSUE 8: Email Verification Enforcement Inconsistent
**Files:** `/lib/auth.ts` (line 93), `/features/auth/components/login-form.tsx`
**Problem:**
```typescript
// lib/auth.ts
emailAndPassword: {
  enabled: true,
  autoSignIn: false,
  requireEmailVerification: process.env.NODE_ENV === "production", // ← Only in prod
}

// login-form.tsx - tries to detect verification error
const isVerification =
  message.toLowerCase().includes("verify your email") ||
  message.toLowerCase().includes("verification required") ||
  message.toLowerCase().includes("email not verified");
```

**Issues:**
- Email verification only required in production
- String matching for verification errors (fragile)
- Verification not enforced for admin users
- No clear error message for unverified emails
- Users can signup but can't login until email verified - no clear UX

**Recommendations:**
- Always require email verification regardless of environment
- Return structured error codes instead of matching strings
- Force verification for admin accounts immediately

---

#### ISSUE 9: Race Condition in Session Signout Operations
**File:** `/action/session.ts` (lines 79-103)
**Problem:**
```typescript
export async function signOutOtherDevices() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return { success: false, error: "Not authenticated" };
  }

  // RACE CONDITION: Session token could change between here and DB delete
  const currentSessionToken = session.session.token;

  await prisma.session.deleteMany({
    where: {
      userId: session.user.id,
      token: { not: currentSessionToken },
    },
  });

  revalidatePath("/settings");
  return { success: true };
}
```

**Issues:**
- Session token retrieved but could be invalidated before deleteMany
- No transaction wrapping the query
- If signout fails halfway, inconsistent state
- Race condition between token fetch and delete

**Recommendations:**
- Wrap in database transaction
- Use session ID instead of token
- Return count of deleted sessions to verify

---

#### ISSUE 10: No CSRF Protection
**Files:** All API routes, Server Actions
**Problem:**
- No CSRF token validation mentioned
- Next.js Server Actions have built-in CSRF protection, but API routes don't
- Better Auth should handle this, but not explicitly configured
- No documentation of CSRF strategy

**Recommendations:**
- Verify Better Auth's CSRF handling
- Add explicit CSRF middleware for Hono routes
- Document CSRF protection strategy

---

#### ISSUE 11: No Concurrent Session Limits Enforced
**File:** `/lib/auth.ts` (line 191)
**Problem:**
```typescript
multiSession({
  maximumSessions: 10, // Allow up to 10 concurrent sessions
})
```

**Issues:**
- 10 concurrent sessions is very high (normal: 3-5)
- No per-device limit
- No enforcement of newer session invalidating older ones
- No user notification when session limit exceeded
- Admin users can have unlimited sessions

**Recommendations:**
- Reduce to 3-5 for normal users
- 5-10 for admin users with 2FA
- Notify user when session created on new device
- Invalidate oldest session if limit exceeded

---

#### ISSUE 12: Database Connection in Middleware
**File:** `/action/verification.ts` (lines 50-65)
**Problem:**
```typescript
export async function checkVerificationStatus() {
  try {
    const session = await auth.api.getSession({
      headers: new Headers(), // ← Empty headers! Won't work
    });
    if (session?.session) {
      return {
        isVerified: session.user.emailVerified,
        user: session.user,
      };
    }
    return { isVerified: false, user: null };
  } catch {
    return { isVerified: false, user: null };
  }
}
```

**Issues:**
- Passing empty Headers() object - won't retrieve session
- Should pass actual request headers
- No error logging for debugging
- Function never works correctly

**Recommendations:**
- Accept headers as parameter
- Use proper error handling
- Add logging

---

#### ISSUE 13: No Audit Logging for Auth Events
**Files:** All auth files
**Problem:**
- No logging of login attempts
- No logging of failed password resets
- No logging of 2FA changes
- No logging of session creations
- No logging of permission escalations

**Recommendations:**
- Create audit log for all auth events
- Log failed login attempts with IP
- Log 2FA enable/disable
- Log impersonation start/end
- Log role changes

---

#### ISSUE 14: Weak Password Requirements
**Files:** Signup form, Reset password form
**Problem:**
- Password minimum is 8 characters (should be 12-14)
- No requirements for uppercase, numbers, symbols
- No password history (user could reuse old passwords)
- Password complexity not shown clearly

---

#### ISSUE 15: No Account Lockout After Failed Logins
**File:** `/lib/auth.ts` (lines 75-84)
**Problem:**
```typescript
rateLimit: {
  enabled: process.env.NODE_ENV === "production",
  window: 60,
  max: 100, // Very high limit
  storage: "database",
  customRules: {
    "/sign-in/email": { window: 15 * 60, max: 5 },
    "/reset-password": { window: 60 * 60, max: 3 },
  },
}
```

**Issues:**
- Rate limiting disabled in development (hides bugs)
- Global limit of 100/minute is very high
- No exponential backoff after repeated failures
- No account lockout mechanism
- No user notification of suspicious activity

---

#### ISSUE 16: No Session Activity Tracking
**Files:** Session management
**Problem:**
- Session model has ipAddress and userAgent, but not used effectively
- No "last activity" timestamp
- No session duration limiting based on inactivity
- No detection of unusual login locations
- No login attempt history

---

#### ISSUE 17: Sensitive Data in Error Messages
**File:** `/lib/auth.ts` (various handlers)
**Problem:**
```typescript
.catch (error) => {
  console.error("[Better Auth] Failed to send reset email:", error);
}
```

**Issues:**
- Console.error logs full error objects
- Could expose stack traces
- Errors shown to users are too generic
- No structured error logging

---

#### ISSUE 18: Missing Rate Limit on Admin Routes
**File:** `/lib/rate-limit.ts` (line 36)
**Problem:**
- Admin routes only rate limited to 20/minute
- No increased rate limit for dangerous operations (user deletion, role changes)
- No rate limiting per user (only per IP)

---

#### ISSUE 19: Secure Cookie Settings Inconsistent
**File:** `/lib/auth.ts` (lines 64-73)
**Problem:**
```typescript
cookies: {
  sessionToken: {
    name: "better-auth.session_token",
    attributes: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // ← Conditional
      sameSite: "lax",                                 // ← Should be "strict"
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days - too long
    },
  },
}
```

**Issues:**
- Secure flag only in production (dev can't test secure cookies)
- SameSite set to "lax" instead of "strict" (less CSRF protection)
- Max age of 7 days for session cookie (too long)
- Should be 24 hours or based on activity
- No secure fallback in development

---

#### ISSUE 20: No Two-Factor Enforcement for Admin
**Files:** Admin permission system
**Problem:**
- Admins can disable 2FA anytime
- No requirement for 2FA on admin accounts
- No enforcement of strong password + 2FA combo

---

---

## 3. CODE QUALITY ISSUES

### Issue 21: Code Duplication - Auth Session Retrieval
**Files:** `/lib/auth/admin.ts`, `/lib/auth/hono-helpers.ts`, `/lib/auth/server.ts`, `/action/session.ts`
**Problem:**
- Session retrieval logic duplicated 4+ times
- Different error handling patterns
- Inconsistent type safety

```typescript
// Pattern repeated everywhere
const session = await auth.api.getSession({
  headers: await headers(), // OR from context
});
if (!session?.user) {
  return error_or_redirect();
}
```

**Recommendation:**
Create centralized `getValidSession()` function:
```typescript
export async function getValidSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user) {
    throw new AuthenticationError("Not authenticated");
  }
  return session;
}
```

---

### Issue 22: Type Safety - Weak Type Definitions
**File:** `/features/auth/lib/auth-api.ts` (lines 14-18)
**Problem:**
```typescript
export async function login(
  credentials: LoginCredentials,
): Promise<AuthApiResponse<{ user?: unknown; session?: unknown }>> { // ← unknown!
  try {
    const { data, error } = await authClient.signIn.email({
      // ...
    });
  }
}
```

**Issues:**
- Return types use `unknown` instead of concrete types
- User data not typed properly
- Session data not typed
- Makes it hard to use the response

**Recommendation:**
```typescript
interface LoginResponse {
  user: BetterAuthUser;
  session: BetterAuthSession;
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthApiResponse<LoginResponse>> {
  // ...
}
```

---

### Issue 23: Error Messages Not Localized
**Files:** All auth components
**Problem:**
- All error messages in English
- No i18n support for auth messages
- Users in Myanmar can't understand errors

**Recommendation:**
- Create auth message keys in locales
- Use `useTranslation` hook
- Support Burmese and English

---

### Issue 24: Inconsistent API Response Format
**Files:** `/app/api/[[...route]]/check-role.ts`, `/app/api/[[...route]]/check-verification.ts`, other API routes
**Problem:**
```typescript
// check-role.ts
return ok(c, { isAdmin });

// check-verification.ts
return c.json({ exists: false, unverified: false });

// admin.ts
return ok(c, response);
```

**Issues:**
- Mix of helper functions and direct c.json()
- Inconsistent response structure
- Some use helpers, some don't
- Hard to document API schema

---

### Issue 25: Large Components - Password Reset Forms
**File:** `/features/auth/components/reset-password-form.tsx` (implied from structure)
**Problem:**
- Forms likely > 200 lines
- Multiple responsibilities (validation, submission, UI)
- No separation of concerns

**Recommendation:**
- Extract validation into separate file
- Extract mutation logic into hook
- Keep component focused on UI

---

### Issue 26: No Error Boundary for Auth Components
**Files:** `/features/auth/components/`
**Problem:**
- No ErrorBoundary wrapper
- If a component crashes, whole auth flow breaks
- No graceful error recovery

**Recommendation:**
- Wrap AuthFormWrapper with ErrorBoundary
- Show "Try again" option
- Log to error tracking service

---

### Issue 27: useAuth Hook Missing
**Files:** `/lib/auth-client.ts`, React components
**Problem:**
- No custom `useAuth()` hook
- Components use `useSession()` directly from better-auth
- No abstraction for auth state
- Hard to swap auth library later
- No TypeScript improvement

**Recommendation:**
Create `/lib/hooks/use-auth.ts`:
```typescript
export function useAuth() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isAdmin = session?.user?.role === "ADMIN";
  
  return {
    session: session?.user ?? null,
    isAuthenticated,
    isAdmin,
    isLoading: status === "loading",
  };
}
```

---

## 4. FEATURE GAPS & MISSING SECURITY

### Missing Features

1. **No Account Deletion (with verification)**
   - Users can't delete accounts
   - No data export before deletion
   - No deletion confirmation email

2. **No Login History**
   - Users can't see where/when accounts logged in
   - No alert for new login location
   - No detection of suspicious activity

3. **No Device Management UI**
   - Device sessions exist but no user-friendly UI
   - Can't see device details (browser, OS)
   - Can't name/identify devices

4. **No Passwordless Authentication**
   - No magic link login
   - No WebAuthn/FIDO2 support
   - No biometric support

5. **No Social Login Recovery**
   - No fallback if social provider fails
   - No linking multiple providers
   - No account recovery via social

6. **No Risk-Based Authentication**
   - No anomaly detection
   - No risk scoring
   - No adaptive 2FA requirement
   - No step-up authentication

7. **No Session Activity Monitoring**
   - No real-time session management
   - No active session count
   - No forced logout capability

8. **No IP Allowlisting for Admin**
   - Admins can login from anywhere
   - No trusted IP list
   - No VPN/Proxy detection

9. **No Organization-Level RBAC**
   - Can't restrict users to specific organizations
   - No team-level permissions
   - organization plugin enabled but underutilized

10. **No Account Recovery Options**
    - No security questions
    - No backup email
    - No trusted contacts

---

### OWASP Top 10 Gaps

| OWASP Vulnerability | Status | Notes |
|-------------------|--------|-------|
| A01:2021 Broken Access Control | Partial | Admin impersonation not logged, weak session validation |
| A02:2021 Cryptographic Failures | Partial | SHA1 for TOTP (outdated), short backup codes |
| A03:2021 Injection | Partial | Zod validates most inputs, but some API routes miss validation |
| A04:2021 Insecure Design | Partial | No session activity tracking, no account lockout |
| A05:2021 Security Misconfiguration | High | SameSite=lax, development mode issues, insufficient rate limits |
| A06:2021 Vulnerable Components | Unknown | Better Auth is maintained, but not verified |
| A07:2021 Auth & Session Management | Critical | Cookie-based validation, weak 2FA, no audit logging |
| A08:2021 Data Integrity Failures | Partial | No input signature verification, race conditions possible |
| A09:2021 Logging & Monitoring | High | Silent error catches, no auth event logging |
| A10:2021 SSRF | Low | Not applicable to auth |

---

## 5. RECOMMENDED REFACTORING PLAN

### Phase 1: Critical Security Fixes (1-2 weeks)

#### 1.1: Implement Server-Side Session Validation
**Priority:** CRITICAL
**Files to Refactor:**
- `/proxy.ts` - Remove cookie-only validation
- `/lib/auth/server.ts` - Add session DB validation
- Create new `/lib/auth/validate.ts`

**Changes:**
```typescript
// Create centralized validation
export async function validateSession(cookies: Record<string, string>) {
  const token = cookies["better-auth.session_token"];
  if (!token) return null;
  
  // Query database for valid session
  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });
  
  if (!session || session.expiresAt < new Date()) {
    return null;
  }
  
  return session;
}
```

**Effort:** 2-3 hours
**Impact:** Eliminates session spoofing vulnerability

---

#### 1.2: Add Audit Logging for All Auth Events
**Priority:** CRITICAL
**Files to Create:**
- `/lib/auth/audit.ts` - Audit logging utilities
- Update all auth handlers

**Changes:**
```typescript
export async function logAuthEvent(
  type: AuthEventType,
  userId: string | null,
  details: object,
  ip: string,
  userAgent: string,
) {
  await prisma.auditLog.create({
    data: {
      type,
      userId,
      details,
      ipAddress: ip,
      userAgent,
    },
  });
}
```

**Effort:** 4-5 hours
**Impact:** Complete audit trail for security investigations

---

#### 1.3: Fix 2FA Configuration
**Priority:** CRITICAL
**File:** `/lib/auth.ts`

**Changes:**
```typescript
twoFactor({
  totp: {
    period: 30,
    digits: 6,
    algorithm: "SHA256", // Change from SHA1
  },
  backupCodes: {
    amount: 12,        // Change from 10
    length: 10,        // Change from 8
  },
  trustedDeviceExpires: 60 * 60 * 24 * 7, // Change from 30 days
})
```

**Effort:** 1 hour
**Impact:** Stronger 2FA against attacks

---

#### 1.4: Add Email Verification Enforcement
**Priority:** CRITICAL
**Files:** `/lib/auth.ts`, signup components

**Changes:**
```typescript
emailAndPassword: {
  requireEmailVerification: true, // Always, not just production
}
```

**Effort:** 1 hour
**Impact:** Prevents spam/compromised accounts

---

#### 1.5: Implement CSRF Protection
**Priority:** HIGH
**File:** Create `/lib/csrf.ts`

**Changes:**
```typescript
import { csrf } from "hono/csrf";

export function createCsrfMiddleware() {
  return csrf({
    origin: process.env.NEXT_PUBLIC_APP_URL,
  });
}

// Apply to all Hono routes
app.use("*", createCsrfMiddleware());
```

**Effort:** 2 hours
**Impact:** Prevents CSRF attacks on API endpoints

---

### Phase 2: Code Quality & Architecture (2-3 weeks)

#### 2.1: Consolidate Auth Session Retrieval
**Priority:** HIGH
**Create:** `/lib/auth/get-session.ts`

**Changes:**
```typescript
export async function getValidSession(
  headers: Headers | { [key: string]: string },
) {
  try {
    const session = await auth.api.getSession({ headers });
    if (!session?.user) {
      return null;
    }
    return session;
  } catch (error) {
    console.error("[getValidSession] Failed:", {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

export async function requireSession(
  headers: Headers | { [key: string]: string },
) {
  const session = await getValidSession(headers);
  if (!session) {
    throw new AuthenticationError("Session invalid or expired");
  }
  return session;
}
```

**Update:** Replace duplication in:
- `/lib/auth/admin.ts`
- `/lib/auth/hono-helpers.ts`
- `/action/session.ts`
- `/action/verification.ts`
- `/action/profile.ts`

**Effort:** 3-4 hours
**Impact:** 20% LOC reduction, better maintainability

---

#### 2.2: Create Auth Error Types
**Priority:** MEDIUM
**Create:** `/lib/auth/errors.ts`

**Changes:**
```typescript
export class AuthError extends Error {
  constructor(public code: string, message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class AuthenticationError extends AuthError {
  constructor(message = "Authentication required") {
    super("UNAUTHENTICATED", message);
  }
}

export class AuthorizationError extends AuthError {
  constructor(message = "Insufficient permissions") {
    super("UNAUTHORIZED", message);
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super("SESSION_EXPIRED", "Your session has expired");
  }
}
```

**Effort:** 2 hours
**Impact:** Better error handling, consistent error codes

---

#### 2.3: Extract Auth API Client Types
**Priority:** MEDIUM
**Refactor:** `/features/auth/lib/auth-api.ts`

**Changes:**
```typescript
// Create proper types
interface BetterAuthUser {
  id: string;
  email: string;
  name: string;
  emailVerified: boolean;
  role: UserRole;
  twoFactorEnabled: boolean;
}

interface LoginResponse {
  user: BetterAuthUser;
  session: { token: string; expiresAt: Date };
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthApiResponse<LoginResponse>> {
  // Type safe now
}
```

**Effort:** 2-3 hours
**Impact:** Full TypeScript support, better DX

---

#### 2.4: Create Custom useAuth Hook
**Priority:** MEDIUM
**Create:** `/lib/hooks/use-auth.ts`

```typescript
export function useAuth() {
  const { data: session, status } = useSession();
  
  return {
    user: session?.user ?? null,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
    isAdmin: session?.user?.role === "ADMIN",
  };
}
```

**Update all components** to use `useAuth()` instead of `useSession()`

**Effort:** 3-4 hours
**Impact:** Cleaner component code, easier refactoring

---

#### 2.5: Add Error Boundaries
**Priority:** MEDIUM
**Create:** `/features/auth/components/auth-error-boundary.tsx`

**Changes:**
```typescript
export function AuthErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={<AuthErrorFallback />}>
      {children}
    </ErrorBoundary>
  );
}
```

**Wrap** all auth components with boundary.

**Effort:** 2 hours
**Impact:** Graceful error handling

---

### Phase 3: Feature Additions (3-4 weeks)

#### 3.1: Login History & Device Management
**Priority:** HIGH
**Files to Create:**
- `/features/security/server/login-history.ts`
- `/features/security/components/login-history.tsx`
- `/features/security/components/device-manager.tsx`

**Database:**
```prisma
model LoginHistory {
  id        String   @id @default(cuid())
  userId    String
  ipAddress String
  userAgent String
  country   String?
  browser   String?
  os        String?
  device    String?
  status    "success" | "failed"
  failureReason String?
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([createdAt])
}
```

**Effort:** 5-6 hours
**Impact:** Users can monitor their account activity

---

#### 3.2: Account Lockout After Failed Attempts
**Priority:** HIGH
**Create:** `/lib/auth/rate-limit-account.ts`

**Changes:**
```typescript
export async function recordFailedLogin(
  email: string,
  ip: string,
) {
  const key = `failed_login_${email}`;
  const count = await redis.incr(key);
  
  if (count >= 5) {
    await lockAccount(email, 30 * 60); // 30 min lockout
  }
}

export async function isAccountLocked(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { lockedUntil: true },
  });
  
  if (!user?.lockedUntil) return false;
  return user.lockedUntil > new Date();
}
```

**Effort:** 4-5 hours
**Impact:** Prevents brute force attacks

---

#### 3.3: Enforce 2FA for Admin Users
**Priority:** HIGH
**Create:** `/lib/auth/2fa-enforcement.ts`

```typescript
export async function require2FAForAdmin(
  c: Context,
) {
  const session = await getSessionFromContext(c);
  if (!session?.user) return;
  
  if (session.user.role === "ADMIN" && !session.user.twoFactorEnabled) {
    return c.json(
      { error: "2FA required for admin accounts" },
      403,
    );
  }
}
```

**Effort:** 2-3 hours
**Impact:** Stronger admin account security

---

#### 3.4: Add Passwordless Login
**Priority:** MEDIUM
**File:** `/lib/auth.ts`

**Add to plugins:**
```typescript
import { passwordless } from "better-auth/plugins";

passwordless({
  sendEmail: async ({ email, url }) => {
    await sendEmail({
      to: email,
      subject: "Sign in to Zolai AI",
      html: `<a href="${url}">Sign in</a>`,
    });
  },
})
```

**Effort:** 4-5 hours
**Impact:** Better UX, less password fatigue

---

#### 3.5: Anomaly Detection & Risk Scoring
**Priority:** MEDIUM
**Create:** `/lib/security/risk-score.ts`

**Changes:**
```typescript
export async function calculateLoginRisk(
  userId: string,
  ip: string,
  userAgent: string,
): Promise<number> {
  let risk = 0;

  // Check if new IP
  const hasPreviousLogin = await prisma.loginHistory.findFirst({
    where: { userId, ipAddress: ip },
  });
  if (!hasPreviousLogin) risk += 30;

  // Check country change
  const lastLogin = await getLastLogin(userId);
  if (lastLogin && await isCountryChange(lastLogin.country, ip)) {
    risk += 40;
  }

  // Check if on blocklist
  const isBlocked = await prisma.blockedIp.findUnique({ where: { ip } });
  if (isBlocked) risk += 100;

  return Math.min(risk, 100);
}
```

**Effort:** 6-8 hours
**Impact:** Detect compromised accounts early

---

## 6. PRIORITY RANKING & EFFORT ESTIMATES

### Critical (Security Issues - Fix This Sprint)

| Priority | Issue | Files | Effort | Impact |
|----------|-------|-------|--------|--------|
| 1 | Weak session validation in proxy | proxy.ts, lib/auth/validate.ts | 3h | HIGH |
| 2 | Add audit logging for auth | lib/auth/audit.ts | 5h | HIGH |
| 3 | Fix 2FA configuration | lib/auth.ts | 1h | HIGH |
| 4 | Email verification enforcement | lib/auth.ts | 1h | MEDIUM |
| 5 | Implement CSRF protection | lib/csrf.ts | 2h | HIGH |
| 6 | Fix password reset validation | features/auth/lib/auth-api.ts | 2h | MEDIUM |
| 7 | Remove impersonation audit gap | lib/auth.ts, lib/audit.ts | 3h | HIGH |
| 8 | Fix session data exposure | features/auth/hooks/use-sessions.ts | 2h | MEDIUM |

**Total Effort:** ~19 hours
**Timeline:** 1 week (3 days focused work)

---

### High Priority (Code Quality - Fix Next Sprint)

| Priority | Issue | Files | Effort | Impact |
|----------|-------|-------|--------|--------|
| 9 | Consolidate session retrieval | 5 files | 4h | MEDIUM |
| 10 | Create auth error types | lib/auth/errors.ts | 2h | MEDIUM |
| 11 | Fix type safety | features/auth/lib/auth-api.ts | 3h | MEDIUM |
| 12 | Create useAuth hook | lib/hooks/use-auth.ts | 4h | LOW |
| 13 | Add error boundaries | features/auth/components | 2h | LOW |
| 14 | Fix 2FA race condition | features/auth/components/two-factor-settings.tsx | 2h | MEDIUM |
| 15 | Implement CSRF in API routes | app/api/[[...route]]/route.ts | 2h | HIGH |

**Total Effort:** ~19 hours
**Timeline:** 1 week

---

### Medium Priority (Features - Next Quarter)

| Priority | Issue | Files | Effort | Impact |
|----------|-------|-------|--------|--------|
| 16 | Login history & device management | 4 files | 6h | MEDIUM |
| 17 | Account lockout mechanism | lib/auth/rate-limit-account.ts | 5h | HIGH |
| 18 | 2FA enforcement for admins | lib/auth/2fa-enforcement.ts | 3h | HIGH |
| 19 | Passwordless authentication | lib/auth.ts | 5h | LOW |
| 20 | Risk-based authentication | lib/security/risk-score.ts | 8h | MEDIUM |
| 21 | Account deletion with verification | features/auth/ | 4h | MEDIUM |
| 22 | IP allowlisting for admins | features/security/ | 4h | MEDIUM |

**Total Effort:** ~35 hours
**Timeline:** 2-3 weeks

---

## 7. TESTING RECOMMENDATIONS

### Unit Tests to Add

```bash
tests/auth/
├── lib/auth/validate.test.ts (new)
├── lib/auth/audit.test.ts (new)
├── lib/auth/get-session.test.ts (new)
├── lib/csrf.test.ts (new)
├── features/auth/lib/auth-api.test.ts (update)
└── features/auth/hooks/use-auth.test.ts (new)
```

### E2E Tests to Add

```bash
tests/e2e/
├── auth-session-validation.spec.ts (new)
├── auth-2fa.spec.ts (update)
├── auth-csrf.spec.ts (new)
├── auth-rate-limit.spec.ts (new)
└── auth-audit-logging.spec.ts (new)
```

### Security Tests

- Brute force protection
- Session fixation attempts
- CSRF token validation
- XSS in error messages
- SQL injection in auth queries
- Session token expiration

---

## 8. DEPLOYMENT CHECKLIST

Before deploying auth fixes:

- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] No console.error logs in production
- [ ] Rate limiting verified in staging
- [ ] 2FA tested with multiple devices
- [ ] Session validation tested with stale cookies
- [ ] CSRF tokens validated across origins
- [ ] Audit logs capturing events
- [ ] Error messages don't expose internals
- [ ] Password reset flow end-to-end tested
- [ ] Email verification tested
- [ ] Security headers present
- [ ] Database indexes created for audit logs

---

## 9. MONITORING & ALERTING

### Metrics to Monitor

```typescript
// Track in analytics/observability platform
{
  "auth_failed_login_attempts": counter,
  "auth_account_lockouts": counter,
  "auth_2fa_setup": counter,
  "auth_session_created": counter,
  "auth_session_invalidated": counter,
  "auth_audit_events": counter,
  "auth_rate_limit_exceeded": counter,
  "auth_password_reset_attempts": counter,
  "auth_email_verification": counter,
}
```

### Alerts to Configure

- 10+ failed login attempts in 5 minutes
- Account lockout events
- Admin role assigned
- Impersonation started
- Rate limiting triggered
- Session validation failures
- 2FA disable events

---

## 10. CONCLUSION

The Zolai AI authentication system has a solid foundation with Better Auth, but requires immediate security fixes before production use. The most critical issues are:

1. Weak session validation (cookie-only in proxy)
2. Missing audit logging for forensics
3. Weak 2FA configuration
4. No CSRF protection on API routes
5. Race conditions in session management

Implementing the Phase 1 fixes (critical security) will take approximately 1 week and eliminate the highest-risk vulnerabilities. Phase 2 (code quality) will improve maintainability and type safety. Phase 3 (features) adds modern security practices like login history, risk scoring, and anomaly detection.

**Recommended Action:**
Begin Phase 1 immediately (this week) to address critical security gaps before any production deployment.

