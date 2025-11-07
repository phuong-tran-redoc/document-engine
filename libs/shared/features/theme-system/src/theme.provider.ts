import { inject, Provider, provideEnvironmentInitializer, type EnvironmentProviders } from '@angular/core';
import { ThemeRegistryService } from './theme-registry.service';
import { ThemeService } from './theme.service';
import { THEME_SYSTEM_INITIAL_THEMES } from './theme.token';
import { ThemeDefinition, ThemeSystemConfig } from './theme.type';

/**
 * Provide the theme system with configuration
 */
export function provideThemeSystem(config?: Partial<ThemeSystemConfig>): Array<Provider | EnvironmentProviders> {
  return [
    ThemeRegistryService,
    provideEnvironmentInitializer(() => {
      const service = inject(ThemeService);
      if (config) service.configure(config);
    }),
  ];
}

/**
 * Provide theme system with predefined themes
 */
export function provideThemeSystemWithThemes(
  themes: Omit<ThemeDefinition, 'category'>[],
  config?: Partial<ThemeSystemConfig>,
): Array<Provider | EnvironmentProviders> {
  return [
    ...provideThemeSystem(config),
    { provide: THEME_SYSTEM_INITIAL_THEMES, useValue: themes },
    provideEnvironmentInitializer(() => {
      const service = inject(ThemeService);
      service.registerSystemThemes(themes);
    }),
  ];
}
