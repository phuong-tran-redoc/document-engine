import type { DocMigrationRegistry } from './types';

/**
 * The current schema version. `EditorDocument`s authored by this build of the
 * editor carry this value, and {@link migrateDoc} upgrades older documents up to
 * it.
 *
 * Bump this by exactly one whenever a schema change requires transforming stored
 * content, and add the matching entry (keyed by the previous version) to
 * {@link docMigrations}.
 */
export const LATEST_SCHEMA_VERSION = 1;

/**
 * Ordered migration steps, keyed by the source version they upgrade from.
 *
 * v0.1.0 ships an identity (empty) set: there is nothing to migrate yet, but the
 * registry, walker ({@link migrateDoc}), and version field exist so future
 * schema bumps are non-breaking. To add one, e.g. for the 1 -> 2 bump:
 *
 * ```ts
 * export const docMigrations: DocMigrationRegistry = {
 *   1: (doc) => ({ schemaVersion: 2, content: transformV1ToV2(doc.content) }),
 * };
 * ```
 *
 * Each entry must be pure (no mutation, no browser APIs).
 */
export const docMigrations: DocMigrationRegistry = {};
