import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { ToastContentComponent } from './toast-content';
import { DEFAULT_SNACKBAR_CONFIG, TOAST_PANEL_CLASS, TOAST_POSITION } from './toast.constant';
import { TOAST_CONFIG } from './toast.token';
import { ToastData } from './toast.type';

@Injectable()
export class ToastService {
  private snackBar = inject(MatSnackBar);
  private customConfig = inject(TOAST_CONFIG, { optional: true });

  private _normalizeConfig(data: ToastData): MatSnackBarConfig {
    const baseConfig = { ...DEFAULT_SNACKBAR_CONFIG, ...this.customConfig };
    const basePanelClass = (baseConfig.panelClass as string[]) ?? [];
    const typePanelClass = TOAST_PANEL_CLASS[data.type] ?? TOAST_PANEL_CLASS.normal;

    return {
      ...baseConfig,
      duration: data.duration ?? baseConfig.duration,
      horizontalPosition: TOAST_POSITION[data.type] ?? baseConfig.horizontalPosition,
      panelClass: [...basePanelClass, typePanelClass],
      data,
    };
  }

  show(data: ToastData): void {
    const config: MatSnackBarConfig = this._normalizeConfig(data);
    this.snackBar.openFromComponent(ToastContentComponent, config);
  }
}
