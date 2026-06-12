/**
 * Real serialization correctness, run under the default jsdom env. A DOM is
 * present, so `generateHTML` takes the `@tiptap/html` (browser) path and we can
 * assert exact HTML output through the identical serializer code.
 *
 * The Node-safety / headless-path-selection behavior is covered separately, with
 * no real DOM, in `generate-html.node.spec.ts`.
 */
import type { JSONContent } from '@tiptap/core';
import { defaultExtensions, generateHTML } from '../../index';

describe('generateHTML (serialization)', () => {
  it('serializes a simple paragraph document to HTML', async () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] }],
    };

    await expect(generateHTML(doc)).resolves.toBe('<p>Hello world</p>');
  });

  it('serializes marks (bold) semantically', async () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'bold', marks: [{ type: 'bold' }] }],
        },
      ],
    };

    await expect(generateHTML(doc)).resolves.toBe('<p><strong>bold</strong></p>');
  });

  it('round-trips the custom DynamicField node', async () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Dear ' },
            { type: 'dynamicField', attrs: { fieldId: 'customer_name', label: 'Customer Name' } },
          ],
        },
      ],
    };

    const html = await generateHTML(doc);

    expect(html).toContain('data-field-id="customer_name"');
    expect(html).toContain('data-label="Customer Name"');
    expect(html).toContain('{{customer_name}}');
  });

  it('is deterministic — same input yields identical output', async () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'cache me' }] }],
    };

    const [a, b] = await Promise.all([generateHTML(doc), generateHTML(doc)]);
    expect(a).toBe(b);
  });

  it('accepts a caller-supplied extension array', async () => {
    const doc: JSONContent = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'plain' }] }],
    };

    await expect(generateHTML(doc, defaultExtensions)).resolves.toBe('<p>plain</p>');
  });
});
