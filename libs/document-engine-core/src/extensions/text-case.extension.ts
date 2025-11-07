import { Extension } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';
import { TextCaseType } from '../types';

export interface TextCaseOptions {
  type: TextCaseType;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    textCase: {
      textCase: (type: TextCaseOptions['type']) => ReturnType;
    };
  }
}

export const TextCase = Extension.create<TextCaseOptions>({
  name: 'textCase',

  addOptions() {
    return {
      type: 'uppercase',
    };
  },

  addCommands() {
    return {
      textCase:
        (type: TextCaseOptions['type']) =>
        ({ tr, state }) => {
          const { $from, $to, empty } = tr.selection;

          // If selection is empty, return false
          if (empty) return false;

          // If selection is not empty, get the text of the selection
          const text = state.doc.textBetween($from.pos, $to.pos, '\n', '\n');

          // If text is empty, return false
          if (text.length === 0) return false;

          let newText = text;

          // Change the text case
          switch (type) {
            case 'uppercase':
              newText = text.toUpperCase();
              break;
            case 'lowercase':
              newText = text.toLowerCase();
              break;
            case 'capitalize':
              newText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
              break;
          }

          tr.replaceWith($from.pos, $to.pos, state.schema.text(newText));
          tr.setSelection(TextSelection.create(tr.doc, $from.pos, $from.pos + newText.length));

          return true;
        },
    };
  },
});
