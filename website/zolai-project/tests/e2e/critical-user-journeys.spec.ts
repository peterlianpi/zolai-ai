import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('Critical User Journeys', () => {
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('Complete user registration and first login journey', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();

    // 2. Navigate to registration
    await page.click('[data-testid="register-link"]');
    await expect(page).toHaveURL('/signup');

    // 3. Complete registration
    const timestamp = Date.now();
    const email = `journey-test-${timestamp}@example.com`;
    
    await page.fill('[data-testid="name"]', 'Journey Test User');
    await page.fill('[data-testid="email"]', email);
    await page.fill('[data-testid="password"]', 'JourneyTest123!');
    await page.fill('[data-testid="confirm-password"]', 'JourneyTest123!');
    await page.click('[data-testid="register-button"]');

    // 4. Handle email verification (if enabled)
    if (await page.locator('[data-testid="verification-message"]').isVisible()) {
      // In real tests, you'd handle email verification
      await expect(page.locator('h1')).toContainText('Verify Your Email');
    } else {
      // 5. Should be logged in and redirected to dashboard
      await expect(page).toHaveURL('/dashboard');
      await expect(page.locator('[data-testid="welcome-message"]')).toBeVisible();
    }
  });

  test('Content creation and publishing workflow', async ({ page }) => {
    test.use({ storageState: 'tests/fixtures/.auth/user.json' });
    
    // 1. Login and navigate to content creation
    await page.goto('/dashboard');
    await page.click('[data-testid="create-post"]');

    // 2. Create draft post
    await page.fill('[data-testid="post-title"]', 'Test Article Title');
    
    // Fill rich text editor
    await page.locator('[data-testid="content-editor"]').click();
    await page.keyboard.type('This is test content for the article.');
    
    // 3. Save as draft
    await page.click('[data-testid="save-draft"]');
    await helpers.expectToast('Draft saved');

    // 4. Add featured image
    await page.click('[data-testid="add-featured-image"]');
    // In real test, upload actual image
    
    // 5. Add categories and tags
    await page.click('[data-testid="add-category"]');
    await page.fill('[data-testid="category-input"]', 'Technology');
    await page.keyboard.press('Enter');
    
    await page.fill('[data-testid="tags-input"]', 'test, article');

    // 6. Publish post
    await page.click('[data-testid="publish-post"]');
    await helpers.expectToast('Post published successfully');

    // 7. Verify post appears on public site
    await page.goto('/posts');
    await expect(page.locator('[data-testid="post-title"]')).toContainText('Test Article Title');
  });

  test('User profile and settings management', async ({ page }) => {
    test.use({ storageState: 'tests/fixtures/.auth/user.json' });
    
    // 1. Navigate to profile settings
    await page.goto('/settings');
    
    // 2. Update profile information
    await page.fill('[data-testid="display-name"]', 'Updated Display Name');
    await page.fill('[data-testid="bio"]', 'Updated bio description');
    
    // 3. Update email preferences
    await page.click('[data-testid="email-notifications"]');
    await page.uncheck('[data-testid="marketing-emails"]');
    
    // 4. Change password
    await page.click('[data-testid="change-password-tab"]');
    await page.fill('[data-testid="current-password"]', 'TestPassword123!');
    await page.fill('[data-testid="new-password"]', 'NewPassword123!');
    await page.fill('[data-testid="confirm-new-password"]', 'NewPassword123!');
    
    // 5. Save all changes
    await page.click('[data-testid="save-profile"]');
    await helpers.expectToast('Profile updated successfully');
    
    // 6. Verify changes persist
    await page.reload();
    await expect(page.locator('[data-testid="display-name"]')).toHaveValue('Updated Display Name');
  });

  test('Comment and interaction workflow', async ({ page }) => {
    // 1. Visit a published post as anonymous user
    await page.goto('/posts/sample-post');
    await expect(page.locator('[data-testid="post-content"]')).toBeVisible();
    
    // 2. Try to comment (should prompt login)
    await page.click('[data-testid="comment-button"]');
    await expect(page).toHaveURL(/\/login/);
    
    // 3. Login and return to post
    await helpers.loginAsUser();
    await page.goto('/posts/sample-post');
    
    // 4. Leave a comment
    await page.fill('[data-testid="comment-input"]', 'This is a test comment');
    await page.click('[data-testid="submit-comment"]');
    await helpers.expectToast('Comment posted');
    
    // 5. Verify comment appears
    await expect(page.locator('[data-testid="comment-content"]')).toContainText('This is a test comment');
    
    // 6. Reply to comment
    await page.click('[data-testid="reply-button"]');
    await page.fill('[data-testid="reply-input"]', 'This is a reply');
    await page.click('[data-testid="submit-reply"]');
    
    // 7. Verify reply appears
    await expect(page.locator('[data-testid="reply-content"]')).toContainText('This is a reply');
  });

  test('Search and navigation workflow', async ({ page }) => {
    // 1. Visit homepage
    await page.goto('/');
    
    // 2. Use main navigation
    await page.click('[data-testid="news-menu"]');
    await expect(page).toHaveURL('/news');
    
    // 3. Search for content
    await page.fill('[data-testid="search-input"]', 'internet');
    await page.keyboard.press('Enter');
    
    await expect(page).toHaveURL(/\/search\?q=internet/);
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    
    // 4. Filter search results
    await page.click('[data-testid="filter-by-date"]');
    await page.click('[data-testid="last-month"]');
    
    // 5. Navigate to specific result
    await page.click('[data-testid="search-result"]:first-child');
    await expect(page.locator('[data-testid="post-title"]')).toBeVisible();
    
    // 6. Use breadcrumb navigation
    await page.click('[data-testid="breadcrumb-home"]');
    await expect(page).toHaveURL('/');
  });

  test('Mobile responsive journey', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'This test only runs on mobile');
    
    // 1. Test mobile navigation
    await page.goto('/');
    await page.click('[data-testid="mobile-menu-toggle"]');
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
    
    // 2. Test mobile search
    await page.click('[data-testid="mobile-search"]');
    await page.fill('[data-testid="search-input"]', 'test');
    await page.keyboard.press('Enter');
    
    // 3. Test mobile post reading
    await page.goto('/posts/sample-post');
    await expect(page.locator('[data-testid="post-content"]')).toBeVisible();
    
    // 4. Test mobile commenting
    await helpers.loginAsUser();
    await page.fill('[data-testid="comment-input"]', 'Mobile comment');
    await page.click('[data-testid="submit-comment"]');
    
    await helpers.expectToast('Comment posted');
  });

  test('Error handling and recovery', async ({ page }) => {
    // 1. Test 404 page
    await page.goto('/non-existent-page');
    await helpers.expectErrorPage(404);
    
    // Click home link
    await page.click('[data-testid="home-link"]');
    await expect(page).toHaveURL('/');
    
    // 2. Test network error recovery
    await page.route('**/api/content', route => route.abort());
    await page.goto('/posts');
    
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // 3. Test retry mechanism
    await page.unroute('**/api/content');
    await page.click('[data-testid="retry-button"]');
    
    await expect(page.locator('[data-testid="posts-list"]')).toBeVisible();
  });

  test('Internationalization journey (Myanmar)', async ({ page }) => {
    // 1. Switch to Myanmar language
    await page.goto('/');
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="myanmar-language"]');
    
    // 2. Verify URL and content
    await expect(page).toHaveURL('/my/');
    
    // 3. Navigate Myanmar content
    await page.click('[data-testid="news-menu"]');
    await expect(page).toHaveURL('/my/news');
    
    // 4. Test Myanmar content creation
    await helpers.loginAsUser();
    await page.goto('/my/dashboard');
    
    await page.click('[data-testid="create-post"]');
    await page.fill('[data-testid="post-title"]', 'မြန်မာ ခေါင်းစဉ်');
    
    // Fill with Myanmar text
    await page.locator('[data-testid="content-editor"]').click();
    await page.keyboard.type('မြန်မာ အကြောင်းအရာ');
    
    await page.click('[data-testid="save-draft"]');
    await helpers.expectToast('Draft saved');
  });
});
