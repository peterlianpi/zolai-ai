# 🔧 Complete Tools Index

All MCP tools available across all servers.

## 🔍 Quick Search

### By Task
- [I need security](#security)
- [I want tests](#testing)  
- [I need design feedback](#design)
- [I want performance improvement](#performance)
- [I need health check](#health)

### By Server
- [security-audit (5 tools)](#security-audit)
- [semgrep (5 tools)](#semgrep)
- [automation-testing (5 tools)](#automation-testing)
- [uiux-expert (3 tools)](#uiux-expert)
- [performance-optimization (5 tools)](#performance-optimization)
- [self-learning-health (5 tools)](#self-learning-health)

---

## Security

### audit_dependencies
**Server:** security-audit  
**Purpose:** Check for vulnerable packages  
**Input:** None  
**Output:** List of vulnerabilities with fix commands  
**Time:** 10-30s  

```
"Check dependencies for vulnerabilities"
→ audit_dependencies tool
→ Shows npm/bun audit results + fix recommendations
```

### check_secret_exposure
**Server:** security-audit  
**Purpose:** Find hardcoded secrets  
**Input:** None  
**Output:** List of exposed secrets by location  
**Time:** 5-15s  

```
"Check for exposed API keys"
→ check_secret_exposure tool
→ Scans codebase, shows secrets + locations to remove
```

### validate_env_config
**Server:** security-audit  
**Purpose:** Verify environment setup  
**Input:** None  
**Output:** Missing/invalid env vars  
**Time:** <5s  

```
"Check if all env vars are set"
→ validate_env_config tool
→ Shows required but missing vars
```

### check_database_security
**Server:** security-audit  
**Purpose:** Review Prisma schema for security  
**Input:** None  
**Output:** Schema issues + recommendations  
**Time:** <5s  

```
"Security review of database schema"
→ check_database_security tool
→ Checks indexes, audit fields, constraints
```

### check_code_quality
**Server:** security-audit  
**Purpose:** Find code quality issues  
**Input:** None  
**Output:** Complexity, unused vars, style issues  
**Time:** 5-10s  

```
"Check code quality"
→ check_code_quality tool
→ Cyclomatic complexity, unused variables, style
```

### scan_repository
**Server:** semgrep  
**Purpose:** Full OWASP Top 10 scan  
**Input:** None  
**Output:** Comprehensive vulnerability report  
**Time:** 20-60s  

```
"Full security scan"
→ scan_repository tool
→ All OWASP vulnerabilities in codebase
```

### scan_file
**Server:** semgrep  
**Purpose:** Scan specific file  
**Input:** File path  
**Output:** Vulnerabilities in that file  
**Time:** <10s  

```
"Security scan this file"
→ scan_file("/path/to/file.ts") tool
→ Shows vulnerabilities in specific file
```

### find_vulnerability_type
**Server:** semgrep  
**Purpose:** Find specific vulnerability  
**Input:** Vulnerability type (xss, sql_injection, etc)  
**Output:** All instances of that vuln type  
**Time:** 10-30s  

```
"Find all XSS vulnerabilities"
→ find_vulnerability_type("xss") tool
→ Lists all unsafe DOM manipulations
```

### find_issues_in_feature
**Server:** semgrep  
**Purpose:** Scan feature folder  
**Input:** Feature path  
**Output:** Issues in that feature  
**Time:** 5-20s  

```
"Security scan features/auth"
→ find_issues_in_feature("features/auth") tool
→ Issues specific to auth feature
```

### validate_security_policies
**Server:** semgrep  
**Purpose:** Custom security policies  
**Input:** None  
**Output:** Policy violations  
**Time:** 5-15s  

```
"Check against security policies"
→ validate_security_policies tool
→ Custom rule violations
```

---

## Testing

### run_tests
**Server:** automation-testing  
**Purpose:** Execute test suite  
**Input:** Optional: test file or pattern  
**Output:** Test results + pass/fail counts  
**Time:** 30-120s  

```
"Run all tests"
→ run_tests tool
→ Executes full Playwright test suite

"Run login tests"
→ run_tests("login") tool
→ Runs tests matching pattern
```

### generate_tests
**Server:** automation-testing  
**Purpose:** Create test templates  
**Input:** Feature description or code  
**Output:** Test file with examples  
**Time:** 5-15s  

```
"Generate tests for password reset"
→ generate_tests("password reset feature") tool
→ Creates test templates with happy/sad paths
```

### analyze_coverage
**Server:** automation-testing  
**Purpose:** Check test coverage  
**Input:** Optional: file path  
**Output:** Coverage % by file/folder  
**Time:** 10-30s  

```
"What's our test coverage?"
→ analyze_coverage tool
→ Shows line/branch/function coverage

"Coverage for auth feature"
→ analyze_coverage("features/auth") tool
→ Coverage specific to auth
```

### get_test_report
**Server:** automation-testing  
**Purpose:** Generate HTML test report  
**Input:** None  
**Output:** HTML file path + summary  
**Time:** 5-15s  

```
"Generate test report"
→ get_test_report tool
→ Creates HTML report with trends
```

### validate_setup
**Server:** automation-testing  
**Purpose:** Check test environment  
**Input:** None  
**Output:** Setup issues + recommendations  
**Time:** <5s  

```
"Check test environment"
→ validate_setup tool
→ Verifies Playwright, browsers, config
```

---

## Design

### review_design
**Server:** uiux-expert  
**Purpose:** Full design audit  
**Input:** Component name or path  
**Output:** Accessibility + UX issues  
**Time:** 2-5s  

```
"Review design of login form"
→ review_design("login form") tool
→ WCAG issues, usability problems, suggestions

"Audit dashboard design"
→ review_design("/features/dashboard/Dashboard.tsx") tool
→ Design pattern + accessibility audit
```

### design_component_template
**Server:** uiux-expert  
**Purpose:** Best-practice templates  
**Input:** Component type (button, form, card, etc)  
**Output:** Code + design rationale  
**Time:** <5s  

```
"Give me an accessible button"
→ design_component_template("button") tool
→ HTML/CSS/JS with WCAG compliance

"I need a form template"
→ design_component_template("form") tool
→ Form with error handling, validation, labels
```

### get_design_system
**Server:** uiux-expert  
**Purpose:** Design tokens & system  
**Input:** None  
**Output:** Colors, typography, spacing, etc  
**Time:** <5s  

```
"Show me the design system"
→ get_design_system tool
→ Design tokens, component specs, patterns
```

---

## Performance

### analyze_bundle_size
**Server:** performance-optimization  
**Purpose:** Bundle analysis  
**Input:** None  
**Output:** Top dependencies, tree-shake opportunities  
**Time:** 15-45s  

```
"Analyze bundle size"
→ analyze_bundle_size tool
→ Shows size breakdown + top contributors
```

### analyze_images
**Server:** performance-optimization  
**Purpose:** Image optimization  
**Input:** None  
**Output:** Unoptimized images, conversion opportunities  
**Time:** 5-15s  

```
"Check image optimization"
→ analyze_images tool
→ WebP conversion, lazy loading opportunities
```

### analyze_metrics
**Server:** performance-optimization  
**Purpose:** Core Web Vitals  
**Input:** None  
**Output:** LCP, INP, CLS current values  
**Time:** <5s  

```
"What are our Core Web Vitals?"
→ analyze_metrics tool
→ Shows LCP, INP, CLS + recommendations
```

### suggest_optimizations
**Server:** performance-optimization  
**Purpose:** Prioritized improvements  
**Input:** None  
**Output:** Optimizations ranked by impact  
**Time:** 5-15s  

```
"What should I optimize?"
→ suggest_optimizations tool
→ Ranked list with 5%-50% impact estimates
```

### analyze_database_queries
**Server:** performance-optimization  
**Purpose:** Query performance  
**Input:** None  
**Output:** Slow queries, N+1 issues, index gaps  
**Time:** 10-30s  

```
"Check database performance"
→ analyze_database_queries tool
→ Shows slow queries + indexing suggestions
```

---

## Health

### diagnostic_health
**Server:** self-learning-health  
**Purpose:** Full health check  
**Input:** None  
**Output:** 8 health dimensions + overall score  
**Time:** 10-30s  

```
"Run health check"
→ diagnostic_health tool
→ Codebase, dependencies, security, tests,
   performance, docs, database health
```

### learn_from_session
**Server:** self-learning-health  
**Purpose:** Record learnings  
**Input:** Session data (issue, pattern, improvement)  
**Output:** Learning recorded + insights  
**Time:** <5s  

```
"Learn from this: we fixed TypeScript errors"
→ learn_from_session({
    issue_type: "typescript",
    improvement: "Added strict mode"
  })
→ System learns the pattern
```

### auto_heal_issues
**Server:** self-learning-health  
**Purpose:** Fix common problems  
**Input:** None  
**Output:** Issues fixed + summary  
**Time:** 15-30s  

```
"Heal the codebase"
→ auto_heal_issues tool
→ Auto-fixes ESLint, formats Prettier,
   regenerates Prisma types, updates deps
```

### get_recommendations
**Server:** self-learning-health  
**Purpose:** Personalized suggestions  
**Input:** None  
**Output:** Ranked improvements based on history  
**Time:** <5s  

```
"What should I focus on?"
→ get_recommendations tool
→ Personalized based on error patterns
   and previous improvements
```

### get_metrics
**Server:** self-learning-health  
**Purpose:** Learning & health metrics  
**Input:** None  
**Output:** Session count, health score, patterns  
**Time:** <5s  

```
"Show me metrics"
→ get_metrics tool
→ Learning sessions, health score, error patterns,
   improvements made, knowledge base size
```

---

## By Task

### Security
- ✅ Full scan: `security-audit` (all 5 tools) + `semgrep` (scan_repository)
- ✅ Check secrets: `security-audit` (check_secret_exposure)
- ✅ Find XSS: `semgrep` (find_vulnerability_type)
- ✅ Database audit: `security-audit` (check_database_security)
- ✅ Environment: `security-audit` (validate_env_config)

### Testing
- ✅ Generate tests: `automation-testing` (generate_tests)
- ✅ Run tests: `automation-testing` (run_tests)
- ✅ Check coverage: `automation-testing` (analyze_coverage)
- ✅ Get report: `automation-testing` (get_test_report)

### Design
- ✅ Design audit: `uiux-expert` (review_design)
- ✅ Component template: `uiux-expert` (design_component_template)
- ✅ Design system: `uiux-expert` (get_design_system)

### Performance
- ✅ Bundle analysis: `performance-optimization` (analyze_bundle_size)
- ✅ Images: `performance-optimization` (analyze_images)
- ✅ Core Web Vitals: `performance-optimization` (analyze_metrics)
- ✅ Optimizations: `performance-optimization` (suggest_optimizations)
- ✅ Database: `performance-optimization` (analyze_database_queries)

### Health
- ✅ Full check: `self-learning-health` (diagnostic_health)
- ✅ Auto-heal: `self-learning-health` (auto_heal_issues)
- ✅ Recommendations: `self-learning-health` (get_recommendations)
- ✅ Learning: `self-learning-health` (learn_from_session)
- ✅ Metrics: `self-learning-health` (get_metrics)

---

## Execution Times

| Task | Fast | Normal | Slow |
|------|------|--------|------|
| Single tool | <5s | - | - |
| Parallel security | - | 20-30s | 60s |
| Full suite | - | 30-60s | 120s |
| Health check | 10s | 20s | 30s |
| Design review | <5s | - | - |

---

## Common Combinations

### Pre-Commit Check
```
1. auto_heal_issues → Fix style
2. scan_repository → Security check
3. run_tests → Verify tests pass
```

### Feature Review
```
1. review_design → UX audit
2. find_issues_in_feature → Security
3. analyze_coverage → Test coverage
4. get_recommendations → Improvements
```

### Release Preparation
```
1. audit_dependencies → Vulnerability check
2. scan_repository → Full security scan
3. run_tests → Test suite
4. analyze_metrics → Performance
5. diagnostic_health → Overall health
6. auto_heal_issues → Fix issues
```

---

**Total Tools:** 28 across 6 servers
**Total Time:** Can run all in <5 minutes
**Output:** Always JSON for Copilot integration
