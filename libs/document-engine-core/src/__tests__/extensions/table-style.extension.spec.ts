import { Editor } from '@tiptap/core';
import { TableRow } from '@tiptap/extension-table';
import { CellSelection } from '@tiptap/pm/tables';
import { createTestEditor } from '../helpers/editor-factory';
import {
  StyledTable,
  StyledTableCell,
  StyledTableHeader,
  TableDefaultAttributes,
} from '../../extensions/table-style.extension';

/**
 * These cover the merge contract of `setTableBorder` / `setCellBorder`:
 *
 *   a value    → set that field
 *   `null`     → clear that field
 *   `undefined`→ leave that field as it is
 *
 * The three are easy to conflate — a truthiness check treats `null` and `undefined`
 * alike, which made clearing a colour impossible because the command fell straight
 * back to the colour being cleared.
 */
describe('TableStyle Extension — border merge contract', () => {
  let editor: Editor;

  const tableHTML = `
    <table>
      <tbody>
        <tr><td>a1</td><td>a2</td></tr>
        <tr><td>b1</td><td>b2</td></tr>
      </tbody>
    </table>
  `;

  /** Put the cursor inside the first cell's paragraph. */
  const putCursorInFirstCell = () => {
    let pos = -1;
    editor.state.doc.descendants((node, nodePos) => {
      if (pos === -1 && node.type.name === 'tableCell') pos = nodePos;
      return pos === -1;
    });
    editor.commands.setTextSelection(pos + 2);
  };

  /** Select the whole first row as a CellSelection (the multi-cell case). */
  const selectFirstRowCells = () => {
    const cellPositions: number[] = [];
    editor.state.doc.descendants((node, nodePos) => {
      if (node.type.name === 'tableCell') cellPositions.push(nodePos);
      return true;
    });
    const { doc, tr } = editor.state;
    const selection = new CellSelection(doc.resolve(cellPositions[0]), doc.resolve(cellPositions[1]));
    editor.view.dispatch(tr.setSelection(selection));
  };

  /** Raw `border` attr of the first cell — `null` is a meaningful value here, not "absent". */
  const firstCellBorder = (): Record<string, string | null> | null => {
    let border: Record<string, string | null> | null = null;
    let found = false;
    editor.state.doc.descendants((node) => {
      if (!found && node.type.name === 'tableCell') {
        border = node.attrs['border'] as Record<string, string | null> | null;
        found = true;
        return false;
      }
      return !found;
    });
    return border;
  };

  const tableBorder = (): Record<string, string | null> => {
    let border: Record<string, string | null> = {};
    editor.state.doc.descendants((node) => {
      if (node.type.name === 'table') {
        border = (node.attrs['border'] as Record<string, string | null>) ?? {};
        return false;
      }
      return true;
    });
    return border;
  };

  beforeEach(() => {
    editor = createTestEditor([StyledTable, TableRow, StyledTableCell, StyledTableHeader], tableHTML);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('setCellBorder', () => {
    it('sets the fields it is given', () => {
      putCursorInFirstCell();

      editor.commands.setCellBorder({ style: 'dashed', color: '#ff0000', width: '4px' });

      expect(firstCellBorder()).toEqual({ style: 'dashed', color: '#ff0000', width: '4px' });
    });

    it('leaves omitted fields alone (`undefined` means "no opinion")', () => {
      putCursorInFirstCell();
      editor.commands.setCellBorder({ style: 'dotted', color: '#00ff00', width: '2px' });

      editor.commands.setCellBorder({ width: '6px' });

      expect(firstCellBorder()).toEqual({ style: 'dotted', color: '#00ff00', width: '6px' });
    });

    it('clears a field passed as `null` — the bug this contract exists for', () => {
      putCursorInFirstCell();
      editor.commands.setCellBorder({ style: 'solid', color: '#123456', width: '2px' });

      editor.commands.setCellBorder({ color: null });

      const border = firstCellBorder() ?? {};
      expect(border['color']).toBeNull();
      // …and does not take the rest of the border down with it.
      expect(border['style']).toBe('solid');
      expect(border['width']).toBe('2px');
    });

    it('reads the current border from a real cell when several cells are selected', () => {
      // With a CellSelection, `$from` resolves before the head cell, so a naive
      // `$from.node(-1)` lookup lands on the row — which carries no border, so every
      // omitted field would be cleared instead of preserved.
      putCursorInFirstCell();
      editor.commands.setCellBorder({ style: 'double', color: '#abcdef', width: '3px' });

      selectFirstRowCells();
      editor.commands.setCellBorder({ width: '8px' });

      const border = firstCellBorder() ?? {};
      expect(border['width']).toBe('8px');
      expect(border['style']).toBe('double');
      expect(border['color']).toBe('#abcdef');
    });

    it('clears the whole border when called with no argument at all', () => {
      putCursorInFirstCell();
      editor.commands.setCellBorder({ style: 'solid', color: '#123456', width: '2px' });

      editor.commands.setCellBorder(null);

      expect(firstCellBorder()).toBeNull();
    });
  });

  describe('setTableBorder', () => {
    it('sets the fields it is given', () => {
      putCursorInFirstCell();

      editor.commands.setTableBorder({ style: 'dashed', color: '#ff0000', width: '4px' });

      expect(tableBorder()).toEqual({ style: 'dashed', color: '#ff0000', width: '4px' });
    });

    it('leaves omitted fields alone', () => {
      putCursorInFirstCell();
      editor.commands.setTableBorder({ style: 'dotted', color: '#00ff00', width: '2px' });

      editor.commands.setTableBorder({ width: '6px' });

      expect(tableBorder()).toEqual({ style: 'dotted', color: '#00ff00', width: '6px' });
    });

    it('clears a field passed as `null`', () => {
      putCursorInFirstCell();
      editor.commands.setTableBorder({ style: 'solid', color: '#123456', width: '2px' });

      editor.commands.setTableBorder({ color: null });

      const border = tableBorder();
      expect(border['color']).toBeNull();
      expect(border['style']).toBe('solid');
      expect(border['width']).toBe('2px');
    });
  });

  it('ships the documented defaults', () => {
    // Guards the values the Angular views read back when a cell has no border of its own.
    expect(TableDefaultAttributes.cellBorder).toEqual({ style: 'solid', color: '#e5e7eb', width: '1px' });
    expect(TableDefaultAttributes.border).toEqual({ style: 'double', color: '#e5e7eb', width: '1px' });
  });
});
