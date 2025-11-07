import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: 'ul[documentEngineSidebarMenu]',

  host: {
    '[attr.data-slot]': "'sidebar-menu'",
    '[attr.data-sidebar]': "'menu'",
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuDirective {
  public customClass = input<string>('');

  public hostClass = computed(() => {
    const base = ['flex w-full min-w-0 flex-col'];
    return [...base, this.customClass()].filter(Boolean).join(' ');
  });
}
