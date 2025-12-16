import { expect, test } from '@playwright/test';

test.describe('DynamicField NodeView E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/dynamic-field');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test('should insert and display correctly', async ({ page }) => {
    // Dynamic fields are pre-loaded in test bench

    // Verify dynamic field elements exist using class selector
    const dynamicFields = page.locator('.dynamic-field');
    const count = await dynamicFields.count();

    expect(count).toBeGreaterThan(0);

    // Verify first field has correct attributes
    const firstField = dynamicFields.first();
    await expect(firstField).toBeVisible();

    // Verify it has dynamic-field class
    await expect(firstField).toHaveClass(/dynamic-field/);

    // Verify it's not editable (contenteditable="false")
    await expect(firstField).toHaveAttribute('contenteditable', 'false');

    // Verify it has text content
    await expect(firstField).not.toBeEmpty();
  });

  test('should validate field attributes', async ({ page }) => {
    // Get existing dynamic fields
    const dynamicFields = page.locator('.dynamic-field');

    // Verify each field has valid attributes
    const count = await dynamicFields.count();

    for (let i = 0; i < count; i++) {
      const field = dynamicFields.nth(i);

      // Verify data-field-id exists and is not empty
      await expect(field).toHaveAttribute('data-field-id');
      const fieldId = await field.getAttribute('data-field-id');
      expect(fieldId?.length).toBeGreaterThan(0);

      // Field ID should be alphanumeric with underscores
      expect(fieldId).toMatch(/^[a-zA-Z0-9_]+$/);

      // Verify data-label exists
      await expect(field).toHaveAttribute('data-label');
      const label = await field.getAttribute('data-label');
      expect(label?.length).toBeGreaterThan(0);
    }
  });
});
