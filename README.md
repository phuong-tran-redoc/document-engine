# Document Engine - Demo Application

[![npm core](https://img.shields.io/npm/v/@phuong-tran-redoc/document-engine-core?label=@phuong-tran-redoc/document-engine-core&color=red)](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core) [![npm angular](https://img.shields.io/npm/v/@phuong-tran-redoc/document-engine-angular?label=@phuong-tran-redoc/document-engine-angular&color=red)](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-angular) ![License](https://img.shields.io/npm/l/@phuong-tran-redoc/document-engine-core)

A live demonstration of a proprietary **Document Engine** system, built with a decoupled architecture (Core + Angular) to solve real-world enterprise document editing challenges.

---

## 📖 Context & Goal

### The Problem

In many enterprises, especially in Banking/Finance, generating critical documents (like a "Letter of Offer") often relies on third-party rich-text editors (like CKEditor). This dependency creates several significant problems:

- **Licensing Costs:** Significant recurring annual fees.
- **Lack of Flexibility:** Being constrained by the vendor's feature set, making deep business-logic customizations difficult.
- **Technology Risk:** Reliance on a "black-box" technology introduces strategic risk and complicates deep integrations.

### The Solution

This **Document Engine** was built to solve all of these issues:

- **Business-Focused:** Built with core business features in mind, such as **"Dynamic Fields"** (`{{customer_name}}`, `{{loan_amount}}`).
- **Technological Autonomy:** Develops a proprietary Intellectual Property (IP) asset, allowing full control over the product roadmap.
- **Reduced TCO:** Completely eliminates third-party licensing costs.

---

## ✨ Features Showcase

This demo showcases the following key capabilities:

- **Rich Text Editing:** Standard formatting (Bold, Italic, Underline, etc.)
- **Business Features:**
  - **Dynamic Fields:** Insert placeholders like `{{customer_name}}` that can be replaced with real data
  - **Restricted Editing:** Control which parts of the document can be edited
  - **Read-only Mode:** View-only document presentation
- **Table Support:** Create and edit tables within documents
- **Template System:** Pre-built document templates for common use cases
- **JSON-based Data Model:** Structured document representation (not raw HTML)

---

## 🏗️ Technical Architecture

This demo is built on a **decoupled, multi-package architecture**:

```
┌─────────────────────────────────────┐
│   Demo Application (Angular)       │
│   This Repository                   │
└──────────────┬──────────────────────┘
               │
               ├─── Uses
               │
┌──────────────▼──────────────────────┐
│  document-engine-angular            │
│  (Angular Wrapper Library)          │
└──────────────┬──────────────────────┘
               │
               ├─── Wraps
               │
┌──────────────▼──────────────────────┐
│  document-engine-core               │
│  (Framework-Agnostic Core)          │
│  Built on Tiptap + ProseMirror      │
└─────────────────────────────────────┘
```

### Architecture Benefits

- **Reusability:** The core logic can be reused across any future framework (React, Vue, etc.)
- **Maintainability:** Clear separation of concerns between framework-specific code and business logic
- **Testability:** Framework-agnostic core is easier to test independently
- **Flexibility:** Easy to swap or upgrade the Angular wrapper without touching core functionality

### Technology Stack

- **Core Technology:** Built on [Tiptap](https://tiptap.dev/) (a headless editor framework), which is built on top of [ProseMirror](https://prosemirror.net/)
- **Language:** 100% TypeScript
- **Framework:** Angular (for the demo application and wrapper)
- **Monorepo:** Nx workspace for efficient development
- **Styling:** Tailwind CSS with custom design system

> 💡 **Want to dive deeper into the core library API?** See the [document-engine-core README](libs/document-engine-core/README.md) for detailed documentation on extensions, commands, and architecture.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js:** v22+ (the repo pins pnpm 11, which requires Node ≥ 22.13)
- **Package Manager:** pnpm (the repo pins `pnpm@11.4.0` via `packageManager`)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/phuong-tran-redoc/document-engine.git
cd document-engine
```

2. Install dependencies:

```bash
pnpm install
# or
npm install
```

### Running the Application

To run the development server:

```bash
pnpm nx serve document-engine
# or
npx nx serve document-engine
```

The application will be available at `http://localhost:4200`

### Building for Production

To create a production bundle:

```bash
pnpm nx build document-engine
# or
npx nx build document-engine
```

### Explore the Project Graph

To visualize the project structure and dependencies:

```bash
npx nx graph
```

---

## 📦 Source Code Structure

This repository contains:

- **Demo Application:** `/apps/document-engine` - The Angular application you see in the demo
- **Core Library:** `/libs/document-engine-core` - Framework-agnostic document engine _([published on npm](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-core), public, MIT)_
- **Angular Wrapper:** `/libs/document-engine-angular` - Angular-specific components and directives _([published on npm](https://www.npmjs.com/package/@phuong-tran-redoc/document-engine-angular), public, MIT)_
- **Shared Libraries:** `/libs/shared` - Reusable UI components and utilities
- **Feature Libraries:** `/libs/document-engine/features` - Feature modules for the demo app

### Key Packages

- **`document-engine-core`** - Core business logic and editor extensions
  - 📖 [Read the Core Library README](libs/document-engine-core/README.md) for API documentation, usage examples, and extension guides
- **`document-engine-angular`** - Angular wrapper providing `<document-editor>` component
  - 📖 [Read the Angular Wrapper README](libs/document-engine-angular/README.md) for component API, Angular Forms integration, and usage examples

---

## 📚 Additional Resources

### Package Documentation

For detailed documentation on the individual packages:

- 📘 **[document-engine-core README](libs/document-engine-core/README.md)** - Framework-agnostic core library documentation
  - Learn about extensions, commands, and the core API
  - See usage examples and architecture details
- 📗 **[document-engine-angular README](libs/document-engine-angular/README.md)** - Angular wrapper library documentation
  - Component API reference
  - Angular Forms integration guide
  - Styling and customization examples

### Nx Workspace

This project uses [Nx](https://nx.dev) for efficient monorepo management.

**Useful Nx Commands:**

```bash
# See all available targets for a project
npx nx show project document-engine

# Run tests
npx nx test document-engine

# Lint the code
npx nx lint document-engine

# List all projects
npx nx list
```

### Learn More

- [Nx Documentation](https://nx.dev)
- [Angular Documentation](https://angular.dev)
- [Tiptap Documentation](https://tiptap.dev)
- [ProseMirror Documentation](https://prosemirror.net)

---

## 👤 About the Author

Developed by **Duc Phuong (Jack)** - Senior Frontend Engineer with 4+ years of experience, specializing in Angular and TypeScript.

**Learn more about me:**

- 💼 [LinkedIn](https://www.linkedin.com/in/tdp1999/)
- 🐙 [GitHub](https://github.com/tdp1999)
- 📧 [Email](mailto:tdp99.business@gmail.com)

---

## 📄 License

MIT

---

## 🤝 Contributing

This is a demonstration project. If you have questions or suggestions, feel free to reach out via the contact information above.
