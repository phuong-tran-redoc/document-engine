import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEditorModule,
  DocumentEngineConfig,
  Editor,
} from '@phuong-tran-redoc/document-engine-angular';

/**
 * Document Builder component
 * Clone from editor-readonly
 */
@Component({
  selector: 'document-engine-document-builder',
  imports: [CommonModule, FormsModule, DocumentEditorModule],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Document Builder</h2>
      <p class="text-sm m-0 text-muted-foreground">Document builder configuration with basic features</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DocumentBuilderComponent {
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  value = `<p>Document builder with basic <a target="_blank" rel="noopener noreferrer nofollow" href="https://thunderphong.com">extensions</a>.</p><ol><li><p>One</p></li><li><p>Two</p></li><li><p>Three</p></li></ol><p>End.</p>`;

  // Basic editor configuration - minimal features
  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    fontSize: true,
    lineHeight: true,
    textCase: true,
    heading: true,
    resetFormat: true,
    textStyleKit: true,

    bold: true,
    italic: true,
    underline: true,
    textAlign: true,
    indent: true,

    blockquote: true,
    tables: true,
    clearContent: true,
    pageBreak: true,
    dynamicField: true,
    image: true,

    list: true,

    showFooter: true,
    characterCount: true,
    showPrintButton: true,
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
}
