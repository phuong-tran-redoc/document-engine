import { InjectionToken, Signal } from '@angular/core';

export interface SidebarContext {
  isCompact: Signal<boolean>;
  isOpen: Signal<boolean>;
  isOver: Signal<boolean>;
}

export const SIDEBAR_CONTEXT = new InjectionToken<SidebarContext>('SIDEBAR_CONTEXT');
