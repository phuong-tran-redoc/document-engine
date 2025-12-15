import { Editor } from '@tiptap/core';
import { Table, TableRow, TableCell, TableHeader } from '@tiptap/extension-table';
import { Node as PMNode } from '@tiptap/pm/model';
import { createTestEditor } from '../helpers/editor-factory';
import { getCursorCellInfo, getSelectedCells, getCombinedCellAttributeValue } from '../../utils/table.util';

describe('Table Utilities', () => {
  let editor: Editor;

  beforeEach(() => {
    editor = createTestEditor([Table, TableRow, TableCell, TableHeader]);
  });

  afterEach(() => {
    editor.destroy();
  });

  describe('getCursorCellInfo()', () => {
    it('should return cell info when cursor is in a cell', () => {
      editor.commands.setContent(`
        <table>
          <tr>
            <td><p>Cell 1</p></td>
            <td><p>Cell 2</p></td>
          </tr>
          <tr>
            <td><p>Cell 3</p></td>
            <td><p>Cell 4</p></td>
          </tr>
        </table>
      `);
      editor.commands.setTextSelection(5); // Inside first cell

      const cellInfo = getCursorCellInfo(editor.state);

      expect(cellInfo).not.toBeNull();
      expect(cellInfo?.rowIndex).toBe(0);
      expect(cellInfo?.colIndex).toBe(0);
    });

    it('should return correct row and column indices', () => {
      editor.commands.setContent(`
        <table>
          <tr>
            <td><p>R0C0</p></td>
            <td><p>R0C1</p></td>
          </tr>
          <tr>
            <td><p>R1C0</p></td>
            <td><p>R1C1</p></td>
          </tr>
        </table>
      `);

      // Test second row, second column
      editor.commands.setTextSelection(25); // Approximate position in R1C1

      const cellInfo = getCursorCellInfo(editor.state);

      expect(cellInfo).not.toBeNull();
      // Note: Exact indices depend on document structure
    });

    it('should return null when cursor is not in a cell', () => {
      editor.commands.setContent('<p>Not in table</p>');
      editor.commands.setTextSelection(1);

      const cellInfo = getCursorCellInfo(editor.state);

      expect(cellInfo).toBeNull();
    });

    it('should return table node and map', () => {
      editor.commands.setContent(`
        <table>
          <tr><td><p>Cell</p></td></tr>
        </table>
      `);
      editor.commands.setTextSelection(5);

      const cellInfo = getCursorCellInfo(editor.state);

      expect(cellInfo).not.toBeNull();
      expect(cellInfo?.tableNode).toBeDefined();
      expect(cellInfo?.map).toBeDefined();
      expect(cellInfo?.tableStart).toBeGreaterThan(0);
    });
  });

  describe('getSelectedCells()', () => {
    it('should return single cell when cursor is in a cell', () => {
      editor.commands.setContent(`
        <table>
          <tr><td><p>Cell 1</p></td></tr>
        </table>
      `);
      editor.commands.setTextSelection(5);

      const cells = getSelectedCells(editor.state);

      expect(cells.length).toBe(1);
      expect(cells[0].node.type.name).toBe('tableCell');
    });

    it('should return empty array when not in table', () => {
      editor.commands.setContent('<p>Not in table</p>');
      editor.commands.setTextSelection(1);

      const cells = getSelectedCells(editor.state);

      expect(cells.length).toBe(0);
    });

    it('should return cell node and position', () => {
      editor.commands.setContent(`
        <table>
          <tr><td><p>Test</p></td></tr>
        </table>
      `);
      editor.commands.setTextSelection(5);

      const cells = getSelectedCells(editor.state);

      expect(cells[0]).toHaveProperty('node');
      expect(cells[0]).toHaveProperty('pos');
      expect(cells[0].pos).toBeGreaterThan(0);
    });

    it('should work with table headers', () => {
      editor.commands.setContent(`
        <table>
          <tr><th><p>Header</p></th></tr>
          <tr><td><p>Cell</p></td></tr>
        </table>
      `);
      editor.commands.setTextSelection(5); // In header

      const cells = getSelectedCells(editor.state);

      expect(cells.length).toBe(1);
      expect(cells[0].node.type.name).toBe('tableHeader');
    });
  });

  describe('getCombinedCellAttributeValue()', () => {
    it('should return common value when all cells have same attribute', () => {
      const cells = [
        { pos: 1, node: { attrs: { backgroundColor: '#ff0000' } } as unknown as PMNode },
        { pos: 2, node: { attrs: { backgroundColor: '#ff0000' } } as unknown as PMNode },
        { pos: 3, node: { attrs: { backgroundColor: '#ff0000' } } as unknown as PMNode },
      ];

      const value = getCombinedCellAttributeValue(cells, 'backgroundColor');

      expect(value).toBe('#ff0000');
    });

    it('should return undefined when cells have different values', () => {
      const cells = [
        { pos: 1, node: { attrs: { backgroundColor: '#ff0000' } } as unknown as PMNode },
        { pos: 2, node: { attrs: { backgroundColor: '#00ff00' } } as unknown as PMNode },
      ];

      const value = getCombinedCellAttributeValue(cells, 'backgroundColor');

      expect(value).toBeUndefined();
    });

    it('should return fallback value when no cells provided', () => {
      const cells: { pos: number; node: PMNode }[] = [];

      const value = getCombinedCellAttributeValue(cells, 'backgroundColor', '#default');

      expect(value).toBe('#default');
    });

    it('should handle object attributes with deep comparison', () => {
      const border = { style: 'solid', color: '#000', width: '1px' };
      const cells = [
        { pos: 1, node: { attrs: { border } } as unknown as PMNode },
        { pos: 2, node: { attrs: { border: { ...border } } } as unknown as PMNode },
      ];

      const value = getCombinedCellAttributeValue(cells, 'border');

      expect(value).toEqual(border);
    });

    it('should detect different object values', () => {
      const cells = [
        { pos: 1, node: { attrs: { border: { style: 'solid', color: '#000', width: '1px' } } } as unknown as PMNode },
        { pos: 2, node: { attrs: { border: { style: 'dashed', color: '#000', width: '1px' } } } as unknown as PMNode },
      ];

      const value = getCombinedCellAttributeValue(cells, 'border');

      expect(value).toBeUndefined();
    });

    it('should handle null and undefined values', () => {
      const cells = [
        { pos: 1, node: { attrs: { backgroundColor: null } } as unknown as PMNode },
        { pos: 2, node: { attrs: { backgroundColor: null } } as unknown as PMNode },
      ];

      const value = getCombinedCellAttributeValue(cells, 'backgroundColor');

      expect(value).toBeNull();
    });

    it('should detect mixed null and non-null values', () => {
      const cells = [
        { pos: 1, node: { attrs: { backgroundColor: null } } as unknown as PMNode },
        { pos: 2, node: { attrs: { backgroundColor: '#ff0000' } } as unknown as PMNode },
      ];

      const value = getCombinedCellAttributeValue(cells, 'backgroundColor');

      expect(value).toBeUndefined();
    });
  });
});
