import type { Editor } from '@tiptap/core';
import { ImagePickHook, MediaResult } from '../../types/media-result.type';

/**
 * Framework-free helpers for the image-insert picker flow. Kept out of the
 * component so they can be unit-tested without Angular's TestBed (this lib runs
 * in a bare `node` jest env that does not transpile Angular ESM).
 */

/** A minimal view of the chained commands the picker uses (provided at runtime by the editor's extensions). */
interface ImageInsertChain {
  setImage(attrs: { src: string; alt?: string }): ImageInsertChain;
  insertImageRef(attrs: { imageId: string; caption?: string | null }): ImageInsertChain;
  run(): boolean;
}

/**
 * Whether a picker result is worth inserting. A `null`/`undefined` result (or one
 * with neither an `id` nor a `url`) is treated as a cancel — insert nothing.
 */
export function isInsertableResult(result: MediaResult | null | undefined): result is MediaResult {
  return !!result && (!!result.id || !!result.url);
}

/** Read the consumer's `onPick` media hook off the `image` extension options, if any. */
export function getImagePickHook(editor: Editor): ImagePickHook | undefined {
  const ext = editor.extensionManager.extensions.find((e) => e.name === 'image');
  return (ext?.options as { onPick?: ImagePickHook } | undefined)?.onPick;
}

/**
 * Insert a picked media result: an `image-ref` node when that node is enabled
 * (preferred — URL-free), otherwise a plain image from the resolved URL. Returns
 * `true` when something was actually inserted, `false` when the result had
 * nothing usable (id-only with no `imageRef` node, and no url) — so the caller can
 * avoid closing the view as if an insert had happened.
 */
export function insertMediaResult(editor: Editor, result: MediaResult): boolean {
  const hasImageRef = editor.extensionManager.extensions.some((e) => e.name === 'imageRef');
  const chain = editor.chain().focus() as unknown as ImageInsertChain;

  if (hasImageRef && result.id) {
    chain.insertImageRef({ imageId: result.id, caption: result.alt ?? null }).run();
    return true;
  }

  if (result.url) {
    chain.setImage({ src: result.url, alt: result.alt ?? '' }).run();
    return true;
  }

  return false;
}
