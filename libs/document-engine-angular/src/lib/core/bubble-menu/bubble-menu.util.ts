import { Editor } from '@tiptap/core';
import { BubbleTarget } from './bubble-menu.type';

export function shouldShowFnFactory(params: {
  editor: Editor;
  target: BubbleTarget;
  forceOpen: () => boolean;
}): () => boolean {
  const { editor, target, forceOpen } = params;
  const requireFocus = target.requireFocus !== false;
  const allowEmptySelection = target.allowEmptySelection === true;

  return () => {
    if (forceOpen()) return true;
    if (requireFocus && !editor.isFocused) return false;

    // Avoid showing during drag/resize
    const dragging = (editor as unknown as { isDragging?: boolean }).isDragging;
    if (dragging) return false;

    // Avoid showing when selection is empty and mark is required
    if (!allowEmptySelection && editor.state.selection.empty && target.kind === 'mark') return false;

    // Avoid showing when extension is not active
    const active = Array.isArray(target.name)
      ? target.name.some((name) => editor.isActive(name))
      : editor.isActive(target.name);

    if (!active) return false;

    // Avoid showing when extra predicate is not met
    if (target.extraPredicate && !target.extraPredicate(editor)) return false;

    return true;
  };
}

export function selectionChangeHandler(params: {
  editor: Editor;
  target: BubbleTarget;
  onActive: (attrs: Record<string, unknown>) => void;
  onInactive: () => void;
  listenOnUpdate?: boolean; // default false
}): () => void {
  const { editor, target, onActive, onInactive, listenOnUpdate } = params;

  const run = () => {
    const isActive = Array.isArray(target.name)
      ? target.name.some((name) => editor.isActive(name))
      : editor.isActive(target.name);

    if (!isActive) return onInactive();

    const activeName = Array.isArray(target.name) ? target.name.find((name) => editor.isActive(name)) : target.name;

    const attrs =
      target.kind === 'mark'
        ? (editor.getAttributes(activeName as string) ?? {})
        : ((editor.state.selection as any).node?.attrs ?? {});

    onActive(attrs);
  };

  const onSelection = () => run();
  const onUpdate = () => run();

  editor.on('selectionUpdate', onSelection);
  if (listenOnUpdate) editor.on('update', onUpdate);

  run(); // initial sync

  return () => {
    editor.off('selectionUpdate', onSelection);
    if (listenOnUpdate) editor.off('update', onUpdate);
  };
}
