# Phase 4: Email & Telegram Notifications

## Overview
Complete notification system with Email, Telegram, and in-app notifications for all security events.

## Architecture

```
Security Event
    ↓
notifySecurityEvent()
    ├→ AuditLog (compliance)
    ├→ SecurityEvent (monitoring)
    ├→ Notification (in-app)
    ├→ Email (user notification)
    └→ Telegram (critical only)
```

## Email Service

### `lib/email.ts`
- SMTP configuration
- `sendEmail(options)` — Send email
- `buildSecurityEmailHtml()` — HTML template builder

### `lib/email-templates.ts`
Pre-built templates for each event:
- `suspiciousLoginEmail()` — Suspicious login with confirm/deny links
- `accountLockedEmail()` — Account locked notification
- `deviceRevokedEmail()` — Session revoked
- `passwordChangedEmail()` — Password changed
- `emailChangedEmail()` — Email changed (critical)
- `twoFactorEnabledEmail()` — 2FA enabled
- `twoFactorDisabledEmail()` — 2FA disabled (critical)

### `lib/services/email-notifications.ts`
Email sending functions:
- `sendSuspiciousLoginEmail()` — With confirm/deny URLs
- `sendAccountLockedEmail()` — With unlock time
- `sendDeviceRevokedEmail()` — With device name
- `sendPasswordChangedEmail()`
- `sendEmailChangedEmail()` — With new email
- `sendTwoFactorEnabledEmail()`
- `sendTwoFactorDisabledEmail()`

## Notification Channels

| Channel | Trigger | Format | Retry |
|---------|---------|--------|-------|
| In-App | All events | Text | N/A |
| Email | All events | HTML | 1 attempt |
| Telegram | CRITICAL only | HTML | 3 attempts |

## Configuration

### Environment Variables
```bash
# SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com

# Telegram
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# App
NEXT_PUBLIC_APP_URL=https://example.com
```

### Gmail Setup
1. Enable 2FA on Gmail
2. Generate app password: https://myaccount.google.com/apppasswords
3. Use app password in `SMTP_PASS`

## Event Types & Notifications

### 1. Suspicious Login
**Severity:** HIGH/CRITICAL (based on risk score)
**Channels:** In-App + Email + Telegram (if critical)
**Email:** Includes confirm/deny links
```
Subject: 🔒 Suspicious Login Detected
Body: Location, risk score, action buttons
```

### 2. Account Locked
**Severity:** HIGH
**Channels:** In-App + Email
**Email:** Includes unlock time
```
Subject: 🔒 Account Locked
Body: Reason, unlock time, recovery steps
```

### 3. Device Revoked
**Severity:** MEDIUM
**Channels:** In-App + Email
**Email:** Device name, recovery steps
```
Subject: 🔒 Session Revoked
Body: Device name, security recommendations
```

### 4. Password Changed
**Severity:** MEDIUM
**Channels:** In-App + Email
**Email:** Confirmation
```
Subject: 🔒 Password Changed
Body: Confirmation, alert if unauthorized
```

### 5. Email Changed
**Severity:** HIGH
**Channels:** In-App + Email + Telegram
**Email:** New email, urgent action required
```
Subject: 🔒 Email Address Changed
Body: New email, alert if unauthorized
```

### 6. 2FA Enabled
**Severity:** LOW
**Channels:** In-App + Email
**Email:** Confirmation, backup codes reminder
```
Subject: 🔒 Two-Factor Authentication Enabled
Body: Confirmation, backup code reminder
```

### 7. 2FA Disabled
**Severity:** HIGH
**Channels:** In-App + Email + Telegram
**Email:** Alert, recovery steps
```
Subject: 🔒 Two-Factor Authentication Disabled
Body: Alert, recovery steps
```

## Usage Examples

### Example 1: Send Suspicious Login Notification
```typescript
import { notifySuspiciousLogin } from '@/lib/auth/security-notifications';

await notifySuspiciousLogin(
  userId,
  '203.0.113.0',
  'US',
  'New York',
  75 // risk score
);

// Sends:
// - In-app notification
// - Email with confirm/deny links
// - Telegram alert (critical)
// - Logs to AuditLog + SecurityEvent
```

### Example 2: Send Account Locked Notification
```typescript
import { notifyAccountLocked } from '@/lib/auth/security-notifications';

await notifyAccountLocked(userId, ipAddress);

// Sends:
// - In-app notification
// - Email with unlock time
// - Logs to AuditLog + SecurityEvent
```

### Example 3: Send Email Changed Notification
```typescript
import { notifyEmailChanged } from '@/lib/auth/security-notifications';

await notifyEmailChanged(userId, 'new@example.com', ipAddress);

// Sends:
// - In-app notification
// - Email to old address
// - Telegram alert (critical)
// - Logs to AuditLog + SecurityEvent
```

## Email Confirmation Links

### Suspicious Login Confirmation
```
GET /auth/alerts/:alertId/confirm
GET /auth/alerts/:alertId/deny
```

**Confirm:** Marks alert as resolved, no action
**Deny:** Revokes all sessions, forces re-auth

## Testing

### Test Email Sending
```typescript
import { sendEmail } from '@/lib/email';

const sent = await sendEmail({
  to: 'test@example.com',
  subject: 'Test Email',
  html: '<p>This is a test</p>',
});

console.log(sent); // true/false
```

### Test Notification Flow
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
// 1. In-app notification created
// 2. Email sent
// 3. AuditLog entry created
// 4. SecurityEvent created
// 5. Telegram sent (if critical)
```

### Verify Email Delivery
```typescript
// Check Notification table
const notif = await prisma.notification.findFirst({
  where: { userId: 'user-123' },
  orderBy: { createdAt: 'desc' },
});

// Check SecurityEvent
const event = await prisma.securityEvent.findFirst({
  where: { userId: 'user-123' },
  orderBy: { createdAt: 'desc' },
});

// Check AuditLog
const log = await prisma.auditLog.findFirst({
  where: { entityType: 'User', entityId: 'user-123' },
  orderBy: { createdAt: 'desc' },
});
```

## Troubleshooting

### Email Not Sending
1. Check SMTP credentials
2. Verify SMTP_HOST and SMTP_PORT
3. Check firewall/network
4. Enable "Less secure apps" (Gmail)
5. Check logs for errors

### Telegram Not Sending
1. Verify TELEGRAM_BOT_TOKEN
2. Verify TELEGRAM_CHAT_ID
3. Check bot permissions
4. Check network connectivity

### In-App Notification Not Showing
1. Verify notification created in DB
2. Check notification UI component
3. Verify user ID matches
4. Check browser console for errors

## Email Templates

All templates include:
- Security icon (🔒)
- Clear title
- Detailed message
- Action buttons (if applicable)
- Security recommendations
- Footer with support info

### Template Customization
Edit `lib/email-templates.ts` to customize:
- Colors
- Branding
- Copy
- Links
- Styling

## Rate Limiting

Email sending is not rate-limited by default. Consider adding:
- Max 5 emails per user per hour
- Batch notifications
- Digest emails

## Next Steps

### Phase 5: SMS Notifications (Optional)
- [ ] Add SMS service (Twilio)
- [ ] SMS on critical events
- [ ] SMS verification codes

### Phase 6: Notification Preferences
- [ ] User notification settings
- [ ] Email frequency control
- [ ] Channel preferences
- [ ] Quiet hours

### Phase 7: Analytics
- [ ] Email delivery tracking
- [ ] Open rates
- [ ] Click rates
- [ ] Bounce handling

---

**Status:** Phase 4 Complete — Email + Telegram + In-App
**Last Updated:** 2026-04-15
**Build Status:** ✅ Ready
**Test Status:** ✅ Ready
