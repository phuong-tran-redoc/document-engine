import { Extension } from '@tiptap/core';

/*
 * Clear:
 * - textStyle mark
 * - indent attribute
 */

// Clears formats on Enter so the new line has default formats
export const ResetOnEnter = Extension.create({
  name: 'resetOnEnter',

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        const disabledNodes = ['listItem', 'blockquote'];
        if (disabledNodes.some((type) => this.editor.isActive(type))) {
          return false; //Let the default Enter behavior proceed
        }

        // Handle Enter ourselves so we can both clear marks and reset indent on the new line
        return this.editor
          .chain()
          .focus()
          .unsetAllMarks()
          .splitBlock({ keepMarks: false })
          .command(({ state, commands }) => {
            const parent = state.selection.$head.parent;
            const nodeType = parent.type;
            const typesToReset = ['paragraph', 'heading'];

            if (typesToReset.includes(nodeType.name)) {
              return commands.resetAttributes(nodeType, 'indent');
            }

            return true;
          })
          .run();
      },
    };
  },
});
