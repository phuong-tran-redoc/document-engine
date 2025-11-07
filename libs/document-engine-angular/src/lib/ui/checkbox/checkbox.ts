import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  forwardRef,
  HostBinding,
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
 * <notum-checkbox [(ngModel)]="checked">Label text</notum-checkbox>
 */
@Component({
  selector: 'notum-checkbox',
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
    <label class="notum-checkbox">
      <input
        type="checkbox"
        class="notum-checkbox__input"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onCheckboxChange($event)"
      />
      <span class="notum-checkbox__box">
        <notum-icon *ngIf="checked" name="check" class="notum-checkbox__icon"></notum-icon>
      </span>
      <span class="notum-checkbox__label">
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

  @HostBinding('class.notum-checkbox-container') hostClass = true;

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

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
