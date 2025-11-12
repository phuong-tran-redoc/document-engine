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
 * Readonly editor test with minimal DocumentEngineConfig
 * Demonstrates a readonly editor configuration
 */
@Component({
  selector: 'document-engine-editor-readonly',
  imports: [CommonModule, FormsModule, DocumentEditorComponent, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Readonly Feature</h2>
      <p class="text-sm m-0 text-muted-foreground">Readonly configuration with basic features</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorReadonlyComponent {
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  value = `<p>Readonly editor with basic <a target="_blank" rel="noopener noreferrer nofollow" href="https://thunderphong.com">extensions</a>.</p><ol><li><p>One</p></li><li><p>Two</p></li><li><p>Three</p></li></ol><p>End.</p>`;

  // Basic editor configuration - minimal features
  editorConfig: Partial<DocumentEngineConfig> = {
    editable: false,

    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,

    showFooter: false,
    showToolbar: false,
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
