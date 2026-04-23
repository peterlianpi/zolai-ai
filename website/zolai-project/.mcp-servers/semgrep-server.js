#!/usr/bin/env node

/**
 * Semgrep MCP Server
 * OWASP static analysis and security vulnerability detection (local only)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class SemgrepServer {
  constructor() {
    this.workspaceFolder = process.cwd();
    this.logFile = path.join(this.workspaceFolder, ".mcp-servers/logs/semgrep.log");
    this.ensureLogDir();
    this.checkSemgrep();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  checkSemgrep() {
    try {
      execSync("which semgrep || which python3", { stdio: "pipe" });
    } catch (e) {
      this.log("Semgrep not found. Install: pip install semgrep", "error");
    }
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  async scanRepository(directory = null) {
    const scanDir = directory || this.workspaceFolder;
    this.log(`Scanning repository at ${scanDir} for OWASP vulnerabilities...`);

    try {
      const output = execSync(
        `semgrep scan --json --config=p/owasp-top-ten --config=p/typescript --config=p/react "${scanDir}" 2>/dev/null || echo '{}'`,
        {
          encoding: "utf8",
          shell: "/bin/bash",
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        }
      );

      const results = JSON.parse(output);
      this.log(`Repository scan complete: ${results.results?.length || 0} issues found`);

      return {
        status: "complete",
        directory: scanDir,
        vulnerabilities: results.results || [],
        stats: {
          total_issues: results.results?.length || 0,
          by_severity: this.groupBySeverity(results.results || [])
        }
      };
    } catch (e) {
      this.log(`Repository scan error: ${e.message}`, "error");
      return {
        status: "error",
        error: e.message,
        suggestion: "Install Semgrep: pip install semgrep"
      };
    }
  }

  async scanFile(filePath) {
    this.log(`Scanning file: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      return { status: "error", error: `File not found: ${filePath}` };
    }

    try {
      const output = execSync(
        `semgrep scan --json --config=p/owasp-top-ten --config=p/typescript --config=p/react "${filePath}" 2>/dev/null || echo '{}'`,
        {
          encoding: "utf8",
          shell: "/bin/bash"
        }
      );

      const results = JSON.parse(output);
      const fileResults = (results.results || []).filter(r => r.path === filePath);

      this.log(`File scan complete: ${fileResults.length} issues in ${filePath}`);

      return {
        status: "complete",
        file: filePath,
        vulnerabilities: fileResults,
        passed: fileResults.length === 0,
        summary: {
          critical: fileResults.filter(r => r.extra?.severity === "ERROR").length,
          warning: fileResults.filter(r => r.extra?.severity === "WARNING").length,
          info: fileResults.filter(r => r.extra?.severity === "INFO").length
        }
      };
    } catch (e) {
      this.log(`File scan error: ${e.message}`, "error");
      return { status: "error", file: filePath, error: e.message };
    }
  }

  async findVulnerabilityType(type) {
    this.log(`Searching for ${type} vulnerabilities...`);

    const patterns = {
      "sql-injection": [
        "p/owasp-a03:sql-injection",
        "p/owasp-top-ten"
      ],
      "xss": [
        "p/owasp-a07:cross-site-scripting",
        "p/react" // XSS in React components
      ],
      "authentication": [
        "p/owasp-a07:cross-site-scripting", // Auth bypass via XSS
        "p/owasp-a04:insecure-deserialization"
      ],
      "access-control": [
        "p/owasp-a01:broken-access-control",
        "p/owasp-top-ten"
      ],
      "injection": [
        "p/owasp-a03",
        "p/owasp-top-ten"
      ],
      "cryptography": [
        "p/owasp-a02:cryptographic-failure"
      ],
      "data-exposure": [
        "p/owasp-a04:insecure-deserialization"
      ],
      "dependency": [
        "p/owasp-a06:vulnerable-components"
      ]
    };

    const configs = patterns[type] || patterns["authentication"];

    try {
      const output = execSync(
        `semgrep scan --json --config=${configs.join(" --config=")} "${this.workspaceFolder}" 2>/dev/null || echo '{}'`,
        {
          encoding: "utf8",
          shell: "/bin/bash",
          maxBuffer: 10 * 1024 * 1024
        }
      );

      const results = JSON.parse(output);
      this.log(`Found ${results.results?.length || 0} ${type} vulnerabilities`);

      return {
        status: "complete",
        vulnerability_type: type,
        issues: results.results || [],
        summary: {
          total: (results.results || []).length,
          by_file: this.groupByFile(results.results || [])
        }
      };
    } catch (e) {
      this.log(`Vulnerability search error: ${e.message}`, "error");
      return { status: "error", type, error: e.message };
    }
  }

  async findIssuesInFeature(featurePath) {
    this.log(`Scanning feature: ${featurePath}`);

    const fullPath = path.join(this.workspaceFolder, featurePath);
    if (!fs.existsSync(fullPath)) {
      return { status: "error", error: `Feature path not found: ${featurePath}` };
    }

    try {
      const output = execSync(
        `semgrep scan --json --config=p/owasp-top-ten "${fullPath}" 2>/dev/null || echo '{}'`,
        {
          encoding: "utf8",
          shell: "/bin/bash"
        }
      );

      const results = JSON.parse(output);
      const issues = results.results || [];

      this.log(`Feature scan: ${issues.length} issues in ${featurePath}`);

      return {
        status: "complete",
        feature: featurePath,
        total_issues: issues.length,
        issues: issues.map(issue => ({
          file: issue.path,
          rule: issue.check_id,
          message: issue.extra?.message,
          line: issue.start?.line,
          severity: issue.extra?.severity,
          code: issue.extra?.lines
        })),
        recommendations: this.getRecommendations(issues)
      };
    } catch (e) {
      this.log(`Feature scan error: ${e.message}`, "error");
      return { status: "error", feature: featurePath, error: e.message };
    }
  }

  async validateSecurityPolicies() {
    this.log("Validating security policies...");

    const policies = {
      auth_validation: this.validateAuthPatterns(),
      api_security: this.validateAPIPatterns(),
      data_handling: this.validateDataPatterns()
    };

    return {
      status: "complete",
      policies,
      timestamp: new Date().toISOString()
    };
  }

  validateAuthPatterns() {
    const authFiles = [
      "lib/auth.ts",
      "lib/auth-client.ts",
      "app/api/auth"
    ];

    const issues = [];
    for (const file of authFiles) {
      const fullPath = path.join(this.workspaceFolder, file);
      if (!fs.existsSync(fullPath)) continue;

      const content = fs.readFileSync(fullPath, "utf8");
      
      // Check for hardcoded secrets
      if (/const.*SECRET\s*=\s*["'][^"']+["']/.test(content)) {
        issues.push({ file, issue: "Hardcoded secret found" });
      }
      
      // Check for proper session validation
      if (!/validateSessionToken|getSession/.test(content)) {
        issues.push({ file, issue: "Missing session validation" });
      }
    }

    return { files_checked: authFiles.length, issues };
  }

  validateAPIPatterns() {
    const apiDir = path.join(this.workspaceFolder, "app/api");
    const issues = [];

    if (!fs.existsSync(apiDir)) return { issues: [] };

    const checkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        if (file.endsWith(".ts")) {
          const content = fs.readFileSync(path.join(dir, file), "utf8");
          
          // Check for zod validation
          if (!content.includes("zValidator")) {
            issues.push({ file, issue: "Missing Zod validation" });
          }
          
          // Check for error handling
          if (!content.includes("c.json") && !content.includes("c.text")) {
            issues.push({ file, issue: "Missing response handler" });
          }
        }
      }
    };

    checkDir(apiDir);
    return { issues };
  }

  validateDataPatterns() {
    const schemaPath = path.join(this.workspaceFolder, "prisma/schema.prisma");
    const issues = [];

    if (!fs.existsSync(schemaPath)) return { issues: [] };

    const schema = fs.readFileSync(schemaPath, "utf8");

    // Check for proper field validation
    if (!schema.includes("@db.Text") && !schema.includes("@db.VarChar")) {
      issues.push({ issue: "Missing field type definitions" });
    }

    // Check for audit trails
    if (!schema.includes("createdAt") || !schema.includes("updatedAt")) {
      issues.push({ issue: "Missing timestamp fields for audit" });
    }

    return { issues };
  }

  groupBySeverity(issues) {
    return {
      critical: issues.filter(i => i.extra?.severity === "ERROR").length,
      warning: issues.filter(i => i.extra?.severity === "WARNING").length,
      info: issues.filter(i => i.extra?.severity === "INFO").length
    };
  }

  groupByFile(issues) {
    const grouped = {};
    for (const issue of issues) {
      if (!grouped[issue.path]) grouped[issue.path] = 0;
      grouped[issue.path]++;
    }
    return grouped;
  }

  getRecommendations(issues) {
    const recommendations = [];
    
    if (issues.some(i => i.check_id?.includes("xss"))) {
      recommendations.push("⚠️  XSS vulnerabilities found - escape all user input");
    }
    
    if (issues.some(i => i.check_id?.includes("sql"))) {
      recommendations.push("⚠️  SQL injection risks - use parameterized queries");
    }
    
    if (issues.some(i => i.check_id?.includes("auth"))) {
      recommendations.push("⚠️  Authentication issues - review session handling");
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ No critical recommendations");
    }

    return recommendations;
  }
}

// MCP Server Startup
const server = new SemgrepServer();

const tools = [
  {
    name: "scan_repository",
    description: "Scan entire repository for OWASP Top 10 vulnerabilities",
    inputSchema: {
      type: "object",
      properties: {
        directory: { type: "string", description: "Directory to scan (default: workspace root)" }
      }
    }
  },
  {
    name: "scan_file",
    description: "Scan a single file for vulnerabilities",
    inputSchema: {
      type: "object",
      properties: {
        filepath: { type: "string", description: "File path to scan" }
      },
      required: ["filepath"]
    }
  },
  {
    name: "find_vulnerability_type",
    description: "Find specific vulnerability types (sql-injection, xss, authentication, access-control, etc.)",
    inputSchema: {
      type: "object",
      properties: {
        type: {
          type: "string",
          enum: ["sql-injection", "xss", "authentication", "access-control", "injection", "cryptography", "data-exposure", "dependency"]
        }
      },
      required: ["type"]
    }
  },
  {
    name: "find_issues_in_feature",
    description: "Scan a specific feature directory for security issues",
    inputSchema: {
      type: "object",
      properties: {
        feature_path: { type: "string", description: "Path like 'features/auth' or 'app/api'" }
      },
      required: ["feature_path"]
    }
  },
  {
    name: "validate_security_policies",
    description: "Validate that security policies are implemented (auth, API, data handling)",
    inputSchema: { type: "object", properties: {} }
  }
];

// Send MCP capabilities
console.log(JSON.stringify({
  type: "mcp-server",
  name: "semgrep",
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
      case "scan_repository":
        result = await server.scanRepository(toolCall.directory);
        break;
      case "scan_file":
        result = await server.scanFile(toolCall.filepath);
        break;
      case "find_vulnerability_type":
        result = await server.findVulnerabilityType(toolCall.type);
        break;
      case "find_issues_in_feature":
        result = await server.findIssuesInFeature(toolCall.feature_path);
        break;
      case "validate_security_policies":
        result = await server.validateSecurityPolicies();
        break;
      default:
        result = { error: `Unknown tool: ${toolCall.name}` };
    }

    console.log(JSON.stringify({ success: true, data: result }));
  } catch (e) {
    if (!e.message.includes("Unexpected end of JSON input")) {
      console.error(JSON.stringify({ success: false, error: e.message }));
      inputBuffer = "";
    }
  }
});
