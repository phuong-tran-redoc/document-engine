import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  Color,
  getCombinedCellAttributeValue,
  getSelectedCells,
  TableBorder,
  TableDefaultAttributes,
} from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { COLORS } from '../../constants/color.constant';
import { BubbleMenuViewContent } from '../../core/bubble-menu/bubble-menu.type';
import { PopoverDirective } from '../../core/popover.directive';
import { ButtonDirective } from '../../ui/button';
import { ColorPickerComponent } from '../../ui/color-picker';
import { IconComponent } from '../../ui/icon/icon.component';
import { InputDirective } from '../../ui/input/input';
import { SelectComponent } from '../../ui/select/select.component';
import { SelectOptionDirective } from '../../ui/select/select-option.directive';
import { ToggleGroupComponent } from '../../ui/toggle-button/toggle-button';
import { ToggleOptionDirective } from '../../ui/toggle-button/toggle-button';

/**
 * Cell style view for table bubble menu
 * Allows styling individual table cells (borders, background, alignment)
 */
@Component({
  selector: 'document-engine-table-cell-style-view',
  standalone: true,
  imports: [
    CommonModule,
    IconComponent,
    ButtonDirective,
    InputDirective,
    SelectComponent,
    SelectOptionDirective,
    FormsModule,
    ColorPickerComponent,
    ToggleGroupComponent,
    ToggleOptionDirective,
    PopoverDirective,
  ],
  template: `
    <div class="table-cell-style-view">
      <!-- Title -->
      <div class="table-cell-style-view__header">Cell properties</div>

      <div class="table-cell-style-view__content">
        <div class="table-cell-style-view__section">
          <div class="table-cell-style-view__section-label">Border</div>

          <div class="table-cell-style-view__border-grid">
            <div class="table-cell-style-view__field">
              <div class="table-cell-style-view__field-label">Width</div>
              <input
                documentEngineInput
                [(ngModel)]="borderWidth"
                (ngModelChange)="onBorderWidthChange()"
                placeholder="1px"
              />
            </div>

            <div class="table-cell-style-view__field">
              <div class="table-cell-style-view__field-label">Style</div>

              <document-engine-select [(value)]="borderStyle" variant="outline">
                <button documentEngineSelectOption value="solid">Solid</button>
                <button documentEngineSelectOption value="dashed">Dashed</button>
                <button documentEngineSelectOption value="dotted">Dotted</button>
                <button documentEngineSelectOption value="none">None</button>
              </document-engine-select>
            </div>

            <div class="table-cell-style-view__field table-cell-style-view__field--color">
              <div class="table-cell-style-view__field-label">Color</div>

              <div class="table-cell-style-view__color-input">
                <input documentEngineInput [value]="borderColor" readonly />

                <button
                  *ngIf="borderColor"
                  type="button"
                  documentEngineButton
                  size="icon"
                  variant="ghost"
                  class="table-cell-style-view__color-clear"
                  (click)="borderColor = null"
                >
                  <document-engine-icon name="close"></document-engine-icon>
                </button>

                <button
                  #borderColorTrigger
                  type="button"
                  class="table-cell-style-view__color-swatch"
                  [style.background-color]="borderColor || 'transparent'"
                  (click)="toggleColorPicker('border')"
                  title="Pick color"
                >
                  <div *ngIf="borderColor === 'transparent'" class="table-cell-style-view__color-checker"></div>
                </button>
              </div>

              <!-- Color picker for border -->
              <div
                *ngIf="showColorPicker === 'border'"
                [popover]="borderColorTrigger"
                [isOpen]="showColorPicker === 'border'"
                class="table-cell-style-view__color-picker-dropdown"
                (click)="$event.stopPropagation()"
              >
                <document-engine-color-picker
                  [colorPalette]="colorPalette"
                  [activeColor]="borderColorObj"
                  (colorSelected)="onBorderColorSelected($event)"
                  (colorRemoved)="onBorderColorRemoved()"
                ></document-engine-color-picker>
              </div>
            </div>
          </div>
        </div>

        <div class="table-cell-style-view__section">
          <div class="table-cell-style-view__section-label">Background</div>
          <div class="table-cell-style-view__field table-cell-style-view__field--color">
            <div class="table-cell-style-view__field-label">Color</div>

            <div class="table-cell-style-view__color-input">
              <input documentEngineInput [value]="backgroundColor" readonly />

              <button
                *ngIf="backgroundColor"
                type="button"
                documentEngineButton
                size="icon"
                variant="ghost"
                class="table-cell-style-view__color-clear"
                (click)="backgroundColor = null"
              >
                <document-engine-icon name="close"></document-engine-icon>
              </button>

              <button
                #bgColorTrigger
                type="button"
                class="table-cell-style-view__color-swatch"
                [style.background-color]="backgroundColor || 'transparent'"
                (click)="toggleColorPicker('bg')"
                title="Pick color"
              >
                <div *ngIf="backgroundColor === 'transparent'" class="table-cell-style-view__color-checker"></div>
              </button>
            </div>

            <!-- Color picker for background -->
            <div
              *ngIf="showColorPicker === 'bg'"
              [popover]="bgColorTrigger"
              [isOpen]="showColorPicker === 'bg'"
              class="table-cell-style-view__color-picker-dropdown"
              (click)="$event.stopPropagation()"
            >
              <document-engine-color-picker
                [colorPalette]="colorPalette"
                [activeColor]="backgroundColorObj"
                (colorSelected)="onBackgroundColorSelected($event)"
                (colorRemoved)="onBackgroundColorRemoved()"
              ></document-engine-color-picker>
            </div>
          </div>
        </div>

        <div class="table-cell-style-view__section">
          <div class="table-cell-style-view__section-label">Text alignment</div>

          <document-engine-toggle-group [(value)]="textAlign">
            <button documentEngineToggleOption value="left" title="Left">
              <document-engine-icon name="format_align_left"></document-engine-icon>
            </button>
            <button documentEngineToggleOption value="center" title="Center">
              <document-engine-icon name="format_align_center"></document-engine-icon>
            </button>
            <button documentEngineToggleOption value="right" title="Right">
              <document-engine-icon name="format_align_right"></document-engine-icon>
            </button>
            <button documentEngineToggleOption value="justify" title="Justify">
              <document-engine-icon name="format_align_justify"></document-engine-icon>
            </button>
          </document-engine-toggle-group>
        </div>

        <div class="table-cell-style-view__section">
          <div class="table-cell-style-view__section-label">Vertical alignment</div>

          <document-engine-toggle-group [(value)]="vAlign">
            <button documentEngineToggleOption value="top" title="Top">
              <document-engine-icon name="vertical_align_top"></document-engine-icon>
            </button>
            <button documentEngineToggleOption value="middle" title="Middle">
              <document-engine-icon name="vertical_align_center"></document-engine-icon>
            </button>
            <button documentEngineToggleOption value="bottom" title="Bottom">
              <document-engine-icon name="vertical_align_bottom"></document-engine-icon>
            </button>
          </document-engine-toggle-group>
        </div>
      </div>

      <!-- Actions -->
      <div class="table-cell-style-view__actions">
        <button documentEngineButton variant="ghost" (click)="cancel()">Cancel</button>
        <button documentEngineButton variant="default" (click)="onSave()">Save</button>
      </div>
    </div>
  `,
  styleUrls: ['./table-cell-style-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCellStyleViewComponent implements BubbleMenuViewContent {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('borderColorTrigger', { static: false, read: ElementRef })
  borderColorTrigger!: ElementRef<HTMLElement>;
  @ViewChild('bgColorTrigger', { static: false, read: ElementRef })
  bgColorTrigger!: ElementRef<HTMLElement>;

  editor?: Editor;
  goBack?: (viewId?: string) => void;

  // State
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'none' | null = null;
  borderColor: string | null = null;
  borderWidth: string | null = '1px';

  backgroundColor: string | null = null;
  textAlign: 'left' | 'center' | 'right' | 'justify' | null = null;
  vAlign: 'top' | 'middle' | 'bottom' | null = 'middle';

  showColorPicker: 'border' | 'bg' | null = null;

  // Color picker state
  colorPalette = COLORS;

  private documentClickListener?: () => void;

  get borderColorObj(): Color | null {
    return this.borderColor ? Color.from(this.borderColor) : null;
  }

  get backgroundColorObj(): Color | null {
    return this.backgroundColor ? Color.from(this.backgroundColor) : null;
  }

  onActivate(): void {
    if (!this.editor) return;

    const { state } = this.editor;
    const cells = getSelectedCells(state);

    if (!cells.length) return;

    const backgroundColor = getCombinedCellAttributeValue(
      cells,
      'backgroundColor',
      TableDefaultAttributes.cellBackgroundColor
    ) as string | null;

    const border = getCombinedCellAttributeValue(cells, 'border', TableDefaultAttributes.cellBorder) as TableBorder;
    const textAlign = getCombinedCellAttributeValue(cells, 'textAlign', TableDefaultAttributes.cellTextAlign) as
      | 'left'
      | 'center'
      | 'right'
      | 'justify'
      | null;
    const vAlign = getCombinedCellAttributeValue(cells, 'verticalAlign', TableDefaultAttributes.cellVerticalAlign) as
      | 'top'
      | 'middle'
      | 'bottom'
      | null;

    this.backgroundColor = backgroundColor;
    this.borderStyle = (border?.style as 'solid' | 'dashed' | 'dotted' | 'none' | null) || null;
    this.borderColor = (border?.color as string | null) || null;
    this.borderWidth = (border?.width as string | null) || null;
    this.textAlign = textAlign;
    this.vAlign = vAlign;
    this.closeColorPicker();

    this.cdr.markForCheck();
  }

  toggleColorPicker(type: 'border' | 'bg'): void {
    if (this.showColorPicker === type) {
      this.closeColorPicker();
    } else {
      this.showColorPicker = type;
      this.cdr.markForCheck();
      this.addDocumentClickListener();
    }
  }

  closeColorPicker(): void {
    this.showColorPicker = null;
    this.removeDocumentClickListener();
    this.cdr.markForCheck();
  }

  private addDocumentClickListener(): void {
    this.documentClickListener = () => this.closeColorPicker();

    // Use timeout to avoid immediate close from the same click that opened
    setTimeout(() => {
      if (this.documentClickListener) {
        document.addEventListener('click', this.documentClickListener);
      }
    });
  }

  private removeDocumentClickListener(): void {
    if (this.documentClickListener) {
      document.removeEventListener('click', this.documentClickListener);
      this.documentClickListener = undefined;
    }
  }

  onBorderColorSelected(color: Color): void {
    this.borderColor = color.value;
    this.closeColorPicker();
    this.cdr.markForCheck();
  }

  onBorderColorRemoved(): void {
    this.borderColor = null;
    this.closeColorPicker();
    this.cdr.markForCheck();
  }

  onBackgroundColorSelected(color: Color): void {
    this.backgroundColor = color.value;
    this.closeColorPicker();
    this.cdr.markForCheck();
  }

  onBackgroundColorRemoved(): void {
    this.backgroundColor = null;
    this.closeColorPicker();
    this.cdr.markForCheck();
  }

  onBorderWidthChange(): void {
    this.cdr.markForCheck();
  }

  onSave(): void {
    this.editor
      ?.chain()
      .focus()
      .setCellBorder({ style: this.borderStyle, color: this.borderColor, width: this.borderWidth })
      .setCellBackgroundColor(this.backgroundColor)
      .setCellTextAlign(this.textAlign)
      .setCellVerticalAlign(this.vAlign)
      .run();

    this.cancel();
  }

  cancel(): void {
    this.goBack?.('main');
  }
}
