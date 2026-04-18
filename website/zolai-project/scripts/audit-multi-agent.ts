#!/usr/bin/env tsx
/**
 * Multi-Agent Audit Coordinator
 * Runs parallel audits: Code, Security, Performance, Database, API
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';

interface AgentResult {
  agent: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  checks: Array<{ name: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string }>;
  duration: number;
}

const agents: AgentResult[] = [];

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

function runCommand(cmd: string): { success: boolean; output: string } {
  try {
    const output = execSync(cmd, { encoding: 'utf-8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, output: error instanceof Error ? error.message : String(error) };
  }
}

// Agent 1: Code Quality
async function auditCode(): Promise<AgentResult> {
  const start = Date.now();
  const checks: Array<{ name: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string }> = [];

  // ESLint
  const lint = runCommand('bun run lint --max-warnings=0');
  checks.push({
    name: 'ESLint',
    status: lint.success ? 'PASS' : 'FAIL',
    message: lint.success ? 'No linting errors' : 'Linting errors found',
  });

  // TypeScript
  const types = runCommand('bunx tsc --noEmit');
  checks.push({
    name: 'TypeScript',
    status: types.success ? 'PASS' : 'FAIL',
    message: types.success ? 'No type errors' : 'Type errors found',
  });

  // Build
  const build = runCommand('bun run build');
  checks.push({
    name: 'Build',
    status: build.success ? 'PASS' : 'FAIL',
    message: build.success ? 'Build successful' : 'Build failed',
  });

  const status = checks.every(c => c.status === 'PASS') ? 'PASS' : 'FAIL';
  return { agent: 'Code Quality', status, checks, duration: Date.now() - start };
}

// Agent 2: Security
async function auditSecurity(): Promise<AgentResult> {
  const start = Date.now();
  const checks: Array<{ name: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string }> = [];

  // Raw fetch check
  const fetch = runCommand(
    'grep -r "await fetch" features app --include="*.ts" --include="*.tsx" | grep -v "/api/chat\\|zolai/api/index" | wc -l'
  );
  const fetchCount = parseInt(fetch.output.trim());
  checks.push({
    name: 'Raw Fetch',
    status: fetchCount === 0 ? 'PASS' : 'FAIL',
    message: fetchCount === 0 ? 'No raw fetch calls' : `Found ${fetchCount} raw fetch calls`,
  });

  // Hono chain check
  const hono = runCommand(
    'find features app/api -name "*.ts" | xargs grep -l "^const.*= new Hono()" | wc -l'
  );
  const honoCount = parseInt(hono.output.trim());
  checks.push({
    name: 'Hono Chain',
    status: honoCount === 0 ? 'PASS' : 'WARN',
    message: honoCount === 0 ? 'All chains valid' : `Check ${honoCount} files`,
  });

  // hc imports check
  const hc = runCommand(
    'grep -r "hc<" features app --include="*.ts" --include="*.tsx" | grep -v "lib/api/client.ts" | wc -l'
  );
  const hcCount = parseInt(hc.output.trim());
  checks.push({
    name: 'hc Imports',
    status: hcCount === 0 ? 'PASS' : 'FAIL',
    message: hcCount === 0 ? 'No direct hc imports' : `Found ${hcCount} direct imports`,
  });

  // Prisma schema
  const prisma = runCommand('bunx prisma validate');
  checks.push({
    name: 'Prisma Schema',
    status: prisma.success ? 'PASS' : 'FAIL',
    message: prisma.success ? 'Schema valid' : 'Schema invalid',
  });

  const status = checks.every(c => c.status !== 'FAIL') ? 'PASS' : 'FAIL';
  return { agent: 'Security', status, checks, duration: Date.now() - start };
}

// Agent 3: Database
async function auditDatabase(): Promise<AgentResult> {
  const start = Date.now();
  const checks: Array<{ name: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string }> = [];

  // Connection check
  const db = runCommand('bunx prisma db execute --stdin < /dev/null');
  checks.push({
    name: 'Connection',
    status: db.success ? 'PASS' : 'WARN',
    message: db.success ? 'Database connected' : 'Database check skipped',
  });

  // Migrations check
  const migrations = existsSync('prisma/migrations');
  checks.push({
    name: 'Migrations',
    status: migrations ? 'PASS' : 'FAIL',
    message: migrations ? 'Migrations directory exists' : 'No migrations found',
  });

  // Schema check
  const schema = existsSync('prisma/schema.prisma');
  checks.push({
    name: 'Schema File',
    status: schema ? 'PASS' : 'FAIL',
    message: schema ? 'Schema file exists' : 'Schema file missing',
  });

  const status = checks.every(c => c.status !== 'FAIL') ? 'PASS' : 'FAIL';
  return { agent: 'Database', status, checks, duration: Date.now() - start };
}

// Agent 4: Configuration
async function auditConfiguration(): Promise<AgentResult> {
  const start = Date.now();
  const checks: Array<{ name: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string }> = [];

  // Environment variables
  const envFile = existsSync('.env.local') ? readFileSync('.env.local', 'utf-8') : '';
  const requiredEnvs = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL'];
  const missingEnvs = requiredEnvs.filter(env => !envFile.includes(env));
  checks.push({
    name: 'Environment',
    status: missingEnvs.length === 0 ? 'PASS' : 'WARN',
    message: missingEnvs.length === 0 ? 'All required env vars set' : `Missing: ${missingEnvs.join(', ')}`,
  });

  // File structure
  const requiredDirs = ['lib/auth', 'features/auth', 'prisma/migrations'];
  const missingDirs = requiredDirs.filter(dir => !existsSync(dir));
  checks.push({
    name: 'File Structure',
    status: missingDirs.length === 0 ? 'PASS' : 'FAIL',
    message: missingDirs.length === 0 ? 'All directories exist' : `Missing: ${missingDirs.join(', ')}`,
  });

  // Package.json
  const pkg = existsSync('package.json');
  checks.push({
    name: 'Package.json',
    status: pkg ? 'PASS' : 'FAIL',
    message: pkg ? 'Package.json exists' : 'Package.json missing',
  });

  const status = checks.every(c => c.status !== 'FAIL') ? 'PASS' : 'FAIL';
  return { agent: 'Configuration', status, checks, duration: Date.now() - start };
}

// Agent 5: API
async function auditAPI(): Promise<AgentResult> {
  const start = Date.now();
  const checks: Array<{ name: string; status: 'PASS' | 'FAIL' | 'WARN'; message: string }> = [];

  // API routes check
  const apiRoutes = existsSync('app/api/[[...route]]/route.ts');
  checks.push({
    name: 'API Routes',
    status: apiRoutes ? 'PASS' : 'FAIL',
    message: apiRoutes ? 'API routes configured' : 'API routes missing',
  });

  // Auth routes
  const authRoutes = existsSync('features/auth/api/index.ts');
  checks.push({
    name: 'Auth Routes',
    status: authRoutes ? 'PASS' : 'FAIL',
    message: authRoutes ? 'Auth routes exist' : 'Auth routes missing',
  });

  // Notification routes
  const notifRoutes = existsSync('features/notifications/api/index.ts');
  checks.push({
    name: 'Notification Routes',
    status: notifRoutes ? 'PASS' : 'FAIL',
    message: notifRoutes ? 'Notification routes exist' : 'Notification routes missing',
  });

  const status = checks.every(c => c.status !== 'FAIL') ? 'PASS' : 'FAIL';
  return { agent: 'API', status, checks, duration: Date.now() - start };
}

// Main
async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('MULTI-AGENT SYSTEM AUDIT');
  console.log('='.repeat(70) + '\n');

  log('Starting parallel audits...', 'INFO');

  const results = await Promise.all([
    auditCode(),
    auditSecurity(),
    auditDatabase(),
    auditConfiguration(),
    auditAPI(),
  ]);

  agents.push(...results);

  // Print results
  console.log('\n' + '='.repeat(70));
  console.log('AUDIT RESULTS');
  console.log('='.repeat(70) + '\n');

  let totalPass = 0;
  let totalFail = 0;
  let totalWarn = 0;

  agents.forEach(agent => {
    const icon = agent.status === 'PASS' ? '✅' : agent.status === 'FAIL' ? '❌' : '⚠️';
    log(`${icon} ${agent.agent} (${agent.duration}ms)`, agent.status === 'PASS' ? 'SUCCESS' : agent.status === 'FAIL' ? 'ERROR' : 'WARN');

    agent.checks.forEach(check => {
      const checkIcon = check.status === 'PASS' ? '✓' : check.status === 'FAIL' ? '✗' : '⚠';
      console.log(`   ${checkIcon} ${check.name}: ${check.message}`);

      if (check.status === 'PASS') totalPass++;
      else if (check.status === 'FAIL') totalFail++;
      else totalWarn++;
    });

    console.log();
  });

  console.log('='.repeat(70));
  console.log(`SUMMARY: ${totalPass} PASS, ${totalWarn} WARN, ${totalFail} FAIL`);
  console.log('='.repeat(70) + '\n');

  if (totalFail > 0) {
    log('Audit FAILED - Fix errors before deployment', 'ERROR');
    process.exit(1);
  } else if (totalWarn > 0) {
    log('Audit PASSED with warnings - Review before deployment', 'WARN');
    process.exit(0);
  } else {
    log('Audit PASSED - Ready for deployment', 'SUCCESS');
    process.exit(0);
  }
}

main().catch(error => {
  log(`Audit error: ${error.message}`, 'ERROR');
  process.exit(1);
});
