import { test, expect } from '@playwright/test';

test('verify sticky header functionality', async ({ page }) => {
  await page.goto('http://localhost:3000/inventory/inbound');
  
  // Wait for table to load
  await page.waitForSelector('[data-testid="receipt-table"]');
  
  // Get initial position of the header
  const header = page.locator('thead');
  const initialBox = await header.boundingBox();
  expect(initialBox).not.toBeNull();
  
  // Scroll down
  const container = page.locator('[data-testid="receipt-list-container"]');
  await container.evaluate((el) => el.scrollTop = 500);
  
  // Wait for scroll to settle
  await page.waitForTimeout(500);
  
  // Check if header is still visible at the top of the container
  const containerBox = await container.boundingBox();
  const headerBox = await header.boundingBox();
  
  expect(containerBox).not.toBeNull();
  expect(headerBox).not.toBeNull();
  
  // The header top should stay close to the container top
  // Tolerance of 2px due to rendering differences
  if (containerBox && headerBox) {
    expect(Math.abs(headerBox.y - containerBox.y)).toBeLessThan(5);
  }
});
