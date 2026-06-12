import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorModule,
  DocumentEngineConfig,
  Editor,
  MediaResult,
} from '@phuong-tran-redoc/document-engine-angular';

interface HydratedFigure {
  imageId: string;
  caption: string | null;
  captionPosition: 'top' | 'bottom';
  url: string;
}

/**
 * Demo for the URL-free `image-ref` node (DE-004).
 *
 * Shows the three sides of the contract:
 *  1. In the editor the node is a placeholder (it has no URL to show).
 *  2. The exported HTML is a semantic `<figure data-block="image-ref" data-image-id>`.
 *  3. A consumer "hydrates" that figure by reading `data-image-id` and resolving
 *     the real image — emulated here with a sample id -> URL resolver.
 */
@Component({
  selector: 'document-engine-editor-image-ref',
  imports: [CommonModule, FormsModule, DocumentEditorModule],
  template: `
    <div class="flex flex-col gap-4 p-4 max-w-5xl mx-auto h-full">
      <h2 class="text-2xl font-semibold m-0 text-foreground">Image Ref (placeholder + hydrate)</h2>
      <p class="text-sm m-0 text-muted-foreground">
        A URL-free media reference. The document stores only an <code>imageId</code>; the real image is
        resolved by the consumer at render time. Insert via the form below, or via the toolbar image button —
        which calls the consumer's <code>image.onPick</code> media picker (mocked here) and inserts the result
        as an <code>image-ref</code>.
      </p>

      <!-- Insert controls -->
      <div class="flex flex-wrap items-end gap-2 rounded-md border border-border p-3">
        <label class="flex flex-col gap-1 text-xs text-muted-foreground">
          Image id
          <input
            class="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
            [(ngModel)]="newImageId"
            placeholder="media_lobby"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs text-muted-foreground">
          Caption (optional)
          <input
            class="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
            [(ngModel)]="newCaption"
            placeholder="Main lobby"
          />
        </label>
        <label class="flex flex-col gap-1 text-xs text-muted-foreground">
          Caption position
          <select
            class="rounded border border-border bg-background px-2 py-1 text-sm text-foreground"
            [(ngModel)]="newPosition"
          >
            <option value="bottom">bottom</option>
            <option value="top">top</option>
          </select>
        </label>
        <button
          class="rounded bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
          [disabled]="!newImageId.trim()"
          (click)="insert()"
        >
          Insert image-ref
        </button>
      </div>

      <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
        <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
      </document-engine-editor>

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Exported HTML (what a backend / consumer receives) -->
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold m-0 text-foreground">Exported HTML (the contract)</h3>
          <pre class="overflow-auto rounded-md border border-border bg-muted p-3 text-xs text-foreground">{{ value }}</pre>
        </div>

        <!-- Consumer-side hydration preview -->
        <div class="flex flex-col gap-1">
          <h3 class="text-sm font-semibold m-0 text-foreground">Consumer hydration (sample resolver)</h3>
          <div class="flex flex-col gap-3 rounded-md border border-border p-3">
            @for (fig of hydrated; track fig.imageId) {
              <figure class="m-0 flex flex-col gap-1">
                @if (fig.caption && fig.captionPosition === 'top') {
                  <figcaption class="text-xs text-muted-foreground text-center">{{ fig.caption }}</figcaption>
                }
                <img class="w-full rounded" [src]="fig.url" [alt]="fig.caption || fig.imageId" />
                @if (fig.caption && fig.captionPosition !== 'top') {
                  <figcaption class="text-xs text-muted-foreground text-center">{{ fig.caption }}</figcaption>
                }
              </figure>
            } @empty {
              <p class="text-xs text-muted-foreground m-0">No image-ref nodes yet — insert one above.</p>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorImageRefComponent {
  editor?: Editor;

  newImageId = '';
  newCaption = '';
  newPosition: 'top' | 'bottom' = 'bottom';

  value = `<p>Drag, select or delete the placeholder below. Insert more with the controls above.</p>
    <figure data-block="image-ref" data-image-id="media_lobby" data-caption-position="bottom"><figcaption>Main lobby</figcaption></figure>
    <p>The document never stores a URL — only the id.</p>`;

  editorConfig: Partial<DocumentEngineConfig> = {
    undoRedo: true,
    bold: true,
    italic: true,
    heading: true,
    imageRef: true,
    showToolbar: true,
    // The toolbar image button delegates to this consumer hook instead of asking
    // for a raw URL. Here it's a stand-in for a real media dialog.
    image: { onPick: () => this.pickMedia() },
    showFooter: true,
  };

  private pickIndex = 0;

  /** Sample media library — a real consumer would call its own media service. */
  private readonly sampleImages: Record<string, string> = {
    media_lobby: 'https://picsum.photos/seed/lobby/640/360',
    media_office: 'https://picsum.photos/seed/office/640/360',
    media_view: 'https://picsum.photos/seed/view/640/360',
  };

  onEditorReady(editor: Editor): void {
    this.editor = editor;
  }

  /**
   * Stand-in for a consumer's async media picker (e.g. a dialog hitting a media
   * service). Resolves the next sample as a `MediaResult`; the editor inserts it
   * as an `image-ref` because that node is enabled.
   */
  pickMedia(): Promise<MediaResult> {
    const ids = Object.keys(this.sampleImages);
    const id = ids[this.pickIndex % ids.length];
    this.pickIndex++;
    return Promise.resolve({ id, url: this.sampleImages[id], alt: id.replace('media_', '') });
  }

  insert(): void {
    const imageId = this.newImageId.trim();
    if (!this.editor || !imageId) return;

    this.editor.commands.insertImageRef({
      imageId,
      caption: this.newCaption.trim() || null,
      captionPosition: this.newPosition,
    });

    this.newImageId = '';
    this.newCaption = '';
  }

  /** Emulate consumer hydration: parse the exported HTML and resolve each id. */
  get hydrated(): HydratedFigure[] {
    if (typeof DOMParser === 'undefined') return [];

    const doc = new DOMParser().parseFromString(this.value, 'text/html');
    return Array.from(doc.querySelectorAll('figure[data-block="image-ref"]')).map((figure) => {
      const imageId = figure.getAttribute('data-image-id') ?? '';
      const caption = figure.querySelector('figcaption')?.textContent?.trim() || null;
      const captionPosition = figure.getAttribute('data-caption-position') === 'top' ? 'top' : 'bottom';
      return { imageId, caption, captionPosition, url: this.resolve(imageId) };
    });
  }

  private resolve(imageId: string): string {
    return this.sampleImages[imageId] ?? `https://picsum.photos/seed/${encodeURIComponent(imageId)}/640/360`;
  }
}
