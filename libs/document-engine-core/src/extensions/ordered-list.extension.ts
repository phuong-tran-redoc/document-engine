import { OrderedList } from '@tiptap/extension-list';
import { ListStyleType } from '../types';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    customOrderedList: {
      toggleOrderedList: () => ReturnType;
      setListStyle: (listStyleType: ListStyleType) => ReturnType;
    };
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
        parseHTML: (element) => {
          // Priority 1: Parse from data-list-style-type attribute (our format)
          const dataAttr = element.getAttribute('data-list-style-type');
          if (dataAttr) return dataAttr;

          // Priority 2: Parse from CSS list-style-type property (other editors' format)
          const styleAttr = element.style.listStyleType;
          if (styleAttr) return styleAttr;

          // Default fallback
          return this.options.listStyleType;
        },
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
