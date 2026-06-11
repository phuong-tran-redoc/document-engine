# Vision

## What this is

**Document Engine** is an in-house, framework-agnostic rich-text / document editor built on Tiptap + ProseMirror, shipped as two publishable npm packages plus an Angular demo app.

- `@phuong-tran-redoc/document-engine-core` — framework-agnostic editor core (extensions, nodes, models, utils).
- `@phuong-tran-redoc/document-engine-angular` — Angular wrapper (components, directives, ControlValueAccessor).
- `apps/document-engine` — demo/showcase app proving the libraries.

## Why it exists

Enterprises (esp. Banking/Finance) generate critical documents (e.g. "Letter of Offer") using third-party rich-text editors like CKEditor. That dependency brings:

- **Licensing cost** — recurring annual fees.
- **Lack of flexibility** — constrained by the vendor feature set; deep business-logic customization is hard.
- **Technology risk** — a black-box dependency complicates integrations and strategy.

Document Engine replaces that with an owned IP asset: full control of the roadmap, zero licensing cost, and first-class business features.

## Who consumes it

- **Demo app** (this repo) — showcases capabilities during development.
- **Downstream applications** — embed the published packages (pinned to an exact version) to author and render long-form content. The public API is the contract they depend on. v0.1.0 is the first stable release aimed at real external embedding.

## Core value props

- **Business-focused features** — Dynamic Fields (`{{customer_name}}`), Restricted Editing, templates, tables.
- **Decoupled architecture** — framework-agnostic core reusable by any future wrapper (React, Vue); Angular wrapper swappable without touching core.
- **JSON-canonical data model** — structured document representation, not raw HTML.

## Scope & non-goals (current)

- **In scope:** the two npm packages + demo app; semantic, business-oriented editing primitives.
- **Non-goals (for now):** collaborative editing / comments / mentions / track-changes; a hosted Storybook/demo site; Markdown round-trip. These are deferred, not rejected.

## Success looks like

- Both packages publish cleanly to npm via Trusted Publishing with provenance.
- The public API is a stable, additive-only contract that downstream consumers can pin and trust.
- v0.1.0 graduation ships the exports/config/nodes a serious embedding needs: headless HTML generation, an `image-ref` node, an async media-pick hook, and schema versioning.
