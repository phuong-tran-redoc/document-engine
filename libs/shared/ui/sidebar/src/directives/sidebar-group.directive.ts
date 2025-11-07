import { Directive, computed, input } from '@angular/core';

@Directive({
  selector: 'div[documentEngineSidebarGroup]',

  host: {
    '[attr.data-slot]': "'sidebar-group'",
    '[attr.data-sidebar]': "'group'",
    '[class]': 'hostClass()',
  },
})
export class SidebarGroupDirective {
  public customClass = input<string>('');
  public hostClass = computed(() => ['relative w-full min-w-0', this.customClass()].filter(Boolean).join(' '));
}

@Directive({
  selector: 'button[documentEngineSidebarGroupAction]',

  host: {
    '[attr.data-slot]': "'sidebar-group-action'",
    '[attr.data-sidebar]': "'group-action'",
    '[class]': 'hostClass()',
  },
})
export class SidebarGroupActionDirective {
  public customClass = input<string>('');
  public hostClass = computed(() =>
    [
      'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0',
      'transition-transform',
      'after:absolute after:-inset-2 md:after:hidden',
      this.customClass(),
    ]
      .filter(Boolean)
      .join(' ')
  );
}

@Directive({
  selector: 'div[documentEngineSidebarGroupContent]',

  host: {
    '[attr.data-slot]': "'sidebar-group-content'",
    '[attr.data-sidebar]': "'group-content'",
    '[class]': 'hostClass()',
  },
})
export class SidebarGroupContentDirective {
  public customClass = input<string>('');
  public hostClass = computed(() => ['w-full', this.customClass()].filter(Boolean).join(' '));
}
