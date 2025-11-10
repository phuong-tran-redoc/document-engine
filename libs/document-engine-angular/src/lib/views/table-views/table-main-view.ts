import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { getCursorCellInfo } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { CellSelection } from '@tiptap/pm/tables';
import { BubbleMenuViewContent } from '../../core';
import { ButtonDirective, IconComponent, SelectComponent, SelectLabelDirective, SelectOptionDirective } from '../../ui';

/**
 * Main view for table bubble menu
 * Shows table manipulation controls (rows, columns, cells)
 * Provides navigation to cell and table styling views
 */
@Component({
  selector: 'document-engine-table-main-view',
  standalone: true,
  imports: [CommonModule, ButtonDirective, IconComponent, SelectComponent, SelectOptionDirective, SelectLabelDirective],
  template: `
    <div class="table-main-view">
      <!-- Column actions -->
      <document-engine-select [(value)]="colAction" (valueChange)="handleColAction($event)" labelMode="static">
        <document-engine-icon documentEngineSelectLabel name="table_column"></document-engine-icon>

        <button documentEngineSelectOption value="add-before">Insert column left</button>
        <button documentEngineSelectOption value="add-after">Insert column right</button>
        <button documentEngineSelectOption value="delete">Remove column</button>
        <button documentEngineSelectOption value="select">Select column</button>
      </document-engine-select>

      <!-- Row actions -->
      <document-engine-select [(value)]="rowAction" (valueChange)="handleRowAction($event)" labelMode="static">
        <document-engine-icon documentEngineSelectLabel name="table_row"></document-engine-icon>

        <button documentEngineSelectOption value="add-before">Insert row above</button>
        <button documentEngineSelectOption value="add-after">Insert row below</button>
        <button documentEngineSelectOption value="delete">Remove row</button>
        <button documentEngineSelectOption value="select">Select row</button>
      </document-engine-select>

      <!-- Cell actions -->
      <document-engine-select [(value)]="cellAction" (valueChange)="handleCellAction($event)" labelMode="static">
        <document-engine-icon documentEngineSelectLabel name="table_merge_cell"></document-engine-icon>

        <button documentEngineSelectOption value="merge" [disabled]="!canMerge">Merge cells</button>
        <button documentEngineSelectOption value="split" [disabled]="!canSplit">Split cell</button>
      </document-engine-select>

      <!-- Table style -->
      <button
        documentEngineButton
        size="icon"
        variant="ghost"
        title="Table Properties"
        (click)="navigateTo?.('table-style')"
      >
        <document-engine-icon name="table_property"></document-engine-icon>
      </button>

      <!-- Cell style -->
      <button
        documentEngineButton
        size="icon"
        variant="ghost"
        title="Cell Properties"
        (click)="navigateTo?.('cell-style')"
      >
        <document-engine-icon name="table_cell_property"></document-engine-icon>
      </button>
    </div>
  `,
  styleUrls: ['./table-main-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableMainViewComponent implements BubbleMenuViewContent {
  editor?: Editor;
  navigateTo?: (viewId: string) => void;
  close?: () => void;

  colAction: string | null = '';
  rowAction: string | null = '';
  cellAction: string | null = '';

  get canMerge(): boolean {
    return this.editor?.can()?.chain()?.focus()?.mergeCells()?.run() || false;
  }

  get canSplit(): boolean {
    return this.editor?.can()?.chain()?.focus()?.splitCell()?.run() || false;
  }

  handleColAction(action: string | null): void {
    if (!action || !this.editor) return;

    switch (action) {
      case 'add-before':
        this.editor.chain().focus().addColumnBefore().run();
        break;
      case 'add-after':
        this.editor.chain().focus().addColumnAfter().run();
        break;
      case 'delete':
        this.editor.chain().focus().deleteColumn().run();
        break;
      case 'select':
        this.setSelection('column');
        break;
    }

    // Reset selection
    this.colAction = '';
  }

  handleRowAction(action: string | null): void {
    if (!action || !this.editor) return;

    switch (action) {
      case 'add-before':
        this.editor.chain().focus().addRowBefore().run();
        break;
      case 'add-after':
        this.editor.chain().focus().addRowAfter().run();
        break;
      case 'delete':
        this.editor.chain().focus().deleteRow().run();
        break;
      case 'select':
        this.setSelection('row');
        break;
    }

    // Reset selection
    this.rowAction = '';
  }

  handleCellAction(action: string | null): void {
    if (!action || !this.editor) return;

    switch (action) {
      case 'merge':
        this.editor.chain().focus().mergeCells().run();
        break;
      case 'split':
        this.editor.chain().focus().splitCell().run();
        break;
    }

    // Reset selection
    this.cellAction = '';
  }

  setSelection(selection: 'column' | 'row'): void {
    if (!this.editor) return;

    const { state, view } = this.editor;

    const cellInfo = getCursorCellInfo(state);
    if (!cellInfo) {
      this.close?.();
      return;
    }

    const { map, tableStart, rowIndex, colIndex } = cellInfo;

    if (selection === 'row') {
      // Select the entire row
      const firstCellPos = tableStart + map.map[rowIndex * map.width];
      const lastCellPos = tableStart + map.map[rowIndex * map.width + map.width - 1];

      const $anchor = state.doc.resolve(firstCellPos);
      const $head = state.doc.resolve(lastCellPos);

      const cellSelection = CellSelection.rowSelection($anchor, $head);
      const tr = state.tr.setSelection(cellSelection);
      view.dispatch(tr);
      view.focus();
      this.close?.();
      return;
    }

    // Select the entire column
    const firstCellPos = tableStart + map.map[colIndex];
    const lastCellPos = tableStart + map.map[colIndex + (map.height - 1) * map.width];

    const $anchor = state.doc.resolve(firstCellPos);
    const $head = state.doc.resolve(lastCellPos);

    const cellSelection = CellSelection.colSelection($anchor, $head);
    const tr = state.tr.setSelection(cellSelection);
    view.dispatch(tr);
    view.focus();
    this.close?.();
  }
}
