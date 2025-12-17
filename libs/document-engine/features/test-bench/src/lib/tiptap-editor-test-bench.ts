import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TiptapEditorDirective } from '@phuong-tran-redoc/document-engine-angular';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';

/**
 * TiptapEditor directive test bench component for Playwright E2E testing
 * Tests ngModel binding and directive functionality
 */
@Component({
  selector: 'document-engine-tiptap-editor-test-bench',
  template: `
    <div class="container">
      <div class="editor-wrapper">
        <div tiptapEditor [editor]="editor" [(ngModel)]="content" [disabled]="isDisabled"></div>
      </div>

      <pre data-testid="model-value">{{ content }}</pre>

      <button data-testid="btn-change-model" (click)="content = '<p>Changed from Outside</p>'">
        Change Model externally
      </button>

      <button data-testid="btn-disable" (click)="isDisabled = !isDisabled">Toggle Disable</button>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
      .editor-wrapper {
        border: 1px solid #ccc;
        min-height: 200px;
        padding: 10px;
      }
      pre {
        background: #f5f5f5;
        padding: 10px;
        margin-top: 20px;
      }
      button {
        margin: 10px 5px 0 0;
        padding: 8px 16px;
      }
    `,
  ],
  imports: [CommonModule, FormsModule, TiptapEditorDirective],
})
export class TiptapEditorTestBenchComponent implements OnInit {
  editor!: Editor;
  content = '<p>Initial content</p>';
  isDisabled = false;

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'tiptap-editor');

    // Create editor instance with basic extensions
    this.editor = new Editor({
      extensions: [Document, Paragraph, Text, Bold, Italic],
      content: this.content,
    });

    // Expose editor to window for testing
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = this.editor;
    console.log('[TiptapEditorTestBench] Editor ready and exposed to window.__EDITOR__');
  }
}
