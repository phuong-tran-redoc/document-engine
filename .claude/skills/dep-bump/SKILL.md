---
name: dep-bump
description: >-
  Drive a dependency bump for document-engine safely through its full blast radius, so a version change is
  never "just a number" that silently breaks output, types, the demo app, docs, or downstream consumers. Use
  this whenever the user wants to upgrade, bump, update, or pin a dependency — including phrases like
  "/dep-bump", "bump tiptap", "upgrade @tiptap", "update the deps", "bump prosemirror", "pin happy-dom",
  "review this Dependabot PR", "merge the dependabot bump", "raise the peer range", or "why is there a peer
  warning". Trigger for shipped/runtime deps especially (anything in a published lib's dependencies or
  peerDependencies). Also use it to diagnose dual-version / unmet-peer / "Property X does not exist on
  ChainedCommands" / happy-dom-in-browser-bundle errors, which are almost always a half-done bump.
---

# document-engine dependency-bump runbook (`/dep-bump`)

A dependency bump in this monorepo is **not** a one-line edit. The libs are **published contracts**, they
share a cohort of `@tiptap/*` / ProseMirror packages that must move in lock-step, and the wrong move
silently degrades **HTML output**, breaks **types**, splits the dependency tree into **two copies**, or fails
only at **demo-app build** time. This skill is the checklist that makes every one of those visible.

This skill is the **manual tier** of the planned safe-Dependabot-auto-merge policy: Dependabot/CI auto-merges
*tooling/dev* deps; any *shipped/runtime* dep (a published lib's `dependencies` or `peerDependencies`) lands
here and gets the full process below. It feeds the `security-gate` that [`/publish`](../publish/SKILL.md) runs
before release.

## Step 0 — Classify the dep (decides how much process)

| Class | Examples | Process |
|---|---|---|
| **Tooling / dev** | nx, eslint, jest, prettier, playwright, types-only | Light: install → lint + affected test + build affected. Auto-merge candidate. |
| **Shipped / runtime** | `@tiptap/*`, `@tiptap/pm`, `prosemirror-*`, `happy-dom`, `@floating-ui/dom`, `lodash-es`, `rxjs`, `@angular/*` peers | **Full process (Steps 1–8).** Touches the published contract — never auto-merge blind. |

If unsure, treat as shipped/runtime.

## Step 1 — Move the whole cohort, lock-step (NOT one package)

Related packages must share one version or the tree splits. The big cohorts:
- **`@tiptap/*` + `@tiptap/pm`** — all ~27 entries move together to the same version. Bumping one (e.g. just
  `@tiptap/html`) pins a newer minor whose peer demands a matching `@tiptap/core`, creating skew.
- **`prosemirror-*`** — pulled transitively by `@tiptap/pm`; a split here makes `ResolvedPos`/`Selection`
  types from two copies incompatible.

```bash
pnpm up -r "@tiptap/*@<version>"     # recursive across all workspace projects
```

## Step 2 — peerDependencies too (pnpm up SKIPS them)

**This is the trap that cost the most time.** `pnpm up` only touches `dependencies`/`devDependencies`. The
**angular lib declares all `@tiptap/*` as `peerDependencies`**, so `pnpm up` leaves them at the old range →
pnpm resolves a *second* copy to satisfy the stale peer → dual-version hell.

Bump the version in **all three manifests** (grep first, edit by hand where `pnpm up` didn't):
- `libs/document-engine-core/package.json` → `dependencies`
- `libs/document-engine-angular/package.json` → **`peerDependencies`** ← the one that gets forgotten
- `package.json` (root) → `devDependencies` (repo convention: every `@tiptap/*` lives here too)

```bash
grep -rn '<old-version>' package.json libs/*/package.json   # find every stale spec, incl. peerDeps
pnpm install
```

## Step 3 — Assert a SINGLE resolved version (no dual copies)

The #1 symptom of a half-done bump. Two copies of `@tiptap/core` → the `declare module '@tiptap/core'`
command augmentations attach to one copy while the editor is typed from the other →
**`Property 'setCellBorder'/'insertDynamicField'/… does not exist on type 'ChainedCommands'`**, plus
cross-copy `Editor`/`ResolvedPos`/`CellSelection` mismatches.

```bash
# Expect ONE version line each. Two = stop and fix the manifest you missed (usually a peerDep).
grep -E "@tiptap/(core|pm)@|prosemirror-model@" pnpm-lock.yaml | grep -v peer | sort -u
```

## Step 4 — Typecheck + BUILD every project (not just unit tests)

Unit tests pass against a jsdom/CJS runtime and miss two whole failure classes: **type tightening** (a new
minor can make a builder's config types stricter — e.g. `Node.create`'s `renderHTML`/`addNodeView`/`addOptions`
return types) and **browser-bundling** (a Node-only transitive like happy-dom getting pulled into a client
bundle).

```bash
pnpm nx run-many -t build --projects @phuong-tran-redoc/document-engine-core,@phuong-tran-redoc/document-engine-angular
pnpm nx build document-engine        # the DEMO APP — only here does a browser-bundle break surface
```
- Build errors in `table-style.extension.ts` are the usual tiptap-type-tightening site. Fix at the type level
  (correct PM-vs-core `Node`, narrow with the real ProseMirror types, cast to `RawCommands`/`NodeViewRenderer`)
  — do not change runtime behavior to satisfy types.
- `Could not resolve "stream"/"vm"/"util"` from `happy-dom` during the demo-app build = a Node-only module
  leaked into the client bundle (see Gotchas).

## Step 5 — Full unit tests + OUTPUT/serialization check

Some bumps change **rendered output** with no type or test error. The `@tiptap/html` serializer has emitted
stray `xmlns="http://www.w3.org/1999/xhtml"` (and historically empty `style=""`) on blocks across versions.
The `generate-html` specs assert real HTML strings precisely **for this reason** — keep them strict.

```bash
pnpm nx run-many -t test --projects @phuong-tran-redoc/document-engine-core,@phuong-tran-redoc/document-engine-angular
pnpm e2e:ci    # affected/@ci e2e for editor + table behavior on the demo app
```
If output changed, decide deliberately: is the new output acceptable, or does the helper need to normalize it?
Don't loosen a test just to make a dirty diff pass.

## Step 6 — Docs & version strings

A bump that leaves docs lying is a half-bump:
- `CLAUDE.md` → tech-stack line (`Tiptap x.y.z`).
- Lib `README.md` peer-dependency examples / install snippets.
- Any version pinned in prose.

## Step 7 — Published contract (peer ranges) + Angular-floor guard

The libs are consumed externally. When a shipped dep's major/minor moves, the **published `peerDependencies`
range** must move too (e.g. the angular lib's `@angular/*` range, or a `@tiptap/*` floor). Widen additively;
a narrowing/raising floor is a **breaking change → minor bump pre-1.0** and needs a changelog `### Migration`
note. Cross-check with [`/publish`](../publish/SKILL.md)'s 0.x semver policy.

**Angular peer floor is enforced — don't let it drift (ADR-006 / DE-013).** The angular lib declares
`@angular/* >=16.0.0` (raised from 14 — ng-packagr@20 emits `.d.ts` with the Angular-16+ input-declaration
format, so 14/15 consumers `NG8002` on every input binding regardless of source). The workspace builds on
Angular 20, so it is easy to slip in syntax newer than the floor. Two blocking guards run in `security-gate`
(and locally):
- `pnpm guard:ng-floor` — static denylist (`tools/check-angular-floor.mjs`): no signal inputs/queries
  (`input()/output()/model()/viewChild()`) and no built-in control flow (`@if/@for/@switch`) in the published
  lib source (these are 17+; Angular-16 APIs like signals / `@Input({…})` are fine).
- `bash tools/ng-floor-compat/run.sh` — packs the libs + AOT-builds an isolated **Angular-16** consumer
  (catches the `.d.ts` ɵɵComponentDeclaration input format + the partial-ivy linker — what static scan can't).

When you **bump `@angular/*`**: if you change the floor, update the peer range, the denylist calibration, **and**
the `tools/ng-floor-compat` pinned Angular version in lock-step, and supersede ADR-006. Otherwise run both
guards before committing — a new Angular API above the floor in the lib must be rewritten down to the floor.

## Step 8 — Consumer impact + commit

- **Portfolio** (`redoc-rte` `RichTextService`) consumes core: it `await`s `generateHTML` and pins a tiptap
  range. Note any signature/behavior/version-floor change it must follow.
- Commit as **`build(deps): …`** (conventional → patch, or document a breaking type change explicitly).
  Couple the required code fixes (e.g. type adaptations) into the same commit so no intermediate commit is
  red.

## Gotchas this skill has already hit (don't rediscover them)

- **`@tiptap/html` added alone → skew.** Adding one `@tiptap/*` at `^3.10.5` resolved it to a newer minor
  (3.26.0) whose peer wanted `@tiptap/core@3.26.0` exactly, while the suite sat at 3.10.5. Fix = move the
  **whole** suite lock-step (Step 1), not pin one package down/up in isolation.
- **`pnpm up` skipped the angular lib's peerDependencies** → a second `@tiptap/core`/`prosemirror-model` copy
  → `Property … does not exist on ChainedCommands` across the angular views. Step 2 + Step 3 catch this.
- **happy-dom leaked into the browser bundle.** `generateHTML` lazy-`import()`s `@tiptap/html/server`
  (happy-dom, Node-only). esbuild/webpack/vite still statically resolve a **string-literal** dynamic import and
  try to bundle it → demo-app build fails on Node built-ins (`stream`, `vm`, `util`). Fix already in
  `kit/generate-html.ts`: the `/server` specifier is built at runtime (`['@tiptap','html','server'].join('/')`)
  with `/* webpackIgnore: true */ /* @vite-ignore */`, guarded by `typeof document`. If you ever revert that to
  a literal, the demo app (and every consumer's browser build) breaks again. Surfaced **only** at demo-app
  build — which is exactly why Step 4 builds every project.
- **tiptap 3.26 tightened `Node.create` types.** `renderHTML` needs the ProseMirror `Node` (`@tiptap/pm/model`),
  not `@tiptap/core`'s extension `Node`; `addNodeView` must return `null` (not `undefined`); `addCommands` /
  the nodeView renderer may need a `RawCommands` / `NodeViewRenderer` cast. All type-level — runtime unchanged.

## Quick reference

```bash
# 1 cohort lock-step          pnpm up -r "@tiptap/*@<v>"
# 2 peerDeps by hand          edit libs/document-engine-angular/package.json peerDependencies → pnpm install
# 3 assert single version     grep -E "@tiptap/(core|pm)@|prosemirror-model@" pnpm-lock.yaml | grep -v peer | sort -u
# 4 build ALL                 nx run-many -t build -p core,angular  &&  nx build document-engine
# 5 test + output + e2e       nx run-many -t test -p core,angular  &&  pnpm e2e:ci
# 6 docs                      CLAUDE.md tech-stack + lib READMEs
# 7 contract                  published peerDependencies ranges
# 8 commit                    build(deps): …  (couple required code fixes in)
```
