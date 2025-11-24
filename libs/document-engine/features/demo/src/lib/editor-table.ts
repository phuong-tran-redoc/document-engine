import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEditorModule,
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
  imports: [CommonModule, FormsModule, DocumentEditorModule, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
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

  value = `<p>Table editor with table features enabled.</p><table data-colwidths="[33.85525400139179,32.81141266527488,33.333333333333336]"><colgroup><col style="width: 33.85525400139179%"><col style="width: 32.81141266527488%"><col style="width: 33.333333333333336%"></colgroup><tbody><tr><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Header 1</p></td><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Header 2</p></td><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Header 3</p></td></tr><tr><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Cell 1</p></td><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Cell 2</p></td><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Cell 3</p></td></tr><tr><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Cell 4</p></td><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Cell 5</p></td><td colspan="1" rowspan="1" style="border-style: solid; border-color: #e5e7eb; border-width: 1px; vertical-align: middle"><p>Cell 6</p></td></tr></tbody></table><p>End.</p>`;

  // Editor configuration with table features
  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,
    tables: { table: { resizable: true } },

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
