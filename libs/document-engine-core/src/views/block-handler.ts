import { DOMSerializer, Node } from '@tiptap/pm/model';
import { NodeSelection, TextSelection } from '@tiptap/pm/state';
import { EditorView } from '@tiptap/pm/view';
import { NodeViewRendererProps } from '@tiptap/core';

export abstract class HandleNodeView {
  dom: HTMLElement;
  contentDOM!: HTMLElement;
  node: Node;
  view: EditorView;
  getPos: () => number | undefined;

  // Store event listeners for cleanup
  private eventCleanups: (() => void)[] = [];

  constructor(node: Node, view: EditorView, getPos: () => number | undefined) {
    this.node = node;
    this.view = view;
    this.getPos = getPos;

    // 1. Dùng <figure> làm wrapper, KHÔNG set contentEditable vì sẽ chặn tất cả
    this.dom = document.createElement('figure');
    this.dom.classList.add('widget');

    // Make the widget draggable (via the handle with data-drag-handle attribute)
    // this.dom.draggable = true;

    // 2. Tạo Handle kéo thả
    const handle = this.createBlockHandle(view, getPos);

    // 3. Tạo Nội dung (do lớp con định nghĩa)
    const contentElement = this.createContentElement(node);
    contentElement.classList.add('widget-content');

    // 4. Tạo các nút "Type Around"
    const typeAround = this.createTypeAround(view, getPos, node);

    // 5. Lắp ráp cấu trúc: Handle -> Nội dung -> TypeAround
    // this.dom.append(handle, contentElement, typeAround);
    this.dom.append(contentElement, typeAround);

    // 6. Setup drag handling for ProseMirror
    // this.setupDragHandling(view, getPos, node);
  }

  private setupDragHandling(view: EditorView, getPos: () => number | undefined, node: Node): void {
    const handleDragStart = (event: DragEvent) => {
      const pos = getPos();
      if (pos === undefined || !event.dataTransfer) return;

      // Let ProseMirror know which node is being dragged
      // Store node position and allow move effect
      event.dataTransfer.effectAllowed = 'move';

      // ProseMirror expects this format
      const slice = view.state.doc.slice(pos, pos + node.nodeSize);
      const serializer = DOMSerializer.fromSchema(view.state.schema);
      const dom = document.createElement('div');
      dom.appendChild(serializer.serializeFragment(slice.content));

      event.dataTransfer.setDragImage(this.dom, 0, 0);
      event.dataTransfer.setData('text/html', dom.innerHTML);

      // Add dragging state
      this.dom.classList.add('widget-dragging');
    };

    const handleDragEnd = () => {
      this.dom.classList.remove('widget-dragging');
    };

    this.dom.addEventListener('dragstart', handleDragStart);
    this.dom.addEventListener('dragend', handleDragEnd);

    this.eventCleanups.push(() => {
      this.dom.removeEventListener('dragstart', handleDragStart);
      this.dom.removeEventListener('dragend', handleDragEnd);
    });
  }

  createBlockHandle(view: EditorView, getPos: () => number | undefined): HTMLElement {
    const handle = document.createElement('div');
    handle.className = 'widget__selection-handle';
    handle.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" height="24px" fill="currentColor" viewBox="0 -960 960 960" width="24px" fill="#e3e3e3"><path d="M360-160q-33 0-56.5-23.5T280-240q0-33 23.5-56.5T360-320q33 0 56.5 23.5T440-240q0 33-23.5 56.5T360-160Zm240 0q-33 0-56.5-23.5T520-240q0-33 23.5-56.5T600-320q33 0 56.5 23.5T680-240q0 33-23.5 56.5T600-160ZM360-400q-33 0-56.5-23.5T280-480q0-33 23.5-56.5T360-560q33 0 56.5 23.5T440-480q0 33-23.5 56.5T360-400Zm240 0q-33 0-56.5-23.5T520-480q0-33 23.5-56.5T600-560q33 0 56.5 23.5T680-480q0 33-23.5 56.5T600-400ZM360-640q-33 0-56.5-23.5T280-720q0-33 23.5-56.5T360-800q33 0 56.5 23.5T440-720q0 33-23.5 56.5T360-640Zm240 0q-33 0-56.5-23.5T520-720q0-33 23.5-56.5T600-800q33 0 56.5 23.5T680-720q0 33-23.5 56.5T600-640Z"/></svg>';
    handle.contentEditable = 'false';
    // handle.draggable = true;
    handle.setAttribute('data-drag-handle', '');
    handle.setAttribute('data-block-handle', ''); // Mark để dễ check trong stopEvent

    // Logic click-to-select (only on click, not drag)
    let isDragging = false;

    const handleMouseDown = () => {
      isDragging = false;
      // Let drag happen naturally, don't prevent
    };

    const handleDragStart = () => {
      isDragging = true;
    };

    const handleClick = (event: MouseEvent) => {
      // Only select if it was a click, not a drag
      if (!isDragging && event.button === 0) {
        event.preventDefault();
        event.stopPropagation();
        const pos = getPos() ?? 0;
        const tr = view.state.tr.setSelection(NodeSelection.create(view.state.doc, pos));
        view.dispatch(tr);
      }
      isDragging = false;
    };

    handle.addEventListener('mousedown', handleMouseDown);
    // handle.addEventListener('dragstart', handleDragStart);
    handle.addEventListener('click', handleClick);

    // Store cleanup
    this.eventCleanups.push(() => {
      handle.removeEventListener('mousedown', handleMouseDown);
      // handle.removeEventListener('dragstart', handleDragStart);
      handle.removeEventListener('click', handleClick);
    });

    return handle;
  }

  createTypeAround(view: EditorView, getPos: () => number | undefined, node: Node): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'type-around';

    const icon =
      '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>';

    const buttonBefore = document.createElement('div');
    buttonBefore.className = 'widget__type-around__button widget__type-around__button_before';
    buttonBefore.title = 'Chèn đoạn văn bản phía trước';
    buttonBefore.innerHTML = icon;

    const buttonAfter = document.createElement('div');
    buttonAfter.className = 'widget__type-around__button widget__type-around__button_after';
    buttonAfter.title = 'Chèn đoạn văn bản phía sau';
    buttonAfter.innerHTML = icon;

    // Logic chèn node 'paragraph' mới
    const handleInsert = (position: 'before' | 'after') => {
      const pos = position === 'before' ? (getPos() ?? 0) : (getPos() ?? 0) + node.nodeSize;
      const newNode = view.state.schema.nodes['paragraph'].create();
      const tr = view.state.tr.insert(pos, newNode);

      // Di chuyển con trỏ vào node mới
      view.dispatch(tr.setSelection(TextSelection.create(tr.doc, pos + 1)));
      view.focus();
    };

    // Button Before event handlers
    const beforeMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const beforeClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleInsert('before');
    };

    buttonBefore.addEventListener('mousedown', beforeMouseDown);
    buttonBefore.addEventListener('click', beforeClick);

    // Button After event handlers
    const afterMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const afterClick = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      handleInsert('after');
    };

    buttonAfter.addEventListener('mousedown', afterMouseDown);
    buttonAfter.addEventListener('click', afterClick);

    // Store cleanup functions
    this.eventCleanups.push(() => {
      buttonBefore.removeEventListener('mousedown', beforeMouseDown);
      buttonBefore.removeEventListener('click', beforeClick);
      buttonAfter.removeEventListener('mousedown', afterMouseDown);
      buttonAfter.removeEventListener('click', afterClick);
    });

    wrapper.append(buttonBefore, buttonAfter);
    return wrapper;
  }

  /**
   * Ngăn các sự kiện từ handle và type-around buttons lan truyền vào editor
   * CHỈ chặn events từ các controls, KHÔNG chặn events từ content
   *
   * QUAN TRỌNG:
   * - return true = ProseMirror BỎ QUA event này
   * - return false = ProseMirror XỬ LÝ event này (table editing, selection, drag, etc.)
   */
  stopEvent(event: Event): boolean {
    const target = event.target as HTMLElement;

    // Chỉ chặn events từ control elements (handle, type-around buttons)
    const isControl =
      target.closest('[data-block-handle]') ||
      target.closest('.widget__type-around__button') ||
      target.closest('.type-around');

    if (!isControl) {
      // Event từ table content → cho ProseMirror xử lý
      return false;
    }

    // Event từ control → chặn hầu hết, NHƯNG cho phép một số events quan trọng
    const eventType = event.type;

    // Cho phép drag events để ProseMirror handle drag & drop
    if (eventType === 'dragstart' || eventType === 'drag' || eventType === 'dragend') {
      return false; // Let ProseMirror handle drag
    }

    // Cho phép focus events để không phá navigation
    if (eventType === 'focus' || eventType === 'blur') {
      return false;
    }

    // Chặn các events khác từ controls
    return true;
  }

  selectNode(): void {
    this.dom.classList.add('ProseMirror-selectednode');
  }

  deselectNode(): void {
    this.dom.classList.remove('ProseMirror-selectednode');
  }

  destroy(): void {
    // Cleanup all event listeners
    this.eventCleanups.forEach((cleanup) => cleanup());
    this.eventCleanups = [];

    // Remove DOM
    this.dom.remove();
  }

  /**
   * Phương thức trừu tượng: Lớp con BẮT BUỘC phải định nghĩa
   * để cho biết nội dung của nó là gì.
   */
  abstract createContentElement(node: Node): HTMLElement;
}

export class TableNodeView extends HandleNodeView {
  private table!: HTMLTableElement;

  createContentElement(): HTMLElement {
    // Create table element
    this.table = document.createElement('table');

    // Render colgroup
    this.updateColgroup();

    // Create tbody - this is the contentDOM where ProseMirror renders <tr>s
    const tbody = document.createElement('tbody');
    this.contentDOM = tbody;

    this.table.appendChild(tbody);
    return this.table;
  }

  private updateColgroup(): void {
    // Safety check: ensure table exists
    if (!this.table) return;

    // Remove existing colgroup if exists
    const existingColgroup = this.table.querySelector('colgroup');
    if (existingColgroup) {
      existingColgroup.remove();
    }

    // Render new colgroup if colwidths exist
    const colwidths = this.node.attrs['colwidths'] as (number | null)[] | null;
    if (colwidths && colwidths.length > 0) {
      const colgroup = document.createElement('colgroup');
      colwidths.forEach((width: number | null) => {
        const col = document.createElement('col');
        if (width) {
          col.style.width = `${width}%`;
        }
        colgroup.appendChild(col);
      });

      // Insert before tbody
      const tbody = this.table.querySelector('tbody');
      if (tbody) {
        this.table.insertBefore(colgroup, tbody);
      } else {
        this.table.appendChild(colgroup);
      }
    }
  }
}

// Factory function for Tiptap NodeView
export const createTableNodeView = (props: NodeViewRendererProps) => {
  return new TableNodeView(props.node, props.view, props.getPos as () => number | undefined);
};
