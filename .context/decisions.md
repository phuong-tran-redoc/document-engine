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

### [2026-06-12] ADR-006 — Angular peer floor raised `>=14` → `>=16`; lib source held to it + enforced by a 2-layer guard (DE-013)

**Context:** The workspace develops on Angular 20.3, but `@phuong-tran-redoc/document-engine-angular` declared a
peer floor of `@angular/* >=14.0.0 <22.0.0`. Nothing stopped the lib from using syntax newer than the floor — it
builds here but would break older consumers. A source audit found two offenders (`node-view.component.ts`
`input.required()`, 17.1+; `image-insert-view.ts` `@if`, 17+). The original plan was to keep `>=14` and just
downgrade those. But the **layer-2 real-compile guard (built first) disproved the premise**: a stock Angular
**14** AOT build of the packed lib fails `NG8002` on every input binding — not from our source, but because
ng-packagr@20 emits `.d.ts` whose `ɵɵComponentDeclaration` input metadata uses the **object form**
(`{ alias, required }`), which only Angular **≥16** type-checkers understand (14/15 expect the string form). The
runtime fesm is fine (string-map inputs, `minVersion` 12/14); the incompatibility is purely the emitted **type
declarations**. An empirical run then confirmed Angular **16.0** AOT-builds the package cleanly.

**Decision:** **Raise the floor to `@angular/* >=16.0.0 <22.0.0`** (the lowest the Angular-20 build output
actually supports), **hold the lib source to that floor** (`input.required()` → `@Input()`, `@if` → `*ngIf` —
both are 17+, still above 16), and enforce with a **two-layer guard**, both blocking and wired into
`security-gate.yml` (which `publish.yml` requires, so failure blocks publish):
1. **Static denylist** (`tools/check-angular-floor.mjs`, `pnpm guard:ng-floor`): fast source scan banning
   post-16 APIs (signal inputs/queries `input()/output()/model()/viewChild()`, built-in control flow
   `@if/@for/@switch`). Angular-16 APIs (signals, `@Input({…})`, `takeUntilDestroyed`) are allowed.
2. **Real floor-Angular compile** (`tools/ng-floor-compat/`, pinned Angular 16): pack the libs, install into an
   isolated consumer, AOT `ng build`.
`standalone` is kept (no downgrade) — it works on Angular 16; layer 2 validates it empirically.

**Rationale:** A peer floor is a published contract; `>=14` was simply **false** for any AOT/strictTemplates
consumer (i.e. essentially all real apps) given the ng20-emitted `.d.ts` — better an honest `>=16` than a
contract that breaks on install. The static layer gives instant PR feedback but is a blocklist (can miss novel
APIs); the real-compile layer is authoritative — it is the only check that exercises the floor's template
type-checker (the `.d.ts` input-declaration format — the exact thing that broke 14) and the partial-ivy linker
on the Angular-20-built declarations. No published consumers exist yet (first release is DE-008), so narrowing
the range now costs nothing.

**Consequences:** Lib contributors must use ≤Angular-16 syntax in the published lib (guard-enforced locally + in
CI). The real-compile job adds a few minutes to `security-gate` (isolated Angular-16 toolchain install). The
`dep-bump` and `publish` skills reference the guard. If the floor is ever changed, update the peer range, the
static denylist calibration, and the `ng-floor-compat` pinned Angular version in lock-step, and supersede this
ADR. (Reaching a literal `>=14` is not possible without building the lib on an older Angular toolchain.)

---

### [2026-07-01] ADR-007 — `document-engine-core` keeps `@tiptap/*` as `dependencies` (not peer)

**Context:** core and the Angular wrapper declare `@tiptap/*` differently — the wrapper uses
`peerDependencies` (single Editor instance in the browser), core uses `dependencies`. This
inconsistency was never recorded, and debugging a Node consumer's runtime load failure (DE-014)
raised the question of whether peer is the correct choice for core too.

**Decision:** core **keeps `@tiptap/*` as `dependencies`**.

**Rationale:**

- core is "batteries-included" for headless Node consumers (`generateHTML` + `defaultExtensions`):
  the consumer does not have to hand-declare all ~27 `@tiptap/*` packages itself.
- The duplicate-instance hazard that peer deps normally solve does not arise here: the `^3.26`
  ranges of core and the consumer overlap, so pnpm dedupes to a single copy in the store.
- The place where a single Tiptap instance genuinely matters is the live Editor, which lives in the
  Angular wrapper — already correctly declared as `peerDependencies`. core is used mostly headless.
- Flipping core to peer would change the package's public contract (major-ish) for no real benefit.

**Not related to DE-014:** that crash was `ERR_UNSUPPORTED_DIR_IMPORT` (core's own broken ESM
packaging), fully independent of the dep-vs-peer question. DE-014 fixed the packaging; this ADR only
records why the dependency classification is intentionally left as-is.

**Consequences:** A consumer must directly declare only the `@tiptap/*` packages it imports itself;
the rest arrive transitively through core. If core is ever flipped to peer, every consumer must then
re-declare the full set — supersede this ADR at that point.

---

### [2026-07-20] ADR-008 — Editor content styling ships as opt-in, token-driven themes (not folded into the chrome barrel)

**Context:** `document-engine-angular` published only **chrome** styles (`/styles` → toolbar, buttons,
select, wrapper). The **content prose** that makes the editing surface render correctly (blockquote,
inline code, hr, img, and the engine's `data-list-style-type` ordered-list counters) lived only in the
demo app's private `_editor.scss` and was never published — so every consumer got an unstyled content
area and had to reverse-engineer engine-coupled CSS it cannot reasonably know (the clearest case: the
editor preflight resets `list-style` and paints markers via CSS counters keyed off a data attribute, so
a consumer writing `ol { list-style: decimal }` is simply wrong). Scoping revealed headings and bullet
markers are missing from the **engine** too, not just unpublished (class-less `<h*>` + preflight reset).

**Decision:** Ship the content styling as **two opt-in subpath entries** —
`…/styles/editor-content` (prose floor) and `…/styles/editor-interaction` (editing-surface chrome:
widget handles, table editing, dynamic fields, placeholders, selected-node outline). Both are
**token-driven** (every value is `var(--token, fallback)`), **scoped to `.tiptap-editor`** (the class
the editor directive sets on its host), and **NOT** folded into the main `/styles` barrel — which stays
**chrome-only**. The demo app dogfoods them via `@forward`, replacing its private `_editor.scss`.

**Rationale:**
- Splits content styling by ownership: **structural correctness** (counters, list restore, code/quote/
  hr/img structure, and — per the scoping finding — a heading scale + bullet markers + block rhythm the
  engine strips) is engine-coupled → the **lib owns it**; **aesthetics** (exact colours, sizes, fonts)
  stay the **consumer's** via CSS-var remapping. Mirrors `@tailwindcss/typography`'s `prose` and
  CodeMirror's base theme.
- **Opt-in, not imposed:** a consumer that wants to style content entirely themselves imports only the
  chrome barrel and is never handed a look. Splitting content vs interaction lets a consumer take prose
  without the editing handles (e.g. a read-only render).
- Published SCSS is **Tailwind-free** — the demo's `@apply` utilities were inlined to plain CSS so the
  theme works for non-Tailwind consumers, matching the existing chrome files' convention (`button.scss`).

**Consequences:**
- New content rules must land on the correct side of the split (engine-coupled → theme; aesthetic →
  consumer) and reference a CSS var with a fallback, never a hard-coded look.
- Demo-only colour vars (`--blue`/`--green`/`--light-blue`) were remapped to shadcn tokens
  (`--ring`/`--accent`/`--muted-foreground`) plus documented `--de-*` custom props
  (`--de-dynamic-field`, `--de-selected-cell`) for engine-specific accents a shadcn set has no
  token for; the **full-floor** additions (heading scale, bullet
  markers, paragraph rhythm the preflight had zeroed) intentionally change the demo's *content*
  rendering from flat → styled. "Renders identically" therefore holds for the **ported** rules
  (blockquote/code/hr/img/ol counters), which are preserved verbatim; the floor additions are a
  deliberate dogfood improvement.
- Adds two entries to the package `exports` map; a packed tarball must be verified to resolve the new
  sass subpaths (not just the workspace).

---

## Template

### [Date] Decision Title

**Context:** Why this decision was needed

**Decision:** What was decided

**Rationale:** Why this option was chosen

**Consequences:** What this means going forward

---
