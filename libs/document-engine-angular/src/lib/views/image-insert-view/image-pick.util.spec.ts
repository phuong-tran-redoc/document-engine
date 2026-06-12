import type { Editor } from '@tiptap/core';
import { getImagePickHook, insertMediaResult, isInsertableResult } from './image-pick.util';
import { ImagePickHook } from '../../types/media-result.type';

/**
 * These cover the two branches of the DE-005 `image.onPick` flow without
 * Angular's TestBed: the picker logic lives in a framework-free util, so the
 * editor is a plain stub.
 */

interface ChainSpies {
  insertImageRef: jest.Mock;
  setImage: jest.Mock;
  run: jest.Mock;
}

function fakeEditor(opts: { onPick?: ImagePickHook; hasImage?: boolean; hasImageRef?: boolean }): {
  editor: Editor;
  spies: ChainSpies;
} {
  const run = jest.fn();
  const insertImageRef = jest.fn(() => ({ run }));
  const setImage = jest.fn(() => ({ run }));
  const focus = jest.fn(() => ({ insertImageRef, setImage }));
  const chain = jest.fn(() => ({ focus }));

  const extensions: { name: string; options: Record<string, unknown> }[] = [];
  if (opts.hasImage !== false) {
    extensions.push({ name: 'image', options: opts.onPick ? { onPick: opts.onPick } : {} });
  }
  if (opts.hasImageRef) extensions.push({ name: 'imageRef', options: {} });

  const editor = { chain, extensionManager: { extensions } } as unknown as Editor;
  return { editor, spies: { insertImageRef, setImage, run } };
}

describe('image-pick util', () => {
  describe('getImagePickHook (mode selection / fallback)', () => {
    it('returns undefined when the image extension has no onPick (URL fallback)', () => {
      const { editor } = fakeEditor({});
      expect(getImagePickHook(editor)).toBeUndefined();
    });

    it('returns undefined when there is no image extension at all', () => {
      const { editor } = fakeEditor({ hasImage: false });
      expect(getImagePickHook(editor)).toBeUndefined();
    });

    it('returns the hook when the image extension exposes onPick (picker mode)', () => {
      const onPick = jest.fn();
      const { editor } = fakeEditor({ onPick });
      expect(getImagePickHook(editor)).toBe(onPick);
    });
  });

  describe('isInsertableResult (cancel / no-op guard)', () => {
    it('rejects null and undefined (picker cancelled)', () => {
      expect(isInsertableResult(null)).toBe(false);
      expect(isInsertableResult(undefined)).toBe(false);
    });

    it('rejects a result with neither id nor url', () => {
      expect(isInsertableResult({ id: '', url: '' })).toBe(false);
    });

    it('accepts a result with an id or a url', () => {
      expect(isInsertableResult({ id: 'media_1', url: '' })).toBe(true);
      expect(isInsertableResult({ id: '', url: 'https://x/y.jpg' })).toBe(true);
    });
  });

  describe('insertMediaResult', () => {
    it('inserts an image-ref node when the imageRef extension is enabled', () => {
      const { editor, spies } = fakeEditor({ hasImageRef: true });

      const inserted = insertMediaResult(editor, { id: 'media_1', url: 'u', alt: 'Lobby' });

      expect(inserted).toBe(true);
      expect(spies.insertImageRef).toHaveBeenCalledWith({ imageId: 'media_1', caption: 'Lobby' });
      expect(spies.setImage).not.toHaveBeenCalled();
      expect(spies.run).toHaveBeenCalled();
    });

    it('uses a null caption when no alt is provided', () => {
      const { editor, spies } = fakeEditor({ hasImageRef: true });

      insertMediaResult(editor, { id: 'media_1', url: 'u' });

      expect(spies.insertImageRef).toHaveBeenCalledWith({ imageId: 'media_1', caption: null });
    });

    it('falls back to a plain image when imageRef is not enabled', () => {
      const { editor, spies } = fakeEditor({ hasImageRef: false });

      const inserted = insertMediaResult(editor, { id: 'media_1', url: 'https://x/y.jpg', alt: 'Y' });

      expect(inserted).toBe(true);
      expect(spies.setImage).toHaveBeenCalledWith({ src: 'https://x/y.jpg', alt: 'Y' });
      expect(spies.insertImageRef).not.toHaveBeenCalled();
    });

    it('inserts nothing (returns false) when neither an id-with-imageRef nor a url is usable', () => {
      const { editor, spies } = fakeEditor({ hasImageRef: false });

      // No imageRef extension and no url -> nothing to insert.
      const inserted = insertMediaResult(editor, { id: 'media_1', url: '' });

      expect(inserted).toBe(false);
      expect(spies.setImage).not.toHaveBeenCalled();
      expect(spies.insertImageRef).not.toHaveBeenCalled();
    });
  });
});
