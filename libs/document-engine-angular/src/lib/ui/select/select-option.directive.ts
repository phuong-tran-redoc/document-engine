import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { SelectComponent } from './select.component';

/**
 * Directive for select options
 * Must be used within notum-select component
 *
 * Usage:
 * <button notumSelectOption value="option1">Option 1</button>
 */
@Directive({
  selector: '[notumSelectOption]',
  standalone: true,
  host: {
    role: 'option',
    '[attr.aria-selected]': 'select.value === value',
    '[attr.aria-disabled]': 'disabled',
    class: 'notum-select-option',
    '[class.notum-select-option--disabled]': 'disabled',
    '[class.notum-select-option--selected]': 'select.value === value',
  },
})
export class SelectOptionDirective {
  readonly elementRef = inject(ElementRef);
  readonly select = inject(SelectComponent);

  @Input() value!: string | null;
  @Input() label?: string;
  @Input() disabled = false;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();

    if (!this.disabled) {
      this.select.selectOption(this);
    }
  }

  // Get label from element text content if not provided
  getLabel(): string {
    return this.label || this.elementRef.nativeElement.textContent?.trim() || this.value;
  }
}
