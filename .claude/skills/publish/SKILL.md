---
name: publish
description: >-
  Drive the entire document-engine npm release end-to-end so the user never has to remember the steps.
  Use this whenever the user wants to cut, ship, tag, or publish a release of document-engine — including
  phrases like "/publish", "release document-engine", "cut a release", "ship v0.1.0", "bump the version",
  "tag a new version", "publish the packages", "do a prerelease", or "release to npm". Also use it when the
  user asks to preview/dry-run a release, run release pre-flight checks, or roll back / deprecate a bad
  release. Trigger even if they don't say the word "publish" — any intent to move document-engine's
  @phuong-tran-redoc packages to a new version on npm belongs here.
---

# document-engine release manager (`/publish`)

This skill owns the **whole release of the two `@phuong-tran-redoc/document-engine-*` packages** so the user
only has to express intent ("release", "/publish"). It is the single source of truth for the runbook — it does
not depend on any `.context/ops/*` file existing. Everything you need is below.

The user explicitly built this skill because they don't want to memorize the commands. So **drive the process
for them**: run the steps, explain what each one did in one line, and stop at the two human gates. Never make
them look anything up.

> **The standard cut is now automated.** `.github/workflows/release.yml` runs on every push to `main` (PR
> merge): it runs `nx release --skip-publish` and pushes the commit + tag (via the `RELEASE_TOKEN` secret), and
> the tag push triggers `publish.yml`. So for normal work the user merges a PR and the release cuts itself — you
> don't run anything. This skill's **manual** flow below is the **fallback** (no `RELEASE_TOKEN`, CI down, forced
> or first release), plus the always-manual modes: preview/dry-run, pre-flight check, and rollback. When the user
> says "/publish" for a change that's still on a branch, the right answer is usually "open/merge the PR — the
> release auto-cuts," not a local `nx release`.

## The release model (why the commands look the way they do)

- **Tool:** `nx release` (native, fixed/lock-step). No Changesets/semantic-release.
- **Lock-step:** `core` and `angular` always share one version and bump together (`projectsRelationship: fixed`).
- **Version source of truth = the git tag** (`releaseTagPattern: v{version}`). This is **model B**: the source
  `package.json` keeps `version` + `workspace:*` (so local pnpm linking is never disturbed); only the **dist/**
  manifest gets stamped at release time, and `workspace:*` → a real `^x.y.z` range there
  (`preserveLocalDependencyProtocols: false`). CI rebuilds and re-stamps the tagged version before publishing.
- **Version bump = Conventional Commits** (`feat`→minor, `fix`→patch, `feat!`/`BREAKING CHANGE`→major).
- **Trigger:** *automated* — PR merge to `main` → `release.yml` cuts + pushes the tag → tag push fires the
  **gated** CI publish (`security-gate` must pass, then the `npm-publish` environment approval). Manual fallback:
  bump + tag locally → `git push --follow-tags`. There is **no** auto-publish-on-push; the publish still waits
  for a reviewer.

### 0.x semver policy (we are pre-1.0)
- `0.MINOR` = breaking changes **and** notable features (minor is the de-facto "major" before 1.0).
- `0.x.PATCH` = bug fixes / internal only.
- First intentional release: **`0.0.41 → 0.1.0`** (needs `--first-release`, see below).
- Go `1.0.0` only when both packages' public API is stable.

### dist-tags
- Stable cuts → `latest`. Pre-releases → `next` (consumers opt in via `npm i <pkg>@next`).

## Modes

Pick the mode from how the user phrased it; default to **standard** when unsure.

| Invocation | Mode | What it does |
|---|---|---|
| `/publish` | **standard** | infer bump from conventional commits → dry-run → gate → `nx release --skip-publish` → push |
| `/publish first` | **first release** | the one-time `0.1.0 --first-release` (use only while zero git tags exist) |
| `/publish next` / `/publish prerelease` | **prerelease** | `nx release prerelease --preid=next` → publishes to the `next` dist-tag |
| `/publish dry-run` / `/publish preview` | **preview** | dry-run only — show planned version + changelog, write nothing, stop |
| `/publish check` | **pre-flight only** | run the pre-flight checklist, report, do nothing else |
| `/publish rollback` | **incident** | a release went bad — jump to [references/rollback.md](references/rollback.md) |

Run everything from the document-engine repo root. If the user is in a different repo (e.g. portfolio), tell
them the release runs in `document-engine` and `cd` there for the commands.

## Pre-flight (always run first, fail fast)

Do these read-only checks and report a short pass/fail list before touching anything. They exist because each
one maps to a way a release silently breaks.

1. **On `main`, working tree clean** — `git status --short` + `git rev-parse --abbrev-ref HEAD`. Releasing
   off a feature branch or with dirty files tags the wrong tree. (Warn, let the user override.)
2. **`node_modules` present / deps installed** — `nx release` runs a build via `preVersionCommand`; a missing
   install fails mid-flight. If absent, run `pnpm install`.
3. **Conventional commits since the last tag** — `git tag --list 'v*'` then `git log <lastTag>..HEAD --oneline`.
   No conventional commits → nothing to bump (standard mode). On the very first release there is no tag → that
   is exactly when **first-release** mode is required.
4. **Remind about the two CI-side gates** (these block the *publish* in CI, not the local steps — surface them
   now so there are no surprises after the push):
   - npm account reachable + **2FA** state sane.
   - **Trusted Publisher configured per-package** on npmjs.com (Settings → "Trusted Publisher") for *both*
     packages — CI publishes token-lessly via OIDC. Distinct from the "Built and signed on GitHub Actions"
     provenance badge; provenance ≠ trusted publisher.

## The flow (standard / first / prerelease)

Two human gates. Stop and wait at each — this matches the user's confirm-first working style.

### Step 1 — Dry-run (preview, no writes)
```bash
# standard
pnpm nx release --dry-run
# first release (one-time, no prior tag to diff against)
pnpm nx release 0.1.0 --first-release --dry-run
# prerelease
pnpm nx release prerelease --preid=next --dry-run
```
Show the user: the **resolved version** for both packages, and the **changelog** that will be written.
→ **GATE 1: ask the user to confirm the version + changelog before proceeding.**

### Step 2 — Execute (build → version dist → changelog → commit → tag)
Same command, drop `--dry-run`, add `--skip-publish` (publishing happens in CI, never locally):
```bash
pnpm nx release --skip-publish                       # standard
pnpm nx release 0.1.0 --first-release --skip-publish # first
pnpm nx release prerelease --preid=next --skip-publish # prerelease
```
This builds the libs (via `preVersionCommand`), stamps the version into `dist/` only, rewrites `workspace:*`
→ a real range in the dist angular manifest, writes `CHANGELOG.md`, commits, and creates the `v<version>` tag.

### Step 3 — Trim the changelog
The **first** release dumps the entire git history into `CHANGELOG.md`; later releases are clean but
breaking-change / migration prose is still hand-written. Open `CHANGELOG.md`, propose a trimmed entry
(Keep-a-Changelog shape: Added/Changed/Deprecated/Removed/Fixed/Security; add a `### Migration` block for any
breaking change), amend the release commit if you edit it.
→ **GATE 2: ask the user to approve the final changelog.**

### Step 4 — Push (fires gated CI publish)
```bash
git push --follow-tags
```
The `v*` tag push triggers `publish.yml` → `security-gate` job → publish. CI re-stamps the tagged version into a
clean `dist/` build via `nx release version` (the model-B re-stamp path), then publishes each package with
`npm publish ./dist/libs/<pkg> --provenance --access public` (NOT `nx release publish` — see Gotchas), in
lock-step with provenance, on `latest` (standard/first) or `next` (prerelease).

### Step 5 — Post-publish
Tell the user to watch the Actions run (security-gate → publish). `npm audit signatures` runs post-publish as
an advisory check. If the **`security-gate` job goes red**, the packages were **not** published — read
**[references/gate.md](references/gate.md)** for what each check means and how to fix the specific failure,
then re-tag and push again.

## Gotchas this skill has already hit (don't rediscover them)

- **`ERR_PNPM_IGNORED_BUILDS` during install/build** — this repo is **pnpm 11**, which default-denies
  dependency build scripts via the **`allowBuilds`** map in `pnpm-workspace.yaml` (NOT the older
  `onlyBuiltDependencies` list). The 7 build-tool deps (`@parcel/watcher`, `@swc/core`, `esbuild`, `lmdb`,
  `msgpackr-extract`, `nx`, `unrs-resolver`) are already allowlisted. If a *new* build-tool dep is blocked,
  add it to `allowBuilds` only after confirming it legitimately needs a postinstall build.
- **"No remote repo data could be resolved" at "Creating GitHub Release"** — the git `origin` uses an SSH host
  alias (`git@github-work:…`) that nx's GitHub-API resolver can't parse. That's why `nx.json` sets
  `changelog.workspaceChangelog.createRelease: false`. The git tag + `CHANGELOG.md` are the record; a GitHub
  Release page (if wanted) is created from CI, not local `nx release`. **Do not** flip `createRelease` back to
  `"github"` locally — it will fail the release again.
- **Empty `pnpm publish error:` in the publish job (OIDC)** — `nx release publish` shells out to **`pnpm publish`**,
  and pnpm does **not** perform npm OIDC Trusted Publishing — it expects a token, finds none (token-less OIDC),
  and fails with an *empty* error nx swallows. **`publish.yml` publishes with `npm publish ./dist/libs/<pkg>
  --provenance --access public` per package (npm ≥ 11.5.1, which does OIDC natively), core before angular.**
  `nx release version <v>` is still used, but only to stamp the dist manifests. Do **not** revert to
  `nx release publish`.
- **`ERR_UNKNOWN_BUILTIN_MODULE: node:sqlite` at `pnpm install` in CI** — pnpm 11.x needs **Node ≥ 22.13**
  (`node:sqlite`). The publish job pins `node-version: '22'` and `pnpm/action-setup` `version: 11.4.0` (matching
  the repo's local pnpm). If you bump pnpm in a workflow, bump its Node floor too. (ci.yml/security-gate.yml run
  non-publish tasks on pnpm 9 + Node 20 and pass — only the publish job needs the pnpm-11/Node-22 pair.)
- **`npm audit signatures` (advisory) fails with `ETARGET … @rspack-canary/core@…`** — it resolves the *whole*
  dep tree and chokes on a phantom transitive canary version; it is `continue-on-error: true`, **not** a
  provenance problem with our packages. Ignore, or pin/clean the offending transitive dep later.

## Rollback / incident

A published version is **immutable** — you never take it back, you supersede it (dist-tag → deprecate →
forward-fix patch; `npm unpublish` is almost always wrong). For the full decision tree, coupled-package
handling, and the secret-leak emergency, read **[references/rollback.md](references/rollback.md)**.

## package.json memory-aids

These npm scripts exist so the commands work even without this skill (mirror the modes above):
`release:preview` · `release` · `release:first` · `release:next` · `release:push`. Prefer driving the full
flow through this skill (it includes the gates and pre-flight); the scripts are the bare commands.
