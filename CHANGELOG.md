## 0.1.5 (2026-07-29)

### 🚀 Features

- **angular:** expose token defaults via a styles/tokens sass subpath ([4181c71](https://github.com/phuong-tran-redoc/document-engine/commit/4181c71))

### 🩹 Fixes

- **angular:** render floating panels without the host tailwind theme ([7ef2474](https://github.com/phuong-tran-redoc/document-engine/commit/7ef2474))
- **angular:** anchor floating panels to their trigger on a scrolled page ([a22e87d](https://github.com/phuong-tran-redoc/document-engine/commit/a22e87d))
- **angular:** let the editing surface fill a fixed-height container ([31e8c03](https://github.com/phuong-tran-redoc/document-engine/commit/31e8c03))
- **angular:** mark the checkbox view dirty on programmatic writes ([a46400b](https://github.com/phuong-tran-redoc/document-engine/commit/a46400b))

## 0.1.4 (2026-07-23)

### 🩹 Fixes

- **angular:** derive toolbar heading options from config levels ([18dd63b](https://github.com/phuong-tran-redoc/document-engine/commit/18dd63b))

## 0.1.3 (2026-07-20)

### 🚀 Features

- **angular:** light up active toolbar toggle buttons ([ce77d90](https://github.com/phuong-tran-redoc/document-engine/commit/ce77d90))
- **de-015:** opt-in editor content + interaction themes ([e81c4cd](https://github.com/phuong-tran-redoc/document-engine/commit/e81c4cd))

## 0.1.2 (2026-07-01)

### 🩹 Fixes

- **core:** bundle to single Node-ESM entry + add exports map ([1add35b](https://github.com/phuong-tran-redoc/document-engine/commit/1add35b))

## 0.1.1 (2026-06-23)

### 🩹 Fixes

- **angular:** make DocumentEditorComponent standalone
- **ci:** bump publish workflow to Node 22 for pnpm 11.x
- **ci:** publish via npm for OIDC trusted publishing, not nx/pnpm
- **de-011:** gh repo context + carve spine build tools to manual
- **e2e:** drop redundant await on page.locator for playwright-plugin v2

### ❤️ Thank You

- Phuong Tran

# Changelog

All notable changes to the `@phuong-tran-redoc/document-engine-*` packages are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); both packages
version and release in lock-step.

## 0.1.0 (2026-06-12)

First public release of `@phuong-tran-redoc/document-engine-core` and
`@phuong-tran-redoc/document-engine-angular` — a framework-agnostic Tiptap/ProseMirror
document editor plus its Angular wrapper, published in lock-step.

### Added

- **core:** Tiptap extensions — RestrictedEditing, Indent, OrderedList, TextCase, ResetFormat,
  ResetOnEnter, ClearContent, TableStyle (with percentage-based column resizing).
- **core:** custom nodes — DynamicField (`{{field}}`), Heading, PageBreak, and a URL-free ImageRef node.
- **core:** headless `generateHTML` + `defaultExtensions` kit (ESM, Node-safe).
- **core:** `EditorDocument` schema versioning with a `migrateDoc` migration runner.
- **angular:** editor component/directive + ControlValueAccessor over core, toolbar state, bubble
  menu, and an async `image.onPick` media-picker hook; ImageRef wired into the editor kit.
- **angular:** Angular `>=16` peer floor enforced via a build-time guard.

### Changed

- English-ized the remaining Vietnamese comments in the core table and restricted-editing extensions.

### Notes

- Pre-1.0: `0.MINOR` carries breaking changes and notable features; the public API stabilizes at `1.0.0`.
- Published via OIDC Trusted Publishing with Sigstore provenance (`--provenance`).
