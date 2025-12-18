import { test, expect } from '@playwright/test';

/**
 * E2E tests for Text Case Extension (text-case.extension.ts)
 * Tests text case transformation functionality
 * @medium - Utility feature
 */
test.describe('Text Case - Case Transformations @medium', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should convert text to uppercase', async ({ page }) => {
    // Type some text
    await page.locator('.tiptap-editor').type('hello world');
    await page.waitForTimeout(100);

    // Select all text
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(100);

    // Convert to uppercase
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.chain().focus().setTextCase('upper').run();
    });
    await page.waitForTimeout(100);

    // Verify text is uppercase
    const text = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getText();
    });
    expect(text).toBe('HELLO WORLD');
  });

  test('should convert text to lowercase', async ({ page }) => {
    // Type some text
    await page.locator('.tiptap-editor').type('HELLO WORLD');
    await page.waitForTimeout(100);

    // Select all text
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(100);

    // Convert to lowercase
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.chain().focus().setTextCase('lower').run();
    });
    await page.waitForTimeout(100);

    // Verify text is lowercase
    const text = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getText();
    });
    expect(text).toBe('hello world');
  });

  test('should convert text to title case', async ({ page }) => {
    // Type some text
    await page.locator('.tiptap-editor').type('hello world from tiptap');
    await page.waitForTimeout(100);

    // Select all text
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(100);

    // Convert to title case
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.chain().focus().setTextCase('title').run();
    });
    await page.waitForTimeout(100);

    // Verify text is title case
    const text = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getText();
    });
    expect(text).toBe('Hello World From Tiptap');
  });

  test('should toggle case', async ({ page }) => {
    // Type some text in lowercase
    await page.locator('.tiptap-editor').type('hello world');
    await page.waitForTimeout(100);

    // Select all text
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(100);

    // Toggle case (should convert to uppercase)
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.chain().focus().toggleTextCase().run();
    });
    await page.waitForTimeout(100);

    // Verify text is uppercase
    let text = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getText();
    });
    expect(text).toBe('HELLO WORLD');

    // Toggle again (should convert back to lowercase)
    await page.keyboard.press('Control+A');
    await page.waitForTimeout(100);

    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.chain().focus().toggleTextCase().run();
    });
    await page.waitForTimeout(100);

    // Verify text is lowercase
    text = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getText();
    });
    expect(text).toBe('hello world');
  });
});
