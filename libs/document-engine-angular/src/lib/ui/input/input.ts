import { Directive, HostBinding, Input } from '@angular/core';

/**
 * Input directive matching shadcn Input component styles
 * Supports all standard input attributes and types
 *
 * Usage:
 * <input notumInput type="text" placeholder="Enter text" />
 * <input notumInput type="email" class="custom-class" />
 */
@Directive({
  selector: 'input[notumInput]',
  standalone: true,
})
export class InputDirective {
  @Input() class = '';

  @HostBinding('class')
  get inputClasses(): string {
    return ['notum-input', this.class].filter(Boolean).join(' ');
  }
}
