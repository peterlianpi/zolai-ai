# Phase 3.3: Suspicious Login Alerts

## Overview
Detect unusual login patterns (new locations, unusual times, new devices) and alert users with risk scoring.

## Risk Scoring

Each suspicious factor adds to risk score (0-100):
- **New Location** (+30) — Login from country/city not in history
- **Unusual Time** (+20) — Login >6 hours outside typical pattern
- **New Device** (+25) — Login from new IP address
- **Impossible Travel** (+25) — >900km in <1 hour

**Alert Threshold:** Risk score ≥ 40
**Critical Alert:** Risk score ≥ 70

## Server Logic

### `lib/auth/suspicious-login.ts`

**checkSuspiciousLogin(userId, ipAddress, country, city)**
- Analyzes login for suspicious patterns
- Returns: `{ isUnusualLocation, isUnusualTime, isNewDevice, riskScore, reasons }`

**createSuspiciousLoginAlert(userId, check, ipAddress, country, city)**
- Creates security alert if risk ≥ 40
- Logs security event
- Returns alert record

**getUserSecurityAlerts(userId, limit)**
- Fetch user's security alerts
- Returns last N alerts

**markAlertAsRead(alertId)**
- Mark alert as read

**resolveAlert(alertId)**
- Mark alert as resolved

## API Routes

### `features/auth/api/alerts.ts`

**GET** `/api/auth/alerts`
- Returns user's security alerts
- Response: `{ alerts: SecurityAlert[], unread: number }`

**POST** `/api/auth/alerts/:id/read`
- Mark alert as read

**POST** `/api/auth/alerts/:id/resolve`
- Resolve alert
- Body: `{ action?: 'confirm_login' | 'deny_login' }`

## Client Hook

### `features/auth/hooks/useSecurityAlerts.ts`

```typescript
const { alerts, unread, loading, markAsRead, resolveAlert, refetch } = useSecurityAlerts();
```

- Auto-polls every 30 seconds
- Tracks unread count
- Methods to mark/resolve alerts

## UI Component

### `features/auth/components/SecurityAlerts.tsx`

- Shows unresolved alerts
- Color-coded by severity
- User can confirm or deny login
- "Deny" action revokes all sessions

## Integration Points

### 1. On Login (After Successful Auth)
```typescript
import { checkSuspiciousLogin, createSuspiciousLoginAlert } from '@/lib/auth/suspicious-login';

// After password verified
const check = await checkSuspiciousLogin(
  user.id,
  ipAddress,
  location?.country,
  location?.city
);

if (check.riskScore >= 40) {
  await createSuspiciousLoginAlert(
    user.id,
    check,
    ipAddress,
    location?.country,
    location?.city
  );
}
```

### 2. Mount API Routes
In `app/api/[[...route]]/route.ts`:
```typescript
import alertsRouter from '@/features/auth/api/alerts';

const app = new Hono()
  .route('/auth/alerts', alertsRouter)
  // ... other routes
```

### 3. Add to Dashboard
```typescript
import { SecurityAlerts } from '@/features/auth/components/SecurityAlerts';

export function SecurityDashboard() {
  return (
    <div>
      <SecurityAlerts />
    </div>
  );
}
```

### 4. Add to Navbar (Unread Count)
```typescript
import { useSecurityAlerts } from '@/features/auth/hooks/useSecurityAlerts';

export function NavbarAlerts() {
  const { unread } = useSecurityAlerts();
  
  return (
    <button className="relative">
      <Bell className="h-5 w-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {unread}
        </span>
      )}
    </button>
  );
}
```

## Detection Logic

### Unusual Location
- Checks if country/city combo exists in last 10 logins
- First login from new location = suspicious

### Unusual Time
- Calculates average login hour from history
- Flags if >6 hours outside typical pattern
- Example: User typically logs in 9am-5pm, now logging in at 2am

### New Device
- Checks if IP address exists in recent logins
- New IP = new device

### Impossible Travel
- Calculates distance between last login and current
- Flags if >900km in <1 hour
- Uses Haversine formula for distance

## User Actions

### Confirm Login
- Marks alert as resolved
- No further action

### Deny Login
- Marks alert as resolved
- Revokes all active sessions
- Forces re-authentication
- Sends email notification

## Security Events

Automatically logged to `SecurityEvent`:
- `SUSPICIOUS_LOGIN` — Suspicious pattern detected
- Includes risk score and reasons

## Testing

```typescript
// Simulate suspicious login
const check = await checkSuspiciousLogin(
  userId,
  '203.0.113.0', // New IP
  'US',
  'New York'
);

console.log(check.riskScore); // 55+ (new location + new device)
console.log(check.reasons); // ["Login from new location", "Login from new device"]

// Create alert
const alert = await createSuspiciousLoginAlert(
  userId,
  check,
  '203.0.113.0',
  'US',
  'New York'
);
```

## Next Steps

### Phase 3.4: Email Notifications
- Send email on suspicious login
- Include "Confirm" / "Deny" links
- One-click verification

### Future Enhancements
- [ ] SMS verification
- [ ] Push notifications
- [ ] Trusted device fingerprinting
- [ ] VPN detection
- [ ] Proxy detection
- [ ] Tor exit node detection
- [ ] Machine learning anomaly detection
- [ ] Behavioral biometrics
