# MCP Servers Complete Registry

All MCP servers available for this project. Each server runs locally with zero external dependencies.

## Server Categories

### 🔒 Security & Compliance (3 servers)

| Server | Purpose | Tools | Logs |
|--------|---------|-------|------|
| **security-audit.js** | Dependency auditing, secret detection, env validation | `audit_dependencies`, `check_secret_exposure`, `validate_env_config`, `check_database_security`, `check_code_quality` | `security-audit.log` |
| **semgrep-server.js** | OWASP vulnerability detection, static analysis | `scan_repository`, `scan_file`, `find_vulnerability_type`, `find_issues_in_feature`, `validate_security_policies` | `semgrep.log` |

### 🧪 Testing & Quality (2 servers)

| Server | Purpose | Tools | Logs |
|--------|---------|-------|------|
| **automation-testing.js** | Test execution, generation, coverage analysis | `run_tests`, `generate_tests`, `analyze_coverage`, `get_test_report`, `validate_setup` | `automation-testing.log` |

### 🎨 Design & UX (1 server)

| Server | Purpose | Tools | Logs |
|--------|---------|-------|------|
| **uiux-expert.js** | Design review, accessibility checks, component templates | `review_design`, `design_component_template`, `get_design_system` | `uiux-expert.log` |

### ⚡ Performance (1 server)

| Server | Purpose | Tools | Logs |
|--------|---------|-------|------|
| **performance-optimization.js** | Bundle analysis, image optimization, Core Web Vitals | `analyze_bundle_size`, `analyze_images`, `analyze_metrics`, `suggest_optimizations`, `analyze_database_queries` | `performance.log` |

### 🧠 Intelligence (1 server)

| Server | Purpose | Tools | Logs |
|--------|---------|-------|------|
| **self-learning-health.js** | Health diagnostics, auto-healing, self-learning, recommendations | `diagnostic_health`, `learn_from_session`, `auto_heal_issues`, `get_recommendations`, `get_metrics` | `health.log`, `learning.log`, `knowledge-base.json` |

### 📚 Official Reference Servers (Optional)

| Server | Source | Purpose |
|--------|--------|---------|
| **Git** | @modelcontextprotocol/server-git | Repository analysis, commits, diffs |
| **Filesystem** | @modelcontextprotocol/server-filesystem | File operations (read-only) |
| **Fetch** | @modelcontextprotocol/server-fetch | Web content fetching |

---

## Complete Configuration

Add to `.github/copilot-settings.json`:

```json
{
  "copilot": {
    "mcp": {
      "enabled": true,
      "servers": {
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
        },
        "automation-testing": {
          "enabled": true,
          "command": "node",
          "args": ["${workspaceFolder}/.mcp-servers/automation-testing.js"],
          "timeout": 60000
        },
        "uiux-expert": {
          "enabled": true,
          "command": "node",
          "args": ["${workspaceFolder}/.mcp-servers/uiux-expert.js"],
          "timeout": 15000
        },
        "performance-optimization": {
          "enabled": true,
          "command": "node",
          "args": ["${workspaceFolder}/.mcp-servers/performance-optimization.js"],
          "timeout": 45000
        },
        "self-learning-health": {
          "enabled": true,
          "command": "node",
          "args": ["${workspaceFolder}/.mcp-servers/self-learning-health.js"],
          "timeout": 30000
        },
        "git": {
          "enabled": true,
          "command": "npm",
          "args": ["exec", "@modelcontextprotocol/server-git"],
          "timeout": 10000
        },
        "filesystem": {
          "enabled": true,
          "command": "npm",
          "args": ["exec", "@modelcontextprotocol/server-filesystem"],
          "allowedDirectories": ["${workspaceFolder}"],
          "timeout": 5000
        }
      }
    }
  }
}
```

---

## Usage Examples by Role

### 🔒 Security Engineer

```
User: "Run full security audit"
→ security-audit (audit_dependencies + secret check + DB security)
→ semgrep (full OWASP scan)
→ self-learning-health (security health diagnostic)

Result: Comprehensive security report with fixes
```

### 🧪 QA/Test Engineer

```
User: "Generate tests for the new feature and run them"
→ automation-testing (generate_tests + run_tests)
→ automation-testing (analyze_coverage)

Result: Tests created and executed with coverage report
```

### 🎨 UI/UX Designer

```
User: "Review design of this component for accessibility"
→ uiux-expert (review_design)
→ uiux-expert (design_component_template)

Result: Accessibility issues found with templates for fixes
```

### ⚡ Performance Engineer

```
User: "Optimize performance for production"
→ performance-optimization (analyze_bundle_size + images + metrics)
→ performance-optimization (analyze_database_queries)
→ self-learning-health (get_recommendations)

Result: Optimization roadmap with impact estimates
```

### 🧠 Full-Stack Developer

```
User: "Full health check and heal issues"
→ self-learning-health (diagnostic_health + auto_heal_issues)
→ security-audit (check_code_quality)
→ performance-optimization (suggest_optimizations)

Result: Codebase health score + auto-fixes applied + improvements suggested
```

---

## Server Logs

All activity is logged to `.mcp-servers/logs/`:

```bash
# View real-time logs
tail -f .mcp-servers/logs/*.log

# Check health diagnostics
tail -20 .mcp-servers/logs/health.log

# See what the system learned
tail -20 .mcp-servers/logs/learning.log

# Review security findings
grep -i "critical\|error" .mcp-servers/logs/security-audit.log
```

---

## Knowledge Base

The system learns and improves over time:

```bash
# View accumulated knowledge
cat .mcp-servers/knowledge-base.json

# Contains:
# - Error patterns and frequency
# - Success patterns
# - Improvements made
# - Health score over time
# - Learning sessions count
```

---

## Auto-Healing

The system can automatically fix common issues:

```
User: "Heal the codebase"
→ self-learning-health (auto_heal_issues)

Automatically:
- Fixes ESLint issues
- Formats code with Prettier
- Regenerates Prisma types
- Updates dependencies
```

---

## Self-Learning System

The system learns from each session:

```
1. Record observations from each session
2. Build pattern database
3. Generate insights on success/failure
4. Make personalized recommendations
5. Improve accuracy over time
```

---

## Installation Checklist

- [ ] `chmod +x .mcp-servers/*.js`
- [ ] `pip install semgrep`
- [ ] Update `.github/copilot-settings.json` with all servers
- [ ] Test each server: `node .mcp-servers/<server>.js`
- [ ] Verify logs exist: `ls -la .mcp-servers/logs/`
- [ ] Check knowledge base: `cat .mcp-servers/knowledge-base.json`

---

## Performance Notes

- **security-audit**: 10-30s (depends on project size)
- **semgrep**: 20-60s (large repos take longer)
- **automation-testing**: 30-120s (full test suite)
- **uiux-expert**: 2-5s (instant analysis)
- **performance-optimization**: 15-45s (bundle analysis)
- **self-learning-health**: 10-30s (all diagnostics)

All timeouts are configurable in copilot-settings.json.

---

## Memory & Storage

- **Logs**: ~10MB per month per server
- **Knowledge base**: ~100KB (JSON)
- **Total disk usage**: <100MB

---

## Troubleshooting

### Server Won't Start
```bash
node .mcp-servers/security-audit.js
# Should output JSON with tools
```

### Timeout Too Short
```json
{
  "semgrep": {
    "timeout": 120000  // Increase to 2 minutes
  }
}
```

### Clear Logs
```bash
rm .mcp-servers/logs/*.log
# Logs will recreate on next run
```

### Reset Knowledge Base
```bash
rm .mcp-servers/knowledge-base.json
# Fresh knowledge base on next run
```

---

## Next Steps

1. ✅ Install Semgrep: `pip install semgrep`
2. ✅ Make scripts executable: `chmod +x .mcp-servers/*.js`
3. ✅ Update Copilot settings with all servers
4. ✅ Test: `node .mcp-servers/security-audit.js`
5. ✅ Start using: Ask Copilot for tasks
6. ✅ Monitor learning: Check `knowledge-base.json`
