import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: 'div[documentEngineSidebarContent]',
  host: {
    '[attr.data-slot]': "'sidebar-content'",
    '[attr.data-sidebar]': "'content'",
    '[class]': 'hostClass()',
  },
})
export class SidebarContentDirective {
  public customClass = input<string>('');

  public hostClass = computed(() =>
    [
      'flex min-h-0 flex-1 flex-col gap-2 overflow-auto',
      // Following project style; consumer can pass extras via customClass
      this.customClass(),
    ]
      .filter(Boolean)
      .join(' ')
  );
}
