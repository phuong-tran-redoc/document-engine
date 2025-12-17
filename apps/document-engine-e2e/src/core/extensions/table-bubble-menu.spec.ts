import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for Table Bubble Menu (table-style.extension.ts)
 * Tests the bubble menu UI that appears when clicking on table cells
 */
test.describe('Table Bubble Menu E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  /**
   * Helper: Click on table cell and wait for bubble menu to appear
   */
  async function openTableBubbleMenu(page: Page) {
    const firstCell = page.locator('table td').first();
    await firstCell.click();
    await expect(page.locator('document-engine-table-main-view')).toBeVisible();
  }

  /**
   * Helper: Open a specific dropdown in table bubble menu
   */
  async function openDropdown(page: Page, iconName: 'table_row' | 'table_column') {
    const dropdown = page
      .locator('document-engine-select')
      .filter({ has: page.locator(`document-engine-icon[name="${iconName}"]`) });
    await dropdown.locator('button.document-engine-select__trigger').click();
  }

  test('should render table bubble menu when clicking on table cell', async ({ page }) => {
    // Click on table cell
    await openTableBubbleMenu(page);

    // Verify bubble menu (from table-style extension) is rendered
    const bubbleMenu = page.locator('document-engine-table-main-view');
    await expect(bubbleMenu).toBeVisible({ timeout: 1000 });

    // Verify all control dropdowns are present
    const rowSelect = page
      .locator('document-engine-select')
      .filter({ has: page.locator('document-engine-icon[name="table_row"]') });
    await expect(rowSelect).toBeVisible();

    const columnSelect = page
      .locator('document-engine-select')
      .filter({ has: page.locator('document-engine-icon[name="table_column"]') });
    await expect(columnSelect).toBeVisible();

    const mergeSelect = page
      .locator('document-engine-select')
      .filter({ has: page.locator('document-engine-icon[name="table_merge_cell"]') });
    await expect(mergeSelect).toBeVisible();

    // Verify action buttons are present
    const tablePropertiesBtn = page.locator('button[title="Table Properties"]');
    await expect(tablePropertiesBtn).toBeVisible();

    const cellPropertiesBtn = page.locator('button[title="Cell Properties"]');
    await expect(cellPropertiesBtn).toBeVisible();
  });

  test('should show row dropdown options when clicking row control', async ({ page }) => {
    await openTableBubbleMenu(page);

    // Open row dropdown
    await openDropdown(page, 'table_row');

    // Verify all row options are visible
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Insert row above' })).toBeVisible();
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Insert row below' })).toBeVisible();
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Remove row' })).toBeVisible();
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Select row' })).toBeVisible();
  });

  test('should show column dropdown options when clicking column control', async ({ page }) => {
    await openTableBubbleMenu(page);

    // Open column dropdown
    await openDropdown(page, 'table_column');

    // Verify all column options are visible
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Insert column left' })).toBeVisible();
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Insert column right' })).toBeVisible();
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Remove column' })).toBeVisible();
    await expect(page.locator('button[role="option"]').filter({ hasText: 'Select column' })).toBeVisible();
  });

  test('should hide bubble menu when clicking outside table to paragraph', async ({ page }) => {
    // Add text to paragraph - click at left edge
    const paragraph = page.locator('p').last();
    const initialBox = await paragraph.boundingBox();
    expect(initialBox).not.toBeNull();
    await page.mouse.click(initialBox!.x + initialBox!.width * 0.1, initialBox!.y + 5);
    await page.keyboard.type('Test paragraph content');
    await page.waitForTimeout(200);

    // Click on a table cell (A)
    const cellA = page.locator('table td').first();
    await cellA.click();

    // Check bubble menu appears
    const bubbleMenu = page.locator('document-engine-table-main-view');
    await expect(bubbleMenu).toBeVisible();

    // Click on paragraph at left edge (10% of width from left)
    const paragraphBox = await paragraph.boundingBox();
    expect(paragraphBox).not.toBeNull();
    await page.mouse.click(
      paragraphBox!.x + paragraphBox!.width * 0.1, // 10% from left
      paragraphBox!.y + 5 // Near top edge
    );
    await page.waitForTimeout(200);

    // Check bubble menu disappears
    await expect(bubbleMenu).toBeHidden();
  });

  test('should show bubble menu again when returning to table after clicking paragraph', async ({ page }) => {
    // Add text to paragraph - click at left edge
    const paragraph = page.locator('p').last();
    const initialBox = await paragraph.boundingBox();
    expect(initialBox).not.toBeNull();
    await page.mouse.click(initialBox!.x + initialBox!.width * 0.1, initialBox!.y + 5);
    await page.keyboard.type('Test paragraph content');
    await page.waitForTimeout(200);

    // Click on a table cell (A)
    const cellA = page.locator('table td').first();
    await cellA.click();

    // Check bubble menu appears
    const bubbleMenu = page.locator('document-engine-table-main-view');
    await expect(bubbleMenu).toBeVisible();

    // Click on paragraph at left edge (10% of width from left)
    const paragraphBox = await paragraph.boundingBox();
    expect(paragraphBox).not.toBeNull();
    await page.mouse.click(
      paragraphBox!.x + paragraphBox!.width * 0.1, // 10% from left
      paragraphBox!.y + 5 // Near top edge
    );
    await page.waitForTimeout(200);

    // Check bubble menu disappears
    await expect(bubbleMenu).toBeHidden();

    // Click back on cell A
    await cellA.click();
    await page.waitForTimeout(200);

    // Check bubble menu appears again
    await expect(bubbleMenu).toBeVisible();
  });

  test('should maintain bubble menu when clicking between cells', async ({ page }) => {
    await openTableBubbleMenu(page);

    // Verify bubble menu is visible
    const bubbleMenu = page.locator('document-engine-table-main-view');
    await expect(bubbleMenu).toBeVisible();

    // Click on another cell
    const secondCell = page.locator('table td').nth(1);
    await secondCell.click();

    // Verify bubble menu is still visible
    await expect(bubbleMenu).toBeVisible();
  });
});
