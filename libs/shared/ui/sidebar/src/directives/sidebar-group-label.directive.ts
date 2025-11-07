import { Directive, computed, inject, input } from '@angular/core';
import { SIDEBAR_CONTEXT } from '../configs/sidebar-context.token';

type LabelTone = 'default' | 'muted';

@Directive({
  selector: 'div[documentEngineSidebarGroupLabel]',

  host: {
    '[attr.data-slot]': "'sidebar-group-label'",
    '[attr.data-sidebar]': "'group-label'",
    '[class]': 'hostClass()',
  },
})
export class SidebarGroupLabelDirective {
  public tone = input<LabelTone>('muted');
  public customClass = input<string>('');
  public margin = input<string>('mb-1');

  private readonly ctx = inject(SIDEBAR_CONTEXT, { optional: true });

  public hostClass = computed(() => {
    const isCompact = this.ctx?.isCompact() ?? false;

    const base = [
      'flex items-center px-2',
      'font-semibold tracking-wide text-theme-primary/70',
      'rounded-md',
      'transition-colors duration-150',
      isCompact ? 'text-center' : '',
    ];

    //     "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
    // "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",

    // const toneClass = this.tone() === 'muted' ? 'text-gray-500' : 'text-gray-700';
    // const toneClass = 'text-gray-700';

    return [...base, this.margin(), this.customClass()].filter(Boolean).join(' ');
  });
}
