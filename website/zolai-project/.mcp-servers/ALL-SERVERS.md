# 🚀 MCP Servers & AI Assistant Integration Guide

Complete guide to using MCP (Model Context Protocol) servers with GitHub Copilot, Cursor, and other AI assistants for the Zolai AI project.

---

## 📋 Quick Start (5 minutes)

### 1. Install Prerequisites
```bash
# Semgrep for security scanning
pip install semgrep

# Install MCP server dependencies
npm install @modelcontextprotocol/server-git @modelcontextprotocol/server-filesystem

# Make scripts executable
chmod +x .mcp-servers/*.js
```

### 2. Configure Your IDE

**For GitHub Copilot (VS Code):**
1. Install: `GitHub Copilot` + `GitHub Copilot Chat`
2. Settings → Copilot → Advanced → Enable Extensions
3. Reload VS Code

**For Cursor:**
1. Copy `.github/copilot-settings.json` to Cursor settings folder
2. Cursor will auto-detect all servers

### 3. Test Servers
```bash
# Test each server starts correctly
node .mcp-servers/security-audit.js | head -5
node .mcp-servers/semgrep-server.js | head -5
node .mcp-servers/automation-testing.js | head -5
node .mcp-servers/uiux-expert.js | head -5
node .mcp-servers/performance-optimization.js | head -5
node .mcp-servers/self-learning-health.js | head -5
```

All should output JSON with `tools` array.

---

## 🔍 Server Overview

### By Use Case

**🔒 I need a security review:**
→ `security-audit` (secrets, dependencies, env, database)
→ `semgrep` (OWASP scanning)
→ `self-learning-health` (health score)

**🧪 I want to test my code:**
→ `automation-testing` (generate + run tests)
→ `automation-testing` (coverage analysis)

**🎨 I need design feedback:**
→ `uiux-expert` (accessibility + design patterns)
→ `uiux-expert` (component templates)

**⚡ I want to improve performance:**
→ `performance-optimization` (bundle + images + metrics)
→ `performance-optimization` (database queries)

**🧠 I want codebase health check:**
→ `self-learning-health` (full diagnostics + auto-heal)
→ `self-learning-health` (personalized recommendations)

---

## 📊 Complete Server Registry

| Server | Category | Main Tools | Time | Logs |
|--------|----------|-----------|------|------|
| **security-audit** | 🔒 Security | 5 tools | 10-30s | security-audit.log |
| **semgrep** | 🔒 Security | 5 tools | 20-60s | semgrep.log |
| **automation-testing** | 🧪 Quality | 5 tools | 30-120s | automation-testing.log |
| **uiux-expert** | 🎨 Design | 3 tools | 2-5s | uiux-expert.log |
| **performance-optimization** | ⚡ Performance | 5 tools | 15-45s | performance.log |
| **self-learning-health** | 🧠 Intelligence | 5 tools | 10-30s | health.log + learning.log |
| **git** | 📚 Reference | Repository tools | <1s | Built-in |
| **filesystem** | 📚 Reference | File operations | <1s | Built-in |

---

## 🛠 Detailed Server Documentation

### Security Audit Server
**Location:** `.mcp-servers/security-audit.js`

**Tools:**
- `audit_dependencies` - Bun/npm audit for vulnerabilities
- `check_secret_exposure` - Pattern matching for hardcoded secrets
- `validate_env_config` - Verify all required env vars set
- `check_database_security` - Prisma schema security review
- `check_code_quality` - Cyclomatic complexity, unused variables

**Usage:**
```
"Run a dependency audit"
→ audit_dependencies tool
→ Shows vulnerabilities with fix recommendations

"Check for exposed secrets"
→ check_secret_exposure tool
→ Scans codebase for API keys, passwords
```

**Example Output:**
```json
{
  "vulnerabilities": [
    {
      "package": "lodash",
      "version": "4.17.19",
      "severity": "high",
      "fix": "npm install lodash@4.17.21"
    }
  ]
}
```

---

### Semgrep Server
**Location:** `.mcp-servers/semgrep-server.js`

**Tools:**
- `scan_repository` - Full OWASP Top 10 scan
- `scan_file` - Scan specific file
- `find_vulnerability_type` - Find all XSS/SQL injection/etc
- `find_issues_in_feature` - Scan feature folder
- `validate_security_policies` - Custom policy validation

**Coverage:**
- ✅ Injection attacks (SQL, NoSQL, Command)
- ✅ XSS vulnerabilities
- ✅ Authentication bypass
- ✅ Insecure deserialization
- ✅ Broken access control

**Usage:**
```
"Security scan the features/auth folder"
→ find_issues_in_feature tool
→ Reports vulnerabilities with line numbers

"Find all potential XSS vulnerabilities"
→ find_vulnerability_type("xss") tool
→ Shows unsafe DOM manipulations
```

---

### Automation Testing Server
**Location:** `.mcp-servers/automation-testing.js`

**Tools:**
- `run_tests` - Execute Playwright tests
- `generate_tests` - Create test templates
- `analyze_coverage` - Test coverage analysis
- `get_test_report` - HTML test report
- `validate_setup` - Check test environment

**Features:**
- ✅ Generate tests from feature description
- ✅ Run tests in headless/headed mode
- ✅ Coverage reports (line, branch, function)
- ✅ Flaky test detection
- ✅ Test environment validation

**Usage:**
```
"Generate tests for the login feature"
→ generate_tests tool
→ Creates describe/it blocks with best practices

"Run all tests and show coverage"
→ run_tests + analyze_coverage tools
→ Shows test results + coverage %
```

---

### UI/UX Expert Server
**Location:** `.mcp-servers/uiux-expert.js`

**Tools:**
- `review_design` - Full design audit
- `design_component_template` - Best practice templates
- `get_design_system` - Design token definitions

**Checks Performed:**
- ♿ **Accessibility (WCAG 2.1 AA)**
  - Color contrast ratios
  - Keyboard navigation
  - Screen reader compatibility
  - Focus indicators
  
- 🎨 **Design Patterns**
  - Consistency with design system
  - Button/form/card patterns
  - Responsive behavior
  
- 🧠 **Usability**
  - Information hierarchy
  - Call-to-action clarity
  - Mobile optimization

**Usage:**
```
"Review the design of the checkout page"
→ review_design tool
→ Shows WCAG violations, UX issues, improvements

"Give me a best-practice form template"
→ design_component_template("form") tool
→ Returns accessible form with labels, errors, validation
```

---

### Performance Optimization Server
**Location:** `.mcp-servers/performance-optimization.js`

**Tools:**
- `analyze_bundle_size` - Webpack/Turbopack analysis
- `analyze_images` - Image optimization opportunities
- `analyze_metrics` - Core Web Vitals tracking
- `suggest_optimizations` - Prioritized improvement list
- `analyze_database_queries` - Query performance

**Metrics Tracked:**
- 📊 **Core Web Vitals**
  - LCP (Largest Contentful Paint)
  - INP (Interaction to Next Paint)
  - CLS (Cumulative Layout Shift)
  
- 📦 **Bundle**
  - Total size
  - Tree-shakeable code
  - Duplicate dependencies
  
- 🖼️ **Images**
  - Unoptimized images
  - WebP conversion opportunities
  - Lazy loading potential

**Usage:**
```
"Analyze our bundle size"
→ analyze_bundle_size tool
→ Shows top dependencies, recommends code splitting

"What are the top performance improvements?"
→ suggest_optimizations tool
→ Prioritized list with impact estimates (5%-50% improvement)
```

---

### Self-Learning & Health Server
**Location:** `.mcp-servers/self-learning-health.js`

**Tools:**
- `diagnostic_health` - Full codebase health check
- `learn_from_session` - Record learnings
- `auto_heal_issues` - Auto-fix common problems
- `get_recommendations` - Personalized suggestions
- `get_metrics` - Learning & health metrics

**Health Checks:**
- ✅ Linting (ESLint)
- ✅ Type checking (TypeScript)
- ✅ Dependencies (vulnerabilities)
- ✅ Security (secrets, auth, validation)
- ✅ Tests (coverage, count)
- ✅ Performance (bundle, metrics)
- ✅ Documentation (README, AGENTS.md)
- ✅ Database (Prisma schema)

**Self-Learning:**
- Tracks error patterns
- Records successful approaches
- Builds knowledge base
- Generates insights
- Improves recommendations over time

**Usage:**
```
"Full health check"
→ diagnostic_health tool
→ Shows score across 8 dimensions

"Heal the codebase"
→ auto_heal_issues tool
→ Fixes ESLint, formats with Prettier, updates Prisma types

"What should I improve?"
→ get_recommendations tool
→ Personalized based on learning from previous sessions
```

**Knowledge Base:**
```bash
# View accumulated knowledge
cat .mcp-servers/knowledge-base.json

# Tracks:
# - Learning sessions count
# - Error patterns
# - Success patterns
# - Health score history
```

---

## 🎯 Workflow Examples

### Developer: "Add a new authentication feature"

```
1. "Generate security tests for the new auth flow"
   → automation-testing: generate_tests
   → Creates test templates

2. "Scan the features/auth folder for vulnerabilities"
   → semgrep: find_issues_in_feature
   → Reports XSS, injection risks

3. "Check for hardcoded secrets"
   → security-audit: check_secret_exposure
   → Verifies no secrets exposed

4. "Full health check"
   → self-learning-health: diagnostic_health
   → Shows overall codebase health

Result: Secure, tested, healthy feature
```

### Security Engineer: "Full security audit"

```
1. "Audit all dependencies"
   → security-audit: audit_dependencies
   → Shows vulnerabilities

2. "Full OWASP scan"
   → semgrep: scan_repository
   → Comprehensive vulnerability report

3. "Check database security"
   → security-audit: check_database_security
   → Validates Prisma schema

4. "Learn from this session"
   → self-learning-health: learn_from_session
   → Records patterns for future

Result: Security report + improved recommendations
```

### QA Engineer: "Prepare for release"

```
1. "Generate integration tests"
   → automation-testing: generate_tests
   → Test templates for new features

2. "Run full test suite"
   → automation-testing: run_tests
   → Execute all tests

3. "Coverage analysis"
   → automation-testing: analyze_coverage
   → Show uncovered code

4. "Health check before release"
   → self-learning-health: diagnostic_health
   → Final validation

Result: Release-ready with test coverage
```

### UX Designer: "Design review"

```
1. "Review design of dashboard"
   → uiux-expert: review_design
   → WCAG + usability issues

2. "Give me an accessible button template"
   → uiux-expert: design_component_template
   → Best practice button code

3. "Full design system audit"
   → uiux-expert: get_design_system
   → Token definitions

Result: Accessible, consistent, usable design
```

---

## 📁 File Structure

```
.mcp-servers/
├── security-audit.js              # Security scanning
├── semgrep-server.js              # OWASP analysis
├── automation-testing.js           # Test automation
├── uiux-expert.js                 # Design review
├── performance-optimization.js     # Performance analysis
├── self-learning-health.js        # Health + learning
├── knowledge-base.json            # Accumulated knowledge
├── README.md                       # Setup guide
├── REGISTRY.md                     # Complete registry
├── logs/
│   ├── security-audit.log
│   ├── semgrep.log
│   ├── automation-testing.log
│   ├── uiux-expert.log
│   ├── performance.log
│   ├── health.log
│   └── learning.log
└── ALL-SERVERS.md                 # This file

.github/
├── copilot-instructions.md        # Master reference
├── copilot-settings.json          # Server configuration
└── COPILOT_SETUP.md              # Quick setup
```

---

## 🔧 Configuration

### In VS Code `.vscode/settings.json`:

```json
{
  "github.copilot.enable": {
    "*": true,
    "plaintext": false
  },
  "github.copilot.chat.localeOverride": "en"
}
```

### In Cursor `.cursor/settings.json`:

Copy content from `.github/copilot-settings.json`

---

## 📊 Monitoring & Logs

### Real-time Log Monitoring

```bash
# Watch all logs
tail -f .mcp-servers/logs/*.log

# Watch specific server
tail -f .mcp-servers/logs/health.log

# Filter by severity
grep "ERROR\|CRITICAL" .mcp-servers/logs/*.log

# See learning insights
grep "pattern\|improvement" .mcp-servers/logs/learning.log
```

### Knowledge Base Analysis

```bash
# View knowledge base
cat .mcp-servers/knowledge-base.json | jq

# Check health score trend
jq '.health_score' .mcp-servers/knowledge-base.json

# See error patterns
jq '.error_patterns' .mcp-servers/knowledge-base.json

# List improvements made
jq '.improvements_made' .mcp-servers/knowledge-base.json
```

---

## ⚠️ Troubleshooting

### Server Won't Start

**Symptom:** "Error: Cannot find module"

**Fix:**
```bash
# Install dependencies
npm install @modelcontextprotocol/server-git @modelcontextprotocol/server-filesystem

# Install Semgrep
pip install semgrep

# Make executable
chmod +x .mcp-servers/*.js

# Test
node .mcp-servers/security-audit.js
```

### Timeout Errors

**Symptom:** "Tool call timed out"

**Fix:** Increase timeout in `.github/copilot-settings.json`:
```json
{
  "semgrep": {
    "timeout": 120000  // 2 minutes instead of 1
  }
}
```

### Semgrep Not Found

**Symptom:** "semgrep: command not found"

**Fix:**
```bash
pip install semgrep

# Verify
semgrep --version
```

### Logs Not Appearing

**Symptom:** No log files created

**Fix:**
```bash
# Create logs directory
mkdir -p .mcp-servers/logs

# Make directory writable
chmod 755 .mcp-servers/logs
```

---

## 🚀 Advanced Usage

### CI/CD Integration

**In `.github/workflows/security.yml`:**
```yaml
- name: Security Audit
  run: |
    node .mcp-servers/security-audit.js <<< '{
      "name": "audit_dependencies"
    }' > security-report.json
    
- name: Upload Results
  uses: actions/upload-artifact@v3
  with:
    name: security-report
    path: security-report.json
```

### Batch Operations

```bash
# Run all security checks
for server in security-audit.js semgrep-server.js; do
  echo "Testing $server..."
  node .mcp-servers/$server | jq '.tools | length' 
done
```

### Custom Scripts

Create `.mcp-servers/custom-audit.sh`:
```bash
#!/bin/bash
node .mcp-servers/security-audit.js
node .mcp-servers/semgrep-server.js
node .mcp-servers/self-learning-health.js
```

---

## 📚 Learning Resources

- See `.github/copilot-instructions.md` for full development guide
- See `AGENTS.md` for code conventions and patterns
- See `CLAUDE.md` for architecture overview
- See `.mcp-servers/REGISTRY.md` for server details

---

## ✅ Verification Checklist

- [ ] Semgrep installed: `semgrep --version`
- [ ] Scripts executable: `ls -la .mcp-servers/*.js | grep rwx`
- [ ] Servers start: `node .mcp-servers/security-audit.js`
- [ ] Logs directory exists: `ls -d .mcp-servers/logs`
- [ ] Settings configured: `.github/copilot-settings.json` exists
- [ ] IDE reloaded: VS Code/Cursor recognizes servers
- [ ] Knowledge base created: `.mcp-servers/knowledge-base.json` exists
- [ ] Test a server: "Run security audit" in Copilot Chat

---

## 🎯 Next Steps

1. ✅ Run setup: `pip install semgrep && chmod +x .mcp-servers/*.js`
2. ✅ Test servers: `node .mcp-servers/security-audit.js`
3. ✅ Configure IDE: Copy `copilot-settings.json` or enable in VS Code
4. ✅ Try a task: Ask Copilot "Run security audit"
5. ✅ Monitor learning: Check `knowledge-base.json`
6. ✅ Use recommendations: Apply insights from `get_recommendations`

---

**Status:** ✅ All 6 MCP servers configured and ready
**Last Updated:** 2024
**Version:** 2.0.0
