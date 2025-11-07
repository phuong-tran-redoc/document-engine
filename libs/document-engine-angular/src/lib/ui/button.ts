import { Directive, HostBinding, Input } from '@angular/core';

/**
 * Custom button directive matching React button component styles
 * Supports variants: default, destructive, outline, secondary, ghost, link
 * Supports sizes: default, sm, lg, icon, icon-sm, icon-lg
 *
 * Usage:
 * - <button notumButton>Text</button> - secondary variant, default size
 * - <button notumButton="filled">Text</button> - default variant (primary)
 * - <button notumButton variant="outline">Text</button> - outline variant
 * - <button notumButton variant="icon" size="icon-sm">Icon</button> - icon button
 */
@Directive({
  selector: 'button[notumButton]',
  standalone: true,
  host: {
    type: 'button',
  },
})
export class ButtonDirective {
  @Input() variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' = 'ghost';
  @Input() size: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm' | 'icon-lg' = 'default';

  @HostBinding('class')
  get buttonClasses(): string {
    const classes: string[] = ['btn'];

    classes.push(`btn--${this.variant}`);
    classes.push(`btn--size-${this.size}`);

    return classes.join(' ');
  }
}
