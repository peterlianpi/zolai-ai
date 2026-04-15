import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/fixtures/.auth/user.json';
const adminAuthFile = 'tests/fixtures/.auth/admin.json';

// Setup regular user authentication
setup('authenticate as regular user', async ({ page }) => {
  await page.goto('/login');
   
  // Login with pre-seeded test credentials (from seed-test-data.ts)
  await page.fill('[data-testid="email"]', 'test-user@example.com');
  await page.fill('[data-testid="password"]', 'TestPassword123!');
  await page.click('[data-testid="login-button"]');
   
  // Wait for successful login - should redirect to dashboard
  await page.waitForURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
   
  // Store authentication state
  await page.context().storageState({ path: authFile });
});

// Setup admin user authentication
setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
   
  // Login with pre-seeded admin credentials (from seed-test-data.ts)
  await page.fill('[data-testid="email"]', 'admin@example.com');
  await page.fill('[data-testid="password"]', 'AdminPassword123!');
  await page.click('[data-testid="login-button"]');
   
  await page.waitForURL('/dashboard');
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
   
  // Verify admin access
  await page.goto('/admin');
  await expect(page).toHaveURL('/admin');
   
  await page.context().storageState({ path: adminAuthFile });
});
