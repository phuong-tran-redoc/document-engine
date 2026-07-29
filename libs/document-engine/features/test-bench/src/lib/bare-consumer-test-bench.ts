import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorModule, DocumentEngineConfig, Editor } from '@phuong-tran-redoc/document-engine-angular';
import { TableOptions } from '@tiptap/extension-table';

/**
 * BARE-CONSUMER FIXTURE — the regression guard for DE-016.
 *
 * Every other route in this app is a *bad* place to catch a portability defect,
 * because the demo app shares the workspace's assumptions: its own
 * `tailwind.config.js` defines every theme key the library used to reach for, it
 * is light-mode, and it is a full-page shell that rarely scrolls the editor out
 * of the first viewport. Six real defects shipped in 0.1.4 precisely because all
 * six are invisible under those four conditions.
 *
 * This fixture removes them, deliberately, all at once:
 *
 *   1. **No consumer theme.** `.bare-consumer__reset` sets every custom property
 *      the library reads back to `initial`, so the library's own fallbacks and
 *      `_tokens.scss` defaults are what actually paint. (A route cannot un-define
 *      Tailwind utilities — the app has one global config — so the "no Tailwind
 *      theme extension" half of the condition is enforced structurally instead,
 *      by `pnpm gate:css` banning host-theme utilities from library templates.)
 *   2. **Dark background.** Catches hardcoded light hex: near-black text on a
 *      near-black panel, bright borders slashing across it.
 *   3. **Fixed-height container.** Catches the collapsed editing surface — an
 *      emptied editor used to leave a ~28px clickable line inside a ~480px box.
 *   4. **Scrolled well past the first viewport.** Catches floating-ui positioned
 *      with the wrong strategy: the panel lands the scroll offset away from its
 *      trigger, hundreds of pixels below the fold.
 *
 * Do not "tidy" the spacer, the dark background or the reset away. They are the
 * test.
 */
@Component({
  selector: 'document-engine-bare-consumer-test-bench',
  templateUrl: './bare-consumer-test-bench.html',
  styleUrls: ['./bare-consumer-test-bench.scss'],
  imports: [CommonModule, FormsModule, DocumentEditorModule],
})
export class BareConsumerTestBenchComponent implements OnInit, OnDestroy {
  editor?: Editor;

  /** Non-empty by default; the empty-editor case is driven by `?empty=1`. */
  value = '<p>Bare consumer fixture. Select this text to raise the bubble menu.</p>';

  /**
   * `?tokens=none` — the harsher variant: no token is defined at all, modelling a
   * consumer that imported no stylesheet, so only the library's inline
   * `var(--x, fallback)` values can paint.
   */
  noTokens = false;

  // Keys must match DocumentEngineConfig exactly — `tables`, not `table`. A wrong
  // key silently leaves the extension unregistered, so the panel it feeds never
  // opens and the assertion that depends on it never really ran.
  editorConfig: Partial<DocumentEngineConfig> = {
    bold: true,
    italic: true,
    underline: true,
    heading: true,
    list: true,
    link: true,
    tables: { table: { resizable: true, enableNodeView: true } as unknown as TableOptions },
    textStyleKit: true,
    undoRedo: true,
    showFooter: true,
    characterCount: true,
  };

  ngOnInit(): void {
    document.body.setAttribute('data-test-bench', 'bare-consumer');
    // The fixture owns the page background: the point is a DARK surface with no
    // token remapping, which no other route in this app provides.
    document.body.classList.add('bare-consumer-page');

    const params = new URLSearchParams(window.location.search);
    if (params.has('empty')) {
      this.value = '';
    }
    this.noTokens = params.get('tokens') === 'none';
  }

  ngOnDestroy(): void {
    document.body.removeAttribute('data-test-bench');
    document.body.classList.remove('bare-consumer-page');
  }

  onEditorReady(editor: Editor): void {
    this.editor = editor;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).__EDITOR__ = editor;
  }
}
