import { Editor } from '@tiptap/core';
import { generateHTML } from '../../kit/generate-html';
import { ImageRef } from '../../nodes/image-ref.node';
import { createTestEditor } from '../helpers/editor-factory';

describe('ImageRef Node', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([ImageRef]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Rendering', () => {
    it('renders a <figure> carrying data-block and data-image-id', () => {
      editor.commands.insertImageRef({ imageId: 'media_abc' });

      const html = editor.getHTML();
      expect(html).toContain('<figure');
      expect(html).toContain('data-block="image-ref"');
      expect(html).toContain('data-image-id="media_abc"');
    });

    it('does not emit a URL or presentation (width/style/src/img)', () => {
      editor.commands.insertImageRef({ imageId: 'media_abc', caption: 'Hero' });

      const html = editor.getHTML();
      expect(html).not.toContain('<img');
      expect(html).not.toContain('src=');
      expect(html).not.toMatch(/style=|width=/);
    });

    it('renders a <figcaption> only when a caption is present', () => {
      editor.commands.insertImageRef({ imageId: 'media_abc' });
      expect(editor.getHTML()).not.toContain('<figcaption');

      editor.commands.setContent('');
      editor.commands.insertImageRef({ imageId: 'media_abc', caption: 'Main lobby' });
      expect(editor.getHTML()).toContain('<figcaption>Main lobby</figcaption>');
    });

    it('emits data-caption-position when provided', () => {
      editor.commands.insertImageRef({ imageId: 'media_abc', caption: 'Top', captionPosition: 'top' });
      expect(editor.getHTML()).toContain('data-caption-position="top"');
    });

    it('refuses to insert without an imageId', () => {
      const spy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
      // @ts-expect-error — intentionally invalid attrs for the guard test
      const inserted = editor.commands.insertImageRef({ caption: 'no id' });

      expect(inserted).toBe(false);
      expect(editor.getHTML()).not.toContain('data-block="image-ref"');
      spy.mockRestore();
    });
  });

  describe('Parsing', () => {
    it('parses a figure[data-block="image-ref"] back into the node with its attrs', () => {
      editor.commands.setContent(
        '<figure data-block="image-ref" data-image-id="media_x" data-caption-position="bottom"><figcaption>Hi</figcaption></figure>',
      );

      const node = editor.getJSON().content?.[0];
      expect(node?.type).toBe('imageRef');
      expect(node?.attrs?.['imageId']).toBe('media_x');
      expect(node?.attrs?.['caption']).toBe('Hi');
      expect(node?.attrs?.['captionPosition']).toBe('bottom');
    });

    it('coerces an unknown data-caption-position to the typed union', () => {
      editor.commands.setContent(
        '<figure data-block="image-ref" data-image-id="media_x" data-caption-position="garbage"></figure>',
      );

      const node = editor.getJSON().content?.[0];
      expect(node?.attrs?.['captionPosition']).toBe('bottom');
    });

    it('leaves captionPosition null when the attribute is absent', () => {
      editor.commands.setContent('<figure data-block="image-ref" data-image-id="media_x"></figure>');

      const node = editor.getJSON().content?.[0];
      expect(node?.attrs?.['captionPosition']).toBeNull();
    });

    it('round-trips render -> parse -> render', () => {
      editor.commands.insertImageRef({ imageId: 'media_rt', caption: 'Caption', captionPosition: 'top' });
      const first = editor.getHTML();

      editor.commands.setContent(first);
      const second = editor.getHTML();

      expect(second).toBe(first);
      const node = editor.getJSON().content?.[0];
      expect(node?.attrs?.['imageId']).toBe('media_rt');
      expect(node?.attrs?.['caption']).toBe('Caption');
      expect(node?.attrs?.['captionPosition']).toBe('top');
    });
  });

  describe('Headless generateHTML (DE-002 default kit)', () => {
    it('serializes an image-ref to the expected figure markup', async () => {
      const doc = {
        type: 'doc',
        content: [{ type: 'imageRef', attrs: { imageId: 'media_abc', caption: 'Lobby', captionPosition: 'bottom' } }],
      };

      const html = await generateHTML(doc);
      expect(html).toContain('<figure');
      expect(html).toContain('data-block="image-ref"');
      expect(html).toContain('data-image-id="media_abc"');
      expect(html).toContain('data-caption-position="bottom"');
      expect(html).toContain('<figcaption>Lobby</figcaption>');
      expect(html).not.toContain('<img');
    });
  });
});
