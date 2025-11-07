import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { tableNodeTypes } from '@tiptap/pm/tables';
import type { EditorView } from '@tiptap/pm/view';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { getTableDOMFromView } from '../utils';

type DragInfo = {
  isDragging: boolean;
  startX: number;
  tablePos: number;
  tableNode: any;
  tableWidthPx: number;
  leftColIndex: number;
  initialLeftWidth: number;
  initialRightWidth: number;
  view: EditorView | null;
};

/**
 * Hàm xử lý khi di chuột (kéo)
 */
function handleMouseMoveEvent(event: MouseEvent, dragInfo: DragInfo) {
  if (!dragInfo.isDragging) return;

  event.preventDefault();

  const { startX, tableWidthPx, initialLeftWidth, initialRightWidth, leftColIndex, tablePos, tableNode, view } =
    dragInfo;

  // 1. Tính toán delta (pixel)
  const deltaX = event.clientX - startX;

  // 2. Chuyển delta pixel sang delta percentage
  // Đây là logic quan trọng nhất
  const deltaPercent = (deltaX / tableWidthPx) * 100;

  // 3. Tính toán width mới
  let newLeftWidth = initialLeftWidth + deltaPercent;
  let newRightWidth = initialRightWidth - deltaPercent;

  // 4. Áp dụng ràng buộc (ví dụ: min-width 5%)
  const minWidth = 5; // Cấu hình min-width
  if (newLeftWidth < minWidth) {
    const diff = minWidth - newLeftWidth;
    newLeftWidth = minWidth;
    newRightWidth = newRightWidth - diff; // Cột phải bù phần bị thiếu
  } else if (newRightWidth < minWidth) {
    const diff = minWidth - newRightWidth;
    newRightWidth = minWidth;
    newLeftWidth = newLeftWidth - diff; // Cột trái bù phần bị thiếu
  }

  // Đảm bảo không có cột nào bị âm (nếu kéo quá nhanh)
  if (newLeftWidth < 0) newLeftWidth = 0;
  if (newRightWidth < 0) newRightWidth = 0;

  // 5. Tạo mảng colwidths mới
  const newColWidths = [...(tableNode?.attrs?.['colwidths'] as number[])];
  newColWidths[leftColIndex] = newLeftWidth;
  newColWidths[leftColIndex + 1] = newRightWidth;

  // 6. Dispatch transaction để cập nhật state
  if (tableNode && view) {
    const tr = view.state.tr.setNodeMarkup(tablePos, null, {
      ...tableNode.attrs,
      colwidths: newColWidths,
    });

    // Dùng dispatchTransaction để Tiptap/ProseMirror tự cập nhật UI
    view.dispatch(tr);
  }
}

/**
 * Hàm xử lý khi nhả chuột (kết thúc kéo)
 */
function handleMouseUpEvent(event: MouseEvent, dragInfo: DragInfo) {
  if (!dragInfo.isDragging) return;

  event.preventDefault();

  // Reset trạng thái
  dragInfo = {
    isDragging: false,
    startX: 0,
    tablePos: -1,
    tableNode: null,
    tableWidthPx: 0,
    leftColIndex: -1,
    initialLeftWidth: 0,
    initialRightWidth: 0,
    view: null,
  };
}

/**
 * Extension PercentageColumnResizing
 * * Thay thế logic resize cột mặc định bằng logic dựa trên %.
 */
export const PercentageColumnResizing = Extension.create({
  name: 'percentageColumnResizing',

  addProseMirrorPlugins() {
    // Một đối tượng tạm thời để lưu trữ trạng thái kéo-thả
    // Chúng ta không dùng Plugin State vì nó không cần thiết phải "undo"
    let dragInfo: DragInfo = {
      isDragging: false,
      startX: 0,
      tablePos: -1,
      tableNode: null,
      tableWidthPx: 0,
      leftColIndex: -1,
      initialLeftWidth: 0,
      initialRightWidth: 0,
      view: null,
      // finalColWidths: null,
    };

    const editorInstance = this.editor;

    return [
      new Plugin({
        key: new PluginKey('percentageColumnResizing'),

        props: {
          /**
           * Vẽ các resize handles vào DOM
           */
          decorations(state) {
            if (!editorInstance?.isEditable) return;

            const decorations: Decoration[] = [];
            const { doc } = state;
            const tableTypes = tableNodeTypes(state.schema);

            // Duyệt qua tất cả node trong document
            doc.descendants((node, pos) => {
              if (node.type.name !== tableTypes.table.name) return;

              const colwidths = node.attrs['colwidths'] as (number | null)[];
              if (!colwidths || colwidths.length === 0) return;

              let accumulatedWidth = 0;
              // Tạo handle cho N-1 cột (không cần cho cột cuối)
              for (let i = 0; i < colwidths.length - 1; i++) {
                accumulatedWidth += colwidths[i] ?? 0;

                // Tạo một widget 'div' để làm handle
                const handle = document.createElement('div');
                handle.className = 'pm-col-resizer';
                handle.style.left = `calc(${accumulatedWidth}% - 2px)`;

                // Lưu vị trí cột để biết đang resize cột nào
                handle.setAttribute('data-col-index', i.toString());
                handle.setAttribute('data-table-pos', pos.toString());

                // Đặt widget ngay sau thẻ <table> (pos + 1)
                decorations.push(Decoration.widget(pos + 1, handle));
              }
            });

            return DecorationSet.create(doc, decorations);
          },

          /**
           * Xử lý sự kiện mousedown trên handle
           */
          handleDOMEvents: {
            mousedown(view, event) {
              const target = event.target as HTMLElement;

              // Chỉ kích hoạt khi click vào handle
              if (!target.classList.contains('pm-col-resizer')) return false;

              event.preventDefault();

              const colIndex = parseInt(target.getAttribute('data-col-index') ?? '0', 10);
              const tablePos = parseInt(target.getAttribute('data-table-pos') ?? '0', 10);
              const tableNode = view.state.doc.nodeAt(tablePos);
              const colwidths = tableNode?.attrs['colwidths'] as number[];

              if (!tableNode || !colwidths) return false;

              // Get table DOM element (handles NodeView wrappers and nested tables)
              const tableDOM = getTableDOMFromView(view, tablePos);
              if (!tableDOM) return false;

              // Lưu thông tin cần thiết cho việc kéo
              dragInfo = {
                isDragging: true,
                startX: event.clientX,
                tablePos: tablePos,
                tableNode: tableNode,
                tableWidthPx: tableDOM.offsetWidth, // <-- Lấy width (px) của table
                leftColIndex: colIndex,
                initialLeftWidth: colwidths[colIndex],
                initialRightWidth: colwidths[colIndex + 1],
                view: view,
                // finalColWidths: null,
              };

              const handleMouseMove = (event: MouseEvent) => handleMouseMoveEvent(event, dragInfo);
              const handleMouseUp = (event: MouseEvent) => {
                handleMouseUpEvent(event, dragInfo);

                window.removeEventListener('mousemove', handleMouseMove, true);
                window.removeEventListener('mouseup', handleMouseUp, true);
              };

              window.addEventListener('mousemove', handleMouseMove, true);
              window.addEventListener('mouseup', handleMouseUp, true);

              return true; // Đã xử lý event
            },
          },
        },
      }),
    ];
  },
});
