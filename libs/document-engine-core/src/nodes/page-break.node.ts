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

  // addNodeView() {
  //   return createPageBreakNodeView;
  // },

  parseHTML() {
    return [
      // ----------------------------------------------------------
      // RULE 1: Standard Tiptap Format (Ưu tiên cao nhất)
      // ----------------------------------------------------------
      { tag: 'div[data-page-break]' },

      // ----------------------------------------------------------
      // RULE 2: CKEditor Format (Ưu tiên thấp nhất)
      // ----------------------------------------------------------
      { tag: 'div.page-break' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-page-break': 'true',
        class: 'document-engine-page-break',
        style: 'break-before: page; page-break-before: always;',
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
