import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { ToastIconPipe } from './toast.pipe';
import { ToastData } from './toast.type';

@Component({
  selector: 'document-engine-toast-content',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ToastIconPipe],
  template: `
    <div class="flex items-center gap-3">
      <mat-icon class="mt-0.5">{{ data.type | toastIcon }}</mat-icon>
      <div class="flex-1 min-w-0">
        @if (data.title) {
        <div class="font-medium">{{ data.title }}</div>
        } @if (data.message) {
        <div class="">{{ data.message }}</div>
        }
      </div>
      <div class="flex items-center gap-2">
        @if (data.actionLabel && data.actionCallback) {
        <button mat-button color="primary" (click)="executeAction()">{{ data.actionLabel }}</button>
        }
        <button matIconButton (click)="dismiss()"><mat-icon>close</mat-icon></button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContentComponent {
  data: ToastData = inject(MAT_SNACK_BAR_DATA);
  snackRef = inject(MatSnackBarRef<ToastContentComponent>);

  dismiss(): void {
    this.snackRef.dismiss();
  }

  executeAction(): void {
    this.dismiss();
    this.data.actionCallback?.();
  }
}
