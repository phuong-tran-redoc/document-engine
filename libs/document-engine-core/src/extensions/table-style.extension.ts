import { Extension, Node, NodeViewRendererProps } from '@tiptap/core';
import { Table, TableCell, TableHeader, TableKitOptions, TableOptions, TableRow } from '@tiptap/extension-table';
import { TextSelection } from '@tiptap/pm/state';
import { addColumnAfter, addColumnBefore, deleteColumn, selectionCell, TableMap } from '@tiptap/pm/tables';
import { getCursorCellInfo } from '../utils';
import { createTableNodeView } from '../views';
import { PercentageColumnResizing } from './table-resizing.extension';

export const MIN_NEW_COL_WIDTH = 5.0;

/**
 * Calculate new column widths when adding a column, ensuring no column goes below MIN_NEW_COL_WIDTH
 * @param oldColWidths - Array of current column widths
 * @returns Array of adjusted column widths (without the new column inserted yet)
 */
function calculateColumnWidthsForNewColumn(oldColWidths: number[]): number[] {
  // Find columns that can contribute (above minimum)
  const columnsAboveMin = oldColWidths.filter((w) => w > MIN_NEW_COL_WIDTH);

  // If not enough space, proportionally reduce all columns
  if (columnsAboveMin.length === 0) {
    const reduction = MIN_NEW_COL_WIDTH / oldColWidths.length;
    return oldColWidths.map((w) => w - reduction);
  }

  // Calculate available space from columns above minimum
  const availableSpace = columnsAboveMin.reduce((sum, w) => sum + (w - MIN_NEW_COL_WIDTH), 0);

  // If we have enough space, only tax columns above minimum
  if (availableSpace >= MIN_NEW_COL_WIDTH) {
    return oldColWidths.map((w) => {
      if (w > MIN_NEW_COL_WIDTH) {
        const contribution = ((w - MIN_NEW_COL_WIDTH) / availableSpace) * MIN_NEW_COL_WIDTH;
        return Math.max(MIN_NEW_COL_WIDTH, w - contribution);
      }
      return w;
    });
  }

  // Not enough space even from columns above min, reduce proportionally
  const reduction = MIN_NEW_COL_WIDTH / oldColWidths.length;
  return oldColWidths.map((w) => w - reduction);
}

export const TableDefaultAttributes = {
  border: {
    style: 'double',
    color: '#e5e7eb',
    width: '1px',
  },
  backgroundColor: null,
  colwidths: null, // Array of column widths as percentages

  cellBorder: {
    style: 'solid',
    color: '#e5e7eb',
    width: '1px',
  },
  cellBackgroundColor: null,

  cellVerticalAlign: 'middle',
  cellTextAlign: null,
};

export type TableBorder = { style?: string | null; color?: string | null; width?: string | null } | null | undefined;

// Extend TableCell and TableHeader to support styling attributes
const commonCellAttributes = {
  backgroundColor: {
    default: null,
    renderHTML: (attrs: { backgroundColor?: string | null }) =>
      attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor};` } : {},
    parseHTML: (element: HTMLElement) => element.style.getPropertyValue('background-color') || null,
  },
  border: {
    default: TableDefaultAttributes.cellBorder,
    renderHTML: (attrs: { border: TableBorder }) => {
      const border = attrs['border'];
      if (!border) return {};
      const styles = [];
      if (border.style) styles.push(`border-style: ${border.style}`);
      if (border.color) styles.push(`border-color: ${border.color}`);
      if (border.width) styles.push(`border-width: ${border.width}`);
      return styles.length ? { style: styles.join('; ') + ';' } : {};
    },
    parseHTML: (element: HTMLElement) => {
      const style = element.style.getPropertyValue('border-style');
      const color = element.style.getPropertyValue('border-color');
      const width = element.style.getPropertyValue('border-width');
      if (!style && !color && !width) return null;
      return {
        style: style || null,
        color: color || null,
        width: width || null,
      };
    },
  },
  verticalAlign: {
    default: TableDefaultAttributes.cellVerticalAlign,
    renderHTML: (attrs: { verticalAlign?: string | null }) =>
      attrs.verticalAlign ? { style: `vertical-align: ${attrs.verticalAlign};` } : {},
    parseHTML: (element: HTMLElement) => element.style.getPropertyValue('vertical-align') || null,
  },
  textAlign: {
    default: TableDefaultAttributes.cellTextAlign,
    renderHTML: (attrs: { textAlign?: 'left' | 'center' | 'right' | 'justify' | null }) =>
      attrs.textAlign ? { style: `text-align: ${attrs.textAlign};` } : {},
    parseHTML: (element: HTMLElement) => element.style.getPropertyValue('text-align') || null,
  },
};

export const StyledTableCell = TableCell.extend({
  addAttributes() {
    const parent = this.parent?.() ?? {};
    return {
      ...parent,
      ...commonCellAttributes,
    };
  },
});

export const StyledTableHeader = TableHeader.extend({
  addAttributes() {
    const parent = this.parent?.() ?? {};
    return {
      ...parent,
      ...commonCellAttributes,
    };
  },
});

// Commands for styling
declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableStyles: {
      setCellBorder: (border: TableBorder) => ReturnType;
      setCellBackgroundColor: (color: string | null) => ReturnType;
      setCellVerticalAlign: (align: 'top' | 'middle' | 'bottom' | null) => ReturnType;
      setCellTextAlign: (align: 'left' | 'center' | 'right' | 'justify' | null) => ReturnType;

      setTableBorder: (border: TableBorder) => ReturnType;
      setTableBackgroundColor: (color: string | null) => ReturnType;
    };
  }
}

// Extend Table node to support width (%) and alignment (left|center|right)
export const StyledTable = Table.extend({
  // name: 'styledTable',

  // draggable: true,

  addAttributes() {
    const parent = this.parent?.() ?? {};
    return {
      ...parent,

      border: {
        default: null,
        renderHTML: (attrs: { border: TableBorder }) => {
          const border = attrs.border;
          if (!border) return {};

          const styles = [];
          if (border.style) styles.push(`border-style: ${border.style}`);
          if (border.color) styles.push(`border-color: ${border.color}`);
          if (border.width) styles.push(`border-width: ${border.width}`);

          return styles.length ? { style: styles.join('; ') + ';' } : {};
        },
        parseHTML: (element: HTMLElement) => {
          const style = element.style.getPropertyValue('border-style');
          const color = element.style.getPropertyValue('border-color');
          const width = element.style.getPropertyValue('border-width');
          if (!style && !color && !width) return null;
          return { style: style || null, color: color || null, width: width || null };
        },
      },
      backgroundColor: {
        default: null,
        renderHTML: (attrs: { backgroundColor?: string | null }) =>
          attrs.backgroundColor ? { style: `background-color: ${attrs.backgroundColor};` } : {},
        parseHTML: (element: HTMLElement) => element.style.getPropertyValue('background-color') || null,
      },
      colwidths: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes['colwidths']) {
            return {}; // Không có gì để render
          }

          return {
            'data-colwidths': JSON.stringify(attributes['colwidths']),
          };
        },
        parseHTML: (element: HTMLElement) => {
          // Only get cols from direct child colgroup (not from nested tables)
          const colgroup = element.querySelector(':scope > colgroup');
          if (!colgroup) return null;

          const cols = colgroup.querySelectorAll('col');
          if (cols.length === 0) return null;

          const colwidths: (number | null)[] = [];
          cols.forEach((col) => {
            const width = col.getAttribute('style');
            if (width) {
              const match = width.match(/width:\s*(\d+(?:\.\d+)?)%/);
              colwidths.push(match ? parseFloat(match[1]) : null);
            } else {
              colwidths.push(null);
            }
          });
          return colwidths.length > 0 ? colwidths : null;
        },
      },
    };
  },

  renderHTML({
    node,
    HTMLAttributes,
  }: {
    node: Node & { attrs: { colwidths?: (number | null)[] | null } };
    HTMLAttributes: Record<string, unknown>;
  }) {
    const colwidths = node.attrs?.['colwidths'];

    const domNodes: (string | number | Record<string, unknown> | unknown[])[] = [];

    // Render <colgroup> nếu có colwidths
    if (colwidths) {
      const colgroup: (string | Record<string, unknown> | unknown[])[] = ['colgroup', {}];
      colwidths.forEach((width: number | null) => {
        colgroup.push(['col', { style: width ? `width: ${width}%` : null }]);
      });
      domNodes.push(colgroup);
    }

    // Thêm <tbody> (0 là 'content hole')
    domNodes.push(['tbody', 0]);

    // Merge các HTML attributes (bao gồm cả global attributes)
    // HTMLAttributes đã được Tiptap merge sẵn từ getRenderedAttributes
    return ['table', HTMLAttributes, ...domNodes];
  },

  addCommands() {
    const parent = this.parent?.() ?? {};

    return {
      ...parent,
      // Table
      setTableBorder:
        (border) =>
        ({ chain, state }) => {
          if (!border) return chain().focus().updateAttributes('table', { border: null }).run();

          // Get current table border and merge with new values
          // Find the table node
          const cellInfo = getCursorCellInfo(state);
          if (!cellInfo) return false;

          const currentBorder = cellInfo?.tableNode?.attrs?.['border'] || {};
          const mergedBorder = {
            style: border.style !== undefined ? border.style : currentBorder.style || null,
            color: border.color !== undefined ? border.color : currentBorder.color || null,
            width: border.width !== undefined ? border.width : currentBorder.width || null,
          };

          return chain().focus().updateAttributes('table', { border: mergedBorder }).run();
        },

      setTableBackgroundColor:
        (color) =>
        ({ chain }) => {
          return chain()
            .focus()
            .updateAttributes('table', { backgroundColor: color ?? null })
            .run();
        },

      insertTable:
        ({ rows, cols, withHeaderRow }: { rows: number; cols: number; withHeaderRow: boolean }) =>
        ({ tr, dispatch, editor }) => {
          const { schema } = editor.state;

          // --- BƯỚC 1: Tính toán colWidths ---
          const calculatedColWidths: number[] = [];
          const defaultWidth = 100 / cols;
          for (let i = 0; i < cols; i += 1) {
            calculatedColWidths.push(defaultWidth);
          }

          // Ví dụ: cols = 3 -> calculatedColWidths = [33.33, 33.33, 33.33]

          // --- BƯỚC 2: Tạo nội dung bảng (rows, cells) ---
          // Chúng ta phải tự xây dựng các node con
          const cellType = schema.nodes['tableCell'];
          const headerType = schema.nodes['tableHeader'];
          const rowType = schema.nodes['tableRow'];

          const tableRows = [];

          // Hàm trợ giúp tạo 1 cell rỗng
          const createEmptyCell = (type: typeof cellType | typeof headerType) => {
            const emptyParagraph = schema.nodes['paragraph'].create();
            return type.create(null, emptyParagraph);
          };

          // Tạo các hàng
          for (let r = 0; r < rows; r += 1) {
            const tableCells = [];

            for (let c = 0; c < cols; c += 1) {
              let cellNode;
              // Nếu là hàng đầu tiên và có 'withHeaderRow'
              if (r === 0 && withHeaderRow) {
                cellNode = createEmptyCell(headerType);
              } else {
                cellNode = createEmptyCell(cellType);
              }
              tableCells.push(cellNode);
            }
            // Thêm hàng mới vào mảng các hàng
            tableRows.push(rowType.create(null, tableCells));
          }

          // --- BƯỚC 3: Tạo node Table chính VỚI ATTRIBUTE 'colwidths' ---
          const tableNode = schema.nodes['table'].create(
            {
              // Đây là mấu chốt: gán mảng % của chúng ta vào đây
              colwidths: calculatedColWidths,
            },
            tableRows // Nội dung (các node 'tableRow')
          );

          // --- BƯỚC 4: Dispatch transaction (Original code)---
          if (dispatch) {
            const offset = tr.selection.from + 1;

            tr.replaceSelectionWith(tableNode)
              .scrollIntoView()
              .setSelection(TextSelection.near(tr.doc.resolve(offset)));
          }

          return true;
        },

      // 2. LỆNH ADDCOLUMNAFTER
      addColumnAfter:
        () =>
        ({ state, dispatch }) => {
          const $cell = selectionCell(state);
          if (!$cell) return false;

          const table = $cell.node(-1);
          const tablePos = $cell.start(-1) - 1;
          const oldColWidths = table.attrs['colwidths'] as number[];

          // Calculate column index
          const map = TableMap.get(table);
          const cellPosInTable = $cell.pos - $cell.start(-1);
          const colIndex = map.colCount(cellPosInTable);

          // Calculate new column widths - ensure no column goes below MIN_NEW_COL_WIDTH
          const newColWidths = calculateColumnWidthsForNewColumn(oldColWidths);

          // Insert new column width
          newColWidths.splice(colIndex + 1, 0, MIN_NEW_COL_WIDTH);

          if (dispatch) {
            // Use the prosemirror-tables function directly to add column
            // This modifies the transaction but doesn't dispatch it
            addColumnAfter(state, (modifiedTr) => {
              // Add our colwidth changes to the same transaction
              modifiedTr.setNodeMarkup(tablePos, null, { ...table.attrs, colwidths: newColWidths });
              // Now dispatch the complete transaction
              dispatch(modifiedTr.scrollIntoView());
            });
          }

          return true;
        },

      // 3. LỆNH ADDCOLUMNBEFORE
      addColumnBefore:
        () =>
        ({ state, dispatch }) => {
          const $cell = selectionCell(state);
          if (!$cell) return false;

          const table = $cell.node(-1);
          const tablePos = $cell.start(-1) - 1;
          const oldColWidths = table.attrs['colwidths'] as number[];

          // Calculate column index
          const map = TableMap.get(table);
          const cellPosInTable = $cell.pos - $cell.start(-1);
          const colIndex = map.colCount(cellPosInTable);

          // Calculate new column widths - ensure no column goes below MIN_NEW_COL_WIDTH
          const newColWidths = calculateColumnWidthsForNewColumn(oldColWidths);

          // Insert new column width at current column index (before)
          newColWidths.splice(colIndex, 0, MIN_NEW_COL_WIDTH);

          if (dispatch) {
            addColumnBefore(state, (modifiedTr) => {
              modifiedTr.setNodeMarkup(tablePos, null, { ...table.attrs, colwidths: newColWidths });
              dispatch(modifiedTr.scrollIntoView());
            });
          }

          return true;
        },

      // 4. LỆNH DELETECOLUMN
      deleteColumn:
        () =>
        ({ state, dispatch }) => {
          const $cell = selectionCell(state);
          if (!$cell) return false;

          const table = $cell.node(-1);
          const tablePos = $cell.start(-1) - 1;
          const oldColWidths = table.attrs['colwidths'] as number[];

          // Calculate column index
          const map = TableMap.get(table);
          const cellPosInTable = $cell.pos - $cell.start(-1);
          const colIndex = map.colCount(cellPosInTable);

          // Get width of column being removed
          const removedWidth = oldColWidths[colIndex];

          // Create array of remaining columns
          const remainingWidths = oldColWidths.filter((_, i) => i !== colIndex);

          // Distribute removed width among remaining columns
          const gainPerCol = removedWidth / remainingWidths.length;
          const newColWidths = remainingWidths.map((w) => w + gainPerCol);

          if (dispatch) {
            deleteColumn(state, (modifiedTr) => {
              modifiedTr.setNodeMarkup(tablePos, null, { ...table.attrs, colwidths: newColWidths });
              dispatch(modifiedTr.scrollIntoView());
            });
          }

          return true;
        },

      // Cell
      setCellBorder:
        (border) =>
        ({ chain, state }) => {
          if (!border)
            return chain()
              .focus()
              .updateAttributes('tableCell', { border: null })
              .updateAttributes('tableHeader', { border: null })
              .run();

          // Get current border and merge with new values
          const { selection } = state;
          const { $from } = selection;
          const cellPos = $from.node(-1);
          const currentBorder = cellPos?.attrs?.['border'] || {};

          const mergedBorder = {
            style: border.style ? border.style : currentBorder.style || null,
            color: border.color ? border.color : currentBorder.color || null,
            width: border.width ? border.width : currentBorder.width || null,
          };

          return chain()
            .focus()
            .updateAttributes('tableCell', { border: mergedBorder })
            .updateAttributes('tableHeader', { border: mergedBorder })
            .run();
        },
      setCellVerticalAlign:
        (align) =>
        ({ chain }) => {
          return chain()
            .focus()
            .updateAttributes('tableCell', { verticalAlign: align ?? null })
            .updateAttributes('tableHeader', { verticalAlign: align ?? null })
            .run();
        },
      setCellTextAlign:
        (align) =>
        ({ chain }) => {
          return chain()
            .focus()
            .updateAttributes('tableCell', { textAlign: align ?? null })
            .updateAttributes('tableHeader', { textAlign: align ?? null })
            .run();
        },
      setCellBackgroundColor:
        (color) =>
        ({ chain }) => {
          // Set all cells to the same background color
          return chain()
            .focus()
            .updateAttributes('tableCell', { backgroundColor: color ?? null })
            .updateAttributes('tableHeader', { backgroundColor: color ?? null })
            .run();
        },
    };
  },

  addNodeView() {
    // Only use custom NodeView (with handle) when editor is editable
    return (props: NodeViewRendererProps) => {
      // Check if editor is editable
      if (!props.editor.isEditable) {
        // Return undefined to use default table rendering (no widget wrapper)
        return null;
      }

      // Editor is editable → use custom NodeView with handle
      return createTableNodeView(props);
    };
  },
});

// Convenience export for consumers who want the full set
export const StyledTableKit = Extension.create<TableKitOptions>({
  name: 'styledTableKit',

  addExtensions() {
    const extensions = [];

    if (this.options.table !== false) {
      extensions.push(StyledTable.configure({ ...this.options.table, resizable: false }));
    }

    if (this.options.tableRow !== false) {
      extensions.push(TableRow.configure(this.options.tableRow));
    }

    if (this.options.tableHeader !== false) {
      extensions.push(StyledTableHeader.configure(this.options.tableHeader));
    }

    if (this.options.tableCell !== false) {
      extensions.push(StyledTableCell.configure(this.options.tableCell));
    }

    if ((this.options.table as TableOptions)?.resizable !== false) {
      extensions.push(PercentageColumnResizing);
    }

    return extensions;
  },
});
