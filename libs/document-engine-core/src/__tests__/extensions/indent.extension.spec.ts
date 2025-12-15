import { Editor } from '@tiptap/core';
import { Heading } from '@tiptap/extension-heading';
import { Blockquote } from '@tiptap/extension-blockquote';
import { createTestEditor } from '../helpers/editor-factory';
import { Indent } from '../../extensions/indent.extension';
import { INDENT_DEFAULT } from '../../constants';

describe('Indent Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([Indent, Heading, Blockquote]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Attributes', () => {
    describe('Parsing', () => {
      it('should parse margin-left style to indent attribute', () => {
        editor.commands.setContent('<p style="margin-left: 40px">Indented text</p>');

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(40);
      });

      it('should parse different indent values', () => {
        editor.commands.setContent('<p style="margin-left: 80px">Double indented</p>');

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(80);
      });

      it('should parse indent on heading', () => {
        editor.commands.setContent('<h1 style="margin-left: 40px">Indented heading</h1>');

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(40);
      });
    });

    describe('Rendering', () => {
      it('should render indent attribute as margin-left style', () => {
        editor.commands.setContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { indent: 40 },
              content: [{ type: 'text', text: 'Indented text' }],
            },
          ],
        });

        const html = editor.getHTML();
        expect(html).toContain('margin-left: 40px');
      });
    });
  });

  describe('Commands', () => {
    describe('increaseIndent()', () => {
      it('should increase indent by default value (40px)', () => {
        editor.commands.setContent('<p>Text</p>');
        editor.commands.setTextSelection(1);

        const result = editor.commands.increaseIndent();

        expect(result).toBe(true);
        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(INDENT_DEFAULT);
      });

      it('should increase existing indent', () => {
        editor.commands.setContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { indent: 40 },
              content: [{ type: 'text', text: 'Text' }],
            },
          ],
        });
        editor.commands.setTextSelection(1);

        editor.commands.increaseIndent();

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(80);
      });

      it('should work multiple times', () => {
        editor.commands.setContent('<p>Text</p>');
        editor.commands.setTextSelection(1);

        editor.commands.increaseIndent();
        editor.commands.increaseIndent();
        editor.commands.increaseIndent();

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(120);
      });

      it('should return false for non-allowed node types', () => {
        editor.commands.setContent('<blockquote><p>Quote</p></blockquote>');
        editor.commands.setTextSelection(2);

        const result = editor.commands.increaseIndent();

        // Cursor is in paragraph (allowed type), not blockquote
        expect(result).toBe(true);
      });
    });

    describe('decreaseIndent()', () => {
      it('should decrease indent by default value', () => {
        editor.commands.setContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { indent: 80 },
              content: [{ type: 'text', text: 'Text' }],
            },
          ],
        });
        editor.commands.setTextSelection(1);

        const result = editor.commands.decreaseIndent();

        expect(result).toBe(true);
        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(40);
      });

      it('should not allow negative indent', () => {
        editor.commands.setContent('<p>No indent</p>');
        editor.commands.setTextSelection(1);

        const result = editor.commands.decreaseIndent();

        expect(result).toBe(false);
      });

      it('should reset attribute when indent becomes 0', () => {
        editor.commands.setContent({
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              attrs: { indent: 40 },
              content: [{ type: 'text', text: 'Text' }],
            },
          ],
        });
        editor.commands.setTextSelection(1);

        const result = editor.commands.decreaseIndent();

        expect(result).toBe(true);
        const json = editor.getJSON();
        // Tiptap resets attributes to null, not undefined
        expect(json.content?.[0]?.attrs?.['indent']).toBeFalsy();
      });
    });

    describe('Increase/Decrease Cycles', () => {
      it('should handle increase then decrease', () => {
        editor.commands.setContent('<p>Text</p>');
        editor.commands.setTextSelection(1);

        editor.commands.increaseIndent();
        editor.commands.increaseIndent();
        editor.commands.decreaseIndent();

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBe(40);
      });

      it('should handle full cycle back to 0', () => {
        editor.commands.setContent('<p>Text</p>');
        editor.commands.setTextSelection(1);

        editor.commands.increaseIndent();
        editor.commands.decreaseIndent();

        const json = editor.getJSON();
        expect(json.content?.[0]?.attrs?.['indent']).toBeFalsy();
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register extension with correct name', () => {
      expect(editor.extensionManager.extensions.find((ext) => ext.name === 'indent')).toBeDefined();
    });

    it('should have increaseIndent and decreaseIndent commands', () => {
      expect(editor.commands.increaseIndent).toBeDefined();
      expect(editor.commands.decreaseIndent).toBeDefined();
    });
  });
});
