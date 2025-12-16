import { test, expect } from '@playwright/test';
import { createEditorHelper } from '../../helpers/editor-helpers';
import { TEST_DATA } from '../../helpers/test-data';

test.describe('Table NodeView E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should show hover icons when mouse enters table', async ({ page }) => {
    // Table is pre-loaded in test bench
    const table = page.locator('table').first();

    // Hover over table
    await table.hover();

    // Verify icons appear (using CSS selectors since data-testid not added yet)
    const addRowButton = page
      .locator('button')
      .filter({ hasText: /add.*row/i })
      .first();
    await expect(addRowButton).toBeVisible({ timeout: 2000 });
  });

  test('should add row before when clicking add row before button', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('table tr').count();

    // Hover over first row
    await page.locator('table tr').first().hover();
    await page.waitForTimeout(300);

    // Click add row before button (using text content for now)
    const addRowBeforeBtn = page
      .locator('button')
      .filter({ hasText: /before/i })
      .first();
    await addRowBeforeBtn.click();

    // Verify row count increased
    const newRows = await page.locator('table tr').count();
    expect(newRows).toBe(initialRows + 1);
  });

  test('should add row after when clicking add row after button', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('table tr').count();

    // Hover over first row
    await page.locator('table tr').first().hover();
    await page.waitForTimeout(300);

    // Click add row after button
    const addRowAfterBtn = page.locator('button').filter({ hasText: /after/i }).first();
    await addRowAfterBtn.click();

    // Verify row count increased
    const newRows = await page.locator('table tr').count();
    expect(newRows).toBe(initialRows + 1);
  });

  test('should delete row when clicking delete row button', async ({ page }) => {
    // Get initial row count
    const initialRows = await page.locator('table tr').count();

    // Hover over first row
    await page.locator('table tr').first().hover();
    await page.waitForTimeout(300);

    // Click delete row button
    const deleteRowBtn = page
      .locator('button')
      .filter({ hasText: /delete.*row/i })
      .first();
    await deleteRowBtn.click();

    // Verify row count decreased
    const newRows = await page.locator('table tr').count();
    expect(newRows).toBe(initialRows - 1);
  });

  test('should add column before when clicking add column before button', async ({ page }) => {
    // Get initial column count
    const initialCols = await page.locator('table tr').first().locator('td, th').count();

    // Hover over first cell
    await page.locator('table td').first().hover();
    await page.waitForTimeout(300);

    // Click add column before button
    const addColBeforeBtn = page
      .locator('button')
      .filter({ hasText: /column.*before/i })
      .first();
    await addColBeforeBtn.click();

    // Verify column count increased
    const newCols = await page.locator('table tr').first().locator('td, th').count();
    expect(newCols).toBe(initialCols + 1);
  });

  test('should add column after when clicking add column after button', async ({ page }) => {
    // Get initial column count
    const initialCols = await page.locator('table tr').first().locator('td, th').count();

    // Hover over first cell
    await page.locator('table td').first().hover();
    await page.waitForTimeout(300);

    // Click add column after button
    const addColAfterBtn = page
      .locator('button')
      .filter({ hasText: /column.*after/i })
      .first();
    await addColAfterBtn.click();

    // Verify column count increased
    const newCols = await page.locator('table tr').first().locator('td, th').count();
    expect(newCols).toBe(initialCols + 1);
  });

  test('should delete column when clicking delete column button', async ({ page }) => {
    // Get initial column count
    const initialCols = await page.locator('table tr').first().locator('td, th').count();

    // Hover over first cell
    await page.locator('table td').first().hover();
    await page.waitForTimeout(300);

    // Click delete column button
    const deleteColBtn = page
      .locator('button')
      .filter({ hasText: /delete.*column/i })
      .first();
    await deleteColBtn.click();

    // Verify column count decreased
    const newCols = await page.locator('table tr').first().locator('td, th').count();
    expect(newCols).toBe(initialCols - 1);
  });

  test('should not show hover icons on nested table when hovering parent', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Set content with nested table
    await editor.setContent(TEST_DATA.tables.nested);
    await page.waitForTimeout(500);

    // Hover parent table (outer table)
    const outerTable = page.locator('table').first();
    await outerTable.hover();
    await page.waitForTimeout(500);

    // Get all visible buttons
    const visibleButtons = await page.locator('button:visible').count();

    // Inner table should not show its own icons
    // We expect only outer table icons to be visible
    // This is a basic check - exact count depends on implementation
    expect(visibleButtons).toBeGreaterThan(0); // Outer table has icons

    // Verify inner table doesn't have duplicate icons
    const innerTable = page.locator('table table');
    const innerTableBox = await innerTable.boundingBox();

    if (innerTableBox) {
      // Move mouse to inner table area
      await page.mouse.move(innerTableBox.x + 10, innerTableBox.y + 10);
      await page.waitForTimeout(300);

      // Icons should still be for outer table only
      const buttonsAfter = await page.locator('button:visible').count();
      expect(buttonsAfter).toBe(visibleButtons); // Same count, no new icons
    }
  });

  test('should hide icons when mouse leaves table', async ({ page }) => {
    const table = page.locator('table').first();

    // Hover to show icons
    await table.hover();
    await page.waitForTimeout(500);

    // Verify icons are visible
    const visibleButtons = await page.locator('button:visible').count();
    expect(visibleButtons).toBeGreaterThan(0);

    // Move mouse away from table
    await page.mouse.move(0, 0);
    await page.waitForTimeout(500);

    // Icons should be hidden
    const buttonsAfter = await page.locator('button:visible').count();
    expect(buttonsAfter).toBe(0);
  });

  test('should position icons correctly relative to table', async ({ page }) => {
    const table = page.locator('table').first();

    // Hover over table
    await table.hover();
    await page.waitForTimeout(500);

    // Get table bounding box
    const tableBox = await table.boundingBox();
    expect(tableBox).not.toBeNull();

    // Get first visible button (should be positioned near table)
    const firstButton = page.locator('button:visible').first();
    const buttonBox = await firstButton.boundingBox();

    if (tableBox && buttonBox) {
      // Button should be positioned near the table
      // Either above, below, or to the side
      const isNearTable =
        Math.abs(buttonBox.x - tableBox.x) < 200 || // Near horizontally
        Math.abs(buttonBox.y - tableBox.y) < 200; // Near vertically

      expect(isNearTable).toBe(true);
    }
  });
});
