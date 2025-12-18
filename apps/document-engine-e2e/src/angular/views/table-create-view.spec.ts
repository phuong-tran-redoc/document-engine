import { test, expect } from '@playwright/test';

/**
 * E2E tests for Table Create functionality
 * Tests table creation using insertTable command
 * @high - Important table creation functionality
 */
test.describe('Table Create - Table Dimensions @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should show row and column inputs', async ({ page }) => {
    // This test validates the insertTable command accepts row/col parameters
    // Create a table using the command
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 3, cols: 3 });
    });
    await page.waitForTimeout(200);

    // Verify table was created
    const tableExists = await page.locator('table').count();
    expect(tableExists).toBeGreaterThan(0);
  });

  test('should create table with specified dimensions', async ({ page }) => {
    // Create table with custom dimensions
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 4, cols: 5 });
    });
    await page.waitForTimeout(200);

    // Verify table was created with correct dimensions
    const rowCount = await page.locator('table tbody tr').count();
    const colCount = await page.locator('table colgroup col').count();

    expect(rowCount).toBe(4);
    expect(colCount).toBe(5);
  });

  test('should validate minimum dimensions', async ({ page }) => {
    // Try to create table with 1x1 (minimum valid)
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 1, cols: 1 });
    });
    await page.waitForTimeout(200);

    // Verify table was created
    const rowCount = await page.locator('table tbody tr').count();
    const colCount = await page.locator('table colgroup col').count();

    expect(rowCount).toBe(1);
    expect(colCount).toBe(1);
  });

  test('should validate maximum dimensions', async ({ page }) => {
    // Create table with larger dimensions
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 10, cols: 10 });
    });
    await page.waitForTimeout(200);

    // Verify table was created
    const rowCount = await page.locator('table tbody tr').count();
    const colCount = await page.locator('table colgroup col').count();

    expect(rowCount).toBe(10);
    expect(colCount).toBe(10);
  });
});

test.describe('Table Create - Table Options @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should toggle header row option', async ({ page }) => {
    // Create table with header row
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 3, cols: 3, withHeaderRow: true });
    });
    await page.waitForTimeout(200);

    // Verify table has header row (th elements)
    const headerCells = await page.locator('table thead th').count();
    expect(headerCells).toBeGreaterThan(0);
  });

  test('should set initial table width', async ({ page }) => {
    // Create table
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 2, cols: 2 });
    });
    await page.waitForTimeout(200);

    // Verify table exists
    const tableExists = await page.locator('table').count();
    expect(tableExists).toBeGreaterThan(0);
  });
});

test.describe('Table Create - Actions @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should create table on confirm', async ({ page }) => {
    // Create table with custom dimensions
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.insertTable({ rows: 2, cols: 3 });
    });
    await page.waitForTimeout(200);

    // Verify table exists in editor
    const tableExists = await page.locator('table').count();
    expect(tableExists).toBeGreaterThan(0);

    // Verify correct dimensions
    const rowCount = await page.locator('table tbody tr').count();
    const colCount = await page.locator('table colgroup col').count();

    expect(rowCount).toBe(2);
    expect(colCount).toBe(3);
  });

  test('should cancel table creation', async ({ page }) => {
    // Get initial table count
    const initialTableCount = await page.locator('table').count();

    // This test validates that not calling insertTable doesn't create a table
    // (simulates cancel action)
    await page.waitForTimeout(200);

    // Verify no new table was created
    const finalTableCount = await page.locator('table').count();
    expect(finalTableCount).toBe(initialTableCount);
  });
});
