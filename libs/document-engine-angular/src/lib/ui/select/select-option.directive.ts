import { Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { SELECT_PARENT_TOKEN } from './select.contract';

/**
 * Directive for select options
 * Must be used within document-engine-select component
 *
 * Usage:
 * <button documentEngineSelectOption value="option1">Option 1</button>
 */
@Directive({
  selector: '[documentEngineSelectOption]',
  standalone: true,
  host: {
    role: 'option',
    '[attr.aria-selected]': 'select?.value === value',
    '[attr.aria-disabled]': 'disabled',
    class: 'document-engine-select-option',
    '[class.document-engine-select-option--disabled]': 'disabled',
    '[class.document-engine-select-option--selected]': 'select?.value === value',
  },
})
export class SelectOptionDirective {
  readonly elementRef = inject(ElementRef);
  readonly select = inject(SELECT_PARENT_TOKEN, { optional: true });

  @Input() value!: string | null;
  @Input() label?: string;
  @Input() disabled = false;

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.stopPropagation();

    if (!this.disabled) {
      this.select?.selectOption(this);
    }
  }

  // Get label from element text content if not provided
  getLabel(): string {
    return this.label || this.elementRef.nativeElement.textContent?.trim() || this.value;
  }
}
