import { Directive, computed, inject, input } from '@angular/core';
import { SIDEBAR_CONTEXT } from '../configs/sidebar-context.token';

@Directive({
  selector: 'ul[documentEngineSidebarMenuSub]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-sub'",
    '[attr.data-sidebar]': "'menu-sub'",
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuSubDirective {
  public customClass = input<string>('');
  private readonly ctx = inject(SIDEBAR_CONTEXT, { optional: true });

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;

    return [
      'flex min-w-0 -translate-x-px flex-col gap-1',
      'border-l border-[var(--sidebar-border)] px-2.5 py-0.5',
      isCompact ? 'hidden' : '',
      this.customClass(),
    ]
      .filter(Boolean)
      .join(' ');
  });
}
