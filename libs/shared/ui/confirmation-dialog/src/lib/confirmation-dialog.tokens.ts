import { InjectionToken } from '@angular/core';
import { ConfirmationDialogGlobalConfig } from './confirmation-dialog.types';

export const CONFIRMATION_DIALOG_CONFIG = new InjectionToken<ConfirmationDialogGlobalConfig>(
  'CONFIRMATION_DIALOG_CONFIG',
);

export const DEFAULT_CONFIRMATION_DIALOG_CONFIG: ConfirmationDialogGlobalConfig = {
  defaultCancelLabel: 'Cancel',
  defaultConfirmLabel: 'Confirm',
};
