import { docMigrations, LATEST_SCHEMA_VERSION } from './doc-migrations';
import type { DocMigrationRegistry, EditorDocument } from './types';

/**
 * Upgrade a stored document to {@link LATEST_SCHEMA_VERSION} by applying each
 * registered migration in order.
 *
 * Pure and idempotent: a document already at the latest version is returned
 * unchanged (a re-stamped copy), so batch runs are safe to re-run. A document
 * with a missing/invalid `schemaVersion` is treated as version 1 (the earliest).
 *
 * @param doc        The document to migrate.
 * @param migrations Registry to apply. Defaults to {@link docMigrations}; the
 *                   override exists for testing the walker in isolation.
 * @param latest     Target version. Defaults to {@link LATEST_SCHEMA_VERSION}.
 * @returns A new `EditorDocument` at `latest`.
 */
export function migrateDoc(
  doc: EditorDocument,
  migrations: DocMigrationRegistry = docMigrations,
  latest: number = LATEST_SCHEMA_VERSION,
): EditorDocument {
  let current: EditorDocument = {
    ...doc,
    schemaVersion: Number.isInteger(doc.schemaVersion) && doc.schemaVersion >= 1 ? doc.schemaVersion : 1,
  };

  while (current.schemaVersion < latest) {
    const migrate = migrations[current.schemaVersion];

    if (!migrate) {
      throw new Error(
        `[migrateDoc] No migration registered for schema version ${current.schemaVersion} ` +
          `(target ${latest}).`,
      );
    }

    const next = migrate(current);

    if (next.schemaVersion <= current.schemaVersion) {
      throw new Error(
        `[migrateDoc] Migration from version ${current.schemaVersion} did not advance the ` +
          `version (got ${next.schemaVersion}); migrations must be strictly increasing.`,
      );
    }

    current = next;
  }

  return current;
}
