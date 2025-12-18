import { test, expect } from '@playwright/test';

/**
 * E2E tests for Table Main View (table-main-view.ts)
 * Tests the main bubble menu controls for table manipulation
 * @critical - Core table functionality
 */
test.describe('Table Main View - Column Actions @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should insert column left when selecting add-before option', async ({ page }) => {
    // Click on first cell to show bubble menu
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click column dropdown
    await page.locator('document-engine-select[data-testid="column-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Add Before" option
    await page.locator('document-engine-select-option[value="add-before"]').click();
    await page.waitForTimeout(200);

    // Verify new column was added (should have 3 columns now)
    const colCount = await page.locator('table colgroup col').count();
    expect(colCount).toBe(3);
  });

  test('should insert column right when selecting add-after option', async ({ page }) => {
    // Click on first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click column dropdown
    await page.locator('document-engine-select[data-testid="column-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Add After" option
    await page.locator('document-engine-select-option[value="add-after"]').click();
    await page.waitForTimeout(200);

    // Verify new column was added
    const colCount = await page.locator('table colgroup col').count();
    expect(colCount).toBe(3);
  });

  test('should delete column when selecting delete option', async ({ page }) => {
    // Click on first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click column dropdown
    await page.locator('document-engine-select[data-testid="column-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Delete" option
    await page.locator('document-engine-select-option[value="delete"]').click();
    await page.waitForTimeout(200);

    // Verify column was deleted (should have 1 column now)
    const colCount = await page.locator('table colgroup col').count();
    expect(colCount).toBe(1);
  });

  test('should select entire column when selecting select option', async ({ page }) => {
    // Click on first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click column dropdown
    await page.locator('document-engine-select[data-testid="column-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Select Column" option
    await page.locator('document-engine-select-option[value="select"]').click();
    await page.waitForTimeout(200);

    // Verify column is selected by checking selection state
    const selectedCells = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      const { selection } = editor.state;
      return selection.ranges.length;
    });

    expect(selectedCells).toBeGreaterThan(1); // Multiple cells selected in column
  });
});

test.describe('Table Main View - Row Actions @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should insert row above when selecting add-before option', async ({ page }) => {
    // Click on first cell to show bubble menu
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click row dropdown
    await page.locator('document-engine-select[data-testid="row-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Add Before" option
    await page.locator('document-engine-select-option[value="add-before"]').click();
    await page.waitForTimeout(200);

    // Verify new row was added (should have 3 rows now)
    const rowCount = await page.locator('table tbody tr').count();
    expect(rowCount).toBe(3);
  });

  test('should insert row below when selecting add-after option', async ({ page }) => {
    // Click on first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click row dropdown
    await page.locator('document-engine-select[data-testid="row-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Add After" option
    await page.locator('document-engine-select-option[value="add-after"]').click();
    await page.waitForTimeout(200);

    // Verify new row was added
    const rowCount = await page.locator('table tbody tr').count();
    expect(rowCount).toBe(3);
  });

  test('should delete row when selecting delete option', async ({ page }) => {
    // Click on first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click row dropdown
    await page.locator('document-engine-select[data-testid="row-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Delete" option
    await page.locator('document-engine-select-option[value="delete"]').click();
    await page.waitForTimeout(200);

    // Verify row was deleted (should have 1 row now)
    const rowCount = await page.locator('table tbody tr').count();
    expect(rowCount).toBe(1);
  });

  test('should select entire row when selecting select option', async ({ page }) => {
    // Click on first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click row dropdown
    await page.locator('document-engine-select[data-testid="row-actions"]').click();
    await page.waitForTimeout(100);

    // Select "Select Row" option
    await page.locator('document-engine-select-option[value="select"]').click();
    await page.waitForTimeout(200);

    // Verify row is selected by checking selection state
    const selectedCells = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      const { selection } = editor.state;
      return selection.ranges.length;
    });

    expect(selectedCells).toBeGreaterThan(1); // Multiple cells selected in row
  });
});

test.describe('Table Main View - Cell Actions @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should merge cells when multiple cells are selected', async ({ page }) => {
    // Click first cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Select multiple cells by shift+clicking
    await page
      .locator('table td')
      .nth(1)
      .click({ modifiers: ['Shift'] });
    await page.waitForTimeout(200);

    // Verify merge button is enabled
    const mergeButton = page.locator('document-engine-button[data-testid="merge-cells"]');
    await expect(mergeButton).not.toBeDisabled();

    // Click merge button
    await mergeButton.click();
    await page.waitForTimeout(200);

    // Verify cells were merged (check for colspan attribute)
    const mergedCell = await page.locator('table td[colspan]').count();
    expect(mergedCell).toBeGreaterThan(0);
  });

  test('should split cell when merged cell is selected', async ({ page }) => {
    // First merge some cells
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page
      .locator('table td')
      .nth(1)
      .click({ modifiers: ['Shift'] });
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="merge-cells"]').click();
    await page.waitForTimeout(200);

    // Click on merged cell
    await page.locator('table td[colspan]').click();
    await page.waitForTimeout(200);

    // Verify split button is enabled
    const splitButton = page.locator('document-engine-button[data-testid="split-cell"]');
    await expect(splitButton).not.toBeDisabled();

    // Click split button
    await splitButton.click();
    await page.waitForTimeout(200);

    // Verify cell was split (no more colspan)
    const mergedCells = await page.locator('table td[colspan]').count();
    expect(mergedCells).toBe(0);
  });

  test('should disable merge button when single cell is selected', async ({ page }) => {
    // Click single cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Verify merge button is disabled
    const mergeButton = page.locator('document-engine-button[data-testid="merge-cells"]');
    await expect(mergeButton).toBeDisabled();
  });

  test('should disable split button when non-merged cell is selected', async ({ page }) => {
    // Click single non-merged cell
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Verify split button is disabled
    const splitButton = page.locator('document-engine-button[data-testid="split-cell"]');
    await expect(splitButton).toBeDisabled();
  });
});

test.describe('Table Main View - Navigation @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should navigate to Table Properties view when clicking table properties button', async ({ page }) => {
    // Click on cell to show bubble menu
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click table properties button
    await page.locator('document-engine-button[data-testid="table-properties"]').click();
    await page.waitForTimeout(200);

    // Verify navigation to table style view
    const tableStyleView = page.locator('document-engine-table-style-view');
    await expect(tableStyleView).toBeVisible();
  });

  test('should navigate to Cell Properties view when clicking cell properties button', async ({ page }) => {
    // Click on cell to show bubble menu
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);

    // Click cell properties button
    await page.locator('document-engine-button[data-testid="cell-properties"]').click();
    await page.waitForTimeout(200);

    // Verify navigation to cell style view
    const cellStyleView = page.locator('document-engine-table-cell-style-view');
    await expect(cellStyleView).toBeVisible();
  });
});
