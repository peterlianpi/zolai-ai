# Phase 3.2: Account Lockout

## Overview
Prevent brute force attacks with automatic temporary account lockouts after N failed login attempts.

## Configuration

```typescript
// lib/auth/account-lockout.ts
const MAX_ATTEMPTS = 5;              // Lock after 5 failed attempts
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;  // 15 minutes
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;    // Count attempts in 15-min window
```

## Database Schema

### User Model Updates
```prisma
model User {
  // ... existing fields
  accountLocked         Boolean   @default(false)
  lockoutExpires        DateTime?
  failedLoginAttempts   Int       @default(0)
  lastFailedLoginAt     DateTime?
}
```

### LoginAttempt Model
```prisma
model LoginAttempt {
  id        String    @id @default(cuid())
  email     String
  ipAddress String
  success   Boolean
  reason    String?   // "invalid_password", "account_locked", etc.
  createdAt DateTime  @default(now())

  @@index([email, createdAt])
  @@index([ipAddress, createdAt])
  @@index([success])
}
```

## Server Logic

### `lib/auth/account-lockout.ts`

**recordLoginAttempt(email, ipAddress, success, reason)**
- Log every login attempt (success or failure)
- Tracks IP address for rate limiting

**getFailedAttempts(email, minutes)**
- Count failed attempts in time window
- Returns number of failures

**isAccountLocked(userId)**
- Check if account is locked
- Auto-unlock if lockout expired
- Returns boolean

**lockAccount(userId, reason)**
- Lock account immediately
- Set lockout expiration (15 min)
- Log security event

**incrementFailedAttempts(userId)**
- Increment counter
- Auto-lock if threshold reached

**resetFailedAttempts(userId)**
- Clear counter on successful login

**unlockAccount(userId)**
- Manually unlock (admin only)
- Reset all counters

## API Routes

### `features/auth/api/lockout.ts`

**GET** `/api/auth/lockout/status/:userId` (admin only)
- Returns lockout status
- Response: `{ accountLocked, lockoutExpires, failedLoginAttempts, recentFailedAttempts }`

**POST** `/api/auth/lockout/unlock/:userId` (admin only)
- Manually unlock account
- Body: `{ reason?: string }`

**GET** `/api/auth/lockout/attempts/:email` (admin only)
- Fetch login attempt history
- Returns last 50 attempts

## Integration Points

### 1. On Failed Login
In your login handler:
```typescript
import { recordLoginAttempt, incrementFailedAttempts, isAccountLocked } from '@/lib/auth/account-lockout';

// Check if already locked
if (await isAccountLocked(user.id)) {
  return error(c, 'Account is locked. Try again later.');
}

// Invalid password
if (!passwordValid) {
  await recordLoginAttempt(email, ipAddress, false, 'invalid_password');
  await incrementFailedAttempts(user.id);
  return error(c, 'Invalid credentials');
}
```

### 2. On Successful Login
```typescript
import { recordLoginAttempt, resetFailedAttempts } from '@/lib/auth/account-lockout';

// Success
await recordLoginAttempt(email, ipAddress, true);
await resetFailedAttempts(user.id);
```

### 3. Mount API Routes
In `app/api/[[...route]]/route.ts`:
```typescript
import lockoutRouter from '@/features/auth/api/lockout';

const app = new Hono()
  .route('/auth/lockout', lockoutRouter)
  // ... other routes
```

### 4. Add to Admin Panel
```typescript
import { AccountLockoutStatus } from '@/features/auth/components/AccountLockoutStatus';

export function UserSecurityPanel({ userId }: { userId: string }) {
  return (
    <div>
      <AccountLockoutStatus userId={userId} />
    </div>
  );
}
```

## Security Events

Automatically logged to `SecurityEvent`:
- `ACCOUNT_LOCKED` — Account locked due to failed attempts
- `ACCOUNT_UNLOCKED` — Account manually unlocked by admin

## Behavior

### Failed Login Attempt
1. Record attempt in `LoginAttempt`
2. Increment `User.failedLoginAttempts`
3. If count >= 5:
   - Set `accountLocked = true`
   - Set `lockoutExpires = now + 15 min`
   - Log security event

### Successful Login
1. Record attempt in `LoginAttempt`
2. Reset `failedLoginAttempts = 0`
3. Clear `lastFailedLoginAt`

### Lockout Expiration
- Automatic on next login attempt
- Manual unlock via admin API

## Migration

```bash
bunx prisma migrate dev --name add_account_lockout
```

## Testing

```typescript
// Simulate 5 failed attempts
for (let i = 0; i < 5; i++) {
  await incrementFailedAttempts(userId);
}

// Check locked
const locked = await isAccountLocked(userId);
console.log(locked); // true

// Unlock
await unlockAccount(userId);
```

## Next Steps

### Phase 3.3: Suspicious Login Alerts
- Detect unusual locations
- Detect unusual times
- Send email alerts
- Require additional verification

### Future Enhancements
- [ ] IP-based rate limiting
- [ ] Geographic anomaly detection
- [ ] Device fingerprinting
- [ ] Captcha on repeated failures
- [ ] SMS verification on lockout
- [ ] Exponential backoff
