# Architecture Decision Records

<!-- Document important technical decisions and their rationale -->

---

### [2026-06-10] ADR-001 — Release tooling & versioning model: `nx release` (native), fixed/locked

**Context:** Two interdependent publishable packages (`document-engine-core`, `document-engine-angular`)
need a repeatable version-bump + changelog + publish flow. The repo is solo-maintained on Nx 22 + pnpm.
The current `publish.yml` auto-publishes on push-to-`main` with **no version-bump step** (republishes
whatever is on disk → 409 conflicts or accidental publishes), no changelog, no tag, no human gate.

**Decision:** Use Nx's native `nx release` (version + changelog + publish), with
`projectsRelationship: "fixed"` (both packages share one version, bump in lock-step) and
`preserveLocalDependencyProtocols: false`. Trigger releases manually from local
(`nx release --skip-publish` → `git push --follow-tags`); CI only builds + publishes on tag push, gated.
Do **not** adopt Changesets or release-please.

**Rationale:**
- `nx release` is built-in, understands the project graph and the `workspace:*` edge, and already has a
  partial `release` block. Zero new tooling.
- Changesets is built for multi-contributor OSS (intent-file ceremony + Release-PR bot) and has known
  friction with Nx's `dist/` output via ng-packagr. No payoff for a solo maintainer who already writes
  Conventional Commits.
- **Fixed** sidesteps an Nx bug: in *independent* mode, if angular bumps but core didn't, the `workspace:*`
  dep is left un-replaced (nrwl/nx#27729, closed "not planned"). Fixed keeps core always in the release set.
- `preserveLocalDependencyProtocols: false` makes Nx stamp a real semver range (`^0.1.0`) at version time,
  so the published manifest is correct whether published with npm or pnpm — fixes the latent broken-publish bug.

**Consequences:** First cut is `0.0.41 → 0.1.0` via `nx release 0.1.0 --first-release`. One git tag per
release (`v{version}`). One no-op version bump on the package that didn't change (cheap). Full procedure in
[`ops/release-versioning.md`](ops/release-versioning.md).

---

### [2026-06-10] ADR-002 — IP ownership / copyright holder: the company (Realestatedoc / Redoc)

**Context:** `LICENSE.md` (root + both libs) reads `Copyright 2025 Realestatedoc (Redoc)` (a company),
but the package `author` field reads `Duc Phuong (Jack)` (an individual). This contradiction was never
resolved and is fundamentally a "who owns the IP" question.

**Decision:** The **company (Realestatedoc / Redoc)** is the copyright holder. This is an in-house library;
under typical work-for-hire terms the employer owns the copyright. `author` becomes the company; Duc Phuong
is credited as a `contributor`.

**Rationale:** Built on company time/resources and related to the company's business → work-for-hire →
company owns it. Making the holder and `author` consistent removes the contradiction that downstream
consumers and license scanners would flag.

**Consequences (applied 2026-06-10 via de-007):**
- Root `LICENSE.md` normalized to `Copyright (c) 2025 Realestatedoc (Redoc).` (per-lib files already had `(c)`).
- Both lib `package.json`: `"author": "Realestatedoc (Redoc)"` + `"contributors": ["Duc Phuong (Jack) …"]`.
- Root `package.json` stays `UNLICENSED` + `private: true` (correct for the unpublished monorepo root).
- **Still open:** confirm the exact **registered legal entity name** — "Realestatedoc (Redoc)" is informal;
  swap in the registered name across the three `LICENSE.md` + both `author` fields if it differs.

---

### [2026-06-10] ADR-003 — Pre-publish security & legal gate scope: MUST-have baseline

**Context:** CI runs lint/test/build/e2e only — no dependency audit, secret scan, license scan, tarball
verification, or SBOM. The release flow needs a gate it can call before every publish.

**Decision:** Adopt the **MUST-have baseline** tier: tarball-content verification (`npm pack` denylist),
`files` allowlist, Gitleaks (secret scan), OSV-Scanner (vuln scan, block on HIGH/CRITICAL),
`license-checker-rseidelsohn` allowlist (fail on GPL/AGPL/unknown), publint + attw (export/type correctness),
dependency cooldown (`minimumReleaseAge`), `SECURITY.md`, Dependabot, and SHA-pinned GitHub Actions.
Defer the SHOULD tier (Socket.dev, OpenSSF Scorecard, CodeQL) and nice-to-haves (SBOM, attestations).

**Rationale:** Baseline is free, near-zero-noise, and blocks only genuinely publish-stopping issues — the
right weight for a solo-maintained small lib. Already have the two hardest wins (OIDC Trusted Publishing +
`--provenance`); the gate protects inputs (deps, secrets) and output (tarball contents).

**Consequences:** Single `security-gate` CI job that `publish` `needs:`. Nothing reaches npm unless green.
Full spec in [`ops/security-legal-gate.md`](ops/security-legal-gate.md).

---

### [2026-06-11] ADR-004 — Document versioning shape: thin `EditorDocument` wrapper (DE-003)

**Context:** Stored documents need a `schemaVersion` so persisted JSON can migrate forward safely. Two
places to put it: (a) a doc-level attribute on the ProseMirror `doc` node, or (b) a thin wrapper type
around the content.

**Decision:** A thin wrapper: `EditorDocument { schemaVersion: number; content: JSONContent }`. Versioning
is a storage-layer concern, not an editor-schema concern. `migrateDoc(doc)` is pure + idempotent; the
shipped registry (`docMigrations`) is empty/identity at `LATEST_SCHEMA_VERSION = 1`, but the walker +
registry + field exist so future bumps are non-breaking.

**Rationale:** Keeps the ProseMirror schema untouched (no migration of every node's attrs, no editor
re-init to read a version). A backend can read/migrate the version without instantiating an editor, and it
matches the `migrateDoc(doc)` signature the portfolio consumer (tasks 310/319) expects.

**Consequences:** Consumers persist `{ schemaVersion, content }`. Adding a migration = bump
`LATEST_SCHEMA_VERSION` and add the keyed step. All exported from `core/src/index.ts` via `./migrations`.

---

### [2026-06-11] ADR-005 — Headless `generateHTML` is async + environment-aware (DE-002)

**Context:** Core must serialize document JSON → HTML headlessly (for backend rendering). Tiptap v3 splits
`@tiptap/html`: the bare entry (and its CJS `require`) is **browser-only** and throws in Node; only
`@tiptap/html/server` is Node-safe — but it's backed by **happy-dom**, which is ESM-only and ~600 files.
A static import of `/server` into `index.ts` therefore breaks the whole (CJS) Jest suite and bundles a full
DOM implementation into every browser editor app that imports core.

**Decision:** `generateHTML(doc, extensions?)` is **async** and picks the serializer at call time from
whether a DOM is present, via lazy `import()`: browser/jsdom → `@tiptap/html` (ambient DOM), Node →
`@tiptap/html/server` (happy-dom). It lives in `core/src/kit/` (with `defaultExtensions`), not `utils/`, to
avoid a `utils → kit → extensions → utils` cycle. A `defaultExtensions` array (content-schema half of the
editor kit) is the default arg; `Indent` is excluded because its `renderHTML` emits an empty `style=""` on
every block. An ambient shim (`types/tiptap-html-server.d.ts`) lets TS resolve the `/server` subpath under
`moduleResolution: node10`.

**Rationale:** Async + lazy isolates happy-dom to a never-fetched-in-browser chunk, keeps the export in
`index.ts` (per the task contract), and stops unrelated tests from loading 600 ESM files. Env-awareness also
gives the test seam: real HTML is asserted under jsdom; the Node path is asserted with `/server` mocked.

**Consequences:** Consumers `await generateHTML(...)` (portfolio `RichTextService` must `await` before
DOMPurify). `@tiptap/html` added to core deps **and** root `package.json` (repo convention: all `@tiptap/*`
live in both).

**Follow-up (2026-06-11):** the lazy `import('@tiptap/html/server')` was still **statically resolvable** by
esbuild/webpack/vite, so a browser bundle (the demo app's `nx build`) tried to bundle happy-dom and failed on
Node built-ins (`util`, `stream`, `vm`, …). Fixed by building the `/server` specifier at runtime
(`['@tiptap','html','server'].join('/')`) plus `/* webpackIgnore */ /* @vite-ignore */`, so no bundler can
resolve it and happy-dom stays out of the client bundle entirely. The `typeof document` guard means the Node
branch never runs in a browser. (Surfaced only when the demo app was first built after this work — evidence
that a dep/feature change must build **every** project, not just unit-test the libs.)

---

## Template

### [Date] Decision Title

**Context:** Why this decision was needed

**Decision:** What was decided

**Rationale:** Why this option was chosen

**Consequences:** What this means going forward

---
