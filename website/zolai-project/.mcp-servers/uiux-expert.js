#!/usr/bin/env node

/**
 * UI/UX Expert MCP Server
 * Design patterns, accessibility, best practices, and usability guidance
 */

const fs = require("fs");
const path = require("path");

class UIUXExpertServer {
  constructor() {
    this.workspaceFolder = process.cwd();
    this.logFile = path.join(this.workspaceFolder, ".mcp-servers/logs/uiux-expert.log");
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
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    fs.appendFileSync(this.logFile, logEntry);
  }

  async reviewDesign(componentPath) {
    this.log(`Reviewing design: ${componentPath}`);

    if (!fs.existsSync(componentPath)) {
      return { status: "error", error: `Component not found: ${componentPath}` };
    }

    const content = fs.readFileSync(componentPath, "utf8");
    const issues = [];

    // Accessibility checks
    const a11yChecks = this.performA11yChecks(content, componentPath);
    issues.push(...a11yChecks);

    // Design pattern checks
    const patternChecks = this.checkDesignPatterns(content);
    issues.push(...patternChecks);

    // Usability checks
    const usabilityChecks = this.checkUsability(content);
    issues.push(...usabilityChecks);

    // Performance checks
    const perfChecks = this.checkPerformance(content);
    issues.push(...perfChecks);

    const severity = {
      critical: issues.filter(i => i.severity === "critical").length,
      warning: issues.filter(i => i.severity === "warning").length,
      info: issues.filter(i => i.severity === "info").length
    };

    return {
      status: "reviewed",
      component: componentPath,
      issues,
      severity,
      score: Math.max(0, 100 - (severity.critical * 10 + severity.warning * 3)),
      recommendations: this.generateRecommendations(issues)
    };
  }

  performA11yChecks(content, filePath) {
    const issues = [];

    // Missing alt text
    if (/(<Image|<img)(?!.*alt=)/.test(content)) {
      issues.push({
        type: "accessibility",
        severity: "critical",
        issue: "Missing alt text on images",
        solution: "Add alt prop: <Image ... alt='descriptive text' />",
        wcag: "WCAG 2.1 Level A"
      });
    }

    // Missing aria-labels
    if (/<button[^>]*>(?!.*aria-label)/.test(content) && !/[a-z]+/.test(content)) {
      issues.push({
        type: "accessibility",
        severity: "warning",
        issue: "Button missing accessible label",
        solution: "Add aria-label or visible text",
        wcag: "WCAG 2.1 Level A"
      });
    }

    // Missing form labels
    if (/<input[^>]*(?!.*associated\s|.*aria-label)/.test(content)) {
      issues.push({
        type: "accessibility",
        severity: "warning",
        issue: "Form input missing associated label",
        solution: "Add <label htmlFor='id'> or aria-label",
        wcag: "WCAG 2.1 Level A"
      });
    }

    // Color contrast (basic check)
    if (/#[0-9a-f]{6}.*#[0-9a-f]{6}/.test(content)) {
      issues.push({
        type: "accessibility",
        severity: "info",
        issue: "Manual color contrast review recommended",
        solution: "Test with https://webaim.org/resources/contrastchecker/",
        wcag: "WCAG 2.1 Level AA"
      });
    }

    // Missing focus management
    if (/<Modal|<Dialog/.test(content) && !/onEscape|trapFocus/.test(content)) {
      issues.push({
        type: "accessibility",
        severity: "warning",
        issue: "Modal missing focus trap",
        solution: "Add focus management and escape key handling",
        wcag: "WCAG 2.1 Level A"
      });
    }

    return issues;
  }

  checkDesignPatterns(content) {
    const issues = [];

    // Check for component consistency
    if (!/className=.*\{/i.test(content) && !/cn\(/.test(content)) {
      issues.push({
        type: "design",
        severity: "info",
        issue: "Consider using Tailwind CSS utilities for consistency",
        solution: "Use tailwind classes or @/lib/cn helper for className merging",
        benefit: "Maintains design system consistency"
      });
    }

    // Check for proper component hierarchy
    if (/<div[^>]*className=".*gap-/.test(content)) {
      issues.push({
        type: "design",
        severity: "info",
        issue: "Using gap utility - ensure consistent spacing",
        solution: "Use design system spacing scale (gap-2, gap-4, gap-6, etc.)",
        benefit: "Consistent spacing throughout UI"
      });
    }

    // Check for responsive design
    if (!/md:|lg:|xl:/.test(content) && /className/.test(content)) {
      issues.push({
        type: "design",
        severity: "warning",
        issue: "Component may not be responsive",
        solution: "Add Tailwind responsive prefixes (md:, lg:, xl:)",
        benefit: "Works well on all screen sizes"
      });
    }

    // Check for dark mode support
    if (!/dark:/.test(content) && /bg-|text-/i.test(content)) {
      issues.push({
        type: "design",
        severity: "info",
        issue: "Consider dark mode support",
        solution: "Add dark: variants to color classes",
        benefit: "Supports user preferences"
      });
    }

    return issues;
  }

  checkUsability(content) {
    const issues = [];

    // Check for proper feedback mechanisms
    if (!/toast|Alert|Dialog|useTransition/.test(content) && /<button/.test(content)) {
      issues.push({
        type: "usability",
        severity: "warning",
        issue: "Button action lacks user feedback",
        solution: "Add loading states, toast notifications, or error handling",
        benefit: "Users know if action succeeded"
      });
    }

    // Check for loading states
    if (!/isPending|isLoading|disabled/.test(content) && /onClick|onSubmit/.test(content)) {
      issues.push({
        type: "usability",
        severity: "warning",
        issue: "Missing loading state feedback",
        solution: "Add isLoading prop or useTransition hook",
        benefit: "Prevents double-submission, shows progress"
      });
    }

    // Check for proper error handling
    if (!/error|Error|catch/.test(content) && /<input|select|textarea/.test(content)) {
      issues.push({
        type: "usability",
        severity: "info",
        issue: "Form may not handle validation errors",
        solution: "Add error state and messages for form fields",
        benefit: "Users understand what went wrong"
      });
    }

    // Check for proper call-to-action clarity
    if (/<button[^>]*>\s*[A-Z]{8,}/.test(content)) {
      issues.push({
        type: "usability",
        severity: "info",
        issue: "Button text may be unclear",
        solution: "Use clear, action-oriented button labels",
        benefit: "Users understand what button does"
      });
    }

    return issues;
  }

  checkPerformance(content) {
    const issues = [];

    // Check for unnecessary re-renders
    if (/useState.*\[\].*useEffect/.test(content)) {
      issues.push({
        type: "performance",
        severity: "info",
        issue: "Check for unnecessary re-renders",
        solution: "Use useCallback, useMemo, or memo() to optimize",
        benefit: "Better performance on slower devices"
      });
    }

    // Check for images
    if (/<img(?!.*loading=|.*priority)/.test(content)) {
      issues.push({
        type: "performance",
        severity: "warning",
        issue: "Image missing lazy loading",
        solution: "Use Next.js Image component with lazy loading",
        benefit: "Faster page load times"
      });
    }

    // Check for proper CSS-in-JS or Tailwind
    if (/style=\{\{/.test(content)) {
      issues.push({
        type: "performance",
        severity: "info",
        issue: "Inline styles detected",
        solution: "Use Tailwind CSS classes instead",
        benefit: "Better CSS optimization and caching"
      });
    }

    return issues;
  }

  async designComponentTemplate(componentType) {
    this.log(`Generating template for: ${componentType}`);

    const templates = {
      form: this.getFormTemplate(),
      modal: this.getModalTemplate(),
      table: this.getTableTemplate(),
      card: this.getCardTemplate(),
      button: this.getButtonTemplate(),
      navbar: this.getNavbarTemplate(),
      sidebar: this.getSidebarTemplate(),
      dropdown: this.getDropdownTemplate()
    };

    const template = templates[componentType] || templates.card;

    return {
      status: "generated",
      component_type: componentType,
      template,
      best_practices: this.getComponentBestPractices(componentType),
      accessibility_checklist: this.getA11yChecklist(componentType),
      testing_tips: this.getTestingTips(componentType)
    };
  }

  getFormTemplate() {
    return `"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

export function MyForm() {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data) => {
    startTransition(async () => {
      // Handle submission
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Form fields with error display */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit"}
      </Button>
    </form>
  );
}`;
  }

  getModalTemplate() {
    return `"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function MyModal({ open, onOpenChange }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modal Title</DialogTitle>
        </DialogHeader>
        {/* Content */}
      </DialogContent>
    </Dialog>
  );
}`;
  }

  getTableTemplate() {
    return `"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export function MyTable({ data }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Column 1</TableHead>
          <TableHead>Column 2</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{row.field1}</TableCell>
            <TableCell>{row.field2}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}`;
  }

  getCardTemplate() {
    return `import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MyCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Content */}
      </CardContent>
    </Card>
  );
}`;
  }

  getButtonTemplate() {
    return `import { Button } from "@/components/ui/button";

export function MyButtons() {
  return (
    <>
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Delete</Button>
      <Button disabled>Disabled</Button>
    </>
  );
}`;
  }

  getNavbarTemplate() {
    return `"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Brand
        </Link>
        <div className="flex gap-4">
          <Link href="/about">About</Link>
          <Link href="/contact">Contact</Link>
          <Button>Sign In</Button>
        </div>
      </div>
    </nav>
  );
}`;
  }

  getSidebarTemplate() {
    return `import Link from "next/link";
import { cn } from "@/lib/cn";

export function Sidebar({ activeItem }) {
  const items = [
    { label: "Home", href: "/" },
    { label: "Profile", href: "/profile" },
    { label: "Settings", href: "/settings" },
  ];

  return (
    <div className="w-64 border-r p-4">
      <nav className="space-y-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn("block px-4 py-2 rounded", activeItem === item.href && "bg-blue-100")}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}`;
  }

  getDropdownTemplate() {
    return `"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MyDropdown() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Menu</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>Option 1</DropdownMenuItem>
        <DropdownMenuItem>Option 2</DropdownMenuItem>
        <DropdownMenuItem>Option 3</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}`;
  }

  getComponentBestPractices(componentType) {
    const practices = {
      form: [
        "Use react-hook-form for form management",
        "Validate with Zod schemas",
        "Show field errors inline",
        "Provide loading feedback during submission",
        "Clear success/error messages"
      ],
      modal: [
        "Add focus trap to modal",
        "Handle escape key to close",
        "Show clear close button",
        "Ensure backdrop prevents interaction",
        "Use semantic HTML"
      ],
      table: [
        "Add sorting and filtering",
        "Implement pagination or virtual scrolling",
        "Use striped rows for readability",
        "Make rows selectable with checkboxes",
        "Show loading skeleton while fetching"
      ],
      card: [
        "Use consistent spacing",
        "Add subtle shadow for depth",
        "Make titles descriptive",
        "Group related content",
        "Ensure good contrast"
      ],
      button: [
        "Use clear action verbs",
        "Show loading state during action",
        "Provide hover feedback",
        "Ensure adequate touch target (44x44px)",
        "Disable when not applicable"
      ],
      navbar: [
        "Keep sticky to top",
        "Show active navigation state",
        "Make mobile responsive",
        "Include search if needed",
        "Add authentication info"
      ],
      sidebar: [
        "Make collapsible on mobile",
        "Show active page indicator",
        "Use icons for recognition",
        "Allow user preferences for collapse state",
        "Ensure good contrast"
      ],
      dropdown: [
        "Close on selection",
        "Support keyboard navigation",
        "Show disabled items appropriately",
        "Use semantic HTML",
        "Add visual feedback on hover"
      ]
    };

    return practices[componentType] || practices.card;
  }

  getA11yChecklist(componentType) {
    return [
      "✅ All text has sufficient color contrast (WCAG AA minimum)",
      "✅ All interactive elements are keyboard accessible",
      "✅ All images have descriptive alt text",
      "✅ Form labels are associated with inputs",
      "✅ Error messages are clearly visible and linked to fields",
      "✅ Focus indicators are visible",
      "✅ ARIA labels used where needed",
      "✅ Component tested with screen reader"
    ];
  }

  getTestingTips(componentType) {
    return [
      "Test with keyboard navigation only",
      "Test with screen reader (NVDA/VoiceOver)",
      "Test on different screen sizes",
      "Test with different color schemes (light/dark)",
      "Test with zoom up to 200%",
      "Test with slow network conditions",
      `Test ${componentType} behavior in isolation`,
      "Test with typical user workflows"
    ];
  }

  generateRecommendations(issues) {
    const recommendations = [];

    const critical = issues.filter(i => i.severity === "critical");
    if (critical.length > 0) {
      recommendations.push(`🚨 Fix ${critical.length} critical accessibility issues immediately`);
    }

    const warnings = issues.filter(i => i.severity === "warning");
    if (warnings.length > 0) {
      recommendations.push(`⚠️  Address ${warnings.length} usability warnings`);
    }

    const info = issues.filter(i => i.severity === "info");
    if (info.length > 0) {
      recommendations.push(`ℹ️  Consider ${info.length} design improvements`);
    }

    if (recommendations.length === 0) {
      recommendations.push("✅ Design looks good!");
    }

    return recommendations;
  }

  async getDesignSystem() {
    this.log("Retrieving design system information");

    return {
      status: "complete",
      design_system: {
        colors: {
          primary: "blue-600",
          secondary: "gray-600",
          success: "green-600",
          warning: "yellow-600",
          error: "red-600"
        },
        spacing: ["2px", "4px", "8px", "16px", "24px", "32px", "48px"],
        typography: {
          heading1: "text-4xl font-bold",
          heading2: "text-3xl font-bold",
          heading3: "text-2xl font-semibold",
          body: "text-base font-normal",
          small: "text-sm font-normal"
        },
        components: [
          "Button",
          "Input",
          "Select",
          "Card",
          "Modal",
          "Table",
          "Navbar",
          "Sidebar",
          "Dropdown"
        ]
      },
      tailwind_config: "tailwind.config.ts",
      shadcn_components: "components/ui/",
      guidelines: [
        "Use Tailwind CSS for styling",
        "Use shadcn/ui for pre-built components",
        "Follow mobile-first responsive design",
        "Support dark mode with dark: prefix",
        "Ensure WCAG 2.1 AA compliance"
      ]
    };
  }
}

// MCP Server
const server = new UIUXExpertServer();

const tools = [
  {
    name: "review_design",
    description: "Review component design for accessibility, patterns, usability, and performance",
    inputSchema: {
      type: "object",
      properties: {
        component_path: { type: "string", description: "Path to component file" }
      },
      required: ["component_path"]
    }
  },
  {
    name: "design_component_template",
    description: "Generate design templates for component types",
    inputSchema: {
      type: "object",
      properties: {
        component_type: {
          type: "string",
          enum: ["form", "modal", "table", "card", "button", "navbar", "sidebar", "dropdown"]
        }
      },
      required: ["component_type"]
    }
  },
  {
    name: "get_design_system",
    description: "Get design system guidelines and components"
  }
];

console.log(JSON.stringify({
  type: "mcp-server",
  name: "uiux-expert",
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
      case "review_design":
        result = await server.reviewDesign(toolCall.component_path);
        break;
      case "design_component_template":
        result = await server.designComponentTemplate(toolCall.component_type);
        break;
      case "get_design_system":
        result = await server.getDesignSystem();
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
