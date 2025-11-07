import { Provider } from '@angular/core';
import { MatSnackBarConfig } from '@angular/material/snack-bar';
import { DEFAULT_SNACKBAR_CONFIG } from './toast.constant';
import { ToastService } from './toast.service';
import { TOAST_CONFIG } from './toast.token';

export function provideToast(config: Partial<MatSnackBarConfig> = {}): Provider[] {
  const merged: MatSnackBarConfig = {
    ...DEFAULT_SNACKBAR_CONFIG,
    ...config,
  };
  return [{ provide: TOAST_CONFIG, useValue: merged }, ToastService];
}
