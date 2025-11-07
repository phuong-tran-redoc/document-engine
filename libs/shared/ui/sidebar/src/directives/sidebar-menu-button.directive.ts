import { Directive, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';
import { SIDEBAR_CONTEXT } from '../configs/sidebar-context.token';

@Directive({
  selector: 'a[documentEngineSidebarMenuButton],button[documentEngineSidebarMenuButton]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-button'",
    '[attr.data-sidebar]': "'menu-button'",
    '[attr.aria-disabled]': 'ariaDisabled()',
    '[attr.data-size]': 'size()',
    '[attr.data-active]': 'isActive()',
    '[attr.title]': 'tooltip()',
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuButtonDirective {
  public customClass = input<string>('');
  public disabled = input<boolean>(false);

  public size = input<'sm' | 'default' | 'lg'>('default');
  public isActive = input<boolean>(false);
  public tooltip = input<string | null>(null);

  private readonly ctx = inject(SIDEBAR_CONTEXT, { optional: true });
  private readonly rla = inject(RouterLinkActive, { optional: true, self: true });

  public ariaDisabled = computed(() => (this.disabled() ? 'true' : null));

  private readonly rlaIsActive = this.rla
    ? toSignal(this.rla.isActiveChange, { initialValue: this.rla.isActive })
    : signal(false);

  private readonly active = computed(() => this.isActive() || this.rlaIsActive());

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;

    const base = [
      'peer/menu-button flex rounded-md w-full cursor-pointer',
      isCompact ? 'flex-col items-center justify-center text-center gap-1' : 'items-center gap-2',
      'transition-colors duration-150',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
    ];

    const sizeClass =
      this.size() === 'sm' ? 'px-2 py-1' : this.size() === 'lg' ? 'text-base px-3 py-2' : 'text-sm px-2 py-1.5';

    const variantClass = 'hover:bg-[var(--sidebar-accent)]';
    const activeClass = this.active() ? 'bg-[var(--sidebar-accent)] font-semibold' : '';
    const disabledClass = this.disabled() ? 'opacity-60 pointer-events-none' : '';

    const compactText = isCompact ? 'text-xs' : '';

    return [...base, sizeClass, variantClass, activeClass, disabledClass, compactText, this.customClass()]
      .filter(Boolean)
      .join(' ');
  });
}
