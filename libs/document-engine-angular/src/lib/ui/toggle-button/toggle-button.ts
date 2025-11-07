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
  selector: 'button[documentEngineToggleOption]',
  standalone: true,
  template: '<ng-content></ng-content>',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.document-engine-toggle-option]': 'true',
    '[class.document-engine-toggle-option--active]': 'isActive',
    '[disabled]': 'disabled',
    '(click)': 'onClick()',
  },
})
export class ToggleOptionDirective {
  @Input() value!: string;
  @Input() disabled = false;

  @HostBinding('class.document-engine-toggle-option--active')
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
 * <document-engine-toggle-group [(value)]="alignment">
 *   <button documentEngineToggleOption value="left"><document-engine-icon name="format_align_left"></document-engine-icon></button>
 *   <button documentEngineToggleOption value="center"><document-engine-icon name="format_align_center"></document-engine-icon></button>
 * </document-engine-toggle-group>
 */
@Component({
  selector: 'document-engine-toggle-group',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="document-engine-toggle-group">
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
