import { test, expect } from '@playwright/test';

/**
 * E2E tests for Table Cell Style View (table-cell-style-view.ts)
 * Tests cell styling options (border, background, alignment)
 * @high - Important table cell styling functionality
 */
test.describe('Table Cell Style View - Border Styling @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to cell style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="cell-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should set border width', async ({ page }) => {
    // Set border width
    await page.locator('document-engine-input[data-testid="border-width"]').fill('2');
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border width applied
    const borderWidth = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderWidth;
      });
    expect(borderWidth).toBe('2px');
  });

  test('should set border style to solid', async ({ page }) => {
    // Select solid border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="solid"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderStyle;
      });
    expect(borderStyle).toContain('solid');
  });

  test('should set border style to dashed', async ({ page }) => {
    // Select dashed border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="dashed"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderStyle;
      });
    expect(borderStyle).toContain('dashed');
  });

  test('should set border style to dotted', async ({ page }) => {
    // Select dotted border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="dotted"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderStyle;
      });
    expect(borderStyle).toContain('dotted');
  });

  test('should set border style to none', async ({ page }) => {
    // Select none border style
    await page.locator('document-engine-select[data-testid="border-style"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-select-option[value="none"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border style applied
    const borderStyle = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderStyle;
      });
    expect(borderStyle).toContain('none');
  });

  test('should set border color using color picker', async ({ page }) => {
    // Click color picker
    await page.locator('document-engine-color-picker[data-testid="border-color"]').click();
    await page.waitForTimeout(100);

    // Select a color (e.g., red)
    await page.locator('document-engine-color-swatch[data-color="#ff0000"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border color applied
    const borderColor = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderColor;
      });
    expect(borderColor).toContain('rgb(255, 0, 0)');
  });

  test('should clear border color', async ({ page }) => {
    // Click clear button
    await page.locator('document-engine-button[data-testid="clear-border-color"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify border color cleared
    const cell = await page.locator('table td').first();
    const hasBorderColor = await cell.evaluate((el) => {
      return el.style.borderColor !== '';
    });
    expect(hasBorderColor).toBe(false);
  });
});

test.describe('Table Cell Style View - Background Styling @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to cell style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="cell-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should set background color using color picker', async ({ page }) => {
    // Click color picker
    await page.locator('document-engine-color-picker[data-testid="background-color"]').click();
    await page.waitForTimeout(100);

    // Select a color (e.g., blue)
    await page.locator('document-engine-color-swatch[data-color="#0000ff"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify background color applied
    const bgColor = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).backgroundColor;
      });
    expect(bgColor).toContain('rgb(0, 0, 255)');
  });

  test('should clear background color', async ({ page }) => {
    // Click clear button
    await page.locator('document-engine-button[data-testid="clear-background-color"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify background color cleared
    const cell = await page.locator('table td').first();
    const hasBgColor = await cell.evaluate((el) => {
      return el.style.backgroundColor !== '';
    });
    expect(hasBgColor).toBe(false);
  });
});

test.describe('Table Cell Style View - Text Alignment @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to cell style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="cell-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should set text alignment to left', async ({ page }) => {
    // Click left alignment button
    await page.locator('document-engine-toggle-button[value="left"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify text alignment applied
    const textAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });
    expect(textAlign).toBe('left');
  });

  test('should set text alignment to center', async ({ page }) => {
    // Click center alignment button
    await page.locator('document-engine-toggle-button[value="center"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify text alignment applied
    const textAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });
    expect(textAlign).toBe('center');
  });

  test('should set text alignment to right', async ({ page }) => {
    // Click right alignment button
    await page.locator('document-engine-toggle-button[value="right"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify text alignment applied
    const textAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });
    expect(textAlign).toBe('right');
  });

  test('should set text alignment to justify', async ({ page }) => {
    // Click justify alignment button
    await page.locator('document-engine-toggle-button[value="justify"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify text alignment applied
    const textAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });
    expect(textAlign).toBe('justify');
  });
});

test.describe('Table Cell Style View - Vertical Alignment @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to cell style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="cell-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should set vertical alignment to top', async ({ page }) => {
    // Click top alignment button
    await page.locator('document-engine-toggle-button[value="top"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify vertical alignment applied
    const verticalAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).verticalAlign;
      });
    expect(verticalAlign).toBe('top');
  });

  test('should set vertical alignment to middle', async ({ page }) => {
    // Click middle alignment button
    await page.locator('document-engine-toggle-button[value="middle"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify vertical alignment applied
    const verticalAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).verticalAlign;
      });
    expect(verticalAlign).toBe('middle');
  });

  test('should set vertical alignment to bottom', async ({ page }) => {
    // Click bottom alignment button
    await page.locator('document-engine-toggle-button[value="bottom"]').click();
    await page.waitForTimeout(100);

    // Save changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify vertical alignment applied
    const verticalAlign = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).verticalAlign;
      });
    expect(verticalAlign).toBe('bottom');
  });
});

test.describe('Table Cell Style View - Actions @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/table');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });

    // Navigate to cell style view
    await page.locator('table td').first().click();
    await page.waitForTimeout(200);
    await page.locator('document-engine-button[data-testid="cell-properties"]').click();
    await page.waitForTimeout(200);
  });

  test('should save cell styles when clicking Save button', async ({ page }) => {
    // Set border width
    await page.locator('document-engine-input[data-testid="border-width"]').fill('3');
    await page.waitForTimeout(100);

    // Click Save button
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify we're back to main view
    const mainView = page.locator('document-engine-table-main-view');
    await expect(mainView).toBeVisible();

    // Verify styles were applied
    const borderWidth = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderWidth;
      });
    expect(borderWidth).toBe('3px');
  });

  test('should cancel and return to main view when clicking Cancel button', async ({ page }) => {
    // Make some changes
    await page.locator('document-engine-input[data-testid="border-width"]').fill('5');
    await page.waitForTimeout(100);

    // Click Cancel button
    await page.locator('document-engine-button[data-testid="cancel"]').click();
    await page.waitForTimeout(200);

    // Verify we're back to main view
    const mainView = page.locator('document-engine-table-main-view');
    await expect(mainView).toBeVisible();

    // Verify changes were NOT applied
    const borderWidth = await page
      .locator('table td')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).borderWidth;
      });
    expect(borderWidth).not.toBe('5px');
  });

  test('should apply multiple style changes together', async ({ page }) => {
    // Set border width
    await page.locator('document-engine-input[data-testid="border-width"]').fill('2');
    await page.waitForTimeout(100);

    // Set background color
    await page.locator('document-engine-color-picker[data-testid="background-color"]').click();
    await page.waitForTimeout(100);
    await page.locator('document-engine-color-swatch[data-color="#ffff00"]').click();
    await page.waitForTimeout(100);

    // Set text alignment
    await page.locator('document-engine-toggle-button[value="center"]').click();
    await page.waitForTimeout(100);

    // Save all changes
    await page.locator('document-engine-button[data-testid="save"]').click();
    await page.waitForTimeout(200);

    // Verify all styles were applied
    const cell = page.locator('table td').first();

    const borderWidth = await cell.evaluate((el) => window.getComputedStyle(el).borderWidth);
    expect(borderWidth).toBe('2px');

    const bgColor = await cell.evaluate((el) => window.getComputedStyle(el).backgroundColor);
    expect(bgColor).toContain('rgb(255, 255, 0)');

    const textAlign = await cell.evaluate((el) => window.getComputedStyle(el).textAlign);
    expect(textAlign).toBe('center');
  });
});
