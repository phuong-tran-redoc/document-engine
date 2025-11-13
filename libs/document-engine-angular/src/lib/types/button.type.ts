export type ButtonType = 'icon-button' | 'select-button';

export type SelectOption = {
  value: string;
  label: string;
};

export type IconButton = {
  type: 'icon-button';
  id: string;
  icon: string;
  label?: string;
  callback: () => void;
};

export type SelectButton = {
  type: 'select-button';
  id: string;
  label: string;
  options: SelectOption[];
  callback: () => void;
};

export type ToolbarButton = IconButton | SelectButton;
