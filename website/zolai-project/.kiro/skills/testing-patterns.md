---
name: testing-patterns
description: Playwright E2E testing patterns for this project. Use when writing, running, or debugging tests.
---

# Testing Patterns — Zolai Project

## Commands

```bash
npx playwright test                    # run all
npx playwright test --ui               # UI mode
npx playwright test -g "search query"  # filter by title
```

## Test file location

```
tests/
  e2e/
    dictionary.spec.ts
    auth.spec.ts
    zolai-chat.spec.ts
```

## Basic test structure

```ts
import { test, expect } from "@playwright/test";

test("dictionary search returns results", async ({ page }) => {
  await page.goto("/dictionary");
  await page.getByRole("searchbox").fill("lungdam");
  await page.getByRole("button", { name: "Search" }).click();
  await expect(page.getByRole("list")).toBeVisible();
});
```

## Auth in tests

```ts
// tests/fixtures/auth.ts
import { test as base } from "@playwright/test";

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL("/dashboard");
    await use(page);
  },
});
```

## API testing

```ts
test("dictionary API returns word", async ({ request }) => {
  const res = await request.get("/api/dictionary/search?q=lungdam&lang=zolai");
  expect(res.ok()).toBeTruthy();
  const body = await res.json();
  expect(body.success).toBe(true);
  expect(body.data).toHaveLength(expect.any(Number));
});
```

## What to test

- Happy path for each major user flow
- Auth gates (unauthenticated → redirect to login)
- API response shapes match `{ success, data?, error? }`
- Form validation errors display correctly
