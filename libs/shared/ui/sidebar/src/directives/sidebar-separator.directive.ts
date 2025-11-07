import { Directive, computed, input } from '@angular/core';

type SeparatorVariant = 'solid' | 'dashed' | 'dotted' | 'thick' | 'invisible';

@Directive({
  selector: 'div[documentEngineSidebarSeparator]',

  host: {
    '[attr.data-slot]': "'sidebar-separator'",
    '[attr.data-sidebar]': "'separator'",
    '[attr.aria-hidden]': 'true',
    '[class]': 'separatorClasses()',
  },
})
export class SidebarSeparatorDirective {
  public variant = input<SeparatorVariant>('solid');
  public customClass = input<string>('');
  public margin = input<string>('');

  public separatorClasses = computed(() => {
    const variant = this.variant();
    const baseClasses = 'block w-full';

    let variantClasses = '';
    switch (variant) {
      case 'solid':
        variantClasses = 'border-t border-[var(--sidebar-border)]';
        break;
      case 'dashed':
        variantClasses = 'border-t border-dashed border-[var(--sidebar-border)]';
        break;
      case 'dotted':
        variantClasses = 'border-t border-dotted border-[var(--sidebar-border)]';
        break;
      case 'thick':
        variantClasses = 'border-t-2 border-[var(--sidebar-border)]';
        break;
      case 'invisible':
        variantClasses = 'border-t border-transparent';
        break;
    }

    return [baseClasses, variantClasses, this.margin(), this.customClass()].filter(Boolean).join(' ');
  });
}
