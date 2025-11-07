import { InjectionToken } from '@angular/core';
import { MatSnackBarConfig } from '@angular/material/snack-bar';

export const TOAST_CONFIG = new InjectionToken<MatSnackBarConfig>('TOAST_CONFIG');
