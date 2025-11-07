import { Directive, computed, inject, input, signal } from '@angular/core';
import { SIDEBAR_CONTEXT } from '../configs/sidebar-context.token';
import { RouterLinkActive } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';

@Directive({
  selector: 'a[documentEngineSidebarMenuSubButton]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-sub-button'",
    '[attr.data-sidebar]': "'menu-sub-button'",
    '[attr.data-size]': 'size()',
    '[attr.data-active]': 'isActive()',
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuSubButtonDirective {
  public customClass = input<string>('');
  public size = input<'sm' | 'md'>('md');
  public isActive = input<boolean>(false);

  private readonly ctx = inject(SIDEBAR_CONTEXT, { optional: true });
  private readonly rla = inject(RouterLinkActive, { optional: true, self: true });
  private readonly rlaIsActive = this.rla
    ? toSignal(this.rla.isActiveChange, { initialValue: this.rla.isActive })
    : signal(false);
  private readonly active = computed(() => this.isActive() || this.rlaIsActive());

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;

    const base = [
      'peer/menu-sub-button flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2',
      'outline-none focus-visible:ring-2',
      'transition-colors',
      '[&>span:last-child]:truncate',
    ];

    const interactive = [
      'hover:bg-[var(--sidebar-accent)] active:bg-[var(--sidebar-accent)]',
      'disabled:pointer-events-none disabled:opacity-50',
      '[&[aria-disabled=true]]:pointer-events-none [&[aria-disabled=true]]:opacity-50',
    ];

    const sizeClass = this.size() === 'sm' ? 'text-xs' : '';
    const activeClass = this.active() ? 'bg-[var(--sidebar-accent)]' : '';

    const hideInCompact = isCompact ? 'hidden' : '';

    return [...base, ...interactive, sizeClass, activeClass, hideInCompact, this.customClass()]
      .filter(Boolean)
      .join(' ');
  });
}
