import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorModule, Editor } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Table test bench component for Playwright E2E testing
 * Pre-configured with table for testing NodeView interactions
 */
@Component({
  selector: 'document-engine-table-test-bench',
  templateUrl: './table-test-bench.html',
  styleUrls: ['./table-test-bench.scss'],
  imports: [CommonModule, FormsModule, DocumentEditorModule],
})
export class TableTestBenchComponent implements OnInit {
  editor?: Editor;
  value = `
    <table>
      <tr>
        <td>Cell 1-1</td>
        <td>Cell 1-2</td>
      </tr>
      <tr>
        <td>Cell 2-1</td>
        <td>Cell 2-2</td>
      </tr>
    </table>
  `;

  editorConfig = {
    bold: true,
    italic: true,
    underline: true,
    table: true,
    undoRedo: true,
  };

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'table');
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = editor;
    console.log('[TableTestBench] Editor ready and exposed to window.__EDITOR__');
  }
}
