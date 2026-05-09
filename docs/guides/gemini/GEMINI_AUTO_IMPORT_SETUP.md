# Gemini Web API Auto-Import Setup

## Quick Start (Auto-Import Method)

### 1. Install gemini-webapi with browser support
```bash
pip install -U gemini-webapi[browser]
```

### 2. Log into Gemini in your browser
- Open https://gemini.google.com
- Log in with your Google account
- **Keep the browser open** (or just ensure you're logged in)

### 3. Run the validation script
```bash
python scripts/validate_zolai_auto_import.py
```

The script will automatically import cookies from your browser and validate all translations.

---

## How Auto-Import Works

The `gemini-webapi[browser]` package includes `browser-cookie3`, which:
1. Detects your default browser (Chrome, Firefox, Safari, etc.)
2. Reads cookies from the browser's cookie store
3. Automatically imports `__Secure-1PSID` and `__Secure-1PSIDTS`
4. Uses them to authenticate with Gemini

**No manual cookie export needed!**

---

## Troubleshooting

### "No cookies found" error
- Make sure you're logged into https://gemini.google.com
- Try closing and reopening your browser
- Ensure your browser is your system's default browser

### "Connection timeout" error
- Check your internet connection
- Try again in a few moments
- Gemini may be rate-limiting requests

### "Unusual traffic" error
- The script includes delays between requests
- If still failing, wait 5-10 minutes before retrying
- Try again later

---

## Supported Browsers

`browser-cookie3` supports:
- Chrome / Chromium
- Firefox
- Safari
- Edge
- Opera
- Brave

See [browser-cookie3 docs](https://github.com/borisbabic/browser_cookie3) for full list.

---

## Manual Cookie Export (Fallback)

If auto-import doesn't work:

1. Open https://gemini.google.com
2. Press F12 (DevTools)
3. Go to Application → Cookies
4. Find and copy these cookies:
   - `__Secure-1PSID`
   - `__Secure-1PSIDTS`
5. Create `cookies.json` in project root:
```json
{
  "__Secure-1PSID": "your_value_here",
  "__Secure-1PSIDTS": "your_value_here"
}
```
6. Run: `python scripts/validate_zolai_gemini_webapi.py`
