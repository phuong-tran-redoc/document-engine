import { TextCaseType } from '@phuong-tran-redoc/document-engine-core';

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

export const HEADING_OPTIONS = [
  { value: null, label: 'Normal text', class: '' },
  { value: 1, label: 'Heading 1', class: 'h1' },
  { value: 2, label: 'Heading 2', class: 'h2' },
  { value: 3, label: 'Heading 3', class: 'h3' },
];

export const TEXT_ALIGN_OPTIONS = [
  { value: 'left', label: 'Align Left', icon: 'format_align_left' },
  { value: 'center', label: 'Align Center', icon: 'format_align_center' },
  { value: 'right', label: 'Align Right', icon: 'format_align_right' },
  { value: 'justify', label: 'Align Justify', icon: 'format_align_justify' },
];
