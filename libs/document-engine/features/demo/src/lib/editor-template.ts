import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import {
  DocumentEditorModule,
  DocumentEngineConfig,
  TiptapEditorDirective,
} from '@phuong-tran-redoc/document-engine-angular';
import { Subject } from 'rxjs';
import { BP1, BP_2, BP_Multi, BP_Single } from './misc/biz-prop';

/**
 * Template Editor - Two-tab screen for template selection and editing
 * Tab 1: Template selection form
 * Tab 2: Editor for viewing/editing selected template
 */
@Component({
  selector: 'document-engine-editor-template',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    DocumentEditorModule,
    TiptapEditorDirective,
  ],
  template: `
    <div class="template-editor-container">
      <h2>Template Editor</h2>

      <mat-tab-group [(selectedIndex)]="selectedTabIndex" animationDuration="300ms">
        <!-- Tab 1: Template Selection -->
        <mat-tab label="Select Template">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Choose a Template</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="templateSelectionForm" class="template-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Template</mat-label>
                    <mat-select formControlName="selectedTemplate" (selectionChange)="onTemplateSelected()">
                      <mat-option *ngFor="let template of templates" [value]="template.key">
                        {{ template.name }}
                      </mat-option>
                    </mat-select>
                    <mat-hint>Select a template to edit</mat-hint>
                  </mat-form-field>

                  <div class="template-description" *ngIf="selectedTemplateInfo()">
                    <h3>{{ selectedTemplateInfo()?.name }}</h3>
                    <p>{{ selectedTemplateInfo()?.description }}</p>
                  </div>

                  <div class="actions">
                    <button
                      mat-raised-button
                      color="primary"
                      type="button"
                      [disabled]="!templateSelectionForm.value.selectedTemplate"
                      (click)="openEditor()"
                    >
                      Open in Editor
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- Tab 2: Editor -->
        <mat-tab label="Editor">
          <div class="tab-content">
            <!-- Show message if no template selected -->
            <mat-card *ngIf="!templateSelectionForm.valid">
              <mat-card-content>
                <div class="no-template-message">
                  <p>No template selected</p>
                  <button mat-raised-button color="primary" (click)="backToSelection()">Select Template</button>
                </div>
              </mat-card-content>
            </mat-card>

            <!-- Show editor form if template selected -->
            <mat-card *ngIf="templateSelectionForm.valid">
              <mat-card-header>
                <mat-card-title>
                  {{ selectedTemplateInfo()?.name || 'Document Editor' }}
                </mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <form [formGroup]="editorForm" class="editor-form">
                  <mat-form-field appearance="outline" class="full-width">
                    <mat-label>Title</mat-label>
                    <input matInput formControlName="title" placeholder="Enter document title" />
                  </mat-form-field>

                  <div class="editor-wrapper">
                    <document-engine-editor #docEditor [config]="editorConfig">
                      <tiptap-editor
                        [editor]="docEditor.editor"
                        formControlName="content"
                        outputFormat="html"
                      ></tiptap-editor>
                    </document-engine-editor>
                  </div>

                  <div class="actions">
                    <button mat-button type="button" (click)="backToSelection()">Back to Selection</button>
                    <button
                      mat-raised-button
                      color="primary"
                      type="button"
                      [disabled]="editorForm.invalid"
                      (click)="saveDocument()"
                    >
                      Save Document
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Debug Info -->
      <mat-card class="debug-card" *ngIf="showDebugInfo">
        <mat-card-header>
          <mat-card-title>Debug Information</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <h4>Template Selection Form:</h4>
          <pre>{{ templateSelectionForm.value | json }}</pre>

          <h4>Editor Form:</h4>
          <pre>{{ editorForm.value | json }}</pre>

          <h4>Current Template:</h4>
          <pre>{{ selectedTemplateInfo() | json }}</pre>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [
    `
      .template-editor-container {
        padding: 24px;
        max-width: 1400px;
        margin: 0 auto;
      }

      h2 {
        margin-bottom: 24px;
        color: var(--foreground);
      }

      .tab-content {
        padding: 24px 0;
      }

      .template-form,
      .editor-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .full-width {
        width: 100%;
      }

      .template-description {
        padding: 16px;
        background-color: var(--muted);
        border-radius: 4px;
        margin-top: 8px;

        h3 {
          margin-top: 0;
          color: var(--primary);
        }

        p {
          margin-bottom: 0;
          color: var(--muted-foreground);
        }
      }

      .editor-wrapper {
        border: 1px solid var(--border);
        border-radius: 4px;
        min-height: 600px;
        display: flex;
        flex-direction: column;
      }

      /* Style for document-engine-editor to ensure it fills wrapper */
      document-engine-editor {
        flex: 1;
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin-top: 16px;
      }

      .no-template-message {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 24px;
        text-align: center;
        gap: 20px;

        p {
          font-size: 18px;
          color: var(--muted-foreground);
          margin: 0;
        }
      }

      .debug-card {
        margin-top: 24px;
        background-color: var(--muted);

        pre {
          background-color: var(--card);
          padding: 12px;
          border-radius: 4px;
          overflow-x: auto;
          color: var(--foreground);
        }
      }

      ::ng-deep .mat-mdc-tab-body-content {
        overflow: visible !important;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorTemplateComponent {
  private fb = inject(FormBuilder);

  // Available templates
  templates = [
    {
      key: 'BP1',
      name: 'Facility Letter - Full',
      description: 'Complete facility letter with all sections including borrower details, facilities, and terms',
      content: BP1,
    },
    {
      key: 'BP_Single',
      name: 'Facility Letter - Single Tier',
      description: 'Single-tiered facility letter with standard OD terms',
      content: BP_Single,
    },
    {
      key: 'BP_Multi',
      name: 'Facility Letter - Multi Tier',
      description: 'Multi-tiered facility letter with TL terms and repayment schedules',
      content: BP_Multi,
    },
    {
      key: 'BP_2',
      name: 'Facility Letter - Alternative',
      description: 'Alternative facility letter format',
      content: BP_2,
    },
  ];

  // Tab index
  selectedTabIndex = 0;

  // Signal for selected template info
  selectedTemplateInfo = signal<(typeof this.templates)[0] | null>(null);

  // Debug mode
  showDebugInfo = true;

  // RxJS Subject for communication between tabs
  private templateSelected$ = new Subject<string>();

  // Editor Configuration
  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    fontSize: true,
    resetFormat: true,
    textStyleKit: true,
    bold: true,
    italic: true,
    underline: true,
    subscript: true,
    textAlign: true,
    list: true,
    indent: true,
    image: true,
    link: true,
    tables: true,
    pageBreak: true,
    dynamicField: true,
  };

  // Form Groups
  templateSelectionForm: FormGroup = this.fb.group({
    selectedTemplate: ['', Validators.required],
  });

  editorForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    content: ['', Validators.required],
  });

  constructor() {
    // Subscribe to template selection changes
    this.templateSelected$.pipe(takeUntilDestroyed()).subscribe((templateKey) => {
      const template = this.templates.find((t) => t.key === templateKey);
      if (template) {
        this.selectedTemplateInfo.set(template);
        // Update editor form with selected template
        this.editorForm.patchValue({
          title: template.name,
          content: template.content,
        });
      }
    });

    // Also listen to form value changes directly
    this.templateSelectionForm.controls['selectedTemplate'].valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value) {
          this.templateSelected$.next(value);
        }
      });
  }

  /**
   * Called when template is selected from dropdown
   */
  onTemplateSelected(): void {
    const selectedKey = this.templateSelectionForm.value.selectedTemplate;
    if (selectedKey) {
      console.log('Template selected:', selectedKey);
      this.templateSelected$.next(selectedKey);
    }
  }

  /**
   * Switch to editor tab
   */
  openEditor(): void {
    if (this.templateSelectionForm.valid) {
      this.selectedTabIndex = 1;
    }
  }

  /**
   * Go back to template selection tab
   */
  backToSelection(): void {
    this.selectedTabIndex = 0;
  }

  /**
   * Save the document
   */
  saveDocument(): void {
    if (this.editorForm.valid) {
      const formData = this.editorForm.value;
      console.log('Saving document:', {
        title: formData.title,
        template: this.selectedTemplateInfo()?.key,
        contentLength: formData.content?.length || 0,
      });

      // Here you would typically send data to backend
      alert(`Document "${formData.title}" saved successfully!`);
    }
  }
}
