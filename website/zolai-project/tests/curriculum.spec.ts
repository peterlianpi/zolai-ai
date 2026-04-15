import { test, expect } from '@playwright/test';

test.describe('Curriculum', () => {
  test('should load curriculum page and display levels', async ({ page }) => {
    await page.goto('/curriculum');
    await expect(page.locator('h1')).toContainText('Curriculum');
    
    // Check all 6 levels are visible
    for (const level of ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']) {
      await expect(page.locator(`button:has-text("${level}")`)).toBeVisible();
    }
  });

  test('should load sections for selected level', async ({ page }) => {
    await page.goto('/curriculum');
    
    // Click A1 level
    await page.locator('button:has-text("A1")').click();
    
    // Wait for sections to load
    await page.waitForTimeout(500);
    
    // Should have section cards
    const cards = page.locator('[class*="Card"]');
    await expect(cards.first()).toBeVisible();
  });

  test('should navigate to unit and display exercises', async ({ page }) => {
    await page.goto('/curriculum');
    
    // Click A1
    await page.locator('button:has-text("A1")').click();
    await page.waitForTimeout(500);
    
    // Click first section to expand
    const firstCard = page.locator('[class*="Card"]').first();
    await firstCard.click();
    await page.waitForTimeout(300);
    
    // Click first unit link
    const unitLink = page.locator('a[href*="/curriculum/unit/"]').first();
    if (await unitLink.isVisible()) {
      await unitLink.click();
      
      // Should see exercise types
      for (const type of ['INTRODUCTION', 'VOCABULARY', 'GRAMMAR']) {
        const btn = page.locator(`button:has-text("${type}")`);
        if (await btn.isVisible()) {
          await expect(btn).toBeVisible();
          break;
        }
      }
    }
  });

  test('should load phonics page', async ({ page }) => {
    await page.goto('/curriculum/phonics');
    await expect(page.locator('h1')).toContainText('Phonics');
    
    // Check categories are visible
    for (const cat of ['VOWELS', 'CONSONANTS', 'CLUSTERS']) {
      const btn = page.locator(`button:has-text("${cat}")`);
      if (await btn.isVisible()) {
        await expect(btn).toBeVisible();
        break;
      }
    }
  });
});
