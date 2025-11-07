import { Component, Input } from '@angular/core';

/**
 * Error message component for form validation
 *
 * Usage:
 * <document-engine-error-message *ngIf="control.hasError('required')">
 *   This field is required
 * </document-engine-error-message>
 */
@Component({
  selector: 'document-engine-error-message',
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
    return ['document-engine-error-message__text', this.class].filter(Boolean).join(' ');
  }
}
