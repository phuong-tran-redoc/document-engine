import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color } from '@phuong-tran-redoc/document-engine-core';
import { ButtonDirective } from './button';
import { IconComponent } from './icon';

@Component({
  standalone: true,
  selector: 'document-engine-color-picker',
  imports: [CommonModule, FormsModule, ButtonDirective, IconComponent],
  template: `
    <div class="document-engine-color-picker">
      <!-- Color Palette -->
      <div class="palette">
        <div class="palette__item" *ngFor="let color of colorPalette; trackBy: trackByColorValue">
          <button
            type="button"
            class="swatch"
            [style.background-color]="color.value"
            (click)="colorSelected.emit(color)"
            [attr.title]="color.name"
          >
            <div class="swatch__transparent" *ngIf="color.value === 'transparent'"></div>
          </button>

          <button
            *ngIf="isActive(color)"
            type="button"
            class="swatch__active-indicator"
            (click)="colorRemoved.emit()"
            [attr.title]="'Unset color'"
            aria-label="Unset color"
          >
            <document-engine-icon name="check"></document-engine-icon>
          </button>
        </div>
      </div>

      <!-- Used Colors -->
      <div class="used" *ngIf="usedColors && usedColors.length > 0">
        <div class="used__label">Used in document</div>
        <div class="used__list">
          <button
            type="button"
            class="swatch used__swatch"
            *ngFor="let color of usedColors; trackBy: trackByColorValue"
            [style.background-color]="color.value"
            (click)="colorSelected.emit(color)"
            [attr.title]="color.name"
          ></button>
        </div>
      </div>

      <!-- Custom Color Input -->
      <div class="custom">
        <div class="custom__label">Custom</div>
        <div class="custom__controls">
          <input type="color" #colorInput class="custom__picker" [(ngModel)]="customColor" />

          <input
            type="text"
            #hexInput="ngModel"
            class="custom__hex"
            placeholder="#000000"
            required
            pattern="#([0-9a-fA-F]{6})"
            [(ngModel)]="customColor"
          />

          <button
            type="button"
            documentEngineButton
            variant="default"
            (click)="selectCustomColor()"
            [disabled]="hexInput.invalid"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ColorPickerComponent {
  @Input() colorPalette: Color[] = [];
  @Input() usedColors: Color[] = [];
  @Input() activeColor: Color | null = null;

  @Output() colorSelected = new EventEmitter<Color>();
  @Output() colorRemoved = new EventEmitter<void>();

  customColor: string | null = null;

  trackByColorValue = (_: number, c: Color) => c?.value;

  isActive(color: Color): boolean {
    const active = this.activeColor;
    return active ? active.equals(color) : false;
  }

  selectCustomColor(): void {
    if (!this.customColor) {
      return;
    }
    this.colorSelected.emit(Color.from(this.customColor));
  }
}
