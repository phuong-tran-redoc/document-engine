import { MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

export type ToastType = 'success' | 'danger' | 'warning' | 'normal';

export interface ToastData {
  type: ToastType;
  title?: string;
  message?: string;

  // Configs
  duration?: number;
  horizontalPosition?: MatSnackBarHorizontalPosition;
  verticalPosition?: MatSnackBarVerticalPosition;

  actionLabel?: string;
  actionCallback?: () => void;
}
