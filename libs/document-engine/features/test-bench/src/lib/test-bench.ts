import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorModule, Editor } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Test bench component for Playwright E2E testing
 * Provides a clean environment for testing editor features
 * Exposes editor instance to window.__EDITOR__ for Playwright access
 */
@Component({
  selector: 'document-engine-test-bench',
  templateUrl: './test-bench.html',
  styleUrls: ['./test-bench.scss'],
  imports: [CommonModule, FormsModule, DocumentEditorModule],
})
export class TestBenchComponent implements OnInit {
  editor?: Editor;
  value = ''; // For ngModel binding

  // Full editor configuration for comprehensive testing
  editorConfig = {
    // Basic formatting
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    subscript: true,
    superscript: true,

    // Text features
    textStyleKit: true,
    textAlign: true,
    heading: true,

    // Lists
    list: true,

    // Advanced features
    table: true,
    link: true,
    image: true,
    blockquote: true,
    codeBlock: true,
    horizontalRule: true,
    pageBreak: true,
    dynamicField: true,

    // UI
    showFooter: true,
    characterCount: true,
    undoRedo: true,
  };

  ngOnInit(): void {
    // Add marker to body for test verification
    document.body.setAttribute('data-test-bench', 'true');
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;

    // Expose editor instance to window for Playwright access
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = editor;

    console.log('[TestBench] Editor ready and exposed to window.__EDITOR__');
  }
}
