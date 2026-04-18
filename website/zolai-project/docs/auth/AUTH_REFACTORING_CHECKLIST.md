# Authentication System Refactoring Checklist

## Phase 1: Critical Security Fixes (19 hours - This Week)

### 1.1 Server-Side Session Validation (3 hours)
- [ ] Create `/lib/auth/validate.ts` with session DB lookup
- [ ] Update `/proxy.ts` to use real validation instead of cookie check
- [ ] Add session expiration check
- [ ] Add user validity check
- [ ] Test with expired and invalid tokens
- [ ] Update `/lib/auth/server.ts` to use new validation
- **Files Changed:** proxy.ts, lib/auth/validate.ts (new), lib/auth/server.ts
- **Risk:** CRITICAL - Session spoofing vulnerability

### 1.2 Audit Logging System (5 hours)
- [ ] Create `/lib/auth/audit.ts` with audit functions
- [ ] Define AuthEventType enum (LOGIN, LOGOUT, FAILED_LOGIN, 2FA_SETUP, 2FA_DISABLE, PASSWORD_RESET, IMPERSONATION_START, IMPERSONATION_END, ROLE_CHANGE, etc.)
- [ ] Create logAuthEvent() function that logs to AuditLog table
- [ ] Add IP and user-agent logging
- [ ] Add logging to `/lib/auth.ts` hooks (password reset, email verification)
- [ ] Add logging to `/lib/auth/admin.ts` (login, logouts)
- [ ] Add logging to 2FA enable/disable flows
- [ ] Add logging to admin impersonation
- [ ] Test audit log recording
- [ ] Verify no sensitive data (passwords) in logs
- **Files Changed:** lib/auth/audit.ts (new), lib/auth.ts, lib/auth/admin.ts, features/auth/components/two-factor-settings.tsx
- **Risk:** CRITICAL - No forensics capability

### 1.3 Fix 2FA Configuration (1 hour)
- [ ] Update `twoFactor.totp.algorithm` from SHA1 to SHA256
- [ ] Update `twoFactor.backupCodes.amount` from 10 to 12
- [ ] Update `twoFactor.backupCodes.length` from 8 to 10
- [ ] Update `twoFactor.trustedDeviceExpires` from 30 days to 7 days
- [ ] Test 2FA setup with new config
- [ ] Regenerate existing backup codes if needed
- **Files Changed:** lib/auth.ts
- **Risk:** CRITICAL - Weak 2FA

### 1.4 Email Verification Enforcement (1 hour)
- [ ] Change `requireEmailVerification` to always true (not just production)
- [ ] Update signup form to show verification required
- [ ] Test email verification flow in development
- [ ] Verify users can't login without verification
- [ ] Test resend verification email
- **Files Changed:** lib/auth.ts, features/auth/components/signup-form.tsx
- **Risk:** CRITICAL - Spam accounts possible

### 1.5 Add CSRF Protection (2 hours)
- [ ] Create `/lib/csrf.ts` with CSRF middleware
- [ ] Import Hono's csrf middleware
- [ ] Apply CSRF to all Hono routes in `/app/api/[[...route]]/route.ts`
- [ ] Test CSRF token validation
- [ ] Test cross-origin requests
- [ ] Document CSRF configuration
- **Files Changed:** lib/csrf.ts (new), app/api/[[...route]]/route.ts
- **Risk:** HIGH - CSRF attacks possible

### 1.6 Fix Password Reset Validation (2 hours)
- [ ] Add token format validation in reset function
- [ ] Verify token not used multiple times
- [ ] Add rate limiting to reset endpoint
- [ ] Add logging of reset attempts
- [ ] Test with invalid tokens
- [ ] Test with expired tokens
- **Files Changed:** features/auth/lib/auth-api.ts
- **Risk:** HIGH - Token replay possible

### 1.7 Add Audit Logging for Impersonation (1 hour)
- [ ] Log impersonation start with admin ID and target user ID
- [ ] Log impersonation end
- [ ] Notify impersonated user (optional)
- [ ] Set impersonation duration to 1 hour instead of 1 day
- [ ] Test impersonation logging
- **Files Changed:** lib/auth.ts, lib/auth/audit.ts
- **Risk:** HIGH - Unauthorized access undetected

### 1.8 Sanitize Session Data in Hooks (2 hours)
- [ ] Remove IP addresses from React state display
- [ ] Remove user-agent from displayed sessions
- [ ] Add data sanitization function
- [ ] Test session display
- [ ] Verify no sensitive data in DOM
- **Files Changed:** features/auth/hooks/use-sessions.ts
- **Risk:** MEDIUM - XSS vector

---

## Phase 2: Code Quality & Architecture (19 hours - Next Week)

### 2.1 Consolidate Session Retrieval (4 hours)
- [ ] Create `/lib/auth/get-session.ts` with getValidSession() and requireSession()
- [ ] Update `/lib/auth/admin.ts` to use getValidSession()
- [ ] Update `/lib/auth/hono-helpers.ts` to use getValidSession()
- [ ] Update `/lib/auth/server.ts` to use getValidSession()
- [ ] Update `/action/session.ts` to use getValidSession()
- [ ] Update `/action/verification.ts` to use getValidSession() with headers
- [ ] Update `/action/profile.ts` to use getValidSession()
- [ ] Test all auth flows
- [ ] Verify 20% LOC reduction
- **Files Changed:** lib/auth/get-session.ts (new), 6+ files updated
- **Impact:** MEDIUM - Better maintainability

### 2.2 Create Auth Error Types (2 hours)
- [ ] Create `/lib/auth/errors.ts` with custom error classes
- [ ] Define AuthError base class with code property
- [ ] Define AuthenticationError (UNAUTHENTICATED)
- [ ] Define AuthorizationError (UNAUTHORIZED)
- [ ] Define SessionExpiredError (SESSION_EXPIRED)
- [ ] Add proper error messages
- [ ] Update error handling in auth files
- [ ] Test error types
- **Files Changed:** lib/auth/errors.ts (new), lib/auth/* (updated)
- **Impact:** MEDIUM - Better error handling

### 2.3 Fix Type Safety (3 hours)
- [ ] Create proper types for Better Auth user/session
- [ ] Update `/features/auth/lib/auth-api.ts` return types
- [ ] Remove `unknown` types from responses
- [ ] Define LoginResponse, RegisterResponse, etc.
- [ ] Update all auth API functions with proper types
- [ ] Test TypeScript compilation
- **Files Changed:** features/auth/lib/auth-api.ts, features/auth/types/auth.ts (updated)
- **Impact:** MEDIUM - Better DX

### 2.4 Create useAuth Hook (4 hours)
- [ ] Create `/lib/hooks/use-auth.ts`
- [ ] Export useAuth() hook with user, isAuthenticated, isAdmin, isLoading
- [ ] Update all components using useSession() to use useAuth()
- [ ] Test hook in components
- [ ] Verify type safety
- [ ] Update component imports
- **Files Changed:** lib/hooks/use-auth.ts (new), 10+ component files updated
- **Impact:** LOW - Cleaner code

### 2.5 Add Error Boundaries (2 hours)
- [ ] Create `/features/auth/components/auth-error-boundary.tsx`
- [ ] Wrap LoginForm with ErrorBoundary
- [ ] Wrap SignupForm with ErrorBoundary
- [ ] Wrap 2FA components with ErrorBoundary
- [ ] Add error fallback UI
- [ ] Test error boundary triggering
- **Files Changed:** features/auth/components/ (new boundary + updated components)
- **Impact:** LOW - Graceful error handling

### 2.6 Fix 2FA Race Condition (2 hours)
- [ ] Replace window.location.reload() with proper state update
- [ ] Use useSession() refresh
- [ ] Add proper loading state during 2FA setup
- [ ] Test 2FA setup flow
- [ ] Verify no state inconsistency
- **Files Changed:** features/auth/components/two-factor-settings.tsx
- **Impact:** MEDIUM - Better UX

### 2.7 Fix Verification Status Function (1 hour)
- [ ] Fix empty Headers() issue in checkVerificationStatus()
- [ ] Accept headers as parameter
- [ ] Add proper error logging
- [ ] Test verification check
- **Files Changed:** action/verification.ts
- **Impact:** LOW - Bug fix

### 2.8 Fix Race Condition in Session Signout (1 hour)
- [ ] Wrap signOutOtherDevices() in transaction
- [ ] Use session ID instead of token
- [ ] Return count of deleted sessions
- [ ] Test edge cases
- **Files Changed:** action/session.ts
- **Impact:** MEDIUM - Data consistency

---

## Phase 3: Feature Additions (35 hours - Next Quarter)

### 3.1 Login History & Device Management (6 hours)
- [ ] Create LoginHistory model in Prisma schema
- [ ] Create `/features/security/server/login-history.ts`
- [ ] Create `/features/security/components/login-history.tsx`
- [ ] Create `/features/security/components/device-manager.tsx`
- [ ] Add browser/OS detection
- [ ] Add country detection from IP
- [ ] Create API endpoints for login history
- [ ] Test login history recording
- [ ] Add to user settings page
- **Files Changed:** prisma/schema.prisma, new security feature folder
- **Impact:** MEDIUM - User accountability

### 3.2 Account Lockout Mechanism (5 hours)
- [ ] Create `/lib/auth/rate-limit-account.ts`
- [ ] Track failed login attempts per email
- [ ] Implement 30-minute lockout after 5 failures
- [ ] Add account status field to User model
- [ ] Create unlock endpoint (email verification)
- [ ] Add test for lockout mechanism
- [ ] Notify user of lockout
- **Files Changed:** lib/auth/rate-limit-account.ts (new), prisma/schema.prisma
- **Impact:** HIGH - Brute force protection

### 3.3 2FA Enforcement for Admins (3 hours)
- [ ] Create `/lib/auth/2fa-enforcement.ts`
- [ ] Check for 2FA on admin login
- [ ] Redirect to 2FA setup if not enabled
- [ ] Prevent admin action if no 2FA
- [ ] Add grace period for existing admins (e.g., 48 hours)
- [ ] Test 2FA enforcement
- **Files Changed:** lib/auth/2fa-enforcement.ts (new), lib/auth.ts
- **Impact:** HIGH - Admin security

### 3.4 Passwordless Authentication (5 hours)
- [ ] Add passwordless plugin to Better Auth
- [ ] Implement email magic link flow
- [ ] Create passwordless component
- [ ] Add to login page
- [ ] Test passwordless flow
- [ ] Handle email sending failures
- **Files Changed:** lib/auth.ts, new component
- **Impact:** LOW - Better UX

### 3.5 Risk-Based Authentication (8 hours)
- [ ] Create `/lib/security/risk-score.ts`
- [ ] Detect new IP addresses
- [ ] Detect country changes
- [ ] Check IP blocklist
- [ ] Calculate risk score
- [ ] Trigger 2FA for high-risk logins
- [ ] Log risk events
- [ ] Test with various IP scenarios
- **Files Changed:** lib/security/risk-score.ts (new), lib/auth.ts
- **Impact:** MEDIUM - Compromise detection

### 3.6 Account Deletion (4 hours)
- [ ] Create account deletion flow
- [ ] Request email confirmation
- [ ] Provide data export
- [ ] Delete user data after 30-day delay
- [ ] Add to user settings
- [ ] Test deletion flow
- **Files Changed:** new action/delete-account.ts, new component
- **Impact:** MEDIUM - GDPR compliance

### 3.7 IP Allowlisting for Admins (4 hours)
- [ ] Create SecuritySettings model for IP allowlist
- [ ] Create UI for admin IP management
- [ ] Check IP on login
- [ ] Allow list bypass with 2FA
- [ ] Add notification on new IP
- [ ] Test IP filtering
- **Files Changed:** prisma/schema.prisma, new admin panel component
- **Impact:** HIGH - Admin security

---

## Testing Checklist

### Unit Tests to Write
- [ ] lib/auth/validate.test.ts - Session validation
- [ ] lib/auth/audit.test.ts - Audit logging
- [ ] lib/auth/get-session.test.ts - Session retrieval
- [ ] lib/csrf.test.ts - CSRF middleware
- [ ] lib/auth/errors.test.ts - Error types
- [ ] lib/hooks/use-auth.test.ts - useAuth hook
- [ ] features/auth/lib/auth-api.test.ts - Auth API client

### E2E Tests to Write
- [ ] tests/e2e/auth-session-validation.spec.ts
- [ ] tests/e2e/auth-2fa.spec.ts (update)
- [ ] tests/e2e/auth-csrf.spec.ts
- [ ] tests/e2e/auth-rate-limit.spec.ts
- [ ] tests/e2e/auth-audit-logging.spec.ts
- [ ] tests/e2e/auth-account-lockout.spec.ts
- [ ] tests/e2e/auth-login-history.spec.ts

### Security Tests
- [ ] Brute force protection (5+ failed attempts)
- [ ] Session fixation (reuse old token)
- [ ] Cookie spoofing (craft cookie)
- [ ] CSRF token validation (cross-origin POST)
- [ ] XSS in error messages (test error content)
- [ ] SQL injection in auth queries
- [ ] Token replay attacks

---

## Pre-Deployment Verification

### Before Phase 1 Merge
- [ ] All unit tests passing
- [ ] All E2E tests passing
- [ ] No console.error in production code
- [ ] Rate limiting verified in staging
- [ ] 2FA tested with new config
- [ ] Session validation tested with stale cookies
- [ ] CSRF tokens validated across origins
- [ ] Audit logs recording events correctly
- [ ] Error messages don't expose internals
- [ ] No sensitive data in logs
- [ ] Database indexes created

### Before Phase 2 Merge
- [ ] Code consolidation complete
- [ ] Type safety verified
- [ ] All imports updated
- [ ] Error boundaries working
- [ ] useAuth hook integrated
- [ ] No breaking changes

### Before Phase 3 Merge
- [ ] Feature fully tested
- [ ] Documentation updated
- [ ] User notifications working
- [ ] Edge cases handled

---

## Monitoring Setup

### Metrics to Monitor
```
auth_failed_login_attempts (counter)
auth_account_lockouts (counter)
auth_2fa_setup (counter)
auth_session_created (counter)
auth_session_invalidated (counter)
auth_audit_events (counter)
auth_rate_limit_exceeded (counter)
auth_password_reset_attempts (counter)
auth_email_verification (counter)
```

### Alerts to Configure
- [ ] 10+ failed login attempts in 5 minutes
- [ ] Account lockout events
- [ ] Admin role assigned
- [ ] Impersonation started
- [ ] Rate limiting triggered
- [ ] Session validation failures
- [ ] 2FA disable events

---

## Documentation Updates

- [ ] Update AGENTS.md with auth best practices
- [ ] Create AUTH_SECURITY_GUIDE.md for developers
- [ ] Document CSRF protection strategy
- [ ] Document audit logging system
- [ ] Create troubleshooting guide for auth issues
- [ ] Add auth architecture diagram to docs/

