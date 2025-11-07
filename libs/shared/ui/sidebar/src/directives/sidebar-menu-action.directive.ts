import { computed, Directive, inject, input } from '@angular/core';
import { SIDEBAR_CONTEXT } from '../configs/sidebar-context.token';

@Directive({
  selector: 'a[documentEngineSidebarMenuAction],button[documentEngineSidebarMenuAction]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-action'",
    '[attr.data-sidebar]': "'menu-action'",
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuActionDirective {
  public showOnHover = input<boolean>(false);
  public customClass = input<string>('');
  public size = input<'sm' | 'default' | 'lg'>('default');
  public isPeerActive = input<boolean>(false);

  private readonly ctx = inject(SIDEBAR_CONTEXT, { optional: true });

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;

    const base = [
      'text-gray-700',
      'absolute right-2 flex aspect-square items-center justify-center rounded-md p-0 cursor-pointer',
      'transition-transform',
      'after:absolute after:-inset-2 md:after:hidden',
      isCompact ? 'hidden' : '',
    ];

    const sizeTop = this.size() === 'sm' ? 'top-1' : this.size() === 'lg' ? 'top-2.5' : 'top-1.5';

    const hover = this.showOnHover()
      ? [
          'hover:opacity-100',
          'md:opacity-0 group-focus-within/menu-item:opacity-100 peer-hover/menu-button:opacity-100',
          'hover:bg-[var(--sidebar-accent)]',
        ].join(' ')
      : '';

    const peerActive = this.isPeerActive() ? 'text-gray-900' : '';

    return [...base, sizeTop, hover, peerActive, this.customClass()].filter(Boolean).join(' ');
  });
}
