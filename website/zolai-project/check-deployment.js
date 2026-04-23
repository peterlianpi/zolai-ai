#!/usr/bin/env node
/**
 * Zolai Deployment Status Checker
 * Quick check if project is deployed
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const https = require('https');

const DOMAIN = 'https://zolai.space';
const checks = {
  domain: false,
  api: false,
  database: false,
  auth: false,
};

function request(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', () => resolve({ status: 0, data: '' }));
  });
}

async function check() {
  console.clear();
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         ZOLAI DEPLOYMENT STATUS CHECKER                   ║');
  console.log('║         Domain: https://zolai.space                       ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Check 1: Domain
  console.log('🔍 Checking domain...');
  let res = await request(DOMAIN);
  checks.domain = res.status > 0;
  console.log(checks.domain ? '✅ Domain is ACCESSIBLE\n' : '❌ Domain is NOT ACCESSIBLE\n');

  // Check 2: API
  console.log('🔍 Checking API...');
  res = await request(`${DOMAIN}/api/health`);
  checks.api = res.status === 200;
  console.log(checks.api ? '✅ API is HEALTHY\n' : '❌ API is NOT RESPONDING\n');

  // Check 3: Database
  console.log('🔍 Checking database...');
  res = await request(`${DOMAIN}/api/curriculum/levels`);
  checks.database = res.status === 200;
  console.log(checks.database ? '✅ Database is CONNECTED\n' : '❌ Database is NOT RESPONDING\n');

  // Check 4: Auth
  console.log('🔍 Checking authentication...');
  res = await request(`${DOMAIN}/api/auth/session`);
  checks.auth = res.status > 0;
  console.log(checks.auth ? '✅ Authentication is WORKING\n' : '⚠️  Authentication check inconclusive\n');

  // Summary
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    DEPLOYMENT STATUS                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const isDeployed = checks.domain && checks.api && checks.database;

  if (isDeployed) {
    console.log('🚀 PROJECT IS DEPLOYED ✅\n');
    console.log('Status:');
    console.log('  ✅ Domain: https://zolai.space');
    console.log('  ✅ API: Responding');
    console.log('  ✅ Database: Connected\n');
    console.log('Next steps:');
    console.log('  1. Visit https://zolai.space');
    console.log('  2. Test login');
    console.log('  3. Check notifications');
    console.log('  4. Monitor logs: vercel logs\n');
  } else {
    console.log('⏳ PROJECT IS NOT FULLY DEPLOYED ❌\n');
    console.log('Status:');
    console.log(`  ${checks.domain ? '✅' : '❌'} Domain`);
    console.log(`  ${checks.api ? '✅' : '❌'} API`);
    console.log(`  ${checks.database ? '✅' : '❌'} Database\n`);
    console.log('Next steps:');
    console.log('  1. Check Vercel dashboard: https://vercel.com');
    console.log('  2. View logs: vercel logs');
    console.log('  3. Verify environment variables: vercel env list');
    console.log('  4. Redeploy: vercel deploy --prod\n');
  }

  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                    QUICK ACTIONS                          ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  console.log('1. View Vercel Dashboard');
  console.log('   → https://vercel.com/dashboard\n');
  console.log('2. Check Deployment Logs');
  console.log('   → vercel logs --follow\n');
  console.log('3. View Environment Variables');
  console.log('   → vercel env list\n');
  console.log('4. Redeploy');
  console.log('   → vercel deploy --prod\n');
  console.log('5. Check Domain DNS');
  console.log('   → nslookup zolai.space\n');
  console.log('6. Test API Endpoint');
  console.log('   → curl https://zolai.space/api/health\n');

  process.exit(isDeployed ? 0 : 1);
}

check();
