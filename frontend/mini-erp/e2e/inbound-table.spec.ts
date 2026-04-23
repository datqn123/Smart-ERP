import { test, expect } from '@playwright/test';

test.describe('Inbound Layout Refactor (Task025-027)', () => {
  test.beforeEach(async ({ page }) => {
    // Giả sử server đang chạy tại localhost:3000 (standard vite port)
    await page.goto('http://localhost:3000/inventory/inbound');
  });

  test('nên hiển thị giao diện dạng bảng thay vì card', async ({ page }) => {
    // Kiểm tra class table hoặc data-testid
    const table = page.locator('[data-testid="receipt-table"]');
    await expect(table).toBeVisible();

    // Header check
    await expect(page.getByText('Mã phiếu', { exact: false })).toBeVisible();
    await expect(page.getByText('Nhà cung cấp', { exact: false })).toBeVisible();
  });

  test('nên mở được Detail Panel khi click vào hàng', async ({ page }) => {
    const table = page.locator('[data-testid="receipt-table"]');
    const firstRow = table.locator('tbody tr').first();
    const receiptCode = await firstRow.locator('td').first().textContent();

    await firstRow.click();

    // Sheet check
    const sheet = page.locator('[role="dialog"]'); // Shadcn Sheet is a dialog
    await expect(sheet).toBeVisible();
    await expect(sheet).toContainText(receiptCode || '');
  });

  test('nên hiển thị đủ 10 dòng đầu tiên (PAGE_SIZE default)', async ({ page }) => {
    const rows = page.locator('[data-testid="receipt-table"] tbody tr');
    // Vì PAGE_SIZE trong InboundPage.tsx tôi đã đổi thành 20 cho table layout
    await expect(rows).toHaveCount(20);
  });

  test('infinite scroll nên hoạt động khi cuộn table', async ({ page }) => {
    const listContainer = page.locator('[data-testid="receipt-list-container"]');
    const rowsBefore = await page.locator('[data-testid="receipt-table"] tbody tr').count();
    
    // Cuộn xuống cuối container list
    await listContainer.evaluate(e => e.scrollTop = e.scrollHeight);
    
    // Chờ loading thêm (vì có setTimeout 300ms trong code)
    await page.waitForTimeout(1000);
    
    const rowsAfter = await page.locator('[data-testid="receipt-table"] tbody tr').count();
    expect(rowsAfter).toBeGreaterThan(rowsBefore);
  });
});
