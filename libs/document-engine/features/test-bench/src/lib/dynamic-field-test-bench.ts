import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorModule, Editor } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Dynamic field test bench component for Playwright E2E testing
 * Pre-configured with dynamic fields for testing
 */
@Component({
  selector: 'document-engine-dynamic-field-test-bench',
  templateUrl: './dynamic-field-test-bench.html',
  styleUrls: ['./dynamic-field-test-bench.scss'],
  imports: [CommonModule, FormsModule, DocumentEditorModule],
})
export class DynamicFieldTestBenchComponent implements OnInit {
  editor?: Editor;
  value = `
    <p>Dear <span data-field-id="guest_name" data-label="Name" class="dynamic-field">{{name}}</span>,</p>
    <p>Your account number is <span data-field-id="guest_account_number" data-label="Account Number" class="dynamic-field">{{accountNumber}}</span>.</p>
  `;

  editorConfig = {
    bold: true,
    italic: true,
    dynamicField: true,
    undoRedo: true,
  };

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'dynamic-field');
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = editor;
    console.log('[DynamicFieldTestBench] Editor ready and exposed to window.__EDITOR__');
  }
}
