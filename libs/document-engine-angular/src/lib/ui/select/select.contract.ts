import { InjectionToken } from '@angular/core';

export interface ISelectParent {
  value: string | null;
  selectOption(option: unknown): void;
}

export const SELECT_PARENT_TOKEN = new InjectionToken<ISelectParent>('ISelectParent');
