import { Injectable, signal } from '@angular/core';
import { SYSTEM_THEMES } from './theme.constant';
import { THEME_SYSTEM_ERROR } from './theme.error';
import { ThemeDefinition } from './theme.type';

@Injectable({
  providedIn: 'root',
})
export class ThemeRegistryService {
  private readonly CUSTOM_THEMES_KEY = 'notum-custom-themes';

  private readonly _systemThemes = signal<ThemeDefinition[]>(SYSTEM_THEMES);
  private readonly _customThemes = signal<ThemeDefinition[]>([]);

  public readonly systemThemes = this._systemThemes.asReadonly();
  public readonly customThemes = this._customThemes.asReadonly();

  constructor() {
    this.loadCustomThemes();
  }

  /**
   * Get all available themes
   */
  getAllThemes(): ThemeDefinition[] {
    return [...this._systemThemes(), ...this._customThemes()];
  }

  /**
   * Get theme by ID
   */
  getTheme(id: string): ThemeDefinition | undefined {
    return this.getAllThemes().find((theme) => theme.id === id);
  }

  /**
   * Register a new custom theme
   */
  registerTheme(theme: Omit<ThemeDefinition, 'category'>): void {
    const existingThemes = this._customThemes();
    const themeIndex = existingThemes.findIndex((t) => t.id === theme.id);

    const newTheme: ThemeDefinition = { ...theme, category: 'custom' };

    // Update Theme
    if (themeIndex >= 0) {
      const updatedThemes = [...existingThemes];
      updatedThemes[themeIndex] = newTheme;
      this._customThemes.set(updatedThemes);
    } else {
      this._customThemes.set([...existingThemes, newTheme]);
    }

    this.saveCustomThemes();
  }

  /**
   * Register multiple system themes (for library consumers)
   */
  registerSystemThemes(themes: Omit<ThemeDefinition, 'category'>[]): void {
    const systemThemes = themes.map((theme) => ({ ...theme, category: 'system' as const }));
    this._systemThemes.set([...this._systemThemes(), ...systemThemes]);
  }

  /**
   * Unregister a custom theme
   */
  unregisterTheme(id: string): boolean {
    const existingThemes = this._customThemes();
    const filteredThemes = existingThemes.filter((theme) => theme.id !== id);

    if (filteredThemes.length !== existingThemes.length) {
      this._customThemes.set(filteredThemes);
      this.saveCustomThemes();
      return true;
    }

    return false;
  }

  /**
   * Clear all custom themes
   */
  clearCustomThemes(): void {
    this._customThemes.set([]);
    this.saveCustomThemes();
  }

  /**
   * Check if theme exists
   */
  hasTheme(id: string): boolean {
    return this.getAllThemes().some((theme) => theme.id === id);
  }

  /**
   * Get themes by category
   */
  getThemesByCategory(category: 'system' | 'custom'): ThemeDefinition[] {
    return this.getAllThemes().filter((theme) => theme.category === category);
  }

  private loadCustomThemes(): void {
    try {
      const saved = localStorage.getItem(this.CUSTOM_THEMES_KEY);
      if (!saved) return;

      const themes = JSON.parse(saved) as ThemeDefinition[];
      this._customThemes.set(themes.filter((theme) => theme.category === 'custom'));
    } catch (error) {
      console.warn(THEME_SYSTEM_ERROR.CUSTOM_THEMES_NOT_LOADED_FROM_LOCAL_STORAGE, error);
    }
  }

  private saveCustomThemes(): void {
    try {
      localStorage.setItem(this.CUSTOM_THEMES_KEY, JSON.stringify(this._customThemes()));
    } catch (error) {
      console.warn(THEME_SYSTEM_ERROR.CUSTOM_THEMES_NOT_SAVED_TO_LOCAL_STORAGE, error);
    }
  }
}
