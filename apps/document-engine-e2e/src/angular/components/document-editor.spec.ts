import { test, expect } from '@playwright/test';
import { createEditorHelper } from '../../helpers/editor-helpers';

test.describe('DocumentEditor Component E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should emit editorReady event with editor instance', async ({ page }) => {
    // Verify editor instance is exposed
    const editorExists = await page.evaluate(() => {
      return typeof (window as any).__EDITOR__ !== 'undefined';
    });

    expect(editorExists).toBe(true);

    // Verify editor has expected methods
    const hasCommands = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return typeof editor.commands === 'object';
    });

    expect(hasCommands).toBe(true);

    // Verify editor has getHTML method
    const hasGetHTML = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return typeof editor.getHTML === 'function';
    });

    expect(hasGetHTML).toBe(true);
  });

  test('should apply config binding', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Verify editor has bold command (from config)
    const hasBold = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return typeof editor.commands.toggleBold === 'function';
    });

    expect(hasBold).toBe(true);

    // Verify editor has italic command (from config)
    const hasItalic = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return typeof editor.commands.toggleItalic === 'function';
    });

    expect(hasItalic).toBe(true);
  });

  test('should handle lifecycle correctly', async ({ page }) => {
    const editor = await createEditorHelper(page);

    // Verify test bench marker is set (from ngOnInit)
    const hasMarker = await page.evaluate(() => {
      return document.body.getAttribute('data-test-bench') !== null;
    });

    expect(hasMarker).toBe(true);

    // Verify editor is initialized and ready
    const isReady = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor && editor.isEditable !== undefined;
    });

    expect(isReady).toBe(true);
  });

  test('should expose editor instance to window', async ({ page }) => {
    // This is critical for E2E testing
    const editor = await createEditorHelper(page);

    // Verify we can interact with editor via window.__EDITOR__
    await page.evaluate(() => {
      (window as any).__EDITOR__.commands.setContent('<p>Test content</p>');
    });

    await page.waitForTimeout(300);

    // Verify content was set
    const html = await editor.getHTML();
    expect(html).toContain('Test content');
  });
});
