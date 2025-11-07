import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Color, getCursorCellInfo, TableDefaultAttributes } from '@notum/document-engine-core';
import { Editor } from '@tiptap/core';
import { COLORS } from '../../constants/color.constant';
import { BubbleMenuViewContent, PopoverDirective } from '../../core';
import {
  ButtonDirective,
  ColorPickerComponent,
  IconComponent,
  InputDirective,
  SelectComponent,
  SelectOptionDirective,
} from '../../ui';

/**
 * Table style view for table bubble menu
 * Allows styling the entire table (borders, background, dimensions, alignment)
 */
@Component({
  selector: 'notum-table-style-view',
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

              <input notumInput [(ngModel)]="borderWidth" (ngModelChange)="onBorderWidthChange()" placeholder="1px" />
            </div>

            <div class="table-style-view__field">
              <div class="table-style-view__field-label">Style</div>

              <notum-select [(value)]="borderStyle" variant="outline">
                <button notumSelectOption value="solid">Solid</button>
                <button notumSelectOption value="double">Double</button>
                <button notumSelectOption value="dashed">Dashed</button>
                <button notumSelectOption value="dotted">Dotted</button>
                <button notumSelectOption value="none">None</button>
              </notum-select>
            </div>

            <div class="table-style-view__field table-style-view__field--color">
              <div class="table-style-view__field-label">Color</div>
              <div class="table-style-view__color-input">
                <input notumInput [value]="borderColor" readonly />

                <button
                  *ngIf="borderColor"
                  type="button"
                  notumButton
                  size="icon"
                  variant="ghost"
                  class="table-style-view__color-clear"
                  (click)="borderColor = null"
                >
                  <notum-icon name="close"></notum-icon>
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
                <notum-color-picker
                  [colorPalette]="colorPalette"
                  [activeColor]="borderColorObj"
                  (colorSelected)="onBorderColorSelected($event)"
                  (colorRemoved)="onBorderColorRemoved()"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="table-style-view__section">
          <div class="table-style-view__section-label">Background</div>
          <div class="table-style-view__field table-style-view__field--color">
            <div class="table-style-view__field-label">Color</div>

            <div class="table-style-view__color-input">
              <input notumInput [value]="tableBg" readonly />

              <button
                *ngIf="tableBg"
                type="button"
                notumButton
                size="icon"
                variant="ghost"
                class="table-style-view__color-clear"
                (click)="tableBg = null"
              >
                <notum-icon name="close"></notum-icon>
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
              <notum-color-picker
                [colorPalette]="colorPalette"
                [activeColor]="tableBgObj"
                (colorSelected)="onTableBgSelected($event)"
                (colorRemoved)="onTableBgRemoved()"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="table-style-view__actions">
        <button notumButton variant="ghost" (click)="cancel()">Cancel</button>
        <button notumButton variant="default" (click)="onSave()">Save</button>
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
