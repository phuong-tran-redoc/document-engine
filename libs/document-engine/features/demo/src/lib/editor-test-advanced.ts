import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEditorModule,
  DocumentEngineConfig,
  Editor,
  TemplateItem,
  TiptapEditorDirective,
} from '@phuong-tran-redoc/document-engine-angular';

/**
 * Advanced editor test with custom DocumentEngineConfig
 * Demonstrates how to configure the editor with specific extensions
 */
@Component({
  selector: 'document-engine-editor-test-advanced',
  imports: [CommonModule, FormsModule, DocumentEditorModule, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Advanced Document Engine Test</h2>
      <p class="text-sm m-0 text-muted-foreground">Full-featured configuration with ALL extensions enabled</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorTestAdvancedComponent {
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  value = `<p>This is an <strong>advanced editor</strong> with custom configuration!</p><p>Features:</p><ul><li>Character count limit: 5000</li><li>Table support with resizing</li><li>Text alignment options</li><li>Subscript and Superscript</li></ul>`;

  templates: TemplateItem[] = [
    {
      title: 'Issue acknowledgement (plain text)',
      data: '<p>Dear customer, thank you for your report! The issue is currently being worked on by our development team.</p>',
    },
    {
      title: 'Signature (multi-line)',
      data: '<p><b>Jane Doe</b></p><p>Marketing Specialist at <a href="https://example.com">Example.com</a></p>',
      description: 'Author signature with the link to the website.',
    },
  ];

  // Full-featured editor configuration - ALL extensions enabled
  editorConfig: Partial<DocumentEngineConfig> = {
    editable: true,

    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,

    showFooter: true,
    characterCount: true,
  };

  onEditorReady(editor: Editor): void {
    this.editor = editor;
  }

  printValue(): void {
    if (this.editor) {
      console.log('HTML:', this.editor.getHTML());
      console.log('JSON:', this.editor.getJSON());
      console.log('Text:', this.editor.getText());
    }
  }

  clearEditor(): void {
    if (this.editor) {
      this.editor.commands.clearContent();
    }
  }
}
