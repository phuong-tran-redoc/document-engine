import { Editor } from '@tiptap/core';

export function getClosestDomElement(editor: Editor, selector: string): HTMLElement | null {
  const { view, state } = editor;
  const { selection } = state;
  const { from } = selection;

  if (!from) return null;

  let domNodeAtPos: Node | null = null;

  // Ưu tiên tìm DOM node của 'nearest parent element' của vị trí from
  // Nếu from là trong text, $from.parent.nodeDOM có thể chính xác hơn
  try {
    const resolvedPos = state.doc.resolve(from);
    domNodeAtPos = view.domAtPos(resolvedPos.pos).node as HTMLElement; // Bắt đầu từ node ở vị trí from

    // Nếu domNodeAtPos không phải là HTMLElement (ví dụ, là một Text node),
    // thì cố gắng lấy element cha của nó trong DOM
    if (domNodeAtPos && !(domNodeAtPos instanceof HTMLElement)) {
      domNodeAtPos = domNodeAtPos.parentElement;
    }
  } catch (e) {
    // Xử lý trường hợp hiếm gặp khi nodeDOM(from) không trả về gì hợp lệ
    console.warn('Could not find DOM node at cursor position:', e);
    return null;
  }

  if (!domNodeAtPos) return null;

  const boundary = editor.view.dom;

  // Tìm kiếm từ domNodeAtPos lên trên cho đến khi gặp editor container
  let currentElement: HTMLElement | null = domNodeAtPos as HTMLElement;

  while (currentElement && currentElement !== boundary) {
    if (currentElement.matches(selector)) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }

  return null;
}
