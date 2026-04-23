import { test, expect } from '@playwright/test';

test('verify inbound receipt details and edit form expansion', async ({ page }) => {
  // Go to inbound page
  await page.goto('http://localhost:3000/inventory/inbound');

  // Wait for table to be visible
  await expect(page.locator('table')).toBeVisible();

  // 1. Check Detail Dialog
  // Click first receipt code to view details
  const firstReceipt = page.locator('tbody tr').first().locator('td').nth(1);
  await firstReceipt.click();

  const detailDialog = page.locator('[role="dialog"]');
  await expect(detailDialog).toBeVisible();
  await expect(detailDialog).toContainText(/Phiếu nhập:/);
  
  // Check wider dimension
  const detailBox = await detailDialog.boundingBox();
  expect(detailBox?.width).toBeGreaterThan(800); // 5xl is > 800px

  await detailDialog.locator('button', { hasText: 'Đóng' }).click();
  await expect(detailDialog).not.toBeVisible();

  // 2. Check Edit Form
  const editButton = page.locator('button', { hasText: 'Tạo phiếu nhập' });
  await editButton.click();

  const formDialog = page.locator('[role="dialog"]');
  await expect(formDialog).toBeVisible();
  
  // Check widest dimension
  const formBox = await formDialog.boundingBox();
  expect(formBox?.width).toBeGreaterThan(1200); // 7xl is > 1200px

  // Check table structure in form
  await expect(formDialog.locator('table thead')).toContainText(/Hạn sử dụng/);

  // Add an item and check auto-calculating total
  await formDialog.getByText('Thêm mặt hàng').click();
  
  const lastRow = formDialog.locator('table tbody tr').last();
  await lastRow.locator('input[type="number"]').first().fill('10'); // Quantity
  await lastRow.locator('input[type="number"]').last().fill('50000'); // CostPrice

  // Total should show 500.000 in header
  await expect(formDialog).toContainText(/500\.000/);
});
