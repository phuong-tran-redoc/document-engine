import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeDefinition, ThemeMode, ThemeService } from '@shared/features/theme-system';

export type ThemeToggleVariant = 'icon' | 'menu' | 'select' | 'segmented';

@Component({
  selector: 'document-engine-theme-toggle',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonToggleModule,
  ],
  templateUrl: './theme-toggle.html',
})
export class DocumentEngineThemeToggleComponent {
  @Input() variant: ThemeToggleVariant = 'menu';
  @Input() showCustomThemes = true;
  @Input() showThemeCreator = false;
  @Input() ariaLabel = 'Toggle theme';
  @Input() customIcons: Record<string, string> = {};

  @Output() themeChange = new EventEmitter<ThemeMode>();
  @Output() createTheme = new EventEmitter<void>();

  readonly themeService = inject(ThemeService);

  get customThemes() {
    return this.themeService.customThemes;
  }

  setTheme(mode: ThemeMode): void {
    this.themeService.setThemeMode(mode);
    this.themeChange.emit(mode);
  }

  toggleQuick(): void {
    if (this.variant === 'icon') {
      this.themeService.toggleTheme();
    }
  }

  getThemeIcon(): string {
    const mode = this.themeService.themeMode();
    const effective = this.themeService.effectiveTheme();

    if (this.customIcons[mode]) {
      return this.customIcons[mode];
    }

    if (mode === 'system') {
      return 'settings_brightness';
    }

    if (mode === 'light' || mode === 'dark') {
      return effective === 'dark' ? 'dark_mode' : 'light_mode';
    }

    const theme = this.themeService.getTheme(mode);
    return this.getCustomThemeIcon(theme);
  }

  getCustomThemeIcon(theme: ThemeDefinition | undefined): string {
    if (!theme) return 'palette';

    if (this.customIcons[theme.id]) {
      return this.customIcons[theme.id];
    }

    const iconMap: Record<string, string> = {
      ocean: 'waves',
      forest: 'park',
      sunset: 'wb_twilight',
      space: 'brightness_2',
      neon: 'electric_bolt',
    };

    return iconMap[theme.id] || 'palette';
  }

  getTooltipText(): string {
    const mode = this.themeService.themeMode();
    const theme = this.themeService.getTheme(mode);

    if (mode === 'system') {
      const effective = this.themeService.effectiveTheme();
      return `System (${effective})`;
    }

    return theme?.name || mode;
  }

  openThemeCreator(): void {
    this.createTheme.emit();
  }
}
