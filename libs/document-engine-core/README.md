# document-engine-core

[![npm core](https://img.shields.io/npm/v/@phuong-tran-redoc/document-engine-core?label=@phuong-tran-redoc/document-engine-core&color=red)](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core) ![License](https://img.shields.io/npm/l/@phuong-tran-redoc/document-engine-core)

A **framework-agnostic** document editor core library built on top of [Tiptap](https://tiptap.dev/) and [ProseMirror](https://prosemirror.net/). This library provides the foundation for building rich-text editors with custom business logic and extensions.

---

## 🎯 Overview

`document-engine-core` is the heart of the Document Engine system. It contains all the business logic, custom extensions, and editor functionality in a framework-agnostic manner, making it reusable across different frameworks (Angular, React, Vue, etc.).

### Key Features

- **Framework-Agnostic:** Pure TypeScript implementation, no framework dependencies
- **Business-Focused Extensions:**
  - **Dynamic Fields:** Support for placeholder fields like `{{customer_name}}`
  - **Restricted Editing:** Control which parts of documents can be edited
  - **Custom Nodes:** Business-specific document nodes and marks
- **Built on Proven Technology:** Leverages Tiptap and ProseMirror for robust editing
- **JSON-based Data Model:** Documents are represented as structured JSON, not raw HTML
- **TypeScript-First:** Full type safety and IntelliSense support
- **Extensible Architecture:** Easy to add custom extensions and plugins

---

## 📦 Installation

> ⚠️ **This is a private package. Please contact an authorized person to install it.**

```bash
npm install @phuong-tran-redoc/document-engine-core
# or
pnpm add @phuong-tran-redoc/document-engine-core
```

### Peer Dependencies

```json
{
  "@tiptap/core": "^2.x.x",
  "@tiptap/pm": "^2.x.x"
}
```

---

## 🚀 Quick Start

### Basic Usage

```typescript
import { Editor } from '@tiptap/core';
import { DocumentEngineExtensions } from '@phuong-tran-redoc/document-engine-core';

// Create an editor instance with Document Engine extensions
const editor = new Editor({
  element: document.querySelector('#editor'),
  extensions: [...DocumentEngineExtensions],
  content: '<p>Hello World!</p>',
});
```

### Working with Dynamic Fields

```typescript
import { DynamicFieldExtension } from '@phuong-tran-redoc/document-engine-core';

// Insert a dynamic field
editor.commands.insertDynamicField({
  name: 'customer_name',
  label: 'Customer Name',
});

// Get all dynamic fields in the document
const fields = editor.commands.getDynamicFields();

// Replace field values
editor.commands.replaceDynamicFields({
  customer_name: 'John Doe',
  loan_amount: '50000',
});
```

### Restricted Editing

```typescript
import { RestrictedEditingExtension } from '@phuong-tran-redoc/document-engine-core';

// Mark a region as editable
editor.commands.setEditableRegion();

// Lock the document (only editable regions can be modified)
editor.commands.lockDocument();

// Unlock the document
editor.commands.unlockDocument();
```

---

## 🏗️ Architecture

```
document-engine-core/
├── extensions/          # Custom Tiptap extensions
│   ├── dynamic-field/   # Dynamic field support
│   ├── restricted/      # Restricted editing
│   └── ...
├── nodes/              # Custom document nodes
├── marks/              # Custom text marks
├── plugins/            # ProseMirror plugins
├── commands/           # Editor commands
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

---

## 📚 Core Extensions

### Dynamic Fields Extension

Allows inserting placeholder fields that can be replaced with real data.

**Features:**

- Insert fields: `{{field_name}}`
- List all fields in document
- Batch replace field values
- Custom field styling

### Restricted Editing Extension

Controls which parts of the document can be edited.

**Features:**

- Mark editable regions
- Lock/unlock document
- Visual indicators for editable areas
- Keyboard navigation between editable regions

### Custom Table Extension

Enhanced table support for business documents.

**Features:**

- Merge/split cells
- Add/remove rows and columns
- Table headers
- Cell styling

_(More extensions to be documented)_

---

## 🔧 Development

### Building

Build the library:

```bash
nx build document-engine-core
```

### Testing

Run unit tests:

```bash
nx test document-engine-core
```

### Linting

Lint the code:

```bash
nx lint document-engine-core
```

---

## 🎨 Framework Wrappers

This core library is designed to be wrapped by framework-specific libraries:

- **Angular:** [`@phuong-tran-redoc/document-engine-angular`](../document-engine-angular)

---

## 📖 Documentation

- **[Live Demo](#)** - See the editor in action
- **[API Reference](#)** - Detailed API documentation
- **[Examples](#)** - Code examples and use cases
- **[Contributing](#)** - How to contribute

---

## 🔗 Related Resources

- [Tiptap Documentation](https://tiptap.dev)
- [ProseMirror Documentation](https://prosemirror.net)
- [Main Project Repository](#)

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
