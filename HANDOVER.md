# Handover

Everything a new maintainer needs to own this repo. Read this first, then `README.md` and `RELEASING.md`.

## 1. What this is

Two **published npm packages** plus an Angular **demo app** that showcases them:

| Package | Path | Role |
| --- | --- | --- |
| `@phuong-tran-redoc/document-engine-core` | `libs/document-engine-core` | Framework-agnostic editor core on Tiptap/ProseMirror: extensions, custom nodes (`DynamicField`, `PageBreak`, image-ref…), models, utils, headless `generateHTML` |
| `@phuong-tran-redoc/document-engine-angular` | `libs/document-engine-angular` | Angular components/directives/ControlValueAccessor over core |

- Both are MIT, public, at **`0.1.6`** (Oct 2026). They always release together at the same version.
- Supported Angular range is the peer range **`>=16 <22`**. Angular 16 is a hard floor, enforced in CI
  (see ADR-006 in `docs/decisions.md`).
- Everything else (`apps/document-engine`, `libs/document-engine/*`, `libs/shared/*`) is the demo app — it is
  not published, and it is deployed as a preview site via Cloudflare Pages.

**The public API is a contract.** Whatever a lib's `src/index.ts` exports is consumed by external apps.
Changes there are additive only, unless you deliberately cut a breaking release. CI enforces this with an
api-extractor drift check (`pnpm api:check`; regenerate with `pnpm api:update` when the change is intended).

## 2. Day-to-day

Requirements: **Node 22+**, **pnpm 11.4.0** (pinned via `packageManager`; use `corepack enable`).

```bash
pnpm install
pnpm start              # demo app on http://localhost:4200
pnpm build:libs         # build both published libs
pnpm test:core          # unit tests (Jest)
pnpm test:angular
pnpm e2e                # Playwright, full local suite
pnpm e2e:ci             # only the @ci-tagged subset — this is what CI runs
pnpm api:check          # public-API drift check
pnpm gate:css           # CSS portability gate (theming contract)
pnpm guard:ng-floor     # Angular-16 floor static check
```

Run tasks through `nx` (`nx run`, `nx affected`), not the underlying tools. Project names use the scoped form,
e.g. `nx test @phuong-tran-redoc/document-engine-core`; list them with `pnpm nx show projects`.

## 3. Where the knowledge lives

| Need | Read |
| --- | --- |
| How to cut / verify / roll back a release | `RELEASING.md` (short) → `docs/ops/release-versioning.md`, `docs/ops/incident-rollback.md` |
| What the pre-publish security & legal gate checks | `docs/ops/security-legal-gate.md`, `.github/workflows/security-gate.yml` |
| Which Dependabot PRs auto-merge and how to review the rest | `docs/ops/dependabot-auto-merge.md` |
| Keeping docs + API report in sync | `docs/ops/docs-api-sync.md` |
| Why things are the way they are (ADR-001 … ADR-009) | `docs/decisions.md` |
| Business rules the editor encodes | `docs/domain.md` |
| Theming contract for consumers (CSS tokens) | `docs/THEMING.md` |
| Tagging e2e tests for CI | `docs/E2E_TAGGING_GUIDE.md` |
| Reporting a vulnerability | `SECURITY.md` |
| Who built / maintains it | `AUTHORS.md` |
| Conventions for AI assistants | `CLAUDE.md`; project skills in `.claude/skills/` (`publish`, `dep-bump`) |

## 4. How a release works (summary)

```
PR → CI (ci.yml + security-gate.yml) → merge to main
  → release.yml: infer bump from Conventional Commits → CHANGELOG → commit + tag v<x.y.z>
  → tag push → publish.yml: security-gate → wait for `npm-publish` environment approval → npm publish --provenance
```

- **Commit messages are the changelog.** Use Conventional Commits; nx generates `CHANGELOG.md` from them.
  Do not hand-edit an "Unreleased" block — nx will prepend its own and you get duplicate headings.
- **Pre-1.0 bump rule:** nx downgrades one level — `feat` and `fix` both produce a **patch**, and only a breaking
  change produces a minor. Force a minor with a manual `pnpm nx release minor --skip-publish`.
- Merges that only contain `build`/`chore`/`docs`/`ci` commits do **not** release (release.yml no-ops).
- **Publishing is CI-only**, via npm **Trusted Publishing (OIDC)** — there is no npm token anywhere. CI uses
  `npm publish --provenance` on purpose: `pnpm publish` / `nx release publish` cannot do the OIDC exchange.
  Never publish from a laptop.
- Bad release? Never `npm unpublish`. Re-point `latest`, `npm deprecate` the bad version, ship a patch.
  Commands are in `RELEASING.md` § Rollback.

## 5. Accounts and access to transfer

None of this is visible in the code. Go through it with the outgoing maintainer.

| Item | Where | What to do |
| --- | --- | --- |
| GitHub repo admin | `phuong-tran-redoc/document-engine` → Settings → Collaborators | Grant admin to the new owner (required to approve publishes and bypass the tag ruleset) |
| `npm-publish` environment reviewer | Settings → Environments → `npm-publish` | Add the new owner as a required reviewer; every publish waits for this approval |
| `RELEASE_TOKEN` secret | Settings → Secrets → Actions | A fine-grained PAT used by `release.yml` to push the release commit + tag past branch protection. It belongs to the outgoing maintainer's account — **replace it** with one owned by the new owner (or a GitHub App), and update the ruleset bypass lists accordingly. When it expires, releases silently stop |
| Rulesets | Settings → Rules: "Prevent Main Branch" (PR + `validate`/`e2e` required), "Protect Release Tags" (`v*`, bypass = repo admin) | Confirm the new owner / token identity is in the bypass lists |
| npm scope `@phuong-tran-redoc` | npmjs.com → package settings → Trusted Publisher | Add the new owner as a maintainer of both packages; Trusted Publishing is bound to this repo + `publish.yml`, so renaming/moving the repo or workflow breaks publishing until it is updated on npm |
| Cloudflare Pages | project `document-engine` | Transfer or re-create the demo-site deployment |
| Codecov | coverage upload in `ci.yml` | Re-link the repo under the new owner's account |
| Personal details | `AUTHORS.md` (single source; also the security contact) + `contributors` in both lib `package.json`s | Fill in the current maintainer; edit or delete the original author's details as you see fit |

## 6. State at handover

- `main` is green and in sync with npm (`0.1.6`). No open issues.
- **Open Dependabot PRs:**
  - `#49` (angular-eslint, dev-only) — green, safe to merge.
  - `#52` (38 production deps incl. `@tiptap/*`, Angular) and `#56` (32 dev deps incl. nx, TypeScript) — **CI is
    red**. Production deps ship to consumers, so these are never auto-merged. Split them up or bump the
    pieces deliberately, following `docs/ops/dependabot-auto-merge.md` § Manual-review checklist (or the
    `dep-bump` skill if you use Claude Code). `@tiptap/*` packages must always move in lock-step.

### Known gaps worth knowing about

- **The e2e suite is only partly trustworthy.** CI runs just the `@ci`-tagged specs (a small, reliable
  set). Many other local specs are stubs pointing at routes that do not exist, or fail for test-logic
  reasons. Treat `pnpm e2e:ci` as the gate and the full `pnpm e2e` run as noisy until it is cleaned up.
  Do not "fix" a stub by pointing it at an existing route — it will turn green while asserting nothing.
- **The Angular-16 floor check is compile-only and narrow.** `tools/ng-floor-compat` does a real AOT build
  of the packed tarballs against Angular 16 + TS 5.0, but its template only renders
  `<document-engine-editor [config]>`. The main integration API (`<tiptap-editor>` with `[(ngModel)]`) is
  not type-checked or run at Angular 16. If you have a consumer on Angular 16, extend the fixture first.
- The demo app's Tailwind config happens to define every token the library uses, so theming bugs are
  invisible in the demo. Check theming against `/test-bench/bare-consumer` and `docs/THEMING.md`.

## 7. Gotchas

- **Do not dual-install Tiptap.** `core` declares `@tiptap/*` as `dependencies` (ADR-007). A mismatched
  version in a consumer leads to "Property X does not exist on ChainedCommands" type errors or two
  ProseMirror instances at runtime.
- **Core must stay ESM-safe in plain Node.** It is built with `@nx/rollup` into one ESM entry; CI checks
  that it loads in bare Node (`tools/security/verify-esm-load.mjs`). Extensionless directory imports in
  published output caused `ERR_UNSUPPORTED_DIR_IMPORT` once (fixed in 0.1.2).
- **Lib source must compile at Angular 16** — no newer-only APIs (e.g. signal inputs, `@if` control flow)
  inside `libs/document-engine-angular`. The demo app may use them freely.
- **Playwright reuses an existing server on its port.** If another dev server already holds the port, e2e
  silently runs against the wrong app. Serve on a free port and pass `BASE_URL`. Use `--reporter=list`
  for headless runs; the default HTML reporter opens a browser on failure.
- `.context/` is gitignored and local-only; nothing in it is needed.
