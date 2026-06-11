# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Project Overview

**Document Engine** — an in-house, framework-agnostic rich-text/document editor built on Tiptap + ProseMirror. The product is two **publishable npm packages** plus an Angular **demo app** that showcases them. It exists to replace third-party rich-text editors (e.g. CKEditor) in enterprise document workflows: own the IP, kill licensing cost, and add business-specific features (Dynamic Fields like `{{customer_name}}`, Restricted Editing, templates, tables).

Published packages (npm, scope `@phuong-tran-redoc`, MIT, public):

| Package | Role | Module type | Builder |
| --- | --- | --- | --- |
| `@phuong-tran-redoc/document-engine-core` | Framework-agnostic core: Tiptap extensions, custom nodes, models, utils | ESM (`type: module`) | `@nx/js:swc` |
| `@phuong-tran-redoc/document-engine-angular` | Angular wrapper components/directives/CVA over core | CommonJS (`type: commonjs`) | `@nx/angular:package` (ng-packagr) |

The Angular lib depends on core via `workspace:*` — they version and publish **together**.

> **Public API is a contract.** These packages are published to npm and embedded by external apps. Treat anything exported from a lib `index.ts` as a stable surface — additive changes only unless a major bump is intended.

## Tech Stack

- **Nx:** 22.0.2 | **pnpm** | **Node:** 20+
- **Angular:** ~20.3.0 (demo app + wrapper lib) | **TypeScript:** ~5.9
- **Editor:** Tiptap 3.10.5 (`@tiptap/*`) on ProseMirror (`@tiptap/pm`)
- **Styling:** Tailwind CSS 3.4 + SCSS design system
- **Test:** Jest (unit, `jest-preset-angular`) + Playwright (e2e)
- **Lint:** ESLint 9 (flat config) + Nx module-boundary rules

## Monorepo Layout

```
libs/
  document-engine-core/        # @phuong-tran-redoc/document-engine-core  (PUBLISHED, scope:public)
  document-engine-angular/     # @phuong-tran-redoc/document-engine-angular (PUBLISHED, scope:public)
  shared/                      # internal demo-app UI + features
    ui/{avatar,breadcrumb,confirmation-dialog,sidebar,toast}
    features/{breakpoint-observer,theme-system}
  document-engine/             # internal demo-app feature libs
    util/
    features/{layout,home,demo,test-bench,template,contact,http-error}
apps/
  document-engine/             # Angular demo/showcase app (port 4200)
  document-engine-e2e/         # Playwright e2e for the demo app
```

Import aliases (`tsconfig.base.json`): published libs are `@phuong-tran-redoc/document-engine-{core,angular}`; internal libs use `@shared/*` and `@document-engine/*`.

### Public API surface (the contract)

- **core** (`libs/document-engine-core/src/index.ts`) re-exports: `constants`, `extensions`, `models`, `nodes`, `types`, `utils`, `views`.
  - Extensions: `ClearContent`, `Indent`, `OrderedList`, `ResetFormat`, `ResetOnEnter`, `RestrictedEditing`, `TableStyle`, `TextCase`.
  - Nodes: `DynamicField`, `Heading`, `PageBreak`.
  - Utils: `color`, `dom`, `table`, `text`.
- **angular** (`libs/document-engine-angular/src/index.ts`) re-exports: `lib/{components,core,ui,types,utils,views}` + `Editor` type from `@tiptap/core`.

When adding anything intended for consumers, export it from these `index.ts` files — nothing is public until it is.

## Quick Start

```bash
pnpm start                # nx serve document-engine (demo app, http://localhost:4200)
pnpm build:libs           # build BOTH publishable libs (core + angular)
pnpm test:core            # unit-test core
pnpm test:angular         # unit-test angular wrapper
pnpm test:all             # all projects
pnpm e2e                  # Playwright e2e (demo app)
pnpm e2e:ci               # @ci-tagged subset (mirrors CI)
npx nx graph              # visualize project graph
```

Prefer running tasks through `nx` (`nx run`, `nx run-many`, `nx affected`) over underlying tooling. Use `nx affected` to scope work.

## Build, Version & Publish

- **Versioning is git-tag driven, lock-step.** Both libs release together at one version via `nx release` (fixed relationship); `currentVersionResolver: "git-tag"` (fallback `disk`). The `0.0.41` in each `package.json` is only the disk fallback — git tags (`v{version}`) are the source of truth.
- **`nx release`, not Changesets.** Version + changelog + tag are produced **locally**; CI only publishes. Full runbook: [`RELEASING.md`](./RELEASING.md).
- **Publish is tag-triggered + gated.** Pushing a `v*` tag runs `.github/workflows/publish.yml`, which first runs the required `security-gate` job (secret / vuln / license / tarball / type-correctness checks), then stamps the tagged version into the built dist manifests and publishes both packages via **OIDC Trusted Publishing** (no npm tokens) with `--provenance` (Sigstore attestation).
- **Local dry-run:** `.verdaccio/` provides a local npm registry (`verdaccio` dep) to test publishing before pushing.
- **CI:** `.github/workflows/ci.yml` runs on PRs/pushes to `main` — `nx affected` lint + test (+ coverage to Codecov) and a Playwright `@ci` e2e job. `security-gate.yml` also runs on PRs touching the libs.

Cut a release (summary — full detail in [`RELEASING.md`](./RELEASING.md)):
1. `pnpm nx release --dry-run` — preview the bump + changelog.
2. `pnpm nx release --skip-publish` — version + changelog + commit + tag, core & angular in lock-step.
3. `git push --follow-tags` — the tag triggers the gated CI publish.
4. Verify on npmjs.com (`npm audit signatures`).

## Conventions & Guardrails

| Rule | Detail |
| --- | --- |
| **Nx MCP first** | Use `nx_workspace` / `nx_project_details` / `nx_docs` MCP tools to understand the workspace and answer Nx-config questions instead of assuming. |
| **Verify project names** | `pnpm nx show projects \| grep -i <term>` before running nx commands — project names use the npm-scoped form (e.g. `@phuong-tran-redoc/document-engine-core`). |
| **Public API is a contract** | Anything exported from a lib `index.ts` is consumed by external apps. Additive changes only; breaking changes need a major bump + coordination. |
| **Two module systems** | core is ESM, angular is CJS — don't assume one config works for both. Headless/Node-side helpers must be ESM-safe in core. |
| **Style** | SCSS + Tailwind; Angular components use `scss`. Follow existing extension/node folder structure under `core/src/{extensions,nodes,...}`. |
| **English in code** | Identifiers, comments, and docs in English (some legacy Vietnamese comments are being cleaned up). |
| **Type-check after edits** | `npx nx build <project>` or `npx tsc --noEmit` after touching `.ts`. |
| **Never read `.env`** | `.env` / `*.local.ts` hold secrets — ask the user for values instead of opening them. |

## Context & Task Tracking

`.context/` holds vision, architecture, techstack, domain, decisions, epic plans, and task files. **It is gitignored (local-only, personal)** — do not rely on it being present for other contributors or in CI. Durable, shareable guidance belongs in this `CLAUDE.md` or the package READMEs; `.context/` is for planning and task tracking.

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

# General Guidelines for working with Nx

- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- You have access to the Nx MCP server and its tools, use them to help the user
- When answering questions about the repository, use the `nx_workspace` tool first to gain an understanding of the workspace architecture where applicable.
- When working in individual projects, use the `nx_project_details` mcp tool to analyze and understand the specific project structure and dependencies
- For questions around nx configuration, best practices or if you're unsure, use the `nx_docs` tool to get relevant, up-to-date docs. Always use this instead of assuming things about nx configuration
- If the user needs help with an Nx configuration or project graph error, use the `nx_workspace` tool to get any errors

<!-- nx configuration end-->
