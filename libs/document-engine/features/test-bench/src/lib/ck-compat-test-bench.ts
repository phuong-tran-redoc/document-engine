import { Component } from '@angular/core';
import { fromCkHtml, toCkHtml, verifyCkRoundTrip } from '@phuong-tran-redoc/document-engine-core';
import { DocumentEditorModule, DocumentEngineConfig, Editor } from '@phuong-tran-redoc/document-engine-angular';

/** What the e2e spec drives through `window.__CK_BENCH__`. */
export interface CkCompatBench {
  /** Load stored CKEditor HTML the way a consumer would. */
  load(html: string): { unsupported: string[] };
  /** Save the editor content back to CKEditor HTML. */
  save(): string;
  verify: typeof verifyCkRoundTrip;
  editor: Editor;
}

/**
 * CKEditor compatibility in a real browser. The unit tests run the round-trip under jsdom; this
 * page runs it with Chrome's own HTML parser and CSS normalization, through the Angular kit
 * (which also registers TrailingNode, as consumers get it).
 */
@Component({
  selector: 'document-engine-ck-compat-test-bench',
  template: `
    <document-engine-editor #docEditor [config]="editorConfig" (editorReady)="onEditorReady($event)">
      <tiptap-editor [editor]="docEditor.editor"></tiptap-editor>
    </document-engine-editor>
  `,
  imports: [DocumentEditorModule],
})
export class CkCompatTestBenchComponent {
  // The configuration of the first consumer migrating from CKEditor.
  editorConfig: Partial<DocumentEngineConfig> = {
    ckCompat: true,
    undoRedo: true,
    fontSize: true,
    textStyleKit: true,
    pageBreak: true,
    resetFormat: true,
    bold: true,
    italic: true,
    underline: true,
    strike: true,
    subscript: true,
    superscript: true,
    textAlign: true,
    indent: true,
    list: true,
    tables: true,
    heading: true,
    blockquote: true,
    dynamicField: true,
  };

  private wrapperClass: string | false = false;

  onEditorReady(editor: Editor): void {
    const bench: CkCompatBench = {
      load: (html) => {
        const loaded = fromCkHtml(html);
        this.wrapperClass = loaded.wrapperClass ?? false;
        editor.commands.setContent(loaded.html, { emitUpdate: false });
        return { unsupported: loaded.unsupported };
      },
      save: () => toCkHtml(editor.getHTML(), { wrapperClass: this.wrapperClass }),
      verify: verifyCkRoundTrip,
      editor,
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__CK_BENCH__ = bench;
  }
}
