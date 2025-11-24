import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color, getCursorCellInfo, TableDefaultAttributes } from '@phuong-tran-redoc/document-engine-core';
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

/**
 * Table style view for table bubble menu
 * Allows styling the entire table (borders, background, dimensions, alignment)
 */
@Component({
  selector: 'document-engine-table-style-view',
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
    PopoverDirective,
  ],
  template: `
    <div class="table-style-view">
      <!-- Title -->
      <div class="table-style-view__header">Table Properties</div>

      <div class="table-style-view__content">
        <div class="table-style-view__section">
          <div class="table-style-view__section-label">Border</div>

          <div class="table-style-view__border-grid">
            <div class="table-style-view__field">
              <div class="table-style-view__field-label">Width</div>

              <input
                documentEngineInput
                [(ngModel)]="borderWidth"
                (ngModelChange)="onBorderWidthChange()"
                placeholder="1px"
              />
            </div>

            <div class="table-style-view__field">
              <div class="table-style-view__field-label">Style</div>

              <document-engine-select [(value)]="borderStyle" variant="outline">
                <button documentEngineSelectOption value="solid">Solid</button>
                <button documentEngineSelectOption value="double">Double</button>
                <button documentEngineSelectOption value="dashed">Dashed</button>
                <button documentEngineSelectOption value="dotted">Dotted</button>
                <button documentEngineSelectOption value="none">None</button>
              </document-engine-select>
            </div>

            <div class="table-style-view__field table-style-view__field--color">
              <div class="table-style-view__field-label">Color</div>
              <div class="table-style-view__color-input">
                <input documentEngineInput [value]="borderColor" readonly />

                <button
                  *ngIf="borderColor"
                  type="button"
                  documentEngineButton
                  size="icon"
                  variant="ghost"
                  class="table-style-view__color-clear"
                  (click)="borderColor = null"
                >
                  <document-engine-icon name="close"></document-engine-icon>
                </button>

                <button
                  #borderColorTrigger
                  type="button"
                  class="table-style-view__color-swatch"
                  [style.background-color]="borderColor || 'transparent'"
                  (click)="toggleColorPicker('border')"
                  title="Pick color"
                >
                  <div *ngIf="borderColor === 'transparent'" class="table-style-view__color-checker"></div>
                </button>
              </div>

              <!-- Color picker for border -->
              <div
                *ngIf="showColorPicker === 'border'"
                [popover]="borderColorTrigger"
                [isOpen]="showColorPicker === 'border'"
                class="table-style-view__color-picker-dropdown"
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

        <div class="table-style-view__section">
          <div class="table-style-view__section-label">Background</div>
          <div class="table-style-view__field table-style-view__field--color">
            <div class="table-style-view__field-label">Color</div>

            <div class="table-style-view__color-input">
              <input documentEngineInput [value]="tableBg" readonly />

              <button
                *ngIf="tableBg"
                type="button"
                documentEngineButton
                size="icon"
                variant="ghost"
                class="table-style-view__color-clear"
                (click)="tableBg = null"
              >
                <document-engine-icon name="close"></document-engine-icon>
              </button>

              <button
                #bgColorTrigger
                type="button"
                class="table-style-view__color-swatch"
                [style.background-color]="tableBg || 'transparent'"
                (click)="toggleColorPicker('bg')"
                title="Pick color"
              >
                <div *ngIf="tableBg === 'transparent'" class="table-style-view__color-checker"></div>
              </button>
            </div>

            <!-- Color picker for background -->
            <div
              *ngIf="showColorPicker === 'bg'"
              [popover]="bgColorTrigger"
              [isOpen]="showColorPicker === 'bg'"
              class="table-style-view__color-picker-dropdown"
              (click)="$event.stopPropagation()"
            >
              <document-engine-color-picker
                [colorPalette]="colorPalette"
                [activeColor]="tableBgObj"
                (colorSelected)="onTableBgSelected($event)"
                (colorRemoved)="onTableBgRemoved()"
              ></document-engine-color-picker>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="table-style-view__actions">
        <button documentEngineButton variant="ghost" (click)="cancel()">Cancel</button>
        <button documentEngineButton variant="default" (click)="onSave()">Save</button>
      </div>
    </div>
  `,
  styleUrls: ['./table-style-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableStyleViewComponent implements BubbleMenuViewContent {
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('borderColorTrigger', { static: false, read: ElementRef })
  borderColorTrigger!: ElementRef<HTMLElement>;
  @ViewChild('bgColorTrigger', { static: false, read: ElementRef })
  bgColorTrigger!: ElementRef<HTMLElement>;

  editor?: Editor;
  goBack?: (viewId?: string) => void;

  // State
  borderStyle: 'solid' | 'double' | 'dashed' | 'dotted' | 'none' | null = null;
  borderColor: string | null = null;
  borderWidth: string | null = null;
  tableBg: string | null = null;

  showColorPicker: 'border' | 'bg' | null = null;

  // Color picker state
  colorPalette = COLORS;

  private documentClickListener?: () => void;

  get borderColorObj(): Color | null {
    return this.borderColor ? Color.from(this.borderColor) : null;
  }

  get tableBgObj(): Color | null {
    return this.tableBg ? Color.from(this.tableBg) : null;
  }

  onActivate(): void {
    if (!this.editor) return;

    const { state } = this.editor;
    const cellInfo = getCursorCellInfo(state);
    if (!cellInfo) return;

    const tableAttrs = cellInfo.tableNode.attrs;

    // Initialize border signals from table attributes
    this.borderStyle = tableAttrs['border']?.['style'] || TableDefaultAttributes.border.style;
    this.borderColor = tableAttrs['border']?.['color'] || TableDefaultAttributes.border.color;
    this.borderWidth = tableAttrs['border']?.['width'] || TableDefaultAttributes.border.width;

    this.tableBg = tableAttrs['backgroundColor'] || null;
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

  onTableBgSelected(color: Color): void {
    this.tableBg = color.value;
    this.closeColorPicker();
    this.cdr.markForCheck();
  }

  onTableBgRemoved(): void {
    this.tableBg = null;
    this.closeColorPicker();
    this.cdr.markForCheck();
  }

  onBorderWidthChange(): void {
    this.cdr.markForCheck();
  }

  onSave(): void {
    const editor = this.editor;
    if (!editor) return;

    editor
      .chain()
      .focus()
      .setTableBorder({ style: this.borderStyle, color: this.borderColor, width: this.borderWidth })
      .setTableBackgroundColor(this.tableBg)
      .run();

    this.cancel();
  }

  cancel(): void {
    this.goBack?.('main');
  }
}
