/**
 * CKEditor 5 HTML compatibility layer.
 *
 * Lets the editor load HTML that was produced by the legacy CKEditor 5 build and save it back
 * in the same shape, so stored documents and the code that reads them keep working.
 *
 * - {@link fromCkHtml} runs before content is set into the editor. It strips the CKEditor
 *   data-processor wrapper and records each element's original attributes, in order, in a
 *   `data-ck` attribute that the {@link CkCompat} extension carries through editing.
 * - {@link toCkHtml} runs on `editor.getHTML()`. It rebuilds the CKEditor markup from those
 *   records: attribute order, `prop:value;` style formatting, `<figure class="table">`,
 *   `<colgroup>`, bare text in single-paragraph cells, `<i>`, page breaks, dynamic fields and
 *   the wrapper. Anything the user changed is taken from the editor; anything the editor does
 *   not model is kept verbatim.
 *
 * Both functions need a `DOMParser`. In the browser the global one is used. In Node (no global DOM)
 * pass one in, e.g. from {@link createCkDomParser}:
 *
 * ```ts
 * const domParser = await createCkDomParser();
 * const ckHtml = toCkHtml(await generateHTML(json, extensions), { wrapperClass, domParser });
 * ```
 */

import { absoluteLengthToPx } from '../../internal/css-length';

/** Attribute that carries the original CKEditor attributes of an element through the editor. */
export const CK_ORIGIN_ATTRIBUTE = 'data-ck';

/** Class list of the CKEditor data-processor wrapper (`CustomHtmlDataProcessor`). */
export const CK_WRAPPER_BASE_CLASS = 'ck ck-content ck-print';

/** The part of the DOM `DOMParser` API the compatibility layer needs. */
export interface CkDomParser {
  parseFromString(source: string, type: 'text/html'): Document;
}

export interface CkDomOptions {
  /** Parser to use instead of the global `DOMParser`; required where there is no DOM (Node). */
  domParser?: CkDomParser;
}

export interface CkHtmlOptions extends CkDomOptions {
  /**
   * Class list for the outer wrapper `<div>` — pass the `wrapperClass` that {@link fromCkHtml}
   * returned for this document. Defaults to {@link CK_WRAPPER_BASE_CLASS}; `false` emits no wrapper.
   */
  wrapperClass?: string | false;
}

export interface CkLoadResult {
  /** HTML ready to be set into the editor. */
  html: string;
  /** Class list of the wrapper that was stripped, or `null` when the input had none. */
  wrapperClass: string | null;
  /**
   * Keys of {@link CK_UNSUPPORTED_CONTENT} found in the input. The editor has no node for these, so
   * loading the document would drop them: open it read-only (or keep the legacy editor) when non-empty.
   */
  unsupported: CkUnsupportedContent[];
}

/**
 * Content produced by CKEditor plugins of the legacy build that this editor cannot represent yet,
 * keyed by name, with the selector that identifies it in stored HTML.
 */
export const CK_UNSUPPORTED_CONTENT = {
  signatureField: '.redr-signature-field',
  inlineField: '.redr-inline-field',
  dynamicImage: '.redr-dynamic-image',
  dealTable: '.redr-deal-table',
  editorColumn: '.redr-editor-column',
  restrictedEditingException: '.restricted-editing-exception',
  image: 'img, figure.image',
} as const;

export type CkUnsupportedContent = keyof typeof CK_UNSUPPORTED_CONTENT;

export interface CkRoundTripReport {
  /** `true` when saving the loaded document unchanged reproduces the input byte-for-byte. */
  identical: boolean;
  /** Where the two first differ (a short excerpt of each side), or `null` when identical. */
  difference: { index: number; expected: string; actual: string } | null;
}

type AttrList = [string, string][];

interface CkOrigin {
  /** Original attributes, in document order. */
  a: AttrList;
  /** Attributes of the `<figure class="table">` around a table. */
  f?: AttrList;
  /** Attributes of each `<col>` in the table's `<colgroup>`. */
  c?: AttrList[];
}

/** Elements whose original attributes are recorded on load. */
const TRACKED_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,span,table,tr,td,th,blockquote,li,ol,ul,a,div.page-break';

/** Style properties the editor itself writes, per element. A recorded value for one of these
 * that the editor no longer emits was removed by the user and is dropped. */
const OWNED_STYLES: Record<string, string[]> = {
  p: ['text-align', 'margin-left'],
  h: ['text-align', 'margin-left'],
  span: ['font-size', 'font-family', 'color', 'background-color', 'line-height'],
  td: ['text-align', 'vertical-align', 'background-color', 'border-color', 'border-style', 'border-width'],
  table: ['background-color', 'border-color', 'border-style', 'border-width'],
  col: ['width'],
};

/** Attributes the editor itself writes. A recorded one the editor no longer emits is dropped. */
const OWNED_ATTRIBUTES = new Set(['style', 'colspan', 'rowspan', 'href', 'target', 'rel', 'start', 'type']);

/** Attributes the editor emits that never belong in CKEditor output. */
const ENGINE_ONLY_ATTRIBUTES = ['data-colwidths', 'colwidth', 'data-indent'];

/**
 * Default cell styles the table extension writes on every cell. On an element that came from
 * CKEditor they are dropped unless the source had them; a border group is only dropped when all
 * three parts are still the default, so a border the user set is kept.
 */
const DEFAULT_CELL_BORDER: [string, string][] = [
  ['border-style', 'solid'],
  ['border-color', '#e5e7eb'],
  ['border-width', '1px'],
];
const DEFAULT_TABLE_BORDER = DEFAULT_CELL_BORDER;
const DEFAULT_CELL_VERTICAL_ALIGN = 'middle';

/** Declarations the editor emits as a neutral default; dropped unless they were in the source. */
const NEUTRAL_DECLARATIONS = new Set(['margin-left:0px', 'margin-left:0', 'margin-left:nullpx']);

const DYNAMIC_FIELD_BASE_CLASSES = ['red-dynamic-field', 'inline-field', 'redr-handlebar-field'];
const DYNAMIC_FIELD_HAS_VALUE_CLASS = 'red-dynamic-field--has-value';

const PAGE_BREAK_HTML =
  '<div class="page-break" style="page-break-after:always;"><span style="display:none;">&nbsp;</span></div>';

function parse(html: string, domParser?: CkDomParser): HTMLElement {
  if (!domParser && typeof DOMParser === 'undefined') {
    throw new Error(
      'CKEditor compatibility needs a DOM: pass `domParser` (see createCkDomParser) when there is no global DOMParser.'
    );
  }
  const doc = (domParser ?? new DOMParser()).parseFromString(`<body>${html}</body>`, 'text/html');
  return doc.body;
}

/**
 * A `DOMParser` for {@link fromCkHtml} / {@link toCkHtml} that works in any environment: the global one
 * in the browser, otherwise one from happy-dom (already installed with `@tiptap/html`, which
 * {@link generateHTML} uses for the same reason). Create it once and reuse it.
 */
export async function createCkDomParser(): Promise<CkDomParser> {
  if (typeof DOMParser !== 'undefined') return new DOMParser();
  // Built at runtime so browser bundlers never resolve happy-dom (see generateHTML).
  const specifier = ['happy', 'dom'].join('-');
  let happyDom: { Window: new () => { DOMParser: new () => CkDomParser } };
  try {
    happyDom = await import(/* webpackIgnore: true */ /* @vite-ignore */ specifier);
  } catch {
    throw new Error('No DOM available: install happy-dom, or pass your own `domParser` (e.g. from jsdom).');
  }
  return new new happyDom.Window().DOMParser();
}

function attrsOf(el: Element): AttrList {
  return Array.from(el.attributes)
    .filter((a) => a.name !== CK_ORIGIN_ATTRIBUTE)
    .map((a) => [a.name, a.value]);
}

/** Attribute names a record may restore: no event handlers, nothing a browser would not parse. */
const SAFE_ATTRIBUTE_NAME = /^(?!on)[a-z_:][a-z0-9_:.-]*$/i;
const UNSAFE_URL = /^\s*(javascript|vbscript|data:text\/html)/i;

/**
 * A record is restored verbatim on save, and it can arrive from pasted HTML, not only from
 * `fromCkHtml`. Accept only a well-formed one, without script-bearing attributes.
 */
/** Browsers ignore control characters inside a URL scheme (`java\tscript:`). */
function withoutControlChars(value: string): string {
  return Array.from(value)
    .filter((c) => c.charCodeAt(0) > 0x1f)
    .join('');
}

function cleanAttrList(value: unknown): AttrList | null {
  if (!Array.isArray(value)) return null;
  const list: AttrList = [];
  for (const pair of value) {
    if (!Array.isArray(pair) || pair.length !== 2 || typeof pair[0] !== 'string' || typeof pair[1] !== 'string')
      return null;
    const [name, val] = pair as [string, string];
    if (SAFE_ATTRIBUTE_NAME.test(name) && !UNSAFE_URL.test(withoutControlChars(val))) list.push([name, val]);
  }
  return list;
}

function readOrigin(el: Element): CkOrigin | null {
  const raw = el.getAttribute(CK_ORIGIN_ATTRIBUTE);
  if (!raw) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!parsed || typeof parsed !== 'object') return null;
  const record = parsed as Record<string, unknown>;
  const a = cleanAttrList(record['a']);
  if (!a) return null;
  const origin: CkOrigin = { a };
  if (record['f'] !== undefined) {
    const f = cleanAttrList(record['f']);
    if (!f) return null;
    origin.f = f;
  }
  if (record['c'] !== undefined) {
    if (!Array.isArray(record['c'])) return null;
    const c = record['c'].map(cleanAttrList);
    if (c.some((x) => !x)) return null;
    origin.c = c as AttrList[];
  }
  return origin;
}

function writeOrigin(el: Element, origin: CkOrigin): void {
  el.setAttribute(CK_ORIGIN_ATTRIBUTE, JSON.stringify(origin));
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

/**
 * Prepare CKEditor HTML for the editor. Safe to call on HTML that did not come from
 * CKEditor: it then only records attributes.
 */
export function fromCkHtml(html: string, options: CkDomOptions = {}): CkLoadResult {
  const body = parse(html ?? '', options.domParser);

  let wrapperClass: string | null = null;
  const only = body.children.length === 1 ? body.firstElementChild : null;
  if (only && only.tagName === 'DIV' && only.classList.contains('ck-content') && only.classList.contains('ck')) {
    wrapperClass = only.getAttribute('class');
    only.replaceWith(...Array.from(only.childNodes));
  }

  body.querySelectorAll(TRACKED_SELECTOR).forEach((el) => {
    // Dynamic-field spans keep their attributes in their own record (see DynamicField export).
    writeOrigin(el, { a: attrsOf(el) });
  });

  body.querySelectorAll('figure.table').forEach((figure) => {
    const table = figure.querySelector(':scope > table');
    if (!table) return;
    const origin = readOrigin(table) ?? { a: attrsOf(table) };
    origin.f = attrsOf(figure);
    writeOrigin(table, origin);
    figure.replaceWith(...Array.from(figure.childNodes));
  });

  body.querySelectorAll('table').forEach((table) => {
    const cols = table.querySelectorAll(':scope > colgroup > col');
    if (!cols.length) return;
    const origin = readOrigin(table) ?? { a: attrsOf(table) };
    origin.c = Array.from(cols).map(attrsOf);
    writeOrigin(table, origin);
  });

  const unsupported = (Object.keys(CK_UNSUPPORTED_CONTENT) as CkUnsupportedContent[]).filter((key) =>
    body.querySelector(CK_UNSUPPORTED_CONTENT[key])
  );

  return { html: body.innerHTML, wrapperClass, unsupported };
}

/**
 * Compare the stored HTML with what saving the freshly loaded document would write
 * (`toCkHtml(editor.getHTML())` before any edit). A difference means the editor could not
 * represent part of the document and saving would change it — open it read-only instead.
 */
export function verifyCkRoundTrip(original: string, saved: string): CkRoundTripReport {
  if (original === saved) return { identical: true, difference: null };

  let index = 0;
  while (index < original.length && index < saved.length && original[index] === saved[index]) index++;
  const excerpt = (text: string) => text.slice(Math.max(0, index - 40), index + 80);
  return { identical: false, difference: { index, expected: excerpt(original), actual: excerpt(saved) } };
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

function parseStyle(style: string | null): [string, string][] {
  if (!style) return [];
  return style
    .split(';')
    .map((d) => d.trim())
    .filter(Boolean)
    .map((d) => {
      const i = d.indexOf(':');
      return [d.slice(0, i).trim().toLowerCase(), d.slice(i + 1).trim()] as [string, string];
    })
    .filter(([k]) => !!k);
}

function formatStyle(decls: [string, string][]): string {
  return decls.map(([k, v]) => `${k}:${v};`).join('');
}

/** Compare two CSS values the way the browser would compute them. */
function sameCssValue(prop: string, a: string, b: string, probe: HTMLElement): boolean {
  if (a === b) return true;
  if (a.replace(/\s+/g, '') === b.replace(/\s+/g, '')) return true;
  probe.style.setProperty(prop, a);
  const ca = probe.style.getPropertyValue(prop);
  probe.style.setProperty(prop, b);
  const cb = probe.style.getPropertyValue(prop);
  probe.removeAttribute('style');
  if (!!ca && ca === cb) return true;
  // The editor writes lengths in px; `1cm` in the source and `37.8px` from the editor are the same value.
  const pa = absoluteLengthToPx(a);
  const pb = absoluteLengthToPx(b);
  return pa !== null && pb !== null && Math.abs(pa - pb) < 0.01;
}

function styleGroup(tag: string): string {
  if (/^h[1-6]$/.test(tag)) return 'h';
  if (tag === 'th') return 'td';
  return tag;
}

function dropEditorDefaults(
  group: string,
  orig: [string, string][],
  cur: Map<string, string>,
  probe: HTMLElement
): void {
  const had = (k: string) => orig.some(([ok]) => ok === k || (k.startsWith('border-') && ok === 'border'));
  const border = group === 'td' ? DEFAULT_CELL_BORDER : group === 'table' ? DEFAULT_TABLE_BORDER : null;
  if (
    border &&
    border.every(([k]) => !had(k)) &&
    border.every(([k, v]) => cur.has(k) && sameCssValue(k, v, cur.get(k) as string, probe))
  ) {
    border.forEach(([k]) => cur.delete(k));
  }
  if (group === 'td' && !had('vertical-align') && cur.get('vertical-align') === DEFAULT_CELL_VERTICAL_ALIGN) {
    cur.delete('vertical-align');
  }
}

/** Keep a source `border` shorthand when the editor's longhands still say the same thing. */
function shorthandStillHolds(value: string, cur: Map<string, string>, probe: HTMLElement): boolean {
  probe.style.setProperty('border', value);
  const parts = ['border-style', 'border-color', 'border-width'].map((k) => [k, probe.style.getPropertyValue(k)]);
  probe.removeAttribute('style');
  return parts.every(([k, v]) => !v || (cur.has(k) && sameCssValue(k, v, cur.get(k) as string, probe)));
}

function reconcileStyle(
  tag: string,
  original: string | null,
  current: string | null,
  probe: HTMLElement,
  fromSource = original !== null
): string {
  const group = styleGroup(tag);
  const owned = OWNED_STYLES[group] ?? [];
  const orig = parseStyle(original);
  // A value the editor could not parse (e.g. `margin-left: NaNpx`) means "unset".
  const cur = new Map(parseStyle(current).filter(([, v]) => !/NaN|null|undefined/.test(v)));
  const out: [string, string][] = [];

  if (fromSource) dropEditorDefaults(group, orig, cur, probe);

  for (const [k, v] of orig) {
    if (k === 'border' && shorthandStillHolds(v, cur, probe)) {
      out.push([k, v]);
      ['border-style', 'border-color', 'border-width'].forEach((l) => cur.delete(l));
    } else if (cur.has(k)) {
      const nv = cur.get(k) as string;
      out.push([k, sameCssValue(k, v, nv, probe) ? v : nv]);
      cur.delete(k);
    } else if ((!owned.includes(k) || isZeroLength(v) || notReadable(k, v)) && !isCoveredBy(k, cur)) {
      // Unmodelled properties are kept verbatim. So is an owned one the editor reads as "no value":
      // zero in any unit (`margin-left:0in`) or a length it cannot express in px (`margin-left:2em`).
      out.push([k, v]);
    }
  }
  for (const [k, v] of cur) {
    if (NEUTRAL_DECLARATIONS.has(`${k}:${v.replace(/\s+/g, '')}`)) continue;
    if (impliedByShorthand(k, v, orig, probe)) continue;
    out.push([k, v]);
  }
  return formatStyle(out);
}

/** Owned length properties the editor only models in absolute units. */
const PX_ONLY_STYLES = new Set(['margin-left']);

function notReadable(prop: string, value: string): boolean {
  return PX_ONLY_STYLES.has(prop) && absoluteLengthToPx(value) === null;
}

/**
 * The editor reads a longhand out of a source shorthand (`margin:0 0 0 36pt` gives an indent of
 * 48px) and writes it back. While the value is unchanged, the shorthand already says it.
 */
function impliedByShorthand(prop: string, value: string, orig: [string, string][], probe: HTMLElement): boolean {
  const shorthand = /^(margin|padding)-/.exec(prop)?.[1];
  const source = shorthand && orig.find(([k]) => k === shorthand);
  if (!source) return false;
  probe.style.setProperty(shorthand, source[1]);
  const implied = probe.style.getPropertyValue(prop);
  probe.removeAttribute('style');
  return !!implied && sameCssValue(prop, implied, value, probe);
}

function isZeroLength(value: string): boolean {
  return /^0(\.0+)?([a-z]+|%)?$/i.test(value.trim());
}

/** A shorthand such as `border` is superseded when the editor wrote its longhands. */
function isCoveredBy(prop: string, current: Map<string, string>): boolean {
  if (prop === 'border') return ['border-style', 'border-color', 'border-width'].some((k) => current.has(k));
  return false;
}

function setAttributesInOrder(el: Element, attrs: AttrList): void {
  Array.from(el.attributes).forEach((a) => el.removeAttribute(a.name));
  attrs.forEach(([k, v]) => el.setAttribute(k, v));
}

/** Rebuild one element's attributes from its recorded origin and what the editor emitted. */
function reconcileElement(el: Element, origin: AttrList | null, probe: HTMLElement): void {
  const tag = el.tagName.toLowerCase();
  const record = el.getAttribute(CK_ORIGIN_ATTRIBUTE);
  const current = new Map(attrsOf(el).filter(([k]) => !ENGINE_ONLY_ATTRIBUTES.includes(k)));
  const result: AttrList = [];

  for (const [k, v] of origin ?? []) {
    if (k === 'style') {
      const style = reconcileStyle(tag, v, current.get('style') ?? null, probe);
      if (style) result.push(['style', style]);
      current.delete('style');
    } else if (k === 'class') {
      const classes = (current.get('class') ?? '').split(/\s+/).filter(Boolean);
      const merged = [...v.split(/\s+/).filter(Boolean)];
      classes.forEach((c) => !merged.includes(c) && merged.push(c));
      result.push(['class', merged.join(' ')]);
      current.delete('class');
    } else if (current.has(k)) {
      result.push([k, current.get(k) as string]);
      current.delete(k);
    } else if (!OWNED_ATTRIBUTES.has(k)) {
      result.push([k, v]);
    }
  }

  for (const [k, v] of current) {
    if (k === 'style') {
      const style = reconcileStyle(tag, null, v, probe, origin !== null);
      if (style) result.push(['style', style]);
    } else if ((k === 'colspan' || k === 'rowspan') && v === '1') {
      continue;
    } else {
      result.push([k, v]);
    }
  }

  setAttributesInOrder(el, result);
  // Keep the record for later passes (tables read it); it is stripped at the very end.
  if (record) el.setAttribute(CK_ORIGIN_ATTRIBUTE, record);
}

function exportDynamicFields(body: HTMLElement): void {
  body.querySelectorAll('span[data-field-id]').forEach((el) => {
    const key = el.getAttribute('data-field-id') ?? '';
    const label = el.getAttribute('data-label') || key;
    const origin = readOrigin(el)?.a ?? null;
    const doc = el.ownerDocument;
    const span = doc.createElement('span');

    const originKey = origin ? (el.textContent ?? '').replace(/{{|}}/g, '').trim() : null;
    if (origin && originKey === key) {
      setAttributesInOrder(span, origin);
    } else {
      // A field inserted (or re-keyed) in this editor: emit the shape the CKEditor plugin writes.
      setAttributesInOrder(span, [
        ['class', [...DYNAMIC_FIELD_BASE_CLASSES, DYNAMIC_FIELD_HAS_VALUE_CLASS].join(' ')],
        ['id', `red-dynamic-field__${key}`],
        ['name', label],
        ['background', 'false'],
        ['dynamicfieldname', label],
        ['value', label],
        ['type', 'textbox:text'],
      ]);
    }
    span.textContent = `{{${key}}}`;
    el.replaceWith(span);
  });
}

/**
 * Tiptap's `TrailingNode` appends an empty paragraph whenever a document ends in a table or other
 * non-paragraph block. CKEditor allows that ending, so drop the paragraph unless the source had it.
 */
function dropTrailingNode(body: HTMLElement): void {
  const last = body.lastElementChild;
  if (!last || last.tagName !== 'P' || last.attributes.length || last.childNodes.length) return;
  const previous = last.previousElementSibling;
  if (previous && previous.tagName !== 'P') last.remove();
}

function exportPageBreaks(body: HTMLElement): void {
  body.querySelectorAll('div[data-page-break]').forEach((el) => {
    const origin = readOrigin(el)?.a;
    const holder = el.ownerDocument.createElement('div');
    holder.innerHTML = PAGE_BREAK_HTML;
    const div = holder.firstElementChild as HTMLElement;
    if (origin) setAttributesInOrder(div, origin);
    el.replaceWith(div);
  });
}

function exportTables(body: HTMLElement, probe: HTMLElement): void {
  body.querySelectorAll('table').forEach((table) => {
    const origin = readOrigin(table);
    const doc = table.ownerDocument;

    // <colgroup>: keep the recorded <col> attributes when the column count is unchanged.
    const cols = Array.from(table.querySelectorAll(':scope > colgroup > col'));
    cols.forEach((col, i) => {
      const recorded = origin?.c && origin.c.length === cols.length ? origin.c[i] : null;
      reconcileElement(col, recorded, probe);
    });

    table.querySelectorAll(':scope > tbody > tr > td, :scope > tbody > tr > th').forEach(unwrapLoneParagraph);

    // <figure class="table">: restore the recorded wrapper, or add CKEditor's default.
    if (table.parentElement?.tagName !== 'FIGURE') {
      const figure = doc.createElement('figure');
      setAttributesInOrder(figure, origin?.f ?? [['class', 'table']]);
      table.replaceWith(figure);
      figure.appendChild(table);
    }
  });
}

/** CKEditor writes a lone, attribute-less paragraph in a table cell or list item as bare content. */
function unwrapLoneParagraph(container: Element): void {
  const only = container.childNodes.length === 1 ? container.firstElementChild : null;
  if (only && only === container.firstChild && only.tagName === 'P' && !hasMeaningfulAttributes(only)) {
    only.replaceWith(...Array.from(only.childNodes));
  }
}

/** True when an element carries attributes CKEditor would keep (ignores the origin record). */
function hasMeaningfulAttributes(el: Element): boolean {
  const origin = readOrigin(el)?.a ?? [];
  if (origin.length) return true;
  return attrsOf(el).some(([k, v]) => {
    if (ENGINE_ONLY_ATTRIBUTES.includes(k)) return false;
    if (k === 'style')
      return parseStyle(v).some(([p, val]) => !NEUTRAL_DECLARATIONS.has(`${p}:${val.replace(/\s+/g, '')}`));
    return true;
  });
}

/**
 * Turn `editor.getHTML()` output back into CKEditor-shaped HTML.
 */
export function toCkHtml(html: string, options: CkHtmlOptions = {}): string {
  const body = parse(html ?? '', options.domParser);
  const probe = body.ownerDocument.createElement('span');

  exportDynamicFields(body);
  exportPageBreaks(body);

  // Reconcile plain elements before tables restructure cells (so `<p>` attributes are final).
  body.querySelectorAll('*').forEach((el) => {
    const tag = el.tagName.toLowerCase();
    if (tag === 'col' || el.closest('div.page-break') || el.matches('span[id^="red-dynamic-field"]')) return;
    reconcileElement(el, readOrigin(el)?.a ?? null, probe);
  });

  dropTrailingNode(body);

  // CKEditor writes an empty block as `&nbsp;`.
  body.querySelectorAll('p,h1,h2,h3,h4,h5,h6').forEach((el) => {
    if (!el.childNodes.length) el.textContent = '\u00a0';
  });

  exportTables(body, probe);
  body.querySelectorAll('li').forEach(unwrapLoneParagraph);

  // CKEditor's Italic writes <i>, not <em>.
  body.querySelectorAll('em').forEach((em) => {
    const i = em.ownerDocument.createElement('i');
    Array.from(em.attributes).forEach((a) => i.setAttribute(a.name, a.value));
    i.append(...Array.from(em.childNodes));
    em.replaceWith(i);
  });

  body.querySelectorAll(`[${CK_ORIGIN_ATTRIBUTE}]`).forEach((el) => el.removeAttribute(CK_ORIGIN_ATTRIBUTE));

  const wrapperClass = options.wrapperClass ?? CK_WRAPPER_BASE_CLASS;
  if (wrapperClass === false) return body.innerHTML;
  // Built as an element so a class read from stored HTML is escaped like any attribute value.
  const wrapper = body.ownerDocument.createElement('div');
  wrapper.setAttribute('class', wrapperClass);
  wrapper.append(...Array.from(body.childNodes));
  return wrapper.outerHTML;
}
