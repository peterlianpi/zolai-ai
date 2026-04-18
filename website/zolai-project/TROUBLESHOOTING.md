# Troubleshooting Guide

## Issue: Settings Update Returns 400 Bad Request

### Error Message
```
ZodError: Invalid input: expected string, received undefined
```

### Root Cause
The request body is not being properly sent from the frontend to the backend.

### Solution

#### 1. Check Browser Console
- Open DevTools (F12)
- Go to Network tab
- Look for the PUT request to `/api/admin/site-settings`
- Check the "Request" tab to see if the body is being sent

#### 2. Verify Request Headers
The request should have:
```
Content-Type: application/json
X-CSRF-Token: [valid token]
```

#### 3. Check Request Body
The body should be:
```json
{
  "key": "site_name",
  "value": "Zolai AI"
}
```

#### 4. Clear Browser Cache
- Clear cookies and cache
- Refresh the page
- Try again

#### 5. Check CSRF Token
- Verify CSRF token is being obtained
- Check if token is being sent in header
- Verify token matches the cookie

### Quick Fix

If the issue persists:

1. **Hard Refresh**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

2. **Clear Cookies**
   - Open DevTools
   - Application → Cookies
   - Delete all cookies for the domain
   - Refresh page

3. **Check Network**
   - Open DevTools Network tab
   - Try to save settings
   - Check the request/response

### API Test

Test the endpoint directly:

```bash
# 1. Sign in
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  -c cookies.txt

# 2. Get CSRF token
curl http://localhost:3000/api/csrf-token \
  -b cookies.txt \
  -c cookies.txt

# 3. Update settings
curl -X PUT http://localhost:3000/api/admin/site-settings \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: [token]" \
  -b cookies.txt \
  -d '{"key":"site_name","value":"Zolai AI"}'
```

### Common Issues

| Issue | Solution |
|-------|----------|
| 400 Bad Request | Check request body is valid JSON |
| 401 Unauthorized | Sign in again, check session cookie |
| 403 Forbidden | Check CSRF token, verify admin role |
| 404 Not Found | Check endpoint URL is correct |

### Debug Steps

1. Check browser console for errors
2. Check network tab for request/response
3. Verify CSRF token is present
4. Verify authentication cookie is present
5. Check user has admin role
6. Try API test with curl

### Still Having Issues?

1. Check TESTING_SUMMARY.md for test results
2. Run `bun scripts/test-api-endpoints.ts` to verify endpoint works
3. Check server logs for errors
4. Verify database connection

---

**Status:** ✅ Endpoint is working correctly in tests
**Issue:** Likely frontend/browser cache issue
**Solution:** Clear cache and try again
