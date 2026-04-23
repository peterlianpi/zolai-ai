# 📑 MCP Servers - Complete Index

Navigation guide for all MCP servers, tools, and documentation.

---

## 🚀 Getting Started

**New to MCP?** Start here:

1. **README-MCP.md** (in project root)
   - Overview of what was delivered
   - Quick start guide
   - Key features summary

2. **.mcp-servers/SETUP_CHECKLIST.md**
   - Step-by-step installation
   - Verification tests
   - Troubleshooting

3. **.mcp-servers/ALL-SERVERS.md**
   - Complete usage guide
   - Workflow examples
   - Configuration details

---

## 📦 MCP Servers

### Security & Compliance

**security-audit.js**
- **Tools:** audit_dependencies, check_secret_exposure, validate_env_config, check_database_security, check_code_quality
- **Purpose:** Dependency audit, secret detection, environment validation, database security, code quality
- **Time:** 10-30s
- **Log:** security-audit.log
- **Read:** .mcp-servers/ALL-SERVERS.md (Security section)

**semgrep-server.js**
- **Tools:** scan_repository, scan_file, find_vulnerability_type, find_issues_in_feature, validate_security_policies
- **Purpose:** OWASP Top 10 scanning, vulnerability detection (XSS, SQL injection, auth bypass)
- **Time:** 20-60s
- **Log:** semgrep.log
- **Read:** .mcp-servers/ALL-SERVERS.md (Semgrep section)

### Testing & Quality

**automation-testing.js**
- **Tools:** run_tests, generate_tests, analyze_coverage, get_test_report, validate_setup
- **Purpose:** Playwright test execution, generation, coverage analysis
- **Time:** 30-120s (tests), <15s (generate)
- **Log:** automation-testing.log
- **Read:** .mcp-servers/ALL-SERVERS.md (Automation section)

### Design & UX

**uiux-expert.js**
- **Tools:** review_design, design_component_template, get_design_system
- **Purpose:** WCAG 2.1 accessibility audit, design patterns, component templates
- **Time:** 2-5s
- **Log:** uiux-expert.log
- **Read:** .mcp-servers/ALL-SERVERS.md (UI/UX section)

### Performance

**performance-optimization.js**
- **Tools:** analyze_bundle_size, analyze_images, analyze_metrics, suggest_optimizations, analyze_database_queries
- **Purpose:** Bundle analysis, image optimization, Core Web Vitals, database optimization
- **Time:** 15-45s
- **Log:** performance.log
- **Read:** .mcp-servers/ALL-SERVERS.md (Performance section)

### Intelligence

**self-learning-health.js**
- **Tools:** diagnostic_health, learn_from_session, auto_heal_issues, get_recommendations, get_metrics
- **Purpose:** Health diagnostics, auto-healing, self-learning, personalized recommendations
- **Time:** 10-30s
- **Log:** health.log, learning.log
- **Knowledge:** knowledge-base.json
- **Read:** .mcp-servers/ALL-SERVERS.md (Self-Learning section)

---

## 🔧 Complete Tools Index

See: **.mcp-servers/TOOLS_INDEX.md**

All 28 tools indexed by:
- Task (Security, Testing, Design, Performance, Health)
- Server (which server provides the tool)
- Execution time
- Input/output format
- Usage examples

---

## 📚 Documentation Files

### Quick Reference
- **README-MCP.md** – Overview (start here)
- **SETUP_CHECKLIST.md** – Installation steps
- **REGISTRY.md** – Server reference table

### Complete Guides
- **ALL-SERVERS.md** – Complete usage guide with examples
- **TOOLS_INDEX.md** – All 28 tools indexed and documented
- **DEPLOYMENT_COMPLETE.md** – What's included + metrics

### Configuration
- **.github/copilot-settings.json** – IDE configuration (v2.0.0)
- **.github/copilot-instructions.md** – Master reference (1,057 lines)
- **.github/COPILOT_SETUP.md** – Quick setup

### This File
- **INDEX.md** – Navigation guide (you are here)

---

## 🎯 By Use Case

### "I need a security review"
1. **Server:** security-audit + semgrep
2. **Tools:** audit_dependencies, check_secret_exposure, scan_repository
3. **Guide:** ALL-SERVERS.md → Security sections
4. **Time:** 40-90 seconds

### "I want to generate tests"
1. **Server:** automation-testing
2. **Tools:** generate_tests, run_tests
3. **Guide:** ALL-SERVERS.md → Testing section
4. **Time:** 20-30 seconds

### "I need design feedback"
1. **Server:** uiux-expert
2. **Tools:** review_design, design_component_template
3. **Guide:** ALL-SERVERS.md → Design section
4. **Time:** 2-5 seconds

### "I want performance improvements"
1. **Server:** performance-optimization
2. **Tools:** suggest_optimizations, analyze_bundle_size
3. **Guide:** ALL-SERVERS.md → Performance section
4. **Time:** 20-30 seconds

### "Full health check"
1. **Server:** self-learning-health
2. **Tools:** diagnostic_health, auto_heal_issues
3. **Guide:** ALL-SERVERS.md → Health section
4. **Time:** 20-30 seconds

---

## 📊 Server Capabilities

| Capability | Server | Tool | Time |
|-----------|--------|------|------|
| Dependency audit | security-audit | audit_dependencies | 10-30s |
| Secret detection | security-audit | check_secret_exposure | 5-15s |
| OWASP scan | semgrep | scan_repository | 20-60s |
| Test execution | automation-testing | run_tests | 30-120s |
| Test generation | automation-testing | generate_tests | 5-15s |
| Accessibility | uiux-expert | review_design | 2-5s |
| Bundle analysis | performance-optimization | analyze_bundle_size | 15-45s |
| Health check | self-learning-health | diagnostic_health | 10-30s |
| Auto-healing | self-learning-health | auto_heal_issues | 15-30s |

---

## 🛠 Configuration

### For VS Code
1. Install: GitHub Copilot + GitHub Copilot Chat
2. Reload: Cmd+Shift+P → "Developer: Reload Window"
3. Servers: Auto-discover from .github/copilot-settings.json

### For Cursor
1. Copy: .github/copilot-settings.json → .cursor/settings.json
2. Reload: Cursor application
3. Servers: Auto-discover

### Customization
- **Increase timeout:** Edit .github/copilot-settings.json
- **Disable server:** Set "enabled": false
- **Add custom server:** Follow security-audit.js pattern

See: .github/copilot-settings.json for full configuration

---

## 📈 Learning & Monitoring

### Knowledge Base
```bash
# View learning progress
cat .mcp-servers/knowledge-base.json | jq

# Monitor in real-time
tail -f .mcp-servers/logs/learning.log

# See health trends
jq '.health_score' .mcp-servers/knowledge-base.json
```

### Logs
```bash
# All logs
tail -f .mcp-servers/logs/*.log

# Specific server
tail -f .mcp-servers/logs/security-audit.log

# Filter by severity
grep "ERROR\|CRITICAL" .mcp-servers/logs/*.log
```

---

## 🚨 Troubleshooting

**Servers won't start?**
```bash
node .mcp-servers/security-audit.js
# Should output JSON with tools array
```

**Semgrep not found?**
```bash
pip install semgrep
semgrep --version
```

**Tools not in Copilot?**
- Reload VS Code/Cursor
- Check .github/copilot-settings.json
- Verify server starts: `node .mcp-servers/XXX.js`

**Timeout errors?**
```json
{
  "semgrep": {
    "timeout": 120000  // Increase to 2 minutes
  }
}
```

Full troubleshooting: See ALL-SERVERS.md (Troubleshooting section)

---

## 📋 File Structure

```
.mcp-servers/
├── Servers (6 files, 99 KB total)
│   ├── security-audit.js
│   ├── semgrep-server.js
│   ├── automation-testing.js
│   ├── uiux-expert.js
│   ├── performance-optimization.js
│   └── self-learning-health.js
│
├── Documentation (7 files, 50+ KB total)
│   ├── INDEX.md (this file)
│   ├── ALL-SERVERS.md (15 KB - complete guide)
│   ├── TOOLS_INDEX.md (8.2 KB - all tools)
│   ├── REGISTRY.md (8.3 KB - server reference)
│   ├── SETUP_CHECKLIST.md (6.5 KB - verification)
│   ├── DEPLOYMENT_COMPLETE.md (11.6 KB - summary)
│   └── README.md (original setup)
│
├── Infrastructure
│   ├── logs/ (auto-created, 7 log files)
│   ├── knowledge-base.json (learning tracker)
│   └── TOOLS_INDEX.md (this file)

.github/
├── copilot-settings.json (v2.0.0, all 6 servers configured)
├── copilot-instructions.md (1,057 lines, master reference)
└── COPILOT_SETUP.md (quick setup guide)

Project Root:
├── README-MCP.md (start here - overview)
└── MCP-COMPLETE.md (executive summary)
```

---

## ✅ Verification

Run setup checklist:
```bash
./mcp-servers/SETUP_CHECKLIST.md
```

Or quick test:
```bash
for f in .mcp-servers/*.js; do
  count=$(node "$f" 2>/dev/null | jq '.tools | length')
  echo "$(basename $f): $count tools"
done
# Should output: 5, 5, 5, 3, 5, 5 = 28 total
```

---

## 🚀 Quick Commands

```bash
# Test all servers
for f in .mcp-servers/*.js; do node "$f" | jq .name; done

# Watch logs
tail -f .mcp-servers/logs/*.log

# Check learning
cat .mcp-servers/knowledge-base.json | jq .error_patterns

# Get health score
jq '.health_score' .mcp-servers/knowledge-base.json

# View metrics
cat .mcp-servers/knowledge-base.json | jq .

# List all tools
grep -h '"name":' .mcp-servers/*.js | sort -u
```

---

## 📞 Support

**For setup:** See SETUP_CHECKLIST.md
**For usage:** See ALL-SERVERS.md
**For tools:** See TOOLS_INDEX.md
**For config:** See .github/copilot-settings.json
**For troubleshooting:** See ALL-SERVERS.md (Troubleshooting)

---

## 🎯 Next Steps

1. **Install:** `pip install semgrep && chmod +x .mcp-servers/*.js`
2. **Test:** `node .mcp-servers/security-audit.js`
3. **Use:** Open Copilot Chat
4. **Learn:** Read ALL-SERVERS.md

---

**Version:** 2.0.0  
**Status:** ✅ PRODUCTION READY  
**Created:** 2024  

🚀 Ready to enhance your development workflow!
