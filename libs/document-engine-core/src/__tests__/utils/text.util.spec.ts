import { Editor } from '@tiptap/core';
import { createTestEditor } from '../helpers/editor-factory';
import { getSelectedText, getActiveMarkRange } from '../../utils/text.util';
import Bold from '@tiptap/extension-bold';
import Link from '@tiptap/extension-link';

describe('Text Utilities', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([Bold, Link]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('getSelectedText()', () => {
    it('should return selected text', () => {
      editor.commands.setContent('<p>Hello World</p>');
      editor.commands.setTextSelection({ from: 1, to: 6 }); // Select "Hello"

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBe('Hello');
    });

    it('should return null when selection is empty (cursor only)', () => {
      editor.commands.setContent('<p>Hello World</p>');
      editor.commands.setTextSelection(1); // Just cursor, no selection

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBeNull();
    });

    it('should return text across multiple words', () => {
      editor.commands.setContent('<p>Hello World Test</p>');
      editor.commands.setTextSelection({ from: 1, to: 12 }); // Select "Hello World"

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBe('Hello World');
    });

    it('should return text with spaces between nodes', () => {
      editor.commands.setContent('<p>First</p><p>Second</p>');
      editor.commands.setTextSelection({ from: 1, to: 14 }); // Select across paragraphs

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBe('First Second');
    });

    it('should handle selection with formatting', () => {
      editor.commands.setContent('<p><strong>Bold</strong> text</p>');
      editor.commands.setTextSelection({ from: 1, to: 10 }); // Select "Bold text"

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBe('Bold text');
    });

    it('should return partial text selection', () => {
      editor.commands.setContent('<p>Hello World</p>');
      editor.commands.setTextSelection({ from: 7, to: 12 }); // Select "World"

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBe('World');
    });

    it('should return single character selection', () => {
      editor.commands.setContent('<p>Hello</p>');
      editor.commands.setTextSelection({ from: 1, to: 2 }); // Select "H"

      const selectedText = getSelectedText(editor);

      expect(selectedText).toBe('H');
    });
  });

  describe('getActiveMarkRange()', () => {
    describe('Bold mark', () => {
      it('should return range of bold mark at cursor', () => {
        editor.commands.setContent('<p>Normal <strong>bold text</strong> normal</p>');
        editor.commands.setTextSelection(12); // Cursor in "bold text"

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).not.toBeNull();
        expect(range?.from).toBe(8);
        expect(range?.to).toBe(17);
        expect(range?.mark.type.name).toBe('bold');
      });

      it('should return null when cursor is not in bold text', () => {
        editor.commands.setContent('<p>Normal <strong>bold</strong> normal</p>');
        editor.commands.setTextSelection(1); // Cursor in "Normal"

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).toBeNull();
      });

      it('should return full range even when cursor is at start of mark', () => {
        editor.commands.setContent('<p>Text <strong>bold</strong> text</p>');
        editor.commands.setTextSelection(7); // Cursor at start of "bold" (after space)

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).not.toBeNull();
        expect(range?.from).toBe(6);
        expect(range?.to).toBe(10);
      });

      it('should return full range even when cursor is at end of mark', () => {
        editor.commands.setContent('<p>Text <strong>bold</strong> text</p>');
        editor.commands.setTextSelection(10); // Cursor at end of "bold"

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).not.toBeNull();
        expect(range?.from).toBe(6);
        expect(range?.to).toBe(10);
      });
    });

    describe('Link mark', () => {
      it('should return range of link mark at cursor', () => {
        editor.commands.setContent('<p>Text <a href="https://example.com">link text</a> more</p>');
        editor.commands.setTextSelection(10); // Cursor in "link text"

        const range = getActiveMarkRange(editor, 'link');

        expect(range).not.toBeNull();
        expect(range?.from).toBe(6);
        expect(range?.to).toBe(15);
        expect(range?.mark.type.name).toBe('link');
      });

      it('should return link attributes', () => {
        editor.commands.setContent('<p><a href="https://example.com">link</a></p>');
        editor.commands.setTextSelection(2);

        const range = getActiveMarkRange(editor, 'link');

        expect(range).not.toBeNull();
        expect(range?.mark.attrs['href']).toBe('https://example.com');
      });
    });

    describe('Multiple marks', () => {
      it('should return correct mark when multiple marks are present', () => {
        editor.commands.setContent('<p><strong><a href="#">bold link</a></strong></p>');
        editor.commands.setTextSelection(5);

        const boldRange = getActiveMarkRange(editor, 'bold');
        const linkRange = getActiveMarkRange(editor, 'link');

        expect(boldRange).not.toBeNull();
        expect(linkRange).not.toBeNull();
        expect(boldRange?.from).toBe(1);
        expect(linkRange?.from).toBe(1);
      });
    });

    describe('Edge cases', () => {
      it('should return null for non-existent mark type', () => {
        editor.commands.setContent('<p><strong>bold</strong></p>');
        editor.commands.setTextSelection(2);

        const range = getActiveMarkRange(editor, 'italic');

        expect(range).toBeNull();
      });

      it('should handle empty document', () => {
        editor.commands.setContent('<p></p>');
        editor.commands.setTextSelection(1);

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).toBeNull();
      });

      it('should handle mark at document start', () => {
        editor.commands.setContent('<p><strong>Start</strong> text</p>');
        editor.commands.setTextSelection(1);

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).not.toBeNull();
        expect(range?.from).toBe(1);
        expect(range?.to).toBe(6);
      });

      it('should handle mark at document end', () => {
        editor.commands.setContent('<p>Text <strong>end</strong></p>');
        editor.commands.setTextSelection(8);

        const range = getActiveMarkRange(editor, 'bold');

        expect(range).not.toBeNull();
        expect(range?.from).toBe(6);
        expect(range?.to).toBe(9);
      });
    });
  });
});
