import { Editor } from '@tiptap/core';
import { createTestEditor } from '../helpers/editor-factory';
import { ClearContent } from '../../extensions/clear-content.extension';

describe('ClearContent Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([ClearContent]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Commands', () => {
    describe('clear()', () => {
      it('should clear all content from editor', () => {
        editor.commands.setContent('<p>Hello World</p><p>Second paragraph</p>');

        const result = editor.commands.clear();

        expect(result).toBe(true);
        expect(editor.getText()).toBe('');
        expect(editor.isEmpty).toBe(true);
      });

      it('should clear content with formatting', () => {
        editor.commands.setContent('<p><strong>Bold text</strong> and <em>italic text</em></p>');

        const result = editor.commands.clear();

        expect(result).toBe(true);
        expect(editor.isEmpty).toBe(true);
      });

      it('should work when editor is already empty', () => {
        editor.commands.setContent('');

        const result = editor.commands.clear();

        expect(result).toBe(true);
        expect(editor.isEmpty).toBe(true);
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register extension with correct name', () => {
      expect(editor.extensionManager.extensions.find((ext) => ext.name === 'clearContent')).toBeDefined();
    });

    it('should have clear command available', () => {
      expect(editor.commands.clear).toBeDefined();
      expect(typeof editor.commands.clear).toBe('function');
    });
  });
});
