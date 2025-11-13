import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEngineConfig,
  Editor,
  TiptapEditorDirective,
} from '@phuong-tran-redoc/document-engine-angular';
import { T1, T2, T3, T4, T5 } from './content/lo-bizprop-content';

interface Section {
  title: string;
  description: string;
  content: string;
}

/**
 * Template B component
 * 5 sections with content from bizprop
 */
@Component({
  selector: 'document-engine-template-b',
  imports: [CommonModule, FormsModule, DocumentEditorComponent, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-6 p-4 max-w-7xl mx-auto h-full mb-4">
      <div>
        <h2 class="text-2xl font-semibold m-0 text-foreground">Template B</h2>
        <p class="text-sm m-0 text-muted-foreground">Template B with 5 sections from bizprop</p>
      </div>

      @for (section of sections; track $index) {
      <div class="flex flex-col gap-3">
        <div>
          <h3 class="text-lg font-semibold m-0 text-foreground">{{ section.title }}</h3>
          <p class="text-sm m-0 text-muted-foreground">{{ section.description }}</p>
        </div>

        <document-engine-editor [config]="editorConfig" (editorReady)="onEditorReady($event, $index)">
          @if (editors[$index](); as editor) {
          <tiptap-editor [editor]="editor" [ngModel]="section.content"></tiptap-editor>
          }
        </document-engine-editor>
      </div>
      }

      <!-- For spacing -->
      <div class="h-4 shrink-0"></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateBComponent {
  editors = [
    signal<Editor | undefined>(undefined),
    signal<Editor | undefined>(undefined),
    signal<Editor | undefined>(undefined),
    signal<Editor | undefined>(undefined),
    signal<Editor | undefined>(undefined),
  ];

  sections: Section[] = [
    {
      title: 'Section 1',
      description: '',
      content: T1,
    },
    {
      title: 'Section 2',
      description: '',
      content: T2,
    },
    {
      title: 'Section 3',
      description: '',
      content: T3,
    },
    {
      title: 'Section 4',
      description: '',
      content: T4,
    },
    {
      title: 'Section 5',
      description: '',
      content: T5,
    },
  ];

  // Readonly editor configuration - no toolbar, no footer
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

    editable: false,
    showFooter: false,
    showToolbar: false,
  };

  onEditorReady(editor: Editor, index: number): void {
    this.editors[index].set(editor);
  }
}
