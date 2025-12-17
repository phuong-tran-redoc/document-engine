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

  /**
   * Helper function to setup page break scenario:
   * - Create 2 paragraphs
   * - Position cursor between them
   * - Insert page break via toolbar
   * - Add 3rd paragraph after page break
   */
  async function setupPageBreakScenario(page: any, editor: any) {
    // Insert page break via toolbar button
    const pageBreakButton = page.locator('button[title="Insert page break"]');
    await pageBreakButton.click();

    return page.locator('[data-page-break="true"]');
  }

  test('should be selectable', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Setup scenario
    const pageBreak = await setupPageBreakScenario(page, editor);

    // Verify page break exists
    await expect(pageBreak).toBeVisible();

    // Click on page break to select it
    await pageBreak.click();

    // Verify it's selected
    const isSelected = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.isActive('pageBreak');
    });

    expect(isSelected).toBe(true);
  });

  test('should delete on backspace', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Setup scenario
    const pageBreak = await setupPageBreakScenario(page, editor);

    // Verify page break exists
    await expect(pageBreak).toBeVisible();
    let pageBreakCount = await page.locator('[data-page-break="true"]').count();
    expect(pageBreakCount).toBe(1);

    // Select page break by clicking
    await pageBreak.click();

    // Press backspace to delete
    await page.keyboard.press('Backspace');

    // Wait for deletion to complete
    await expect(pageBreak).toBeHidden();

    // Verify page break is deleted
    pageBreakCount = await page.locator('[data-page-break="true"]').count();
    expect(pageBreakCount).toBe(0);
  });
});
