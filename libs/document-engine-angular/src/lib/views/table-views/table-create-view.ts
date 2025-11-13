import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core/bubble-menu/bubble-menu.type';
import { ButtonDirective } from '../../ui/button';
import { CheckboxComponent } from '../../ui/checkbox/checkbox';
import { ErrorMessageComponent } from '../../ui/input/error-message';
import { InputDirective } from '../../ui/input/input';

export interface TableCreateViewData {
  rows?: number;
  cols?: number;
  header?: boolean;
}

/**
 * Table creation view for bubble menu
 * Allows users to configure table dimensions and header row
 */
@Component({
  selector: 'document-engine-table-create-view',
  standalone: true,
  imports: [
    CommonModule,
    ButtonDirective,
    CheckboxComponent,
    ReactiveFormsModule,
    InputDirective,
    ErrorMessageComponent,
  ],
  template: `
    <div class="table-create-view">
      <!-- Title -->
      <div class="table-create-view__header">Insert Table</div>

      <!-- Header option -->
      <form [formGroup]="form" class="table-create-view__option">
        <document-engine-checkbox formControlName="header">Header row</document-engine-checkbox>
      </form>

      <!-- Divider -->
      <div class="table-create-view__divider"></div>

      <!-- Grid Selector -->
      <div class="table-create-view__grid-section">
        <div class="table-create-view__grid-wrapper">
          <!-- Grid -->
          <div class="table-create-view__grid" (mouseenter)="onGridMouseEnter()" (mouseleave)="onGridMouseLeave()">
            <div *ngFor="let row of gridRows" class="table-create-view__grid-row">
              <div
                *ngFor="let col of gridCols"
                class="table-create-view__grid-cell"
                [class.table-create-view__grid-cell--selected]="isBoxSelected(row, col)"
                (mouseenter)="onBoxHover(row, col)"
                (mousedown)="onBoxClick(row, col)"
              ></div>
            </div>
          </div>

          <!-- Dimension display -->
          <div class="table-create-view__dimension">{{ hoveredRows }} × {{ hoveredCols }}</div>
        </div>
      </div>

      <!-- Divider -->
      <div class="table-create-view__divider"></div>

      <!-- Form -->
      <div class="table-create-view__form">
        <div class="table-create-view__form-label">Or enter dimensions manually:</div>
        <form [formGroup]="form" class="table-create-view__form-fields">
          <div class="table-create-view__form-field">
            <input
              documentEngineInput
              type="number"
              formControlName="rows"
              min="1"
              [max]="MAX_GRID_ROWS"
              placeholder="Rows"
            />
            <document-engine-error-message *ngIf="form.controls.rows.invalid && form.controls.rows.touched">
              Enter 1-{{ MAX_GRID_ROWS }}
            </document-engine-error-message>
          </div>

          <div class="table-create-view__form-field">
            <input
              documentEngineInput
              type="number"
              formControlName="cols"
              min="1"
              [max]="MAX_GRID_COLS"
              placeholder="Columns"
            />
            <document-engine-error-message *ngIf="form.controls.cols.invalid && form.controls.cols.touched">
              Enter 1-{{ MAX_GRID_COLS }}
            </document-engine-error-message>
          </div>
        </form>
      </div>

      <!-- Actions -->
      <div class="table-create-view__actions">
        <button type="button" documentEngineButton variant="ghost" (click)="close?.()">Cancel</button>
        <button
          type="button"
          documentEngineButton
          variant="default"
          (click)="onInsertFromForm()"
          [disabled]="form.invalid"
        >
          Insert
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./table-create-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableCreateViewComponent implements BubbleMenuViewContent<TableCreateViewData> {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  editor?: Editor;
  close?: () => void;
  goBack?: (viewId?: string) => void;
  navigateTo?: (viewId: string) => void;

  // Grid configuration
  readonly MAX_GRID_ROWS = 100;
  readonly MAX_GRID_COLS = 10;
  readonly GRID_ROW = 10;
  readonly GRID_COL = this.MAX_GRID_COLS;

  gridRows = Array.from({ length: this.GRID_ROW }, (_, i) => i);
  gridCols = Array.from({ length: this.GRID_COL }, (_, i) => i);

  // Grid state
  hoveredRows = 1;
  hoveredCols = 1;
  frozenRows: number | null = null;
  frozenCols: number | null = null;

  form = this.fb.group({
    rows: this.fb.control(3, {
      validators: [Validators.required, Validators.min(1), Validators.max(this.MAX_GRID_ROWS)],
    }),
    cols: this.fb.control(3, {
      validators: [Validators.required, Validators.min(1), Validators.max(this.MAX_GRID_COLS)],
    }),
    header: this.fb.control(false),
  });

  onActivate(attrs: TableCreateViewData): void {
    // Reset form with provided data or defaults
    this.form.patchValue({
      rows: this.clamp(attrs?.rows ?? 3, 1, 50),
      cols: this.clamp(attrs?.cols ?? 3, 1, 20),
      header: attrs?.header ?? false,
    });

    // Reset grid state
    this.hoveredRows = 1;
    this.hoveredCols = 1;
    this.frozenRows = null;
    this.frozenCols = null;
    this.cdr.markForCheck();
  }

  isBoxSelected(row: number, col: number): boolean {
    const activeRows = this.frozenRows ?? this.hoveredRows;
    const activeCols = this.frozenCols ?? this.hoveredCols;
    return row < activeRows && col < activeCols;
  }

  onBoxHover(row: number, col: number): void {
    // Don't update if frozen
    if (this.frozenRows !== null || this.frozenCols !== null) return;

    this.hoveredRows = row + 1;
    this.hoveredCols = col + 1;
  }

  onBoxClick(row: number, col: number): void {
    const rows = row + 1;
    const cols = col + 1;

    if (!this.editor) return;

    const header = this.form.controls.header.value;

    // Insert table using TipTap's table extension
    this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run();

    this.close?.();
  }

  onGridMouseEnter(): void {
    // Unfreeze when mouse re-enters grid
    this.frozenRows = null;
    this.frozenCols = null;
  }

  onGridMouseLeave(): void {
    // Freeze current selection when mouse leaves
    this.frozenRows = this.hoveredRows;
    this.frozenCols = this.hoveredCols;
  }

  onInsertFromForm(): void {
    if (!this.editor || this.form.invalid) return;

    const { rows, cols, header } = this.form.getRawValue();

    // Insert table using TipTap's table extension
    this.editor.chain().focus().insertTable({ rows, cols, withHeaderRow: header }).run();

    this.close?.();
  }

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
