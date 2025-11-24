import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, OnInit, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEditorModule,
  DocumentEngineConfig,
  Editor,
  TiptapEditorDirective,
  ToolbarService,
} from '@phuong-tran-redoc/document-engine-angular';
import { ToastService } from '@shared/ui/toast';
import { DYNAMIC_FIELDS_CATEGORIES } from './misc/common-dynamic-field';

/**
 * Full editor test with complete DocumentEngineConfig
 * Demonstrates all available features
 */
@Component({
  selector: 'document-engine-editor-full',
  imports: [CommonModule, FormsModule, DocumentEditorModule, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Full Features</h2>
      <p class="text-sm m-0 text-muted-foreground">Complete configuration with all features</p>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFullComponent implements OnInit {
  private readonly STORAGE_KEY = 'editor-full-value.html';

  private readonly toast = inject(ToastService);
  private readonly toolbarService = inject(ToolbarService);

  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor; // Store editor instance from editorReady event

  value = `Default value`;

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
    dynamicFieldsCategories: DYNAMIC_FIELDS_CATEGORIES,
    image: true,

    list: true,

    showFooter: true,
    characterCount: true,
    showPrintButton: true,
    customToolbarButtons: [
      {
        icon: 'archive',
        label: 'Save',
        type: 'icon-button',
        id: 'save',
        callback: () => this.persistValue(),
      },
    ],
  };

  ngOnInit(): void {
    // Initialize once
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) this.value = saved;
    } catch {
      this.toast.show({ type: 'warning', message: 'Failed to initialize value' });
    }
  }

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

  persistValue(): void {
    const html = this.editor?.getHTML();

    if (!html) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, html);
      this.toast.show({ type: 'success', message: 'Value persisted' });
    } catch {
      this.toast.show({ type: 'warning', message: 'Failed to persist value' });
    }
  }
}
