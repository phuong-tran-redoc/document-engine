import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: 'li[documentEngineSidebarMenuSubItem]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-sub-item'",
    '[attr.data-sidebar]': "'menu-sub-item'",
    '[class]': 'hostClass()',
  },
})
export class SidebarMenuSubItemDirective {
  public customClass = input<string>('');

  public hostClass = computed(() => ['group/menu-sub-item relative', this.customClass()].filter(Boolean).join(' '));
}
