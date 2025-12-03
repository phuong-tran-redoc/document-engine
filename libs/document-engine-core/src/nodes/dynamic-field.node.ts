import { Node, mergeAttributes } from '@tiptap/core';

/**
 * Interface for Dynamic Field node attributes
 */
export interface DynamicFieldAttributes {
  fieldId: string;
  label: string;
}

/**
 * Interface for Dynamic Field item
 */
export interface DynamicFieldItem {
  id: string;
  label: string;
  description?: string;
}

/**
 * Interface for Dynamic Field category
 */
export interface DynamicFieldCategory {
  key: string;
  label: string;
  description?: string;
  fields: DynamicFieldItem[];
}

/**
 * Interface for Dynamic Field options
 */
export interface DynamicFieldOptions {
  HTMLAttributes: Record<string, unknown>;
}

/**
 * TypeScript declaration for the insertDynamicField command
 */
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    dynamicField: {
      insertDynamicField: (attributes: DynamicFieldAttributes) => ReturnType;
    };
  }
}

/**
 * Dynamic Field Node Extension
 *
 * This extension creates atomic, non-editable inline nodes that represent
 * dynamic fields (e.g., {{customer_name}}) in document templates.
 * These fields can be programmatically replaced with actual data later.
 */
export const DynamicField = Node.create<DynamicFieldOptions>({
  name: 'dynamicField',

  /**
   * Node group configuration
   * - 'inline': Makes the node behave as inline content
   * - 'atom': true is critical for non-editable, atomic behavior
   * - 'selectable': true allows users to select the entire node
   * - 'draggable': false prevents users from dragging the node
   */
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,
  draggable: false,

  /**
   * Define the attributes that this node can store
   */
  addAttributes() {
    return {
      fieldId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-field-id'),
        renderHTML: (attributes) => {
          if (!attributes['fieldId']) return {};

          return {
            'data-field-id': attributes['fieldId'],
          };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-label'),
        renderHTML: (attributes) => {
          if (!attributes['label']) return {};

          return {
            'data-label': attributes['label'],
          };
        },
      },
    };
  },

  /**
   * Parse HTML to recognize dynamic field spans when loading/pasting content
   */
  parseHTML() {
    return [
      // ----------------------------------------------------------
      // RULE 1: Standard Tiptap Format (Ưu tiên cao nhất)
      // ----------------------------------------------------------
      { tag: 'span[data-field-id]' },

      // ----------------------------------------------------------
      // RULE 2: Legacy CKEditor Format (Migration Layer)
      // ----------------------------------------------------------
      {
        // Selector CSS để nhận diện node của CKEditor
        tag: 'span.red-dynamic-field',

        // Hàm này chạy khi Tiptap tìm thấy tag trên
        getAttrs: (node) => {
          if (typeof node === 'string') return false;
          const element = node as HTMLElement;

          // 1. Trích xuất ID từ nội dung text: "{{ref}}" -> "ref"
          const rawText = element.innerText || element.textContent || '';
          // Regex để xóa dấu {{ và }} và khoảng trắng thừa
          const id = rawText.replace(/{{|}}/g, '').trim();

          // 2. Trích xuất Label từ attribute cũ
          // CKEditor dùng 'value', 'dynamicfieldname' hoặc 'name'
          const label =
            element.getAttribute('value') ||
            element.getAttribute('dynamicfieldname') ||
            element.getAttribute('name') ||
            id; // Fallback nếu không tìm thấy label

          // Trả về object khớp với cấu trúc 'addAttributes' ở trên
          return {
            fieldId: id,
            label: label,
          };
        },
      },
    ];
  },

  /**
   * Render the node as HTML
   * Creates a span element with Tailwind classes for styling
   * and stores attributes in data-* attributes for robustness
   */
  renderHTML({ HTMLAttributes, node }) {
    const { fieldId, label } = node.attrs as DynamicFieldAttributes;

    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        class: 'dynamic-field red-dynamic-field',
        'data-field-id': fieldId,
        'data-label': label,
      }),
      // label || '',
      fieldId ? `{{${fieldId}}}` : '',
    ];
  },

  /**
   * NODE VIEW: Đây là phần giúp hiển thị giao diện giống CKEditor Widget
   * Thay vì render ra text thuần, ta render ra một DOM element được style sẵn
   */
  addNodeView() {
    return ({ node }) => {
      // 1. Tạo thẻ bao bọc (Wrapper)
      const dom = document.createElement('span');

      // 2. Thêm class để style (Dùng Tailwind như techstack của bạn )
      // Bạn có thể thêm class 'ck-widget' nếu muốn dùng lại CSS cũ
      dom.classList.add('dynamic-field', 'red-dynamic-field');

      // 3. Gán dữ liệu label vào nội dung hiển thị
      const { label, fieldId } = node.attrs as DynamicFieldAttributes;
      dom.textContent = label || fieldId || 'Unknown Field';

      return { dom };
    };
  },

  /**
   * Add custom commands for inserting dynamic fields
   */
  addCommands() {
    return {
      insertDynamicField:
        (attributes: DynamicFieldAttributes) =>
        ({ chain }) => {
          if (!attributes.fieldId || !attributes.label) {
            console.error('[DynamicField] Both fieldId and label are required.');
            return false;
          }

          return chain().insertContent({ type: this.name, attrs: attributes }).run();
        },
    };
  },

  /**
   * Default options
   */
  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },
});
