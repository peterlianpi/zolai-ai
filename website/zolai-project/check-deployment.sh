#!/usr/bin/env bash
# Zolai Deployment Status Menu

clear
echo "╔════════════════════════════════════════════════════════════╗"
echo "║         ZOLAI DEPLOYMENT STATUS CHECKER                   ║"
echo "║         Domain: https://zolai.space                       ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check 1: Domain accessible
echo "🔍 Checking domain accessibility..."
if curl -s -o /dev/null -w "%{http_code}" https://zolai.space | grep -q "200\|301\|302"; then
  echo "✅ Domain is ACCESSIBLE"
  DOMAIN_OK=1
else
  echo "❌ Domain is NOT ACCESSIBLE"
  DOMAIN_OK=0
fi
echo ""

# Check 2: API health
echo "🔍 Checking API health..."
if curl -s https://zolai.space/api/health 2>/dev/null | grep -q "ok\|success"; then
  echo "✅ API is HEALTHY"
  API_OK=1
else
  echo "❌ API is NOT RESPONDING"
  API_OK=0
fi
echo ""

# Check 3: Database connection
echo "🔍 Checking database..."
if curl -s https://zolai.space/api/curriculum/levels 2>/dev/null | grep -q "data\|level"; then
  echo "✅ Database is CONNECTED"
  DB_OK=1
else
  echo "❌ Database is NOT RESPONDING"
  DB_OK=0
fi
echo ""

# Check 4: Authentication
echo "🔍 Checking authentication..."
if curl -s https://zolai.space/api/auth/session 2>/dev/null | grep -q "user\|session"; then
  echo "✅ Authentication is WORKING"
  AUTH_OK=1
else
  echo "⚠️  Authentication check inconclusive"
  AUTH_OK=0
fi
echo ""

# Summary
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    DEPLOYMENT STATUS                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $DOMAIN_OK -eq 1 ] && [ $API_OK -eq 1 ] && [ $DB_OK -eq 1 ]; then
  echo "🚀 PROJECT IS DEPLOYED ✅"
  echo ""
  echo "Status:"
  echo "  ✅ Domain: https://zolai.space"
  echo "  ✅ API: Responding"
  echo "  ✅ Database: Connected"
  echo ""
  echo "Next steps:"
  echo "  1. Visit https://zolai.space"
  echo "  2. Test login"
  echo "  3. Check notifications"
  echo "  4. Monitor logs: vercel logs"
  EXIT_CODE=0
else
  echo "⏳ PROJECT IS NOT FULLY DEPLOYED ❌"
  echo ""
  echo "Status:"
  echo "  $([ $DOMAIN_OK -eq 1 ] && echo '✅' || echo '❌') Domain"
  echo "  $([ $API_OK -eq 1 ] && echo '✅' || echo '❌') API"
  echo "  $([ $DB_OK -eq 1 ] && echo '✅' || echo '❌') Database"
  echo ""
  echo "Next steps:"
  echo "  1. Check Vercel dashboard: https://vercel.com"
  echo "  2. View logs: vercel logs"
  echo "  3. Verify environment variables: vercel env list"
  echo "  4. Redeploy: vercel deploy --prod"
  EXIT_CODE=1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    QUICK ACTIONS                          ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "1. View Vercel Dashboard"
echo "   → https://vercel.com/dashboard"
echo ""
echo "2. Check Deployment Logs"
echo "   → vercel logs --follow"
echo ""
echo "3. View Environment Variables"
echo "   → vercel env list"
echo ""
echo "4. Redeploy"
echo "   → vercel deploy --prod"
echo ""
echo "5. Check Domain DNS"
echo "   → nslookup zolai.space"
echo ""
echo "6. Test API Endpoint"
echo "   → curl https://zolai.space/api/health"
echo ""

exit $EXIT_CODE
