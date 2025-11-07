import { Directive, HostBinding, Input } from '@angular/core';

/**
 * Label directive for form fields
 *
 * Usage:
 * <label documentEngineLabel for="input-id">Label text</label>
 */
@Directive({
  selector: 'label[documentEngineLabel]',
  standalone: true,
})
export class LabelDirective {
  @Input() class = '';

  @HostBinding('class')
  get labelClasses(): string {
    return ['document-engine-label', this.class].filter(Boolean).join(' ');
  }
}
