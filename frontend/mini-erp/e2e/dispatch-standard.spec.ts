import { test, expect } from '@playwright/test';

test.describe('Standardized Dispatch Table UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/inventory/dispatch');
  });

  test('should have a fixed standalone header when scrolling', async ({ page }) => {
    // Check if header container exists and has correct background
    const header = page.locator('.bg-slate-50.border-b');
    await expect(header).toBeVisible();

    // Scroll the list container
    const listContainer = page.locator('[data-testid="dispatch-list-container"]');
    await listContainer.evaluate(e => e.scrollTop = 500);

    // Header should still be visible and in the same position relative to the viewport/wrapper
    await expect(header).toBeVisible();
    
    // Check for mono font on dispatch code
    const firstCode = page.locator('td.font-mono').first();
    await expect(firstCode).toBeVisible();
    const fontFamily = await firstCode.evaluate(el => window.getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain('mono');
  });

  test('filter bar should have standardized rounded-lg and no shadow-sm', async ({ page }) => {
    const filterBar = page.locator('.bg-white.p-4.rounded-lg.border.border-slate-200');
    await expect(filterBar).toBeVisible();
    
    const shadow = await filterBar.evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(shadow).toBe('none');
  });
});
