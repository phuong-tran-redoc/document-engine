import { Directive, computed, input } from '@angular/core';
import { SidebarExpandVariant, SidebarMode, SidebarState } from '../types';

@Directive({
  selector: '[documentEngineSidebarContext]',
  exportAs: 'documentEngineSidebarCtx',
})
export class SidebarContextDirective {
  sidebarMode = input<SidebarMode>('side');
  sidebarState = input<SidebarState>('open');
  sidebarExpandVariant = input<SidebarExpandVariant>('full');

  isCompact = computed(() => this.sidebarExpandVariant() === 'compact');
  isOpen = computed(() => this.sidebarState() === 'open');
  isOver = computed(() => this.sidebarMode() === 'over');
}
