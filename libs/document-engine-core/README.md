# document-engine-core

[![npm core](https://img.shields.io/npm/v/@phuong-tran-redoc/document-engine-core?label=@phuong-tran-redoc/document-engine-core&color=red)](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core) ![License](https://img.shields.io/npm/l/@phuong-tran-redoc/document-engine-core)

A **framework-agnostic** document editor core built on [Tiptap](https://tiptap.dev/) and [ProseMirror](https://prosemirror.net/). It packages the custom extensions, nodes, schema kit, and headless helpers that power the Document Engine, with no framework dependency.

---

## 🎯 Overview

`document-engine-core` is the heart of the Document Engine. It contains the editor schema (the canonical extension/node set), business extensions (dynamic fields, restricted editing, styled tables, indentation, text case), a headless HTML serializer, and a small document-migration system — all as plain ESM TypeScript that runs in the browser or in Node.

### Key Features

- **Framework-agnostic ESM:** pure TypeScript, usable from Angular, React, Vue, or headless Node.
- **Ready-made schema kit:** `defaultExtensions` — the canonical node/mark/structure set the editor ships with.
- **Business extensions:** Dynamic Fields (`{{customer_name}}`), Restricted Editing (editable regions), Styled Tables, Indent, Text Case, custom Ordered List.
- **Headless serialization:** `generateHTML(doc)` renders a ProseMirror JSON document to HTML on the server (env-aware) or in the browser.
- **Document migrations:** `EditorDocument` wrapper + `migrateDoc()` to version and upgrade stored content.
- **JSON-first data model:** documents are ProseMirror JSON, not raw HTML.

---

## 📦 Installation

```bash
npm install @phuong-tran-redoc/document-engine-core
# or
pnpm add @phuong-tran-redoc/document-engine-core
```

Published publicly on npm under the MIT license.

### Peer Dependencies

Only one peer dependency — Tiptap/ProseMirror ship as bundled dependencies and are installed automatically:

```json
{
  "lodash-es": "^4.17.10"
}
```

> Built against `@tiptap/* ^3.26.0` (bundled). If your app also uses Tiptap directly, align on the same major to share a single ProseMirror instance.

---

## 🚀 Quick Start

### Build an editor with the default schema

```typescript
import { Editor } from '@tiptap/core';
import { defaultExtensions } from '@phuong-tran-redoc/document-engine-core';

const editor = new Editor({
  element: document.querySelector('#editor')!,
  extensions: [...defaultExtensions],
  content: '<p>Hello World!</p>',
});
```

### Dynamic fields

```typescript
// Insert a {{customer_name}} placeholder
editor.commands.insertDynamicField({ fieldId: 'customer_name', label: 'Customer Name' });
// Renders: <span data-field-id="customer_name" data-label="Customer Name" class="dynamic-field">{{customer_name}}</span>
```

### Restricted editing (editable regions)

```typescript
// Wrap the current selection in an editable region
editor.commands.wrapSelectionInEditableRegion();
editor.commands.toggleEditableRegion();
editor.commands.removeEditableRegion();
```

### Other custom commands

```typescript
editor.commands.insertPageBreak();                      // PageBreak node
editor.commands.insertImageRef({ imageId: 'logo-01' }); // URL-free image reference
editor.commands.textCase('uppercase');                  // TextCase: 'uppercase' | 'lowercase' | 'capitalize'
editor.commands.increaseIndent();                       // Indent
editor.commands.setListStyle('lower-alpha');            // CustomOrderedList
```

### Headless HTML (server-side)

```typescript
import { generateHTML, defaultExtensions } from '@phuong-tran-redoc/document-engine-core';

// generateHTML(doc: JSONContent, extensions = defaultExtensions): Promise<string>
const html = await generateHTML(myProseMirrorJSON);
```

### Versioned documents + migrations

```typescript
import { migrateDoc, LATEST_SCHEMA_VERSION, type EditorDocument } from '@phuong-tran-redoc/document-engine-core';

const stored: EditorDocument = { schemaVersion: 0, content: myProseMirrorJSON };
const upgraded = migrateDoc(stored); // walks registered migrations up to LATEST_SCHEMA_VERSION
```

---

## 📦 Public API

Everything below is re-exported from the package entry (`@phuong-tran-redoc/document-engine-core`).

### Extensions (`extensions`)

| Export | Notable commands |
| --- | --- |
| `ClearContent` | `clear()` |
| `Indent` | `increaseIndent()`, `decreaseIndent()` |
| `CustomOrderedList` | `toggleOrderedList()`, `setListStyle(type)` |
| `ResetFormat` | `resetFormat()` |
| `ResetOnEnter` | — (Enter-key behavior) |
| `RestrictedEditing` (+ `EditableRegion`) | `wrapSelectionInEditableRegion()`, `toggleEditableRegion()`, `removeEditableRegion()` |
| `StyledTable` / `StyledTableKit` (+ `StyledTableCell`, `StyledTableHeader`) | `insertTable()`, `setTableBorder()`, `setTableBackgroundColor()`, `setCellBackgroundColor()`, `setCellTextAlign()`, … |
| `TextCase` | `textCase(type)` |

### Nodes (`nodes`)

| Export | Renders |
| --- | --- |
| `DynamicField` | inline `<span data-field-id …>{{fieldId}}</span>` — `insertDynamicField({ fieldId, label })` |
| `PageBreak` | `<div data-page-break="true" …>` — `insertPageBreak()` |
| `ImageRef` | `<figure data-block="image-ref" data-image-id …>` (+ optional `<figcaption>`) — `insertImageRef({ imageId, caption?, captionPosition? })` |
| `NotumHeading` | extends Tiptap `Heading` — `removeHeading()` |

### Kit (`kit`)

- `defaultExtensions: Extensions` — the canonical schema (nodes, marks, structures).
- `generateHTML(doc, extensions?): Promise<string>` — async, environment-aware headless serializer.

### Migrations (`migrations`)

- `EditorDocument` — `{ schemaVersion: number; content: JSONContent }`.
- `LATEST_SCHEMA_VERSION` — current schema version.
- `docMigrations` — the migration registry.
- `migrateDoc(doc, migrations?, latest?)` — pure upgrade walker.

### Models, types, utils, views

- **models:** `Color` (`Color.from()`, `.equals()`, `.is()`).
- **types:** `ListStyleType`, `TextCaseType`, `ImageRefAttributes`, `DynamicFieldAttributes`, `DynamicFieldItem`, `DynamicFieldCategory`, …
- **utils:** `normalizeColor` (color), `getClosestDomElement` (dom), `getCursorCellInfo` / `getSelectedCells` (table), `getSelectedText` / `getActiveMarkRange` (text).
- **views:** `HandleNodeView`, `TableNodeView`, `PageBreakNodeView`, `createTableNodeView`, `createPageBreakNodeView`.
- **constants:** `INDENT_DEFAULT`.

> The package entry `index.ts` is the public contract — additive changes only between minor versions.

---

## 🏗️ Source Layout

```
document-engine-core/src/
├── constants/    # exported constants (e.g. INDENT_DEFAULT)
├── extensions/   # custom Tiptap extensions
├── kit/          # defaultExtensions + generateHTML
├── migrations/   # EditorDocument + migrateDoc
├── models/       # Color, …
├── nodes/        # DynamicField, PageBreak, ImageRef, NotumHeading
├── types/        # shared TypeScript types
├── utils/        # color / dom / table / text helpers
└── views/        # ProseMirror node views
```

---

## 🔧 Development

```bash
nx build @phuong-tran-redoc/document-engine-core   # build the library
nx test @phuong-tran-redoc/document-engine-core    # unit tests
nx lint @phuong-tran-redoc/document-engine-core    # lint
```

---

## 🎨 Framework Wrappers

- **Angular:** [`@phuong-tran-redoc/document-engine-angular`](../document-engine-angular/README.md)

---

## 📖 Resources

- 📦 [npm package](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core)
- 📝 [Changelog](../../CHANGELOG.md)
- 🐙 [Repository](https://github.com/phuong-tran-redoc/document-engine)
- ▶️ [Demo app](https://github.com/phuong-tran-redoc/document-engine) — clone the repo and run `pnpm start` (http://localhost:4200)
- [Tiptap Documentation](https://tiptap.dev)
- [ProseMirror Documentation](https://prosemirror.net)

---

## 👤 Author

Developed by **Duc Phuong (Jack)**

- 💼 [LinkedIn](https://www.linkedin.com/in/tdp1999/)
- 🐙 [GitHub](https://github.com/tdp1999)
- 📧 [Email](mailto:tdp99.business@gmail.com)

---

## 📄 License

**MIT License** — see [LICENSE.md](./LICENSE.md).
