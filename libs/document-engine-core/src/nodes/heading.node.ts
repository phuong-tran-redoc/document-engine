import { Heading } from '@tiptap/extension-heading';
import type {} from '@tiptap/starter-kit';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    removeHeading: {
      removeHeading: () => ReturnType;
    };
  }
}

export const NotumHeading = Heading.extend({
  addCommands() {
    return {
      ...this.parent?.(),

      removeHeading:
        () =>
        ({ editor, chain }) => {
          if (!editor.isActive('heading')) return false;

          return chain().setParagraph().run();
        },
    };
  },
});
