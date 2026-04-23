# ✅ MCP Setup Checklist

Complete checklist to verify everything is installed and working.

## Pre-Setup

- [ ] Node.js 18+ installed: `node --version`
- [ ] Python 3.8+ installed: `python --version`
- [ ] Current directory is project root: `pwd`
- [ ] Git repository clean: `git status`

## Step 1: Install Dependencies (2 min)

- [ ] Install Semgrep: `pip install semgrep`
  - Verify: `semgrep --version`
- [ ] Verify npm/bun: `bun --version` or `npm --version`
- [ ] Install reference servers (optional):
  ```bash
  npm install @modelcontextprotocol/server-git @modelcontextprotocol/server-filesystem
  ```

## Step 2: Make Scripts Executable (1 min)

```bash
chmod +x .mcp-servers/*.js
```

- [ ] security-audit.js is executable: `ls -l .mcp-servers/security-audit.js | grep rwx`
- [ ] semgrep-server.js is executable
- [ ] automation-testing.js is executable
- [ ] uiux-expert.js is executable
- [ ] performance-optimization.js is executable
- [ ] self-learning-health.js is executable

## Step 3: Create Directories (1 min)

```bash
mkdir -p .mcp-servers/logs
```

- [ ] Logs directory exists: `ls -d .mcp-servers/logs`
- [ ] Directory is writable: `touch .mcp-servers/logs/test.txt && rm .mcp-servers/logs/test.txt`

## Step 4: Test Each Server (3 min)

Test that each server starts and outputs valid JSON:

```bash
# Test 1: security-audit
node .mcp-servers/security-audit.js | jq '.tools | length'
# Should output: 5
```
- [ ] security-audit outputs 5 tools

```bash
# Test 2: semgrep
node .mcp-servers/semgrep-server.js | jq '.tools | length'
# Should output: 5
```
- [ ] semgrep outputs 5 tools

```bash
# Test 3: automation-testing
node .mcp-servers/automation-testing.js | jq '.tools | length'
# Should output: 5
```
- [ ] automation-testing outputs 5 tools

```bash
# Test 4: uiux-expert
node .mcp-servers/uiux-expert.js | jq '.tools | length'
# Should output: 3
```
- [ ] uiux-expert outputs 3 tools

```bash
# Test 5: performance-optimization
node .mcp-servers/performance-optimization.js | jq '.tools | length'
# Should output: 5
```
- [ ] performance-optimization outputs 5 tools

```bash
# Test 6: self-learning-health
node .mcp-servers/self-learning-health.js | jq '.tools | length'
# Should output: 5
```
- [ ] self-learning-health outputs 5 tools

**Total Tools Check:**
```bash
for f in .mcp-servers/*.js; do
  count=$(node "$f" 2>/dev/null | jq '.tools | length')
  echo "$(basename $f): $count tools"
done
# Should show: 5, 5, 5, 3, 5, 5 = 28 total
```
- [ ] All servers output correct tool counts

## Step 5: Verify Configuration (2 min)

- [ ] copilot-settings.json exists: `ls .github/copilot-settings.json`
- [ ] Settings contains all 6 servers:
  ```bash
  grep -c "security-audit\|semgrep\|automation-testing\|uiux-expert\|performance-optimization\|self-learning-health" .github/copilot-settings.json
  # Should output: 6 or more
  ```
- [ ] Server paths are correct: `grep "\.mcp-servers" .github/copilot-settings.json`

## Step 6: Initialize Knowledge Base (1 min)

```bash
node .mcp-servers/self-learning-health.js << 'JSON'
{"name": "get_metrics"}
JSON
```

- [ ] knowledge-base.json created: `ls .mcp-servers/knowledge-base.json`
- [ ] File is valid JSON: `jq . .mcp-servers/knowledge-base.json > /dev/null && echo OK`

## Step 7: IDE Configuration (2 min)

### For VS Code
- [ ] GitHub Copilot extension installed
- [ ] GitHub Copilot Chat extension installed
- [ ] VS Code reloaded: Cmd+Shift+P → "Developer: Reload Window"

### For Cursor
- [ ] `.cursor/settings.json` configured with `.github/copilot-settings.json` contents
- [ ] Cursor reloaded

## Step 8: Test IDE Integration (2 min)

Open Copilot Chat and verify:

- [ ] Tools appear in auto-complete when typing @
- [ ] Can run: "Run a security audit"
- [ ] Can run: "Generate tests"
- [ ] Can run: "Full health check"

## Step 9: Documentation Check (1 min)

- [ ] `.mcp-servers/ALL-SERVERS.md` exists
- [ ] `.mcp-servers/REGISTRY.md` exists
- [ ] `.mcp-servers/TOOLS_INDEX.md` exists
- [ ] `.mcp-servers/DEPLOYMENT_COMPLETE.md` exists
- [ ] `MCP-COMPLETE.md` exists in project root

## Step 10: Final Verification (2 min)

Run this script to verify everything:

```bash
#!/bin/bash
set -e

echo "🔍 Verifying MCP Installation..."
echo ""

echo "✓ Node.js: $(node --version)"
echo "✓ Python: $(python --version)"
echo "✓ Semgrep: $(semgrep --version | head -1)"
echo ""

echo "Checking scripts:"
for f in .mcp-servers/*.js; do
  name=$(basename "$f")
  count=$(node "$f" 2>/dev/null | jq '.tools | length')
  echo "  ✓ $name: $count tools"
done
echo ""

echo "Checking directories:"
test -d .mcp-servers/logs && echo "  ✓ Logs directory exists"
test -f .mcp-servers/knowledge-base.json && echo "  ✓ Knowledge base exists"
echo ""

echo "Checking configuration:"
test -f .github/copilot-settings.json && echo "  ✓ Settings file exists"
test -f .github/copilot-instructions.md && echo "  ✓ Instructions exist"
echo ""

echo "Checking documentation:"
test -f .mcp-servers/ALL-SERVERS.md && echo "  ✓ ALL-SERVERS.md exists"
test -f .mcp-servers/REGISTRY.md && echo "  ✓ REGISTRY.md exists"
test -f .mcp-servers/TOOLS_INDEX.md && echo "  ✓ TOOLS_INDEX.md exists"
test -f MCP-COMPLETE.md && echo "  ✓ MCP-COMPLETE.md exists"
echo ""

echo "✅ All checks passed! MCP is ready to use."
echo ""
echo "Next steps:"
echo "1. Reload VS Code or Cursor"
echo "2. Open Copilot Chat"
echo "3. Try: 'Run security audit'"
echo "4. Try: 'Full health check'"
```

- [ ] Run the script and verify all checks pass

## Troubleshooting

### Semgrep not found
```bash
pip install semgrep
semgrep --version
```
- [ ] Fixed

### Server won't start
```bash
node .mcp-servers/security-audit.js
# Should output JSON, not error
```
- [ ] Fixed

### Tools not showing in Copilot
1. Reload VS Code/Cursor
2. Check settings file: `.github/copilot-settings.json`
3. Run a server manually to verify it works
- [ ] Fixed

### Timeout errors
Edit `.github/copilot-settings.json`:
```json
{
  "semgrep": {
    "timeout": 120000  // Increase from 60000
  }
}
```
- [ ] Fixed

## Verification Summary

- [ ] All 6 MCP servers installed and tested
- [ ] All 28 tools available and working
- [ ] Knowledge base initialized
- [ ] IDE configured
- [ ] Documentation complete
- [ ] Ready for production use

## Success Criteria

✅ All checks above completed
✅ All servers output correct tool counts
✅ IDE recognizes all tools
✅ Can run at least one tool in Copilot Chat
✅ Knowledge base exists and is valid JSON

---

## Quick Test Command

```bash
# One-liner to verify everything
for f in .mcp-servers/*.js; do node "$f" 2>/dev/null | jq '.tools | length'; done | paste -sd+ | bc
# Should output: 28
```

---

**If all checks pass:** ✅ You're ready to use MCP servers!

**If any check fails:** Review the troubleshooting section above.

**For help:** See `.mcp-servers/ALL-SERVERS.md` (Troubleshooting section)
