import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { getActiveMarkRange } from '@phuong-tran-redoc/document-engine-core';
import { Editor } from '@tiptap/core';
import { BubbleMenuViewContent } from '../../core/bubble-menu/bubble-menu.type';
import { urlValidator } from '../../utils';
import { ButtonDirective } from '../../ui/button';
import { InputDirective } from '../../ui/input/input';
import { LabelDirective } from '../../ui/input/label';
import { ErrorMessageComponent } from '../../ui/input/error-message';

interface LinkAttrs {
  href?: string;
  target?: string;
  rel?: string;
}

interface LinkFormControls {
  url: FormControl<string>;
  displayText: FormControl<string>;
}

/**
 * Edit view for link bubble menu
 * Shows when creating a new link or editing an existing one
 * Provides URL input, display text input, and quick link shortcuts
 */
@Component({
  selector: 'document-engine-link-edit-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonDirective, InputDirective, LabelDirective, ErrorMessageComponent],
  template: `
    <div class="link-edit-view">
      <!-- Title -->
      <div class="link-edit-view__header">
        {{ isNewLink ? 'Add Link' : 'Edit Link' }}
      </div>

      <!-- Content -->
      <form [formGroup]="linkForm" (ngSubmit)="applyLink()">
        <div class="link-edit-view__content">
          <!-- URL input -->
          <div class="link-edit-view__field">
            <label documentEngineLabel for="url-input">URL</label>
            <input
              #urlInput
              documentEngineInput
              id="url-input"
              formControlName="url"
              placeholder="https://example.com"
              [attr.aria-invalid]="linkForm.controls.url.invalid && linkForm.controls.url.touched"
            />
            <document-engine-error-message
              *ngIf="linkForm.controls.url.hasError('required') && linkForm.controls.url.touched"
            >
              This field is required
            </document-engine-error-message>
            <document-engine-error-message
              *ngIf="linkForm.controls.url.hasError('url') && linkForm.controls.url.touched"
            >
              Enter a valid URL
            </document-engine-error-message>
          </div>

          <!-- Display text input -->
          <div class="link-edit-view__field">
            <label documentEngineLabel for="display-text-input">Display Text</label>
            <input documentEngineInput id="display-text-input" formControlName="displayText" placeholder="Click here" />
          </div>
        </div>

        <!-- Link shortcuts -->
        <!-- <div class="link-edit-view__shortcuts">
          <span class="link-edit-view__shortcuts-label">Quick links:</span>

          <div class="chip-set">
            <button
              type="button"
              class="chip"
              *ngFor="let shortcut of linkShortcuts"
              (click)="applyShortcut(shortcut.url)"
            >
              {{ shortcut.label }}
            </button>
          </div>
        </div> -->

        <!-- Actions -->
        <div class="link-edit-view__actions">
          <button type="button" documentEngineButton variant="ghost" (click)="cancel()">Cancel</button>

          <button type="submit" documentEngineButton variant="default" [disabled]="!canApply()">
            {{ isNewLink ? 'Insert' : 'Update' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./link-edit-view.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinkEditViewComponent implements BubbleMenuViewContent<LinkAttrs> {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);

  editor?: Editor;
  position?: { from: number; to: number };

  goBack?: (viewId?: string) => void;
  close?: () => void;

  linkForm = this.fb.nonNullable.group({
    url: this.fb.control('', [Validators.required, urlValidator]),
    displayText: this.fb.control(''),
  });

  isNewLink = true;
  linkShortcuts = [
    { label: 'Google', url: 'https://google.com' },
    { label: 'GitHub', url: 'https://github.com' },
    { label: 'Docs', url: 'https://docs.example.com' },
  ];

  onActivate(attrs: LinkAttrs): void {
    // Check if we're editing existing link or creating new
    this.isNewLink = !attrs.href;

    if (!this.editor) return;

    // Set URL from attrs
    this.linkForm.controls.url.setValue(attrs.href || '');
    this.linkForm.controls.url.markAsUntouched();

    const selection = this.editor.state.selection;
    const mark = getActiveMarkRange(this.editor, 'link');

    // Determine the range to use: selection if not empty, otherwise mark range
    let range: { from: number; to: number } | undefined;

    if (!selection.empty) {
      // User has text selected
      range = { from: selection.from, to: selection.to };
    } else if (mark) {
      // Cursor is inside an existing link
      range = { from: mark.from, to: mark.to };
    }

    // Set position and display text based on the determined range
    this.position = range;

    if (range) {
      const text = this.editor.state.doc.textBetween(range.from, range.to, ' ');
      this.linkForm.controls.displayText.setValue(text || '');
    } else {
      // No selection and not inside a link - empty display text
      this.linkForm.controls.displayText.setValue('');
    }

    this.cdr.markForCheck();
  }

  applyShortcut(url: string): void {
    this.linkForm.controls.url.setValue(url);
  }

  canApply(): boolean {
    return this.linkForm.valid && !!this.linkForm.controls.url.value;
  }

  applyLink(): void {
    if (!this.canApply() || !this.editor) return;

    const url = this.normalizeUrl(this.linkForm.controls.url.value || '');
    const displayText = this.linkForm.controls.displayText.value;
    const { empty } = this.editor.state.selection;

    const apply = (editor: Editor) => {
      // If display text provided, replace selection with it and apply link
      if (displayText && displayText.trim() && this.position) {
        editor
          .chain()
          .focus()
          .setTextSelection(this.position)
          .insertContent({
            type: 'text',
            text: displayText,
            marks: [{ type: 'link', attrs: { href: url, target: '_blank' } }],
          })
          .run();
        return;
      }

      // Apply link to existing selection (selection exists and no custom text)
      if (!empty) {
        editor.chain().focus().setLink({ href: url, target: '_blank' }).run();
        return;
      }

      // No selection and no display text - insert URL as link text
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: displayText || url,
          marks: [{ type: 'link', attrs: { href: url, target: '_blank' } }],
        })
        .run();
    };

    apply(this.editor);
    this.close?.(); // Close after applying
  }

  cancel(): void {
    if (this.isNewLink) {
      this.close?.(); // Close if creating new link
    } else {
      this.goBack?.('main'); // Go back to main if editing existing link
    }
  }

  private normalizeUrl(input: string): string {
    if (!input) return input;
    if (/^(https?:|mailto:|tel:)/i.test(input)) return input;
    return `https://${input.trim()}`;
  }
}
