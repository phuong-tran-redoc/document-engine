import { ThemeDefinition } from './theme.type';

export const SYSTEM_THEMES: ThemeDefinition[] = [
  { id: 'light', name: 'Light', isDark: false, category: 'system' },
  { id: 'dark', name: 'Dark', isDark: true, category: 'system' },
];

export const DEFAULT_THEME_MODE = 'system' as const;
export const DEFAULT_THEME_STORAGE_KEY = 'notum-theme-preference';
export const DEFAULT_THEME_TRANSITION_DURATION = 200;
