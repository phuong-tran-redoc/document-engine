import { expect, test } from '@playwright/test';
import { createEditorHelper } from '../../helpers/editor-helpers';
import { TEST_DATA } from '../../helpers/test-data';

/**
 * E2E tests for TableNodeView (block-handler.ts)
 * Tests the NodeView wrapper that provides handle and typearound functionality
 */
test.describe('Table NodeView E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  // ============================================================================
  // HANDLE & TYPEAROUND TESTS (HandleNodeView functionality)
  // ============================================================================

  test('should render table with handle wrapper', async ({ page }) => {
    const table = page.locator('table').first();
    await expect(table).toBeVisible();

    const handleWrapper = page.locator('.type-around');
    await expect(handleWrapper).toBeAttached();
  });

  test('should show typearound buttons on hover', async ({ page }) => {
    // Select .widget element that has direct table child
    const widget = page.locator('.widget').first();
    await expect(widget).toBeVisible();

    const handleWrapper = page.locator('[title="Insert paragraph before"]');

    // Hover over widget
    await widget.hover();

    // Wait a bit for hover effects
    await page.waitForTimeout(500);

    await expect(handleWrapper).toBeVisible();
  });

  // ============================================================================
  // COLGROUP RENDERING TESTS (TableNodeView.updateColgroup)
  // ============================================================================

  test('should render table with colgroup', async ({ page }) => {
    const table = page.locator('table').first();

    // Verify table has colgroup (rendered by TableNodeView.updateColgroup)
    const colgroup = table.locator('colgroup');
    await expect(colgroup).toBeVisible();

    // Verify col elements exist
    const cols = colgroup.locator('col');
    const colCount = await cols.count();
    expect(colCount).toBeGreaterThan(0);
  });

  test('should render col elements with width styles', async ({ page }) => {
    const table = page.locator('table').first();
    const colgroup = table.locator('colgroup');
    const cols = colgroup.locator('col');

    // Verify each col has width style (from colwidths attribute)
    const colCount = await cols.count();
    for (let i = 0; i < colCount; i++) {
      const col = cols.nth(i);
      const style = await col.getAttribute('style');

      // TableNodeView.updateColgroup sets width as percentage
      expect(style).toContain('width');
      expect(style).toMatch(/\d+(\.\d+)?%/); // Should be percentage
    }
  });

  test('should update colgroup when table structure changes', async ({ page }) => {
    const table = page.locator('table').first();

    // Get initial column count
    const initialCols = await table.locator('colgroup col').count();

    // Click on first cell to show bubble menu
    const firstCell = table.locator('td').first();
    await firstCell.click();

    // Wait for bubble menu to appear
    await expect(page.locator('document-engine-table-main-view')).toBeVisible();

    // Click on column dropdown icon
    const columnDropdown = page
      .locator('document-engine-select')
      .filter({ has: page.locator('document-engine-icon[name="table_column"]') });
    await columnDropdown.locator('button.document-engine-select__trigger').click();

    // Click "Insert column right" option
    const insertRightBtn = page.locator('button[role="option"]').filter({ hasText: 'Insert column right' });
    await insertRightBtn.click();

    await page.waitForTimeout(300);

    // Verify colgroup updated (TableNodeView.update should be called)
    const newCols = await table.locator('colgroup col').count();
    expect(newCols).toBe(initialCols + 1);
  });

  // ============================================================================
  // TABLE STRUCTURE TESTS (TableNodeView.createContentElement)
  // ============================================================================

  test('should render table with tbody as contentDOM', async ({ page }) => {
    const table = page.locator('table').first();

    // Verify table has tbody (created by TableNodeView.createContentElement)
    const tbody = table.locator('tbody');
    await expect(tbody).toBeVisible();

    // Verify tbody contains rows
    const rows = tbody.locator('tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should render cells as editable', async ({ page }) => {
    const table = page.locator('table').first();
    const firstCell = table.locator('td').first();

    // Verify cells are editable (contentDOM allows editing)
    await expect(firstCell).toBeEditable();

    // Click and type to verify editability
    await firstCell.click();
    await page.keyboard.type('Test');

    // Verify text was added
    await expect(firstCell).toContainText('Test');
  });

  // BUG
  test('should maintain table structure after content changes', async ({ page }) => {
    const editor = await createEditorHelper(page);
    const table = page.locator('table').first();

    // Modify cell content
    const firstCell = table.locator('td').first();
    await firstCell.click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('Modified content');

    await page.waitForTimeout(200);

    // Verify table structure is maintained
    await expect(table.locator('colgroup')).toBeVisible();
    await expect(table.locator('tbody')).toBeVisible();
    await expect(firstCell).toContainText('Modified content');
  });

  // ============================================================================
  // TABLE STYLES TESTS (TableNodeView.updateTableStyles)
  // ============================================================================

  test('should apply table border styles from attributes', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Set table with border attributes
    await editor.setContent(`
      <table style='border-color: blue; border-width: 2px; border-style: solid'>
        <colgroup><col style="width: 50%"><col style="width: 50%"></colgroup>
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
      </table>
    `);

    await page.waitForTimeout(300);

    const table = page.locator('table').first();

    // Verify border styles are applied (by TableNodeView.updateTableStyles)
    const borderStyle = await table.evaluate((el) => el.style.borderStyle);
    const borderColor = await table.evaluate((el) => el.style.borderColor);
    const borderWidth = await table.evaluate((el) => el.style.borderWidth);

    expect(borderStyle).toBe('solid');
    expect(borderColor).toContain('blue'); // Should contain blue color
    expect(borderWidth).toBe('2px');
  });

  test('should apply table background color from attributes', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Set table with backgroundColor attribute
    await editor.setContent(`
      <table style='background-color: #f0f0f0'>
        <colgroup><col style="width: 50%"><col style="width: 50%"></colgroup>
        <tr><td>Cell 1</td><td>Cell 2</td></tr>
      </table>
    `);

    await page.waitForTimeout(300);

    const table = page.locator('table').first();

    // Verify background color is applied
    const bgColor = await table.evaluate((el) => el.style.backgroundColor);
    expect(bgColor).toContain('240'); // Should contain #f0f0f0 (rgb(240, 240, 240))
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

    expect(buttonBox).not.toBeNull();

    console.log('Button box: ', buttonBox);
    console.log('Table box: ', tableBox);

    // Button should be positioned near the table
    // Either above, below, or to the side
    const isNearTable =
      Math.abs(buttonBox!.x - tableBox!.x) < 200 || // Near horizontally
      Math.abs(buttonBox!.y - tableBox!.y) < 200; // Near vertically

    expect(isNearTable).toBe(true);
  });
});
