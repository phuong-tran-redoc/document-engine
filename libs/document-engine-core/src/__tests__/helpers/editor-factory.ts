import { Editor } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import type { Extensions } from '@tiptap/core';

/**
 * Create a test editor instance with minimal required extensions
 * @param extensions Additional extensions to include
 * @param content Initial content (HTML string or JSON)
 * @returns Editor instance
 */
export function createTestEditor(extensions: Extensions = [], content: string | Record<string, unknown> = '') {
  return new Editor({
    extensions: [Document, Paragraph, Text, ...extensions],
    content,
  });
}

/**
 * Destroy editor and cleanup
 */
export function destroyEditor(editor: Editor) {
  editor.destroy();
}
