import { Directive, computed, inject, input } from '@angular/core';
import { SidebarContextDirective } from './sidebar-context.directive';

@Directive({
  selector: 'li[documentEngineSidebarMenuItem]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-item'",
    '[attr.data-sidebar]': "'menu-item'",
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuItemDirective {
  public customClass = input<string>('');
  private readonly ctx = inject(SidebarContextDirective, { optional: true });

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;
    const base = ['group/menu-item relative'];
    const layout = isCompact ? 'justify-center' : '';
    return [...base, layout, this.customClass()].filter(Boolean).join(' ');
  });
}
