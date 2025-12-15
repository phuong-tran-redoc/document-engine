import { Editor } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { createTestEditor } from '../helpers/editor-factory';
import { TextCase } from '../../extensions/text-case.extension';

describe('TextCase Extension', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([TextCase, Bold, Italic]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('Commands', () => {
    describe('textCase("uppercase")', () => {
      it('should convert selected text to uppercase', () => {
        editor.commands.setContent('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 12 });

        const result = editor.commands.textCase('uppercase');

        expect(result).toBe(true);
        expect(editor.getText()).toBe('HELLO WORLD');
      });

      it('should convert mixed case to uppercase', () => {
        editor.commands.setContent('<p>HeLLo WoRLd</p>');
        editor.commands.setTextSelection({ from: 1, to: 12 });

        editor.commands.textCase('uppercase');

        expect(editor.getText()).toBe('HELLO WORLD');
      });
    });

    describe('textCase("lowercase")', () => {
      it('should convert selected text to lowercase', () => {
        editor.commands.setContent('<p>HELLO WORLD</p>');
        editor.commands.setTextSelection({ from: 1, to: 12 });

        const result = editor.commands.textCase('lowercase');

        expect(result).toBe(true);
        expect(editor.getText()).toBe('hello world');
      });
    });

    describe('textCase("capitalize")', () => {
      it('should capitalize first letter and lowercase rest', () => {
        editor.commands.setContent('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 12 });

        const result = editor.commands.textCase('capitalize');

        expect(result).toBe(true);
        expect(editor.getText()).toBe('Hello world');
      });

      it('should work with single character', () => {
        editor.commands.setContent('<p>a</p>');
        editor.commands.setTextSelection({ from: 1, to: 2 });

        editor.commands.textCase('capitalize');

        expect(editor.getText()).toBe('A');
      });
    });

    describe('Selection Behavior', () => {
      it('should return false when selection is empty', () => {
        editor.commands.setContent('<p>hello world</p>');
        editor.commands.setTextSelection(1);

        const result = editor.commands.textCase('uppercase');

        expect(result).toBe(false);
      });

      it('should maintain selection after transformation', () => {
        editor.commands.setContent('<p>hello world</p>');
        const from = 1;
        const to = 6;
        editor.commands.setTextSelection({ from, to });

        editor.commands.textCase('uppercase');

        const { selection } = editor.state;
        expect(selection.from).toBe(from);
        expect(selection.to).toBe(to);
      });

      it('should work with partial text selection', () => {
        editor.commands.setContent('<p>hello world</p>');
        editor.commands.setTextSelection({ from: 1, to: 6 });

        editor.commands.textCase('uppercase');

        expect(editor.getText()).toBe('HELLO world');
      });
    });

    describe('Edge Cases', () => {
      it('should handle special characters', () => {
        editor.commands.setContent('<p>hello@world.com</p>');
        editor.commands.setTextSelection({ from: 1, to: 16 });

        editor.commands.textCase('uppercase');

        expect(editor.getText()).toBe('HELLO@WORLD.COM');
      });

      it('should handle numbers', () => {
        editor.commands.setContent('<p>hello123world</p>');
        editor.commands.setTextSelection({ from: 1, to: 14 });

        editor.commands.textCase('uppercase');

        expect(editor.getText()).toBe('HELLO123WORLD');
      });
    });
  });

  describe('Extension Registration', () => {
    it('should register extension with correct name', () => {
      expect(editor.extensionManager.extensions.find((ext) => ext.name === 'textCase')).toBeDefined();
    });

    it('should have textCase command available', () => {
      expect(editor.commands.textCase).toBeDefined();
      expect(typeof editor.commands.textCase).toBe('function');
    });
  });
});
