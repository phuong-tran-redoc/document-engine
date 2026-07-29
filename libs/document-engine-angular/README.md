# document-engine-angular

[![npm angular](https://img.shields.io/npm/v/@phuong-tran-redoc/document-engine-angular?label=@phuong-tran-redoc/document-engine-angular&color=red)](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-angular) ![License](https://img.shields.io/npm/l/@phuong-tran-redoc/document-engine-core)

Angular wrapper for [`@phuong-tran-redoc/document-engine-core`](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core). Provides the `<document-engine-editor>` component, a `ControlValueAccessor` directive for Angular Forms, a configurable toolbar/footer, and supporting UI primitives.

---

## 🎯 Overview

`document-engine-angular` makes the framework-agnostic core usable in Angular apps. You drive features with a single `config` object, project a `tiptap-editor` directive for two-way binding, and get a toolbar, footer, and character count out of the box.

### Key Features

- **Editor component:** `<document-engine-editor [config]="…">` with content projection.
- **Angular Forms:** the inner `tiptap-editor` directive implements `ControlValueAccessor` — works with `ngModel` and `formControl` (HTML or JSON output).
- **Config-driven features:** toggle bold/italic/underline, lists, headings, tables, indent, text-case, dynamic fields, restricted editing, … via `DocumentEngineConfig`.
- **UI building blocks:** toolbar, footer, character count, color picker, select, icon, buttons — all themeable.
- **SCSS design system:** import one stylesheet entry to get the editor styling.

---

## 📦 Installation

```bash
npm install @phuong-tran-redoc/document-engine-angular
# or
pnpm add @phuong-tran-redoc/document-engine-angular
```

Published publicly on npm under the MIT license. The core package is installed automatically as a dependency.

### Peer Dependencies

```json
{
  "@angular/core": ">=16.0.0 <22.0.0",
  "@angular/common": ">=16.0.0 <22.0.0",
  "@angular/forms": ">=16.0.0 <22.0.0",
  "@angular/platform-browser": ">=16.0.0 <22.0.0",
  "rxjs": "^7.5.0"
}
```

> Supports Angular **16 → 21**. Built against `@tiptap/* ^3.26.0` (pulled in via the core dependency).

### Importing Styles

Add the SCSS entry to your global styles (or `angular.json` styles array):

```scss
// styles.scss
@use '@phuong-tran-redoc/document-engine-angular/styles';
```

That one import is the whole baseline — it ships the editor chrome **and** a default value for every
design token the library reads, so it looks right with no theming at all. **Tailwind CSS is not
required**; the library does not depend on your Tailwind config.

---

## 🚀 Quick Start

The editor uses **content projection**: `<document-engine-editor>` owns the config + toolbar/footer and exposes the live `editor` instance; you project a `tiptap-editor` directive that binds the editor and provides Forms support.

### Basic usage (`ngModel`)

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  DocumentEditorModule,
  DocumentEngineConfig,
  Editor,
} from '@phuong-tran-redoc/document-engine-angular';

@Component({
  selector: 'app-my-editor',
  imports: [FormsModule, DocumentEditorModule],
  template: `
    <document-engine-editor #docEditor [config]="config" (editorReady)="onEditorReady($event)">
      <tiptap-editor [editor]="docEditor.editor" [(ngModel)]="value"></tiptap-editor>
    </document-engine-editor>
  `,
})
export class MyEditorComponent {
  value = '<p>Hello World!</p>';

  config: Partial<DocumentEngineConfig> = {
    bold: true,
    italic: true,
    underline: true,
    list: true,
    heading: true,
    textAlign: true,
    showFooter: true,
    characterCount: true,
  };

  onEditorReady(editor: Editor) {
    // `editor` is the Tiptap instance — read/write content via its API
    console.log('HTML:', editor.getHTML());
    console.log('JSON:', editor.getJSON());
  }
}
```

> `DocumentEditorComponent` is **not** a standalone component — import `DocumentEditorModule` (which also exports `TiptapEditorDirective`).

### Reactive Forms (`formControl`)

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocumentEditorModule, DocumentEngineConfig } from '@phuong-tran-redoc/document-engine-angular';

@Component({
  selector: 'app-reactive-editor',
  imports: [ReactiveFormsModule, DocumentEditorModule],
  template: `
    <document-engine-editor #docEditor [config]="config">
      <tiptap-editor [editor]="docEditor.editor" [formControl]="control" outputFormat="json"></tiptap-editor>
    </document-engine-editor>
  `,
})
export class ReactiveEditorComponent {
  control = new FormControl('<p>Content</p>');
  config: Partial<DocumentEngineConfig> = { bold: true, italic: true, list: true };
}
```

`outputFormat` accepts `'html'` (default) or `'json'`.

---

## 🧩 Public API

### `DocumentEditorComponent`

The wrapper that hosts config, toolbar, and footer.

- **Selector:** `document-engine-editor`
- **Input:** `config?: Partial<DocumentEngineConfig>`
- **Output:** `editorReady: EventEmitter<Editor>` — fires once the Tiptap editor is constructed
- **Exposed property:** `editor: Editor` (project into `tiptap-editor` and read content via the Tiptap API: `getHTML()`, `getJSON()`, `getText()`)

### `TiptapEditorDirective`

The Forms-aware directive you project inside the wrapper.

- **Selector:** `tiptap[editor]`, `[tiptap][editor]`, `tiptap-editor[editor]`, `[tiptapEditor][editor]`
- **Inputs:** `editor: Editor`, `outputFormat: 'json' | 'html'` (default `'html'`)
- Implements `ControlValueAccessor` → `ngModel` / `formControl` support.

### `DocumentEditorModule`

Declares `DocumentEditorComponent`; exports `DocumentEditorComponent` + `TiptapEditorDirective` (imports the toolbar/footer internally).

### UI components & directives (standalone)

`ToolbarComponent` (`document-engine-toolbar`), `FooterComponent` (`document-engine-footer`), `CharacterCountComponent` (`document-engine-character-count`), `ColorPickerComponent` (`document-engine-color-picker`), `SelectComponent` (`document-engine-select`), `IconComponent` (`document-engine-icon`), `ToggleGroupComponent`, `CheckboxComponent`, plus directives `ButtonDirective` (`button[documentEngineButton]`), `InputDirective`, `TiptapFloatingMenuDirective`, `TiptapDraggableDirective`, `PopoverDirective`.

### Services & tokens

- `FocusTrapService`, `EventManager` (both `providedIn: 'root'`).
- DI tokens: `EDITOR_CONTENT_WRAPPER_CLASS`, `EDITOR_HTML_PREPROCESSOR`.

### `DocumentEngineConfig`

The feature-toggle object passed to `[config]`. Each key is a boolean or an options object — e.g. `undoRedo`, `bold`, `italic`, `underline`, `strike`, `subscript`, `superscript`, `code`, `codeBlock`, `blockquote`, `link`, `heading`, `fontSize`, `lineHeight`, `textCase`, `textAlign`, `indent`, `list`, `textStyleKit`, `resetFormat`, `image`, `showFooter`, `characterCount`, and more.

> The package entry `index.ts` is the public contract — additive changes only between minor versions.

### Deprecations

| Deprecated | Use instead | Removed in |
| --- | --- | --- |
| `[popover]` selector/input on `PopoverDirective` | `[documentEnginePopover]` | next major |

`[popover]` still works, so no consumer breaks on upgrade. It is being retired because it collides with
the platform's native [`popover`](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/popover)
HTML attribute — an element carrying both gets the browser's top-layer behaviour *and* ours.

```html
<!-- before -->
<div [popover]="triggerRef">…</div>
<!-- after -->
<div [documentEnginePopover]="triggerRef">…</div>
```

---

## 🎨 Styling & theming

Import the SCSS entry (see [Importing Styles](#importing-styles)), then theme by **redeclaring CSS
custom properties** — never by overriding rule bodies.

**[`docs/THEMING.md`](https://github.com/phuong-tran-redoc/document-engine/blob/main/docs/THEMING.md) is
the contract.** It lists every token the library reads
(colour, elevation, sizing), its default, and what it paints. Highlights:

- The barrel's defaults are emitted on `:where(:root)`, which has **zero specificity** — anything you
  declare (`:root`, `.dark`, `[data-theme]`, an inline style) wins regardless of source order. No
  `!important`, no matching a selector shape.
- Dark mode is purely a matter of redeclaring the tokens on your dark selector; nothing in the library
  hardcodes a colour.
- `--de-editor-min-height` (default `12rem`) sets the editing surface's floor; alternatively give the
  `document-engine-editor` element a real height and the surface fills it.
- Prose and editing-affordance styles are **opt-in** subpaths (`styles/editor-content`,
  `styles/editor-interaction`), so the baseline can never impose a look on your documents.

---

## 🔧 Development

```bash
nx build @phuong-tran-redoc/document-engine-angular   # build the library
nx test @phuong-tran-redoc/document-engine-angular    # unit tests
nx lint @phuong-tran-redoc/document-engine-angular    # lint
```

---

## 🔗 Related

- **Core library:** [`@phuong-tran-redoc/document-engine-core`](../document-engine-core/README.md)
- 📦 [npm package](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-angular)
- 📝 [Changelog](../../CHANGELOG.md)
- 🐙 [Repository](https://github.com/phuong-tran-redoc/document-engine)
- ▶️ [Demo app](https://github.com/phuong-tran-redoc/document-engine) — clone the repo and run `pnpm start` (http://localhost:4200)

---

## 🤝 Compatibility

| Angular | Package |
| --- | --- |
| 16.x – 21.x | 0.x |

---

## 👤 Author

Developed by **Duc Phuong (Jack)**

- 💼 [LinkedIn](https://www.linkedin.com/in/tdp1999/)
- 🐙 [GitHub](https://github.com/tdp1999)
- 📧 [Email](mailto:tdp99.business@gmail.com)

---

## 📄 License

**MIT License** — see [LICENSE.md](./LICENSE.md).
