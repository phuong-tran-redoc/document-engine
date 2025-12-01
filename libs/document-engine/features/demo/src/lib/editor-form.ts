import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  DocumentEditorComponent,
  DocumentEditorModule,
  DocumentEngineConfig,
  Editor,
  TiptapEditorDirective,
} from '@phuong-tran-redoc/document-engine-angular';
import { BP1, BP_Multi, BP_Single } from './misc/biz-prop';

/**
 * Editor Form demo - demonstrates usage with Angular Reactive Forms
 * Shows how to use editor with FormGroup and FormControl
 */
@Component({
  selector: 'document-engine-editor-form',
  imports: [CommonModule, ReactiveFormsModule, DocumentEditorModule, TiptapEditorDirective],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Form Integration Demo</h2>
      <p class="text-sm m-0 text-muted-foreground">
        Demonstrates editor integration with Angular Reactive Forms (FormGroup)
      </p>

      <form [formGroup]="editorForm" class="flex flex-col gap-4">
        <!-- Title Input -->
        <div class="flex flex-col gap-2">
          <label for="title" class="text-sm font-medium text-foreground">Document Title</label>
          <input
            id="title"
            type="text"
            formControlName="title"
            placeholder="Enter document title..."
            class="px-3 py-2 border border-border rounded-md bg-background text-foreground"
          />
          @if (editorForm.get('title')?.hasError('required') && editorForm.get('title')?.touched) {
          <span class="text-xs text-red-500">Title is required</span>
          }
        </div>

        <!-- Editor Content -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-foreground" for="content">Document Content</label>
          <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
            <tiptap-editor [editor]="docEditor.editor" formControlName="content" id="content"></tiptap-editor>
          </document-engine-editor>
          @if (editorForm.get('content')?.hasError('required') && editorForm.get('content')?.touched) {
          <span class="text-xs text-red-500">Content is required</span>
          }
        </div>

        <!-- Description Input -->
        <div class="flex flex-col gap-2">
          <label for="description" class="text-sm font-medium text-foreground">Description</label>
          <textarea
            id="description"
            formControlName="description"
            placeholder="Enter document description..."
            rows="3"
            class="px-3 py-2 border border-border rounded-md bg-background text-foreground resize-none"
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex gap-2 items-center">
          <button
            type="button"
            (click)="onSubmit()"
            [disabled]="editorForm.invalid"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Form
          </button>
          <button
            type="button"
            (click)="onReset()"
            class="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/90"
          >
            Reset Form
          </button>
          <button
            type="button"
            (click)="onPatchValue()"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90"
          >
            Patch Value
          </button>
          <button
            type="button"
            (click)="toggleDisabled()"
            class="px-4 py-2 border border-border rounded-md hover:bg-muted"
          >
            {{ editorForm.disabled ? 'Enable' : 'Disable' }} Form
          </button>
        </div>

        <!-- Form Status -->
        <div class="flex flex-col gap-2 p-4 bg-muted rounded-md">
          <h3 class="text-sm font-semibold m-0">Form Status</h3>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span class="font-medium">Valid:</span>
              <span class="ml-2" [class.text-green-600]="editorForm.valid" [class.text-red-600]="!editorForm.valid">
                {{ editorForm.valid }}
              </span>
            </div>
            <div>
              <span class="font-medium">Pristine:</span>
              <span class="ml-2">{{ editorForm.pristine }}</span>
            </div>
            <div>
              <span class="font-medium">Touched:</span>
              <span class="ml-2">{{ editorForm.touched }}</span>
            </div>
            <div>
              <span class="font-medium">Disabled:</span>
              <span class="ml-2">{{ editorForm.disabled }}</span>
            </div>
          </div>
        </div>

        <!-- Form Value Display -->
        <div class="flex flex-col gap-2 p-4 bg-muted rounded-md">
          <h3 class="text-sm font-semibold m-0">Form Value (JSON)</h3>
          <pre class="text-xs overflow-auto max-h-64 m-0 p-2 bg-background rounded">{{ formValueJson }}</pre>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorFormComponent {
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  docEditor = viewChild<DocumentEditorComponent>('docEditor');
  editor?: Editor;

  // Create FormGroup with validators
  editorForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    content: [BP_Multi, Validators.required],
    description: [''],
  });

  // Editor configuration
  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    fontSize: true,

    resetFormat: true,
    textStyleKit: true,

    bold: true,
    italic: true,
    underline: true,

    subscript: true,
    superscript: true,

    textAlign: true,
    indent: true,

    tables: true,
    pageBreak: true,
    dynamicField: true,

    list: true,
  };

  constructor() {
    console.log('Finish form constructor');
    // Subscribe to form value changes to display in template
    this.editorForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      // Trigger change detection for formValueJson
      console.log('Form value changed:', value);
    });
  }

  get formValueJson(): string {
    return JSON.stringify(this.editorForm.value, null, 2);
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;
    console.log('Editor is ready!', editor);
  }

  onSubmit(): void {
    if (this.editorForm.valid) {
      console.log('Form submitted!', this.editorForm.value);
      alert('Form submitted successfully! Check console for form data.');
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to show validation errors
      this.editorForm.markAllAsTouched();
    }
  }

  onReset(): void {
    this.editorForm.reset({
      title: '',
      content: '<p>Reset content...</p>',
      description: '',
    });
    console.log('Form reset');
  }

  onPatchValue(): void {
    this.editorForm.patchValue({
      title: 'Sample Document Title',
      content:
        '<p>This is <strong>patched content</strong> with <em>formatting</em>!</p><p>Multiple paragraphs work too.</p>',
      description: 'A sample description for the document',
    });
    console.log('Form value patched');
  }

  toggleDisabled(): void {
    if (this.editorForm.disabled) {
      this.editorForm.enable();
    } else {
      this.editorForm.disable();
    }
  }
}
