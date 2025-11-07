import { ConfirmationDialogService } from './confirmation-dialog.service';
import { CONFIRMATION_DIALOG_CONFIG, DEFAULT_CONFIRMATION_DIALOG_CONFIG } from './confirmation-dialog.tokens';
import { ConfirmationDialogGlobalConfig } from './confirmation-dialog.types';

export function provideConfirmationDialog(config: Partial<ConfirmationDialogGlobalConfig> = {}) {
  return [
    { provide: CONFIRMATION_DIALOG_CONFIG, useValue: { ...DEFAULT_CONFIRMATION_DIALOG_CONFIG, ...config } },
    ConfirmationDialogService,
  ];
}
