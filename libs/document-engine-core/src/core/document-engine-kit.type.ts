import { BlockquoteOptions } from '@tiptap/extension-blockquote';
import { BoldOptions } from '@tiptap/extension-bold';
import { CodeOptions } from '@tiptap/extension-code';
import { CodeBlockOptions } from '@tiptap/extension-code-block';
import { HeadingOptions } from '@tiptap/extension-heading';
import { ImageOptions } from '@tiptap/extension-image';
import { ItalicOptions } from '@tiptap/extension-italic';
import { LinkOptions } from '@tiptap/extension-link';
import { StrikeOptions } from '@tiptap/extension-strike';
import { SubscriptExtensionOptions } from '@tiptap/extension-subscript';
import { SuperscriptExtensionOptions } from '@tiptap/extension-superscript';
import { TableKitOptions } from '@tiptap/extension-table';
import { TextAlignOptions } from '@tiptap/extension-text-align';
import { TextStyleKitOptions } from '@tiptap/extension-text-style';
import { UnderlineOptions } from '@tiptap/extension-underline';
import { CharacterCountOptions, PlaceholderOptions, UndoRedoOptions } from '@tiptap/extensions';
import { IndentOptions, RestrictedEditingOptions } from '../extensions';
import { DynamicFieldCategory, DynamicFieldOptions } from '../nodes';

export interface TemplateItem {
  title: string;
  data: string;
  description?: string;
}

/**
 * Định nghĩa cấu hình đầy đủ cho DocumentEngineKit (Factory của bạn).
 * Hầu hết các tùy chọn đều là:
 * - `false` hoặc `undefined`: Để tắt extension.
 * - `true`: Để bật với cài đặt mặc định.
 * - `object`: Để bật và cung cấp cấu hình tùy chỉnh.
 */
export interface DocumentEngineConfig {
  // ============================================
  // History
  // ============================================
  /**
   * If set to false, the undo-redo extension will not be registered
   * @example undoRedo: false
   */
  undoRedo: Partial<UndoRedoOptions> | boolean;

  // ============================================
  // Basic Inline
  // ============================================
  /**
   * If set to false, the bold extension will not be registered
   * @example bold: false
   */
  bold: Partial<BoldOptions> | boolean;

  /**
   * If set to false, the italic extension will not be registered
   * @example italic: false
   */
  italic: Partial<ItalicOptions> | boolean;

  /**
   * If set to false, the underline extension will not be registered
   * @example underline: false
   */
  underline: Partial<UnderlineOptions> | boolean;

  /**
   * If set to false, the strike extension will not be registered
   * @example strike: false
   */
  strike: Partial<StrikeOptions> | boolean;

  // ============================================
  // Advanced Inline
  // ============================================
  /**
   * Cấu hình cho @tiptap/extension-subscript
   * @default false
   */
  subscript?: Partial<SubscriptExtensionOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-superscript
   * @default false
   */
  superscript?: Partial<SuperscriptExtensionOptions> | boolean;

  /**
   * If set to false, the code extension will not be registered
   * @example code: false
   */
  code: Partial<CodeOptions> | boolean;

  /**
   * If set to false, the link extension will not be registered
   * @example link: false
   */
  link: Partial<LinkOptions> | boolean;

  // ============================================
  // Text Property
  // ============================================
  /**
   * Cấu hình cho NotumHeading (custom, thay thế cho heading gốc)
   * @default {}
   */
  heading?: Partial<HeadingOptions> | boolean;

  /**
   * Hiển thị Font Size trong toolbar
   * @default true
   */
  fontSize?: boolean;

  /**
   * Hiển thị Line Height trong toolbar
   * @default true
   */
  lineHeight?: boolean;

  /**
   * Cấu hình cho TextCase (custom)
   * @default true
   */
  textCase?: boolean;

  // ============================================
  // Alignment & Layout
  // ============================================
  /**
   * Cấu hình cho @tiptap/extension-text-align
   * @default { types: ['paragraph', 'heading'] }
   */
  textAlign?: Partial<TextAlignOptions> | boolean;

  /**
   * Cấu hình cho Indent (custom)
   * @default {}
   */
  indent?: Partial<IndentOptions> | boolean;

  /**
   * If set to false, the list extension will not be registered
   * @example list: false
   */
  list: boolean;

  // ============================================
  // Format Utilities
  // ============================================
  /**
   * Cấu hình cho @tiptap/extension-text-style (TextStyleKit)
   * @default false
   */
  textStyleKit?: Partial<TextStyleKitOptions> | boolean;

  /**
   * Cấu hình cho ResetFormat (custom)
   * @default false
   */
  resetFormat?: boolean;

  // ============================================
  // Block Types
  // ============================================
  /**
   * If set to false, the codeBlock extension will not be registered
   * @example codeBlock: false
   */
  codeBlock: Partial<CodeBlockOptions> | boolean;

  /**
   * If set to false, the blockquote extension will not be registered
   * @example blockquote: false
   */
  blockquote: Partial<BlockquoteOptions> | boolean;

  // ============================================
  // Insert Object
  // ============================================
  /**
   * Cấu hình cho @tiptap/extension-image
   * @default {}
   */
  image?: Partial<ImageOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-table (StyledTableKit)
   * @default false
   */
  tables?: Partial<TableKitOptions> | boolean;

  /**
   * Cấu hình cho Special Characters (custom)
   * @default false
   */
  specialCharacters?: boolean;

  /**
   * Cấu hình cho PageBreak (custom)
   * @default true
   */
  pageBreak?: boolean;

  /**
   * Cấu hình cho @tiptap/extension-placeholder
   * @default { placeholder: 'Type something...' }
   */
  placeholder?: Partial<PlaceholderOptions> | boolean;

  // ============================================
  // Business Features
  // ============================================
  /**
   * Danh sách templates
   * Được sử dụng để hiển thị trong bubble menu
   */
  templates?: TemplateItem[];

  /**
   * Cấu hình cho DynamicField (custom)
   * @default true
   */
  dynamicField?: Partial<DynamicFieldOptions> | boolean;

  /**
   * Danh sách categories cho dynamic fields
   * Được sử dụng để hiển thị trong bubble menu
   */
  dynamicFieldsCategories?: DynamicFieldCategory[];

  /**
   * Cấu hình cho RestrictedEditing (custom)
   * @default { initialMode: 'standard' }
   */
  restrictedEditing?: Partial<RestrictedEditingOptions> | boolean;

  // ============================================
  // Actions
  // ============================================
  /**
   * Cấu hình cho ClearContent (custom)
   * @default true
   */
  clearContent?: boolean;

  /**
   * Cấu hình cho Markdown download (toolbar feature)
   * @default true
   */
  markdown?: boolean;

  // ============================================
  // UI Components
  // ============================================
  /**
   * Hiển thị toolbar
   * @default true
   */
  showToolbar?: boolean;

  /**
   * Cho phép chỉnh sửa editor
   * @default true
   */
  editable?: boolean;

  /**
   * Hiển thị footer (chứa character count và các component khác)
   * @default false
   */
  showFooter?: boolean;

  /**
   * Cấu hình cho @tiptap/extension-character-count
   * Footer phải được bật để hiển thị character count
   * @default false (Thường được bật/tắt bởi client)
   */
  characterCount?: Partial<CharacterCountOptions> | boolean;
}
