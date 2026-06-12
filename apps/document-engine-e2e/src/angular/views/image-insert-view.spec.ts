import { test, expect, Page } from '@playwright/test';

/**
 * E2E tests for the Image Insert View (`image-insert-view.ts`).
 *
 * The view is a bubble-menu content component with two branches, both exercised
 * here against `document-engine-image-insert-view-test-bench`:
 *  - URL fallback (`/test-bench/image-insert`): the built-in raw-URL form used
 *    when no `image.onPick` hook is configured.
 *  - Picker (`/test-bench/image-insert?picker=1`): delegates selection to the
 *    consumer's `image.onPick` hook and inserts the result as an `image-ref`.
 *
 * @high - Common media feature
 */

/** Wait for the bench's editor + wired view to be ready. */
async function waitForBench(page: Page): Promise<void> {
  await page.waitForFunction(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => (window as any).__EDITOR__ !== undefined && (window as any).__VIEW_READY__ === true,
    { timeout: 10000 },
  );
}

/** Current serialized editor HTML (the inserted document). */
function editorHtml(page: Page): Promise<string> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return page.evaluate(() => (window as any).__EDITOR__.getHTML());
}

test.describe('Image Insert View - URL fallback form @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/image-insert');
    await waitForBench(page);
  });

  test('shows the raw-URL form when no picker hook is configured', async ({ page }) => {
    await expect(page.getByTestId('mode')).toHaveText('url');
    await expect(page.locator('.image-insert-view__header')).toHaveText('Insert Image');
    await expect(page.locator('#url-input')).toBeVisible();
    await expect(page.locator('#alt-input')).toBeVisible();
    // The picker hint must NOT be present in fallback mode.
    await expect(page.getByText('Choose an image from your media library.')).toHaveCount(0);
  });

  test('keeps Insert disabled until a valid URL is entered', async ({ page }) => {
    const insert = page.locator('button[type="submit"]');
    await expect(insert).toBeDisabled();

    await page.locator('#url-input').fill('https://example.com/cat.jpg');
    await expect(insert).toBeEnabled();
  });

  test('shows a required error when the URL is left empty', async ({ page }) => {
    await page.locator('#url-input').focus();
    await page.locator('#url-input').blur();

    await expect(page.getByText('This field is required')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('rejects an invalid URL', async ({ page }) => {
    await page.locator('#url-input').fill('justtext');
    await page.locator('#url-input').blur();

    await expect(page.getByText('Enter a valid URL')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
  });

  test('inserts an image from a valid URL', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/cat.jpg');
    await page.locator('button[type="submit"]').click();

    expect(await editorHtml(page)).toContain('<img src="https://example.com/cat.jpg"');
    // The view asked to close after a successful insert.
    await expect(page.getByTestId('closed')).toHaveText('true');
  });

  test('applies alt text to the inserted image', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/cat.jpg');
    await page.locator('#alt-input').fill('A grey cat');
    await page.locator('button[type="submit"]').click();

    const html = await editorHtml(page);
    expect(html).toContain('src="https://example.com/cat.jpg"');
    expect(html).toContain('alt="A grey cat"');
  });

  test('cancel closes the view without inserting', async ({ page }) => {
    await page.locator('#url-input').fill('https://example.com/cat.jpg');
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();

    await expect(page.getByTestId('closed')).toHaveText('true');
    expect(await editorHtml(page)).not.toContain('<img');
  });
});

test.describe('Image Insert View - media picker @high', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/image-insert?picker=1');
    await waitForBench(page);
  });

  test('shows the picker UI (not the URL form) when an onPick hook is configured', async ({ page }) => {
    await expect(page.getByTestId('mode')).toHaveText('picker');
    await expect(page.getByText('Choose an image from your media library.')).toBeVisible();
    await expect(page.locator('button:has-text("Choose from library")')).toBeVisible();
    // The raw-URL input must NOT be rendered in picker mode.
    await expect(page.locator('#url-input')).toHaveCount(0);
  });

  test('inserts an image-ref from the picked media result', async ({ page }) => {
    await page.locator('button:has-text("Choose from library")').click();

    await expect
      .poll(() => editorHtml(page))
      .toContain('data-image-id="media_test"');
    const html = await editorHtml(page);
    expect(html).toContain('data-block="image-ref"');
    expect(html).toContain('<figcaption>A test image</figcaption>');
    await expect(page.getByTestId('closed')).toHaveText('true');
  });

  test('inserts nothing and stays open when the picker is cancelled', async ({ page }) => {
    // Arm the bench so the next onPick resolves null (consumer dismissed the dialog).
    await page.getByTestId('btn-picker-cancel').click();
    await page.locator('button:has-text("Choose from library")').click();

    // Give the (resolved-null) picker promise time to settle, then assert no insert.
    await expect(page.locator('button:has-text("Choose from library")')).toBeEnabled();
    const html = await editorHtml(page);
    expect(html).not.toContain('data-block="image-ref"');
    expect(html).not.toContain('<img');
    await expect(page.getByTestId('closed')).toHaveText('false');
  });
});
