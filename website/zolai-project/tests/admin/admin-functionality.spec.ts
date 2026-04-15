import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('Admin Dashboard', () => {
  test.use({ storageState: 'tests/fixtures/.auth/admin.json' });
  
  let _helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    _helpers = createTestHelpers(page, request);
  });

  test('should display admin dashboard with stats', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.locator('h1')).toContainText('Admin Dashboard');
    await expect(page.locator('[data-testid="total-users"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-posts"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-media"]')).toBeVisible();
  });

  test('should load recent activity', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.locator('[data-testid="recent-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-item"]')).toBeVisible();
  });

  test('should display analytics charts', async ({ page }) => {
    await page.goto('/admin');
    
    await expect(page.locator('[data-testid="analytics-chart"]')).toBeVisible();
  });
});

test.describe('User Management', () => {
  test.use({ storageState: 'tests/fixtures/.auth/admin.json' });
  
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should list all users', async ({ page }) => {
    await page.goto('/admin/users');
    
    await expect(page.locator('h1')).toContainText('User Management');
    await expect(page.locator('[data-testid="users-table"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-row"]')).toHaveCount.toBeGreaterThan(0);
  });

  test('should search users', async ({ page }) => {
    await page.goto('/admin/users');
    
    await page.fill('[data-testid="user-search"]', 'test');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('[data-testid="user-row"]')).toBeVisible();
  });

  test('should filter users by role', async ({ page }) => {
    await page.goto('/admin/users');
    
    await page.click('[data-testid="role-filter"]');
    await page.click('[data-testid="admin-filter"]');
    
    await expect(page.locator('[data-testid="user-role"]')).toContainText('Admin');
  });

  test('should edit user profile', async ({ page }) => {
    await page.goto('/admin/users');
    
    await page.click('[data-testid="edit-user-button"]:first-child');
    
    await expect(page.locator('[data-testid="edit-user-form"]')).toBeVisible();
    
    await page.fill('[data-testid="user-name"]', 'Updated Name');
    await page.click('[data-testid="save-user"]');
    
    await helpers.expectToast('User updated successfully');
  });

  test('should ban and unban users', async ({ page }) => {
    await page.goto('/admin/users');
    
    // Ban user
    await page.click('[data-testid="user-actions"]:first-child');
    await page.click('[data-testid="ban-user"]');
    
    await page.fill('[data-testid="ban-reason"]', 'Test ban');
    await page.click('[data-testid="confirm-ban"]');
    
    await helpers.expectToast('User banned successfully');
    
    // Unban user
    await page.click('[data-testid="user-actions"]:first-child');
    await page.click('[data-testid="unban-user"]');
    
    await helpers.expectToast('User unbanned successfully');
  });

  test('should delete users', async ({ page }) => {
    await page.goto('/admin/users');
    
    await page.click('[data-testid="user-actions"]:first-child');
    await page.click('[data-testid="delete-user"]');
    
    await page.click('[data-testid="confirm-delete"]');
    
    await helpers.expectToast('User deleted successfully');
  });
});

test.describe('Content Management', () => {
  test.use({ storageState: 'tests/fixtures/.auth/admin.json' });
  
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should manage posts and pages', async ({ page }) => {
    await page.goto('/admin/content');
    
    await expect(page.locator('[data-testid="content-table"]')).toBeVisible();
    
    // Filter by content type
    await page.click('[data-testid="content-type-filter"]');
    await page.click('[data-testid="posts-filter"]');
    
    await expect(page.locator('[data-testid="content-type"]')).toContainText('Post');
  });

  test('should bulk delete content', async ({ page }) => {
    await page.goto('/admin/content');
    
    // Select multiple items
    await page.click('[data-testid="select-all"]');
    await page.click('[data-testid="bulk-delete"]');
    
    await page.click('[data-testid="confirm-bulk-delete"]');
    
    await helpers.expectToast('Content deleted successfully');
  });
});

test.describe('Security Management', () => {
  test.use({ storageState: 'tests/fixtures/.auth/admin.json' });
  
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should view security events', async ({ page }) => {
    await page.goto('/admin/security');
    
    await expect(page.locator('h1')).toContainText('Security');
    await expect(page.locator('[data-testid="security-events"]')).toBeVisible();
  });

  test('should block IP addresses', async ({ page }) => {
    await page.goto('/admin/security');
    
    await page.click('[data-testid="block-ip"]');
    
    await page.fill('[data-testid="ip-address"]', '192.168.1.100');
    await page.fill('[data-testid="block-reason"]', 'Malicious activity');
    await page.click('[data-testid="confirm-block"]');
    
    await helpers.expectToast('IP blocked successfully');
  });

  test('should view security statistics', async ({ page }) => {
    await page.goto('/admin/security');
    
    await expect(page.locator('[data-testid="security-stats"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-events"]')).toBeVisible();
    await expect(page.locator('[data-testid="critical-events"]')).toBeVisible();
  });
});

test.describe('Media Management', () => {
  test.use({ storageState: 'tests/fixtures/.auth/admin.json' });
  
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should upload and manage media files', async ({ page }) => {
    await page.goto('/admin/media');
    
    await expect(page.locator('[data-testid="media-grid"]')).toBeVisible();
    
    // Upload new file
    await page.click('[data-testid="upload-media"]');
    
    // This would need actual file handling in real tests
    const _fileInput = page.locator('[data-testid="file-input"]');
    // await _fileInput.setInputFiles('tests/fixtures/test-image.jpg');
    
    await expect(page.locator('[data-testid="media-item"]')).toHaveCount.toBeGreaterThan(0);
  });

  test('should delete media files', async ({ page }) => {
    await page.goto('/admin/media');
    
    await page.click('[data-testid="media-item"]:first-child [data-testid="delete-media"]');
    await page.click('[data-testid="confirm-delete"]');
    
    await helpers.expectToast('Media deleted successfully');
  });
});

test.describe('System Settings', () => {
  test.use({ storageState: 'tests/fixtures/.auth/admin.json' });
  
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('should update site settings', async ({ page }) => {
    await page.goto('/admin/settings');
    
    await page.fill('[data-testid="site-title"]', 'Updated Site Title');
    await page.fill('[data-testid="site-description"]', 'Updated description');
    
    await page.click('[data-testid="save-settings"]');
    
    await helpers.expectToast('Settings saved successfully');
  });

  test('should manage redirects', async ({ page }) => {
    await page.goto('/admin/redirects');
    
    await expect(page.locator('[data-testid="redirects-table"]')).toBeVisible();
    
    // Add new redirect
    await page.click('[data-testid="add-redirect"]');
    
    await page.fill('[data-testid="source-path"]', '/old-page');
    await page.fill('[data-testid="destination-path"]', '/new-page');
    await page.click('[data-testid="save-redirect"]');
    
    await helpers.expectToast('Redirect created successfully');
  });
});
