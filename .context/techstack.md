# Tech Stack

## Monorepo & tooling

- **Nx** 22.0.2 (workspace, task graph, `nx release`, module-boundary lint)
- **Package manager:** pnpm (workspace: `libs/*`, `apps/*`; `autoInstallPeers: true`)
- **Node:** 20+ (CI on Node 20, pnpm 9)
- **TypeScript:** ~5.9
- **Lint:** ESLint 9 flat config (`eslint.config.mjs`) + `@nx/eslint-plugin` boundaries; Prettier 2.x
- **Default base branch:** `master` (note: CI workflows trigger on `main` — see decisions)

## Editor engine

- **Tiptap** 3.10.5 — `@tiptap/core`, `@tiptap/pm` (ProseMirror), and the full `@tiptap/extension-*` set (bold, italic, underline, strike, code, code-block, blockquote, heading, list, link, image, table, text-align, text-style, sub/superscript, hard-break, horizontal-rule, bubble-menu, floating-menu, document, paragraph, text).
- **@floating-ui/dom** 1.7 — menu positioning (angular wrapper dep).
- **lodash-es** — utility (peer dep of both libs).

## Angular (demo app + wrapper lib)

- **Angular** ~20.3.0 (`core`, `common`, `forms`, `platform-browser`, `router`, `cdk`, `material`)
- **ng-packagr** ^20.3.2 (builds the angular lib)
- **Wrapper peerDeps:** `@angular/*` `>=14.0.0 <21.0.0`, `rxjs` ^7.5, `lodash-es`, full `@tiptap/*` set
- **rxjs** ~7.8, **zone.js** ~0.15

## Styling

- **Tailwind CSS** 3.4 + **PostCSS** 8.5 + **autoprefixer**
- SCSS design system; angular lib ships `./styles` SCSS export

## Build executors

- core → `@nx/js:swc` (ESM)
- angular → `@nx/angular:package` (ng-packagr, CJS)

## Testing & CI

- **Jest** 29 + `jest-preset-angular` 14.6 + `@swc/jest`
- **Playwright** ^1.36 (`@nx/playwright`); `@ci`-tagged subset for CI
- **GitHub Actions** — `ci.yml` (lint/test/build/e2e), `publish.yml` (npm OIDC Trusted Publishing + provenance)
- **Verdaccio** ^6 — local npm registry for publish dry-runs

## Notable gaps (addressed in v0.1.0 work)

- No Changesets — manual versioning.
- Angular peer range caps at `<21` (blocks Angular-21 consumers).
- No headless `generateHTML` export, no `image-ref` node, no async media-pick hook, no schema-version/migrations registry.
