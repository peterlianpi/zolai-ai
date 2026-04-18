# Phase 4 Integration Checklist

## Setup

### 1. Install Dependencies
```bash
bun add nodemailer
bun add -D @types/nodemailer
```

### 2. Environment Variables
```bash
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com

# Telegram (already configured)
TELEGRAM_BOT_TOKEN=...
TELEGRAM_CHAT_ID=...

# App URL
NEXT_PUBLIC_APP_URL=https://example.com
```

### 3. Gmail Setup (if using Gmail)
1. Go to https://myaccount.google.com/apppasswords
2. Select "Mail" and "Windows Computer"
3. Generate app password
4. Use generated password in `SMTP_PASS`

## Integration Points

### Phase 3.1: Login History & Device Management
**File:** `lib/auth/login-history.ts`
- ✅ Already integrated
- Calls `notifyDeviceRevoked()` on revocation

### Phase 3.2: Account Lockout
**File:** `lib/auth/account-lockout.ts`
- ✅ Already integrated
- Calls `notifyAccountLocked()` on lock

### Phase 3.3: Suspicious Login Alerts
**File:** `lib/auth/suspicious-login.ts`
- ✅ Already integrated
- Calls `notifySuspiciousLogin()` on detection

## Testing

### Test 1: Email Configuration
```bash
# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
transporter.verify((err, success) => {
  if (err) console.error('SMTP Error:', err);
  else console.log('SMTP OK:', success);
});
"
```

### Test 2: Send Test Email
```typescript
import { sendEmail } from '@/lib/email';

const sent = await sendEmail({
  to: 'your-email@example.com',
  subject: 'Test Email',
  html: '<p>This is a test email</p>',
});

console.log('Email sent:', sent);
```

### Test 3: Trigger Suspicious Login
```typescript
import { notifySuspiciousLogin } from '@/lib/auth/security-notifications';

await notifySuspiciousLogin(
  'user-id',
  '203.0.113.0',
  'US',
  'New York',
  75
);

// Check:
// 1. In-app notification in DB
// 2. Email in inbox
// 3. Telegram message (if critical)
// 4. AuditLog entry
// 5. SecurityEvent entry
```

### Test 4: Verify All Channels
```typescript
// Check in-app notification
const notif = await prisma.notification.findFirst({
  where: { userId: 'user-id' },
  orderBy: { createdAt: 'desc' },
});
console.log('Notification:', notif);

// Check security event
const event = await prisma.securityEvent.findFirst({
  where: { userId: 'user-id' },
  orderBy: { createdAt: 'desc' },
});
console.log('SecurityEvent:', event);

// Check audit log
const log = await prisma.auditLog.findFirst({
  where: { entityId: 'user-id' },
  orderBy: { createdAt: 'desc' },
});
console.log('AuditLog:', log);
```

## Deployment

### Pre-Deployment
- [ ] SMTP credentials configured
- [ ] Telegram bot token configured
- [ ] Email templates reviewed
- [ ] Test email sent successfully
- [ ] Notification UI working
- [ ] All migrations applied

### Post-Deployment
- [ ] Monitor email delivery
- [ ] Check Telegram alerts
- [ ] Verify in-app notifications
- [ ] Monitor error logs
- [ ] Test with real user

## Monitoring

### Email Delivery Issues
```typescript
// Check failed emails
const events = await prisma.securityEvent.findMany({
  where: {
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
  orderBy: { createdAt: 'desc' },
});

// Check for errors in logs
console.log(events);
```

### Telegram Delivery Issues
```typescript
// Check Telegram alerts
const criticalEvents = await prisma.securityEvent.findMany({
  where: {
    severity: 'CRITICAL',
    createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  },
});

console.log(criticalEvents);
```

## Customization

### Change Email Template
Edit `lib/email-templates.ts`:
```typescript
export function suspiciousLoginEmail(...): string {
  return buildSecurityEmailHtml(
    'Custom Title',
    'Custom message',
    confirmUrl,
    'Custom Button Text'
  );
}
```

### Change Email Styling
Edit `lib/email.ts` `buildSecurityEmailHtml()`:
```typescript
// Modify CSS in template
.button {
  background: #your-color;
  // ...
}
```

### Add New Event Type
1. Add to `SecurityEventType` enum in schema
2. Create email template in `lib/email-templates.ts`
3. Create send function in `lib/services/email-notifications.ts`
4. Create notify function in `lib/auth/security-notifications.ts`

## Troubleshooting

### "SMTP connection failed"
- Check SMTP credentials
- Verify firewall allows SMTP port
- Check Gmail app password (not regular password)

### "Email not received"
- Check spam folder
- Verify recipient email
- Check SMTP_FROM is valid
- Check email logs

### "Telegram not sending"
- Verify bot token
- Verify chat ID
- Check bot has permission to send
- Check network connectivity

### "In-app notification not showing"
- Check notification created in DB
- Verify user ID
- Check notification UI component
- Check browser console

## Performance

### Email Sending
- Non-blocking (fire and forget)
- 1 attempt per event
- ~1-2 seconds per email

### Telegram Sending
- Non-blocking (fire and forget)
- 3 attempts with backoff
- ~1-3 seconds per message

### Database
- Minimal overhead
- Indexed queries
- No performance impact

## Security

### Email Security
- SMTP over TLS
- No sensitive data in subject
- HTML sanitized
- Links use HTTPS

### Telegram Security
- Bot token in env
- Chat ID in env
- No sensitive data in messages
- HTML escaped

### Data Privacy
- User email not logged
- Notification content logged
- Audit trail maintained
- GDPR compliant

---

**Status:** Phase 4 Ready for Integration
**Last Updated:** 2026-04-15
