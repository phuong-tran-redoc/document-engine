import { DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { ThemeRegistryService } from './theme-registry.service';
import { DEFAULT_THEME_MODE, DEFAULT_THEME_STORAGE_KEY, DEFAULT_THEME_TRANSITION_DURATION } from './theme.constant';
import { THEME_SYSTEM_ERROR } from './theme.error';
import { ThemeChangeEvent, ThemeDefinition, ThemeMode, ThemeModeDefault, ThemeSystemConfig } from './theme.type';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly window = this.document.defaultView;
  private readonly themeRegistry = inject(ThemeRegistryService);

  private config: Required<ThemeSystemConfig> = {
    storageKey: DEFAULT_THEME_STORAGE_KEY,
    enableAnalytics: false,
    enableSystemDetection: true,
    enableCustomThemes: true,
    defaultTheme: DEFAULT_THEME_MODE,
    transitionDuration: DEFAULT_THEME_TRANSITION_DURATION,
  };

  // Core signals
  private readonly _themeMode = signal<ThemeMode>(DEFAULT_THEME_MODE);
  private readonly _isInitialized = signal<boolean>(false);
  private readonly _effectiveTheme = signal<'light' | 'dark'>('light');
  private readonly _isSystemPrefersDark = signal<boolean>(false);

  // Public readonly signals
  readonly themeMode = this._themeMode.asReadonly();
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly effectiveTheme = this._effectiveTheme.asReadonly();
  readonly systemPrefersDark = this._isSystemPrefersDark.asReadonly();

  // Computed signals
  // readonly availableThemes = signal(() => this.themeRegistry.getAllThemes());
  readonly customThemes = this.themeRegistry.customThemes;

  constructor() {
    this.initializeTheme();
    this.setupSystemListener();
    this.setupThemeEffect();
  }

  /**
   * Configure the theme system
   */
  configure(config: Partial<ThemeSystemConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current theme configuration
   */
  getConfig(): ThemeSystemConfig {
    return { ...this.config };
  }

  /**
   * Get all available themes
   */
  getAllThemes(): ThemeDefinition[] {
    return this.themeRegistry.getAllThemes();
  }

  /**
   * Get theme by ID
   */
  getTheme(id: string): ThemeDefinition | undefined {
    return this.themeRegistry.getTheme(id);
  }

  /**
   * Register a custom theme
   */
  registerTheme(theme: Omit<ThemeDefinition, 'category'>): void {
    if (!this.config.enableCustomThemes) {
      console.warn(THEME_SYSTEM_ERROR.CUSTOM_THEMES_DISABLED);
      return;
    }

    this.themeRegistry.registerTheme(theme);
  }

  /**
   * Register multiple system themes (for library consumers)
   */
  registerSystemThemes(themes: Omit<ThemeDefinition, 'category'>[]): void {
    this.themeRegistry.registerSystemThemes(themes);
  }

  /**
   * Unregister a theme
   */
  unregisterTheme(id: string): boolean {
    const success = this.themeRegistry.unregisterTheme(id);

    // If the current theme is being removed, switch to default
    if (success && this._themeMode() === id) {
      this.setThemeMode(this.config.defaultTheme);
    }

    return success;
  }

  /**
   * Set the theme mode
   */
  setThemeMode(mode: ThemeMode): void {
    // if theme does not exist, do not set the theme
    if (!this.isThemeModeDefault(mode) && !this.themeRegistry.hasTheme(mode)) {
      console.warn(THEME_SYSTEM_ERROR.THEME_NOT_FOUND(mode));
      return;
    }

    const previousTheme = this._themeMode();
    this._themeMode.set(mode);
    this.persistThemePreference(mode);

    // Emit change event if analytics enabled
    if (this.config.enableAnalytics) {
      this.emitThemeChangeEvent(previousTheme, mode);
    }
  }

  /**
   * Toggle between light and dark modes (ignores custom themes)
   */
  toggleTheme(): void {
    const current = this._effectiveTheme();
    this.setThemeMode(current === 'light' ? 'dark' : 'light');
  }

  /**
   * Switch to next available theme
   */
  cycleTheme(): void {
    const allThemes = this.getAllThemes();
    const currentIndex = allThemes.findIndex((theme) => theme.id === this._themeMode());
    const nextIndex = (currentIndex + 1) % allThemes.length;
    this.setThemeMode(allThemes[nextIndex].id);
  }

  /**
   * Check if current theme is dark
   */
  isDarkTheme(): boolean {
    const currentMode = this._themeMode();

    if (currentMode === 'system') {
      return this._isSystemPrefersDark();
    }

    if (currentMode === 'light' || currentMode === 'dark') {
      return currentMode === 'dark';
    }

    const theme = this.getTheme(currentMode);
    return theme?.isDark ?? false;
  }

  /**
   * Get current theme definition
   */
  getCurrentTheme(): ThemeDefinition | null {
    const mode = this._themeMode();
    const derivedMode = mode === 'system' ? this._effectiveTheme() : mode;

    return this.getTheme(derivedMode) || null;
  }

  /**
   * Apply theme to specific element
   */
  applyThemeToElement(element: HTMLElement, themeId: string): void {
    const allThemes = this.getAllThemes().map((t) => t.id);

    // Remove existing theme classes
    element.classList.remove(...allThemes, 'light', 'dark');

    // Add new theme class
    element.classList.add(themeId);

    // Set custom properties
    element.style.setProperty('--notum-theme', themeId);
    element.style.setProperty('--notum-transition-duration', `${this.config.transitionDuration}ms`);
  }

  private isThemeModeDefault(mode: ThemeMode): mode is ThemeModeDefault {
    return mode === 'light' || mode === 'dark' || mode === 'system';
  }

  private updateSystemPreference(): void {
    if (this.window && typeof this.window !== 'undefined' && this.window.matchMedia) {
      const prefersDark = this.window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._isSystemPrefersDark.set(prefersDark);
    }
  }

  private loadThemePreference(): ThemeMode | null {
    try {
      return localStorage.getItem(this.config.storageKey) as ThemeMode;
    } catch {
      return null;
    }
  }

  private initializeTheme(): void {
    // Load saved preference
    const savedTheme = this.loadThemePreference();

    if (savedTheme) {
      this._themeMode.set(savedTheme);
    } else {
      this._themeMode.set(this.config.defaultTheme);
    }

    // Detect initial system preference
    this.updateSystemPreference();
    this._isInitialized.set(true);
  }

  private setupSystemListener(): void {
    if (!this.config.enableSystemDetection) return;

    if (this.window && typeof this.window !== 'undefined' && this.window.matchMedia) {
      const mediaQuery = this.window.matchMedia('(prefers-color-scheme: dark)');

      // Initial value
      this._isSystemPrefersDark.set(mediaQuery.matches);

      // Listen for changes
      mediaQuery.addEventListener('change', (e) => {
        this._isSystemPrefersDark.set(e.matches);
      });
    }
  }

  private applyThemeToDOM(themeClass: string, effectiveTheme: 'light' | 'dark'): void {
    const htmlElement = this.document.documentElement;
    const bodyElement = this.document.body;

    // Remove existing theme classes
    const allThemes = this.getAllThemes().map((t) => t.id);
    htmlElement.classList.remove(...allThemes, 'light', 'dark');
    bodyElement.classList.remove(...allThemes, 'light', 'dark');

    // Add new theme class
    htmlElement.classList.add(themeClass);
    bodyElement.classList.add(themeClass);

    // Set CSS custom properties
    htmlElement.style.setProperty('--notum-theme', themeClass);
    htmlElement.style.setProperty('--notum-effective-theme', effectiveTheme);
    htmlElement.style.setProperty('--notum-transition-duration', `${this.config.transitionDuration}ms`);

    // Add transition classes for smooth theme switching
    htmlElement.style.setProperty(
      'transition',
      `background-color ${this.config.transitionDuration}ms ease-in-out, color ${this.config.transitionDuration}ms ease-in-out`
    );
  }

  private setupThemeEffect(): void {
    // Effect to update effective theme and apply CSS classes
    effect(() => {
      if (!this._isInitialized()) return;

      const mode = this._themeMode();
      const systemPrefersDark = this._isSystemPrefersDark();

      let effectiveTheme: 'light' | 'dark';
      let themeClass = mode;

      if (mode === 'system') {
        effectiveTheme = systemPrefersDark ? 'dark' : 'light';
        themeClass = effectiveTheme;
      } else if (mode === 'light' || mode === 'dark') {
        effectiveTheme = mode;
      } else {
        const theme = this.getTheme(mode);
        effectiveTheme = theme?.isDark ? 'dark' : 'light';
      }

      this._effectiveTheme.set(effectiveTheme);
      this.applyThemeToDOM(themeClass, effectiveTheme);
    });
  }

  private persistThemePreference(mode: ThemeMode): void {
    try {
      localStorage.setItem(this.config.storageKey, mode);
    } catch (error) {
      console.warn(THEME_SYSTEM_ERROR.PERSIST_THEME_PREFERENCE_FAILED, error);
    }
  }

  private emitThemeChangeEvent(previousTheme: ThemeMode, currentTheme: ThemeMode): void {
    const event: ThemeChangeEvent = {
      previousTheme,
      currentTheme,
      effectiveTheme: this._effectiveTheme(),
      timestamp: Date.now(),
    };

    // For analytics integration
    (this.window as any).dispatchEvent(
      new CustomEvent('notum-theme-change', {
        detail: event,
      })
    );
  }
}
