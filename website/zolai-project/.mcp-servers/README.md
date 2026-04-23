# Local Secure MCP Servers - Installation & Setup

This guide walks through setting up local-only MCP servers for security scanning, dependency auditing, and code analysis—all running without external API calls.

## What You Get

✅ **Zero external dependencies** — Everything runs locally  
✅ **No API credentials needed** — No Copilot API keys or external services  
✅ **Instant feedback** — Semgrep, security audits, type checking  
✅ **Full audit trail** — Logs in `.mcp-servers/logs/`  
✅ **Integrated with Copilot** — Ask questions, get instant answers  

## Files Included

```
.mcp-servers/
├── logs/                    # Audit logs (created automatically)
├── security-audit.js        # Dependency & secret scanning
├── semgrep-server.js        # OWASP vulnerability detection
└── README.md               # This file
```

## Quick Setup (5 minutes)

### Step 1: Install Prerequisites

```bash
# Semgrep (OWASP static analysis)
pip install semgrep

# Verify installation
semgrep --version

# Test Semgrep
semgrep scan --json --config=p/owasp-top-ten . | head -20
```

### Step 2: Make Scripts Executable

```bash
chmod +x .mcp-servers/security-audit.js
chmod +x .mcp-servers/semgrep-server.js
```

### Step 3: Update Copilot Settings

In `.github/copilot-settings.json`, add the servers section:

```json
{
  "copilot": {
    "mcp": {
      "enabled": true,
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
          "timeout": 30000,
          "capabilities": ["dependency-audit", "secret-detection", "env-validation", "db-security", "code-quality"]
        },
        "semgrep": {
          "enabled": true,
          "command": "node",
          "args": ["${workspaceFolder}/.mcp-servers/semgrep-server.js"],
          "timeout": 60000,
          "capabilities": ["repository-scan", "file-scan", "vulnerability-detection", "owasp", "policy-validation"]
        }
      }
    }
  }
}
```

### Step 4: Test the Servers

```bash
# Test security-audit server
node .mcp-servers/security-audit.js

# Test semgrep server
node .mcp-servers/semgrep-server.js

# Both should print JSON with available tools
```

## Server Documentation

### Security Audit Server

**Purpose:** Dependency auditing, secret detection, environment validation, database security

**Available Tools:**
- `audit_dependencies` — Run Bun/NPM audit + Prisma validation
- `check_secret_exposure` — Scan for hardcoded secrets/credentials
- `validate_env_config` — Verify .env configuration
- `check_database_security` — Validate Prisma schema
- `check_code_quality` — Run ESLint + TypeScript checks

**Example Usage in Copilot:**
```
User: "Are there any vulnerable dependencies?"
Copilot → Calls security-audit:audit_dependencies
Result: List of CVEs with severity and fix suggestions

User: "Run a full security audit"
Copilot → Calls all security-audit tools
Result: Comprehensive security report
```

**Logs:** `.mcp-servers/logs/security-audit.log`

### Semgrep Server

**Purpose:** OWASP static analysis, vulnerability detection, security policy validation

**Available Tools:**
- `scan_repository` — Full repo scan for OWASP Top 10
- `scan_file` — Scan single file
- `find_vulnerability_type` — Find specific vuln types (XSS, SQL injection, etc.)
- `find_issues_in_feature` — Scan feature directory
- `validate_security_policies` — Check auth, API, data handling patterns

**Example Usage in Copilot:**
```
User: "Scan for XSS vulnerabilities"
Copilot → Calls semgrep:find_vulnerability_type("xss")
Result: List of XSS issues with line numbers and fixes

User: "Check the authentication module for security issues"
Copilot → Calls semgrep:find_issues_in_feature("features/auth")
Result: Security issues specific to auth feature
```

**Logs:** `.mcp-servers/logs/semgrep.log`

## Usage Patterns

### Full Security Audit (Recommended)

```
User: "Give me a full security audit of the project"

Copilot will:
1. Run security-audit:audit_dependencies
   → Check for CVEs in dependencies
2. Run security-audit:check_secret_exposure
   → Scan for hardcoded secrets
3. Run security-audit:validate_env_config
   → Verify environment setup
4. Run semgrep:scan_repository
   → Full OWASP scan
5. Run security-audit:check_database_security
   → Validate Prisma schema
6. Compile results into security report
```

### Pre-Commit Security Check

```
User: "Check the modified files for security issues"

Copilot will:
1. Use Git MCP to identify changed files
2. Run semgrep:scan_file for each file
3. Report any critical/high severity issues
4. Suggest fixes or refactoring
```

### Feature Security Review

```
User: "Security audit the authentication feature"

Copilot will:
1. Run semgrep:find_issues_in_feature("features/auth")
2. Run security-audit:check_secret_exposure (auth files only)
3. Validate auth patterns against security policies
4. Suggest hardening measures
```

### Dependency Update Safety

```
User: "Is it safe to upgrade React to v19.2?"

Copilot will:
1. Check current dependency audit
2. Simulate with new version
3. Report any new vulnerabilities
4. Recommend alternatives if unsafe
```

## Security Guarantees

### What's Safe ✅

- **Local only** — No data leaves your machine
- **No authentication** — No API keys, no external services
- **Reversible** — Can disable any server instantly
- **Auditable** — Full logs in `.mcp-servers/logs/`
- **Sandboxed** — Filesystem MCP is read-only
- **No credentials stored** — Passwords never logged

### What's Blocked ❌

- **Write operations** — Filesystem MCP read-only by default
- **System commands** — Only whitelisted tools execute
- **Network calls** — No outbound HTTP/HTTPS
- **Secret exposure** — Active scanning prevents secret commits

## Troubleshooting

### Semgrep Not Found

```bash
# Install with Homebrew (macOS)
brew install semgrep

# Install with pip
pip install semgrep --user

# Verify
which semgrep
semgrep --version
```

### Node.js Version Too Old

```bash
# Check version (need 16+)
node --version

# Update Node
nvm install 18
nvm use 18
```

### Timeout Errors

Increase timeout in `.github/copilot-settings.json`:

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

### Server Output Errors

```bash
# Test server directly
node .mcp-servers/security-audit.js 2>&1

# View logs
tail -f .mcp-servers/logs/*.log

# Clear logs
rm .mcp-servers/logs/*.log
```

## Advanced Configuration

### Restrict Filesystem Access

In `.github/copilot-settings.json`, limit which directories can be read:

```json
{
  "filesystem": {
    "enabled": true,
    "allowedDirectories": [
      "${workspaceFolder}/app",
      "${workspaceFolder}/features",
      "${workspaceFolder}/lib",
      "${workspaceFolder}/prisma"
    ],
    "blockedPatterns": [".env*", ".git/", "node_modules/", "dist/"]
  }
}
```

### Custom Semgrep Rules

Create `.semgrep.yml` in project root for custom rules:

```yaml
rules:
  - id: no-console-logs-in-production
    pattern: console.log(...)
    message: Remove console.log from production code
    languages: [typescript, javascript]
    severity: WARNING

  - id: require-input-validation
    pattern: |
      app.$METHOD(
        $PATH,
        $HANDLER
      )
    message: All API handlers must use Zod validation
    languages: [typescript]
    severity: ERROR
```

### Disable Specific Servers

To disable a server temporarily:

```json
{
  "semgrep": {
    "enabled": false,  // Won't start
    "command": "..."
  }
}
```

## Integration with CI/CD

### GitHub Actions Example

Add to `.github/workflows/security.yml`:

```yaml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Install Semgrep
        run: pip install semgrep
      
      - name: Run security audit
        run: node .mcp-servers/security-audit.js <<< '{"name":"audit_dependencies"}'
      
      - name: Run Semgrep scan
        run: semgrep scan --json --config=p/owasp-top-ten .
```

## Best Practices

1. **Run before commit:** Ask Copilot for security review
2. **Check logs regularly:** Review `.mcp-servers/logs/`
3. **Keep Semgrep updated:** `pip install --upgrade semgrep`
4. **Enable git pre-commit hook:** Run audit before push
5. **Review high-severity issues immediately:** Don't ignore CRITICAL findings
6. **Disable unused servers:** Reduce overhead
7. **Configure timeout properly:** Larger repos need longer timeouts

## Logs & Monitoring

### Viewing Logs

```bash
# Real-time log viewing
tail -f .mcp-servers/logs/*.log

# Count issues by server
grep ERROR .mcp-servers/logs/*.log | wc -l

# Search for specific issues
grep "CRITICAL\|HIGH" .mcp-servers/logs/*.log
```

### Log Rotation (Optional)

Add to crontab (keep last 7 days):

```bash
0 0 * * * find .mcp-servers/logs -name "*.log" -mtime +7 -delete
```

## Getting Help

### From Copilot

```
User: "What tools are available for security scanning?"
Copilot: Lists all MCP servers and capabilities

User: "How do I use the semgrep server?"
Copilot: Shows examples and available tools

User: "Explain this Semgrep finding: [error message]"
Copilot: Explains vulnerability and suggests fix
```

### Test Commands

```bash
# Verify all servers are working
for server in security-audit semgrep; do
  echo "Testing $server..."
  node ".mcp-servers/${server}.js" <<< '{}' 2>&1 | head -5
done

# Run full audit
node .mcp-servers/security-audit.js <<< '{"name":"audit_dependencies"}'
node .mcp-servers/security-audit.js <<< '{"name":"check_secret_exposure"}'
```

## Next Steps

1. ✅ Install Semgrep: `pip install semgrep`
2. ✅ Make scripts executable: `chmod +x .mcp-servers/*.js`
3. ✅ Update `.github/copilot-settings.json` with server configs
4. ✅ Test servers: `node .mcp-servers/security-audit.js`
5. ✅ Ask Copilot: "Run a security audit"
6. ✅ Review logs: `tail -f .mcp-servers/logs/*.log`

## References

- [Semgrep Rules](https://semgrep.dev/r)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [MCP Protocol](https://modelcontextprotocol.io/)
- [Node.js Child Process](https://nodejs.org/api/child_process.html)
