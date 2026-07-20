# bapbong — canvas-rendered DOCX editor engine (external study)

> Source: https://github.com/shadowgarden-app/bapbong (MIT, Nx/TypeScript/pnpm, created 2026-07-15).
> Studied 2026-07-15 via GitHub raw + API. This is **external reference research** — bapbong is
> adjacent prior art to our own document-engine, not a dependency.

## TL;DR — why it matters to us

Bapbong's thesis: DOM/`contenteditable` editors **fight the browser** for Word-grade fidelity and
true pagination, so it paints documents **directly to HTML Canvas 2D** (the Google Docs / OnlyOffice
route). ProseMirror is kept **only as a hidden input sink** (IME composition, undo/redo, selection
state) — it never renders. The whole system is a set of small, sharply-separated packages joined by
**data contracts**, which is the part most worth stealing.

## Pipeline & package map

```
.docx  ──▶  ProseMirror doc  ──▶  ResolvedLayout  ──▶  <canvas>
        docx (unzip+convert)   layout-engine        painter-canvas
                               (line-break +         (paint only —
                                pagination math)      no measurement)
```

Published as `@shadow-garden/bapbong-*`:

| Package | Job |
|---|---|
| `contracts` | Shared types + Command/Plugin/Collection contracts (the vocabulary) |
| `model` | ProseMirror schema + list-numbering logic |
| `docx` | OOXML import (`importDocx`) + export (round-trip) |
| `measuring` | Font-metrics caching + text measurement |
| `layout-engine` | Line-breaking + pagination → `ResolvedLayout` |
| `painter-canvas` | Canvas 2D renderer (consumes coordinates only) |
| `selection` | Caret positioning, selection math, hit-testing |
| `input-bridge` | Hidden ProseMirror wiring for IME/undo |
| `editor` | Public API facade (WIP) |
| `commands` | Concrete `Command` implementations |
| `view`, `ui`, `a11y` | View/UI split + accessibility |
| `headless` | Server-side (DOM-free) callers |
| `mcp` | MCP server (`host.ts` / `session.ts` / `index.ts`) |

## Contracts layer — the pattern to steal

Everything the toolbar, plugins, and headless callers agree on lives in **one** package
(`contracts`), while implementations live elsewhere. Result: shared vocabulary, **zero coupling to
the canvas**.

### Pipeline data shapes (`contracts.ts`)

- **`FlowParagraph`** (layout-ready input): `runs` (inline text/images), `marker` (list-item text),
  `align`, `indent` (left/right/firstLine/hanging), `spacing` (before/after/line + `lineRule`),
  `pageBreakBefore`, `floats` (anchored images), `pos`/`end` (ProseMirror positions for round-trip).
  `FlowBlock = FlowParagraph | FlowTable`.
- **`ResolvedLayout`** (paint-ready output): `pages: ResolvedPage[]` + full Word-style chrome:
  `pageHeader/Footer`, `...First`, `...Even`, and `chromeSelect` to pick which applies per page.
  Pages decompose into `LayoutLine` → `LayoutSegment`/`LayoutImageSegment`, `ResolvedTable`,
  `ResolvedFloat`, footnotes, `ResolvedChrome`.

### Command / Plugin / Collection triad

- **`Command`** — ProseMirror-style `run(state, dispatch?)`. Calling **without** `dispatch` is a
  **feasibility probe** (returns boolean, no side effects); **with** `dispatch` it executes. Optional
  `isActive(state)` / `isEnabled(state)` drive toggle + disabled UI (fallback: no-dispatch probe).
  Pure `EditorState`, no DOM → runs identically in browser and in `headless` on a server. Types in
  `contracts`, impls in `commands`, so the menubar reads a `Collection<Command>` without importing them.
- **`EditorPlugin`** — framework-agnostic extension; never imports the editor. Optional hooks:
  `name`, `schema` (marks/nodes merged once at load), `setup(ctx)` → teardown, `onChange`,
  `onCaretPick(pos)`, `decorations(ctx)` (returns `RangeDecoration[]`: background/underline/strike),
  `onPointer(ev)` / `onKey(ev)` — return `true` to **claim** the event before editor defaults.
  Talks to the engine only through `PluginContext` (dispatch, geometry queries, canvas-UI helpers,
  repaint requests).
- **`Collection<T, IdKey>`** — tiny insertion-ordered `Map`-backed registry keyed by a chosen
  property (`idProperty`, defaults to `id`; the editor keys plugins by `name`). `add` (throws if key
  missing), `get`/`remove` (accept key or item), iterable in insertion order. This is the plugin/
  command registry itself.

## Layout engine (`layout-engine.ts`, ~84 KB)

Exports `toFlowBlocks(doc, defaultFont?, allowFloats?)`, `layoutBlocks(blocks, config)`, and
`layout(doc, config, cache?, chrome?, footnotes?)`.

- **Line-breaking:** greedy left-to-right word-wrap using injected `MeasureText`. A word wider than
  the whole band is split via **binary-search-style character breaking**, remainder re-queued.
  Consecutive same-font tokens are measured as **kerning clusters** (cumulatively) so mark boundaries
  don't introduce width gaps. Soft-wrapped continuation lines suppress leading spaces.
- **Tabs:** resolved at layout time against `TabStop[]` — right/center/decimal lookahead groups,
  leader fills (dots/hyphens), default grid past the last stop.
- **Pagination:** height-based per-column placement — each draft line/table checks
  `y + height > colBottom()` (accounting for committed footnotes); overflow → next column or finalize
  page. `pageBreakBefore` forces finalize first. Continuous section breaks resume below prior content;
  new-page sections finalize immediately. **No explicit widow/orphan logic** (line-by-line placement
  only).
- **Multi-column:** when a section fits, `balanceTarget = remaining / colCount` distributes evenly
  instead of packing column 0.
- **Tables:** column widths from cell metadata or equal split (scaled down if over-wide); row-boundary
  splitting preferred, else **mid-row character-level split** (Word-like); contiguous `header` rows
  repeat atop continuation fragments; `cantSplit` rows move whole to a fresh column/page. `eachCell()`
  tracks rowspan occupancy.
- **Floats:** anchor to paragraphs, carve rectangular exclusions via `bandAt(y, h)` (returns usable
  left/right, `null` below `MIN_BAND = 24px`). `wrap: square|topAndBottom|none`; `hRel`/`vRel` control
  positioning. Paragraphs-with-floats wrap at page-placement time (band depends on float y), so they're
  not cached.
- **Chrome/footnotes:** three chrome variants laid out once, tallest sets band height,
  `CHROME_DISTANCE = 48px` from edge, PM positions stripped so chrome isn't selectable. Footnote bodies
  measured pre-layout; per-page placer reserves bottom space (`FOOTNOTE_AREA_GAP = 12px`).
- **`LayoutCache`:** keyed by **ProseMirror node identity** (identity-equal across edits). Caches
  paragraph wrap if pos/bounds/marker unchanged; caches table layout if bounds unchanged (never for
  tables containing list paragraphs — live numbering advances). On move, positions are **delta-shifted**;
  geometry stays identical.

## Canvas painter (`painter-canvas.ts`, ~28 KB)

`class CanvasPainter { constructor(container, deps); paint(layout, options); paintOverlay(overlay) }`.

- **One `<canvas>` per page**, absolutely positioned — sidesteps the browser's ~65,535px canvas
  dimension limit and bounds memory.
- **HiDPI:** `dpr = options.devicePixelRatio ?? min(devicePixelRatio, 2)` (capped at 2); canvas sized
  `width * zoom * dpr`; ctx transformed `setTransform(zoom*dpr, 0, 0, zoom*dpr, 0, 0)`.
- **Draw order (layers):** page background/border → floats (behind) → selection highlights →
  background decorations → text lines → underline/strike → carets (top).
- **Text:** `ctx.font` from `FontSpec` shorthand, `fillText` per `LayoutSegment`, super/subscript via
  baseline offset, underline/strike as measured rects — **no re-measurement** (layout pre-computed all
  coordinates).
- **Performance:** viewport culling (mount only pages intersecting viewport + 200px, unmount others),
  canvas **pool** of up to 8 reused on scroll, image cache (`Map<string, HTMLImageElement>`, async load
  triggers targeted repaint), and `paintOverlay` **fast-path** that redraws only affected pages for
  caret blink / drag selection. Full-canvas clear per page (no dirty-rect within a page).

## DOCX import (`docx.ts`, ~64 KB) + export

`importDocx(input, opts?)` → `Promise<DocxImport>` (input: ArrayBuffer/Uint8Array/Blob).

- **Unzip (jszip)** and read `word/document.xml`, `styles.xml`, `numbering.xml`,
  `_rels/document.xml.rels`, `theme/theme1.xml`, `footnotes.xml`/`endnotes.xml`, `comments*.xml`,
  `settings.xml`, `media/`, and header/footer parts (via rels).
- **Style/theme:** `StyleRegistry` builds a run-property cascade from docDefaults + named styles
  (inheritance via `w:basedOn`); `ThemeResolver` maps `schemeClr` → RGB.
- **OOXML → ProseMirror:** paragraphs (`w:jc`/`w:ind`/`w:spacing`/tabs, heading from styleId or
  `w:outlineLvl`, `w:numPr` list membership, page breaks, PAGE/NUMPAGES fields); runs → marks
  (strong/em/underline/strike/color/size/family/highlight/vertAlign, `w:sym` PUA→Unicode, `w:br`);
  tracked changes **accept-all** (`w:ins` unwrapped, `w:del` dropped); `unwrapSdt` strips content-control
  chrome; images (DrawingML inline/anchor, VML `v:imagedata`, `wpg` groups flattened, `wps` shapes →
  image nodes w/ textbox content, data-URL media); lists (`parseList` numId+level, markers resolved at
  layout); tables (logical grid, colspan, `w:vMerge` → rowspan, shading/borders/cell margins);
  hyperlinks; OMML math flattened to text; comments + threaded replies (`commentsExtended` parentId);
  footnotes → page-bottom map, endnotes → appended section; headers/footers keyed by `w:type`
  (default/first/even, gated by `w:titlePg`/`w:evenAndOddHeaders`); page geometry `w:pgSz`/`w:pgMar`
  (defaults A4 794×1123px, 96px margins); columns `w:cols`, section type continuous vs new-page.
- **Units:** `twipsToPx(n) = round(n/15)`, `emuToPx(n) = round(n/9525)` @96dpi.
- **Round-trip:** raw JSZip package preserved; unmodeled XML survives on `rawDocumentXml`.
- **v1 out of scope:** deep theme-style inheritance, complex/nested shapes & connectors,
  character-level para styles, OLE embeds, full textbox theming.

## Transferable ideas for document-engine

1. **Contract/impl split** — put pipeline data shapes + Command/Plugin contracts in one dependency-free
   package; keep canvas/DOM/impl out of it. Enables headless (server) reuse and decoupled toolbars.
2. **Feasibility-probe command model** — `run(state, dispatch?)` where no-dispatch = "can this run?"
   collapses enable/execute into one function and drives disabled/toggle UI for free.
3. **Node-identity layout cache with delta-shifting** — cache by PM node identity, re-shift positions on
   move instead of recomputing geometry; skip caching anything with live-advancing state (list numbering).
4. **Per-page canvas + pool + viewport culling** — the scalable way to render long paginated docs on
   canvas without hitting size limits or unbounded memory; `paintOverlay` fast-path keeps caret/selection
   cheap.
5. **ProseMirror as input-only** — reuse its schema/undo/IME strength while owning layout + paint, rather
   than letting `contenteditable` dictate rendering.
