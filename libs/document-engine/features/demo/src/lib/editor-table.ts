import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEngineConfig,
  Editor,
  TiptapEditorDirective,
} from '@phuong-tran-redoc/document-engine-angular';

/**
 * Table editor test with table features enabled
 * Demonstrates table editing capabilities
 */
@Component({
  selector: 'document-engine-editor-table',
  imports: [CommonModule, FormsModule, DocumentEditorComponent, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Table Feature</h2>
      <p class="text-sm m-0 text-muted-foreground">Editor configuration with table features enabled</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorTableComponent {
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  value = `<p>Table editor with table features enabled.</p><table><tbody><tr><th>Header 1</th><th>Header 2</th><th>Header 3</th></tr><tr><td>Cell 1</td><td>Cell 2</td><td>Cell 3</td></tr><tr><td>Cell 4</td><td>Cell 5</td><td>Cell 6</td></tr></tbody></table><p>End.</p>`;

  // Editor configuration with table features
  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,
    tables: true, // Enable table features

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
}
