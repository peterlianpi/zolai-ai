# API Keys UI - Added to Settings Page

**Date:** 2026-04-18  
**Status:** ✅ Ready to use (UI component added)

---

## What's New

### API Keys Section in Settings
- Location: `/settings` → "API Keys" section
- Generate new API keys
- View existing keys
- Revoke keys
- Copy keys to clipboard
- Usage examples

---

## How to Use

### 1. Generate API Key
1. Go to `/settings`
2. Scroll to "API Keys" section
3. Enter a name (e.g., "Production API")
4. Click "Generate New Key"
5. Copy the key (shown only once!)

### 2. Use API Key
```bash
curl -X POST https://zolai.space/api/content/posts \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test"}'
```

### 3. Revoke Key
1. Go to `/settings`
2. Find the key in "Your API Keys"
3. Click trash icon to revoke

---

## Files Added

- `features/settings/components/api-keys-section.tsx` - UI component

---

## Files Modified

- `features/settings/components/user-settings-page.tsx` - Added API keys section

---

## Features

✅ Generate API keys  
✅ List existing keys  
✅ Revoke keys  
✅ Copy to clipboard  
✅ Usage examples  
✅ CSRF protection (automatic)  
✅ Error handling  
✅ Toast notifications  

---

## Backend Status

⚠️ **Note:** Backend API key endpoints require database migration:

```bash
# 1. Run migration
npx prisma migrate dev --name add_api_keys

# 2. Regenerate Prisma
npx prisma generate

# 3. Uncomment in app/api/[[...route]]/route.ts:
# - import apiKeys from "@/features/api-keys/server/router"
# - .route("/api-keys", apiKeys)
# - import { apiKeyMiddleware } from "@/lib/auth/api-key-guard"
# - app.use("*", apiKeyMiddleware)

# 4. Deploy
npm run build && bash deploy-ssh.sh
```

---

## Current Limitations

- UI component created but backend endpoints commented out
- Requires database migration to activate
- API key validation middleware not active yet

---

## Next Steps

1. Run Prisma migration
2. Uncomment backend code
3. Deploy to production
4. Test API key generation and usage

---

## Timeline

- UI: ✅ Complete
- Backend: ⏳ Pending migration
- Deployment: ⏳ After migration

---

## Testing

Once backend is activated:

```bash
# Generate key via UI
# Then test:
curl -X GET https://zolai.space/api/api-keys \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

## Security

✅ Keys are hashed (SHA-256)  
✅ Only shown once at creation  
✅ Can be revoked anytime  
✅ Optional expiry support  
✅ CSRF protected  
✅ Bearer token auth  

---

## Support

See `API_KEY_FEATURE.md` for full documentation
