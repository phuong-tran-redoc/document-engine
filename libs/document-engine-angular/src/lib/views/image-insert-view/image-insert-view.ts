import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core';
import { urlValidator } from '../../utils';
import { ButtonDirective } from '../../ui/button';
import { InputDirective, LabelDirective, ErrorMessageComponent } from '../../ui/input';

/**
 * Temporary image insert view for bubble menu
 * Provides URL input for inserting images via link
 * This is a temporary solution until full upload flow is implemented
 */
@Component({
  selector: 'document-engine-image-insert-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, InputDirective, LabelDirective, ErrorMessageComponent],
  template: `
    <div class="image-insert-view">
      <!-- Title -->
      <div class="image-insert-view__header">Insert Image</div>

      <!-- Content -->
      <form [formGroup]="imageForm" (ngSubmit)="insertImage()">
        <div class="image-insert-view__content">
          <!-- Image URL input -->
          <div class="image-insert-view__field">
            <label documentEngineLabel for="url-input">Image URL</label>
            <input
              #urlInput
              documentEngineInput
              id="url-input"
              formControlName="url"
              placeholder="https://example.com/image.jpg"
              [attr.aria-invalid]="imageForm.controls.url.invalid && imageForm.controls.url.touched"
            />
            <document-engine-error-message
              *ngIf="imageForm.controls.url.hasError('required') && imageForm.controls.url.touched"
            >
              This field is required
            </document-engine-error-message>
            <document-engine-error-message
              *ngIf="imageForm.controls.url.hasError('url') && imageForm.controls.url.touched"
            >
              Enter a valid URL
            </document-engine-error-message>
          </div>

          <!-- Alt text input -->
          <div class="image-insert-view__field">
            <label documentEngineLabel for="alt-input">Alt Text</label>
            <input documentEngineInput id="alt-input" formControlName="alt" placeholder="Describe the image" />
          </div>
        </div>

        <!-- Actions -->
        <div class="image-insert-view__actions">
          <button type="button" documentEngineButton variant="ghost" (click)="cancel()">Cancel</button>

          <button type="submit" documentEngineButton variant="default" [disabled]="!canInsert()">Insert Image</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./image-insert-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageInsertViewComponent implements BubbleMenuViewContent<Record<string, unknown>> {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  editor?: Editor;

  close?: () => void;
  goBack?: (viewId?: string) => void;

  imageForm = this.fb.nonNullable.group({
    url: this.fb.control('', [Validators.required, urlValidator]),
    alt: this.fb.control(''),
  });

  onActivate(): void {
    this.imageForm.reset();
    this.imageForm.controls.url.markAsUntouched();
    this.cdr.markForCheck();
  }

  canInsert(): boolean {
    return this.imageForm.valid && !!this.imageForm.controls.url.value;
  }

  insertImage(): void {
    if (!this.canInsert() || !this.editor) return;

    const url = this.imageForm.controls.url.value || '';
    const alt = this.imageForm.controls.alt.value || '';

    // Insert image at current cursor position
    this.editor.chain().focus().setImage({ src: url, alt }).run();

    this.close?.();
  }

  cancel(): void {
    this.close?.();
  }
}
