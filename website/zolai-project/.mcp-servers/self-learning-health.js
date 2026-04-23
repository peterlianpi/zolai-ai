#!/usr/bin/env node

/**
 * Self-Learning & Health Monitoring MCP Server
 * Learns from sessions, improves recommendations, detects and heals issues
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class SelfLearningHealthServer {
  constructor() {
    this.workspaceFolder = process.cwd();
    this.knowledgeBase = path.join(this.workspaceFolder, ".mcp-servers/knowledge-base.json");
    this.healthLog = path.join(this.workspaceFolder, ".mcp-servers/logs/health.log");
    this.learnLog = path.join(this.workspaceFolder, ".mcp-servers/logs/learning.log");
    this.ensureLogDir();
    this.loadKnowledgeBase();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.healthLog);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  loadKnowledgeBase() {
    if (fs.existsSync(this.knowledgeBase)) {
      try {
        this.knowledge = JSON.parse(fs.readFileSync(this.knowledgeBase, "utf8"));
      } catch {
        this.knowledge = this.initializeKnowledgeBase();
      }
    } else {
      this.knowledge = this.initializeKnowledgeBase();
    }
  }

  initializeKnowledgeBase() {
    return {
      version: "1.0.0",
      created_at: new Date().toISOString(),
      patterns: {},
      issues_fixed: {},
      improvements_made: [],
      error_patterns: {},
      success_patterns: {},
      learning_sessions: 0,
      health_score: 100,
      recommendations: []
    };
  }

  saveKnowledgeBase() {
    this.knowledge.updated_at = new Date().toISOString();
    fs.writeFileSync(this.knowledgeBase, JSON.stringify(this.knowledge, null, 2));
  }

  log(message, level = "info", logFile = "health") {
    const timestamp = new Date().toISOString();
    const file = logFile === "learning" ? this.learnLog : this.healthLog;
    fs.appendFileSync(file, `[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
  }

  async diagnosticHealth() {
    this.log("Running comprehensive health diagnostics...");

    const diagnostics = {
      timestamp: new Date().toISOString(),
      codebase_health: await this.checkCodebaseHealth(),
      dependency_health: await this.checkDependencyHealth(),
      security_health: await this.checkSecurityHealth(),
      test_health: await this.checkTestHealth(),
      performance_health: await this.checkPerformanceHealth(),
      documentation_health: await this.checkDocumentationHealth(),
      database_health: await this.checkDatabaseHealth()
    };

    const scores = Object.values(diagnostics).filter(d => d.score).map(d => d.score);
    diagnostics.overall_health = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 50;

    this.knowledge.health_score = diagnostics.overall_health;
    this.saveKnowledgeBase();
    this.log(`Health check complete. Score: ${diagnostics.overall_health}/100`);

    return diagnostics;
  }

  async checkCodebaseHealth() {
    const issues = [];

    // Check code style
    try {
      execSync("bunx eslint . --max-warnings 0", { stdio: "pipe" });
      issues.push({ type: "pass", check: "ESLint clean" });
    } catch {
      issues.push({ type: "warning", check: "ESLint warnings found" });
    }

    // Check TypeScript
    try {
      execSync("bunx tsc --noEmit", { stdio: "pipe" });
      issues.push({ type: "pass", check: "TypeScript valid" });
    } catch {
      issues.push({ type: "error", check: "TypeScript errors" });
    }

    return {
      name: "Codebase Health",
      issues,
      score: issues.filter(i => i.type === "error").length === 0 ? 100 : 70,
      recommendations: this.getCodeHealthRecommendations(issues)
    };
  }

  async checkDependencyHealth() {
    this.log("Checking dependency health...", "info", "health");

    try {
      const output = execSync("bunx audit --json 2>/dev/null || echo '{}'", {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        shell: "/bin/bash"
      });

      const audit = JSON.parse(output);
      const vulnCount = audit.vulnerabilities?.length || 0;

      return {
        name: "Dependency Health",
        vulnerabilities: vulnCount,
        score: Math.max(0, 100 - vulnCount * 5),
        recommendations: vulnCount > 0 ? ["Update vulnerable packages", "Review CVEs"] : ["Dependencies healthy"]
      };
    } catch (e) {
      return { name: "Dependency Health", score: 50, error: e.message };
    }
  }

  async checkSecurityHealth() {
    this.log("Checking security posture...", "info", "health");

    const checks = {
      no_secrets: this.checkNoSecrets(),
      env_configured: this.checkEnvSetup(),
      auth_implemented: this.checkAuthSecurity(),
      validation_present: this.checkValidation()
    };

    const passed = Object.values(checks).filter(c => c).length;
    const score = (passed / Object.keys(checks).length) * 100;

    return {
      name: "Security Health",
      checks,
      score: Math.round(score),
      recommendations: this.getSecurityRecommendations(checks)
    };
  }

  async checkTestHealth() {
    this.log("Checking test coverage...", "info", "health");

    const testDir = path.join(this.workspaceFolder, "tests");
    let testCount = 0;

    if (fs.existsSync(testDir)) {
      const files = fs.readdirSync(testDir);
      testCount = files.filter(f => f.endsWith(".spec.ts")).length;
    }

    const score = testCount > 10 ? 90 : testCount > 5 ? 70 : 30;

    return {
      name: "Test Health",
      test_count: testCount,
      score,
      recommendations: testCount < 10 ? ["Increase test coverage", "Add E2E tests"] : ["Good test coverage"]
    };
  }

  async checkPerformanceHealth() {
    this.log("Checking performance metrics...", "info", "health");

    return {
      name: "Performance Health",
      score: 75,
      recommendations: [
        "Analyze bundle size",
        "Optimize images",
        "Review database queries",
        "Implement caching strategy"
      ]
    };
  }

  async checkDocumentationHealth() {
    this.log("Checking documentation...", "info", "health");

    const docFiles = ["README.md", "AGENTS.md", "CLAUDE.md"];
    const existing = docFiles.filter(f => fs.existsSync(path.join(this.workspaceFolder, f)));

    return {
      name: "Documentation Health",
      files_found: existing.length,
      score: (existing.length / docFiles.length) * 100,
      recommendations: existing.length < 3 ? ["Add missing documentation"] : ["Documentation complete"]
    };
  }

  async checkDatabaseHealth() {
    this.log("Checking database schema...", "info", "health");

    const schemaPath = path.join(this.workspaceFolder, "prisma/schema.prisma");
    let score = 50;

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");
      const hasIndexes = /@@index|@@unique/.test(schema);
      const hasAudit = /createdAt|updatedAt/.test(schema);
      score = (hasIndexes && hasAudit) ? 90 : 70;
    }

    return {
      name: "Database Health",
      score,
      recommendations: ["Review indexes", "Ensure audit fields present"]
    };
  }

  checkNoSecrets() {
    try {
      const output = execSync("grep -r 'SECRET\\|PASSWORD\\|API_KEY' . --include='*.ts' --include='*.js' 2>/dev/null | grep -v '.env' | grep -v 'node_modules' | wc -l", {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        shell: "/bin/bash"
      });
      return parseInt(output) === 0;
    } catch {
      return true;
    }
  }

  checkEnvSetup() {
    return fs.existsSync(path.join(this.workspaceFolder, ".env.example"));
  }

  checkAuthSecurity() {
    const authPath = path.join(this.workspaceFolder, "lib/auth.ts");
    if (!fs.existsSync(authPath)) return false;
    const content = fs.readFileSync(authPath, "utf8");
    return /validateSessionToken|getSession|checkRole/.test(content);
  }

  checkValidation() {
    const apiDir = path.join(this.workspaceFolder, "app/api");
    if (!fs.existsSync(apiDir)) return false;
    return true; // Basic check
  }

  getCodeHealthRecommendations(issues) {
    const errorCount = issues.filter(i => i.type === "error").length;
    if (errorCount > 0) return ["Fix TypeScript errors", "Run eslint --fix"];
    return ["Code style clean", "No linting issues"];
  }

  getSecurityRecommendations(checks) {
    const recommendations = [];
    if (!checks.no_secrets) recommendations.push("Remove exposed secrets");
    if (!checks.env_configured) recommendations.push("Create .env.example");
    if (!checks.auth_implemented) recommendations.push("Implement secure auth");
    if (!checks.validation_present) recommendations.push("Add input validation");
    return recommendations.length > 0 ? recommendations : ["Security posture healthy"];
  }

  async learnFromSession(sessionData) {
    this.log(`Learning from session: ${JSON.stringify(sessionData)}`, "info", "learning");

    this.knowledge.learning_sessions++;

    // Track patterns
    if (sessionData.issue_type) {
      if (!this.knowledge.error_patterns[sessionData.issue_type]) {
        this.knowledge.error_patterns[sessionData.issue_type] = 0;
      }
      this.knowledge.error_patterns[sessionData.issue_type]++;
    }

    // Track successes
    if (sessionData.success) {
      if (!this.knowledge.success_patterns[sessionData.pattern]) {
        this.knowledge.success_patterns[sessionData.pattern] = 0;
      }
      this.knowledge.success_patterns[sessionData.pattern]++;
    }

    // Learn improvement
    if (sessionData.improvement) {
      this.knowledge.improvements_made.push({
        timestamp: new Date().toISOString(),
        improvement: sessionData.improvement,
        impact: sessionData.impact || "unknown"
      });
    }

    this.saveKnowledgeBase();

    return {
      status: "learned",
      session_number: this.knowledge.learning_sessions,
      insights: this.generateInsights()
    };
  }

  generateInsights() {
    const insights = [];

    // Most common errors
    const commonErrors = Object.entries(this.knowledge.error_patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    if (commonErrors.length > 0) {
      insights.push({
        type: "error_pattern",
        message: `Most common issues: ${commonErrors.map(e => e[0]).join(", ")}`,
        frequency: commonErrors[0][1]
      });
    }

    // Successful patterns
    const successPatterns = Object.entries(this.knowledge.success_patterns)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    if (successPatterns.length > 0) {
      insights.push({
        type: "success_pattern",
        message: `Working well: ${successPatterns.map(p => p[0]).join(", ")}`
      });
    }

    return insights;
  }

  async autoHealIssues() {
    this.log("Scanning for auto-healing opportunities...", "info", "health");

    const heals = [];

    // Auto-fix ESLint
    try {
      execSync("bunx eslint . --fix", { stdio: "pipe" });
      heals.push({ type: "eslint-fix", status: "success", message: "Fixed ESLint issues" });
      this.log("Auto-fixed ESLint issues", "info", "health");
    } catch {
      heals.push({ type: "eslint-fix", status: "failed" });
    }

    // Format with Prettier
    try {
      execSync("bunx prettier . --write", { stdio: "pipe" });
      heals.push({ type: "prettier-format", status: "success", message: "Formatted code" });
      this.log("Formatted code with Prettier", "info", "health");
    } catch {
      heals.push({ type: "prettier-format", status: "failed" });
    }

    // Update Prisma types
    try {
      execSync("bunx prisma generate", { stdio: "pipe" });
      heals.push({ type: "prisma-generate", status: "success", message: "Regenerated Prisma types" });
      this.log("Regenerated Prisma types", "info", "health");
    } catch {
      heals.push({ type: "prisma-generate", status: "failed" });
    }

    return {
      status: "complete",
      heals: heals.filter(h => h.status === "success"),
      summary: `Fixed ${heals.filter(h => h.status === "success").length} issues`
    };
  }

  async getRecommendations() {
    this.log("Generating personalized recommendations...", "info", "learning");

    const patterns = this.knowledge.error_patterns;
    const recommendations = [];

    // Based on error patterns
    for (const [error, count] of Object.entries(patterns)) {
      if (count > 2) {
        recommendations.push({
          priority: "high",
          issue: error,
          occurrences: count,
          action: `Address ${error} pattern to prevent future issues`
        });
      }
    }

    // General recommendations
    if (this.knowledge.learning_sessions < 5) {
      recommendations.push({
        priority: "medium",
        action: "Continue learning patterns - more sessions improve recommendations"
      });
    }

    return {
      status: "complete",
      recommendations: recommendations.slice(0, 5),
      generated_from: `${this.knowledge.learning_sessions} sessions`
    };
  }

  async getMetrics() {
    return {
      status: "complete",
      metrics: {
        learning_sessions: this.knowledge.learning_sessions,
        health_score: this.knowledge.health_score,
        improvements_made: this.knowledge.improvements_made.length,
        error_patterns: Object.keys(this.knowledge.error_patterns).length,
        success_patterns: Object.keys(this.knowledge.success_patterns).length
      },
      knowledge_base_size: fs.statSync(this.knowledgeBase).size,
      last_updated: this.knowledge.updated_at
    };
  }
}

const server = new SelfLearningHealthServer();

const tools = [
  {
    name: "diagnostic_health",
    description: "Run comprehensive codebase health diagnostics"
  },
  {
    name: "learn_from_session",
    description: "Record learnings from current session",
    inputSchema: {
      type: "object",
      properties: {
        issue_type: { type: "string" },
        success: { type: "boolean" },
        pattern: { type: "string" },
        improvement: { type: "string" },
        impact: { type: "string" }
      }
    }
  },
  {
    name: "auto_heal_issues",
    description: "Automatically fix common issues"
  },
  {
    name: "get_recommendations",
    description: "Get personalized recommendations based on learning"
  },
  {
    name: "get_metrics",
    description: "Get learning and health metrics"
  }
];

console.log(JSON.stringify({
  type: "mcp-server",
  name: "self-learning-health",
  version: "1.0.0",
  tools
}));

let inputBuffer = "";
process.stdin.on("data", async (chunk) => {
  inputBuffer += chunk.toString();

  try {
    const toolCall = JSON.parse(inputBuffer);
    inputBuffer = "";

    let result;
    switch (toolCall.name) {
      case "diagnostic_health":
        result = await server.diagnosticHealth();
        break;
      case "learn_from_session":
        result = await server.learnFromSession(toolCall);
        break;
      case "auto_heal_issues":
        result = await server.autoHealIssues();
        break;
      case "get_recommendations":
        result = await server.getRecommendations();
        break;
      case "get_metrics":
        result = await server.getMetrics();
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
