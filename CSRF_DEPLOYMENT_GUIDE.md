# CSRF Protection - Deployment Guide

**Status:** ✅ Ready for Production  
**Testing:** All 5 tests passed locally  
**Risk Level:** Low (backward compatible)

---

## What Changed

### New Files
- `features/security/server/csrf-router.ts` - CSRF token endpoint
- `lib/middleware/csrf-interceptor.ts` - Fetch interceptor
- `components/forms/csrf-form.tsx` - Form wrapper component

### Modified Files
- `lib/auth/csrf.ts` - Added endpoint to skip list
- `lib/hooks/use-csrf-token.ts` - Enhanced with fetchWithCSRF
- `app/providers.tsx` - Added interceptor setup

---

## How It Works

### For API Requests
1. Client calls `/api/csrf-token` → gets token + cookie
2. Client sends POST/PUT/PATCH/DELETE with `X-CSRF-Token` header
3. Server validates token matches cookie
4. Request proceeds or returns 403

### For Forms
1. Form automatically includes hidden `csrf-token` field
2. Server validates token in body
3. Request proceeds or returns 403

### Automatic (via Interceptor)
1. All fetch() calls automatically get `X-CSRF-Token` header
2. No code changes needed in existing forms
3. Works with react-hook-form, formik, etc.

---

## Deployment Steps

### 1. Build
```bash
cd /home/peter/Documents/Projects/zolai/website/zolai-project
npm run build
```

### 2. Deploy
```bash
export $(grep "TELEGRAM_BOT_TOKEN\|TELEGRAM_CHAT_ID" .env.production | xargs)
bash deploy-ssh.sh
```

### 3. Verify
```bash
# Test CSRF endpoint
curl -s "https://zolai.space/api/csrf-token" | jq .

# Test CSRF validation
TOKEN=$(curl -s "https://zolai.space/api/csrf-token" | jq -r '.token')
curl -s -X POST "https://zolai.space/api/content/posts" \
  -H "X-CSRF-Token: $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}' | jq .
```

---

## Monitoring

### Check Logs for CSRF Errors
```bash
ssh zolai "journalctl -u zolai -n 100 | grep CSRF"
```

### Expected Errors
- `CSRF_TOKEN_INVALID` - Normal (invalid/missing token)
- `CSRF token violation` - Security event logged

### Unexpected Errors
- If legitimate requests fail with CSRF error, check:
  1. Token is being sent in header/body
  2. Cookie is being set correctly
  3. Token matches cookie value

---

## Rollback Plan

If issues occur:

```bash
# Revert to previous version
ssh zolai "cd /home/ubuntu/zolai && git revert HEAD"
ssh zolai "sudo systemctl restart zolai"
```

---

## Testing Checklist

- [x] Token generation works
- [x] Cookie set correctly
- [x] Header validation works
- [x] Body validation works
- [x] Rejects missing token
- [x] Interceptor adds token to fetch
- [x] Forms work with token
- [ ] Production deployment
- [ ] Monitor logs for 24 hours
- [ ] User acceptance testing

---

## FAQ

**Q: Will this break existing API clients?**  
A: No. Bearer token requests skip CSRF validation. Only form submissions need tokens.

**Q: Can I disable CSRF for specific endpoints?**  
A: Yes. Add to skip list in `lib/auth/csrf.ts` middleware.

**Q: What if token expires?**  
A: Client gets new token from `/api/csrf-token`. Tokens last 24 hours.

**Q: Does this work with mobile apps?**  
A: Yes. Send token in `X-CSRF-Token` header or `csrf-token` body field.

---

## Support

For issues:
1. Check `CSRF_TESTING_RESULTS.md` for test cases
2. Review logs: `ssh zolai "journalctl -u zolai -n 50"`
3. Test locally: `npm run dev` then curl tests
