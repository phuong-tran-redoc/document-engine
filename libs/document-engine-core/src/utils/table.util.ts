import { Node as PMNode } from '@tiptap/pm/model';
import { EditorState } from '@tiptap/pm/state';
import { CellSelection, findTable, selectionCell, TableMap } from '@tiptap/pm/tables';
import { EditorView } from '@tiptap/pm/view';
import { isEqual } from 'lodash-es';

export function getCursorCellInfo(state: EditorState) {
  // 1. Dùng selectionCell để tìm vị trí bắt đầu của ô chứa con trỏ
  try {
    const cellInfo = selectionCell(state);

    // Nếu không tìm thấy (con trỏ không nằm trong ô nào), trả về null
    if (!cellInfo) return null;

    // cellInfo.$pos là một ResolvedPos trỏ tới vị trí bắt đầu của ô
    const table = findTable(cellInfo);
    if (!table) return null;

    const map = TableMap.get(table.node);

    // 2. Lấy vị trí tương đối của ô so với bảng
    const cellOffset = cellInfo.pos - table.start;

    // 3. Tìm chỉ số (index) của ô này trong "bản đồ" của bảng
    const cellIndex = map.map.indexOf(cellOffset);

    if (cellIndex === -1) {
      return null;
    }

    // 4. Từ chỉ số, tính ra rowIndex và colIndex
    const rowIndex = Math.floor(cellIndex / map.width);
    const colIndex = cellIndex % map.width;

    return {
      rowIndex,
      colIndex,
      cellIndex,
      tableStart: table.start,
      tableNode: table.node,
      map,
    };
  } catch {
    // selectionCell throws RangeError when cursor is not in a table
    return null;
  }
}

/**
 * Lấy tất cả các node cell (tableCell, tableHeader) trong vùng chọn hiện tại.
 */
interface SelectedCell {
  pos: number;
  node: PMNode;
}
export function getSelectedCells(state: EditorState): SelectedCell[] {
  const { selection } = state;
  const cells: SelectedCell[] = [];

  // Trường hợp chọn nhiều ô
  if (selection instanceof CellSelection) {
    selection.forEachCell((node, pos) => cells.push({ pos, node }));
    return cells;
  }

  // Trường hợp con trỏ nằm trong một ô
  if (selection.empty) {
    // Tìm node cell cha gần nhất
    const cell = selection.$head.node(-1);
    if (!cell || !(cell.type.name === 'tableCell' || cell.type.name === 'tableHeader')) return cells;

    // Lấy vị trí bắt đầu của node cell
    const cellPos = selection.$head.start(-1);
    cells.push({ pos: cellPos, node: cell });
  }

  return cells;
}

/**
 * Quyết định giá trị thuộc tính cuối cùng từ một danh sách các cell đã chọn.
 * @param cells Danh sách các cell được chọn.
 * @param attributeName Tên của thuộc tính cần lấy (ví dụ: 'backgroundColor').
 * @returns Giá trị chung, hoặc MIXED_VALUE nếu các giá trị không đồng nhất.
 */
export function getCombinedCellAttributeValue(
  cells: SelectedCell[],
  attributeName: string,
  fallbackValue?: unknown
): unknown {
  // Không có cell nào được chọn
  if (cells.length === 0) return fallbackValue;

  const firstValue = cells[0].node.attrs[attributeName];

  for (let i = 1; i < cells.length; i++) {
    const currentValue = cells[i].node.attrs[attributeName];

    // Dùng isEqual để so sánh object (quan trọng cho thuộc tính 'border')
    if (!isEqual(currentValue, firstValue)) return undefined;
  }

  return firstValue;
}

/**
 * Get the actual table DOM element from a node position
 * Handles both direct table elements and NodeView wrappers
 * Uses :scope selector to avoid selecting nested tables
 *
 * @export For use in other table-related extensions
 */
export function getTableDOMFromView(view: EditorView, tablePos: number): HTMLTableElement | null {
  const nodeDOMEl = view.nodeDOM(tablePos) as HTMLElement | null;
  if (!nodeDOMEl) return null;

  // Case 1: nodeDOMEl is the table itself
  if (nodeDOMEl.tagName === 'TABLE') {
    return nodeDOMEl as HTMLTableElement;
  }

  // Case 2: nodeDOMEl is a NodeView wrapper (figure.widget)
  // Structure: figure.widget > table.widget-content
  // Use :scope to only get direct child, avoiding nested tables in cells
  const tableDOM = nodeDOMEl.querySelector(':scope > table.widget-content') as HTMLTableElement;

  return tableDOM;
}
