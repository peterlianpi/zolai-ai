import { test, expect } from '@playwright/test';
import { createTestHelpers } from '../utils/test-helpers';

test.describe('Performance Tests', () => {
  let helpers: ReturnType<typeof createTestHelpers>;

  test.beforeEach(async ({ page, request }) => {
    helpers = createTestHelpers(page, request);
  });

  test('Homepage should load within performance budget', async ({ page }) => {
    const loadTime = await helpers.measurePageLoad('/');
    
    // Performance budget: homepage should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
    
    // Check for core web vitals
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          if (entries.length > 0) {
            resolve(entries[0].startTime);
          }
        }).observe({ entryTypes: ['largest-contentful-paint'] });
      });
    });
    
    // LCP should be under 2.5 seconds
    expect(lcp).toBeLessThan(2500);
  });

  test('Dashboard should load quickly for authenticated users', async ({ page: _page }) => {
    test.use({ storageState: 'tests/fixtures/.auth/user.json' });
    
    const loadTime = await helpers.measurePageLoad('/dashboard');
    
    // Dashboard performance budget: 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test('Search results should load efficiently', async ({ page }) => {
    await page.goto('/');
    
    const startTime = Date.now();
    await page.fill('[data-testid="search-input"]', 'technology');
    await page.keyboard.press('Enter');
    
    await page.waitForSelector('[data-testid="search-results"]');
    const searchTime = Date.now() - startTime;
    
    // Search should complete within 1.5 seconds
    expect(searchTime).toBeLessThan(1500);
  });

  test('Image loading should be optimized', async ({ page }) => {
    await page.goto('/posts');
    
    // Check that images are lazy loaded
    const images = page.locator('img[loading="lazy"]');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    // Check for proper image formats (WebP support)
    const firstImage = images.first();
    const src = await firstImage.getAttribute('src');
    expect(src).toMatch(/\.(webp|jpg|jpeg|png)$/);
  });

  test('API response times should be acceptable', async ({ request }) => {
    const endpoints = [
      '/api/health',
      '/api/content',
      '/api/menus',
      '/api/seo'
    ];

    for (const endpoint of endpoints) {
      const startTime = Date.now();
      const response = await request.get(endpoint);
      const responseTime = Date.now() - startTime;
      
      expect(response.ok()).toBeTruthy();
      // API responses should be under 500ms
      expect(responseTime).toBeLessThan(500);
    }
  });

  test('Content loading should use caching effectively', async ({ page }) => {
    // First visit
    await page.goto('/');
    
    // Check cache headers
    const response = await page.reload();
    const cacheControl = response?.headers()['cache-control'];
    expect(cacheControl).toBeDefined();
    
    // Second visit should be faster due to caching
    const firstLoadTime = await helpers.measurePageLoad('/');
    const secondLoadTime = await helpers.measurePageLoad('/');
    
    expect(secondLoadTime).toBeLessThan(firstLoadTime);
  });

  test('Large content lists should be paginated', async ({ page }) => {
    await page.goto('/posts');
    
    // Check that pagination is present for large lists
    await expect(page.locator('[data-testid="pagination"]')).toBeVisible();
    
    // Check that not all items are loaded at once
    const postItems = page.locator('[data-testid="post-item"]');
    const itemCount = await postItems.count();
    
    // Should be a reasonable number (not all posts at once)
    expect(itemCount).toBeLessThanOrEqual(20);
  });

  test('Database queries should be optimized', async ({ page }) => {
    // Monitor network requests for N+1 queries
    const responses: Array<{
      url: string;
      status: number;
      timing: { responseEnd?: number };
    }> = [];
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        responses.push({
          url: response.url(),
          status: response.status(),
          timing: { responseEnd: response.timing?.responseEnd }
        });
      }
    });
    
    await page.goto('/dashboard');
    
    // Should not have excessive API calls
    const apiCalls = responses.length;
    expect(apiCalls).toBeLessThan(10);
    
    // All API calls should complete quickly
    const slowCalls = responses.filter(r => (r.timing?.responseEnd || 0) > 1000);
    expect(slowCalls).toHaveLength(0);
  });

  test('Memory usage should be reasonable', async ({ page }) => {
    await page.goto('/');
    
    const memoryBefore = await page.evaluate(() => {
      return (performance as { memory?: { usedJSHeapSize?: number } }).memory?.usedJSHeapSize || 0;
    });
    
    // Navigate through several pages
    await page.goto('/posts');
    await page.goto('/news');
    await page.goto('/about');
    
    const memoryAfter = await page.evaluate(() => {
      return (performance as { memory?: { usedJSHeapSize?: number } }).memory?.usedJSHeapSize || 0;
    });
    
    const memoryIncrease = memoryAfter - memoryBefore;
    
    // Memory increase should be reasonable (under 50MB)
    expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
  });
});

test.describe('Load Testing', () => {
  test('Should handle concurrent users', async ({ browser }) => {
    const contexts = await Promise.all([
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext(),
      browser.newContext()
    ]);
    
    const pages = await Promise.all(
      contexts.map(context => context.newPage())
    );
    
    // Simulate concurrent homepage visits
    const loadPromises = pages.map(async (page) => {
      const startTime = Date.now();
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      return Date.now() - startTime;
    });
    
    const loadTimes = await Promise.all(loadPromises);
    
    // All concurrent loads should complete within reasonable time
    for (const loadTime of loadTimes) {
      expect(loadTime).toBeLessThan(5000);
    }
    
    // Clean up
    await Promise.all(contexts.map(context => context.close()));
  });

  test('Should handle rapid API requests', async ({ request }) => {
    const requests = Array.from({ length: 20 }, () =>
      request.get('/api/health')
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    // All requests should succeed
    for (const response of responses) {
      expect(response.ok()).toBeTruthy();
    }
    
    // Should handle 20 requests within 2 seconds
    expect(totalTime).toBeLessThan(2000);
  });
});
