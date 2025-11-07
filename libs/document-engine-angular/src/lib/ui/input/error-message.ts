import { Component, Input } from '@angular/core';

/**
 * Error message component for form validation
 *
 * Usage:
 * <notum-error-message *ngIf="control.hasError('required')">
 *   This field is required
 * </notum-error-message>
 */
@Component({
  selector: 'notum-error-message',
  standalone: true,
  template: `
    <p [class]="errorClasses">
      <ng-content></ng-content>
    </p>
  `,
})
export class ErrorMessageComponent {
  @Input() class = '';

  get errorClasses(): string {
    return ['notum-error-message__text', this.class].filter(Boolean).join(' ');
  }
}
