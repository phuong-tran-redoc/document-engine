import { Extension } from '@tiptap/core';
import { Fragment, Node as PMNode, Slice } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { CK_ORIGIN_ATTRIBUTE } from './ck-html';

/** Node and mark types whose original CKEditor attributes are carried through editing. */
export const CK_COMPAT_TYPES: readonly string[] = [
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'table',
  'tableRow',
  'tableCell',
  'tableHeader',
  'textStyle',
  'link',
  'dynamicField',
  'pageBreak',
  'editableRegion',
];

const ckOrigin = (fallback?: (element: HTMLElement) => string | null) => ({
  default: null,
  // Splitting a block must not copy the record: the new block is new content.
  keepOnSplit: false,
  parseHTML: (element: HTMLElement) => element.getAttribute(CK_ORIGIN_ATTRIBUTE) ?? fallback?.(element) ?? null,
  renderHTML: (attributes: Record<string, unknown>) =>
    attributes['ckOrigin'] ? { [CK_ORIGIN_ATTRIBUTE]: attributes['ckOrigin'] } : {},
});

/**
 * A CKEditor dynamic field pasted into the editor never went through `fromCkHtml()`, so record
 * its attributes here — otherwise its original id/name/value would be replaced on save.
 */
function recordPastedDynamicField(element: HTMLElement): string | null {
  // The editor renders its own fields with this class too; only CKEditor markup lacks `data-field-id`.
  if (!element.classList.contains('red-dynamic-field') || element.hasAttribute('data-field-id')) return null;
  const a = Array.from(element.attributes).map((attr) => [attr.name, attr.value]);
  return JSON.stringify({ a });
}

/**
 * A pasted or dropped copy of the block that opens a stored section must not open another one: drop
 * the section keys (`w`, `s`) from the records of pasted content. The block left in place keeps them.
 */
function withoutSectionRecords(fragment: Fragment): Fragment {
  const nodes: PMNode[] = [];
  fragment.forEach((node) => {
    if (node.isText) {
      nodes.push(node);
      return;
    }
    const origin = node.attrs['ckOrigin'];
    const attrs = typeof origin === 'string' ? { ...node.attrs, ckOrigin: dropSectionKeys(origin) } : node.attrs;
    nodes.push(node.type.create(attrs, withoutSectionRecords(node.content), node.marks));
  });
  return Fragment.fromArray(nodes);
}

function dropSectionKeys(origin: string): string {
  try {
    const record = JSON.parse(origin);
    if (!record || typeof record !== 'object' || (!('w' in record) && !('s' in record))) return origin;
    delete record.w;
    delete record.s;
    return JSON.stringify(record);
  } catch {
    return origin;
  }
}

/**
 * Keeps the `data-ck` record written by `fromCkHtml()` on every supported node and mark, so
 * `toCkHtml()` can restore the original CKEditor markup on save. Register it together with the
 * two functions; on its own it only round-trips the attribute.
 */
export const CkCompat = Extension.create({
  name: 'ckCompat',

  addGlobalAttributes() {
    return [
      { types: CK_COMPAT_TYPES.filter((t) => t !== 'dynamicField'), attributes: { ckOrigin: ckOrigin() } },
      { types: ['dynamicField'], attributes: { ckOrigin: ckOrigin(recordPastedDynamicField) } },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('ckCompatPaste'),
        props: {
          transformPasted: (slice) =>
            new Slice(withoutSectionRecords(slice.content), slice.openStart, slice.openEnd),
        },
      }),
    ];
  },
});
