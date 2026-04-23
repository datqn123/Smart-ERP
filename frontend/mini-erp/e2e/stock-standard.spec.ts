import { test, expect } from '@playwright/test';

test.describe('Standardized Stock Table UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/inventory/stock');
  });

  test('should have a standalone header and flex-col layout', async ({ page }) => {
    // Check main container layout
    const mainContainer = page.locator('.h-full.flex.flex-col');
    await expect(mainContainer).toBeVisible();

    // Check Table Wrapper
    const tableWrapper = page.locator('.flex-1.flex.flex-col.min-h-0.bg-white.border.rounded-xl.shadow-md');
    await expect(tableWrapper).toBeVisible();

    // Check Standalone Header
    const header = page.locator('.bg-slate-50.border-b');
    await expect(header).toBeVisible();

    // Check font-mono for SKU code
    const skuCode = page.locator('td.font-mono').first();
    await expect(skuCode).toBeVisible();
    const fontFamily = await skuCode.evaluate(el => window.getComputedStyle(el).fontFamily);
    expect(fontFamily).toContain('mono');
  });

  test('should support scrolling without moving the header', async ({ page }) => {
    // Scroll the body
    const bodyScrollContainer = page.locator('.flex-1.overflow-y-auto');
    await bodyScrollContainer.evaluate(e => e.scrollTop = 500);

    // Header should still be visible
    const header = page.locator('.bg-slate-50.border-b');
    await expect(header).toBeVisible();
  });
});
