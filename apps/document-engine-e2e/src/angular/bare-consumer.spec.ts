import { expect, Locator, Page, test } from '@playwright/test';

/**
 * DE-016 regression guard — the published packages must work in a consumer app
 * that does not replicate this workspace's assumptions.
 *
 * Six defects shipped in `0.1.4` and none of them was visible anywhere in the
 * demo app, because the demo remaps every design token the library reads, is
 * light-mode, and is a full-page shell whose editor rarely leaves the first
 * viewport. `/test-bench/bare-consumer` removes all of that on purpose: library
 * token defaults instead of the app's theme, a dark page, a fixed-height editor
 * container, and the editor pushed well below the fold.
 *
 * One assertion per bug. If one of these goes red, a portability defect is on its
 * way back to npm.
 *
 * @ci - runs in CI: the whole point is that it cannot regress silently.
 */

const ROUTE = '/test-bench/bare-consumer';

/** Opaque means alpha === 1. A panel with no background is the B1/B2 failure. */
function alphaOf(colour: string): number {
  const m = colour.match(/rgba?\(([^)]+)\)/);
  if (!m) return colour === 'transparent' ? 0 : 1;
  const parts = m[1].split(',').map((p) => parseFloat(p));
  return parts.length < 4 ? 1 : parts[3];
}

/** WCAG relative luminance, for the B3 contrast assertion. */
function luminance(colour: string): number {
  const m = colour.match(/rgba?\(([^)]+)\)/);
  if (!m) return 0;
  const [r, g, b] = m[1].split(',').map((p) => parseFloat(p) / 255);
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

async function openFixture(page: Page, query = ''): Promise<void> {
  await page.goto(`${ROUTE}${query}`);
  await page.waitForFunction(() => (window as never as { __EDITOR__?: unknown }).__EDITOR__ !== undefined, {
    timeout: 15000,
  });
  // Bring the editor on screen. The page still carries a large scroll offset,
  // which is the condition that broke floating-ui positioning.
  await page.locator('[data-testid="bare-editor-frame"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
}

async function setContent(page: Page, html: string): Promise<void> {
  await page.evaluate((content) => {
    (window as never as { __EDITOR__: { commands: { setContent: (h: string) => void } } }).__EDITOR__.commands.setContent(
      content,
    );
  }, html);
  await page.waitForTimeout(300);
}

/**
 * Bounding box that must exist. `boundingBox()` returns null for an element that
 * is not rendered, and an `if (!box) return` guard would make the test pass
 * silently in exactly the case it is meant to catch.
 */
async function boxOf(locator: Locator): Promise<{ x: number; y: number; width: number; height: number }> {
  const box = await locator.boundingBox();
  expect(box, 'element has no bounding box — it is not rendered').not.toBeNull();
  return box as { x: number; y: number; width: number; height: number };
}

/** Confirms the fixture really is scrolled — otherwise B4/B5 prove nothing. */
async function assertPageIsScrolled(page: Page): Promise<void> {
  const scrollY = await page.evaluate(() => window.scrollY);
  expect(scrollY, 'fixture must be scrolled past the first viewport for the positioning assertions to mean anything')
    .toBeGreaterThan(300);
}

test.describe('Bare consumer — panel surfaces @ci', () => {
  test('B1: the selection bubble menu carries its own opaque, bordered, stacked surface', async ({ page }) => {
    await openFixture(page);
    await setContent(page, '<p>Visit <a href="https://example.com">this link</a> now.</p>');

    await page.locator('.tiptap a').first().click();
    // Several selection bubbles exist at once (link, table); pick the open one by
    // the view it is showing rather than by document order.
    const panel = page.locator('.bubble-menu-wrapper:has(.link-main-view)');
    await expect(panel).toBeVisible();

    const surface = await panel.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return {
        background: s.backgroundColor,
        borderStyle: s.borderTopStyle,
        borderWidth: s.borderTopWidth,
        radius: s.borderTopLeftRadius,
        shadow: s.boxShadow,
        zIndex: s.zIndex,
      };
    });

    // Each of these was empty in 0.1.4 because the utility class generated no rule.
    expect(alphaOf(surface.background), `panel background was ${surface.background}`).toBe(1);
    expect(surface.borderStyle).not.toBe('none');
    expect(parseFloat(surface.borderWidth)).toBeGreaterThan(0);
    expect(parseFloat(surface.radius)).toBeGreaterThan(0);
    expect(surface.shadow).not.toBe('none');
    expect(surface.zIndex).not.toBe('auto');
  });

  test('B2: the colour dropdown paints even though --popover is not set by the consumer', async ({ page }) => {
    await openFixture(page, '?tokens=none');
    await setContent(page, '<table><tbody><tr><td><p>cell</p></td><td><p>cell</p></td></tr></tbody></table>');

    await page.locator('.tiptap td').first().click();
    await page.waitForTimeout(300);
    await page.locator('button[title="Table Properties"]').click();
    await page.waitForTimeout(300);

    await page.locator('.table-style-view__color-swatch').first().click();
    const dropdown = page.locator('.table-style-view__color-picker-dropdown');
    await expect(dropdown).toBeVisible();

    const surface = await dropdown.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return { background: s.backgroundColor, shadow: s.boxShadow };
    });

    // `?tokens=none` leaves --popover and --shadow-elevation-2 undefined, so this
    // asserts the library's own fallbacks are carrying the surface.
    expect(alphaOf(surface.background), `dropdown background was ${surface.background}`).toBe(1);
    expect(surface.shadow).not.toBe('none');
  });

  test('B3: link-properties labels contrast against the panel they sit on', async ({ page }) => {
    await openFixture(page);
    await setContent(page, '<p>Visit <a href="https://example.com">this link</a> now.</p>');

    await page.locator('.tiptap a').first().click();
    await page.waitForTimeout(300);
    await page.locator('.link-main-view__button', { hasText: 'Properties' }).click();
    await page.waitForTimeout(300);

    /** Text colour paired with the nearest painted background above it. */
    const readColours = (selector: string) =>
      page.locator(selector).first().evaluate((el) => {
        const text = window.getComputedStyle(el).color;
        let node: HTMLElement | null = el as HTMLElement;
        let background = 'rgba(0, 0, 0, 0)';
        while (node) {
          const bg = window.getComputedStyle(node).backgroundColor;
          if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            background = bg;
            break;
          }
          node = node.parentElement;
        }
        return { text, background };
      });

    const label = page.locator('.document-engine-checkbox__label').first();
    await expect(label).toBeVisible();

    // In 0.1.4 these labels were `#374151` on a dark panel: ~1.3:1, unreadable.
    const labelColours = await readColours('.document-engine-checkbox__label');
    expect(
      contrastRatio(labelColours.text, labelColours.background),
      `label ${labelColours.text} on panel ${labelColours.background}`,
    ).toBeGreaterThanOrEqual(4.5);

    // `.inline-code` is the one element in the link views that declares BOTH its
    // colour and its background, so it catches a hardcoded value directly rather
    // than through inheritance.
    const codeColours = await readColours('.link-properties-view .inline-code');
    expect(
      contrastRatio(codeColours.text, codeColours.background),
      `inline code ${codeColours.text} on ${codeColours.background}`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('B3b: the link-properties tick follows --primary, not a hardcoded blue', async ({ page }) => {
    await openFixture(page);
    await setContent(page, '<p>Visit <a href="https://example.com">this link</a> now.</p>');

    await page.locator('.tiptap a').first().click();
    await page.waitForTimeout(300);
    await page.locator('.link-main-view__button', { hasText: 'Properties' }).click();
    await page.waitForTimeout(300);

    // The token-driven component, not a raw <input type="checkbox">.
    await expect(page.locator('.link-properties-view document-engine-checkbox').first()).toBeVisible();
    await expect(page.locator('.link-properties-view input.checkbox-input')).toHaveCount(0);
  });
});

test.describe('Bare consumer — floating positions on a scrolled page @ci', () => {
  test('B4: the colour picker opens at its swatch, not a scroll offset away', async ({ page }) => {
    await openFixture(page);
    await assertPageIsScrolled(page);
    await setContent(page, '<table><tbody><tr><td><p>cell</p></td><td><p>cell</p></td></tr></tbody></table>');

    await page.locator('.tiptap td').first().click();
    await page.waitForTimeout(300);
    await page.locator('button[title="Table Properties"]').click();
    await page.waitForTimeout(300);

    const swatch = page.locator('.table-style-view__color-swatch').first();
    await swatch.click();
    const dropdown = page.locator('.table-style-view__color-picker-dropdown');
    await expect(dropdown).toBeVisible();
    await page.waitForTimeout(300);

    const swatchBox = await boxOf(swatch);
    const dropdownBox = await boxOf(dropdown);
    const viewport = page.viewportSize() ?? { width: 1280, height: 720 };

    // Measured in the consumer that filed DE-016: swatch y≈730, picker y≈1720.
    expect(
      Math.abs(dropdownBox.y - swatchBox.y),
      `picker at y=${dropdownBox.y}, swatch at y=${swatchBox.y}`,
    ).toBeLessThan(dropdownBox.height + 40);

    // …and it must actually be on screen.
    expect(dropdownBox.y).toBeGreaterThanOrEqual(-1);
    expect(dropdownBox.y + dropdownBox.height).toBeLessThanOrEqual(viewport.height + 1);
  });

  test('B5: a toolbar panel stays anchored to its trigger while the page scrolls', async ({ page }) => {
    await openFixture(page);
    await assertPageIsScrolled(page);

    // A toolbar-triggered bubble — the code path that hand-rolled its position.
    await page.locator('.tiptap p').first().click();
    await page.waitForTimeout(200);
    const trigger = page.locator('button[title="Text Color"]');
    await trigger.click();
    await page.waitForTimeout(500);

    const panel = page.locator('.toolbar-bubble-menu:not(.toolbar-bubble-menu--hidden)').first();
    await expect(panel).toBeVisible();

    const before = await boxOf(panel);
    const triggerBefore = await boxOf(trigger);

    // No negative top: the old code produced one whenever the panel fit neither
    // below nor above its trigger.
    expect(before.y, 'panel header must not be off the top edge').toBeGreaterThanOrEqual(-1);

    await page.mouse.wheel(0, 200);
    await page.waitForTimeout(500);

    const after = await boxOf(panel);
    const triggerAfter = await boxOf(trigger);

    // The old code positioned once and stopped, so the panel stayed welded to the
    // viewport while the trigger slid away. The offset between them is what must
    // hold, not the panel's absolute position.
    const offsetBefore = before.y - triggerBefore.y;
    const offsetAfter = after.y - triggerAfter.y;
    expect(
      Math.abs(offsetAfter - offsetBefore),
      `panel-to-trigger offset moved from ${offsetBefore} to ${offsetAfter} on scroll`,
    ).toBeLessThan(8);
  });
});

test.describe('Bare consumer — editing surface sizing @ci', () => {
  test('B6: an empty editor fills its fixed-height container and is clickable throughout', async ({ page }) => {
    await openFixture(page, '?empty=1');

    const editable = page.locator('.tiptap').first();
    await expect(editable).toBeVisible();

    const box = await boxOf(editable);

    // 0.1.4 gave a 28px editable inside a 482px container.
    //
    // Measure against the frame, not a constant: a bare `> 150` also passes at the
    // `--de-editor-min-height: 12rem` floor (192px), which would prove the token
    // default while the flex chain that actually claims the container's height was
    // broken — leaving ~170px of dead space and still going green.
    const frame = await boxOf(page.locator('.bare-consumer__frame'));
    expect(
      box.height,
      `editable is ${box.height}px inside a ${frame.height}px frame — it is not claiming the container's height`,
    ).toBeGreaterThan(frame.height * 0.6);

    // Clicking near the bottom of the surface must place the caret, not fall
    // through to dead space.
    await page.mouse.click(box.x + box.width / 2, box.y + box.height - 12);
    await page.waitForTimeout(200);

    const focused = await page.evaluate(
      () => (window as never as { __EDITOR__: { isFocused: boolean } }).__EDITOR__.isFocused,
    );
    expect(focused, 'clicking the lower part of the editor did not focus it').toBe(true);
  });
});
