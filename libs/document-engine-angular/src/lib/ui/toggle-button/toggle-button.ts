import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  QueryList,
} from '@angular/core';

/**
 * Toggle button option directive
 */
@Component({
  selector: 'button[notumToggleOption]',
  standalone: true,
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.notum-toggle-option]': 'true',
    '[class.notum-toggle-option--active]': 'isActive',
    '[disabled]': 'disabled',
    '(click)': 'onClick()',
  },
})
export class ToggleOptionDirective {
  @Input() value!: string;
  @Input() disabled = false;

  @HostBinding('class.notum-toggle-option--active')
  isActive = false;

  onClick(): void {
    if (!this.disabled) {
      this.selected.emit(this.value);
    }
  }

  selected = new EventEmitter<string>();
}

/**
 * Toggle button group component
 * Similar to mat-button-toggle-group
 *
 * Usage:
 * <notum-toggle-group [(value)]="alignment">
 *   <button notumToggleOption value="left"><notum-icon name="format_align_left"></notum-icon></button>
 *   <button notumToggleOption value="center"><notum-icon name="format_align_center"></notum-icon></button>
 * </notum-toggle-group>
 */
@Component({
  selector: 'notum-toggle-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notum-toggle-group">
      <ng-content></ng-content>
    </div>
  `,
  styleUrls: ['../../styles/toggle-button.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleGroupComponent {
  @Input() value: string | null = null;
  @Input() disabled = false;

  @Output() valueChange = new EventEmitter<string | null>();

  @ContentChildren(ToggleOptionDirective, { descendants: true }) options!: QueryList<ToggleOptionDirective>;

  ngAfterContentInit(): void {
    // Initialize active state
    this.updateActiveStates();

    // Listen to option selections
    this.options.forEach((option) => {
      option.selected.subscribe((value) => {
        this.value = value;
        this.valueChange.emit(value);
        this.updateActiveStates();
      });
    });
  }

  ngOnChanges(): void {
    this.updateActiveStates();
  }

  private updateActiveStates(): void {
    if (!this.options) return;

    this.options.forEach((option) => {
      option.isActive = option.value === this.value;
    });
  }
}
