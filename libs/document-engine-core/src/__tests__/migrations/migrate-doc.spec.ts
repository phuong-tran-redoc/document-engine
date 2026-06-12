import type { JSONContent } from '@tiptap/core';
import {
  docMigrations,
  LATEST_SCHEMA_VERSION,
  migrateDoc,
  type DocMigrationRegistry,
  type EditorDocument,
} from '../../index';

const sampleContent: JSONContent = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: 'hello' }] }],
};

describe('docMigrations registry', () => {
  it('exposes a LATEST_SCHEMA_VERSION of at least 1', () => {
    expect(LATEST_SCHEMA_VERSION).toBeGreaterThanOrEqual(1);
  });

  it('only registers migrations for versions below the latest, keyed by source version', () => {
    for (const key of Object.keys(docMigrations)) {
      const from = Number(key);
      expect(Number.isInteger(from)).toBe(true);
      expect(from).toBeGreaterThanOrEqual(1);
      expect(from).toBeLessThan(LATEST_SCHEMA_VERSION);
    }
  });

  it('each migration entry is pure and advances the version by one', () => {
    for (const [key, migrate] of Object.entries(docMigrations)) {
      const from = Number(key);
      const input: EditorDocument = { schemaVersion: from, content: sampleContent };
      const frozen = JSON.stringify(input);

      const result = migrate(input);

      expect(result.schemaVersion).toBe(from + 1);
      // input not mutated
      expect(JSON.stringify(input)).toBe(frozen);
    }
  });
});

describe('migrateDoc', () => {
  it('returns a latest-version document unchanged (idempotent)', () => {
    const latest: EditorDocument = { schemaVersion: LATEST_SCHEMA_VERSION, content: sampleContent };

    const once = migrateDoc(latest);
    const twice = migrateDoc(once);

    expect(once.schemaVersion).toBe(LATEST_SCHEMA_VERSION);
    expect(once.content).toEqual(sampleContent);
    expect(twice).toEqual(once);
  });

  it('treats a missing/invalid schemaVersion as version 1', () => {
    const noVersion = { content: sampleContent } as unknown as EditorDocument;

    const result = migrateDoc(noVersion);

    expect(result.schemaVersion).toBe(LATEST_SCHEMA_VERSION);
  });

  it('does not mutate its input', () => {
    const doc: EditorDocument = { schemaVersion: LATEST_SCHEMA_VERSION, content: sampleContent };
    const frozen = JSON.stringify(doc);

    migrateDoc(doc);

    expect(JSON.stringify(doc)).toBe(frozen);
  });

  // Walker behavior, exercised with an injected registry so it stays meaningful
  // even while the shipped registry is the v0.1.0 identity (empty) set.
  describe('walker (with injected registry)', () => {
    const fakeRegistry: DocMigrationRegistry = {
      1: (doc) => ({
        schemaVersion: 2,
        content: { ...doc.content, _v2: true } as JSONContent,
      }),
      2: (doc) => ({
        schemaVersion: 3,
        content: { ...doc.content, _v3: true } as JSONContent,
      }),
    };

    it('applies every step in order up to the target version', () => {
      const v1: EditorDocument = { schemaVersion: 1, content: sampleContent };

      const result = migrateDoc(v1, fakeRegistry, 3);

      expect(result.schemaVersion).toBe(3);
      expect(result.content).toMatchObject({ _v2: true, _v3: true });
    });

    it('starts from the document version, skipping already-applied steps', () => {
      const v2: EditorDocument = { schemaVersion: 2, content: sampleContent };

      const result = migrateDoc(v2, fakeRegistry, 3);

      expect(result.schemaVersion).toBe(3);
      expect(result.content).toMatchObject({ _v3: true });
      expect(result.content).not.toHaveProperty('_v2');
    });

    it('throws when a required migration step is missing', () => {
      const v1: EditorDocument = { schemaVersion: 1, content: sampleContent };

      expect(() => migrateDoc(v1, { 2: fakeRegistry[2] }, 3)).toThrow(/No migration registered/);
    });
  });
});
