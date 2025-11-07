import { Extension } from '@tiptap/core';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    resetFormat: {
      resetFormat: () => ReturnType;
    };
  }
}

export const ResetFormat = Extension.create({
  name: 'resetFormat',

  addCommands() {
    return {
      resetFormat:
        () =>
        ({ chain }) =>
          chain().focus().unsetAllMarks().clearNodes().run(),
    };
  },
});
