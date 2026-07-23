import { HeadingLevel } from '../types/heading.type';

export const FONT_SIZE_OPTIONS = [
  { value: '12px', label: '12px' },
  { value: '14px', label: '14px' },
  { value: '16px', label: '16px' },
  { value: '18px', label: '18px' },
  { value: '20px', label: '20px' },
];

export const LINE_HEIGHT_OPTIONS = [
  { value: null, label: 'Default' },
  { value: '1', label: '1' },
  { value: '1.5', label: '1.5' },
  { value: '2', label: '2' },
  { value: '2.5', label: '2.5' },
  { value: '3', label: '3' },
];

export const TEXT_CASE_OPTIONS = [
  { value: 'uppercase', label: 'UPPERCASE' },
  { value: 'lowercase', label: 'lowercase' },
  { value: 'capitalize', label: 'Capitalize' },
];

export interface HeadingOption {
  value: HeadingLevel | null;
  label: string;
  class: string;
}

/**
 * Heading levels offered when `heading` is enabled without an explicit `levels`
 * array — mirrors the Tiptap Heading extension default (1–6).
 */
export const DEFAULT_HEADING_LEVELS: HeadingLevel[] = [1, 2, 3, 4, 5, 6];

/**
 * Build the block-type dropdown options from the editor's configured heading
 * levels, so the toolbar offers exactly the levels the editor can produce: no
 * dead entry for a level the config omits, and no configured level left
 * unreachable. The leading "Normal text" (paragraph) entry is always present.
 * Levels are de-duplicated and sorted ascending; an empty or omitted list falls
 * back to {@link DEFAULT_HEADING_LEVELS}.
 */
export function buildHeadingOptions(levels?: readonly number[]): HeadingOption[] {
  const source = levels && levels.length > 0 ? levels : DEFAULT_HEADING_LEVELS;
  const sorted = [...new Set(source)].sort((a, b) => a - b);
  return [
    { value: null, label: 'Normal text', class: '' },
    ...sorted.map((level) => ({
      value: level as HeadingLevel,
      label: `Heading ${level}`,
      class: `h${level}`,
    })),
  ];
}

export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Align Left', icon: 'format_align_left' },
  { value: 'center', label: 'Align Center', icon: 'format_align_center' },
  { value: 'right', label: 'Align Right', icon: 'format_align_right' },
  { value: 'justify', label: 'Align Justify', icon: 'format_align_justify' },
];
