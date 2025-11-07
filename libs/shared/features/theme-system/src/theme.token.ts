import { InjectionToken } from '@angular/core';
import { ThemeDefinition } from './theme.type';

export const THEME_SYSTEM_INITIAL_THEMES = new InjectionToken<Omit<ThemeDefinition, 'category'>[]>(
  'THEME_SYSTEM_INITIAL_THEMES',
);
