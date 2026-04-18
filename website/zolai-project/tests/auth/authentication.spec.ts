import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('Authentication Flow', () => {
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should display login form', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.locator('[data-testid="email"]')).toBeVisible();
    await expect(page.locator('[data-testid="password"]')).toBeVisible();
    await expect(page.locator('[data-testid="login-button"]')).toBeVisible();
  });

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    await page.click('[data-testid="login-button"]');
    
    await helpers.expectToast('Invalid credentials');
    await expect(page).toHaveURL('/login');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login\?callbackURL=/);
  });

  test('should redirect authenticated users away from auth pages', async ({ page }) => {
    // First login
    await helpers.loginAsUser();
    
    // Try to access login page
    await page.goto('/login');
    await expect(page).toHaveURL('/dashboard');
  });

  test('should handle password reset flow', async ({ page }) => {
    await page.goto('/forgot-password');
    
    await page.fill('[data-testid="email"]', 'test-user@example.com');
    await page.click('[data-testid="reset-button"]');
    
    await helpers.expectToast('Password reset email sent');
  });

  test('should handle email verification', async ({ page }) => {
    // This would test the email verification flow
    // In a real test, you'd use test email services or mock the verification
    await page.goto('/verify-email');
    await expect(page.locator('h1')).toContainText('Verify Your Email');
  });

  test('should handle 2FA flow', async ({ page }) => {
    // Test 2FA setup and verification
    await helpers.loginAsUser();
    await page.goto('/settings');
    
    // Enable 2FA
    await page.click('[data-testid="enable-2fa"]');
    await expect(page.locator('[data-testid="2fa-setup"]')).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    await helpers.loginAsUser();
    await helpers.logout();
    
    await expect(page).toHaveURL('/');
    
    // Verify can't access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('should handle session expiry', async ({ page, context }) => {
    await helpers.loginAsUser();
    
    // Clear cookies to simulate session expiry
    await context.clearCookies();
    
    // Try to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Registration Flow', () => {
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should register new user successfully', async ({ page }) => {
    await page.goto('/signup');
    
    const timestamp = Date.now();
    const email = `test-${timestamp}@example.com`;
    
    await page.fill('[data-testid="name"]', 'Test User');
    await page.fill('[data-testid="email"]', email);
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.fill('[data-testid="confirm-password"]', 'TestPassword123!');
    await page.click('[data-testid="register-button"]');
    
    // Should redirect to verification pending or dashboard
    await expect(page).toHaveURL(/\/(verification-pending|dashboard)/);
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[data-testid="password"]', 'weak');
    await page.locator('[data-testid="password"]').blur();
    
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be');
  });

  test('should prevent duplicate email registration', async ({ page }) => {
    await page.goto('/signup');
    
    await page.fill('[data-testid="email"]', 'existing@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="register-button"]');
    
    await helpers.expectToast('Email already in use');
  });
});
