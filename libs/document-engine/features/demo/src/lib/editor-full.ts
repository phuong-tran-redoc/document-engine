import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEngineConfig,
  Editor,
  TiptapEditorDirective,
  ToolbarService,
} from '@phuong-tran-redoc/document-engine-angular';

/**
 * Full editor test with complete DocumentEngineConfig
 * Demonstrates all available features
 */
@Component({
  selector: 'document-engine-editor-full',
  imports: [CommonModule, FormsModule, DocumentEditorComponent, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Full Features</h2>
      <p class="text-sm m-0 text-muted-foreground">Complete configuration with all features</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFullComponent {
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  private readonly destroyRef = inject(DestroyRef);
  toolbarService = inject(ToolbarService);

  value = `<p style="margin-left: nullpx">Hello world.</p><p style="margin-left: nullpx"><strong>This is the end.</strong></p><p style="margin-left: nullpx"><em>Hold your breath and count to ten.</em></p><hr><p style="margin-left: nullpx">List:</p><ol data-list-style-type="decimal"><li><p style="margin-left: nullpx">First Item</p></li><li><p style="margin-left: nullpx">Second Item</p></li><li><p style="margin-left: nullpx">Third Item</p></li></ol><p style="margin-left: nullpx">Another list:</p><ol data-list-style-type="decimal"><li><p style="margin-left: nullpx">One</p></li><li><p style="margin-left: nullpx">Two</p><ol data-list-style-type="decimal"><li><p style="margin-left: nullpx">Two one</p></li><li><p style="margin-left: nullpx">Two two</p></li></ol></li><li><p style="margin-left: nullpx">Three</p></li></ol><p style="margin-left: nullpx"></p>`;

  // Full editor configuration - all features
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
    strike: true,
    subscript: true,
    superscript: true,
    code: true,
    textAlign: true,
    indent: true,

    blockquote: true,
    tables: true,
    specialCharacters: true,
    clearContent: true,
    pageBreak: true,
    dynamicField: true,
    image: true,

    list: true,

    showFooter: true,
    characterCount: true,
    showPrintButton: true,

    customToolbarButtons: [
      {
        type: 'icon-button',
        id: 'custom-test-button',
        icon: 'edit',
        label: 'Test Custom Button',
        callback: () => {
          console.log('Custom button clicked!');
        },
      },
    ],
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
