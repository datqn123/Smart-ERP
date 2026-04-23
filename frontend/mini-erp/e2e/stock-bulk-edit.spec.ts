import { test, expect } from '@playwright/test';

test.describe('Stock Bulk Edit Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Giả định ứng dụng đang chạy ở port 3000
    await page.goto('http://localhost:3000/inventory');
  });

  test('should allow selecting multiple items and editing them', async ({ page }) => {
    // 1. Chọn 2 sản phẩm đầu tiên bằng checkbox
    const checkboxes = page.locator('table tbody tr input[type="checkbox"]');
    await checkboxes.nth(0).check();
    await checkboxes.nth(1).check();

    // 2. Nhấn nút "Sửa" trên toolbar
    const editButton = page.getByRole('button', { name: /sửa/i });
    await expect(editButton).toBeVisible();
    await editButton.click();

    // 3. Kiểm tra Dialog xuất hiện
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(/sửa thông tin tồn kho hàng loạt/i);

    // 4. Sửa định mức của sản phẩm đầu tiên trong Dialog
    // Dùng placeholder hoặc label để định vị
    const minQtyInputs = dialog.locator('input[type="number"]').first();
    await minQtyInputs.fill('999');

    // 5. Lưu thay đổi
    const saveButton = dialog.getByRole('button', { name: /lưu thay đổi/i });
    await saveButton.click();

    // 6. Kiểm tra Dialog đã đóng
    await expect(dialog).not.toBeVisible();

    // 7. Kiểm tra giá trị mới hiển thị trên bảng chính (nếu có logic update mock/state)
    await expect(page.getByText('999')).toBeVisible();
  });
});
