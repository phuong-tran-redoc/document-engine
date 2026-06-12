/**
 * @jest-environment node
 *
 * Headless behavior, run under the Node test environment (no `document`). This
 * proves `generateHTML` selects the Node-safe `@tiptap/html/server` serializer
 * when there is no DOM, and threads the default extension kit through.
 *
 * The real server serializer is backed by happy-dom (an ESM-only, ~600-file DOM
 * implementation) which the CommonJS Jest runtime cannot load without ESM mode.
 * Mocking it keeps this test about *our* code — the environment branch and the
 * default-kit passthrough — while real HTML output is asserted under jsdom in
 * `generate-html.spec.ts`.
 */
import type { JSONContent } from '@tiptap/core';

const serverGenerateHTML = jest.fn((_doc: unknown, _ext: unknown) => '<p>from server build</p>');

jest.mock('@tiptap/html/server', () => ({ generateHTML: serverGenerateHTML }));

import { defaultExtensions, generateHTML } from '../../index';

const doc: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'headless' }] }],
};

describe('generateHTML (headless / Node env)', () => {
  beforeEach(() => serverGenerateHTML.mockClear());

  it('runs with no DOM present', () => {
    expect((globalThis as { document?: unknown }).document).toBeUndefined();
  });

  it('routes through the Node-safe server serializer when there is no DOM', async () => {
    await expect(generateHTML(doc)).resolves.toBe('<p>from server build</p>');
    expect(serverGenerateHTML).toHaveBeenCalledTimes(1);
  });

  it('defaults to the canonical extension kit', async () => {
    await generateHTML(doc);
    expect(serverGenerateHTML).toHaveBeenCalledWith(doc, defaultExtensions);
  });

  it('forwards a caller-supplied extension array', async () => {
    const custom = defaultExtensions.slice(0, 3);
    await generateHTML(doc, custom);
    expect(serverGenerateHTML).toHaveBeenCalledWith(doc, custom);
  });
});
