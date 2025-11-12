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
 * Restricted editor test with two editors side by side
 * Demonstrates standard mode vs restricted mode
 */
@Component({
  selector: 'document-engine-editor-restricted',
  imports: [CommonModule, FormsModule, DocumentEditorComponent, TiptapEditorDirective],
  template: `
    <div class="flex gap-4 p-4 h-screen max-w-7xl mx-auto">
      <!-- Editor (Standard) -->
      <div class="flex-1 flex flex-col gap-4">
        <h2 class="text-2xl font-semibold m-0 text-foreground">Editor (Standard)</h2>
        <document-engine-editor #standardEditor [config]="standardConfig" (editorReady)="onStandardEditorReady($event)">
          <tiptap-editor [editor]="standardEditor.editor" [(ngModel)]="standardValue"></tiptap-editor>
        </document-engine-editor>
      </div>

      <!-- Editor (Restricted) -->
      <div class="flex-1 flex flex-col gap-4">
        <h2 class="text-2xl font-semibold m-0 text-foreground">Editor (Restricted)</h2>
        <document-engine-editor
          #restrictedEditor
          [config]="restrictedConfig"
          (editorReady)="onRestrictedEditorReady($event)"
        >
          <tiptap-editor [editor]="restrictedEditor.editor" [(ngModel)]="restrictedValue"></tiptap-editor>
        </document-engine-editor>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorRestrictedComponent {
  standardEditor = viewChild<DocumentEditorComponent>('standardEditor');
  restrictedEditor = viewChild<DocumentEditorComponent>('restrictedEditor');

  standardEditorInstance?: Editor;
  restrictedEditorInstance?: Editor;

  defaultContent = `<p>Dear&nbsp;<span data-editable-region="true" class="editable-region">Customer Name</span>,</p><p>thank you for contacting us.&nbsp;Your case has been logged as&nbsp;<span data-editable-region="true" class="editable-region">Case ID</span>&nbsp;and assigned to&nbsp;<span data-editable-region="true" class="editable-region">Technician Name</span>. We will try to resolve your issue within the next&nbsp;<span data-editable-region="true" class="editable-region">Time</span>&nbsp;hours.</p><p>Should you need any further assistance, do not hesitate to contact our Customer Support Hotline at <span data-editable-region="true" class="editable-region">Hotline Number</span>.</p><p>Yours sincerely,</p><p><span data-editable-region="true" class="editable-region">Name</span></p><p>Customer Support Team</p>`;

  standardValue = this.defaultContent;
  restrictedValue = this.defaultContent;

  // Standard mode configuration - allows normal editing
  standardConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,
    restrictedEditing: {
      initialMode: 'standard',
    },
  };

  // Restricted mode configuration - only allows editing in editable regions
  restrictedConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    bold: true,
    italic: true,
    underline: true,
    list: true,
    textStyleKit: true,
    restrictedEditing: {
      initialMode: 'restricted',
    },
  };

  onStandardEditorReady(editor: Editor): void {
    this.standardEditorInstance = editor;
  }

  onRestrictedEditorReady(editor: Editor): void {
    this.restrictedEditorInstance = editor;
  }
}
