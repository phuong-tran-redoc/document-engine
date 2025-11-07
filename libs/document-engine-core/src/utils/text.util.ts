import { Editor, MarkRange } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

export function getSelectedText(editor: Editor): string | null {
  const { state } = editor;
  const { selection } = state;

  // 1. Kiểm tra nếu selection rỗng (chỉ là con trỏ) hoặc không phải là TextSelection
  if (selection.empty || !(selection instanceof TextSelection)) {
    return null;
  }

  // 2. Lấy text giữa điểm đầu và điểm cuối của selection
  const { from, to } = selection;
  return state.doc.textBetween(from, to, ' '); // Trả về text
}

/**
 * Tìm instance và range (from, to) của một mark cụ thể tại vị trí con trỏ.
 * @param editor The Tiptap editor instance.
 * @param markName Tên của mark cần tìm (vd: 'link').
 * @returns Object chứa from, to, và mark instance nếu tìm thấy, ngược lại trả về null.
 */
export function getActiveMarkRange(editor: Editor, markName: string): MarkRange | null {
  const { state } = editor;
  const { $from } = state.selection;
  const { doc } = state;

  // 2. Lấy instance của mark tại vị trí con trỏ
  const activeMarks = $from.marks();
  const targetMark = activeMarks.find((mark) => mark.type.name === markName);

  // Nếu không có mark active, thoát ngay
  if (!targetMark) return null;

  const markType = targetMark.type;

  // 3. Quét ngược về đầu để tìm vị trí `from`
  let from = $from.pos;
  // Giới hạn việc quét trong node cha hiện tại ($from.start())
  while (from > $from.start() && doc.rangeHasMark(from - 1, from, markType)) {
    from--;
  }

  // 4. Quét xuôi về cuối để tìm vị trí `to`
  let to = $from.pos;
  // Giới hạn việc quét trong node cha hiện tại ($from.end())
  while (to < $from.end() && doc.rangeHasMark(to, to + 1, markType)) {
    to++;
  }

  // 5. Trả về kết quả
  return { from, to, mark: targetMark };
}
