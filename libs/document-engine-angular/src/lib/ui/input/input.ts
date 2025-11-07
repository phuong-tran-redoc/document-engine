import { Directive, HostBinding, Input } from '@angular/core';

/**
 * Input directive matching shadcn Input component styles
 * Supports all standard input attributes and types
 *
 * Usage:
 * <input documentEngineInput type="text" placeholder="Enter text" />
 * <input documentEngineInput type="email" class="custom-class" />
 */
@Directive({
  selector: 'input[documentEngineInput]',
  standalone: true,
})
export class InputDirective {
  @Input() class = '';

  @HostBinding('class')
  get inputClasses(): string {
    return ['document-engine-input', this.class].filter(Boolean).join(' ');
  }
}
