# Phase 3.1: Login History & Device Management

## Overview
Track user logins with device metadata (OS, browser, location) and allow users to manage active sessions.

## Database Schema

### LoginHistory Model
```prisma
model LoginHistory {
  id                String    @id @default(cuid())
  userId            String
  ipAddress         String
  userAgent         String?
  deviceName        String?   // "Chrome on Windows"
  deviceType        String?   // "desktop" | "mobile" | "tablet"
  osName            String?   // "Windows", "macOS", "iOS", "Android"
  osVersion         String?
  browserName       String?   // "Chrome", "Safari", "Firefox", "Edge"
  browserVersion    String?
  country           String?   // Geolocation from IP
  city              String?
  latitude          Float?
  longitude         Float?
  isCurrentSession  Boolean   @default(false)
  lastActivityAt    DateTime?
  revokedAt         DateTime?
  revokedReason     String?
  createdAt         DateTime  @default(now())
  user              User      @relation("UserLoginHistory", ...)
}
```

## Server Logic

### `lib/auth/login-history.ts`
Core service for login tracking:
- `recordLogin(metadata)` — Create login record with parsed device info
- `getActiveDevices(userId)` — Fetch current active sessions
- `revokeSession(id, reason)` — Sign out a device
- `getLoginHistory(userId, limit)` — Fetch login history

### `lib/utils/user-agent.ts`
Parse user-agent strings:
- Detects: OS, browser, device type
- Returns: `ParsedUserAgent` with deviceName, osName, browserName, etc.

### `lib/utils/geolocation.ts`
IP-based geolocation:
- Uses ipapi.co (free, no auth required)
- Returns: country, city, latitude, longitude
- Skips private IPs (127.0.0.1, 10.x.x.x, etc.)

## API Routes

### `features/auth/api/devices.ts`

**GET** `/api/auth/devices/active`
- Returns active sessions for current user
- Response: `{ devices: LoginHistory[] }`

**GET** `/api/auth/devices/history?limit=20`
- Returns login history (default 20 records)
- Response: `{ history: LoginHistory[] }`

**POST** `/api/auth/devices/revoke/:id`
- Revoke a specific device session
- Body: `{ reason?: string }`
- Response: `{ revoked: LoginHistory }`

**POST** `/api/auth/devices/revoke-all-others`
- Sign out all devices except current
- Response: `{ message: string }`

## Client Hooks

### `features/auth/hooks/useDevices.ts`
React hook for device management:
```typescript
const { devices, loading, error, revokeDevice, revokeAllOthers, refetch } = useDevices();
```

## UI Components

### `features/auth/components/DeviceManagement.tsx`
Device management dashboard:
- Shows current device (highlighted)
- Lists other active devices with location
- Revoke individual devices
- Sign out all other devices
- Shows: device name, location, IP, last activity

## Integration Points

### 1. Record Login on Authentication
In your auth handler (e.g., `lib/auth/validate.ts` or login route):
```typescript
import { recordLogin } from '@/lib/auth/login-history';

// After successful login
await recordLogin({
  userId: user.id,
  ipAddress: getClientIp(request),
  userAgent: request.headers.get('user-agent') || undefined,
});
```

### 2. Add to Settings Page
```typescript
import { DeviceManagement } from '@/features/auth/components/DeviceManagement';

export default function SecuritySettings() {
  return (
    <div>
      <DeviceManagement />
    </div>
  );
}
```

### 3. Mount API Routes
In `app/api/[[...route]]/route.ts`:
```typescript
import deviceRouter from '@/features/auth/api/devices';

const app = new Hono()
  .route('/auth/devices', deviceRouter)
  // ... other routes
```

## Migration

Run:
```bash
bunx prisma migrate dev --name add_login_history
```

## Next Steps

### Phase 3.2: Account Lockout
- Track failed login attempts
- Temporary lockout after N failures
- Exponential backoff
- Admin unlock capability

### Future Enhancements
- [ ] Trusted device fingerprinting
- [ ] Suspicious login alerts
- [ ] Geographic anomaly detection
- [ ] Device naming by user
- [ ] Session activity timeline
- [ ] Concurrent session limits
