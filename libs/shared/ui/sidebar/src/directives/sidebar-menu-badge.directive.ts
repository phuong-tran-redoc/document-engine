import { Directive, computed, inject, input } from '@angular/core';
import { SIDEBAR_CONTEXT } from '../configs/sidebar-context.token';

@Directive({
  selector: 'div[documentEngineSidebarMenuBadge]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-badge'",
    '[attr.data-sidebar]': "'menu-badge'",
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuBadgeDirective {
  public customClass = input<string>('');
  public size = input<'sm' | 'default' | 'lg'>('default');
  public isPeerActive = input<boolean>(false);

  private readonly ctx = inject(SIDEBAR_CONTEXT, { optional: true });

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;

    const base = [
      'pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center',
      'rounded-md px-1 text-xs font-medium select-none tabular-nums',
      'text-gray-700',
    ];

    const sizeTop = this.size() === 'sm' ? 'top-1' : this.size() === 'lg' ? 'top-2.5' : 'top-1.5';

    const peerActive = this.isPeerActive() ? 'text-gray-900' : '';
    const hideInCompact = isCompact ? 'hidden' : '';

    return [...base, sizeTop, peerActive, hideInCompact, this.customClass()].filter(Boolean).join(' ');
  });
}
