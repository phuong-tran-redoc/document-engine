import { Directive, HostBinding, Input } from '@angular/core';

/**
 * Label directive for form fields
 *
 * Usage:
 * <label notumLabel for="input-id">Label text</label>
 */
@Directive({
  selector: 'label[notumLabel]',
  standalone: true,
})
export class LabelDirective {
  @Input() class = '';

  @HostBinding('class')
  get labelClasses(): string {
    return ['notum-label', this.class].filter(Boolean).join(' ');
  }
}
