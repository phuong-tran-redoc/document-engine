import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorModule, Editor } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Toolbar test bench component for Playwright E2E testing
 * Shows toolbar with full configuration for testing button interactions
 */
@Component({
  selector: 'document-engine-toolbar-test-bench',
  templateUrl: './toolbar-test-bench.html',
  styleUrls: ['./toolbar-test-bench.scss'],
  imports: [CommonModule, FormsModule, DocumentEditorModule],
})
export class ToolbarTestBenchComponent implements OnInit {
  editor?: Editor;
  value = '<p>Sample text for toolbar testing</p>';

  editorConfig = {
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    heading: true,
    textAlign: true,
    textStyleKit: true,
    list: true,
    table: true,
    link: true,
    undoRedo: true,
    showFooter: true,
    characterCount: true,
  };

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'toolbar');
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = editor;
    console.log('[ToolbarTestBench] Editor ready and exposed to window.__EDITOR__');
  }
}
