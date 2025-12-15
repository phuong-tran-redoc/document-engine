import { Editor } from '@tiptap/core';
import { createTestEditor } from '../helpers/editor-factory';
import { NotumHeading } from '../../nodes/heading.node';

describe('NotumHeading Node', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([NotumHeading]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Commands', () => {
    describe('removeHeading()', () => {
      it('should convert heading to paragraph', () => {
        editor.commands.setContent('<h1>Heading text</h1>');
        editor.commands.setTextSelection(1);

        const result = editor.commands.removeHeading();

        expect(result).toBe(true);
        expect(editor.isActive('heading')).toBe(false);
        expect(editor.isActive('paragraph')).toBe(true);
      });

      it('should preserve text content when converting', () => {
        const text = 'Important heading';
        editor.commands.setContent(`<h2>${text}</h2>`);
        editor.commands.setTextSelection(1);

        editor.commands.removeHeading();

        expect(editor.getText()).toBe(text);
      });

      it('should work with different heading levels', () => {
        for (let level = 1; level <= 6; level++) {
          editor.commands.setContent(`<h${level}>Heading ${level}</h${level}>`);
          editor.commands.setTextSelection(1);

          const result = editor.commands.removeHeading();

          expect(result).toBe(true);
          expect(editor.isActive('paragraph')).toBe(true);
        }
      });

      it('should return false when not in heading', () => {
        editor.commands.setContent('<p>Regular paragraph</p>');
        editor.commands.setTextSelection(1);

        const result = editor.commands.removeHeading();

        expect(result).toBe(false);
      });

      it('should convert entire heading when only part of text is selected', () => {
        editor.commands.setContent('<h1>Heading text</h1>');
        // Select only "Heading" (positions 1-8)
        editor.commands.setTextSelection({ from: 1, to: 8 });

        const result = editor.commands.removeHeading();

        expect(result).toBe(true);
        expect(editor.isActive('heading')).toBe(false);
        expect(editor.isActive('paragraph')).toBe(true);
        // Text should be preserved
        expect(editor.getText()).toBe('Heading text');
      });
    });

    describe('Parent commands inheritance', () => {
      it('should have toggleHeading command from parent', () => {
        expect(editor.commands.toggleHeading).toBeDefined();
      });

      it('should have setHeading command from parent', () => {
        expect(editor.commands.setHeading).toBeDefined();
      });

      it('should toggle heading with parent command', () => {
        editor.commands.setContent('<p>Text</p>');
        editor.commands.setTextSelection(1);

        editor.commands.toggleHeading({ level: 1 });

        expect(editor.isActive('heading', { level: 1 })).toBe(true);
      });

      it('should convert entire paragraph to heading when only part of text is selected', () => {
        editor.commands.setContent('<p>Regular paragraph text</p>');
        // Select only "Regular" (positions 1-8)
        editor.commands.setTextSelection({ from: 1, to: 8 });

        editor.commands.toggleHeading({ level: 2 });

        expect(editor.isActive('heading', { level: 2 })).toBe(true);
        expect(editor.isActive('paragraph')).toBe(false);
        // Text should be preserved
        expect(editor.getText()).toBe('Regular paragraph text');
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register node with correct name', () => {
      expect(editor.schema.nodes['heading']).toBeDefined();
    });

    it('should have removeHeading command available', () => {
      expect(editor.commands.removeHeading).toBeDefined();
    });
  });
});
