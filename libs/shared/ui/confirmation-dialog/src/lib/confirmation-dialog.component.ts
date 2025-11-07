import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AlertDialogData, ConfirmationDialogData, CreatedContentRef } from './confirmation-dialog.types';

@Component({
  selector: 'document-engine-confirmation-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="flex flex-col gap-4 p-6">
      <div class="flex items-center gap-3">
        <div class="shrink-0 rounded-full bg-muted w-10 h-10 grid place-items-center">
          @if (data.icon.startsWith('svg:')) {
          <mat-icon [svgIcon]="data.icon.substring(4)"></mat-icon>
          } @else {
          <mat-icon>{{ data.icon }}</mat-icon>
          }
        </div>
        <div class="flex-1 min-w-0">
          <div class="text-lg font-semibold text-foreground">{{ data.title }}</div>
          <div class="text-muted-foreground mt-1">{{ data.description }}</div>
        </div>
      </div>

      <div #contentHost></div>

      <div class="flex items-center justify-end gap-2 pt-2">
        <button mat-stroked-button (click)="onCancel()">{{ cancelLabel() }}</button>
        <button mat-flat-button color="primary" (click)="onConfirm()">{{ confirmLabel() }}</button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent<TValue = unknown> implements AfterViewInit {
  @ViewChild('contentHost', { read: ViewContainerRef, static: true }) private contentHost!: ViewContainerRef;

  public data = inject<ConfirmationDialogData<TValue>>(MAT_DIALOG_DATA);
  private dialogRef = inject(MatDialogRef<ConfirmationDialogComponent<TValue>, TValue | boolean | undefined>);

  cancelLabel = computed(() => this.data.cancelLabel);
  confirmLabel = computed(() => this.data.confirmLabel);

  private createdRef?: CreatedContentRef<TValue>;

  ngAfterViewInit(): void {
    if (this.data.mode === 'action') {
      const componentRef = this.contentHost.createComponent(this.data.content);
      this.createdRef = { componentRef } as CreatedContentRef<TValue>;
    }
  }

  onCancel(): void {
    if (this.isAlert(this.data)) {
      this.dialogRef.close(false);
      return;
    }

    this.dialogRef.close(undefined);
  }

  onConfirm(): void {
    if (this.isAlert(this.data)) {
      this.dialogRef.close(true);
      return;
    }

    const value = this.createdRef?.componentRef.instance?.getValue();
    this.dialogRef.close(value);
  }

  private isAlert(data: ConfirmationDialogData<TValue>): data is AlertDialogData {
    return data.mode === 'alert';
  }
}
