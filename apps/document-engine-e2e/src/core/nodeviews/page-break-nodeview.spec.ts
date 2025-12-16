import { expect, test } from '@playwright/test';
import { createEditorHelper } from '../../helpers/editor-helpers';

test.describe('PageBreak NodeView E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should render with correct attributes', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Insert page break
    await page.evaluate(() => {
      (window as any).__EDITOR__.commands.insertPageBreak();
    });

    await page.waitForTimeout(300);

    // Verify page break element exists with correct attribute
    const pageBreak = page.locator('[data-page-break="true"]');
    await expect(pageBreak).toBeVisible();

    // Verify it has the correct class
    await expect(pageBreak).toHaveClass(/page-break/);
  });

  test('should be selectable', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Insert page break
    await page.evaluate(() => {
      (window as any).__EDITOR__.commands.insertPageBreak();
    });

    await page.waitForTimeout(300);

    // Click on page break to select it
    const pageBreak = page.locator('[data-page-break="true"]');
    await pageBreak.click();

    // Verify it's selected (implementation-specific, may need adjustment)
    // Check if editor has selection on page break node
    const isSelected = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.isActive('pageBreak');
    });

    expect(isSelected).toBe(true);
  });

  test('should delete on backspace', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Insert page break
    await page.evaluate(() => {
      (window as any).__EDITOR__.commands.insertPageBreak();
    });

    await page.waitForTimeout(300);

    // Verify page break exists
    let pageBreakCount = await page.locator('[data-page-break="true"]').count();
    expect(pageBreakCount).toBe(1);

    // Select page break
    const pageBreak = page.locator('[data-page-break="true"]');
    await pageBreak.click();

    // Press backspace
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(300);

    // Verify page break is deleted
    pageBreakCount = await page.locator('[data-page-break="true"]').count();
    expect(pageBreakCount).toBe(0);
  });
});
