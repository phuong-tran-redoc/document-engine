import { OrderedList } from '@tiptap/extension-list';
import { ListStyleType } from '../types';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customOrderedList: { setListStyle: (listStyleType: ListStyleType) => ReturnType };
  }
}

export interface CustomOrderedListOptions {
  listStyleType?: ListStyleType;
}

export const CustomOrderedList = OrderedList.extend<CustomOrderedListOptions>({
  name: 'customOrderedList',

  addOptions() {
    return {
      ...this.parent?.(),
      listStyleType: 'decimal' as ListStyleType,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),

      'data-list-style-type': {
        default: this.options.listStyleType,
        parseHTML: (element) => element.getAttribute('data-list-style-type') || this.options.listStyleType,
        renderHTML: (attributes) => {
          const styleType = attributes['data-list-style-type'] as ListStyleType;
          if (!styleType || styleType === 'decimal') return { 'data-list-style-type': 'decimal' };

          return { 'data-list-style-type': attributes['data-list-style-type'] };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setListStyle:
        (listStyleType: ListStyleType) =>
        ({ chain }) => {
          return chain().focus().updateAttributes('customOrderedList', { 'data-list-style-type': listStyleType }).run();
        },
    };
  },
});
