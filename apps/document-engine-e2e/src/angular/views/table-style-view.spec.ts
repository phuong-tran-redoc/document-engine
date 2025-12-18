import { test, expect } from '@playwright/test';

/**
 * E2E tests for Table Style View (table-style-view.ts)
 * Tests table-wide styling options (border, background)
 * @high - Important table styling functionality
 */
test.describe('Table Style View - Border Styling @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to table style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="table-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should set table border width', async ({ page }) => {
    // Set border width
    await page.locator('document-engine-input[data-testid="border-width"]').fill('3');
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border width applied to table
    const borderWidth = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderWidth;
    });
    expect(borderWidth).toBe('3px');
  });

  test('should set table border style to solid', async ({ page }) => {
    // Select solid border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="solid"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderStyle;
    });
    expect(borderStyle).toContain('solid');
  });

  test('should set table border style to double', async ({ page }) => {
    // Select double border style (unique to table-level borders)
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="double"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderStyle;
    });
    expect(borderStyle).toContain('double');
  });

  test('should set table border style to dashed', async ({ page }) => {
    // Select dashed border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="dashed"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderStyle;
    });
    expect(borderStyle).toContain('dashed');
  });

  test('should set table border style to dotted', async ({ page }) => {
    // Select dotted border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="dotted"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderStyle;
    });
    expect(borderStyle).toContain('dotted');
  });

  test('should set table border style to none', async ({ page }) => {
    // Select none border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="none"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderStyle;
    });
    expect(borderStyle).toContain('none');
  });

  test('should set table border color using color picker', async ({ page }) => {
    // Click color picker
    await page.locator('document-engine-color-picker[data-testid="border-color"]').click();
    await page.waitForTimeout(100);

    // Select a color (e.g., green)
    await page.locator('document-engine-color-swatch[data-color="#00ff00"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border color applied
    const borderColor = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderColor;
    });
    expect(borderColor).toContain('rgb(0, 255, 0)');
  });

  test('should clear table border color', async ({ page }) => {
    // Click clear button
    await page.locator('document-engine-button[data-testid="clear-border-color"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border color cleared
    const table = await page.locator('table');
    const hasBorderColor = await table.evaluate((el) => {
      return el.style.borderColor !== '';
    });
    expect(hasBorderColor).toBe(false);
  });
});

test.describe('Table Style View - Background Styling @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to table style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="table-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should set table background color using color picker', async ({ page }) => {
    // Click color picker
    await page.locator('document-engine-color-picker[data-testid="background-color"]').click();
    await page.waitForTimeout(100);

    // Select a color (e.g., yellow)
    await page.locator('document-engine-color-swatch[data-color="#ffff00"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify background color applied
    const bgColor = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    expect(bgColor).toContain('rgb(255, 255, 0)');
  });

  test('should clear table background color', async ({ page }) => {
    // Click clear button
    await page.locator('document-engine-button[data-testid="clear-background-color"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify background color cleared
    const table = await page.locator('table');
    const hasBgColor = await table.evaluate((el) => {
      return el.style.backgroundColor !== '';
    });
    expect(hasBgColor).toBe(false);
  });
});

test.describe('Table Style View - Actions @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to table style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="table-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should save table styles when clicking Save button', async ({ page }) => {
    // Set border width
    await page.locator('document-engine-input[data-testid="border-width"]').fill('4');
    await page.waitForTimeout(100);

    // Click Save button
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify we're back to main view
    const mainView = page.locator('document-engine-table-main-view');
    await expect(mainView).toBeVisible();

    // Verify styles were applied
    const borderWidth = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderWidth;
    });
    expect(borderWidth).toBe('4px');
  });

  test('should cancel and return to main view when clicking Cancel button', async ({ page }) => {
    // Make some changes
    await page.locator('document-engine-input[data-testid="border-width"]').fill('6');
    await page.waitForTimeout(100);

    // Click Cancel button
    await page.locator('document-engine-button[data-testid="cancel"]').click();
    await page.waitForTimeout(200);

    // Verify we're back to main view
    const mainView = page.locator('document-engine-table-main-view');
    await expect(mainView).toBeVisible();

    // Verify changes were NOT applied
    const borderWidth = await page.locator('table').evaluate((el) => {
      return window.getComputedStyle(el).borderWidth;
    });
    expect(borderWidth).not.toBe('6px');
  });

  test('should apply multiple style changes together', async ({ page }) => {
    // Set border width
    await page.locator('document-engine-input[data-testid="border-width"]').fill('2');
    await page.waitForTimeout(100);

    // Set border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="double"]').click();
    await page.waitForTimeout(100);

    // Set background color
    await page.locator('document-engine-color-picker[data-testid="background-color"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-color-swatch[data-color="#ff00ff"]').click();
    await page.waitForTimeout(100);

    // Save all changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify all styles were applied
    const table = page.locator('table');

    const borderWidth = await table.evaluate((el) => window.getComputedStyle(el).borderWidth);
    expect(borderWidth).toBe('2px');

    const borderStyle = await table.evaluate((el) => window.getComputedStyle(el).borderStyle);
    expect(borderStyle).toContain('double');

    const bgColor = await table.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toContain('rgb(255, 0, 255)');
  });
});
