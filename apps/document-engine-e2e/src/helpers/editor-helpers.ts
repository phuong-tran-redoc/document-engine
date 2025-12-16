import { Page } from '@playwright/test';

/**
 * Helper class for interacting with the document editor in E2E tests
 * Provides convenient methods to manipulate editor state via window.__EDITOR__
 */
export class EditorHelper {
  constructor(private page: Page) {}

  /**
   * Wait for editor to be ready and available on window
   */
  async waitForEditor(): Promise<void> {
    await this.page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  }

  /**
   * Get the editor instance (for type checking in tests)
   */
  async getEditor(): Promise<any> {
    await this.waitForEditor();
    return this.page.evaluate(() => (window as any).__EDITOR__);
  }

  /**
   * Set HTML content in the editor
   */
  async setContent(html: string): Promise<void> {
    await this.page.evaluate((content) => {
      (window as any).__EDITOR__.commands.setContent(content);
    }, html);
  }

  /**
   * Get current HTML content from editor
   */
  async getHTML(): Promise<string> {
    return this.page.evaluate(() => (window as any).__EDITOR__.getHTML());
  }

  /**
   * Get current JSON content from editor
   */
  async getJSON(): Promise<any> {
    return this.page.evaluate(() => (window as any).__EDITOR__.getJSON());
  }

  /**
   * Get plain text content from editor
   */
  async getText(): Promise<string> {
    return this.page.evaluate(() => (window as any).__EDITOR__.getText());
  }

  /**
   * Select all content in editor
   */
  async selectAll(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__EDITOR__.commands.selectAll();
    });
  }

  /**
   * Clear all content from editor
   */
  async clear(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__EDITOR__.commands.clearContent();
    });
  }

  /**
   * Insert a table with specified dimensions
   */
  async insertTable(rows: number, cols: number): Promise<void> {
    await this.page.evaluate(
      ({ r, c }) => {
        (window as any).__EDITOR__.commands.insertTable({ rows: r, cols: c });
      },
      { r: rows, c: cols }
    );
  }

  /**
   * Toggle bold formatting
   */
  async toggleBold(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__EDITOR__.commands.toggleBold();
    });
  }

  /**
   * Toggle italic formatting
   */
  async toggleItalic(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__EDITOR__.commands.toggleItalic();
    });
  }

  /**
   * Toggle underline formatting
   */
  async toggleUnderline(): Promise<void> {
    await this.page.evaluate(() => {
      (window as any).__EDITOR__.commands.toggleUnderline();
    });
  }

  /**
   * Set heading level
   */
  async setHeading(level: 1 | 2 | 3 | 4 | 5 | 6): Promise<void> {
    await this.page.evaluate((lvl) => {
      (window as any).__EDITOR__.commands.setHeading({ level: lvl });
    }, level);
  }

  /**
   * Check if a mark/node is active
   */
  async isActive(name: string, attributes?: Record<string, any>): Promise<boolean> {
    return this.page.evaluate(
      ({ n, attrs }) => {
        return (window as any).__EDITOR__.isActive(n, attrs);
      },
      { n: name, attrs: attributes }
    );
  }

  /**
   * Execute a custom editor command
   */
  async executeCommand(commandFn: (editor: any) => void): Promise<void> {
    await this.page.evaluate((fnString) => {
      const editor = (window as any).__EDITOR__;
      const fn = new Function('editor', fnString);
      fn(editor);
    }, commandFn.toString());
  }
}

/**
 * Factory function to create EditorHelper instance
 */
export async function createEditorHelper(page: Page): Promise<EditorHelper> {
  const helper = new EditorHelper(page);
  await helper.waitForEditor();
  return helper;
}
