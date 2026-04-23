#!/usr/bin/env node

/**
 * Performance Optimization MCP Server
 * Core Web Vitals, bundle analysis, memory optimization, and caching strategies
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class PerformanceOptimizationServer {
  constructor() {
    this.workspaceFolder = process.cwd();
    this.logFile = path.join(this.workspaceFolder, ".mcp-servers/logs/performance.log");
    this.ensureLogDir();
  }

  ensureLogDir() {
    const logDir = path.dirname(this.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message, level = "info") {
    const timestamp = new Date().toISOString();
    fs.appendFileSync(this.logFile, `[${timestamp}] [${level.toUpperCase()}] ${message}\n`);
  }

  async analyzeBundleSize() {
    this.log("Analyzing bundle size...");

    try {
      const output = execSync("bunx build-buddy --json 2>/dev/null || echo '{}'", {
        cwd: this.workspaceFolder,
        encoding: "utf8",
        shell: "/bin/bash"
      });

      const results = JSON.parse(output);

      return {
        status: "complete",
        analysis: {
          total_size: this.formatBytes(results.total || 0),
          js_size: this.formatBytes(results.javascript || 0),
          css_size: this.formatBytes(results.css || 0),
          images_size: this.formatBytes(results.images || 0),
          recommendations: this.getBundleRecommendations()
        }
      };
    } catch (e) {
      this.log(`Bundle analysis error: ${e.message}`, "warn");
      return {
        status: "error",
        suggestion: "Install: npm install -g build-buddy"
      };
    }
  }

  async analyzeImageOptimization() {
    this.log("Analyzing image optimization...");

    const publicDir = path.join(this.workspaceFolder, "public");
    const issues = [];

    if (fs.existsSync(publicDir)) {
      const scanImages = (dir, depth = 0) => {
        if (depth > 3) return;
        const files = fs.readdirSync(dir);

        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);

          if (stat.isDirectory()) {
            scanImages(fullPath, depth + 1);
          } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
            const sizeKB = stat.size / 1024;

            if (/\.jpg|\.jpeg|\.png/i.test(file) && !file.includes("webp")) {
              issues.push({
                file: fullPath.replace(this.workspaceFolder, "."),
                issue: "Not using modern format (WebP)",
                size: this.formatBytes(stat.size),
                potential_savings: `${Math.round(sizeKB * 0.3)}KB (30%)`
              });
            }

            if (sizeKB > 500) {
              issues.push({
                file: fullPath.replace(this.workspaceFolder, "."),
                issue: "Image larger than 500KB",
                size: this.formatBytes(stat.size),
                solution: "Compress or split into smaller files"
              });
            }
          }
        }
      };

      scanImages(publicDir);
    }

    return {
      status: "complete",
      images_analyzed: true,
      issues,
      recommendations: [
        "Use Next.js Image component with lazy loading",
        "Convert images to WebP format",
        "Use responsive images with srcSet",
        "Implement CDN for image delivery",
        "Consider AVIF format for modern browsers"
      ]
    };
  }

  async analyzeMetrics() {
    this.log("Analyzing Core Web Vitals...");

    return {
      status: "analyzed",
      metrics: {
        lcp: { target: "< 2.5s", description: "Largest Contentful Paint" },
        inp: { target: "< 200ms", description: "Interaction to Next Paint" },
        cls: { target: "< 0.1", description: "Cumulative Layout Shift" },
        fid: { target: "< 100ms", description: "First Input Delay (deprecated)" },
        ttfb: { target: "< 600ms", description: "Time to First Byte" }
      },
      howToMeasure: [
        "Use PageSpeed Insights (Google)",
        "Use Web Vitals library: npm install web-vitals",
        "Test with Lighthouse in Chrome DevTools",
        "Use WebPageTest for detailed analysis"
      ],
      improvements: this.getMetricsImprovements()
    };
  }

  async suggestOptimizations() {
    this.log("Generating optimization suggestions...");

    const suggestions = {
      immediate: [
        {
          title: "Enable Compression",
          description: "Enable gzip/brotli compression",
          impact: "30-50% size reduction",
          effort: "Low"
        },
        {
          title: "Lazy Load Images",
          description: "Use Next.js Image with lazy loading",
          impact: "20-40% faster initial load",
          effort: "Low"
        },
        {
          title: "Code Splitting",
          description: "Split large bundles into chunks",
          impact: "Faster page load",
          effort: "Medium"
        }
      ],
      upcoming: [
        {
          title: "Cache Strategy",
          description: "Implement aggressive HTTP caching",
          impact: "Better repeat visits",
          effort: "Medium"
        },
        {
          title: "CDN Integration",
          description: "Serve static assets from CDN",
          impact: "Global faster delivery",
          effort: "Medium"
        },
        {
          title: "Database Query Optimization",
          description: "Index frequently queried fields",
          impact: "Faster API responses",
          effort: "High"
        }
      ]
    };

    return {
      status: "complete",
      suggestions,
      timeline: "Implement immediate suggestions first (1-2 days), then upcoming (1-2 weeks)"
    };
  }

  async analyzeDatabaseQueries() {
    this.log("Analyzing database query patterns...");

    const schemaPath = path.join(this.workspaceFolder, "prisma/schema.prisma");
    const issues = [];

    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, "utf8");

      // Check for N+1 query patterns
      if (schema.includes("include") && !schema.includes("select")) {
        issues.push({
          type: "n-plus-one-risk",
          severity: "high",
          issue: "Using include may cause N+1 queries",
          solution: "Use select to fetch only needed fields",
          example: "select: { id: true, name: true } instead of include: { relation: true }"
        });
      }

      // Check for missing indexes
      if (!/@@index|@@unique/.test(schema)) {
        issues.push({
          type: "missing-indexes",
          severity: "medium",
          issue: "No indexes defined",
          solution: "Add @@index on frequently queried fields",
          fields: ["userId", "email", "createdAt", "status"]
        });
      }
    }

    return {
      status: "analyzed",
      issues,
      recommendations: this.getDatabaseRecommendations()
    };
  }

  getBundleRecommendations() {
    return [
      "Split large bundles into route-based chunks",
      "Remove unused dependencies with `npx depcheck`",
      "Use dynamic imports for heavy libraries",
      "Enable minification and tree-shaking",
      "Analyze with Webpack Bundle Analyzer"
    ];
  }

  getMetricsImprovements() {
    return [
      "Preload critical resources",
      "Minimize JavaScript blocking rendering",
      "Optimize font loading strategy",
      "Reduce main thread work",
      "Use performant animations (CSS over JS)"
    ];
  }

  getDatabaseRecommendations() {
    return [
      "Add indexes to frequently queried fields",
      "Use select instead of include for partial fetches",
      "Cache frequently accessed data",
      "Batch database operations when possible",
      "Monitor slow queries with Prisma Studio"
    ];
  }

  formatBytes(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  }
}

const server = new PerformanceOptimizationServer();

const tools = [
  {
    name: "analyze_bundle_size",
    description: "Analyze JavaScript bundle size and components"
  },
  {
    name: "analyze_images",
    description: "Check images for optimization opportunities"
  },
  {
    name: "analyze_metrics",
    description: "Analyze Core Web Vitals targets and improvements"
  },
  {
    name: "suggest_optimizations",
    description: "Get performance optimization recommendations"
  },
  {
    name: "analyze_database_queries",
    description: "Analyze database queries for N+1 and optimization"
  }
];

console.log(JSON.stringify({
  type: "mcp-server",
  name: "performance-optimization",
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
      case "analyze_bundle_size":
        result = await server.analyzeBundleSize();
        break;
      case "analyze_images":
        result = await server.analyzeImageOptimization();
        break;
      case "analyze_metrics":
        result = await server.analyzeMetrics();
        break;
      case "suggest_optimizations":
        result = await server.suggestOptimizations();
        break;
      case "analyze_database_queries":
        result = await server.analyzeDatabaseQueries();
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
