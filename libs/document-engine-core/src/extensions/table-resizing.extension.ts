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
 * Handler for mouse move (dragging)
 */
function handleMouseMoveEvent(event: MouseEvent, dragInfo: DragInfo) {
  if (!dragInfo.isDragging) return;

  event.preventDefault();

  const { startX, tableWidthPx, initialLeftWidth, initialRightWidth, leftColIndex, tablePos, tableNode, view } =
    dragInfo;

  // 1. Compute the delta (pixels)
  const deltaX = event.clientX - startX;

  // 2. Convert the pixel delta into a percentage delta
  // This is the most important piece of logic
  const deltaPercent = (deltaX / tableWidthPx) * 100;

  // 3. Compute the new widths
  let newLeftWidth = initialLeftWidth + deltaPercent;
  let newRightWidth = initialRightWidth - deltaPercent;

  // 4. Apply constraints (e.g. min-width 5%)
  const minWidth = 5; // min-width configuration
  if (newLeftWidth < minWidth) {
    const diff = minWidth - newLeftWidth;
    newLeftWidth = minWidth;
    newRightWidth = newRightWidth - diff; // Right column absorbs the shortfall
  } else if (newRightWidth < minWidth) {
    const diff = minWidth - newRightWidth;
    newRightWidth = minWidth;
    newLeftWidth = newLeftWidth - diff; // Left column absorbs the shortfall
  }

  // Make sure no column goes negative (in case of a very fast drag)
  if (newLeftWidth < 0) newLeftWidth = 0;
  if (newRightWidth < 0) newRightWidth = 0;

  // 5. Build the new colwidths array
  const newColWidths = [...(tableNode?.attrs?.['colwidths'] as number[])];
  newColWidths[leftColIndex] = newLeftWidth;
  newColWidths[leftColIndex + 1] = newRightWidth;

  // 6. Dispatch a transaction to update the state
  if (tableNode && view) {
    const tr = view.state.tr.setNodeMarkup(tablePos, null, {
      ...tableNode.attrs,
      colwidths: newColWidths,
    });

    // Use dispatchTransaction so Tiptap/ProseMirror updates the UI itself
    view.dispatch(tr);
  }
}

/**
 * Handler for mouse up (end of drag)
 */
function handleMouseUpEvent(event: MouseEvent, dragInfo: DragInfo) {
  if (!dragInfo.isDragging) return;

  event.preventDefault();

  // Reset the state
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
 * * Replaces the default column-resize logic with percentage-based logic.
 */
export const PercentageColumnResizing = Extension.create({
  name: 'percentageColumnResizing',

  addProseMirrorPlugins() {
    // A temporary object to hold the drag-and-drop state
    // We don't use Plugin State because this state never needs to be "undone"
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
           * Draw the resize handles into the DOM
           */
          decorations(state) {
            if (!editorInstance?.isEditable) return;

            const decorations: Decoration[] = [];
            const { doc } = state;
            const tableTypes = tableNodeTypes(state.schema);

            // Walk every node in the document
            doc.descendants((node, pos) => {
              if (node.type.name !== tableTypes.table.name) return;

              const colwidths = node.attrs['colwidths'] as (number | null)[];
              if (!colwidths || colwidths.length === 0) return;

              let accumulatedWidth = 0;
              // Create a handle for N-1 columns (the last column doesn't need one)
              for (let i = 0; i < colwidths.length - 1; i++) {
                accumulatedWidth += colwidths[i] ?? 0;

                // Create a 'div' widget to act as the handle
                const handle = document.createElement('div');
                handle.className = 'pm-col-resizer';
                handle.style.left = `calc(${accumulatedWidth}% - 2px)`;

                // Store the column position so we know which column is being resized
                handle.setAttribute('data-col-index', i.toString());
                handle.setAttribute('data-table-pos', pos.toString());

                // Place the widget right after the <table> tag (pos + 1)
                decorations.push(Decoration.widget(pos + 1, handle));
              }
            });

            return DecorationSet.create(doc, decorations);
          },

          /**
           * Handle the mousedown event on a handle
           */
          handleDOMEvents: {
            mousedown(view, event) {
              const target = event.target as HTMLElement;

              // Only trigger when clicking on a handle
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

              // Store the info needed for dragging
              dragInfo = {
                isDragging: true,
                startX: event.clientX,
                tablePos: tablePos,
                tableNode: tableNode,
                tableWidthPx: tableDOM.offsetWidth, // <-- Get the table width (px)
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

              return true; // Event handled
            },
          },
        },
      }),
    ];
  },
});
