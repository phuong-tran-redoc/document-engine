import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { Observable, map } from 'rxjs';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';
import { CONFIRMATION_DIALOG_CONFIG } from './confirmation-dialog.tokens';
import {
  ActionDialogData,
  AlertDialogData,
  ConfirmationBase,
  ConfirmationDialogData,
} from './confirmation-dialog.types';

@Injectable()
export class ConfirmationDialogService {
  private dialog = inject(MatDialog);
  private global = inject(CONFIRMATION_DIALOG_CONFIG);

  openAlert(data: Omit<AlertDialogData, 'mode'>): Observable<boolean> {
    const normalizedData: ConfirmationDialogData = { ...data, ...this.normalizeData(data), mode: 'alert' };

    const config: MatDialogConfig<ConfirmationDialogData> = {
      width: this.global.width,
      data: normalizedData,
      disableClose: normalizedData.dismissable === false,
      autoFocus: false,
      restoreFocus: true,
    };

    return this.dialog
      .open<ConfirmationDialogComponent, ConfirmationDialogData, boolean>(ConfirmationDialogComponent, config)
      .afterClosed()
      .pipe(map(Boolean));
  }

  openConfirm<TValue>(data: Omit<ActionDialogData<TValue>, 'mode'>): Observable<TValue | undefined> {
    const normalizedData: ConfirmationDialogData<TValue> = { ...data, ...this.normalizeData(data), mode: 'action' };

    const config: MatDialogConfig<ConfirmationDialogData<TValue>> = {
      width: this.global.width,
      data: normalizedData,
      disableClose: normalizedData.dismissable === false,
      autoFocus: false,
      restoreFocus: true,
    };

    return this.dialog
      .open<
        ConfirmationDialogComponent<TValue>,
        ConfirmationDialogData<TValue>,
        TValue | undefined
      >(ConfirmationDialogComponent, config)
      .afterClosed();
  }

  private normalizeData(data: Partial<ConfirmationBase>): Partial<ConfirmationBase> {
    return {
      cancelLabel: data.cancelLabel ?? this.global.defaultCancelLabel,
      confirmLabel: data.confirmLabel ?? this.global.defaultConfirmLabel,
      dismissable: data.dismissable ?? true,
    };
  }
}
