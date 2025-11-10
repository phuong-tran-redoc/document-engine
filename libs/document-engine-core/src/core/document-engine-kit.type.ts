import { ImageOptions } from '@tiptap/extension-image';
import { SubscriptExtensionOptions } from '@tiptap/extension-subscript';
import { SuperscriptExtensionOptions } from '@tiptap/extension-superscript';
import { TableKitOptions } from '@tiptap/extension-table';
import { TextAlignOptions } from '@tiptap/extension-text-align';
import { TextStyleKitOptions } from '@tiptap/extension-text-style';
import { CharacterCountOptions, PlaceholderOptions } from '@tiptap/extensions';
import { StarterKitOptions } from '@tiptap/starter-kit';
import { CustomOrderedListOptions, IndentOptions, RestrictedEditingOptions } from '../extensions';
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
  /**
   * Cấu hình cho StarterKit.
   * @default {
   * ```ts
   *  link: {
   *    openOnClick: false,
   *    defaultProtocol: 'https',
   *    enableClickSelection: true,
   *    shouldAutoLink: (url) =>
   *      url.startsWith('http://') || url.startsWith('https://') || url.startsWith('mailto:') || url.startsWith('tel:'),
   *  },
   *  heading: false,
   *  orderedList: false,
   * }
   * ```
   */
  starterKit?: Partial<StarterKitOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-text-style (TextStyleKit)
   * @default true
   */
  textStyleKit?: Partial<TextStyleKitOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-table (StyledTableKit)
   * @default { table: { resizable: true } }
   */
  tables?: Partial<TableKitOptions> | boolean;

  /**
   * Hiển thị footer (chứa character count và các component khác)
   * @default true
   */
  showFooter?: boolean;

  /**
   * Cấu hình cho @tiptap/extension-character-count
   * Footer phải được bật để hiển thị character count
   * @default false (Thường được bật/tắt bởi client)
   */
  characterCount?: Partial<CharacterCountOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-subscript
   * @default true
   */
  subscript?: Partial<SubscriptExtensionOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-superscript
   * @default true
   */
  superscript?: Partial<SuperscriptExtensionOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-text-align
   * @default { types: ['paragraph', 'heading'] }
   */
  textAlign?: Partial<TextAlignOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-image
   * @default {}
   */
  image?: Partial<ImageOptions> | boolean;

  /**
   * Cấu hình cho @tiptap/extension-placeholder
   * @default { placeholder: 'Type something...' }
   */
  placeholder?: Partial<PlaceholderOptions> | boolean;

  // --- Custom Extensions ---

  /**
   * Cấu hình cho PageBreak (custom)
   * @default true
   */
  pageBreak?: boolean;

  /**
   * Cấu hình cho ResetFormat (custom)
   * @default true
   */
  resetFormat?: boolean;

  /**
   * Cấu hình cho ResetOnEnter (custom)
   * @default true
   */
  resetOnEnter?: boolean;

  /**
   * Cấu hình cho Indent (custom)
   * @default {}
   */
  indent?: Partial<IndentOptions> | boolean;

  /**
   * Cấu hình cho ClearContent (custom)
   * @default true
   */
  clearContent?: boolean;

  /**
   * Cấu hình cho TextCase (custom)
   * @default true
   */
  textCase?: boolean;

  /**
   * Cấu hình cho NotumHeading (custom, thay thế cho heading gốc)
   * @default {}
   */
  heading?: boolean;

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
   * Danh sách templates
   * Được sử dụng để hiển thị trong bubble menu
   */
  templates?: TemplateItem[];

  /**
   * Cấu hình cho CustomOrderedList (custom, thay thế cho list gốc)
   * @default {}
   */
  orderedList?: Partial<CustomOrderedListOptions> | boolean;

  /**
   * Cấu hình cho RestrictedEditing (custom)
   * @default { initialMode: 'standard' }
   */
  restrictedEditing?: Partial<RestrictedEditingOptions> | boolean;

  /**
   * Cấu hình cho Markdown download (toolbar feature)
   * @default true
   */
  markdown?: boolean;

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
}
