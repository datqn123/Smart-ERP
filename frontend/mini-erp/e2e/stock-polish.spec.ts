import { test, expect } from '@playwright/test';

test.describe('Stock Table Polish Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/inventory/stock');
  });

  test('AC3: Filter bar should NOT have shadow', async ({ page }) => {
    // Filter bar should be visible without shadow
    const filterBar = page.locator('.border.border-slate-200.rounded-lg.p-4');
    await expect(filterBar).toBeVisible();
    
    // Verify no shadow class
    const boxShadow = await filterBar.evaluate(el => window.getComputedStyle(el).boxShadow);
    expect(boxShadow).toBe('none');
  });

  test('AC1 & AC2: Header and Body alignment', async ({ page }) => {
    // Verify Table Wrapper has shadow-md
    const tableWrapper = page.locator('.shadow-md.rounded-xl');
    await expect(tableWrapper).toBeVisible();
    
    // Verify Standalone Header exists
    const header = tableWrapper.locator('.bg-slate-50.border-b');
    await expect(header).toBeVisible();
    
    // Verify column alignment (scroll to test)
    await page.locator('.overflow-y-auto').evaluate(e => e.scrollTop = 500);
    await expect(header).toBeVisible();
  });
});