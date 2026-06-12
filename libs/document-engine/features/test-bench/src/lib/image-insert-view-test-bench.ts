import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { Editor, Extensions } from '@tiptap/core';
import { Document } from '@tiptap/extension-document';
import { Image } from '@tiptap/extension-image';
import { Paragraph } from '@tiptap/extension-paragraph';
import { Text } from '@tiptap/extension-text';
import { ImageRef } from '@phuong-tran-redoc/document-engine-core';
import { ImageInsertViewComponent, MediaResult } from '@phuong-tran-redoc/document-engine-angular';

/**
 * Test bench for the bubble-menu Image Insert View (`image-insert-view.ts`),
 * for Playwright E2E.
 *
 * The view is a bubble-menu content component (it has no route of its own), so
 * this bench mounts it directly and wires it imperatively — exactly as the bubble
 * menu does at runtime: set `editor` / `close` / `goBack`, then call `onActivate()`.
 *
 * Two modes, selected by the `?picker` query param so the same bench covers both
 * branches of the view:
 *  - default (`/test-bench/image-insert`): no `image.onPick` → the built-in
 *    raw-URL fallback form.
 *  - `?picker` (`/test-bench/image-insert?picker=1`): `image.onPick` supplied +
 *    `imageRef` enabled → the "Choose from library" picker that inserts an
 *    `image-ref` node from the resolved `MediaResult`.
 *
 * `close()` / `goBack()` flips a flag (rendered as a `data-testid`) so a test can
 * assert the view asked to close / go back. The editor is exposed on
 * `window.__EDITOR__`; `window.__VIEW_READY__` signals wiring is done.
 */
@Component({
  selector: 'document-engine-image-insert-view-test-bench',
  imports: [CommonModule, ImageInsertViewComponent],
  template: `
    <div class="container">
      <div class="view-host">
        <document-engine-image-insert-view></document-engine-image-insert-view>
      </div>

      <div class="status">
        <span data-testid="mode">{{ pickerMode ? 'picker' : 'url' }}</span>
        <span data-testid="closed">{{ closed }}</span>
        <span data-testid="went-back">{{ wentBack }}</span>
      </div>

      <!-- Make the next picker call resolve null (consumer cancelled) so the
           "picker cancel inserts nothing" path is testable deterministically. -->
      <button data-testid="btn-picker-cancel" type="button" (click)="pickerReturnsNull = true">
        Make picker cancel
      </button>
    </div>
  `,
  styles: [
    `
      .container {
        padding: 20px;
      }
      .view-host {
        max-width: 360px;
        border: 1px solid #ccc;
        border-radius: 8px;
      }
      .status {
        margin-top: 16px;
        display: flex;
        gap: 12px;
        font-family: monospace;
      }
      button {
        margin-top: 12px;
        padding: 8px 16px;
      }
    `,
  ],
})
export class ImageInsertViewTestBenchComponent implements OnInit, AfterViewInit {
  @ViewChild(ImageInsertViewComponent) private view!: ImageInsertViewComponent;
  private cdr = inject(ChangeDetectorRef);

  editor!: Editor;
  pickerMode = false;
  closed = false;
  wentBack = false;
  pickerReturnsNull = false;

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'image-insert-view');
    this.pickerMode = new URLSearchParams(window.location.search).has('picker');

    // In picker mode the Image extension carries the consumer's `onPick` hook
    // (read back by the view via `getImagePickHook`), and `imageRef` is enabled so
    // a picked result inserts a URL-free `image-ref` node.
    const imageOptions = this.pickerMode ? { onPick: () => this.pick() } : {};
    const extensions: Extensions = [
      Document,
      Paragraph,
      Text,
      // `onPick` is a document-engine addition to the Image options; cast past the
      // upstream ImageOptions type (the kit does the same).
      Image.configure(imageOptions as Record<string, unknown>),
    ];
    if (this.pickerMode) extensions.push(ImageRef);

    this.editor = new Editor({ extensions, content: '<p></p>' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = this.editor;
  }

  ngAfterViewInit(): void {
    // Wire the view imperatively, mirroring the bubble menu.
    this.view.editor = this.editor;
    this.view.close = () => {
      this.closed = true;
      this.cdr.detectChanges();
    };
    this.view.goBack = () => {
      this.wentBack = true;
      this.cdr.detectChanges();
    };
    this.view.onActivate();
    this.cdr.detectChanges();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__VIEW_READY__ = true;
    console.log(
      `[ImageInsertViewTestBench] ready (mode=${this.pickerMode ? 'picker' : 'url'}), exposed window.__EDITOR__`,
    );
  }

  /** Deterministic stand-in for a consumer media picker. */
  private pick(): Promise<MediaResult | null> {
    if (this.pickerReturnsNull) return Promise.resolve(null);
    return Promise.resolve({ id: 'media_test', url: 'https://example.com/test.jpg', alt: 'A test image' });
  }
}
