import { Editor, Extensions } from '@tiptap/core';
import { TrailingNode } from '@tiptap/extensions';
import * as fs from 'fs';
import * as path from 'path';
import { CK_UNSUPPORTED_CONTENT, CkCompat, createCkDomParser, fromCkHtml, toCkHtml, verifyCkRoundTrip } from '../../compat';
import { generateHTML } from '../../kit/generate-html';
import { Indent } from '../../extensions/indent.extension';
import { EditableRegion, RestrictedEditing } from '../../extensions/restricted-editing.extension';
import { defaultExtensions } from '../../kit/default-extensions';
import { BP1, BP_2, BP_ANNEX, BP_Multi, BP_Single } from './fixtures/ck-letter-of-offer';

const extensions: Extensions = [...defaultExtensions, Indent, CkCompat];
// The Angular kit also registers TrailingNode, which edits the document as soon as content is set.
const kitExtensions: Extensions = [...extensions, TrailingNode];

/** Load CKEditor HTML into an editor and save it back, the way a consumer would. */
function roundTrip(html: string): string {
  const { html: loaded, wrapperClass } = fromCkHtml(html);
  const editor = new Editor({ extensions: kitExtensions });
  editor.commands.setContent(loaded, { emitUpdate: false });
  const out = toCkHtml(editor.getHTML(), { wrapperClass: wrapperClass ?? false });
  editor.destroy();
  return out;
}

/** Structural comparison: same elements, attributes, style declarations and text. */
function domDiff(expected: string, actual: string): string | null {
  const parse = (h: string) => new DOMParser().parseFromString(`<body>${h}</body>`, 'text/html').body;
  const styleOf = (el: Element) =>
    (el.getAttribute('style') ?? '')
      .split(';')
      .map((d) => d.replace(/\s+/g, ''))
      .filter(Boolean)
      .sort()
      .join(';');

  const walk = (a: Node, b: Node, where: string): string | null => {
    if (a.nodeType !== b.nodeType) return `${where}: node type ${a.nodeType} vs ${b.nodeType}`;
    if (a.nodeType === Node.TEXT_NODE) {
      return a.textContent === b.textContent
        ? null
        : `${where}: text ${JSON.stringify(a.textContent)} vs ${JSON.stringify(b.textContent)}`;
    }
    const ea = a as Element;
    const eb = b as Element;
    if (ea.tagName !== eb.tagName) return `${where}: <${ea.tagName}> vs <${eb.tagName}>`;
    const here = `${where}>${ea.tagName.toLowerCase()}`;
    const names = new Set([...ea.getAttributeNames(), ...eb.getAttributeNames()]);
    for (const n of names) {
      const va = n === 'style' ? styleOf(ea) : ea.getAttribute(n);
      const vb = n === 'style' ? styleOf(eb) : eb.getAttribute(n);
      if (va !== vb) return `${here}@${n}: ${JSON.stringify(va)} vs ${JSON.stringify(vb)}`;
    }
    if (ea.childNodes.length !== eb.childNodes.length) {
      return `${here}: ${ea.childNodes.length} vs ${eb.childNodes.length} children — ${ea.innerHTML.slice(
        0,
        160
      )} ‖ ${eb.innerHTML.slice(0, 160)}`;
    }
    for (let i = 0; i < ea.childNodes.length; i++) {
      const d = walk(ea.childNodes[i], eb.childNodes[i], `${here}[${i}]`);
      if (d) return d;
    }
    return null;
  };
  return walk(parse(expected), parse(actual), '');
}

const fixtures: [string, string][] = [
  ['BP1', BP1],
  ['BP_Single', BP_Single],
  ['BP_Multi', BP_Multi],
  ['BP_2', BP_2],
  ['BP_ANNEX', BP_ANNEX],
];

// Private corpora (e.g. a consumer's stored templates) can be checked without committing them:
//   CK_FIXTURES_DIR=/path/to/html-files nx test document-engine-core --testPathPattern=ck-html
const privateDir = process.env['CK_FIXTURES_DIR'];
if (privateDir) {
  for (const f of fs.readdirSync(privateDir).filter((n) => n.endsWith('.html'))) {
    fixtures.push([f, fs.readFileSync(path.join(privateDir, f), 'utf8')]);
  }
}

describe('CKEditor HTML compatibility', () => {
  describe.each(fixtures)('%s', (_name, html) => {
    it('saves the same document structure it loaded', () => {
      expect(domDiff(html, roundTrip(html))).toBeNull();
    });

    it('saves byte-identical HTML', () => {
      expect(roundTrip(html)).toBe(html);
    });

    it('is stable across repeated saves', () => {
      const once = roundTrip(html);
      expect(roundTrip(once)).toBe(once);
    });
    // Lazy migration to JSON storage: the editor's JSON keeps the CKEditor records (`ckOrigin`), so
    // CKEditor HTML can still be produced from it, e.g. for printing or for consumers not yet migrated.
    it('survives being stored as JSON and rendered back to CKEditor HTML', async () => {
      const { html: loaded, wrapperClass } = fromCkHtml(html);
      const editor = new Editor({ extensions: kitExtensions });
      editor.commands.setContent(loaded, { emitUpdate: false });
      const json = JSON.parse(JSON.stringify(editor.getJSON()));
      editor.destroy();

      const rendered = await generateHTML(json, kitExtensions);
      expect(toCkHtml(rendered, { wrapperClass: wrapperClass ?? false })).toBe(html);
    });
  });

  describe('content the editor cannot represent', () => {
    it('reports CKEditor plugin content that has no editor node', () => {
      const html =
        '<div class="ck ck-content ck-print"><p>Sign: <span class="redr-inline-field" data-id="a">x</span></p><figure class="image"><img src="a.png"></figure><div class="redr-signature-field"></div></div>';
      expect(fromCkHtml(html).unsupported).toEqual(['signatureField', 'inlineField', 'image']);
    });

    it('reports nothing for supported content', () => {
      expect(fromCkHtml(BP1).unsupported).toEqual([]);
    });

    it('detects that saving would change a document with unsupported content', () => {
      const html = '<div class="ck ck-content ck-print"><p>a</p><div class="redr-deal-table"><p>b</p></div></div>';
      const report = verifyCkRoundTrip(html, roundTrip(html));
      expect(report.identical).toBe(false);
      expect(report.difference?.expected).toContain('redr-deal-table');
    });

    it('confirms an unchanged round-trip', () => {
      expect(verifyCkRoundTrip(BP1, roundTrip(BP1))).toEqual({ identical: true, difference: null });
    });
  });

  describe('content created in the editor', () => {
    it('writes a new dynamic field in the CKEditor plugin shape', () => {
      const editor = new Editor({ extensions, content: '<p>Hi !</p>' });
      editor.commands.insertContentAt(4, { type: 'dynamicField', attrs: { fieldId: 'name', label: 'Name' } });
      expect(toCkHtml(editor.getHTML())).toBe(
        '<div class="ck ck-content ck-print"><p>Hi <span class="red-dynamic-field inline-field redr-handlebar-field red-dynamic-field--has-value" id="red-dynamic-field__name" name="Name" background="false" dynamicfieldname="Name" value="Name" type="textbox:text">{{name}}</span>!</p></div>'
      );
      editor.destroy();
    });

    it('keeps the attributes of a CKEditor dynamic field pasted into the editor', () => {
      const pasted =
        '<span class="red-dynamic-field inline-field redr-handlebar-field red-dynamic-field--has-value" id="red-dynamic-field__ref" name="Reference" background="false" dynamicfieldname="Reference" value="Our Ref" type="textbox:text">{{ref}}</span>';
      const editor = new Editor({ extensions, content: '<p>Hi !</p>' });
      editor.commands.insertContentAt(4, pasted);
      expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(`<p>Hi ${pasted}!</p>`);
      editor.destroy();
    });

    it("does not save the paragraph Tiptap's TrailingNode adds after a closing table", () => {
      const html =
        '<div class="ck ck-content ck-print"><p>a</p><figure class="table"><table><tbody><tr><td>x</td></tr></tbody></table></figure></div>';
      const { html: loaded, wrapperClass } = fromCkHtml(html);
      const editor = new Editor({ extensions: kitExtensions });
      editor.commands.setContent(loaded, { emitUpdate: false });
      expect(editor.getHTML()).toMatch(/<\/table><p[^>]*><\/p>$/);
      expect(toCkHtml(editor.getHTML(), { wrapperClass: wrapperClass ?? false })).toBe(html);
      editor.destroy();
    });

    it('writes a new table inside <figure class="table"> without default spans', () => {
      const editor = new Editor({ extensions, content: '<p>x</p>' });
      editor.commands.insertTable({ rows: 1, cols: 2, withHeaderRow: false });
      const out = toCkHtml(editor.getHTML(), { wrapperClass: false });
      expect(out).toContain('<figure class="table"><table');
      expect(out).not.toMatch(/colspan="1"|rowspan="1"|data-colwidths|data-ck/);
      editor.destroy();
    });

    it('writes an empty paragraph as &nbsp; and italic as <i>', () => {
      const out = toCkHtml('<p></p><p><em>a</em></p>', { wrapperClass: false });
      expect(out).toBe('<p>&nbsp;</p><p><i>a</i></p>');
    });

    it('drops an edited-away style but keeps styles the editor does not model', () => {
      const { html } = fromCkHtml('<p style="text-align:center;line-height:14.0pt;">a</p>');
      const editor = new Editor({ extensions, content: html });
      editor.chain().selectAll().unsetTextAlign().run();
      expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe('<p style="line-height:14.0pt;">a</p>');
      editor.destroy();
    });

    describe.each([
      ['an absolute unit', 'margin-left:1cm;'],
      ['points', 'margin-left:36pt;'],
      ['a relative unit', 'margin-left:2em;'],
    ])('keeps an indent given in %s', (_unit, indent) => {
      const source = `<p style="text-align:center;${indent}line-height:14.0pt;">a</p>`;
      const load = () => {
        const { html } = fromCkHtml(source);
        return new Editor({ extensions, content: html });
      };

      it('when the paragraph is saved unchanged', () => {
        const editor = load();
        expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(source);
        editor.destroy();
      });

      it('when another style of the paragraph is edited', () => {
        const editor = load();
        editor.chain().selectAll().setTextAlign('right').run();
        expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(source.replace('center', 'right'));
        editor.destroy();
      });
    });

    it('keeps an indent given by a margin shorthand in the shorthand', () => {
      const source = '<p style="margin:0cm 0cm 0cm 36pt;text-align:center;">a</p>';
      const { html } = fromCkHtml(source);
      const editor = new Editor({ extensions, content: html });
      editor.chain().selectAll().setTextAlign('right').run();
      expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(source.replace('center', 'right'));
      editor.chain().setTextSelection(1).increaseIndent().run();
      expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(
        '<p style="margin:0cm 0cm 0cm 36pt;text-align:right;margin-left:88px;">a</p>'
      );
      editor.destroy();
    });

    it('writes an indent changed by the user in px', () => {
      const { html } = fromCkHtml('<p style="margin-left:36pt;">a</p>');
      const editor = new Editor({ extensions, content: html });
      editor.chain().setTextSelection(1).increaseIndent().run();
      expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe('<p style="margin-left:88px;">a</p>');
      editor.destroy();
    });

    it('applies a user edit to a recorded style in place', () => {
      const { html } = fromCkHtml('<p style="text-align:center;line-height:14.0pt;">a</p>');
      const editor = new Editor({ extensions, content: html });
      editor.chain().selectAll().setTextAlign('right').run();
      expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(
        '<p style="text-align:right;line-height:14.0pt;">a</p>'
      );
      editor.destroy();
    });
  });
});

describe('restricted-editing exceptions', () => {
  const CLAUSE =
    '<div class="ck ck-content ck-print"><p>The rate is <span class="restricted-editing-exception">3.5</span>% p.a., payable <span class="restricted-editing-exception"><strong>monthly</strong></span>.</p><p>Notes: <span class="restricted-editing-exception">&nbsp;</span></p></div>';

  const withRegions = (mode: 'standard' | 'restricted'): Extensions => [
    ...kitExtensions,
    EditableRegion,
    RestrictedEditing.configure({ initialMode: mode }),
  ];

  function load(html: string, mode: 'standard' | 'restricted' = 'standard') {
    const { html: loaded, wrapperClass, unsupported } = fromCkHtml(html);
    const editor = new Editor({ extensions: withRegions(mode) });
    editor.chain().setMeta('restrictedEditing', { allow: true }).setContent(loaded, { emitUpdate: false }).run();
    const save = () => toCkHtml(editor.getHTML(), { wrapperClass: wrapperClass ?? false });
    return { editor, save, unsupported };
  }

  /** Position just inside the first editable region that contains `text`. */
  function insideRegion(editor: Editor, text: string): number {
    let found = -1;
    editor.state.doc.descendants((node, pos) => {
      if (found < 0 && node.type.name === 'editableRegion' && node.textContent.includes(text)) found = pos + 1;
    });
    return found;
  }

  it('loads them as editable regions and saves byte-identical HTML', () => {
    const { editor, save, unsupported } = load(CLAUSE);
    expect(unsupported).toEqual([]);
    expect(editor.getHTML()).toContain('data-editable-region');
    expect(save()).toBe(CLAUSE);
  });

  it('saves an edit inside a region as CKEditor markup', () => {
    const { editor, save } = load(CLAUSE, 'restricted');
    editor.chain().setTextSelection(insideRegion(editor, '3.5')).insertContent('1').run();
    expect(save()).toBe(CLAUSE.replace('>3.5<', '>13.5<'));
  });

  it('blocks edits outside the regions in restricted mode', () => {
    const { editor, save } = load(CLAUSE, 'restricted');
    editor.chain().setTextSelection(2).insertContent('X').run();
    expect(save()).toBe(CLAUSE);
  });

  it('keeps a region the user emptied in restricted mode', () => {
    const { editor, save } = load(CLAUSE, 'restricted');
    const from = insideRegion(editor, '3.5');
    editor.commands.deleteRange({ from, to: from + 3 });
    expect(save()).toContain('is <span class="restricted-editing-exception">&nbsp;</span>%');
  });

  it('writes a region created in the editor as an exception', () => {
    const { editor, save } = load('<div class="ck ck-content ck-print"><p>Pay by cheque.</p></div>');
    editor.chain().setTextSelection({ from: 8, to: 14 }).toggleEditableRegion().run();
    expect(save()).toBe(
      '<div class="ck ck-content ck-print"><p>Pay by <span class="restricted-editing-exception">cheque</span>.</p></div>'
    );
  });

  it('round-trips regions in table cells and list items, and extra recorded attributes', () => {
    const html =
      '<div class="ck ck-content ck-print"><figure class="table"><table><tbody><tr><td>Rate <span class="restricted-editing-exception">3.5</span></td></tr></tbody></table></figure><ul><li><span class="restricted-editing-exception" data-id="r2">Name</span></li></ul></div>';
    const { save, unsupported } = load(html);
    expect(unsupported).toEqual([]);
    expect(save()).toBe(html);
  });

  it('keeps the exception class when a region carries a foreign record', () => {
    const editor = new Editor({ extensions: withRegions('standard') });
    editor.commands.setContent(`<p>a <span data-editable-region data-ck='{"a":[["title","x"]]}'>b</span></p>`);
    expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).toBe(
      '<p>a <span title="x" class="restricted-editing-exception">b</span></p>'
    );
  });

  it('still exposes the deprecated unsupported key without reporting it', () => {
    expect(CK_UNSUPPORTED_CONTENT.restrictedEditingException).toBe('.restricted-editing-exception');
  });

  it('writes an empty region created in the editor without its placeholder character', () => {
    const { editor, save } = load('<div class="ck ck-content ck-print"><p>Name .</p></div>');
    editor.chain().setTextSelection(6).toggleEditableRegion().run();
    expect(save()).toBe(
      '<div class="ck ck-content ck-print"><p>Name <span class="restricted-editing-exception">&nbsp;</span>.</p></div>'
    );
  });
});

describe('records from untrusted HTML', () => {
  const save = (html: string) => {
    const editor = new Editor({ extensions, content: html });
    const out = toCkHtml(editor.getHTML(), { wrapperClass: false });
    editor.destroy();
    return out;
  };

  it('escapes a stored wrapper class', () => {
    const { wrapperClass } = fromCkHtml('<div class="ck ck-content x&quot; onmouseover=&quot;alert(1)"><p>a</p></div>');
    const out = toCkHtml('<p>a</p>', { wrapperClass: wrapperClass ?? false });
    const wrapper = new DOMParser().parseFromString(out, 'text/html').body.firstElementChild as Element;
    expect(wrapper.getAttributeNames()).toEqual(['class']);
  });

  it('does not restore event handlers or script URLs from a pasted record', () => {
    const record = JSON.stringify({
      a: [
        ['style', 'color:red;'],
        ['onclick', 'alert(1)'],
      ],
    }).replace(/"/g, '&quot;');
    expect(save(`<p data-ck="${record}">a</p>`)).toBe('<p style="color:red;">a</p>');

    const link = JSON.stringify({ a: [['href', ' javascript:alert(1)']] }).replace(/"/g, '&quot;');
    expect(save(`<p><a href="https://x.test" data-ck="${link}">a</a></p>`)).not.toContain('javascript');
  });

  it('does not restore handlers of a pasted CKEditor dynamic field', () => {
    const pasted =
      '<span class="red-dynamic-field inline-field redr-handlebar-field" id="red-dynamic-field__ref" onmouseover="alert(1)">{{ref}}</span>';
    const editor = new Editor({ extensions, content: '<p>Hi !</p>' });
    editor.commands.insertContentAt(4, pasted);
    expect(toCkHtml(editor.getHTML(), { wrapperClass: false })).not.toContain('onmouseover');
    editor.destroy();
  });

  it('ignores a malformed record instead of failing the save', () => {
    for (const bad of ['{"a":1}', '{"a":[["x"]]}', '{"c":[1]}', 'null', '[]']) {
      expect(() => save(`<p data-ck="${bad.replace(/"/g, '&quot;')}">a</p>`)).not.toThrow();
    }
  });
});

describe('without a global DOMParser (e.g. on a backend)', () => {
  const globalParser = globalThis.DOMParser;
  const domParser = new DOMParser();
  // Remove the global for these tests only; the elements the parser creates still work.
  beforeEach(() => delete (globalThis as { DOMParser?: unknown }).DOMParser);
  afterEach(() => (globalThis.DOMParser = globalParser));

  it('explains how to run without a DOM', () => {
    expect(() => toCkHtml('<p>a</p>')).toThrow(/pass `domParser`/);
  });

  it('loads and saves CKEditor HTML with a given parser', () => {
    const { html, wrapperClass, unsupported } = fromCkHtml(BP1, { domParser });
    expect(unsupported).toEqual([]);
    expect(toCkHtml(html, { wrapperClass: wrapperClass ?? false, domParser })).toBe(BP1);
  });
});

describe('createCkDomParser', () => {
  it('uses the browser DOMParser when there is one', async () => {
    expect(await createCkDomParser()).toBeInstanceOf(DOMParser);
  });
});
