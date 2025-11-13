import { Heading } from '@tiptap/extension-heading';
import {} from '@tiptap/extension-paragraph';

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
