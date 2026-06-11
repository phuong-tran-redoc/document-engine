# Architecture & Patterns

## Layering

```
apps/document-engine            (demo app — Angular)
        │ uses
libs/document-engine-angular     @phuong-tran-redoc/document-engine-angular  (PUBLISHED)
        │ wraps
libs/document-engine-core        @phuong-tran-redoc/document-engine-core      (PUBLISHED)
        │ built on
Tiptap 3.x  ──  ProseMirror
```

- **core** is framework-agnostic. No Angular, no DOM-framework assumptions beyond what Tiptap needs. ESM (`type: module`), built with `@nx/js:swc`.
- **angular** wraps core for Angular consumers: components, directives, a `ControlValueAccessor` so the editor binds to Angular Forms. CommonJS (`type: commonjs`), built with `@nx/angular:package` (ng-packagr). Depends on core via `workspace:*` — versioned and published in lockstep.
- **demo app + internal libs** (`libs/shared/*`, `libs/document-engine/features/*`) exist only to showcase/dev the packages and are NOT published.

## Module boundaries

- Nx tags: both publishable libs carry `scope:public`. Internal libs are demo-only.
- Import aliases (`tsconfig.base.json`):
  - Public: `@phuong-tran-redoc/document-engine-core`, `@phuong-tran-redoc/document-engine-angular` (+ `/styles`).
  - Internal: `@shared/*`, `@document-engine/*`.
- **The public API is the only contract.** Anything not re-exported from a lib's `src/index.ts` is private and may change freely. Anything exported is consumed by external apps — additive changes only; breaking changes require a major bump + consumer coordination.

## Core public API (`libs/document-engine-core/src/index.ts`)

Re-exports: `constants`, `extensions`, `models`, `nodes`, `types`, `utils`, `views`.

- **Extensions** (Tiptap `Extension`/`Mark` wrappers): `ClearContent`, `Indent`, `OrderedList`, `ResetFormat`, `ResetOnEnter`, `RestrictedEditing`, `TableStyle`, `TextCase`.
- **Nodes** (Tiptap `Node`): `DynamicField`, `Heading`, `PageBreak`.
- **Utils**: `color`, `dom`, `table`, `text`.
- Source structure: `core/src/{constants,extensions,models,nodes,types,utils,views,__tests__}`.

## Angular public API (`libs/document-engine-angular/src/index.ts`)

Re-exports: `lib/{components,core,ui,types,utils,views}` + the `Editor` type from `@tiptap/core` for consumer convenience.

- **views/** includes bubble-menu view content (e.g. `image-insert-view`).
- Editor config is described by a `DocumentEngineConfig` (kit) type; extension options are passed through.

## Patterns to follow

- **New extension/node** → add under `core/src/extensions` or `core/src/nodes`, export from that folder's `index.ts`, then it flows through `core/src/index.ts`. Add `__tests__` coverage.
- **New consumer-facing capability** → expose it through the public `index.ts`; document the contract.
- **Headless / Node-side helpers** (e.g. HTML generation for server rendering) must live in **core** and be ESM-safe — downstream backends generate HTML without a browser.
- **Semantic, presentation-free output** — the editor emits semantic structure (headings, lists, marks, custom nodes via `data-*` attributes). Presentation (color, font-size, alignment) is the consumer's concern, kept out of stored content where possible.

## Build, version & publish

- **Versioning is git-tag driven** — both libs set `currentVersionResolver: "git-tag"` (fallback `disk`). `package.json` versions (`0.0.41`) are only the disk fallback; `nx release` + git tags are the source of truth.
- **No Changesets yet** — release notes/version bumps are manual (adding Changesets is part of v0.1.0 work).
- **CI** (`.github/workflows/ci.yml`): on PR/push to `main`, `nx affected` lint + test (+ Codecov) and a separate Playwright `@ci` e2e job.
- **Publish** (`.github/workflows/publish.yml`): on push to `main` touching either lib, build both and publish to npm via **OIDC Trusted Publishing** (no tokens) with `--provenance`.
- **Local registry**: `.verdaccio/` for dry-run publish before pushing.

## Testing

- Unit: Jest (`jest-preset-angular`). Per-lib `pnpm test:core` / `pnpm test:angular`.
- E2E: Playwright against the demo app. `@ci`-tagged subset runs in CI (`pnpm e2e:ci`); see `docs/E2E_TAGGING_GUIDE.md`.
