export type BreadcrumbItemType = 'link' | 'button' | 'text';

export interface BreadcrumbItem {
  label: string;
  type?: BreadcrumbItemType;
  url?: string;
  icon?: string;
  disabled?: boolean;
  callback?: () => void;
}

export type BreadcrumbSeparator = 'chevron' | 'slash' | 'arrow' | 'dot' | string;
