import { workspaceRoot } from '@nx/devkit';
import { expect, Page, test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * CKEditor HTML compatibility in a real browser.
 *
 * The core unit tests prove the round-trip under jsdom. Saving relies on the DOM to parse HTML and
 * to compare CSS values, so this runs the same fixtures through Chrome, via the Angular kit.
 * A private corpus (e.g. a consumer's stored templates) can be added without committing it:
 *   CK_FIXTURES_DIR=/path/to/html-files pnpm nx e2e document-engine-e2e -- ck-compat
 *
 * @ci - the public fixtures run in CI.
 */

const ROUTE = '/test-bench/ck-compat';
const MARKER = '§e2e§';

// Shared with the core unit tests. Loaded at runtime: a static import would cross project boundaries.
const shared: Record<string, string> = require(path.join(
  workspaceRoot,
  'libs/document-engine-core/src/__tests__/compat/fixtures/ck-letter-of-offer.ts'
));

const fixtures: [string, string][] = Object.entries(shared);
const privateDir = process.env['CK_FIXTURES_DIR'];
if (privateDir) {
  for (const f of fs.readdirSync(privateDir).filter((n) => n.endsWith('.html'))) {
    fixtures.push([f, fs.readFileSync(path.join(privateDir, f), 'utf8')]);
  }
}

async function openBench(page: Page): Promise<void> {
  await page.goto(ROUTE);
  await page.waitForFunction(() => 'window' in globalThis && '__CK_BENCH__' in window);
}

function load(page: Page, html: string) {
  return page.evaluate((h) => (window as any).__CK_BENCH__.load(h) as { unsupported: string[] }, html);
}

function save(page: Page): Promise<string> {
  return page.evaluate(() => (window as any).__CK_BENCH__.save() as string);
}

test.describe('CKEditor HTML compatibility in the browser @ci', () => {
  test.beforeEach(async ({ page }) => openBench(page));

  for (const [name, html] of fixtures) {
    test(`${name}: saves byte-identical HTML`, async ({ page }) => {
      expect((await load(page, html)).unsupported).toEqual([]);
      expect(await save(page)).toBe(html);
    });

    test(`${name}: a text edit changes nothing else`, async ({ page }) => {
      await load(page, html);
      await page.evaluate((marker) => {
        const editor = (window as any).__CK_BENCH__.editor;
        let at = -1;
        editor.state.doc.descendants((node: { isText: boolean }, pos: number) => {
          if (at < 0 && node.isText) at = pos;
          return at < 0;
        });
        editor.chain().insertContentAt(at, marker).run();
      }, MARKER);

      const saved = await save(page);
      expect(saved).toContain(MARKER);
      expect(saved.replace(MARKER, '')).toBe(html);
    });
  }

  test('a style edit keeps the declarations the editor does not model', async ({ page }) => {
    const cases: [string, string][] = [
      [
        '<p style="text-align:center;margin-left:1cm;line-height:14.0pt;">a</p>',
        'text-align:right;margin-left:1cm;line-height:14.0pt;',
      ],
      ['<p style="text-align:center;margin-left:2em;">a</p>', 'text-align:right;margin-left:2em;'],
      ['<p style="margin:0cm 0cm 0cm 36pt;text-align:center;">a</p>', 'margin:0cm 0cm 0cm 36pt;text-align:right;'],
    ];
    for (const [source, style] of cases) {
      await load(page, source);
      await page.evaluate(() => (window as any).__CK_BENCH__.editor.chain().selectAll().setTextAlign('right').run());
      expect(await save(page)).toBe(`<p style="${style}">a</p>`);
    }
  });

  test('reports content the editor cannot represent', async ({ page }) => {
    const html = '<div class="ck ck-content ck-print"><p>a</p><div class="redr-signature-field">x</div></div>';
    expect((await load(page, html)).unsupported).toEqual(['signatureField']);
    const report = await page.evaluate(
      (h) => (window as any).__CK_BENCH__.verify(h, (window as any).__CK_BENCH__.save()),
      html
    );
    expect(report.identical).toBe(false);
  });
});
