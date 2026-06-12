import type { JSONContent } from '@tiptap/core';

/**
 * A stored document plus the schema version its `content` was authored against.
 *
 * Documents are persisted as this thin wrapper (rather than stamping a version
 * attribute onto the ProseMirror `doc` node) so versioning stays a storage-layer
 * concern: the editor schema is untouched, and a backend can read/migrate the
 * version without instantiating an editor.
 */
export interface EditorDocument {
  /** Schema version `content` conforms to. See {@link LATEST_SCHEMA_VERSION}. */
  schemaVersion: number;
  /** The document body as ProseMirror/Tiptap JSON. */
  content: JSONContent;
}

/**
 * A single, pure migration step: upgrade a document from version `N` to `N + 1`.
 * Must not mutate its input and must not depend on browser APIs.
 */
export type DocMigration = (doc: EditorDocument) => EditorDocument;

/**
 * Ordered registry of migration steps, keyed by the *source* version each step
 * upgrades from. Entry `N` takes a v`N` document and returns a v`N + 1` one.
 */
export type DocMigrationRegistry = Record<number, DocMigration>;
