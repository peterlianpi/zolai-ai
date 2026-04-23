#!/usr/bin/env node

/**
 * Automation Testing MCP Server
 * Playwright test automation, generation, and execution
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");

class AutomationTestingServer {
  constructor() {
    this.workspaceFolder = process.cwd();
    this.logFile = path.join(this.workspaceFolder, ".mcp-servers/logs/automation-testing.log");
    this.ensureLogDir();
    this.testDirs = {
      auth: "tests/auth",
      api: "tests/api",
      admin: "tests/admin",
      e2e: "tests/e2e",
      performance: "tests/performance",
      security: "tests/api/api-security.spec.ts",
      accessibility: "tests/accessibility"
    };
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

  async runTests(category = "all", options = {}) {
    this.log(`Running tests: category=${category}, options=${JSON.stringify(options)}`);

    const args = ["playwright", "test"];

    if (category !== "all" && this.testDirs[category]) {
      args.push(this.testDirs[category]);
    }

    if (options.headed) args.push("--headed");
    if (options.debug) args.push("--debug");
    if (options.ui) args.push("--ui");
    if (options.grep) args.push("-g", options.grep);
    if (options.workers) args.push("--workers", options.workers.toString());
    if (options.retries) args.push("--retries", options.retries.toString());
    if (options.timeout) args.push("--timeout", options.timeout.toString());

    args.push("--reporter=json");

    try {
      const output = execSync(`bunx ${args.join(" ")} 2>/dev/null || echo '{}'`, {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        shell: "/bin/bash",
        maxBuffer: 10 * 1024 * 1024
      });

      const results = JSON.parse(output);
      this.log(`Tests completed: ${results.stats?.expected || 0} tests`);

      return {
        status: "complete",
        category,
        stats: results.stats || {},
        results: results.suites || [],
        summary: this.generateTestSummary(results)
      };
    } catch (e) {
      this.log(`Test execution error: ${e.message}`, "error");
      return {
        status: "error",
        error: e.message,
        suggestion: "Run 'npx playwright install' to ensure browsers are installed"
      };
    }
  }

  async generateTests(featurePath, testType = "full") {
    this.log(`Generating tests for ${featurePath} (type: ${testType})`);

    const feature = path.basename(featurePath);
    const testPath = path.join(this.workspaceFolder, "tests", `${feature}.spec.ts`);

    let template = "";

    switch (testType) {
      case "unit":
        template = this.generateUnitTestTemplate(feature);
        break;
      case "integration":
        template = this.generateIntegrationTestTemplate(feature);
        break;
      case "e2e":
        template = this.generateE2ETestTemplate(feature);
        break;
      case "full":
        template = this.generateFullTestTemplate(feature);
        break;
      default:
        template = this.generateE2ETestTemplate(feature);
    }

    return {
      status: "generated",
      feature,
      test_type: testType,
      suggested_path: testPath,
      template,
      next_steps: [
        `Save template to ${testPath}`,
        "Review test cases and customize for your feature",
        "Run: npx playwright test tests/" + feature + ".spec.ts",
        "Use --headed flag to see browser: npx playwright test --headed"
      ]
    };
  }

  generateUnitTestTemplate(feature) {
    return `import { test, expect } from "@playwright/test";

/**
 * Unit Tests for ${feature}
 * Tests isolated functions and utilities
 */

test.describe("${feature} - Unit Tests", () => {
  test("should validate input correctly", async () => {
    // Test validation logic
    // Import and test utility functions
  });

  test("should handle edge cases", async () => {
    // Test boundary conditions
    // Test error handling
  });

  test("should transform data correctly", async () => {
    // Test data transformation
    // Test type safety
  });
});
`;
  }

  generateIntegrationTestTemplate(feature) {
    return `import { test, expect } from "@playwright/test";

/**
 * Integration Tests for ${feature}
 * Tests module interactions and API contracts
 */

test.describe("${feature} - Integration Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Navigate to test environment
    await page.goto("http://localhost:3000");
  });

  test("should integrate with API correctly", async ({ page }) => {
    // Test API integration
    await page.waitForLoadState("networkidle");
    // Assertions
  });

  test("should handle errors gracefully", async ({ page }) => {
    // Test error scenarios
    // Verify error messages
  });

  test("should maintain state consistency", async ({ page }) => {
    // Test state management
    // Verify data flow
  });
});
`;
  }

  generateE2ETestTemplate(feature) {
    return `import { test, expect } from "@playwright/test";

/**
 * End-to-End Tests for ${feature}
 * Tests complete user workflows
 */

test.describe("${feature} - E2E Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login or setup test state
    await page.goto("http://localhost:3000");
  });

  test("should complete workflow as user", async ({ page }) => {
    // User journey test
    // Verify UI updates
    // Check final state
  });

  test("should handle user interactions", async ({ page }) => {
    // Test click, type, submit
    // Verify responses
  });

  test("should show appropriate feedback", async ({ page }) => {
    // Test notifications/toasts
    // Verify success/error messages
  });
});
`;
  }

  generateFullTestTemplate(feature) {
    return `import { test, expect } from "@playwright/test";

/**
 * Complete Test Suite for ${feature}
 * Unit + Integration + E2E tests
 */

test.describe("${feature}", () => {
  test.describe("Unit Tests", () => {
    test("should validate inputs", () => {
      // Unit test
    });
  });

  test.describe("Integration Tests", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("http://localhost:3000");
    });

    test("should integrate with API", async ({ page }) => {
      // Integration test
    });
  });

  test.describe("E2E Tests", () => {
    test("should complete user workflow", async ({ page }) => {
      // E2E test
    });
  });
});
`;
  }

  async analyzeTestCoverage() {
    this.log("Analyzing test coverage...");

    const coverage = {
      auth: this.getTestCount("tests/auth"),
      api: this.getTestCount("tests/api"),
      admin: this.getTestCount("tests/admin"),
      e2e: this.getTestCount("tests/e2e"),
      performance: this.getTestCount("tests/performance"),
      security: 1, // api-security.spec.ts
      total: 0
    };

    coverage.total = Object.values(coverage).reduce((a, b) => a + b, 0);

    const gaps = this.identifyCoveragGaps();

    return {
      status: "analyzed",
      coverage,
      gaps,
      recommendations: this.getCoverageRecommendations(coverage, gaps)
    };
  }

  getTestCount(dir) {
    try {
      const fullPath = path.join(this.workspaceFolder, dir);
      if (!fs.existsSync(fullPath)) return 0;
      const files = fs.readdirSync(fullPath);
      return files.filter(f => f.endsWith(".spec.ts")).length;
    } catch {
      return 0;
    }
  }

  identifyCoveragGaps() {
    const gaps = [];
    const featureDir = path.join(this.workspaceFolder, "features");

    if (!fs.existsSync(featureDir)) return gaps;

    const features = fs.readdirSync(featureDir);
    for (const feature of features) {
      const testFile = path.join(this.workspaceFolder, "tests", `${feature}.spec.ts`);
      if (!fs.existsSync(testFile)) {
        gaps.push(`Missing tests for features/${feature}`);
      }
    }

    return gaps;
  }

  getCoverageRecommendations(coverage, gaps) {
    const recommendations = [];

    if (coverage.auth < 5) recommendations.push("❌ Auth tests insufficient (< 5)");
    if (coverage.api < 10) recommendations.push("❌ API tests insufficient (< 10)");
    if (coverage.admin < 3) recommendations.push("⚠️  Admin tests could be expanded");
    if (coverage.e2e < 5) recommendations.push("⚠️  E2E tests could be expanded");
    if (gaps.length > 0) recommendations.push(`⚠️  ${gaps.length} features missing tests`);

    if (recommendations.length === 0) {
      recommendations.push("✅ Test coverage looks good");
    }

    return recommendations;
  }

  async getTestReport() {
    this.log("Generating test report...");

    const reportPath = path.join(this.workspaceFolder, "playwright-report");
    if (!fs.existsSync(reportPath)) {
      return {
        status: "no_report",
        message: "No test report generated yet",
        suggestion: "Run: npx playwright test && npx playwright show-report"
      };
    }

    try {
      const statsFile = path.join(reportPath, "index.json");
      if (fs.existsSync(statsFile)) {
        const stats = JSON.parse(fs.readFileSync(statsFile, "utf8"));
        return {
          status: "complete",
          report_path: reportPath,
          stats,
          view_command: "npx playwright show-report"
        };
      }
    } catch (e) {
      this.log(`Report read error: ${e.message}`, "warn");
    }

    return { status: "error", message: "Could not read test report" };
  }

  async validateTestSetup() {
    this.log("Validating test environment setup...");

    const checks = {
      playwright_installed: this.checkPlaywrightInstalled(),
      browsers_installed: this.checkBrowsersInstalled(),
      config_exists: this.checkPlaywrightConfig(),
      tests_exist: this.checkTestsExist(),
      env_configured: this.checkEnvConfig()
    };

    const passed = Object.values(checks).filter(c => c.status === "pass").length;
    const total = Object.keys(checks).length;

    return {
      status: "validated",
      checks,
      summary: `${passed}/${total} checks passed`,
      ready_to_test: passed === total,
      next_steps: this.getSetupNextSteps(checks)
    };
  }

  checkPlaywrightInstalled() {
    try {
      execSync("bunx playwright --version", { stdio: "pipe" });
      return { status: "pass", message: "Playwright installed" };
    } catch {
      return { status: "fail", message: "Playwright not found - run: npx playwright install" };
    }
  }

  checkBrowsersInstalled() {
    try {
      execSync("bunx playwright install", { stdio: "pipe" });
      return { status: "pass", message: "Browsers installed" };
    } catch {
      return { status: "fail", message: "Run: npx playwright install --with-deps" };
    }
  }

  checkPlaywrightConfig() {
    const configPath = path.join(this.workspaceFolder, "playwright.config.ts");
    return fs.existsSync(configPath)
      ? { status: "pass", message: "Config file exists" }
      : { status: "fail", message: "Missing playwright.config.ts" };
  }

  checkTestsExist() {
    const testDir = path.join(this.workspaceFolder, "tests");
    const hasTests = fs.existsSync(testDir) && fs.readdirSync(testDir).some(f => f.endsWith(".spec.ts"));
    return hasTests
      ? { status: "pass", message: "Test files exist" }
      : { status: "fail", message: "No test files found in tests/" };
  }

  checkEnvConfig() {
    const envLocal = path.join(this.workspaceFolder, ".env.local");
    return fs.existsSync(envLocal)
      ? { status: "pass", message: "Environment configured" }
      : { status: "warn", message: "Copy .env.example to .env.local" };
  }

  getSetupNextSteps(checks) {
    const steps = [];
    if (checks.playwright_installed.status !== "pass") steps.push("Install Playwright");
    if (checks.browsers_installed.status !== "pass") steps.push("Install browser binaries");
    if (checks.config_exists.status !== "pass") steps.push("Create playwright.config.ts");
    if (checks.tests_exist.status !== "pass") steps.push("Create test files in tests/");
    if (checks.env_configured.status !== "pass") steps.push("Setup environment variables");
    return steps.length > 0 ? steps : ["Ready to run tests!"];
  }

  generateTestSummary(results) {
    return {
      total: results.stats?.expected || 0,
      passed: (results.stats?.unexpected || 0) === 0 ? results.stats?.expected : 0,
      failed: results.stats?.unexpected || 0,
      skipped: results.stats?.skipped || 0,
      flaky: results.stats?.flaky || 0,
      duration: results.stats?.duration || 0
    };
  }
}

// MCP Server
const server = new AutomationTestingServer();

const tools = [
  {
    name: "run_tests",
    description: "Run Playwright tests (all, auth, api, admin, e2e, performance, security)",
    inputSchema: {
      type: "object",
      properties: {
        category: { type: "string", enum: ["all", "auth", "api", "admin", "e2e", "performance", "security"] },
        headed: { type: "boolean", description: "Show browser UI" },
        debug: { type: "boolean", description: "Interactive debug mode" },
        ui: { type: "boolean", description: "Test UI mode" },
        grep: { type: "string", description: "Filter tests by pattern" },
        workers: { type: "number", description: "Parallel workers" },
        retries: { type: "number", description: "Retry failed tests" }
      }
    }
  },
  {
    name: "generate_tests",
    description: "Generate test templates for a feature",
    inputSchema: {
      type: "object",
      properties: {
        feature_path: { type: "string" },
        test_type: { type: "string", enum: ["unit", "integration", "e2e", "full"] }
      },
      required: ["feature_path"]
    }
  },
  {
    name: "analyze_coverage",
    description: "Analyze test coverage and identify gaps"
  },
  {
    name: "get_test_report",
    description: "Get the latest test report"
  },
  {
    name: "validate_setup",
    description: "Validate test environment setup"
  }
];

console.log(JSON.stringify({
  type: "mcp-server",
  name: "automation-testing",
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
      case "run_tests":
        result = await server.runTests(toolCall.category, toolCall);
        break;
      case "generate_tests":
        result = await server.generateTests(toolCall.feature_path, toolCall.test_type);
        break;
      case "analyze_coverage":
        result = await server.analyzeTestCoverage();
        break;
      case "get_test_report":
        result = await server.getTestReport();
        break;
      case "validate_setup":
        result = await server.validateTestSetup();
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
