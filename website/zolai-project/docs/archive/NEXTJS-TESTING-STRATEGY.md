# Next.js Starter Project - Testing Strategy Guide (Latest)

**Version:** 2.0.0 (Updated 2026-04-09)  
**Next.js:** 16.x (Latest)  
**Test Frameworks:** Vitest, Playwright, React Testing Library  

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid](#testing-pyramid)
3. [Unit Testing (Vitest)](#unit-testing-vitest)
4. [Component Testing](#component-testing)
5. [Integration Testing](#integration-testing)
6. [E2E Testing (Playwright)](#e2e-testing-playwright)
7. [Coverage Targets](#coverage-targets)
8. [CI/CD Integration](#cicd-integration)

---

## Testing Philosophy

### Test-Driven Development (TDD)

1. **Write failing test** — Define expected behavior
2. **Write minimal code** — Make test pass
3. **Refactor** — Improve code quality
4. **Repeat** — Next feature

### What to Test

✅ **DO Test:**
- Business logic (calculations, validations)
- Edge cases and error handling
- API endpoint behavior
- User workflows (E2E)
- Database operations
- Authentication flows

❌ **DON'T Test:**
- Third-party libraries (already tested)
- UI implementation details
- Styling and CSS
- Import statements
- Simple getters/setters

### Coverage Targets

| Category | Target | Notes |
|----------|--------|-------|
| **Overall** | 80%+ | Reasonable for most projects |
| **Critical paths** | 100% | Auth, payments, core features |
| **UI components** | 70%+ | Test behavior, not implementation |
| **Utilities** | 90%+ | Pure functions should be fully tested |
| **APIs** | 95%+ | All happy paths + error cases |

---

## Testing Pyramid

```
         /\
        /  \  E2E Tests
       /  10% \ (Playwright)
      /________\

      /\      /\
     /  \    /  \ Integration Tests
    / 20% \  / 20% \ (Vitest + MSW)
   /______\/__________\

   ____________________
  |                    |
  |   Unit Tests       | 70%
  |   (Vitest)         |
  |____________________|
```

**Build bottom-up:** Unit → Integration → E2E

---

## Unit Testing (Vitest)

### Setup

```bash
bun add -D vitest @vitest/ui vitest-coverage-v8
```

### Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "dist/",
        ".next/",
        "**/*.d.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

### Example: Testing a Utility Function

**Code:** `lib/validation.ts`

```typescript
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain number");
  }

  return errors;
}
```

**Test:** `lib/validation.test.ts`

```typescript
import { describe, it, expect } from "vitest";
import { validateEmail, validatePassword } from "./validation";

describe("Email Validation", () => {
  it("should accept valid emails", () => {
    expect(validateEmail("user@example.com")).toBe(true);
    expect(validateEmail("test.user@example.co.uk")).toBe(true);
  });

  it("should reject invalid emails", () => {
    expect(validateEmail("invalid")).toBe(false);
    expect(validateEmail("@example.com")).toBe(false);
    expect(validateEmail("user@")).toBe(false);
  });

  it("should reject empty string", () => {
    expect(validateEmail("")).toBe(false);
  });
});

describe("Password Validation", () => {
  it("should accept strong passwords", () => {
    expect(validatePassword("SecurePass123")).toHaveLength(0);
  });

  it("should reject weak passwords", () => {
    expect(validatePassword("weak")).toContain("Password must be at least 8 characters");
    expect(validatePassword("nouppercase123")).toContain("Password must contain uppercase");
    expect(validatePassword("NOLOWERCASE123")).toContain("Password must contain lowercase");
    expect(validatePassword("NoNumbers")).toContain("Password must contain number");
  });

  it("should provide all error messages for very weak password", () => {
    const errors = validatePassword("abc");
    expect(errors.length).toBeGreaterThan(1);
  });
});
```

### Running Tests

```bash
# Run all tests
bun run test

# Run in watch mode
bun run test --watch

# Run specific file
bun run test lib/validation.test.ts

# Generate coverage report
bun run test --coverage

# Open coverage in browser
bun run test --coverage && open coverage/index.html
```

---

## Component Testing

### Setup

```bash
bun add -D @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Example: Testing a Button Component

**Code:** `components/Button.tsx`

```typescript
"use client";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary";
}

export function Button({
  children,
  onClick,
  disabled = false,
  variant = "primary",
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 rounded ${
        variant === "primary" ? "bg-blue-500" : "bg-gray-500"
      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
```

**Test:** `components/Button.test.tsx`

```typescript
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { Button } from "./Button";

describe("Button Component", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("calls onClick handler", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click</Button>);
    await user.click(screen.getByText("Click"));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it("disables button when disabled prop is true", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    );

    const button = screen.getByText("Click") as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applies variant styles", () => {
    const { container } = render(
      <Button variant="secondary">Click</Button>
    );

    const button = screen.getByText("Click");
    expect(button).toHaveClass("bg-gray-500");
  });
});
```

---

## Integration Testing

### Setup (with MSW - Mock Service Worker)

```bash
bun add -D msw
```

### Mock Handlers

**File:** `tests/handlers.ts`

```typescript
import { http, HttpResponse } from "msw";

export const handlers = [
  // POST /api/auth/signin
  http.post("/api/auth/signin", async ({ request }) => {
    const body = (await request.json()) as any;

    if (body.email === "admin@example.com" && body.password === "admin123") {
      return HttpResponse.json({
        success: true,
        data: {
          user: {
            id: "user_123",
            email: "admin@example.com",
            name: "Admin",
          },
          session: {
            token: "session_token",
            expires_at: new Date(),
          },
        },
      });
    }

    return HttpResponse.json(
      {
        success: false,
        error: {
          code: "INVALID_CREDENTIALS",
          message: "Invalid email or password",
        },
      },
      { status: 401 }
    );
  }),

  // GET /api/posts
  http.get("/api/posts", () => {
    return HttpResponse.json({
      success: true,
      data: {
        items: [
          {
            id: "post_1",
            title: "Test Post",
            slug: "test-post",
            status: "PUBLISHED",
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
        },
      },
    });
  }),
];
```

### Setup MSW Server

**File:** `tests/setup.ts`

```typescript
import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import { afterAll, afterEach, beforeAll } from "vitest";

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Integration Test Example

**File:** `features/auth/hooks/useLogin.test.ts`

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useLogin } from "./useLogin";

describe("useLogin Hook", () => {
  it("successfully logs in user", async () => {
    const { result } = renderHook(() => useLogin());

    result.current.login("admin@example.com", "admin123");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(
      expect.objectContaining({
        email: "admin@example.com",
      })
    );
    expect(result.current.error).toBeNull();
  });

  it("handles login error", async () => {
    const { result } = renderHook(() => useLogin());

    result.current.login("wrong@example.com", "wrongpassword");

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBe("Invalid email or password");
  });
});
```

---

## E2E Testing (Playwright)

### Setup

```bash
bun add -D @playwright/test
bunx playwright install
```

### Configuration

**File:** `playwright.config.ts`

```typescript
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  webServer: {
    command: "bun run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example: Authentication Flow

**File:** `tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should sign up new user", async ({ page }) => {
    // Navigate to signup page
    await page.goto("/auth/signup");

    // Fill form
    await page.fill('input[type="email"]', "newuser@example.com");
    await page.fill('input[type="password"]', "SecurePass123!");
    await page.fill('input[name="name"]', "New User");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL("/dashboard");

    // Verify user is logged in
    await expect(page.locator("text=New User")).toBeVisible();
  });

  test("should sign in existing user", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
  });

  test("should handle invalid credentials", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.fill('input[type="email"]', "wrong@example.com");
    await page.fill('input[type="password"]', "wrongpassword");

    await page.click('button[type="submit"]');

    // Error message should appear
    await expect(
      page.locator("text=Invalid email or password")
    ).toBeVisible();

    // Should stay on signin page
    await expect(page).toHaveURL("/auth/signin");
  });

  test("should sign out user", async ({ page, context }) => {
    // Log in first
    await page.goto("/auth/signin");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL("/dashboard");

    // Click logout button
    await page.click("button:has-text('Logout')");

    // Should redirect to home
    await expect(page).toHaveURL("/");

    // Auth token should be cleared
    const cookies = await context.cookies();
    const authCookie = cookies.find((c) => c.name === "auth");
    expect(authCookie).toBeUndefined();
  });
});
```

### E2E Test Example: Blog Feature

**File:** `tests/e2e/blog.spec.ts`

```typescript
import { test, expect } from "@playwright/test";

test.describe("Blog Feature", () => {
  test("should create and publish post", async ({ page }) => {
    // Log in first
    await page.goto("/auth/signin");
    await page.fill('input[type="email"]', "admin@example.com");
    await page.fill('input[type="password"]', "admin123");
    await page.click('button[type="submit"]');

    // Navigate to blog
    await page.goto("/blog/create");

    // Fill post form
    await page.fill('input[name="title"]', "My First Blog Post");
    await page.fill('input[name="slug"]', "my-first-blog-post");
    await page.fill("textarea", "This is my first blog post content");

    // Publish
    await page.click('button:has-text("Publish")');

    // Should redirect to post
    await expect(page).toHaveURL(/\/blog\/.*/);
    await expect(page.locator("h1")).toContainText("My First Blog Post");
  });

  test("should view published posts", async ({ page }) => {
    await page.goto("/blog");

    // Wait for posts to load
    await expect(page.locator("[data-testid='post-item']")).toHaveCount(1);

    // Click post
    await page.click('[data-testid="post-item"]');

    // View post
    await expect(page.locator("h1")).toBeVisible();
  });

  test("should add comment to post", async ({ page }) => {
    await page.goto("/blog/my-first-blog-post");

    // Scroll to comments
    await page.locator("#comments").scrollIntoViewIfNeeded();

    // Fill comment
    await page.fill('textarea[name="comment"]', "Great post!");

    // Submit
    await page.click('button[type="submit"]');

    // Comment should appear
    await expect(page.locator("text=Great post!")).toBeVisible();
  });
});
```

### Running E2E Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run specific test file
bun run test:e2e tests/e2e/auth.spec.ts

# Run in UI mode (interactive)
bun run test:e2e --ui

# Run in headed mode (see browser)
bun run test:e2e --headed

# Generate test report
bun run test:e2e --reporter=html
```

---

## Coverage Targets

### Coverage Configuration

**File:** `vitest.config.ts`

```typescript
coverage: {
  provider: "v8",
  reporter: ["text", "json", "html"],
  lines: 80,
  functions: 80,
  branches: 75,
  statements: 80,
  exclude: [
    "node_modules/",
    "dist/",
    ".next/",
    "**/*.d.ts",
  ],
}
```

### Check Coverage

```bash
# Generate coverage report
bun run test --coverage

# View HTML report
open coverage/index.html

# Check coverage thresholds
bun run test --coverage --reporter=verbose
```

---

## CI/CD Integration

### GitHub Actions

**File:** `.github/workflows/test.yml`

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Run unit tests
        run: bun run test

      - name: Generate coverage
        run: bun run test --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

      - name: Type check
        run: bun run type-check

      - name: Lint
        run: bun run lint

      - name: Build
        run: bun run build

      - name: Run E2E tests
        run: bun run test:e2e

      - name: Upload E2E screenshots
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Summary

This guide provides:
- ✅ Testing philosophy and best practices
- ✅ Unit testing with Vitest
- ✅ Component testing with React Testing Library
- ✅ Integration testing with MSW
- ✅ E2E testing with Playwright
- ✅ Coverage targets and verification
- ✅ CI/CD pipeline setup

**You're ready to test with confidence! 🚀**
