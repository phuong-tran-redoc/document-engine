import { Node, mergeAttributes } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      insertPageBreak: () => ReturnType;
    };
  }
}

export const PageBreak = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  parseHTML() {
    return [{ tag: 'div[data-page-break]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-page-break': 'true',
        class: 'document-engine-page-break',
        style: 'break-before: page;',
      }),
      ['span', { class: 'document-engine-page-break-label' }, 'Page break'],
    ];
  },

  addCommands() {
    return {
      insertPageBreak:
        () =>
        ({ chain }) => {
          return chain().insertContent({ type: this.name }).run();
        },
    };
  },
});
