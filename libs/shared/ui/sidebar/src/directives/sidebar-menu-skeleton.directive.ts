import { Directive, computed, inject, input } from '@angular/core';

@Directive({
  selector: 'div[documentEngineSidebarMenuSkeleton]',

  host: {
    '[attr.data-slot]': "'sidebar-menu-skeleton'",
    '[attr.data-sidebar]': "'menu-skeleton'",
    '[class]': 'containerClass()',
  },
})
export class SidebarMenuSkeletonDirective {
  public showIcon = input<boolean>(false);
  public customClass = input<string>('');

  private randomPercent = Math.floor(Math.random() * 40) + 50; // 50-90%

  public containerClass = computed(() =>
    ['flex h-8 items-center gap-2 rounded-md px-2', this.customClass()].filter(Boolean).join(' ')
  );

  public skeletonWidth = computed(() => `${this.randomPercent}%`);
}

@Directive({
  selector: 'div[documentEngineSidebarMenuSkeletonIcon]',

  host: {
    '[attr.data-sidebar]': "'menu-skeleton-icon'",
    '[class]': "'size-4 rounded-md bg-gray-300'",
  },
})
export class SidebarMenuSkeletonIconDirective {}

@Directive({
  selector: 'div[documentEngineSidebarMenuSkeletonText]',

  host: {
    '[attr.data-sidebar]': "'menu-skeleton-text'",
    '[class]': "'h-4 flex-1 bg-gray-300 rounded-md'",
    '[style.width]': 'skeletonWidth()',
  },
})
export class SidebarMenuSkeletonTextDirective {
  private readonly parent = inject(SidebarMenuSkeletonDirective);
  public skeletonWidth = this.parent.skeletonWidth;
}
