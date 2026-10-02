# Domain

Business concepts and rules the editor encodes. Code is the source of truth for exact behavior; this captures intent and invariants.

## Document model

- A document is a **structured JSON tree** (Tiptap/ProseMirror doc), not raw HTML. JSON is canonical; HTML is a derived/rendered output.
- Content is **semantic**: headings, paragraphs, lists, marks (bold/italic/underline/strike/code), links, tables, and custom nodes. Presentation (color, font-size, alignment) is a consumer concern and is intentionally kept out of the stored semantic model where possible.

## Custom nodes

- **Dynamic Field** (`DynamicField` node) — an inline placeholder token such as `{{customer_name}}`, `{{loan_amount}}`. Represents a slot to be filled with real data at document-generation time. The core business differentiator vs generic editors.
- **Heading** (`Heading` node) — custom heading handling (beyond default Tiptap heading).
- **Page Break** (`PageBreak` node) — explicit pagination control for print/document output.

## Editing-control extensions

- **Restricted Editing** (`RestrictedEditing`) — marks regions of a document as editable vs locked. Supports more than one source format of restriction markers (legacy comments in the extension reference a "standard Tiptap format" vs a "CKEditor format" precedence). Use case: a template author locks boilerplate, leaves only specific fields editable.
- **Reset-on-Enter / ResetFormat / ClearContent / TextCase / Indent / OrderedList / TableStyle** — formatting-discipline rules that keep produced documents consistent (e.g. pressing Enter resets formatting, controlled list/table styling).

## Templates

- Pre-built document templates for common use cases (e.g. Letter of Offer). A template = a starting document JSON, typically combining locked boilerplate (Restricted Editing) with Dynamic Fields to fill.

## Output / rendering

- The editor produces semantic JSON. Consumers render it:
  - **In-editor** (Angular wrapper) for authoring.
  - **Headless → HTML** for server-side rendering (no browser). v0.1.0 exposes a headless `generateHTML` + the extension list so a Node server can turn stored JSON into HTML without a DOM.

## Output capabilities for embedding consumers

A serious embedding stores content as canonical **JSON** + an optional rendered/sanitized **HTML cache** + a **schema version**. To support safe evolution and rich embedding, the engine provides (v0.1.0):

- A **`schemaVersion`** on the document root and a **`docMigrations` registry** + **`migrateDoc()`** helper (pure functions, version N → N+1) so stored documents can migrate lazily on next edit.
- An **`image-ref`** node: a semantic `<figure>` carrying `data-image-id` (decouples content from the media URL — the consumer resolves the actual image later).
- An async **media-pick hook** (`image.onPick: () => Promise<MediaResult>`) so a consumer's own media picker supplies images instead of a raw URL input.

These are additive capabilities, semantic-only, and presentation-free — consistent with the document model's invariants.

## Invariants

- JSON is canonical; never treat HTML as the source of truth.
- Stored content is semantic and presentation-free.
- Public API changes are additive unless a major version bump is coordinated with consumers.
- Schema migrations are pure and ordered; a document always carries the version it was written under.
