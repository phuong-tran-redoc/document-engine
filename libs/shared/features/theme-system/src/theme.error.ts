export const THEME_SYSTEM_ERROR = {
  CUSTOM_THEMES_NOT_LOADED_FROM_LOCAL_STORAGE: 'Custom themes not loaded from localStorage',
  CUSTOM_THEMES_NOT_SAVED_TO_LOCAL_STORAGE: 'Custom themes not saved to localStorage',
  CUSTOM_THEMES_DISABLED: 'Custom themes are disabled in configuration',

  PERSIST_THEME_PREFERENCE_FAILED: 'Failed to persist theme preference',

  THEME_NOT_FOUND: (themeId: string) => `Theme '${themeId}' not found. Using default theme.`,
};
