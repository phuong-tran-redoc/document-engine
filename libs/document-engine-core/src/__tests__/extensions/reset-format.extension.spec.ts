import { Editor } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Underline } from '@tiptap/extension-underline';
import { Heading } from '@tiptap/extension-heading';
import { createTestEditor } from '../helpers/editor-factory';
import { ResetFormat } from '../../extensions/reset-format.extension';

describe('ResetFormat Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([ResetFormat, Bold, Italic, Underline, Heading]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Commands', () => {
    describe('resetFormat()', () => {
      it('should clear all marks from selected text', () => {
        editor.commands.setContent('<p><strong><em><u>Formatted text</u></em></strong></p>');
        editor.commands.setTextSelection({ from: 1, to: 15 });

        const result = editor.commands.resetFormat();

        expect(result).toBe(true);
        const html = editor.getHTML();
        expect(html).not.toContain('<strong>');
        expect(html).not.toContain('<em>');
        expect(html).not.toContain('<u>');
      });

      it('should clear node formatting (heading to paragraph)', () => {
        editor.commands.setContent('<h1>Heading text</h1>');
        editor.commands.setTextSelection({ from: 1, to: 13 });

        const result = editor.commands.resetFormat();

        expect(result).toBe(true);
        const html = editor.getHTML();
        expect(html).toContain('<p>');
        expect(html).not.toContain('<h1>');
      });

      it('should preserve text content', () => {
        const textContent = 'This is formatted text';
        editor.commands.setContent(`<h1><strong><em>${textContent}</em></strong></h1>`);
        editor.commands.setTextSelection({ from: 1, to: textContent.length + 1 });

        editor.commands.resetFormat();

        expect(editor.getText()).toBe(textContent);
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register extension with correct name', () => {
      expect(editor.extensionManager.extensions.find((ext) => ext.name === 'resetFormat')).toBeDefined();
    });

    it('should have resetFormat command available', () => {
      expect(editor.commands.resetFormat).toBeDefined();
      expect(typeof editor.commands.resetFormat).toBe('function');
    });
  });
});
