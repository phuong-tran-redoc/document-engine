import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    clear: {
      clear: () => ReturnType;
    };
  }
}

export const ClearContent = Extension.create({
  name: 'clearContent',

  addCommands() {
    return {
      clear:
        () =>
        ({ chain }) =>
          chain().focus().clearContent().run(),
    };
  },
});
