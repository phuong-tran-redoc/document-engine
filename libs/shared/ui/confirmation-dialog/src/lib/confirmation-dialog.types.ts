import { ComponentRef, Type } from '@angular/core';

export type ConfirmationMode = 'alert' | 'action';

export interface ConfirmationBase {
  mode: ConfirmationMode;
  icon: string; // material icon name or registered svgIcon name
  title: string;
  description: string;
  cancelLabel?: string; // default provided via provider
  confirmLabel?: string; // default provided via provider
  dismissable?: boolean; // default true; if false, cannot close via backdrop or ESC
}

export interface AlertDialogData extends ConfirmationBase {
  mode: 'alert';
}

export interface ActionValueAccessor<TValue> {
  getValue(): TValue;
}

export interface ActionDialogData<TValue> extends ConfirmationBase {
  mode: 'action';
  content: Type<ActionValueAccessor<TValue>>; // Component must implement ActionValueAccessor<TValue>
}

export type ConfirmationDialogData<TValue = unknown> = AlertDialogData | ActionDialogData<TValue>;

export interface ConfirmationDialogGlobalConfig {
  defaultCancelLabel: string;
  defaultConfirmLabel: string;
  width?: string;
}

export interface CreatedContentRef<TValue> {
  componentRef: ComponentRef<ActionValueAccessor<TValue>>;
}
