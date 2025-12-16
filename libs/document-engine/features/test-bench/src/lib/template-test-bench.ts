import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorModule, Editor } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Template test bench component for Playwright E2E testing
 * Pre-configured for template editing workflow testing
 */
@Component({
  selector: 'document-engine-template-test-bench',
  templateUrl: './template-test-bench.html',
  styleUrls: ['./template-test-bench.scss'],
  imports: [CommonModule, FormsModule, DocumentEditorModule],
})
export class TemplateTestBenchComponent implements OnInit {
  editor?: Editor;
  value = `
    <h1>Tên Hồ Sơvậy Template</h1>
    <p>Dear <span data-field="customerName" contenteditable="false">Customer Name</span>,</p>
    <p>Thank you for choosing our service.</p>
    <table>
      <tr>
        <td>Product</td>
        <td><span data-field="productName" contenteditable="false">Product Name</span></td>
      </tr>
      <tr>
        <td>Amount</td>
        <td><span data-field="amount" contenteditable="false">Amount</span></td>
      </tr>
    </table>
    <p>Best regards,</p>
    <p>The Team</p>
  `;

  editorConfig = {
    bold: true,
    italic: true,
    heading: true,
    table: true,
    dynamicField: true,
    undoRedo: true,
  };

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'template');
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = editor;
    console.log('[TemplateTestBench] Editor ready and exposed to window.__EDITOR__');
  }
}
