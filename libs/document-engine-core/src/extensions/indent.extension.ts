import { Extension } from '@tiptap/core';
import { INDENT_DEFAULT } from '../constants';

export interface IndentOptions {
  types: string[];
  indent: number; // in pixels
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    increaseIndent: { increaseIndent: () => ReturnType };
    decreaseIndent: { decreaseIndent: () => ReturnType };
  }
}

export const Indent = Extension.create<IndentOptions>({
  name: 'indent',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
      indent: INDENT_DEFAULT,
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          indent: {
            parseHTML: (element) => {
              return Number(element.style.marginLeft.replace('px', ''));
            },

            renderHTML: (attributes) => {
              return { style: `margin-left: ${attributes['indent']}px` };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      increaseIndent:
        () =>
        ({ state, chain }) => {
          const currentNode = state.selection.$head.parent;
          const nodeType = currentNode.type;

          if (!this.options.types.includes(nodeType.name)) return false;

          const currentIndent = currentNode.attrs['indent'] || 0;
          const newIndent = currentIndent + this.options.indent;

          return chain().updateAttributes(nodeType, { indent: newIndent }).run();
        },

      decreaseIndent:
        () =>
        ({ state, chain }) => {
          const currentNode = state.selection.$head.parent;
          const nodeType = currentNode.type;

          if (!this.options.types.includes(nodeType.name)) return false;

          const currentIndent = currentNode.attrs['indent'] || 0;
          const newIndent = currentIndent - this.options.indent;

          if (newIndent < 0) return false;
          if (newIndent === 0) return chain().resetAttributes(nodeType, 'indent').run();

          return chain().updateAttributes(nodeType, { indent: newIndent }).run();
        },
    };
  },
});
