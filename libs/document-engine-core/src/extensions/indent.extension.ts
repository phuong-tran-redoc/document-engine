import { Extension } from '@tiptap/core';
import { INDENT_DEFAULT } from '../constants';
import { absoluteLengthToPx } from '../internal/css-length';

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
              const marginLeft = element.style.marginLeft;
              if (!marginLeft) return 0;
              // Content pasted from Word / CKEditor often indents in pt or cm. Relative values (`em`, `%`)
              // cannot be expressed in px and are left unset.
              const px = absoluteLengthToPx(marginLeft);
              return px === null ? null : Math.round(px * 100) / 100;
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
