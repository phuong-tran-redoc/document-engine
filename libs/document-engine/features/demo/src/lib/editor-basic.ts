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
 * Basic editor test with minimal DocumentEngineConfig
 * Demonstrates a simple editor configuration
 */
@Component({
  selector: 'document-engine-editor-basic',
  imports: [CommonModule, FormsModule, DocumentEditorModule],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Basic Feature</h2>
      <p class="text-sm m-0 text-muted-foreground">Simple configuration with basic features</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorBasicComponent {
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  value = `<p>Basic editor with basic <a target="_blank" rel="noopener noreferrer nofollow" href="https://thunderphong.com">extensions</a>.</p><ol><li><p>One</p></li><li><p>Two</p></li><li><p>Three</p></li></ol><p>End.</p>`;

  // Basic editor configuration - minimal features
  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,
    heading: true,
    showFooter: true,
    characterCount: true,
    textAlign: true,
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
