# Phase 3: Unified Security Notification System

## Overview
Integrated notification system that logs to AuditLog, SecurityEvent, in-app Notification, and Telegram (critical only).

## Architecture

```
Security Event
    ↓
notifySecurityEvent()
    ├→ AuditLog (audit trail)
    ├→ SecurityEvent (security log)
    ├→ Notification (in-app)
    └→ Telegram (critical only)
```

## Core Service

### `lib/auth/security-notifications.ts`

**notifySecurityEvent(input)**
- Unified entry point for all security notifications
- Logs to all 4 systems automatically
- Input: `{ userId, type, severity, title, message, ipAddress, userAgent, details }`

**Specialized Functions:**
- `notifySuspiciousLogin()` — Suspicious login detected
- `notifyAccountLocked()` — Account locked
- `notifyDeviceRevoked()` — Session revoked
- `notifyPasswordChanged()` — Password changed
- `notifyEmailChanged()` — Email changed
- `notifyTwoFactorEnabled()` — 2FA enabled
- `notifyTwoFactorDisabled()` — 2FA disabled

## Integration Points

### Phase 3.1: Login History & Device Management

**On Device Revocation:**
```typescript
import { revokeSession } from '@/lib/auth/login-history';

// Automatically calls notifyDeviceRevoked()
await revokeSession(loginHistoryId, 'User revoked device');
```

### Phase 3.2: Account Lockout

**On Account Lock:**
```typescript
import { lockAccount } from '@/lib/auth/account-lockout';

// Automatically calls notifyAccountLocked()
await lockAccount(userId);
```

### Phase 3.3: Suspicious Login Alerts

**On Suspicious Login:**
```typescript
import { createSuspiciousLoginAlert } from '@/lib/auth/suspicious-login';

// Automatically calls notifySuspiciousLogin()
await createSuspiciousLoginAlert(userId, check, ipAddress, country, city);
```

## Logging Destinations

### 1. AuditLog
- **Table:** `audit_log`
- **Purpose:** Compliance & audit trail
- **Fields:** action, entityType, entityId, oldValues, newValues, ipAddress, userAgent, createdBy
- **Retention:** Permanent

### 2. SecurityEvent
- **Table:** `security_event`
- **Purpose:** Security monitoring & analysis
- **Fields:** type, userId, ip, userAgent, severity, details
- **Retention:** 90 days (configurable)
- **Indexed:** type, severity, userId, createdAt

### 3. Notification (In-App)
- **Table:** `notification`
- **Purpose:** User-facing alerts
- **Fields:** title, description, type, severity, read, readAt
- **Retention:** Until user deletes
- **UI:** NotificationBell component

### 4. Telegram
- **Destination:** Telegram chat
- **Trigger:** Severity = CRITICAL only
- **Format:** HTML formatted message
- **Retry:** 3 attempts with backoff

## Severity Levels

| Level | Trigger | Notification | Telegram | Color |
|-------|---------|--------------|----------|-------|
| LOW | Info events | ✓ | ✗ | Blue |
| MEDIUM | Device changes | ✓ | ✗ | Yellow |
| HIGH | Suspicious/lockout | ✓ | ✗ | Orange |
| CRITICAL | High-risk events | ✓ | ✓ | Red |

## Event Types

```typescript
type SecurityEventType =
  | 'SUSPICIOUS_LOGIN'
  | 'ACCOUNT_LOCKED'
  | 'DEVICE_REVOKED'
  | 'PASSWORD_CHANGED'
  | 'EMAIL_CHANGED'
  | 'TWO_FACTOR_ENABLED'
  | 'TWO_FACTOR_DISABLED'
  | 'BRUTE_FORCE'
  | 'IP_BLOCKED'
  | 'INVALID_TOKEN'
  | 'ACCOUNT_UNLOCKED'
  | 'DEVICE_SESSION_CREATED'
  | 'DEVICE_SESSION_REVOKED'
  | 'ALL_OTHER_SESSIONS_REVOKED'
  | 'PASSWORD_BREACH_DETECTED'
  | 'NEW_DEVICE_LOGIN'
  | 'UNUSUAL_LOCATION_LOGIN';
```

## Usage Examples

### Example 1: Suspicious Login
```typescript
import { notifySuspiciousLogin } from '@/lib/auth/security-notifications';

// After detecting suspicious login
await notifySuspiciousLogin(
  userId,
  '203.0.113.0',
  'US',
  'New York',
  65 // risk score
);

// Logs to:
// - AuditLog: action=UPDATE, entityType=User
// - SecurityEvent: type=SUSPICIOUS_LOGIN, severity=HIGH
// - Notification: "Suspicious Login Detected"
// - Telegram: (not sent, severity < CRITICAL)
```

### Example 2: Account Locked
```typescript
import { lockAccount } from '@/lib/auth/account-lockout';

// After 5 failed attempts
await lockAccount(userId);

// Logs to:
// - AuditLog: action=UPDATE, entityType=User
// - SecurityEvent: type=ACCOUNT_LOCKED, severity=HIGH
// - Notification: "Account Locked"
// - Telegram: (not sent, severity < CRITICAL)
```

### Example 3: Device Revoked
```typescript
import { revokeSession } from '@/lib/auth/login-history';

// User revokes a device
await revokeSession(loginHistoryId, 'User revoked device');

// Logs to:
// - AuditLog: action=UPDATE, entityType=User
// - SecurityEvent: type=DEVICE_REVOKED, severity=MEDIUM
// - Notification: "Session Revoked"
// - Telegram: (not sent, severity < CRITICAL)
```

### Example 4: Email Changed (Critical)
```typescript
import { notifyEmailChanged } from '@/lib/auth/security-notifications';

// User changes email
await notifyEmailChanged(userId, 'new@example.com', ipAddress);

// Logs to:
// - AuditLog: action=UPDATE, entityType=User
// - SecurityEvent: type=EMAIL_CHANGED, severity=HIGH
// - Notification: "Email Address Changed"
// - Telegram: (not sent, severity < CRITICAL)
```

## Querying Logs

### Get User's Security Events
```typescript
const events = await prisma.securityEvent.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 50,
});
```

### Get User's Audit Trail
```typescript
const logs = await prisma.auditLog.findMany({
  where: { createdById: userId },
  orderBy: { createdAt: 'desc' },
  take: 50,
});
```

### Get User's Notifications
```typescript
const notifications = await prisma.notification.findMany({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  take: 50,
});
```

### Get Critical Events (Last 24h)
```typescript
const critical = await prisma.securityEvent.findMany({
  where: {
    severity: 'CRITICAL',
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
  orderBy: { createdAt: 'desc' },
});
```

## Admin Dashboard

### Security Events View
```typescript
import { SecurityEventsTable } from '@/features/admin/components/SecurityEventsTable';

export function AdminSecurityDashboard() {
  return (
    <div>
      <SecurityEventsTable />
    </div>
  );
}
```

### User Security Audit
```typescript
import { UserAuditTrail } from '@/features/admin/components/UserAuditTrail';

export function UserSecurityAudit({ userId }: { userId: string }) {
  return (
    <div>
      <UserAuditTrail userId={userId} />
    </div>
  );
}
```

## Configuration

### Environment Variables
```bash
# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# Notification
NOTIFICATION_EMAIL_FROM=security@example.com
NOTIFICATION_SMTP_HOST=...
```

### Monitoring Config
```typescript
// lib/config/monitoring.ts
export const monitorConfig = {
  criticalChatIds: ['123456789'],
  warningChatIds: ['987654321'],
  infoChatIds: ['555555555'],
  alertQuietHoursStart: 22, // 10 PM
  alertQuietHoursEnd: 8,    // 8 AM
  telegramTimeoutMs: 5000,
  telegramDisableWebPreview: true,
};
```

## Retention Policies

| Table | Retention | Reason |
|-------|-----------|--------|
| AuditLog | Permanent | Compliance |
| SecurityEvent | 90 days | Analysis |
| Notification | Until deleted | User preference |
| LoginHistory | 1 year | Device tracking |
| LoginAttempt | 90 days | Brute force detection |

## Testing

### Test Suspicious Login Notification
```typescript
import { notifySuspiciousLogin } from '@/lib/auth/security-notifications';

await notifySuspiciousLogin(
  'user-123',
  '203.0.113.0',
  'US',
  'New York',
  75
);

// Verify:
// 1. SecurityEvent created
// 2. AuditLog created
// 3. Notification created
// 4. Telegram sent (critical)
```

### Verify Logs
```typescript
// Check SecurityEvent
const event = await prisma.securityEvent.findFirst({
  where: { type: 'SUSPICIOUS_LOGIN' },
  orderBy: { createdAt: 'desc' },
});

// Check AuditLog
const log = await prisma.auditLog.findFirst({
  where: { entityType: 'User' },
  orderBy: { createdAt: 'desc' },
});

// Check Notification
const notif = await prisma.notification.findFirst({
  where: { userId: 'user-123' },
  orderBy: { createdAt: 'desc' },
});
```

## Next Steps

### Phase 4: Email Notifications
- [ ] Send email on suspicious login
- [ ] One-click confirmation links
- [ ] Email templates

### Phase 5: SMS Notifications
- [ ] SMS on critical events
- [ ] SMS verification codes
- [ ] SMS alerts

### Phase 6: Analytics
- [ ] Security event dashboard
- [ ] Threat analysis
- [ ] Anomaly detection
- [ ] Reporting

---

**Status:** Unified notification system integrated with Phase 3
**Last Updated:** 2026-04-15
