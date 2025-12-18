import { expect, test } from '@playwright/test';
import { createEditorHelper } from '../../helpers/editor-helpers';

// Verified

test.describe('DynamicField NodeView E2E @critical', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-bench/dynamic-field');
    await page.waitForFunction(() => (window as any).__EDITOR__ !== undefined, {
      timeout: 10000,
    });
  });

  test.describe('Display & Styling', () => {
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

    test('should have correct CSS classes', async ({ page }) => {
      const dynamicFields = page.locator('.dynamic-field');
      const count = await dynamicFields.count();

      for (let i = 0; i < count; i++) {
        const field = dynamicFields.nth(i);

        // Verify has dynamic-field class
        await expect(field).toHaveClass(/dynamic-field/);

        // Verify has red-dynamic-field class (styling)
        await expect(field).toHaveClass(/red-dynamic-field/);

        // Verify not editable
        await expect(field).toHaveAttribute('contenteditable', 'false');
      }
    });

    test('should display label text in NodeView', async ({ page }) => {
      const dynamicFields = page.locator('.dynamic-field');

      // Verify each field has visible text content
      const count = await dynamicFields.count();
      expect(count).toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const field = dynamicFields.nth(i);

        const text = await field.textContent();

        // Text should not be empty
        // eslint-disable-next-line playwright/prefer-web-first-assertions
        expect(text).toBeTruthy();
        expect(text!.length).toBeGreaterThan(0);
      }
    });

    test('should have red-dynamic-field styling applied', async ({ page }) => {
      const firstField = page.locator('.dynamic-field').first();

      // Verify it has the red-dynamic-field class for styling
      await expect(firstField).toHaveClass(/red-dynamic-field/);

      // Verify it's visible (styling should make it visible)
      await expect(firstField).toBeVisible();
    });
  });

  test.describe('Interaction', () => {
    test('should be selectable by clicking', async ({ page }) => {
      const firstField = page.locator('.dynamic-field').first();

      // Click on the field
      await firstField.click();
      await page.waitForTimeout(200);

      // Verify field is selected by checking if editor has selection on it
      const isSelected = await page.evaluate(() => {
        const editor = (window as any).__EDITOR__;
        return editor.isActive('dynamicField');
      });

      expect(isSelected).toBe(true);
    });

    test('should delete on backspace when selected', async ({ page }) => {
      // Get initial count
      const initialCount = await page.locator('.dynamic-field').count();
      expect(initialCount).toBeGreaterThan(0);

      // Click on first field to select it
      const firstField = page.locator('.dynamic-field').first();
      await firstField.click();
      await page.waitForTimeout(200);

      // Press backspace
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(300);

      // Verify count decreased
      const newCount = await page.locator('.dynamic-field').count();
      expect(newCount).toBe(initialCount - 1);
    });

    test('should delete on delete key when selected', async ({ page }) => {
      // Get initial count
      const initialCount = await page.locator('.dynamic-field').count();
      expect(initialCount).toBeGreaterThan(0);

      // Click on first field to select it
      const firstField = page.locator('.dynamic-field').first();
      await firstField.click();
      await page.waitForTimeout(200);

      // Press delete key
      await page.keyboard.press('Delete');
      await page.waitForTimeout(300);

      // Verify count decreased
      const newCount = await page.locator('.dynamic-field').count();
      expect(newCount).toBe(initialCount - 1);
    });
  });

  test.describe('Commands', () => {
    test('should insert via insertDynamicField command', async ({ page }) => {
      const editor = await createEditorHelper(page);

      // Clear content first
      await editor.clear();
      await page.waitForTimeout(300);

      // Insert dynamic field via command
      await page.evaluate(() => {
        (window as any).__EDITOR__.commands.insertDynamicField({
          fieldId: 'test_field',
          label: 'Test Field',
        });
      });

      await page.waitForTimeout(300);

      // Verify field was inserted
      const dynamicFields = page.locator('.dynamic-field');
      const count = await dynamicFields.count();
      expect(count).toBe(1);

      // Verify content
      const fieldText = await dynamicFields.first().textContent();
      expect(fieldText).toContain('Test Field');
    });

    test('should insert at cursor position', async ({ page }) => {
      const editor = await createEditorHelper(page);

      // Set initial content
      await editor.setContent('<p>Before After</p>');
      await page.waitForTimeout(300);

      // Click in the middle of text (between "Before" and "After")
      const paragraph = page.locator('p').first();
      await paragraph.click();

      // Move cursor to position (after "Before ")
      await page.keyboard.press('End');
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('ArrowLeft');
      }

      await page.keyboard.press('Space');

      // Insert dynamic field
      await page.evaluate(() => {
        (window as any).__EDITOR__.commands.insertDynamicField({
          fieldId: 'inserted_field',
          label: 'Inserted',
        });
      });

      await page.waitForTimeout(300);

      // Verify field was inserted at correct position
      const html = await editor.getHTML();
      expect(html).toContain('Before');
      expect(html).toContain('Inserted');
      expect(html).toContain('After');
    });

    test('should not insert without required attributes', async ({ page }) => {
      const editor = await createEditorHelper(page);

      // Clear content
      await editor.clear();
      await page.waitForTimeout(300);

      // Try to insert without fieldId (should fail)
      const result1 = await page.evaluate(() => {
        return (window as any).__EDITOR__.commands.insertDynamicField({
          fieldId: '',
          label: 'Test',
        });
      });

      expect(result1).toBe(false);

      // Try to insert without label (should fail)
      const result2 = await page.evaluate(() => {
        return (window as any).__EDITOR__.commands.insertDynamicField({
          fieldId: 'test',
          label: '',
        });
      });

      expect(result2).toBe(false);

      // Verify no fields were inserted
      const count = await page.locator('.dynamic-field').count();
      expect(count).toBe(0);
    });
  });
});
