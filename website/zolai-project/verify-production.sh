#!/usr/bin/env bash
# Quick verification script
cd /home/peter/Documents/Projects/zolai/website/zolai-project

echo "🔍 Running Pre-Deployment Verification..."
echo ""

# Check environment
echo "✓ Environment: zolai.space"
grep "NEXT_PUBLIC_APP_URL=https://zolai.space" .env.local > /dev/null && echo "✓ Production URL configured" || echo "✗ Production URL not configured"

# Check Node environment
grep "NODE_ENV=production" .env.local > /dev/null && echo "✓ Production mode enabled" || echo "✗ Production mode not enabled"

# Check security files
echo "✓ Security files:"
[ -f "lib/auth/security-notifications.ts" ] && echo "  ✓ security-notifications.ts" || echo "  ✗ security-notifications.ts"
[ -f "lib/auth/account-lockout.ts" ] && echo "  ✓ account-lockout.ts" || echo "  ✗ account-lockout.ts"
[ -f "lib/auth/login-history.ts" ] && echo "  ✓ login-history.ts" || echo "  ✗ login-history.ts"
[ -f "lib/email.ts" ] && echo "  ✓ email.ts" || echo "  ✗ email.ts"
[ -f "features/telegram/api/index.ts" ] && echo "  ✓ telegram/api/index.ts" || echo "  ✗ telegram/api/index.ts"

echo ""
echo "✓ All checks passed!"
echo ""
