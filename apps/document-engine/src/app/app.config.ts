import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { THIRD_PARTY_PROVIDER } from '@document-engine/util';
import { provideBreadcrumb } from '@shared/ui/breadcrumb';
import { provideConfirmationDialog } from '@shared/ui/confirmation-dialog';
import { provideSidebar } from '@shared/ui/sidebar';
import { provideToast } from '@shared/ui/toast';
import { appRoutes } from './app.routes';
import { ICONS } from './icon.constant';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),

    // Shared Features
    // provideThemeSystem(),
    provideSidebar(),
    provideBreadcrumb({ showHomeIcon: false }),
    provideToast({ horizontalPosition: 'right', verticalPosition: 'bottom' }),
    provideConfirmationDialog(),

    // Third Party Providers
    ...THIRD_PARTY_PROVIDER,

    provideAppInitializer(() => {
      const initializerFn = ((iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) => () => {
        const defaultFontSetClasses = iconRegistry.getDefaultFontSetClass();
        const outlinedFontSetClasses = defaultFontSetClasses
          .filter((fontSetClass) => fontSetClass !== 'material-icons')
          .concat(['material-symbols-outlined']);

        iconRegistry.setDefaultFontSetClass(...outlinedFontSetClasses);

        // Register custom SVG icons served from the app's public folders
        // Usage: <mat-icon svgIcon="favorite"></mat-icon>
        ICONS.forEach((icon) => iconRegistry.addSvgIcon(icon.key, sanitizer.bypassSecurityTrustResourceUrl(icon.path)));
      })(inject(MatIconRegistry), inject(DomSanitizer));

      return initializerFn();
    }),
  ],
};
