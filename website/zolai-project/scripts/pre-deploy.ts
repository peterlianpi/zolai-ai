#!/usr/bin/env tsx
/**
 * Pre-Deployment Verification
 * Comprehensive checks before production deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

interface CheckResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
}

const checks: CheckResult[] = [];

function log(message: string, type: 'INFO' | 'SUCCESS' | 'ERROR' = 'INFO') {
  const colors = {
    INFO: '\x1b[36m',
    SUCCESS: '\x1b[32m',
    ERROR: '\x1b[31m',
    RESET: '\x1b[0m',
  };
  console.log(`${colors[type]}[${type}]${colors.RESET} ${message}`);
}

function run(cmd: string): boolean {
  try {
    execSync(cmd, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

console.log('\n' + '='.repeat(70));
console.log('PRE-DEPLOYMENT VERIFICATION');
console.log('='.repeat(70) + '\n');

// 1. Environment
log('Checking environment...', 'INFO');
const env = readFileSync('.env.local', 'utf-8');
const requiredEnvs = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'SMTP_HOST',
  'TELEGRAM_BOT_TOKEN',
];
const missingEnvs = requiredEnvs.filter(e => !env.includes(e));
checks.push({
  name: 'Environment Variables',
  status: missingEnvs.length === 0 ? 'PASS' : 'FAIL',
  message: missingEnvs.length === 0 ? 'All required env vars set' : `Missing: ${missingEnvs.join(', ')}`,
});

// 2. Production URL
log('Checking production URL...', 'INFO');
const isProdUrl = env.includes('zolai.space');
checks.push({
  name: 'Production URL',
  status: isProdUrl ? 'PASS' : 'FAIL',
  message: isProdUrl ? 'Using zolai.space' : 'Not using production URL',
});

// 3. Node environment
log('Checking Node environment...', 'INFO');
const isProduction = env.includes('NODE_ENV=production');
checks.push({
  name: 'Node Environment',
  status: isProduction ? 'PASS' : 'FAIL',
  message: isProduction ? 'NODE_ENV=production' : 'NODE_ENV not set to production',
});

// 4. Linting
log('Running linter...', 'INFO');
const lintPass = run('bun run lint --max-warnings=0');
checks.push({
  name: 'ESLint',
  status: lintPass ? 'PASS' : 'FAIL',
  message: lintPass ? 'No linting errors' : 'Linting errors found',
});

// 5. TypeScript
log('Running TypeScript check...', 'INFO');
const typePass = run('bunx tsc --noEmit');
checks.push({
  name: 'TypeScript',
  status: typePass ? 'PASS' : 'FAIL',
  message: typePass ? 'No type errors' : 'Type errors found',
});

// 6. Build
log('Running build...', 'INFO');
const buildPass = run('bun run build');
checks.push({
  name: 'Build',
  status: buildPass ? 'PASS' : 'FAIL',
  message: buildPass ? 'Build successful' : 'Build failed',
});

// 7. Prisma
log('Validating Prisma schema...', 'INFO');
const prismaPass = run('bunx prisma validate');
checks.push({
  name: 'Prisma Schema',
  status: prismaPass ? 'PASS' : 'FAIL',
  message: prismaPass ? 'Schema valid' : 'Schema invalid',
});

// 8. Database connection
log('Checking database connection...', 'INFO');
const dbPass = run('bunx prisma db execute --stdin < /dev/null');
checks.push({
  name: 'Database Connection',
  status: dbPass ? 'PASS' : 'FAIL',
  message: dbPass ? 'Database connected' : 'Database connection failed',
});

// 9. Git status
log('Checking git status...', 'INFO');
const gitPass = run('git status > /dev/null 2>&1');
checks.push({
  name: 'Git Status',
  status: gitPass ? 'PASS' : 'FAIL',
  message: gitPass ? 'Git ready' : 'Git error',
});

// 10. Security files
log('Checking security files...', 'INFO');
const securityFiles = [
  'lib/auth/security-notifications.ts',
  'lib/auth/account-lockout.ts',
  'lib/auth/login-history.ts',
  'lib/email.ts',
  'features/telegram/api/index.ts',
];
const missingFiles = securityFiles.filter(f => !existsSync(f));
checks.push({
  name: 'Security Files',
  status: missingFiles.length === 0 ? 'PASS' : 'FAIL',
  message: missingFiles.length === 0 ? 'All security files present' : `Missing: ${missingFiles.join(', ')}`,
});

// Print results
console.log('\n' + '='.repeat(70));
console.log('VERIFICATION RESULTS');
console.log('='.repeat(70) + '\n');

let passCount = 0;
let failCount = 0;

checks.forEach(check => {
  const icon = check.status === 'PASS' ? '✅' : '❌';
  log(`${icon} ${check.name}: ${check.message}`, check.status === 'PASS' ? 'SUCCESS' : 'ERROR');

  if (check.status === 'PASS') passCount++;
  else failCount++;
});

console.log('\n' + '='.repeat(70));
console.log(`SUMMARY: ${passCount} PASS, ${failCount} FAIL`);
console.log('='.repeat(70) + '\n');

if (failCount > 0) {
  log('❌ Verification FAILED - Fix errors before deployment', 'ERROR');
  process.exit(1);
} else {
  log('✅ Verification PASSED - Ready for deployment', 'SUCCESS');
  console.log('\nNext steps:');
  console.log('1. git add .');
  console.log('2. git commit -m "Production deployment - zolai.space"');
  console.log('3. git push origin main');
  console.log('4. vercel deploy --prod');
  console.log('');
  process.exit(0);
}
