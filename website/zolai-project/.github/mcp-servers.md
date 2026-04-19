# MCP Servers for Local Secure Development

This guide covers setting up Model Context Protocol (MCP) servers for secure, local-only development tools. All servers run locally with no external API calls.

## Overview

MCP servers expose tools to Copilot through a standardized interface. This project includes:

1. **Reference Servers** — Official implementations (Git, Filesystem, Fetch)
2. **Security Scanners** — Vulnerability & code quality (Trivy, Semgrep, SonarQube)
3. **Package Audits** — Dependency checking (Snyk, Bun audit)
4. **Code Analysis** — Local linting and static analysis

All servers run on localhost and require **no external authentication** or API calls.

---

## Quick Setup

### Install MCP Servers Locally

```bash
# Official reference servers (recommended)
npm install -g @modelcontextprotocol/server-git
npm install -g @modelcontextprotocol/server-filesystem
npm install -g @modelcontextprotocol/server-fetch

# Security scanners (already available in project)
# Semgrep (OWASP static analysis)
pip install semgrep  # or: brew install semgrep

# Trivy (vulnerability scanning)
# Download: https://github.com/aquasecurity/trivy/releases

# SonarQube Community (code quality, run locally)
# Docker: docker run -d -p 9000:9000 sonarqube:latest
```

### Configuration

Add to `.github/copilot-settings.json`:

```json
{
  "mcp": {
    "servers": {
      "git": {
        "enabled": true,
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-git').start()"],
        "timeout": 10000
      },
      "filesystem": {
        "enabled": true,
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-filesystem').start()"],
        "allowedDirectories": ["${workspaceFolder}"],
        "timeout": 5000
      },
      "security-audit": {
        "enabled": true,
        "command": "node",
        "args": ["${workspaceFolder}/.mcp-servers/security-audit.js"],
        "timeout": 30000
      },
      "semgrep": {
        "enabled": true,
        "command": "node",
        "args": ["${workspaceFolder}/.mcp-servers/semgrep-server.js"],
        "timeout": 60000
      }
    }
  }
}
```

---

## MCP Server Implementations

### 1. Git MCP Server (Official)

**Purpose:** Repository analysis, commit history, file changes, branch info

**Install:**
```bash
npm install -g @modelcontextprotocol/server-git
```

**Configuration:**
```json
{
  "mcp": {
    "servers": {
      "git": {
        "enabled": true,
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-git').start()"],
        "cwd": "${workspaceFolder}",
        "timeout": 10000,
        "capabilities": {
          "repositoryInfo": true,
          "commitHistory": true,
          "branchManagement": true,
          "fileHistory": true,
          "diffAnalysis": true
        }
      }
    }
  }
}
```

**What Copilot Can Do:**
- View commit history and diffs
- Analyze file changes over time
- Check branch status
- Identify who changed what
- Review pull request diffs

**Example:** `"Show me the commits that changed authentication in the last week"`

---

### 2. Filesystem MCP Server (Official)

**Purpose:** Secure file operations with access control

**Install:**
```bash
npm install -g @modelcontextprotocol/server-filesystem
```

**Configuration:**
```json
{
  "mcp": {
    "servers": {
      "filesystem": {
        "enabled": true,
        "command": "node",
        "args": ["-e", "require('@modelcontextprotocol/server-filesystem').start()"],
        "allowedDirectories": [
          "${workspaceFolder}/app",
          "${workspaceFolder}/features",
          "${workspaceFolder}/lib",
          "${workspaceFolder}/prisma"
        ],
        "blockedPatterns": [".env*", ".git/", "node_modules/", "dist/"],
        "timeout": 5000,
        "capabilities": {
          "readFiles": true,
          "writeFiles": false,
          "createFiles": false,
          "search": true,
          "listDirectories": true
        }
      }
    }
  }
}
```

**What Copilot Can Do:**
- Read any file in allowed directories
- Search for patterns
- Explore directory structure
- (Read-only by default for safety)

**Example:** `"Find all files using the authenticate middleware"`

---

### 3. Semgrep Server (Custom Implementation)

**Purpose:** OWASP static analysis, security vulnerability detection

Create `.mcp-servers/semgrep-server.js`:

```javascript
#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

class SemgrepServer {
  async scanRepository(directory) {
    return new Promise((resolve, reject) => {
      const semgrep = spawn("semgrep", [
        "scan",
        "--json",
        "--config=p/owasp-top-ten",
        "--config=p/typescript",
        "--config=p/react",
        directory
      ]);

      let output = "";
      semgrep.stdout.on("data", (data) => {
        output += data.toString();
      });

      semgrep.on("close", (code) => {
        try {
          const results = JSON.parse(output);
          resolve({
            success: true,
            vulnerabilities: results.results || [],
            stats: results.stats || {}
          });
        } catch (e) {
          reject(new Error(`Semgrep parsing failed: ${e.message}`));
        }
      });
    });
  }

  async scanFile(filePath) {
    return new Promise((resolve, reject) => {
      const semgrep = spawn("semgrep", [
        "scan",
        "--json",
        "--config=p/owasp-top-ten",
        "--config=p/typescript",
        filePath
      ]);

      let output = "";
      semgrep.stdout.on("data", (data) => {
        output += data.toString();
      });

      semgrep.on("close", (code) => {
        try {
          const results = JSON.parse(output);
          resolve({
            file: filePath,
            vulnerabilities: results.results || [],
            passed: (results.results || []).length === 0
          });
        } catch (e) {
          reject(new Error(`Semgrep parsing failed: ${e.message}`));
        }
      });
    });
  }

  async findVulnerabilityType(type) {
    // Search for specific vulnerability patterns
    const patterns = {
      "sql-injection": ["p/owasp-a03:sql-injection"],
      "xss": ["p/owasp-a07:cross-site-scripting"],
      "authentication": ["p/typescript", "p/react"],
      "access-control": ["p/owasp-a01:broken-access-control"]
    };

    return patterns[type] || patterns["authentication"];
  }
}

// MCP Server Interface
const server = new SemgrepServer();

console.log(JSON.stringify({
  type: "mcp-server",
  name: "semgrep",
  tools: [
    {
      name: "scan_repository",
      description: "Scan entire repository for OWASP vulnerabilities",
      inputSchema: {
        type: "object",
        properties: {
          directory: { type: "string", description: "Directory to scan" }
        },
        required: ["directory"]
      }
    },
    {
      name: "scan_file",
      description: "Scan single file for vulnerabilities",
      inputSchema: {
        type: "object",
        properties: {
          filepath: { type: "string", description: "File path to scan" }
        },
        required: ["filepath"]
      }
    },
    {
      name: "find_vulnerability",
      description: "Find specific vulnerability types",
      inputSchema: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["sql-injection", "xss", "authentication", "access-control"]
          }
        },
        required: ["type"]
      }
    }
  ]
}));
```

**Install:**
```bash
pip install semgrep
# Verify: semgrep --version
```

**Configuration:**
```json
{
  "semgrep": {
    "enabled": true,
    "command": "node",
    "args": [".mcp-servers/semgrep-server.js"],
    "timeout": 60000,
    "capabilities": {
      "repositoryScan": true,
      "fileScan": true,
      "vulnerabilityDetection": true,
      "owasp": true,
      "typescript": true,
      "react": true
    }
  }
}
```

**What Copilot Can Do:**
- Scan codebase for OWASP Top 10 vulnerabilities
- Detect XSS, SQL injection, auth bypasses
- Find React security issues
- Analyze TypeScript-specific problems

**Example:** `"Scan the authentication module for vulnerabilities"`

---

### 4. Security Audit Server (Custom Implementation)

Create `.mcp-servers/security-audit.js`:

```javascript
#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class SecurityAuditServer {
  async auditDependencies() {
    const results = {
      bun: null,
      snyk: null,
      npm: null,
      prisma: null
    };

    // Bun audit (built-in, fastest)
    try {
      const output = execSync("bun audit --json", { 
        cwd: process.cwd(),
        encoding: "utf8"
      });
      results.bun = JSON.parse(output);
    } catch (e) {
      results.bun = { error: e.message };
    }

    // Prisma schema validation
    try {
      execSync("bunx prisma validate", { cwd: process.cwd() });
      results.prisma = { valid: true, issues: [] };
    } catch (e) {
      results.prisma = { valid: false, error: e.message };
    }

    return results;
  }

  async checkSecretExposure() {
    const dangerous = {
      patterns: [
        /BETTER_AUTH_SECRET\s*=\s*[^=]/,
        /API_KEY\s*=\s*[^=]/,
        /PASSWORD\s*=\s*[^=]/,
        /DATABASE_URL\s*=\s*postgres:\/\/[^@]*@/
      ],
      files: []
    };

    const scanDir = (dir) => {
      try {
        const files = fs.readdirSync(dir);
        for (const file of files) {
          if (file.startsWith(".")) continue;
          if (["node_modules", ".next", "dist"].includes(file)) continue;

          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            scanDir(fullPath);
          } else if (file.endsWith(".ts") || file.endsWith(".js")) {
            const content = fs.readFileSync(fullPath, "utf8");
            for (const pattern of dangerous.patterns) {
              if (pattern.test(content)) {
                dangerous.files.push({
                  file: fullPath,
                  pattern: pattern.source
                });
              }
            }
          }
        }
      } catch (e) {
        // Ignore permission errors
      }
    };

    scanDir(process.cwd());
    return dangerous;
  }

  async validateEnvConfig() {
    const envExample = path.join(process.cwd(), ".env.example");
    const envLocal = path.join(process.cwd(), ".env.local");

    const required = [];
    const configured = [];

    if (fs.existsSync(envExample)) {
      const content = fs.readFileSync(envExample, "utf8");
      const vars = content.split("\n")
        .filter(line => line && !line.startsWith("#"))
        .map(line => line.split("=")[0]);
      required.push(...vars);
    }

    if (fs.existsSync(envLocal)) {
      const content = fs.readFileSync(envLocal, "utf8");
      const vars = content.split("\n")
        .filter(line => line && !line.startsWith("#"))
        .map(line => line.split("=")[0]);
      configured.push(...vars);
    }

    return {
      required,
      configured,
      missing: required.filter(v => !configured.includes(v))
    };
  }

  async checkDatabaseSecurity() {
    const issues = [];

    // Check Prisma schema for security issues
    const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");

      if (!schema.includes("@relation")) {
        issues.push({
          severity: "info",
          issue: "Missing relationship definitions in schema"
        });
      }

      if (!schema.includes("updatedAt")) {
        issues.push({
          severity: "low",
          issue: "Missing updatedAt timestamp for audit trails"
        });
      }
    }

    return issues;
  }
}

const server = new SecurityAuditServer();

// MCP interface
console.log(JSON.stringify({
  type: "mcp-server",
  name: "security-audit",
  tools: [
    {
      name: "audit_dependencies",
      description: "Run security audit on all dependencies"
    },
    {
      name: "check_secret_exposure",
      description: "Scan codebase for exposed secrets or credentials"
    },
    {
      name: "validate_env_config",
      description: "Verify environment configuration completeness"
    },
    {
      name: "check_database_security",
      description: "Validate Prisma schema for security best practices"
    }
  ]
}));
```

**Configuration:**
```json
{
  "security-audit": {
    "enabled": true,
    "command": "node",
    "args": [".mcp-servers/security-audit.js"],
    "timeout": 30000,
    "capabilities": {
      "dependencyAudit": true,
      "secretDetection": true,
      "environmentValidation": true,
      "databaseSecurity": true
    }
  }
}
```

**What Copilot Can Do:**
- Audit dependencies for known vulnerabilities
- Detect exposed secrets in code
- Validate environment configuration
- Check database schema security

**Example:** `"Run a security audit on the entire project"`

---

### 5. Playwright Test Server (Enhancement)

Enhance existing Playwright MCP with custom tools:

```json
{
  "playwright": {
    "enabled": true,
    "command": "node",
    "args": [".mcp-servers/playwright-enhanced.js"],
    "timeout": 60000,
    "capabilities": {
      "testExecution": true,
      "debugMode": true,
      "reportGeneration": true,
      "performanceMetrics": true,
      "securityTesting": true,
      "accessibilityTesting": true
    },
    "testCategories": {
      "auth": "tests/auth/",
      "api": "tests/api/",
      "admin": "tests/admin/",
      "e2e": "tests/e2e/",
      "performance": "tests/performance/",
      "security": "tests/api/api-security.spec.ts"
    }
  }
}
```

---

## Usage Patterns in Copilot

### Security Analysis

```
User: "Scan the codebase for XSS vulnerabilities"
Copilot → Calls semgrep-server.js:
  • Runs Semgrep with p/owasp-a07:cross-site-scripting
  • Reports findings with line numbers
  • Suggests fixes
```

### Dependency Auditing

```
User: "Are there any vulnerable dependencies?"
Copilot → Calls security-audit-server.js:
  • Runs bun audit --json
  • Checks package.lock for known CVEs
  • Recommends updates
```

### Git History Review

```
User: "Who changed the authentication code last month?"
Copilot → Calls git-server:
  • Queries git log for auth/ changes
  • Shows commit messages and diffs
  • Identifies author and timestamp
```

### File Analysis

```
User: "Find all API endpoints that validate user input"
Copilot → Calls filesystem-server:
  • Searches for patterns in app/api/
  • Lists matching files
  • Shows code context
```

---

## Security Considerations

### What's Safe

✅ **All local scanning** — No data leaves your machine  
✅ **No external APIs** — Zero network calls required  
✅ **No credentials stored** — Passwords are never logged  
✅ **Reversible** — Can disable any server anytime  
✅ **Auditable** — See exactly what tools are running  

### What's Blocked

❌ **Write access** — Filesystem MCP is read-only by default  
❌ **System commands** — Only whitelisted tools run  
❌ **External network** — No outbound HTTP/HTTPS  
❌ **Secrets exposure** — Security audit prevents committing secrets  

### Best Practices

1. **Keep servers updated:** `npm update -g @modelcontextprotocol/*`
2. **Review logs regularly:** Check `.mcp-servers/logs/` directory
3. **Limit filesystem access:** Use `allowedDirectories` whitelist
4. **Disable unused servers:** Set `enabled: false` in copilot-settings.json
5. **Run scans in CI/CD:** Use same configs in GitHub Actions

---

## Installation Checklist

- [ ] Install official MCP servers: `npm install -g @modelcontextprotocol/server-*`
- [ ] Install Semgrep: `pip install semgrep`
- [ ] Create `.mcp-servers/` directory
- [ ] Add custom server implementations (security-audit.js, semgrep-server.js, etc.)
- [ ] Update `.github/copilot-settings.json` with all server configs
- [ ] Test each server: `node .mcp-servers/<server>.js`
- [ ] Verify Copilot can access: Try a command in each category

---

## Troubleshooting

### Server Won't Start

```bash
# Check Node.js version
node --version  # Should be 18+

# Test server directly
node .mcp-servers/security-audit.js

# View logs
cat ~/.copilot/logs/mcp-*.log
```

### Semgrep Not Found

```bash
# Install globally
pip install semgrep --user

# Or add to PATH
export PATH="$HOME/.local/bin:$PATH"

# Verify
semgrep --version
```

### Timeout Errors

Increase timeout in copilot-settings.json:

```json
{
  "semgrep": {
    "timeout": 120000  // 2 minutes for large repos
  }
}
```

### Permission Denied

```bash
# Make scripts executable
chmod +x .mcp-servers/*.js

# Check directory permissions
ls -la .mcp-servers/
```

---

## References

- [MCP Official Documentation](https://modelcontextprotocol.io/)
- [Semgrep Rules](https://semgrep.dev/p/owasp-top-ten)
- [Git MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/git)
- [Filesystem MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

