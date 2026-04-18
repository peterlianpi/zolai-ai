# CSRF Protection - Endpoint Audit

**Date:** 2026-04-18  
**Status:** ✅ All endpoints properly configured

---

## CSRF Middleware Configuration

**Location:** `lib/auth/csrf.ts`  
**Applied to:** All routes in `app/api/[[...route]]/route.ts`

### Middleware Logic
```
1. Skip GET/HEAD/OPTIONS/TRACE (read-only)
2. Skip /api/csrf-token (token endpoint)
3. Skip Bearer tokens (API key access)
4. Validate CSRF token for POST/PUT/PATCH/DELETE
```

---

## Endpoint Audit

### ✅ Public Endpoints (No Auth Required)

| Endpoint | Method | CSRF | Notes |
|----------|--------|------|-------|
| /api/csrf-token | GET | No | Token generation endpoint |
| /api/health | GET | No | Health check |
| /api/landing | GET | No | Landing page data |
| /api/site-settings | GET | No | Public settings |
| /api/dictionary | GET | No | Dictionary search |
| /api/grammar | GET | No | Grammar rules |
| /api/content/posts | GET | No | List posts |
| /api/content/news | GET | No | List news |
| /api/lessons | GET | No | List lessons |

---

### ✅ Protected Endpoints (Auth Required)

#### Content Management
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/content/posts | POST | ✅ | Session | Create post |
| /api/content/posts/:id | PUT | ✅ | Session | Update post |
| /api/content/posts/:id | DELETE | ✅ | Session | Delete post |
| /api/content/posts/:id | PATCH | ✅ | Session | Partial update |

#### User Profile
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/profile | GET | No | Session | Get profile |
| /api/profile | PUT | ✅ | Session | Update profile |
| /api/profile/email | PATCH | ✅ | Session | Change email |
| /api/profile/password | PATCH | ✅ | Session | Change password |

#### Settings
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/preferences | GET | No | Session | Get preferences |
| /api/preferences | PATCH | ✅ | Session | Update preferences |
| /api/site-settings | GET | No | Public | Public settings |
| /api/site-settings | PATCH | ✅ | Admin | Update settings |

#### Admin
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/admin/* | GET | No | Admin | List resources |
| /api/admin/* | POST | ✅ | Admin | Create resource |
| /api/admin/* | PUT | ✅ | Admin | Update resource |
| /api/admin/* | DELETE | ✅ | Admin | Delete resource |

#### Media
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/media | GET | No | Session | List media |
| /api/media | POST | ✅ | Session | Upload media |
| /api/media/:id | DELETE | ✅ | Session | Delete media |

#### Comments
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/comments | GET | No | Public | List comments |
| /api/comments | POST | ✅ | Session | Create comment |
| /api/comments/:id | DELETE | ✅ | Session | Delete comment |

#### Chat
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/chat | POST | ✅ | Session | Send message |
| /api/chat/sessions | GET | No | Session | List sessions |
| /api/chat/sessions | POST | ✅ | Session | Create session |

#### Lessons
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/lessons | GET | No | Public | List lessons |
| /api/lessons/:id | GET | No | Public | Get lesson |
| /api/lessons/:id/complete | POST | ✅ | Session | Mark complete |

#### Newsletter
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/newsletter/subscribe | POST | ✅ | Public | Subscribe |
| /api/newsletter/unsubscribe | POST | ✅ | Public | Unsubscribe |

#### Forms
| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/forms | GET | No | Public | List forms |
| /api/forms/:id/submit | POST | ✅ | Public | Submit form |

---

### ✅ API Key Endpoints (Bearer Token)

| Endpoint | Method | CSRF | Auth | Notes |
|----------|--------|------|------|-------|
| /api/api-keys | GET | No | Session | List keys |
| /api/api-keys | POST | ✅ | Session | Create key |
| /api/api-keys/:id | PATCH | ✅ | Session | Update key |
| /api/api-keys/:id | DELETE | ✅ | Session | Revoke key |

**Note:** Bearer token requests skip CSRF validation

---

## CSRF Token Input Methods

All endpoints accept CSRF tokens in multiple formats:

### 1. Header (Recommended for API)
```bash
curl -X POST /api/content/posts \
  -H "X-CSRF-Token: <token>" \
  -H "Content-Type: application/json"
```

### 2. Body (Recommended for Forms)
```bash
curl -X POST /api/content/posts \
  -H "Content-Type: application/json" \
  -d '{"csrf-token":"<token>","title":"Test"}'
```

### 3. Query Parameter
```bash
curl -X POST "/api/content/posts?csrf_token=<token>" \
  -H "Content-Type: application/json"
```

### 4. Form Data
```bash
curl -X POST /api/content/posts \
  -F "csrf-token=<token>" \
  -F "title=Test"
```

---

## Client-Side Integration

### Automatic (via Interceptor)
```typescript
// In app/providers.tsx - automatically adds token to all fetch requests
setupCSRFInterceptor();
```

### Manual (React Hook)
```typescript
import { useCSRFToken } from '@/lib/hooks/use-csrf-token';

function MyComponent() {
  const { token, fetchWithCSRF } = useCSRFToken();
  
  const handleSubmit = async () => {
    const response = await fetchWithCSRF('/api/content/posts', {
      method: 'POST',
      body: JSON.stringify({ title: 'Test' }),
    });
  };
}
```

### Form Wrapper
```typescript
import { CSRFForm } from '@/components/forms/csrf-form';

function MyForm() {
  return (
    <CSRFForm onSubmit={handleSubmit}>
      <input name="title" />
      <button type="submit">Submit</button>
    </CSRFForm>
  );
}
```

---

## Error Handling

### CSRF Token Invalid
```json
{
  "error": {
    "code": "CSRF_TOKEN_INVALID",
    "message": "Invalid or missing CSRF token. Please refresh the page."
  }
}
```

**Status:** 403 Forbidden

### Missing Token
Same as above - token is required for all state-changing requests

### Expired Token
Tokens last 24 hours. Get new token from `/api/csrf-token`

---

## Security Checklist

- ✅ Tokens are cryptographically random (32 bytes)
- ✅ Tokens are hashed before storage
- ✅ Tokens stored in httpOnly cookies (XSS protection)
- ✅ SameSite=Lax (CSRF protection)
- ✅ Secure flag in production
- ✅ 24-hour expiry
- ✅ Token validation on all state-changing requests
- ✅ Bearer tokens skip CSRF (API key access)
- ✅ GET/HEAD/OPTIONS/TRACE skip CSRF (read-only)
- ✅ Logging of CSRF violations

---

## Testing

### Local Testing
```bash
# Start dev server
npm run dev

# Get token
TOKEN=$(curl -s http://localhost:3000/api/csrf-token | jq -r '.token')

# Test with token (should pass CSRF, may fail auth)
curl -X POST http://localhost:3000/api/content/posts \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'

# Test without token (should fail CSRF)
curl -X POST http://localhost:3000/api/content/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

### Production Testing
```bash
# Get token
TOKEN=$(curl -s https://zolai.space/api/csrf-token | jq -r '.token')

# Test with token
curl -X POST https://zolai.space/api/content/posts \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

---

## Monitoring

### Check for CSRF Errors
```bash
ssh zolai "journalctl -u zolai -n 100 | grep CSRF"
```

### Expected Patterns
- `CSRF_TOKEN_INVALID` - Normal (invalid/missing token)
- `CSRF token violation` - Security event logged

### Alert Conditions
- Spike in CSRF errors (possible attack)
- Errors from specific IP (targeted attack)
- Errors on specific endpoint (misconfiguration)

---

## Deployment Checklist

- [x] CSRF middleware configured
- [x] All endpoints audited
- [x] Token generation working
- [x] Cookie handling correct
- [x] Client-side integration ready
- [x] Error handling implemented
- [x] Logging configured
- [ ] Production deployment
- [ ] Monitor logs for 24 hours
- [ ] User acceptance testing

---

## Summary

**All endpoints are properly configured for CSRF protection:**
- ✅ State-changing requests require CSRF token
- ✅ Read-only requests skip CSRF
- ✅ API key requests skip CSRF
- ✅ Multiple token input methods supported
- ✅ Secure cookie handling
- ✅ Client-side integration ready
- ✅ Error handling implemented
- ✅ Logging configured

**Status:** Ready for production deployment
