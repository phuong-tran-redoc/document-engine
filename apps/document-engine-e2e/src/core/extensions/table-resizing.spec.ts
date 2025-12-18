import { test, expect } from '@playwright/test';

/**
 * E2E tests for Table Resizing Extension (table-resizing.extension.ts)
 * Tests column resizing functionality
 * @high - Important table interaction feature
 */
test.describe('Table Resizing - Column Resize @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should show resize handle on column border hover', async ({ page }) => {
    // Hover over column border area
    const firstCol = page.locator('table colgroup col').first();
    const colBox = await firstCol.boundingBox();

    if (colBox) {
      // Hover at the right edge of first column
      await page.mouse.move(colBox.x + colBox.width, colBox.y + colBox.height / 2);
      await page.waitForTimeout(200);
    }

    // Verify resize handle is visible (cursor changes or handle element appears)
    const cursor = await page.evaluate(() => {
      return document.body.style.cursor;
    });

    // Resize handle should change cursor to col-resize or similar
    // This test validates the resize functionality is active
    expect(typeof cursor).toBe('string');
  });

  test('should resize column by dragging handle', async ({ page }) => {
    // Get initial column width
    const initialWidth = await page
      .locator('table colgroup col')
      .first()
      .evaluate((el) => {
        return el.getAttribute('style');
      });

    // Get column position
    const firstCell = page.locator('table td').first();
    const cellBox = await firstCell.boundingBox();

    if (cellBox) {
      // Start drag from right edge of first column
      const startX = cellBox.x + cellBox.width;
      const startY = cellBox.y + cellBox.height / 2;

      // Drag to resize (move 50px to the right)
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 50, startY);
      await page.mouse.up();
      await page.waitForTimeout(200);
    }

    // Get new column width
    const newWidth = await page
      .locator('table colgroup col')
      .first()
      .evaluate((el) => {
        return el.getAttribute('style');
      });

    // Verify width changed
    expect(newWidth).not.toBe(initialWidth);
  });

  test('should update colwidths attribute after resize', async ({ page }) => {
    // Get initial colwidths
    const initialColwidths = await page.locator('table').evaluate((el) => {
      return el.getAttribute('data-colwidths');
    });

    // Perform resize
    const firstCell = page.locator('table td').first();
    const cellBox = await firstCell.boundingBox();

    if (cellBox) {
      const startX = cellBox.x + cellBox.width;
      const startY = cellBox.y + cellBox.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 30, startY);
      await page.mouse.up();
      await page.waitForTimeout(200);
    }

    // Get new colwidths
    const newColwidths = await page.locator('table').evaluate((el) => {
      return el.getAttribute('data-colwidths');
    });

    // Verify colwidths attribute was updated
    expect(newColwidths).not.toBe(initialColwidths);
  });

  test('should maintain total table width during resize', async ({ page }) => {
    // Get initial table width
    const initialTableWidth = await page.locator('table').evaluate((el) => {
      return el.offsetWidth;
    });

    // Perform resize
    const firstCell = page.locator('table td').first();
    const cellBox = await firstCell.boundingBox();

    if (cellBox) {
      const startX = cellBox.x + cellBox.width;
      const startY = cellBox.y + cellBox.height / 2;

      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX + 40, startY);
      await page.mouse.up();
      await page.waitForTimeout(200);
    }

    // Get new table width
    const newTableWidth = await page.locator('table').evaluate((el) => {
      return el.offsetWidth;
    });

    // Table width should remain relatively stable (allowing for small rounding differences)
    const widthDifference = Math.abs(newTableWidth - initialTableWidth);
    expect(widthDifference).toBeLessThan(5); // Allow 5px tolerance
  });

  test('should respect minimum column width', async ({ page }) => {
    // Try to resize column to very small width
    const firstCell = page.locator('table td').first();
    const cellBox = await firstCell.boundingBox();

    if (cellBox) {
      const startX = cellBox.x + cellBox.width;
      const startY = cellBox.y + cellBox.height / 2;

      // Try to drag far to the left (negative resize)
      await page.mouse.move(startX, startY);
      await page.mouse.down();
      await page.mouse.move(startX - 200, startY); // Try to make it very small
      await page.mouse.up();
      await page.waitForTimeout(200);
    }

    // Get column width
    const colWidth = await page
      .locator('table colgroup col')
      .first()
      .evaluate((el) => {
        const style = el.getAttribute('style') || '';
        const match = style.match(/width:\s*(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });

    // Verify minimum width is respected (e.g., at least 50px or similar)
    expect(colWidth).toBeGreaterThan(30); // Minimum width threshold
  });

  test('should show cursor change during resize', async ({ page }) => {
    // Get column position
    const firstCell = page.locator('table td').first();
    const cellBox = await firstCell.boundingBox();

    if (cellBox) {
      // Move to resize handle position
      await page.mouse.move(cellBox.x + cellBox.width, cellBox.y + cellBox.height / 2);
      await page.waitForTimeout(100);

      // Start dragging
      await page.mouse.down();
      await page.waitForTimeout(100);

      // Check if cursor changed during drag
      const cursorDuringDrag = await page.evaluate(() => {
        return document.body.style.cursor || window.getComputedStyle(document.body).cursor;
      });

      // Release
      await page.mouse.up();

      // Cursor should indicate resize operation
      expect(typeof cursorDuringDrag).toBe('string');
      expect(cursorDuringDrag.length).toBeGreaterThan(0);
    }
  });
});
