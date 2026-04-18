# API Key Management Feature

**Status:** Ready for implementation (requires database migration)  
**Purpose:** Allow developers to generate and use API keys for programmatic access

---

## Database Schema

Add to `prisma/schema.prisma`:

```prisma
model ApiKey {
  id          String   @id @default(cuid())
  name        String
  key         String   @unique // hashed key
  keyPreview  String   // first 8 chars for display
  userId      String
  isActive    Boolean  @default(true)
  lastUsedAt  DateTime?
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([key])
  @@map("api_key")
}
```

Add to User model:
```prisma
apiKeys             ApiKey[]
```

---

## API Endpoints

### GET /api/api-keys
List user's API keys

**Auth:** Required (session or API key)  
**CSRF:** Not required (GET request)

**Response:**
```json
{
  "data": [
    {
      "id": "key_123",
      "name": "Production API",
      "keyPreview": "sk_prod_",
      "isActive": true,
      "lastUsedAt": "2026-04-18T13:00:00Z",
      "expiresAt": null,
      "createdAt": "2026-04-10T00:00:00Z"
    }
  ]
}
```

---

### POST /api/api-keys
Create new API key

**Auth:** Required (session only, not API key)  
**CSRF:** Required

**Request:**
```json
{
  "name": "Production API",
  "expiresAt": "2026-12-31T23:59:59Z"  // optional
}
```

**Response:**
```json
{
  "data": {
    "id": "key_123",
    "name": "Production API",
    "key": "sk_prod_abcdef1234567890...",  // Only shown once!
    "keyPreview": "sk_prod_",
    "createdAt": "2026-04-18T13:00:00Z"
  }
}
```

---

### PATCH /api/api-keys/:id
Update API key

**Auth:** Required (session only)  
**CSRF:** Required

**Request:**
```json
{
  "name": "Updated Name",
  "isActive": false
}
```

**Response:**
```json
{
  "data": {
    "id": "key_123",
    "name": "Updated Name",
    "isActive": false,
    "updatedAt": "2026-04-18T13:00:00Z"
  }
}
```

---

### DELETE /api/api-keys/:id
Revoke API key

**Auth:** Required (session only)  
**CSRF:** Required

**Response:**
```json
{
  "success": true
}
```

---

## Usage

### Using API Key in Requests

All API requests support Bearer token authentication:

```bash
curl -X POST https://zolai.space/api/content/posts \
  -H "Authorization: Bearer sk_prod_abcdef1234567890..." \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

**Note:** API key requests skip CSRF validation (Bearer tokens are exempt)

---

## Security Features

✓ Keys are hashed with SHA-256 before storage  
✓ Only first 8 characters shown in UI  
✓ Full key only displayed once at creation  
✓ Expiry support (optional)  
✓ Active/inactive toggle  
✓ Last used tracking  
✓ Per-user isolation  
✓ Automatic cleanup on user deletion  

---

## Implementation Steps

1. **Add schema to prisma/schema.prisma**
   ```bash
   # Add ApiKey model and User.apiKeys relation
   ```

2. **Create migration**
   ```bash
   npx prisma migrate dev --name add_api_keys
   ```

3. **Regenerate Prisma client**
   ```bash
   npx prisma generate
   ```

4. **Uncomment API key router** in `features/api-keys/server/router.ts`

5. **Register in main router** (already done in `app/api/[[...route]]/route.ts`)

6. **Test**
   ```bash
   # Create key
   curl -X POST http://localhost:3000/api/api-keys \
     -H "Cookie: <session>" \
     -H "X-CSRF-Token: <token>" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test"}'
   
   # Use key
   curl -X GET http://localhost:3000/api/api-keys \
     -H "Authorization: Bearer <key>"
   ```

---

## CSRF Behavior

| Endpoint | Method | CSRF Required | Notes |
|----------|--------|---------------|-------|
| /api/api-keys | GET | No | Bearer tokens skip CSRF |
| /api/api-keys | POST | Yes | Session only (no API key) |
| /api/api-keys/:id | PATCH | Yes | Session only |
| /api/api-keys/:id | DELETE | Yes | Session only |

---

## Files

- `features/api-keys/server/router.ts` - API endpoints
- `lib/auth/api-key-guard.ts` - API key validation middleware
- `prisma/schema.prisma` - Database schema (needs update)

---

## Next Steps

1. Update Prisma schema
2. Run migration
3. Uncomment router code
4. Test locally
5. Deploy to production
