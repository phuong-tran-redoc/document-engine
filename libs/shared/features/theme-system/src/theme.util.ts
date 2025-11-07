import { ThemeDefinition } from './theme.type';

/**
 * Utility functions for theme manipulation
 */
export class ThemeUtils {
  /**
   * Calculate luminance of a color
   */
  static calculateLuminance(color: string): number {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Determine if a color is considered dark
   */
  static isDarkColor(color: string): boolean {
    return this.calculateLuminance(color) < 0.5;
  }

  /**
   * Generate CSS custom properties for a theme
   */
  static generateThemeProperties(theme: {
    primary: string;
    accent: string;
    warn: string;
    background: string;
    surface: string;
    textPrimary?: string;
    textSecondary?: string;
  }): Record<string, string> {
    const isDark = this.isDarkColor(theme.background);

    return {
      '--color-theme-primary': theme.primary,
      '--color-theme-primary-contrast': isDark ? '#000000' : '#ffffff',
      '--color-theme-accent': theme.accent,
      '--color-theme-accent-contrast': isDark ? '#000000' : '#ffffff',
      '--color-theme-warn': theme.warn,
      '--color-theme-warn-contrast': isDark ? '#000000' : '#ffffff',
      '--color-theme-background': theme.background,
      '--color-theme-surface': theme.surface,
      '--color-theme-text-primary': theme.textPrimary || (isDark ? '#ffffff' : '#000000'),
      '--color-theme-text-secondary': theme.textSecondary || (isDark ? '#b0b0b0' : '#757575'),
    };
  }

  /**
   * Inject CSS custom properties into the document
   */
  static injectThemeProperties(themeId: string, properties: Record<string, string>): void {
    const existingStyle = document.querySelector(`#theme-${themeId}`);
    if (existingStyle) {
      existingStyle.remove();
    }

    const style = document.createElement('style');
    style.id = `theme-${themeId}`;

    const cssRules = Object.entries(properties)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n');

    style.textContent = `.${themeId} {\n${cssRules}\n}`;
    document.head.appendChild(style);
  }

  /**
   * Create a dynamic theme from color palette
   */
  static createDynamicTheme(
    id: string,
    name: string,
    colors: {
      primary: string;
      accent: string;
      warn: string;
      background: string;
      surface: string;
    }
  ): ThemeDefinition {
    const properties = this.generateThemeProperties(colors);
    this.injectThemeProperties(id, properties);

    return {
      id,
      name,
      isDark: this.isDarkColor(colors.background),
      category: 'custom',
      preview: {
        primary: colors.primary,
        background: colors.background,
        surface: colors.surface,
      },
    };
  }

  /**
   * Convert theme to CSS variables object
   */
  static themeToVariables(theme: ThemeDefinition): Record<string, string> {
    if (!theme.preview) {
      return {};
    }

    return this.generateThemeProperties({
      primary: theme.preview.primary,
      accent: theme.preview.primary, // Use primary as accent fallback
      warn: '#f44336', // Default warn color
      background: theme.preview.background,
      surface: theme.preview.surface,
    });
  }

  /**
   * Validate theme definition
   */
  static validateTheme(theme: Partial<ThemeDefinition>): string[] {
    const errors: string[] = [];

    if (!theme.id) {
      errors.push('Theme ID is required');
    } else if (!/^[a-z0-9-_]+$/.test(theme.id)) {
      errors.push('Theme ID must contain only lowercase letters, numbers, hyphens, and underscores');
    }

    if (!theme.name) {
      errors.push('Theme name is required');
    }

    if (typeof theme.isDark !== 'boolean') {
      errors.push('isDark property must be a boolean');
    }

    return errors;
  }

  /**
   * Generate accessibility-compliant contrast ratios
   */
  static ensureContrast(backgroundColor: string, textColor: string, minRatio = 4.5): string {
    const bgLuminance = this.calculateLuminance(backgroundColor);
    const textLuminance = this.calculateLuminance(textColor);

    const contrast = (Math.max(bgLuminance, textLuminance) + 0.05) / (Math.min(bgLuminance, textLuminance) + 0.05);

    if (contrast >= minRatio) {
      return textColor;
    }

    // Adjust text color for better contrast
    return bgLuminance > 0.5 ? '#000000' : '#ffffff';
  }
}
