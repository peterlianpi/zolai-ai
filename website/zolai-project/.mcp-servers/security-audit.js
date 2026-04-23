#!/usr/bin/env node

/**
 * Security Audit MCP Server
 * Local security scanning and dependency auditing (no external APIs)
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

class SecurityAuditServer {
  constructor() {
    this.workspaceFolder = process.cwd();
    this.logFile = path.join(this.workspaceFolder, ".mcp-servers/logs/security-audit.log");
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  async auditDependencies() {
    const results = {
      bun: { status: "pending" },
      npm: { status: "pending" },
      prisma: { status: "pending" },
      timestamp: new Date().toISOString()
    };

    // Bun audit (built-in, fastest)
    try {
      this.log("Running bun audit...");
      const output = execSync("bun audit --json", {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        stdio: ["pipe", "pipe", "pipe"]
      });
      results.bun = JSON.parse(output);
      this.log(`Bun audit complete: ${results.bun.vulnerabilities?.length || 0} issues found`);
    } catch (e) {
      results.bun = {
        status: "error",
        error: e.message,
        suggestion: "Run 'bun install' to ensure packages are installed"
      };
      this.log(`Bun audit error: ${e.message}`, "warn");
    }

    // NPM audit (if available)
    try {
      this.log("Running npm audit...");
      const output = execSync("npm audit --json 2>/dev/null || echo '{}'", {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        shell: "/bin/bash"
      });
      const parsed = JSON.parse(output);
      results.npm = {
        status: "complete",
        vulnerabilities: parsed.vulnerabilities || {},
        metadata: parsed.metadata || {}
      };
      this.log(`NPM audit complete`);
    } catch (e) {
      results.npm = { status: "skipped", reason: "npm not available" };
    }

    // Prisma schema validation
    try {
      this.log("Validating Prisma schema...");
      execSync("bunx prisma validate", { 
        cwd: this.workspaceFolder,
        stdio: "pipe"
      });
      results.prisma = { 
        status: "valid",
        message: "Prisma schema is valid",
        securityRecommendations: [
          "Review @relation directives for proper access control",
          "Verify @updatedAt timestamps for audit trails",
          "Check for proper index definitions on frequently queried fields"
        ]
      };
      this.log("Prisma schema validation passed");
    } catch (e) {
      results.prisma = { 
        status: "invalid",
        error: e.message,
        suggestion: "Run 'bunx prisma migrate dev' to fix schema issues"
      };
      this.log(`Prisma validation error: ${e.message}`, "error");
    }

    return results;
  }

  async checkSecretExposure() {
    this.log("Scanning for exposed secrets...");
    
    const patterns = {
      "auth_secret": /BETTER_AUTH_SECRET\s*=\s*[^=]/i,
      "api_key": /API_KEY\s*=\s*(?!undefined)/i,
      "password": /(?:PASSWORD|PASSWD)\s*=\s*(?!undefined)/i,
      "database_url": /DATABASE_URL\s*=\s*postgres:\/\/[^@]*:.*@/i,
      "jwt_secret": /JWT_SECRET\s*=\s*[^=]/i,
      "private_key": /PRIVATE_KEY\s*=\s*-----BEGIN/,
      "aws_secret": /AWS_SECRET_ACCESS_KEY\s*=\s*[^=]/i,
      "resend_api_key": /RESEND_API_KEY\s*=\s*[^=]/i
    };

    const findings = {
      exposed_secrets: [],
      safe_files: [],
      scan_timestamp: new Date().toISOString(),
      recommendations: []
    };

    const scanDir = (dir, depth = 0) => {
      if (depth > 5) return; // Prevent deep recursion
      
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.startsWith(".")) continue;
          if (["node_modules", ".next", "dist", ".git", ".mcp-servers"].includes(file)) continue;

          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            scanDir(fullPath, depth + 1);
          } else if (file.endsWith(".ts") || file.endsWith(".js") || file === ".env" || file === ".env.local") {
            const content = fs.readFileSync(fullPath, "utf8");
            
            for (const [secretType, pattern] of Object.entries(patterns)) {
              const matches = content.match(pattern);
              if (matches && !fullPath.includes(".env.example")) {
                findings.exposed_secrets.push({
                  file: fullPath.replace(this.workspaceFolder, "."),
                  secretType,
                  line: content.substring(0, content.indexOf(matches[0])).split("\n").length,
                  severity: "CRITICAL"
                });
                this.log(`Found ${secretType} in ${fullPath}`, "error");
              }
            }
          }
        }
      } catch (e) {
        // Ignore permission errors
      }
    };

    scanDir(this.workspaceFolder);

    if (findings.exposed_secrets.length === 0) {
      findings.recommendations.push("✅ No exposed secrets detected in source code");
      findings.recommendations.push("Reminder: Never commit .env.local files");
    } else {
      findings.recommendations.push("🚨 CRITICAL: Remove exposed secrets immediately");
      findings.recommendations.push("Use: git rm --cached .env.local && git commit -m 'Remove secrets'");
      findings.recommendations.push("Rotate all exposed credentials in your auth provider");
    }

    this.log(`Secret scan complete: ${findings.exposed_secrets.length} issues found`);
    return findings;
  }

  async validateEnvConfig() {
    this.log("Validating environment configuration...");
    
    const envExample = path.join(this.workspaceFolder, ".env.example");
    const envLocal = path.join(this.workspaceFolder, ".env.local");

    const required = [];
    const configured = [];
    const optional = [];

    // Parse .env.example
    if (fs.existsSync(envExample)) {
      const content = fs.readFileSync(envExample, "utf8");
      const lines = content.split("\n").filter(line => line.trim() && !line.startsWith("#"));
      
      for (const line of lines) {
        const [key, value] = line.split("=");
        if (key) {
          if (value && value.toLowerCase().includes("optional")) {
            optional.push(key.trim());
          } else {
            required.push(key.trim());
          }
        }
      }
    }

    // Parse .env.local
    if (fs.existsSync(envLocal)) {
      const content = fs.readFileSync(envLocal, "utf8");
      const lines = content.split("\n").filter(line => line.trim() && !line.startsWith("#"));
      
      for (const line of lines) {
        const [key] = line.split("=");
        if (key) {
          configured.push(key.trim());
        }
      }
    }

    const missing = required.filter(v => !configured.includes(v));
    const unconfiguredOptional = optional.filter(v => !configured.includes(v));

    const report = {
      required_vars: required.length,
      configured_vars: configured.length,
      optional_vars: optional.length,
      missing: missing,
      status: missing.length === 0 ? "ready" : "incomplete",
      recommendations: []
    };

    if (missing.length > 0) {
      report.recommendations.push(`⚠️  Missing ${missing.length} required variables:`);
      missing.forEach(v => report.recommendations.push(`  - ${v}`));
    }

    if (unconfiguredOptional.length > 0) {
      report.recommendations.push(`ℹ️  Optional variables not configured (${unconfiguredOptional.length}):`);
      unconfiguredOptional.slice(0, 5).forEach(v => report.recommendations.push(`  - ${v}`));
    }

    report.recommendations.push("Run 'cp .env.example .env.local' and fill in values");

    this.log(`Environment validation: ${missing.length} missing, ${configured.length} configured`);
    return report;
  }

  async checkDatabaseSecurity() {
    this.log("Checking database security configuration...");
    
    const issues = [];
    const schemaPath = path.join(this.workspaceFolder, "prisma", "schema.prisma");

    if (!fs.existsSync(schemaPath)) {
      return {
        status: "skipped",
        reason: "No Prisma schema found",
        path: schemaPath
      };
    }

    const schema = fs.readFileSync(schemaPath, "utf8");

    // Check for audit fields
    const hasUpdatedAt = schema.includes("updatedAt");
    const hasCreatedAt = schema.includes("createdAt");
    const hasAuditLog = schema.includes("AuditLog");

    if (!hasUpdatedAt) {
      issues.push({
        severity: "medium",
        issue: "Missing updatedAt timestamp",
        recommendation: "Add 'updatedAt DateTime @updatedAt' to audit critical models",
        impact: "Cannot track when records were last modified"
      });
    }

    if (!hasCreatedAt) {
      issues.push({
        severity: "low",
        issue: "Missing createdAt timestamp",
        recommendation: "Add 'createdAt DateTime @default(now())' to models",
        impact: "Harder to analyze data creation patterns"
      });
    }

    if (!hasAuditLog) {
      issues.push({
        severity: "medium",
        issue: "No AuditLog model defined",
        recommendation: "Add AuditLog model to track all mutations",
        impact: "Cannot audit sensitive operations"
      });
    }

    // Check for proper relations
    const relations = schema.match(/@relation\([^)]+\)/g) || [];
    if (relations.length < 3) {
      issues.push({
        severity: "info",
        issue: "Few relationships defined",
        recommendation: "Consider defining more @relation directives for data integrity",
        impact: "Harder to maintain referential integrity"
      });
    }

    // Check for indexes on security-critical fields
    const hasIndexes = schema.includes("@@index");
    if (!hasIndexes) {
      issues.push({
        severity: "low",
        issue: "No indexes defined",
        recommendation: "Add @@index on frequently queried fields (userId, email, etc.)",
        impact: "Database queries may be slow for large datasets"
      });
    }

    this.log(`Database security check: ${issues.length} issues found`);
    
    return {
      status: "complete",
      schema_file: schemaPath,
      issues_found: issues.length,
      issues,
      security_score: Math.max(0, 100 - (issues.length * 15)),
      recommendations: [
        "Review all issues above",
        "Implement audit logging for sensitive operations",
        "Add database backups to deployment pipeline",
        "Enable row-level security (RLS) for sensitive tables"
      ]
    };
  }

  async checkCodeQuality() {
    this.log("Running code quality checks...");
    
    const checks = {
      eslint: { status: "pending" },
      typescript: { status: "pending" },
      unused_vars: { status: "pending" }
    };

    // ESLint check
    try {
      const output = execSync("bunx eslint . --format json 2>/dev/null || echo '[]'", {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        shell: "/bin/bash"
      });
      const results = JSON.parse(output);
      checks.eslint = {
        status: "complete",
        files_checked: results.length,
        issues: results.reduce((sum, f) => sum + (f.messages?.length || 0), 0)
      };
      this.log(`ESLint: ${checks.eslint.issues} issues found`);
    } catch (e) {
      checks.eslint = { status: "error", reason: e.message };
    }

    // TypeScript check
    try {
      execSync("bunx tsc --noEmit", {
        cwd: this.workspaceFolder,
        stdio: "pipe"
      });
      checks.typescript = { status: "complete", errors: 0 };
      this.log("TypeScript: No errors found");
    } catch (e) {
      checks.typescript = { status: "error", message: "TypeScript compilation failed" };
      this.log("TypeScript: Compilation errors", "warn");
    }

    return {
      timestamp: new Date().toISOString(),
      checks,
      summary: `${checks.eslint.issues || 0} linting issues, TypeScript ${checks.typescript.status}`
    };
  }
}

// MCP Server Startup
const server = new SecurityAuditServer();

const tools = [
  {
    name: "audit_dependencies",
    description: "Run security audit on all dependencies (Bun, NPM, Prisma)",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "check_secret_exposure",
    description: "Scan codebase for exposed secrets (API keys, passwords, DB credentials)",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "validate_env_config",
    description: "Verify environment configuration is complete and correct",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "check_database_security",
    description: "Validate Prisma schema for security best practices",
    inputSchema: { type: "object", properties: {} }
  },
  {
    name: "check_code_quality",
    description: "Run ESLint and TypeScript type checking",
    inputSchema: { type: "object", properties: {} }
  }
];

// Send MCP capabilities
console.log(JSON.stringify({
  type: "mcp-server",
  name: "security-audit",
  version: "1.0.0",
  tools
}));

// Handle tool calls via stdin
let inputBuffer = "";
process.stdin.on("data", async (chunk) => {
  inputBuffer += chunk.toString();

  try {
    const toolCall = JSON.parse(inputBuffer);
    inputBuffer = "";

    let result;
    switch (toolCall.name) {
      case "audit_dependencies":
        result = await server.auditDependencies();
        break;
      case "check_secret_exposure":
        result = await server.checkSecretExposure();
        break;
      case "validate_env_config":
        result = await server.validateEnvConfig();
        break;
      case "check_database_security":
        result = await server.checkDatabaseSecurity();
        break;
      case "check_code_quality":
        result = await server.checkCodeQuality();
        break;
      default:
        result = { error: `Unknown tool: ${toolCall.name}` };
    }

    console.log(JSON.stringify({ success: true, data: result }));
  } catch (e) {
    // Incomplete JSON, wait for more data
    if (!e.message.includes("Unexpected end of JSON input")) {
      console.error(JSON.stringify({ success: false, error: e.message }));
      inputBuffer = "";
    }
  }
});
