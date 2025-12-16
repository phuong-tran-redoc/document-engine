import { expect, Page } from '@playwright/test';

/**
 * Custom assertion helpers for E2E tests
 * Provides reusable assertions for common test scenarios
 */

/**
 * Assert that HTML content contains specific text
 */
export async function expectHtmlToContain(page: Page, text: string) {
  const html = await page.evaluate(() => (window as any).__EDITOR__.getHTML());
  expect(html).toContain(text);
}

/**
 * Assert that HTML content matches exactly
 */
export async function expectHtmlToEqual(page: Page, expectedHtml: string) {
  const html = await page.evaluate(() => (window as any).__EDITOR__.getHTML());
  // Normalize whitespace for comparison
  const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
  expect(normalize(html)).toBe(normalize(expectedHtml));
}

/**
 * Assert that editor has specific mark active
 */
export async function expectMarkActive(page: Page, markName: string, isActive = true) {
  const active = await page.evaluate((name) => {
    return (window as any).__EDITOR__.isActive(name);
  }, markName);

  if (isActive) {
    expect(active).toBe(true);
  } else {
    expect(active).toBe(false);
  }
}

/**
 * Assert that editor has specific node active
 */
export async function expectNodeActive(
  page: Page,
  nodeName: string,
  attributes?: Record<string, any>,
  isActive = true
) {
  const active = await page.evaluate(
    ({ name, attrs }) => {
      return (window as any).__EDITOR__.isActive(name, attrs);
    },
    { name: nodeName, attrs: attributes }
  );

  if (isActive) {
    expect(active).toBe(true);
  } else {
    expect(active).toBe(false);
  }
}

/**
 * Assert that table has specific dimensions
 */
export async function expectTableSize(page: Page, rows: number, cols: number) {
  const actualRows = await page.locator('table tr').count();
  const actualCols = await page.locator('table tr').first().locator('td, th').count();

  expect(actualRows).toBe(rows);
  expect(actualCols).toBe(cols);
}

/**
 * Assert that element is visible
 */
export async function expectVisible(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeVisible();
}

/**
 * Assert that element is hidden
 */
export async function expectHidden(page: Page, selector: string) {
  await expect(page.locator(selector)).toBeHidden();
}

/**
 * Assert that element has specific text content
 */
export async function expectText(page: Page, selector: string, text: string) {
  await expect(page.locator(selector)).toHaveText(text);
}

/**
 * Assert that element count matches expected
 */
export async function expectCount(page: Page, selector: string, count: number) {
  await expect(page.locator(selector)).toHaveCount(count);
}

/**
 * Assert editor is empty
 */
export async function expectEditorEmpty(page: Page) {
  const isEmpty = await page.evaluate(() => {
    return (window as any).__EDITOR__.isEmpty;
  });
  expect(isEmpty).toBe(true);
}

/**
 * Assert editor character count
 */
export async function expectCharCount(page: Page, count: number) {
  const storage = await page.evaluate(() => {
    return (window as any).__EDITOR__.storage;
  });
  // Assuming character count is stored in storage
  // Adjust based on actual implementation
  expect(storage.characterCount?.characters()).toBe(count);
}
