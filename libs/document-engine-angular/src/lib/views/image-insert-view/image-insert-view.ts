import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core/bubble-menu/bubble-menu.type';
import { getImagePickHook, insertMediaResult, isInsertableResult } from './image-pick.util';
import { urlValidator } from '../../utils';
import { ButtonDirective } from '../../ui/button';
import { InputDirective } from '../../ui/input/input';
import { LabelDirective } from '../../ui/input/label';
import { ErrorMessageComponent } from '../../ui/input/error-message';

/**
 * Image insert view for the bubble menu.
 *
 * Two modes:
 *  - When the editor's `image` config supplies an async `onPick` hook, the view
 *    delegates selection to the consumer's media picker and inserts the result
 *    (an `image-ref` node when that node is enabled, else a plain image).
 *  - Otherwise it falls back to the built-in raw-URL input form.
 */
@Component({
  selector: 'document-engine-image-insert-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, InputDirective, LabelDirective, ErrorMessageComponent],
  template: `
    <div class="image-insert-view">
      <!-- Title -->
      <div class="image-insert-view__header">Insert Image</div>

      <!-- Picker mode: delegate selection to the consumer's media library -->
      <ng-container *ngIf="hasPicker; else urlForm">
        <div class="image-insert-view__content">
          <p class="image-insert-view__hint">Choose an image from your media library.</p>
        </div>
        <div class="image-insert-view__actions">
          <button type="button" documentEngineButton variant="ghost" [disabled]="loading" (click)="cancel()">
            Cancel
          </button>
          <button type="button" documentEngineButton variant="default" [disabled]="loading" (click)="pickImage()">
            {{ loading ? 'Loading…' : 'Choose from library' }}
          </button>
        </div>
      </ng-container>

      <!-- Fallback: built-in raw-URL input form -->
      <ng-template #urlForm>
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
      </ng-template>
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

  /** True while the consumer's `onPick` promise is in flight. */
  loading = false;

  imageForm = this.fb.nonNullable.group({
    url: this.fb.control('', [Validators.required, urlValidator]),
    alt: this.fb.control(''),
  });

  /** The consumer's media picker, read off the `image` extension options (if any). */
  private get onPick() {
    return this.editor ? getImagePickHook(this.editor) : undefined;
  }

  /** Whether to show the picker mode (vs the raw-URL fallback form). */
  get hasPicker(): boolean {
    return typeof this.onPick === 'function';
  }

  onActivate(): void {
    this.loading = false;
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

  /** Delegate selection to the consumer's media picker, then insert the result. */
  async pickImage(): Promise<void> {
    const onPick = this.onPick;
    if (!onPick || !this.editor || this.loading) return;

    this.loading = true;
    this.cdr.markForCheck();

    try {
      const result = await onPick();
      // Reject / resolve-nothing is a deliberate no-op (consumer cancelled). Only
      // close when something was actually inserted — an id-only result with no
      // `image-ref` node inserts nothing and must leave the view open.
      if (this.editor && isInsertableResult(result) && insertMediaResult(this.editor, result)) {
        this.close?.();
      }
    } catch {
      // Swallow: a rejected picker (e.g. dialog dismissed) must not crash the editor.
    } finally {
      this.loading = false;
      this.cdr.markForCheck();
    }
  }

  cancel(): void {
    this.close?.();
  }
}
