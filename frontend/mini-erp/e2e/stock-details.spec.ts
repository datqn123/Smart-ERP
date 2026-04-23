import { test, expect } from '@playwright/test';

test('verify stock details view expansion and financial info', async ({ page }) => {
  // Go to inventory page
  await page.goto('http://localhost:3000/inventory/stock');

  // Wait for table to be visible
  await expect(page.locator('table')).toBeVisible();

  // Find the row for SKU "SP001"
  const row = page.locator('tr').filter({ hasText: 'SP001' });
  await expect(row).toBeVisible();
  
  // Find the view button by title or eye icon
  const viewButton = row.locator('button').filter({ has: page.locator('svg') }).last();
  
  // Click the button
  await viewButton.click();

  // Confirm dialog is open
  const dialog = page.locator('[role="dialog"]');
  await expect(dialog).toBeVisible({ timeout: 10000 });

  // Check Title
  await expect(dialog.locator('h2')).toContainText('Sữa Ông Thọ');

  // Check Financial Info
  await expect(dialog).toContainText(/Giá trị tồn kho/i);
  await expect(dialog).toContainText(/3\.750\.000/);

  // Check Status Badge (it has success variant which is success)
  await expect(dialog.locator('.inline-flex', { hasText: 'An toàn' })).toBeVisible();

  // Check Batches Table
  const rows = dialog.locator('table tbody tr');
  await expect(rows).toHaveCount(2); 
});
