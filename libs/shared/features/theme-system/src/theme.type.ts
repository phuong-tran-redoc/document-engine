export type ThemeModeDefault = 'light' | 'dark' | 'system';
export type ThemeMode = ThemeModeDefault | string;

export interface ThemeDefinition {
  id: string;
  name: string;
  description?: string;
  isDark: boolean;
  category: 'system' | 'custom';
  cssClass?: string;
  preview?: {
    primary: string;
    background: string;
    surface: string;
  };
}

export interface ThemeState {
  mode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  systemPrefersDark: boolean;
  availableThemes: ThemeDefinition[];
  customThemes: ThemeDefinition[];
}

export interface ThemeChangeEvent {
  previousTheme: ThemeMode;
  currentTheme: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  timestamp: number;
}

export interface ThemeSystemConfig {
  storageKey?: string;
  enableAnalytics?: boolean;
  enableSystemDetection?: boolean;
  enableCustomThemes?: boolean;
  defaultTheme?: ThemeMode;
  transitionDuration?: number;
}
