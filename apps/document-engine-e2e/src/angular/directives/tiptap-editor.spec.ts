import { test, expect } from '@playwright/test';

/**
 * E2E tests for TiptapEditor Directive (editor.directive.ts)
 * Tests ngModel binding, disabled state, and value synchronization
 * @critical - Core directive functionality
 */
test.describe('TiptapEditor Directive - ngModel Binding @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/tiptap-editor');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should bind initial value from ngModel', async ({ page }) => {
    // Verify initial content is displayed in editor
    await expect(page.locator('.tiptap-editor p')).toHaveText('Initial content');

    // Verify model value is displayed
    const modelValue = await page.locator('[data-testid="model-value"]').textContent();
    expect(modelValue).toContain('Initial content');
  });

  test('should update model when editor content changes', async ({ page }) => {
    // Type in editor
    await page.locator('.tiptap-editor').click();
    await page.keyboard.type(' - Added text');

    // Wait for model to update
    await page.waitForTimeout(200);

    // Verify model value updated
    const modelValue = await page.locator('[data-testid="model-value"]').textContent();
    expect(modelValue).toContain('Initial content - Added text');
  });

  test('should update editor when model changes externally', async ({ page }) => {
    // Click button to change model externally
    await page.locator('[data-testid="btn-change-model"]').click();

    // Wait for editor to update
    await page.waitForTimeout(200);

    // Verify editor content updated
    await expect(page.locator('.tiptap-editor p')).toHaveText('Changed from Outside');

    // Verify model value updated
    const modelValue = await page.locator('[data-testid="model-value"]').textContent();
    expect(modelValue).toContain('Changed from Outside');
  });
});

test.describe('TiptapEditor Directive - Disabled State @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/tiptap-editor');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should disable editor when disabled is true', async ({ page }) => {
    // Click toggle disable button
    await page.locator('[data-testid="btn-disable"]').click();
    await page.waitForTimeout(200);

    // Try to type in editor
    await page.locator('.tiptap-editor').click();
    const initialContent = await page.locator('.tiptap-editor p').textContent();

    await page.keyboard.type(' - Should not appear');
    await page.waitForTimeout(200);

    // Verify content didn't change
    // const finalContent = await page.locator('.tiptap-editor p').textContent();
    // expect(finalContent).toBe(initialContent);
    // await expect(page.locator('.tiptap-editor p')).toHaveText(initialContent);
    await expect(page.locator('.tiptap-editor p')).toHaveValue(initialContent ?? '');
  });

  test('should re-enable editor when disabled is toggled back', async ({ page }) => {
    // Disable editor
    await page.locator('[data-testid="btn-disable"]').click();
    await page.waitForTimeout(200);

    // Re-enable editor
    await page.locator('[data-testid="btn-disable"]').click();
    await page.waitForTimeout(200);

    // Type in editor
    await page.locator('.tiptap-editor').click();
    await page.keyboard.type(' - Enabled again');
    await page.waitForTimeout(200);

    // Verify content changed
    const editorContent = await page.locator('.tiptap-editor p').textContent();
    expect(editorContent).toContain('Enabled again');
  });
});

test.describe('TiptapEditor Directive - Value Synchronization @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/tiptap-editor');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should maintain sync between editor and model', async ({ page }) => {
    // Change model externally
    await page.locator('[data-testid="btn-change-model"]').click();
    await page.waitForTimeout(200);

    // Verify editor updated
    const editorContentLocator = page.locator('.tiptap-editor p');
    await expect(editorContentLocator).toHaveText('Changed from Outside');

    // Type in editor
    await page.locator('.tiptap-editor').click();
    await page.keyboard.press('End');
    await page.keyboard.type(' - More text');
    await page.waitForTimeout(200);

    // Verify model updated
    const modelValue = await page.locator('[data-testid="model-value"]').textContent();
    expect(modelValue).toContain('Changed from Outside - More text');

    // Verify editor still has correct content
    await expect(editorContentLocator).toHaveText('Changed from Outside - More text');
  });
});
