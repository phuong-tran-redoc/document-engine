import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  forwardRef,
  HostBinding,
  inject,
  Input,
  Output,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { IconComponent } from '../icon';

/**
 * Checkbox component
 * Works with ngModel and reactive forms
 *
 * Usage:
 * <document-engine-checkbox [(ngModel)]="checked">Label text</document-engine-checkbox>
 */
@Component({
  selector: 'document-engine-checkbox',
  standalone: true,
  imports: [CommonModule, IconComponent],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxComponent),
      multi: true,
    },
  ],
  template: `
    <label class="document-engine-checkbox">
      <input
        type="checkbox"
        class="document-engine-checkbox__input"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onCheckboxChange($event)"
      />
      <span class="document-engine-checkbox__box">
        <document-engine-icon
          *ngIf="checked"
          name="check"
          class="document-engine-checkbox__icon"
        ></document-engine-icon>
      </span>
      <span class="document-engine-checkbox__label">
        <ng-content></ng-content>
      </span>
    </label>
  `,
  styleUrls: ['../../styles/checkbox.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxComponent implements ControlValueAccessor {
  @Input() disabled = false;
  @Input() checked = false;

  @Output() checkedChange = new EventEmitter<boolean>();

  @HostBinding('class.document-engine-checkbox-container') hostClass = true;

  private readonly cdr = inject(ChangeDetectorRef);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onChange: (value: boolean) => void = () => {};

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private onTouched: () => void = () => {};

  onCheckboxChange(event: Event): void {
    if (this.disabled) return;

    const target = event.target as HTMLInputElement;
    this.checked = target.checked;
    this.checkedChange.emit(this.checked);
    this.onChange(this.checked);
    this.onTouched();
  }

  // ControlValueAccessor implementation.
  //
  // The forms package calls these from outside any template binding, so on an
  // OnPush component they must mark the view dirty explicitly. Without it a
  // programmatic `setValue()` — including a bubble-menu view being re-activated
  // with different attributes on a reused instance — updates the model while the
  // rendered tick keeps showing the previous state.
  writeValue(value: boolean): void {
    this.checked = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
