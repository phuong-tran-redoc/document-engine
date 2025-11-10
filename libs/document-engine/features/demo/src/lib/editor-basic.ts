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
 * Basic editor test with minimal DocumentEngineConfig
 * Demonstrates a simple editor configuration
 */
@Component({
  selector: 'document-engine-editor-basic',
  imports: [CommonModule, FormsModule, DocumentEditorComponent, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Basic Document Engine Test</h2>
      <p class="text-sm m-0 text-muted-foreground">Simple configuration with basic features</p>

      <document-engine-editor
        #docEditor
        [showToolbar]="true"
        [config]="editorConfig"
        (editorReady)="onEditorReady($event)"
      >
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
    textStyleKit: true,

    // Subscript and superscript
    subscript: true,
    superscript: true,

    // Text alignment
    textAlign: {
      types: ['paragraph', 'heading'],
      alignments: ['left', 'center', 'right', 'justify'],
    },

    // Image support
    image: true,

    // Placeholder
    placeholder: {
      placeholder: 'Type something...',
    },

    // Custom extensions
    pageBreak: true,
    resetFormat: true,
    resetOnEnter: true,
    indent: true,
    clearContent: true,
    textCase: true,
    heading: true, // Custom NotumHeading
    orderedList: true, // Custom CustomOrderedList
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
