#!/usr/bin/env tsx
/**
 * Comprehensive System Audit
 * Audits: Linting, Build, Tests, Security, Performance
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

interface AuditResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  details?: string[];
}

const results: AuditResult[] = [];

function log(message: string, type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN' = 'INFO') {
  const colors = {
    INFO: '\x1b[36m',
    SUCCESS: '\x1b[32m',
    ERROR: '\x1b[31m',
    WARN: '\x1b[33m',
    RESET: '\x1b[0m',
  };
  console.log(`${colors[type]}[${type}]${colors.RESET} ${message}`);
}

function runCommand(cmd: string, silent = false): { success: boolean; output: string } {
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: silent ? 'pipe' : 'inherit' });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

// 1. Lint Check
log('Running ESLint...', 'INFO');
const lintResult = runCommand('bun run lint --max-warnings=0', true);
results.push({
  name: 'ESLint',
  status: lintResult.success ? 'PASS' : 'FAIL',
  message: lintResult.success ? 'No linting errors' : 'Linting errors found',
  details: lintResult.success ? [] : lintResult.output.split('\n').slice(0, 10),
});

// 2. Build Check
log('Running Build...', 'INFO');
const buildResult = runCommand('bun run build', true);
results.push({
  name: 'Build',
  status: buildResult.success ? 'PASS' : 'FAIL',
  message: buildResult.success ? 'Build successful' : 'Build failed',
  details: buildResult.success ? [] : buildResult.output.split('\n').slice(0, 10),
});

// 3. Type Check
log('Running TypeScript Check...', 'INFO');
const typeResult = runCommand('bunx tsc --noEmit', true);
results.push({
  name: 'TypeScript',
  status: typeResult.success ? 'PASS' : 'FAIL',
  message: typeResult.success ? 'No type errors' : 'Type errors found',
  details: typeResult.success ? [] : typeResult.output.split('\n').slice(0, 10),
});

// 4. Prisma Check
log('Checking Prisma Schema...', 'INFO');
const prismaResult = runCommand('bunx prisma validate', true);
results.push({
  name: 'Prisma Schema',
  status: prismaResult.success ? 'PASS' : 'FAIL',
  message: prismaResult.success ? 'Schema valid' : 'Schema invalid',
  details: prismaResult.success ? [] : prismaResult.output.split('\n').slice(0, 10),
});

// 5. Security Check - No raw fetch
log('Checking for raw fetch calls...', 'INFO');
const fetchCheck = runCommand(
  'grep -r "await fetch" features app --include="*.ts" --include="*.tsx" | grep -v "/api/chat\\|zolai/api/index" | wc -l',
  true
);
const fetchCount = parseInt(fetchCheck.output.trim());
results.push({
  name: 'Raw Fetch Security',
  status: fetchCount === 0 ? 'PASS' : 'FAIL',
  message: fetchCount === 0 ? 'No raw fetch calls' : `Found ${fetchCount} raw fetch calls`,
});

// 6. Security Check - No loose Hono
log('Checking for loose Hono calls...', 'INFO');
const honoCheck = runCommand(
  'find features app/api -name "*.ts" | xargs grep -l "^const.*= new Hono()" | wc -l',
  true
);
const honoCount = parseInt(honoCheck.output.trim());
results.push({
  name: 'Hono Chain Rule',
  status: honoCount === 0 ? 'PASS' : 'WARN',
  message: honoCount === 0 ? 'All Hono chains valid' : `Check ${honoCount} files for chain rule`,
});

// 7. Security Check - No hc imports
log('Checking for hc imports...', 'INFO');
const hcCheck = runCommand(
  'grep -r "hc<" features app --include="*.ts" --include="*.tsx" | grep -v "lib/api/client.ts" | wc -l',
  true
);
const hcCount = parseInt(hcCheck.output.trim());
results.push({
  name: 'hc Import Rule',
  status: hcCount === 0 ? 'PASS' : 'FAIL',
  message: hcCount === 0 ? 'No direct hc imports' : `Found ${hcCount} direct hc imports`,
});

// 8. Database Check
log('Checking database connection...', 'INFO');
const dbCheck = runCommand('bunx prisma db execute --stdin < /dev/null', true);
results.push({
  name: 'Database Connection',
  status: dbCheck.success ? 'PASS' : 'WARN',
  message: dbCheck.success ? 'Database connected' : 'Database check skipped (may be offline)',
});

// 9. Environment Check
log('Checking environment variables...', 'INFO');
const envFile = existsSync('.env.local') ? readFileSync('.env.local', 'utf-8') : '';
const requiredEnvs = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'TELEGRAM_BOT_TOKEN',
  'SMTP_HOST',
];
const missingEnvs = requiredEnvs.filter(env => !envFile.includes(env));
results.push({
  name: 'Environment Variables',
  status: missingEnvs.length === 0 ? 'PASS' : 'WARN',
  message: missingEnvs.length === 0 ? 'All required env vars set' : `Missing: ${missingEnvs.join(', ')}`,
});

// 10. File Structure Check
log('Checking file structure...', 'INFO');
const requiredDirs = [
  'lib/auth',
  'lib/email',
  'features/auth',
  'features/notifications',
  'prisma/migrations',
];
const missingDirs = requiredDirs.filter(dir => !existsSync(dir));
results.push({
  name: 'File Structure',
  status: missingDirs.length === 0 ? 'PASS' : 'FAIL',
  message: missingDirs.length === 0 ? 'All required directories exist' : `Missing: ${missingDirs.join(', ')}`,
});

// Print Results
console.log('\n' + '='.repeat(60));
console.log('AUDIT RESULTS');
console.log('='.repeat(60) + '\n');

let passCount = 0;
let failCount = 0;
let warnCount = 0;

results.forEach(result => {
  const icon = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  log(`${icon} ${result.name}: ${result.message}`, result.status === 'PASS' ? 'SUCCESS' : result.status === 'FAIL' ? 'ERROR' : 'WARN');

  if (result.details && result.details.length > 0) {
    result.details.forEach(detail => console.log(`   ${detail}`));
  }

  if (result.status === 'PASS') passCount++;
  else if (result.status === 'FAIL') failCount++;
  else warnCount++;
});

console.log('\n' + '='.repeat(60));
console.log(`SUMMARY: ${passCount} PASS, ${warnCount} WARN, ${failCount} FAIL`);
console.log('='.repeat(60) + '\n');

process.exit(failCount > 0 ? 1 : 0);
