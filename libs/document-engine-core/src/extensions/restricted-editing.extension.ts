import { Extension, Node, mergeAttributes } from '@tiptap/core';
import { Node as ProseMirrorNode, Schema } from '@tiptap/pm/model';
import { Plugin, PluginKey, Transaction } from '@tiptap/pm/state';

// Editable inline region where typing is allowed
export const EditableRegion = Node.create({
  name: 'editableRegion',
  group: 'inline',
  inline: true,
  content: 'text*',
  selectable: false,

  parseHTML() {
    return [
      // ----------------------------------------------------------
      // RULE 1: Standard Tiptap Format (Ưu tiên cao nhất)
      // ----------------------------------------------------------
      { tag: 'span[data-editable-region]' },

      // ----------------------------------------------------------
      // RULE 2: CKEditor Format (Ưu tiên thấp nhất)
      // ----------------------------------------------------------
      { tag: 'span.restricted-editing-exception' },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-editable-region': 'true',
        class: 'editable-region',
      }),
      0,
    ];
  },
});

export interface RestrictedEditingOptions {
  editableRegionNodeName: string;
  disabledNodeTypes: string[];
  initialMode: 'standard' | 'restricted';
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    restrictedEditing: {
      wrapSelectionInEditableRegion: () => ReturnType;
      removeEditableRegion: () => ReturnType;
      toggleEditableRegion: () => ReturnType;
    };
  }
}

export const RestrictedEditing = Extension.create<RestrictedEditingOptions>({
  name: 'restrictedEditing',

  addOptions() {
    return {
      editableRegionNodeName: 'editableRegion',
      disabledNodeTypes: ['listItem', 'blockquote'],
      initialMode: 'restricted',
    };
  },

  addStorage() {
    return {
      mode: this.options.initialMode,
    };
  },

  addCommands() {
    return {
      wrapSelectionInEditableRegion:
        () =>
        ({ state, dispatch }) => {
          // 0. Always return false if the editable region node is not registered
          const type = state.schema.nodes[this.options.editableRegionNodeName];
          if (!type) return false;

          const { from, to, empty } = state.selection;

          // 1. Insert an empty editable region with a zero-width space
          if (empty) {
            const node = type.create(null, state.schema.text('\u200b'));
            const tr = state.tr.replaceSelectionWith(node, false);
            tr.setMeta('restrictedEditing', { allow: true });
            dispatch?.(tr.scrollIntoView());
            return true;
          }

          // Disallow wrapping when selection contains non-text inline nodes
          let containsNonTextInline = false;
          state.doc.nodesBetween(from, to, (node) => {
            if (node.isInline && !node.isText) {
              containsNonTextInline = true;
              return false;
            }
            return undefined as unknown as boolean | void;
          });

          if (containsNonTextInline) {
            return false;
          }

          const multiLine = state.doc.textBetween(from, to, '\n', '\n').includes('\n');

          let tr = state.tr;
          if (multiLine) {
            // Wrap each textblock segment independently
            const ranges: Array<{ s: number; e: number }> = [];
            state.doc.nodesBetween(from, to, (node, pos) => {
              if (node.isTextblock) {
                const s = Math.max(from, pos + 1);
                const e = Math.min(to, pos + node.nodeSize - 1);
                if (e > s) ranges.push({ s, e });
              }
              return undefined as unknown as boolean | void;
            });

            // Apply replacements from end to start to keep positions stable
            for (let i = ranges.length - 1; i >= 0; i--) {
              const { s, e } = ranges[i];
              const text = state.doc.textBetween(s, e, '\n', '\n');
              if (text.length === 0) continue;
              const node = type.create(null, state.schema.text(text));
              tr = tr.replaceRangeWith(s, e, node);
            }
          } else {
            const text = state.doc.textBetween(from, to, '\n', '\n');
            if (text.length === 0) return false;
            const node = type.create(null, state.schema.text(text));
            tr = tr.replaceRangeWith(from, to, node);
          }

          tr.setMeta('restrictedEditing', { allow: true });
          dispatch?.(tr.scrollIntoView());
          return true;
        },

      removeEditableRegion:
        () =>
        ({ state, dispatch }) => {
          const type = state.schema.nodes[this.options.editableRegionNodeName];
          if (!type) return false;

          const $pos = state.selection.$head;
          for (let depth = $pos.depth; depth >= 0; depth--) {
            const node = $pos.node(depth);
            if (node.type === type) {
              const from = $pos.before(depth);
              const to = $pos.after(depth);
              const tr = state.tr.replaceWith(from, to, node.content);
              tr.setMeta('restrictedEditing', { allow: true });
              dispatch?.(tr.scrollIntoView());
              return true;
            }
          }
          return false;
        },

      toggleEditableRegion:
        () =>
        ({ state, dispatch, commands }) => {
          const type = state.schema.nodes[this.options.editableRegionNodeName];
          if (!type) return false;

          const { from, to, empty } = state.selection;

          const findRegionAtPos = (pos: number) => {
            const $pos = state.doc.resolve(pos);
            for (let depth = $pos.depth; depth >= 0; depth--) {
              const node = $pos.node(depth);
              if (node.type === type) {
                const nodeFrom = $pos.before(depth);
                const nodeTo = $pos.after(depth);
                return { from: nodeFrom, to: nodeTo, node } as const;
              }
            }
            return null;
          };

          // Cursor case: inside a region -> unwrap that region; else insert empty region
          if (empty) {
            const region = findRegionAtPos(from);
            if (region) {
              const tr = state.tr.replaceWith(region.from, region.to, region.node.content);
              tr.setMeta('restrictedEditing', { allow: true });
              dispatch?.(tr.scrollIntoView());
              return true;
            }

            const node = type.create(null, state.schema.text('\u200b'));
            const tr = state.tr.replaceSelectionWith(node, false);
            tr.setMeta('restrictedEditing', { allow: true });
            dispatch?.(tr.scrollIntoView());
            return true;
          }

          // Range case: unwrap only if the entire selection is inside the SAME region; otherwise
          // if selection is completely outside all regions, wrap it; else ignore
          const regionStart = findRegionAtPos(from);
          const regionEnd = findRegionAtPos(Math.max(from, to - 1));

          if (regionStart && regionEnd && regionStart.from === regionEnd.from && regionStart.to === regionEnd.to) {
            const tr = state.tr.replaceWith(regionStart.from, regionStart.to, regionStart.node.content);
            tr.setMeta('restrictedEditing', { allow: true });
            dispatch?.(tr.scrollIntoView());
            return true;
          }

          // If neither endpoint is in a region, ensure there is no region intersecting the range
          if (!regionStart && !regionEnd) {
            let hasRegionInside = false;
            state.doc.nodesBetween(from, to, (node) => {
              if (node.type === type) {
                hasRegionInside = true;
                return false;
              }
              return undefined as unknown as boolean | void;
            });
            if (!hasRegionInside) {
              return commands.wrapSelectionInEditableRegion();
            }
          }

          return false;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      Enter: () => {
        // Get the current selection
        const selection = this.editor.state.selection;
        const $from = selection.$from;

        if (!selection.empty) return false;

        let editableRegionInfo = null;
        for (let d = $from.depth; d > 0; d--) {
          const node = $from.node(d);
          if (node.type.name === 'editableRegion') {
            editableRegionInfo = {
              node: node,
              depth: d,
              // Position of the entire node (before the opening tag)
              posBefore: $from.before(d),

              // Position of the entire node (after the closing tag)
              posAfter: $from.after(d),

              // Position of the start of the content inside the node
              contentStartPos: $from.start(d),

              // Position of the end of the content inside the node
              contentEndPos: $from.end(d),
            };
            break;
          }
        }

        if (!editableRegionInfo) return false;

        const atStart = $from.pos === editableRegionInfo.contentStartPos;
        const atEnd = $from.pos === editableRegionInfo.contentEndPos;

        // If cursor is at the start of the editable region, add a new paragraph before the editable region
        if (atStart) {
          return this.editor
            .chain()
            .insertContentAt(editableRegionInfo.posBefore, '<p></p>')
            .focus(editableRegionInfo.posBefore - 2)
            .run();
        }

        // If cursor is at the end of the editable region, add a new paragraph after the editable region
        if (atEnd) {
          return this.editor
            .chain()
            .insertContentAt(editableRegionInfo.posAfter, '<p></p>')
            .focus(editableRegionInfo.posAfter + 1)
            .run();
        }

        // If cursor is in the middle of the editable region, return false
        return false;
      },
    };
  },

  addProseMirrorPlugins() {
    const key = new PluginKey('restricted-editing');
    const editor = this.editor;
    const editableRegionNodeName = this.options.editableRegionNodeName;
    const disabledNodeTypes = this.options.disabledNodeTypes ?? [];

    const getEditableRegionBounds = (doc: ProseMirrorNode, schema: Schema, pos: number) => {
      const $pos = doc.resolve(pos);
      const type = schema.nodes[editableRegionNodeName];
      for (let depth = $pos.depth; depth >= 0; depth--) {
        if ($pos.node(depth).type === type) {
          return { depth, from: $pos.start(depth), to: $pos.end(depth) };
        }
      }
      return null;
    };

    const rangesFromTransaction = (tr: Transaction) => {
      const ranges: { oldFrom: number; oldTo: number; newFrom: number; newTo: number }[] = [];

      for (let i = 0; i < tr.steps.length; i++) {
        const map = tr.mapping.maps[i];
        const forward = tr.mapping.slice(i + 1);

        map.forEach((oldStart: number, oldEnd: number, newStart: number, newEnd: number) => {
          const finalNewFrom = forward.map(newStart, 1);
          const finalNewTo = forward.map(newEnd, -1);
          ranges.push({ oldFrom: oldStart, oldTo: oldEnd, newFrom: finalNewFrom, newTo: finalNewTo });
        });
      }

      return ranges;
    };

    return [
      new Plugin({
        key,
        filterTransaction: (tr, state) => {
          // In standard mode, do not restrict edits
          if (this.storage.mode === 'standard') return true;
          if (!tr.docChanged) return true;

          if (tr.getMeta('restrictedEditing')?.allow) return true;

          // Allow while the document is still the default empty state
          if (editor.isEmpty) return true;

          // In restricted mode: disable mark/style/attr changes from other extensions entirely
          const disallowedStepTypes = new Set(['addMark', 'removeMark', 'setNodeMarkup']);
          for (const step of tr.steps as Array<{ toJSON?: () => { stepType?: string } }>) {
            const t = step?.toJSON?.().stepType;
            if (t && disallowedStepTypes.has(t)) {
              return false;
            }
          }

          if (disabledNodeTypes.some((type) => editor.isActive(type))) {
            return true;
          }

          const ranges = rangesFromTransaction(tr);
          if (ranges.length === 0) return true;

          for (const range of ranges) {
            // Pre-change validation (against state.doc)
            const preStart = getEditableRegionBounds(state.doc, state.schema, range.oldFrom);
            const preEnd = getEditableRegionBounds(state.doc, state.schema, range.oldTo);
            if (!preStart || !preEnd) return false;
            if (preStart.from !== preEnd.from || preStart.to !== preEnd.to) return false;

            // Post-change validation (against final tr.doc)
            const postStart = getEditableRegionBounds(tr.doc, state.schema, range.newFrom);
            const postEnd = getEditableRegionBounds(tr.doc, state.schema, range.newTo);
            if (!postStart || !postEnd) return false;
            if (postStart.from !== postEnd.from || postStart.to !== postEnd.to) return false;
          }

          return true;
        },

        appendTransaction: (_transactions, _oldState, newState) => {
          const type = newState.schema.nodes[editableRegionNodeName];
          if (!type) return null;

          const isRestricted = this.storage.mode === 'restricted';
          const edits: Array<{ kind: 'delete' | 'fill'; from: number; to: number }> = [];

          newState.doc.descendants((node, pos) => {
            if (node.type === type) {
              const contentText = node.textContent ?? '';
              if (contentText.length === 0) {
                if (isRestricted) {
                  // Ensure a single space exists inside empty region
                  const innerFrom = pos + 1;
                  const innerTo = pos + node.nodeSize - 1;
                  edits.push({ kind: 'fill', from: innerFrom, to: innerTo });
                } else {
                  // Remove empty region
                  edits.push({ kind: 'delete', from: pos, to: pos + node.nodeSize });
                }
              }
            }
          });

          if (edits.length === 0) return null;

          // Apply in descending order of from
          edits.sort((a, b) => b.from - a.from);
          const tr = newState.tr;
          for (const e of edits) {
            if (e.kind === 'delete') {
              tr.delete(e.from, e.to);
            } else {
              const textNode = newState.schema.text(' ');
              tr.replaceWith(e.from, e.to, textNode);
            }
          }

          tr.setMeta('restrictedEditing', { allow: true });
          return tr;
        },
      }),
    ];
  },
});
