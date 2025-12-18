import { test, expect } from '@playwright/test';

test.describe('@ci Editor Basic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to test bench
    await page.goto('/test-bench');

    // Wait for editor to be ready
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should initialize editor and expose to window', async ({ page }) => {
    // Verify editor instance exists
    const editorExists = await page.evaluate(() => {
      return typeof (window as any).__EDITOR__ !== 'undefined';
    });
    expect(editorExists).toBe(true);

    // Verify it's an Editor instance with expected methods
    const hasCommands = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor && typeof editor.commands === 'object';
    });
    expect(hasCommands).toBe(true);
  });

  test('should insert text via commands', async ({ page }) => {
    // Insert text using editor commands
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.setContent('<p>Hello Playwright</p>');
    });

    // Verify text was inserted
    const html = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getHTML();
    });
    expect(html).toContain('Hello Playwright');
  });

  test('should apply bold formatting', async ({ page }) => {
    // Set initial content
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.setContent('<p>Test text</p>');
    });

    // Select all and apply bold
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.selectAll();
      editor.commands.toggleBold();
    });

    // Verify bold was applied
    const html = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getHTML();
    });
    expect(html).toContain('<strong>Test text</strong>');
  });

  test('should apply italic formatting', async ({ page }) => {
    // Set initial content
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.setContent('<p>Italic test</p>');
    });

    // Select all and apply italic
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.selectAll();
      editor.commands.toggleItalic();
    });

    // Verify italic was applied
    const html = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getHTML();
    });
    expect(html).toContain('<em>Italic test</em>');
  });

  test('should handle multiple formatting operations', async ({ page }) => {
    // Set content and apply multiple formats
    await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      editor.commands.setContent('<p>Multi format test</p>');
      editor.commands.selectAll();
      editor.commands.toggleBold();
      editor.commands.toggleItalic();
      editor.commands.toggleUnderline();
    });

    // Verify all formats applied
    const html = await page.evaluate(() => {
      const editor = (window as any).__EDITOR__;
      return editor.getHTML();
    });
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<u>');
  });

  test('should verify test bench marker', async ({ page }) => {
    // Verify the test bench body marker is present
    const hasMarker = await page.evaluate(() => {
      return document.body.getAttribute('data-test-bench') === 'true';
    });
    expect(hasMarker).toBe(true);
  });
});
