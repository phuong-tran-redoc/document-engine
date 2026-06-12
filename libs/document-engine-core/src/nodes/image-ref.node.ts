import { Node, mergeAttributes } from '@tiptap/core';
import type { DOMOutputSpec } from '@tiptap/pm/model';

/**
 * Where the caption sits relative to the image.
 */
export type ImageRefCaptionPosition = 'top' | 'bottom';

/**
 * Attributes carried by an `image-ref` node.
 *
 * Only `imageId` is required. The node is intentionally **presentation-free**:
 * it stores an opaque media id, never a URL or width/style. The real responsive
 * image is resolved downstream (consumer side) from `imageId`.
 */
export interface ImageRefAttributes {
  imageId: string;
  /** Plain text only — serialized as `<figcaption>` text content; any nested markup is flattened on round-trip. */
  caption?: string | null;
  captionPosition?: ImageRefCaptionPosition | null;
}

export interface ImageRefOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageRef: {
      /** Insert an `image-ref` block. `imageId` is required. */
      insertImageRef: (attributes: ImageRefAttributes) => ReturnType;
    };
  }
}

/**
 * `image-ref` — a semantic, URL-free reference to a media asset.
 *
 * Renders a `<figure data-block="image-ref" data-image-id="…">` (with an optional
 * `<figcaption>`), decoupling document content from the resolved image URL. The
 * consumer hydrates the figure by attribute (`data-image-id`) at render time —
 * the document itself never embeds a URL or any presentation. In the editor the
 * node shows a placeholder (it has no URL to display); resolving and showing the
 * real image is the consumer's / media-picker's job.
 */
export const ImageRef = Node.create<ImageRefOptions>({
  name: 'imageRef',

  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      imageId: {
        default: null,
        parseHTML: (element) => element.getAttribute('data-image-id'),
        renderHTML: (attributes) => {
          if (!attributes['imageId']) return {};
          return { 'data-image-id': attributes['imageId'] };
        },
      },
      caption: {
        default: null,
        // Caption is rendered as <figcaption> text content (below), not a data
        // attribute — so parse it back from the figcaption child for round-trip.
        parseHTML: (element) => {
          const figcaption = element.querySelector(':scope > figcaption');
          return figcaption?.textContent?.trim() || null;
        },
        renderHTML: () => ({}),
      },
      captionPosition: {
        default: null,
        // Normalize to the typed union: absent attribute stays `null` (preserves
        // the byte-identical round-trip), any present-but-unknown value coerces to
        // `'bottom'` so a non-`'top' | 'bottom'` string can never leak through.
        parseHTML: (element) => {
          const raw = element.getAttribute('data-caption-position');
          if (raw === null) return null;
          return raw === 'top' ? 'top' : 'bottom';
        },
        renderHTML: (attributes) => {
          if (!attributes['captionPosition']) return {};
          return { 'data-caption-position': attributes['captionPosition'] };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: 'figure[data-block="image-ref"]' }];
  },

  renderHTML({ HTMLAttributes, node }) {
    const { caption } = node.attrs as ImageRefAttributes;

    const figure = mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
      'data-block': 'image-ref',
    });

    // No <img> is emitted — the asset is URL-free. The caption order relative to
    // the (not-yet-resolved) image is carried by `data-caption-position` for the
    // consumer to honor at hydration time; the figure itself just holds the text.
    if (!caption) {
      return ['figure', figure];
    }

    const figcaption: DOMOutputSpec = ['figcaption', {}, caption];
    return ['figure', figure, figcaption];
  },

  /**
   * Editor-only placeholder. The DOM here is chrome (never serialized — that is
   * `renderHTML`'s job); it just shows which media the block references.
   */
  addNodeView() {
    return ({ node }) => {
      const { imageId, caption, captionPosition } = node.attrs as ImageRefAttributes;

      const dom = document.createElement('figure');
      dom.classList.add('image-ref-placeholder');
      dom.setAttribute('data-block', 'image-ref');
      if (imageId) dom.setAttribute('data-image-id', imageId);
      if (captionPosition) dom.setAttribute('data-caption-position', captionPosition);
      dom.style.cssText = 'margin:1rem 0;display:flex;flex-direction:column;gap:.5rem;';

      const box = document.createElement('div');
      box.style.cssText =
        'display:flex;align-items:center;gap:.5rem;padding:1rem;border:1px dashed currentColor;' +
        'border-radius:.5rem;opacity:.65;font-size:.875rem;justify-content:center;';
      box.textContent = `🖼  image-ref · id: ${imageId || '—'}`;

      const figcaption = document.createElement('figcaption');
      figcaption.style.cssText = 'font-size:.8125rem;opacity:.7;text-align:center;';
      if (caption) figcaption.textContent = caption;

      if (caption && captionPosition === 'top') {
        dom.append(figcaption, box);
      } else {
        dom.append(box);
        if (caption) dom.append(figcaption);
      }

      return { dom };
    };
  },

  addCommands() {
    return {
      insertImageRef:
        (attributes: ImageRefAttributes) =>
        ({ chain }) => {
          if (!attributes.imageId) {
            console.error('[ImageRef] imageId is required.');
            return false;
          }
          return chain().insertContent({ type: this.name, attrs: attributes }).run();
        },
    };
  },
});
