# document-engine-angular

Angular wrapper for [`@phuong-tran-redoc/document-engine-core`](../document-engine-core). This library provides Angular components, directives, and services to integrate the Document Engine into Angular applications.

---

## 🎯 Overview

`document-engine-angular` is a comprehensive Angular wrapper that makes it easy to use the Document Engine in Angular applications. It provides pre-built components, reactive state management, and Angular-specific utilities.

### Key Features

- **Angular Components:** Ready-to-use `<document-editor>` component
- **Reactive API:** RxJS-based state management
- **Template-Driven:** Angular template syntax support
- **Form Integration:** Works with Angular Forms (ngModel, Reactive Forms)
- **Accessibility:** ARIA-compliant components
- **Standalone Components:** Works with standalone Angular components
- **Type Safety:** Full TypeScript support

---

## 📦 Installation

> ⚠️ **This is a private package. Please contact an authorized person to install it.**

```bash
npm install @phuong-tran-redoc/document-engine-angular
# or
pnpm add @phuong-tran-redoc/document-engine-angular
```

### Peer Dependencies

```json
{
  "@angular/core": "^17.0.0 || ^18.0.0",
  "@angular/common": "^17.0.0 || ^18.0.0",
  "@phuong-tran-redoc/document-engine-core": "^1.0.0"
}
```

### Importing Styles

Add to your `angular.json` or import in your global styles:

```scss
// styles.scss
@import '@phuong-tran-redoc/document-engine-angular/styles';
```

---

## 🚀 Quick Start

### Basic Usage

#### Standalone Component

```typescript
import { Component } from '@angular/core';
import { DocumentEditorComponent } from '@phuong-tran-redoc/document-engine-angular';

@Component({
  selector: 'app-my-editor',
  standalone: true,
  imports: [DocumentEditorComponent],
  template: ` <document-editor [content]="content" (contentChange)="onContentChange($event)" /> `,
})
export class MyEditorComponent {
  content = '<p>Hello World!</p>';

  onContentChange(newContent: string) {
    console.log('Content changed:', newContent);
  }
}
```

#### Module-Based

```typescript
import { NgModule } from '@angular/core';
import { DocumentEditorModule } from '@phuong-tran-redoc/document-engine-angular';

@NgModule({
  imports: [DocumentEditorModule],
  // ...
})
export class AppModule {}
```

### With Angular Forms

#### Template-Driven Forms

```typescript
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DocumentEditorComponent } from '@phuong-tran-redoc/document-engine-angular';

@Component({
  selector: 'app-form-editor',
  standalone: true,
  imports: [FormsModule, DocumentEditorComponent],
  template: `
    <document-editor [(ngModel)]="documentContent" />
    <pre>{{ documentContent }}</pre>
  `,
})
export class FormEditorComponent {
  documentContent = '<p>Edit me!</p>';
}
```

#### Reactive Forms

```typescript
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DocumentEditorComponent } from '@phuong-tran-redoc/document-engine-angular';

@Component({
  selector: 'app-reactive-editor',
  standalone: true,
  imports: [ReactiveFormsModule, DocumentEditorComponent],
  template: ` <document-editor [formControl]="editorControl" /> `,
})
export class ReactiveEditorComponent {
  editorControl = new FormControl('<p>Content</p>');
}
```

### Advanced Configuration

```typescript
import { Component } from '@angular/core';
import { DocumentEditorComponent, EditorConfig } from '@phuong-tran-redoc/document-engine-angular';

@Component({
  selector: 'app-advanced-editor',
  standalone: true,
  imports: [DocumentEditorComponent],
  template: `
    <document-editor
      [config]="editorConfig"
      [readonly]="isReadonly"
      [showToolbar]="true"
      (ready)="onEditorReady($event)"
    />
  `,
})
export class AdvancedEditorComponent {
  isReadonly = false;

  editorConfig: EditorConfig = {
    extensions: ['dynamic-fields', 'restricted-editing', 'tables'],
    placeholder: 'Start typing...',
    autoFocus: true,
  };

  onEditorReady(editor: Editor) {
    console.log('Editor is ready!', editor);
  }
}
```

---

## 🧩 Components

### DocumentEditorComponent

The main editor component.

**Inputs:**

- `content: string | JSONContent` - Initial content (HTML or JSON)
- `config: EditorConfig` - Editor configuration
- `readonly: boolean` - Read-only mode
- `showToolbar: boolean` - Show/hide toolbar
- `placeholder: string` - Placeholder text

**Outputs:**

- `contentChange: EventEmitter<string>` - Emits when content changes
- `ready: EventEmitter<Editor>` - Emits when editor is ready
- `focus: EventEmitter<void>` - Emits when editor gains focus
- `blur: EventEmitter<void>` - Emits when editor loses focus

**Methods:**

- `getContent(): string` - Get current content as HTML
- `getJSON(): JSONContent` - Get current content as JSON
- `setContent(content: string | JSONContent): void` - Set editor content
- `focus(): void` - Focus the editor

### DocumentEditorToolbarComponent

Customizable toolbar component.

```typescript
<document-editor-toolbar [editor]="editor" />
```

### DynamicFieldPickerComponent

UI for inserting dynamic fields.

```typescript
<dynamic-field-picker
  [fields]="availableFields"
  (fieldSelect)="onFieldSelect($event)"
/>
```

---

## 📚 Services

### DocumentEditorService

Service for managing editor instances.

```typescript
import { DocumentEditorService } from '@phuong-tran-redoc/document-engine-angular';

export class MyComponent {
  constructor(private editorService: DocumentEditorService) {}

  createEditor() {
    const editor = this.editorService.create({
      // configuration
    });
  }
}
```

### DynamicFieldService

Service for managing dynamic fields.

```typescript
import { DynamicFieldService } from '@phuong-tran-redoc/document-engine-angular';

export class MyComponent {
  constructor(private fieldService: DynamicFieldService) {}

  replaceFields() {
    this.fieldService.replaceFields({
      customer_name: 'John Doe',
      loan_amount: '50000',
    });
  }
}
```

---

## 🎨 Styling

### Custom Themes

```scss
// Override CSS variables
:root {
  --doc-editor-bg: #ffffff;
  --doc-editor-text: #000000;
  --doc-editor-border: #e0e0e0;
  --doc-editor-focus: #007bff;
}
```

### Custom CSS Classes

```html
<document-editor class="my-custom-editor" />
```

```scss
.my-custom-editor {
  // Your custom styles
}
```

---

## 🔧 Development

### Building

Build the library:

```bash
nx build document-engine-angular
```

### Testing

Run unit tests:

```bash
nx test document-engine-angular
```

### Linting

Lint the code:

```bash
nx lint document-engine-angular
```

---

## 📖 Documentation

- **[Live Demo](#)** - See the editor in action
- **[API Reference](#)** - Detailed API documentation
- **[Examples](#)** - Code examples and use cases
- **[Migration Guide](#)** - Migrating from other editors

---

## 🔗 Related Packages

- **Core Library:** [`@phuong-tran-redoc/document-engine-core`](../document-engine-core)
- **Demo Application:** [document-engine](../../apps/document-engine)

---

## 🤝 Compatibility

| Angular Version | Package Version |
| --------------- | --------------- |
| 17.x            | 1.x             |
| 18.x            | 1.x             |

---

## 👤 Author

Developed by **Duc Phuong (Jack)**

- 💼 [LinkedIn](https://www.linkedin.com/in/tdp1999/)
- 🐙 [GitHub](https://github.com/tdp1999)
- 📧 [Email](mailto:tdp99.business@gmail.com)

---

## 📄 License

**MIT License**

See [LICENSE.md](./LICENSE.md) for full license text.
