import { MatSnackBarConfig, MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { ToastType } from './toast.type';

export const TOAST_POSITION: { [c in ToastType]: MatSnackBarHorizontalPosition } = {
  success: 'right',
  danger: 'right',
  warning: 'right',
  normal: 'right',
};

export const TOAST_PANEL_CLASS: { [c in ToastType]: string } = {
  success: 'success-toast',
  danger: 'error-toast',
  warning: 'warning-toast',
  normal: 'normal-toast',
};

export const DEFAULT_SNACKBAR_CONFIG: MatSnackBarConfig = {
  duration: 4000,
  horizontalPosition: 'center',
  verticalPosition: 'top',
  panelClass: ['document-engine-toast'],
};
